---
title: Spark Catalyst 源码解析：Analyzer 与 Optimizer
category: Spark
tags:
  - Spark
  - SparkSQL
date: 2015-08-20
---

在[上一篇文章](/sparksql_catalyst_source_3)中，我们详细了解了 SparkSQL 中特殊的 TreeNode 们以及核心类 LogicalPlan，完整理解了整个执行计划树的组成。


在这篇文章中，我将开始讲解 Unresolved Logical Plan 如何通过 Analyzer 转变为 Analyzed Logical Plan，再通过 Optimizer 转变为 Optimized Logical Plan。

<!-- more -->

![](/img/Spark-Catalyst@9.jpg)

## Analyzer

我们先来看看 `SQLContext` 为我们默认设置的 analyzer 吧：

```scala
@transient
protected[sql] lazy val analyzer: Analyzer =
  new Analyzer(catalog, functionRegistry, conf) {
    override val extendedResolutionRules =
      ExtractPythonUdfs ::
      sources.PreInsertCastAndRename ::
      Nil

    override val extendedCheckRules = Seq(
      sources.PreWriteCheck(catalog)
    )
  }
```

可以看到，`SQLContext` 通过匿名内部类的方式创建了一个 `Analyzer` 的子类实例。那我们就去看看 `Analyzer` 吧：

```scala
/**
 * Provides a logical query plan analyzer, which translates [[UnresolvedAttribute]]s and
 * [[UnresolvedRelation]]s into fully typed objects using information in a schema [[Catalog]] and
 * a [[FunctionRegistry]].
 */
class Analyzer(
    catalog: Catalog,
    registry: FunctionRegistry,
    conf: CatalystConf,
    maxIterations: Int = 100)
  extends RuleExecutor[LogicalPlan] with HiveTypeCoercion with CheckAnalysis {

  // ...

  val fixedPoint = FixedPoint(maxIterations)

  /**
   * Override to provide additional rules for the "Resolution" batch.
   */
  val extendedResolutionRules: Seq[Rule[LogicalPlan]] = Nil

  lazy val batches: Seq[Batch] = Seq(
    Batch("Substitution", fixedPoint,
      CTESubstitution ::
      WindowsSubstitution ::
      Nil : _*),
    Batch("Resolution", fixedPoint,
      ResolveRelations ::
      ResolveReferences ::
      ResolveGroupingAnalytics ::
      ResolveSortReferences ::
      ResolveGenerate ::
      ResolveFunctions ::
      ExtractWindowExpressions ::
      GlobalAggregates ::
      UnresolvedHavingClauseAttributes ::
      TrimGroupingAliases ::
      typeCoercionRules ++
      extendedResolutionRules : _*)
  )

  object CTESubstitution extends Rule[LogicalPlan] {
	// ...
  }

  object WindowsSubstitution extends Rule[LogicalPlan] {
    // ...
  }

  object TrimGroupingAliases extends Rule[LogicalPlan] {
    // ...
  }

  object ResolveGroupingAnalytics extends Rule[LogicalPlan] {
    // ...
  }

  object ResolveRelations extends Rule[LogicalPlan] {
    // ...
  }

  object ResolveReferences extends Rule[LogicalPlan] {
    // ...
  }

  object ResolveSortReferences extends Rule[LogicalPlan] {
    // ...
  }

  object ResolveFunctions extends Rule[LogicalPlan] {
    // ...
  }

  object GlobalAggregates extends Rule[LogicalPlan] {
    // ...
  }

  object UnresolvedHavingClauseAttributes extends Rule[LogicalPlan] {
    // ...
  }

  object ResolveGenerate extends Rule[LogicalPlan] {
	// ...
  }

  object ExtractWindowExpressions extends Rule[LogicalPlan] {
    // ...
  }
}

object EliminateSubQueries extends Rule[LogicalPlan] {
  // ...
}
```

关于上述这个类，我们可以把目光放在如下几个点。首先 `batches` 变量内包含了两个 `Batch` 实例，分别被命名为了 "Substitution" 和 "Resolvation"。创建 `Batch` 实例的时候传入了大量的 `Rule` 子类，而 `Analyzer` 本身继承自 `RuleExecutor`。

