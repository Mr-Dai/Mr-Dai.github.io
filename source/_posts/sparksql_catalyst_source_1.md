---
title: Spark Catalyst 源码解析：Intro
author: Robert Peng
category: Spark
tags:
  - Spark
  - SparkSQL
date: 2015-08-17
toc: true
---

我的[上一个系列](/sparksql_hive_thriftserver_source_1)的 SparkSQL 源码解析已经完结了一段时间了。当时我出于实习工作的需要阅读了 SparkSQL HiveThriftServer 以及 Spark Scala Interpreter 的源代码，并顺势写下了那个系列的源码解析文章。但读 SparkSQL 源代码怎么能只读那些外围插件的源代码呢？于是我又开一个新坑了。

<!-- more -->

在上一个系列中也提到过，SparkSQL 实际上由 4 个项目组成，分别为 Spark Core、Spark Catalyst、Spark Hive 和 Spark Hive ThriftServer。这个系列的文章所要介绍的是 Spark Catalyst 项目。它在 SparkSQL 中担任的角色是优化器。这个系列的文章我将会按照标准的 SparkSQL 执行流程来解析源代码，因此文章中将不可避免地出现 Spark Core 的部分代码。

正如我所讲，本系列文章将按照 SparkSQL 的执行顺序来讲解代码，但很多人可能并不了解自己在调用了 `SQLContext#sql` 以后到底会发生什么。因此在阅读本文之前，我强烈建议各位先看一下[这篇](/file/SparkSQL.pdf)论文。这篇论文是 SparkSQL 的官方论文，其中提到了 SparkSQL Catalyst 的执行流程。通过完整阅读这篇论文并掌握其中出现的一些专属名词，将对你接下来的代码阅读工作大有裨益。

本文使用的是当下最新的 `1.4.1` 版本的 Spark。在该版本中，SparkSQL 的版本号为 `2.10`。

## SQLContext

毋庸置疑，一切的一切都从 `SQLContext#sql` 开始。不过，我们先来看看 `SQLContext` 这个类都包含了些什么变量。

```scala
class SQLContext(@transient val sparkContext: SparkContext)
  extends org.apache.spark.Logging with Serializable {
self =>

  // ...

  @transient
  protected[sql] lazy val catalog: Catalog = new SimpleCatalog(conf)

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
	
  @transient
  protected[sql] lazy val optimizer: Optimizer = DefaultOptimizer

  @transient
  protected[sql] val ddlParser = new DDLParser(sqlParser.parse(_))

  @transient
  protected[sql] val sqlParser = new SparkSQLParser(getSQLDialect().parse(_))
  
  @transient
  protected[sql] val planner = new SparkPlanner

  // ...
}
```

上述代码当然不是 `SQLContext` 的全部变量，但我们暂时只需要看到这些。首先 `catalog` 变量只要是看过论文的读者自然是不会陌生了，它用来存放所有 `SQLContext` 已经知晓的表，在对 Attribute、Relation 等进行 resolve 的时候就需要利用 Catalog 提供的信息。剩余的五个变量中我们看到了 4 个角色，分别为 Parser、Analyzer、Optimizer、Planner。同样，在论文中已经提及到了这些角色的作用，其中 parser 负责把用户输入的 SQL 语句进行解释，转变为 Unresolved Logical Plan。Unresolved Logical Plan 中会包含 SQL 语句中出现的变量名和表名，这些词素暂时来讲都会被标记为 unresolved，即“不知道是否存在这个表”或“不知道表中是否有这个字段”。这个时候轮到 Analyzer 登场，它利用 Catalog 提供的信息，对所有这些 unresolved 的词素进行 resolve，并在 resolve 失败时抛出错误。结束后便得到了 Analyzed Logical Plan。接下来轮到 Optimizer，它使用 rule-based 的优化规则对传入的 Analyzed Logical Plan 进行优化，得到一个 Optimized Logical Plan。最终 Optimized Logical Plan 传入到 Planner，生成物理执行计划，得到 Physical Plan。

这么多的废话，其实就变成这样一张图：

![](/img/Spark-Catalyst@1.png)

这就是 SparkSQL 的基本执行流程，一切由 `SQLContext#sql` 开始。那我们就先来看看起点吧：

```scala
def sql(sqlText: String): DataFrame = {
  DataFrame(this, parseSql(sqlText))
}	// 调用 parseSql 方法将传入的 sql 语句转变为了 unresolved logical plan，并用来实例化了一个 DataFrame

// 调用了 ddlParser 的 parse 函数来解析传入的 sql 语句
protected[sql] def parseSql(sql: String): LogicalPlan = ddlParser.parse(sql, false)
```

好，到此为止，Parser 的代码我们留到下次。我们先去看看 `DataFrame` 的那个构造函数都做了什么：