## RuleExecutor

那么我们不妨先来看一下 `RuleExecutor`：

```scala
abstract class RuleExecutor[TreeType <: TreeNode[_]] extends Logging {

  // 执行策略，定义了 maxIterations。
  // 我们知道 Optimize 的过程需要不断地重复迭代，Analyze 的过程也一样。
  // 由此可见 Analyze 迭代停止的条件有两个：
  // 1. 达到 Strategy 指定的最大迭代数，或
  // 2. 达到 fixed point（不动点，在数学中即指满足 f(x) = x 的 x）
  abstract class Strategy { def maxIterations: Int }

  case object Once extends Strategy { val maxIterations = 1 }
  
  case class FixedPoint(maxIterations: Int) extends Strategy

  // 之前的 Batch 类出现在了这里
  protected case class Batch(name: String, strategy: Strategy, rules: Rule[TreeType]*)

  // 由子类定义的需要执行的 Rule 们
  protected val batches: Seq[Batch]

  // 在传入的 plan 上迭代地执行由子类定义的 batch
  def execute(plan: TreeType): TreeType = {
    var curPlan = plan

    batches.foreach { batch =>
      val batchStartPlan = curPlan
      var iteration = 1
      var lastPlan = curPlan
      var continue = true

      // Run until fix point (or the max number of iterations as specified in the strategy.
      while (continue) {
	    // 对 curPlan 顺序执行一次当前 batch 的所有 rule
        curPlan = batch.rules.foldLeft(curPlan) {
          case (plan, rule) =>
            val result = rule(plan)
            if (!result.fastEquals(plan)) {
              logTrace(
                s"""
                  |=== Applying Rule ${rule.ruleName} ===
                  |${sideBySide(plan.treeString, result.treeString).mkString("\n")}
                """.stripMargin)
            }

            result
        }
        iteration += 1
		
		// 根据最大迭代数或是否达到不动点来确定是否要继续迭代
        if (iteration > batch.strategy.maxIterations) {
          // Only log if this is a rule that is supposed to run more than once.
          if (iteration != 2) {
            logInfo(s"Max iterations (${iteration - 1}) reached for batch ${batch.name}")
          }
          continue = false
        }
        if (curPlan.fastEquals(lastPlan)) {
          logTrace(
            s"Fixed point reached for batch ${batch.name} after ${iteration - 1} iterations.")
          continue = false
        }
        lastPlan = curPlan
		
		// 进入下一轮迭代
      }

      if (!batchStartPlan.fastEquals(curPlan)) {
        logDebug(
          s"""
          |=== Result of Batch ${batch.name} ===
          |${sideBySide(plan.treeString, curPlan.treeString).mkString("\n")}
        """.stripMargin)
      } else {
        logTrace(s"Batch ${batch.name} has no effect.")
      }
	  
	  // 进入下一个 batch
    }

    curPlan
  }
}
```

所以，`RuleExecutor` 这个类的主要功能，在于 `execute` 函数可对传入的 plan 迭代地执行子类指定的 rule，不同组的 rule 通过分配在不同的 batch 中以及放置的位置来区分执行的先后次序。

我们再看回 `Analyzer`：

```scala
// SQLContext.scala
protected[sql] lazy val analyzer: Analyzer =
  new Analyzer(catalog, functionRegistry, conf) {
    override val extendedResolutionRules =
      ExtractPythonUdfs ::
      sources.PreInsertCastAndRename ::
      Nil

    override val extendedCheckRules = Seq(
      sources.PreWriteCheck(catalog)
    )
  }

// Analyzer.scala
  
// SQLContext 在创建时放入了 Analysis 过程需要的 Catalog 和 FunctionRegistry
class Analyzer(
    catalog: Catalog,
    registry: FunctionRegistry,
    conf: CatalystConf,
    maxIterations: Int = 100)  // 最大迭代数取默认值 100
  extends RuleExecutor[LogicalPlan] with HiveTypeCoercion with CheckAnalysis {

  def resolver: Resolver = {
    if (conf.caseSensitiveAnalysis) {
      caseSensitiveResolution
    } else {
      caseInsensitiveResolution
    }
  }

  // 生成 strategy
  val fixedPoint = FixedPoint(maxIterations)

  // 在 SQLContext 的匿名内部类中被重载，额外放入了两个 rule
  val extendedResolutionRules: Seq[Rule[LogicalPlan]] = Nil

  // 需要执行的 rule 们，同时在第二个 batch 中放入了在 SQLContext 的匿名内部类中指定的两个 rule
  lazy val batches: Seq[Batch] = Seq(
    Batch("Substitution", fixedPoint,
      CTESubstitution ::
      WindowsSubstitution ::
      Nil : _*),
    Batch("Resolution", fixedPoint,
      ResolveRelations ::
      ResolveReferences ::
      ResolveGroupingAnalytics ::
      ResolveSortReferences ::
      ResolveGenerate ::
      ResolveFunctions ::
      ExtractWindowExpressions ::
      GlobalAggregates ::
      UnresolvedHavingClauseAttributes ::
      TrimGroupingAliases ::
      typeCoercionRules ++
      extendedResolutionRules : _*)
  )
  
  // ...
}
```

接下来，我们继续往下挖掘，看一下 `Rule` 类：

```scala
abstract class Rule[TreeType <: TreeNode[_]] extends Logging {

  // Rule 的名字。默认为类的类名
  val ruleName: String = {
    val className = getClass.getName
    if (className endsWith "$") className.dropRight(1) else className
  }

  // 子类通过重载 Rule 的 apply 函数来实现其逻辑
  def apply(plan: TreeType): TreeType
}
```

本文就不对每个 `Rule` 子类都进行讲解了，各位可以自行观看。你们只要知道真正起作用的是它的 `apply` 函数，我想看起来应该也是很轻松的事。

## Optimizer

![](/img/Spark-Catalyst@10.jpg)

实际上，在学习过 `Analyzer` 的执行机制以后，`Optimizer` 就是水到渠成了。因为 `Optimizer` 同样继承了 `RuleExecutor`：

```scala
// SQLContext.scala
protected[sql] lazy val optimizer: Optimizer = DefaultOptimizer

// Optimizer.scala
abstract class Optimizer extends RuleExecutor[LogicalPlan]

object DefaultOptimizer extends Optimizer {
  val batches =
    // SubQueries are only needed for analysis and can be removed before execution.
    Batch("Remove SubQueries", FixedPoint(100),
      EliminateSubQueries) ::
    Batch("Operator Reordering", FixedPoint(100),
      UnionPushdown,
      CombineFilters,
      PushPredicateThroughProject,
      PushPredicateThroughJoin,
      PushPredicateThroughGenerate,
      ColumnPruning,
      ProjectCollapsing,
      CombineLimits) ::
    Batch("ConstantFolding", FixedPoint(100),
      NullPropagation,
      OptimizeIn,
      ConstantFolding,
      LikeSimplification,
      BooleanSimplification,
      SimplifyFilters,
      SimplifyCasts,
      SimplifyCaseConversionExpressions) ::
    Batch("Decimal Optimizations", FixedPoint(100),
      DecimalAggregates) ::
    Batch("LocalRelation", FixedPoint(100),
      ConvertToLocalRelation) :: Nil
}
```

完全同理，相比之下 `Optimizor` 执行器更加简单。

## 总结

在本文中，我们学习了 `Analyzer` 和 `Optimizer` 的执行方式，了解到它们都利用了 `RuleExecutor`，区别仅在于在重载的过程中设定了不同的 `Rule`。可以说是用同样的逻辑完成了两件事。


在本文中我并未详细介绍 `Rule` 实现类，并不是因为它们不重要。实际上它们才是 Analysis 和 Optimization 过程的主角。在了解到 `Rule` 子类的执行入口是 `apply` 函数后，相信各位在阅读 `Rule` 实现类的过程中应该不会遇到太大的问题。

下一次，我们将继续大步向前，开始探究 SparkSQL 如何根据 Optimized Logical Plan 生成 Physical Plan。敬请期待。