```scala
class DataFrame private[sql](
    @transient val sqlContext: SQLContext,
    @DeveloperApi @transient val queryExecution: SQLContext#QueryExecution)
  extends RDDApi[Row] with Serializable {

  /**
   * A constructor that automatically analyzes the logical plan.
   *
   * This reports error eagerly as the [[DataFrame]] is constructed, unless
   * [[SQLConf.dataFrameEagerAnalysis]] is turned off.
   */
  def this(sqlContext: SQLContext, logicalPlan: LogicalPlan) = {
    this(sqlContext, {
      val qe = sqlContext.executePlan(logicalPlan)
      if (sqlContext.conf.dataFrameEagerAnalysis) {
        qe.assertAnalyzed()  // This should force analysis and throw errors if there are any
      }
      qe
    })
  }
  
  // ...
  
}
```

如此看来，尽管传入的 LogicalPlan 仍然是个 unresolved logical plan，但 `DataFrame` 的这个构造函数立马就触发了 analyze 操作，并返回了一个 `SQLContext#QueryExecution` 类。我们就来看看 `SQLContext` 的这个内部类吧：

```scala
/**
 * :: DeveloperApi ::
 * The primary workflow for executing relational queries using Spark.  Designed to allow easy
 * access to the intermediate phases of query execution for developers.
 */
 @DeveloperApi
 protected[sql] class QueryExecution(val logical: LogicalPlan) {
   def assertAnalyzed(): Unit = analyzer.checkAnalysis(analyzed)

   // Unresolved Logical Plan -> Analyzed Logical Plan -> Optimized Logical Plan
   // -> Physical Plan -> Executed Physical Plan -> RDD

   // 分析 unresolved 的 LogicalPlan，得到 Analyzed Logical Plan
   // Unresolved Logical Plan -> Analyzed Logical Plan
   lazy val analyzed: LogicalPlan = analyzer.execute(logical)

   // 将 LogicalPlan 中的结点尽可能地替换为 cache 中的结果，得到 Analyzed Logical Plan with Cached Data
   lazy val withCachedData: LogicalPlan = {
     assertAnalyzed()
     cacheManager.useCachedData(analyzed)
   }

   // 对 Analyzed Logical Plan with Cached Data 进行优化，得到 Optimized Logical Plan
   // Analyzed Logical Plan -> Optimized Logical Plan
   lazy val optimizedPlan: LogicalPlan = optimizer.execute(withCachedData)

   // 生成 PhysicalPlan
   // Optimized Logical Plan -> Physical Plan
   lazy val sparkPlan: SparkPlan = {
     SparkPlan.currentContext.set(self)
     planner.plan(optimizedPlan).next()
   }
   // executedPlan should not be used to initialize any SparkPlan. It should be
   // only used for execution.
   // 准备好的 PhysicalPlan
   lazy val executedPlan: SparkPlan = prepareForExecution.execute(sparkPlan)

   /** Internal version of the RDD. Avoids copies and has no schema */
   // 执行并返回结果
   lazy val toRdd: RDD[Row] = executedPlan.execute()

   protected def stringOrError[A](f: => A): String =
     try f.toString catch { case e: Throwable => e.toString }

   def simpleString: String =
     s"""== Physical Plan ==
        |${stringOrError(executedPlan)}
     """.stripMargin.trim

   override def toString: String = {
     def output =
       analyzed.output.map(o => s"${o.name}: ${o.dataType.simpleString}").mkString(", ")

     // TODO previously will output RDD details by run (${stringOrError(toRdd.toDebugString)})
     // however, the `toRdd` will cause the real execution, which is not what we want.
     // We need to think about how to avoid the side effect.
     s"""== Parsed Logical Plan ==
        |${stringOrError(logical)}
        |== Analyzed Logical Plan ==
        |${stringOrError(output)}
        |${stringOrError(analyzed)}
        |== Optimized Logical Plan ==
        |${stringOrError(optimizedPlan)}
        |== Physical Plan ==
        |${stringOrError(executedPlan)}
        |Code Generation: ${stringOrError(executedPlan.codegenEnabled)}
        |== RDD ==
     """.stripMargin.trim
  }
}  
```

从类的注释上就能看到，`SQLContext#QueryExecution` 这个类包含了一次 SQL 查询的整个生命周期，从 unresolved 到 analyzed 到 optimized 到 physical 到 RDD，全都包含在了一个类中，开发者也可以很方便地通过这一个类对整个计算过程进行监控。`DataFrame` 的构造函数通过调用该类的 `assertAnalyzed`方法，触发了 `sqlContext.analyzer` 对 `logicalPlan` 变量的 `analyze` 操作。光是调用 `SQLContext#sql` 方法，Logical Plan 的 Analysis 步骤就已经完成了。

## 总结

知道 `SQLContext#QueryExecution` 这样一个类的存在对我们以后的代码阅读工作将带来大量的好处。下一次我将从 SparkSQL 的第一个步骤：Parse 进行讲解，敬请期待。
