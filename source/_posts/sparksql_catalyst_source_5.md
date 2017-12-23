---
title: Spark Catalyst 源码解析：Planner 与 RDD
category: Spark
tags:
  - Spark
  - SparkSQL
date: 2015-08-21
---

在[上一篇文章](/sparksql_catalyst_source_4)中，我们详细了解了 SparkSQL 如何利用 Analyzer 和 Optimizer，一步一步将 Unresolved Logical Plan 变为 Analyzed Logical Plan 再变为 Optimized Logical Plan。到了这一步，Logical Plan 的生命历程就走到了终点。

在这篇文章中，我将开始讲解 SparkSQL 如何通过 Planner 将 Optimized Logical Plan 变为 Physical Plan，再变为结果 RDD。

<!-- more -->

![](/img/Spark-Catalyst@11.jpg)

## SparkPlanner

到了这一步，我们就不能期待 Planner 和 Optimizer 他们一样继承自 `RuleExecutor` 了。为了了解这个过程的入口，我们先回到之前提到过的 `SQLContext#QueryExecution`：

```scala
lazy val optimizedPlan: LogicalPlan = optimizer.execute(withCachedData)

// 生成 PhysicalPlan
// Optimized Logical Plan -> Physical Plan
lazy val sparkPlan: SparkPlan = {
  SparkPlan.currentContext.set(self)
  planner.plan(optimizedPlan).next()
}
```

总结下来就是这样的一个流程：`optimizedPlan -> planner.plan -> sparkPlan`。由此一来，我们首先锁定了入口方法 `planner.plan`：

```scala
// SQLContext.scala

protected[sql] val planner = new SparkPlanner

protected[sql] class SparkPlanner extends SparkStrategies {
  // 从外部的 SQLContext 实例中导入相关设定参数
  val sparkContext: SparkContext = self.sparkContext
  val sqlContext: SQLContext = self
  def codegenEnabled: Boolean = self.conf.codegenEnabled
  def unsafeEnabled: Boolean = self.conf.unsafeEnabled
  def numPartitions: Int = self.conf.numShufflePartitions

  def strategies: Seq[Strategy] =
    experimental.extraStrategies ++ (
    DataSourceStrategy ::
    DDLStrategy ::
    TakeOrdered ::
    HashAggregation ::
    LeftSemiJoin ::
    HashJoin ::
    InMemoryScans ::
    ParquetOperations ::
    BasicOperators ::
    CartesianProduct ::
    BroadcastNestedLoopJoin :: Nil)

  // ...
} 
```

我们这次看到了一个 `strategies` 变量，其形式与之前在 `Analyzer` 和 `Optimizer` 里看到的 `batches` 变量十分相似。除此之外，我们并未看到 `SparkPlanner` 实现 `plan` 方法。这并不奇怪，毕竟 `Analyzer` 和 `Optimizer` 也没有实现 `execute` 方法。那我们先去看看 `SparkPlanner` 的父类 `SparkStrategies`：

![](/img/Spark-Catalyst@12.jpg)

```scala
private[sql] abstract class SparkStrategies extends QueryPlanner[SparkPlan] {
  self: SQLContext#SparkPlanner =>

  object LeftSemiJoin extends Strategy with PredicateHelper {
    // ...
  }
  
  object HashJoin extends Strategy with PredicateHelper {
	// ...
  }

  object HashAggregation extends Strategy {
    // ...
  }

  object BroadcastNestedLoopJoin extends Strategy {
    // ...
  }

  object CartesianProduct extends Strategy {
    // ...
  }

  protected lazy val singleRowRdd =
    sparkContext.parallelize(Seq(new GenericRow(Array[Any]()): Row), 1)

  object TakeOrdered extends Strategy {
    // ...
  }

  object ParquetOperations extends Strategy {
    // ...
  }

  object InMemoryScans extends Strategy {
    // ...
  }

  object BasicOperators extends Strategy {
    // ...
  }

  object DDLStrategy extends Strategy {
    // ...
  }
}
```

似乎 `SparkStrategies` 并未定义任何函数，倒是定义了大量的 `Strategy` 子类，这些子类都被应用在了 `SQLContext#SparkPlanner` 中。那么看来，这个类确实是名符其实的 `SparkStrategies`。我们继续去看它的父类吧！

![](/img/Spark-Catalyst@13.jpg)

```scala
// 可以看到 Strategy 与之前的 Rule 很类似，差别只在与 apply 函数返回的是 Seq[PhysicalPlan]
abstract class GenericStrategy[PhysicalPlan <: TreeNode[PhysicalPlan]] extends Logging {
  def apply(plan: LogicalPlan): Seq[PhysicalPlan]
}

// 相对的，QueryPlanner 也和 RuleExecutor 十分相似
abstract class QueryPlanner[PhysicalPlan <: TreeNode[PhysicalPlan]] {
  /** A list of execution strategies that can be used by the planner */
  def strategies: Seq[GenericStrategy[PhysicalPlan]]

  // 返回一个占位符。该占位符将由 QueryPlanner 使用其它可用的 Strategy 替换掉
  protected def planLater(plan: LogicalPlan) = this.plan(plan).next()

  def plan(plan: LogicalPlan): Iterator[PhysicalPlan] = {
    // Lazy 地在 LogicalPlan 上 apply 所有 Strategy
    val iter = strategies.view.flatMap(_(plan)).toIterator
    assert(iter.hasNext, s"No plan for $plan")
    iter
  }
}
```

![](/img/Spark-Catalyst@14.jpg)

从执行引擎这边能看到的似乎就只有这些了，我们甚至无法知道模板参数 `PhysicalPlan` 具体会是什么类型。通过查看之前出现过的 `Strategy` 类型，会在 `sql` 的包对象中发现这样一句：

```scala
@DeveloperApi
type Strategy = org.apache.spark.sql.catalyst.planning.GenericStrategy[SparkPlan]
```

至此我们就了解到，PhysicalPlan 树结点的类型为 `SparkPlan`。于是我们查看它的源代码：

```scala
object SparkPlan {
  protected[sql] val currentContext = new ThreadLocal[SQLContext]()
}

// 与 LogicalPlan 相同，继承自 QueryPlan
abstract class SparkPlan extends QueryPlan[SparkPlan] with Logging with Serializable {
  self: Product =>

  @transient
  protected[spark] final val sqlContext = SparkPlan.currentContext.get()
  protected def sparkContext = sqlContext.sparkContext

  // sqlContext will be null when we are being deserialized on the slaves.  In this instance
  // the value of codegenEnabled will be set by the desserializer after the constructor has run.
  val codegenEnabled: Boolean = if (sqlContext != null) {
    sqlContext.conf.codegenEnabled
  } else {
    false
  }

  /** Overridden make copy also propogates sqlContext to copied plan. */
  override def makeCopy(newArgs: Array[AnyRef]): this.type = {
    SparkPlan.currentContext.set(sqlContext)
    super.makeCopy(newArgs)
  }

  // 定义计算结果在各个节点上的 partition 规则
  def outputPartitioning: Partitioning = UnknownPartitioning(0) // TODO: WRONG WIDTH!

  // 定义输入数据的若干个节点分布要求
  def requiredChildDistribution: Seq[Distribution] =
    Seq.fill(children.size)(UnspecifiedDistribution)

  // 定义计算结果在各个节点上的排序规则
  def outputOrdering: Seq[SortOrder] = Nil

  // 定义输入数据的每个 partition 的若干个排序要求
  def requiredChildOrdering: Seq[Seq[SortOrder]] = Seq.fill(children.size)(Nil)

  // 在 withScope 内调用 doExecute 方法来得出结果
  final def execute(): RDD[Row] = {
    RDDOperationScope.withScope(sparkContext, nodeName, false, true) {
      doExecute()
    }
  }

  // 由子类重载该方法返回计算结果
  protected def doExecute(): RDD[Row]

  // execute + collect
  def executeCollect(): Array[Row] = {
    execute().mapPartitions { iter =>
      val converter = CatalystTypeConverters.createToScalaConverter(schema)
      iter.map(converter(_).asInstanceOf[Row])
    }.collect()
  }

  // execute + take(n)
  def executeTake(n: Int): Array[Row] = {
    if (n == 0) {
      return new Array[Row](0)
    }

	// 先获得代表完整结果的 RDD
    val childRDD = execute().map(_.copy())

	// result buffer
    val buf = new ArrayBuffer[Row]
	// partition 总数
    val totalParts = childRDD.partitions.length
	// 已扫描的 partition 数
    var partsScanned = 0
    while (buf.size < n && partsScanned < totalParts) {
      // 本次迭代尝试扫描的 partition 数
      var numPartsToTry = 1
      if (partsScanned > 0) { // 从第二次迭代开始
        if (buf.size == 0) { // 如果第一次迭代完全没有获取到结果，直接扫描剩下所有 partition
          numPartsToTry = totalParts - 1
        } else { // 1.5 * n / (buf.size / partsScanned)
          numPartsToTry = (1.5 * n * partsScanned / buf.size).toInt
        }
      }
      numPartsToTry = math.max(0, numPartsToTry)  // guard against negative num of partitions

	  // 剩余所需结果数
      val left = n - buf.size
	  // 即将进行尝试的 partition 集
      val p = partsScanned until math.min(partsScanned + numPartsToTry, totalParts)
      val sc = sqlContext.sparkContext
      val res =
        sc.runJob(childRDD, (it: Iterator[Row]) => it.take(left).toArray, p, allowLocal = false)

	  // 将结果放入 buf
      res.foreach(buf ++= _.take(n - buf.size))
      partsScanned += numPartsToTry
    }

	// 改变结果类型并返回。此步同 takeCollect
    val converter = CatalystTypeConverters.createToScalaConverter(schema)
    buf.toArray.map(converter(_).asInstanceOf[Row])
  }

  // ...
  
}
```

真是万万没想到，`SparkPlan` 与 `LogicalPlan` 同样继承自 `QueryPlan`，但仔细想想确实很合理。通过观察 `SparkPlan` 类便能发现，其实现类需要通过重载 `doExecute` 方法来定义自己的计算逻辑。在了解到这个主要入口以后，剩下的问题就变得轻松很多了。

![](/img/Spark-Catalyst@15.jpg)

但实际上，有一个难题我们并没有解决，有可能各位还没注意到这个问题。

```scala
abstract class QueryPlanner[PhysicalPlan <: TreeNode[PhysicalPlan]] {
  // ...

  // 返回一个占位符。该占位符将由 QueryPlanner 使用其它可用的 Strategy 替换掉
  protected def planLater(plan: LogicalPlan) = this.plan(plan).next()

  def plan(plan: LogicalPlan): Iterator[PhysicalPlan] = {
    // Lazy 地在 LogicalPlan 上 apply 所有 Strategy
    val iter = strategies.view.flatMap(_(plan)).toIterator
    assert(iter.hasNext, s"No plan for $plan")
    iter
  }
}
```

`plan` 函数的 `iter = strategies.view.flatMap(_(plan)).toIterator` 这句是不是有点问题？为什么 `planLater` 那个实现返回的是一个占位符？这个问题我们先不着急回答，我们先看看 `Strategy` 实现类是怎么使用 `planLater` 的：

```scala
// 笛卡尔积，由 SQL 语句的 JOIN 操作触发
object CartesianProduct extends Strategy {
  def apply(plan: LogicalPlan): Seq[SparkPlan] = plan match {
    case logical.Join(left, right, _, None) =>
      execution.joins.CartesianProduct(planLater(left), planLater(right)) :: Nil
    case logical.Join(left, right, Inner, Some(condition)) =>
      execution.Filter(condition,
        execution.joins.CartesianProduct(planLater(left), planLater(right))) :: Nil
    case _ => Nil
  }
}

// 注意：这个类属于 execution.joins 包，放在这里只是方便参考
case class CartesianProduct(left: SparkPlan, right: SparkPlan) extends BinaryNode {
  override def output: Seq[Attribute] = left.output ++ right.output

  protected override def doExecute(): RDD[Row] = {
    val leftResults = left.execute().map(_.copy())
    val rightResults = right.execute().map(_.copy())

    leftResults.cartesian(rightResults).mapPartitions { iter =>
      val joinedRow = new JoinedRow
      iter.map(r => joinedRow(r._1, r._2))
    }
  }
}
```

我们注意到，在 `object CartesianProduct` 的 `apply` 中，当遇到标记为 `Join` 的 Logical Plan 时，它的做法是先对左右子树分别调用 `planLater` 得到结果后，再构造 `execution.joins.CartesianProduct`。而 `planLater` 又会调用 `plan`，这意味着每一次调用 `planLater` 实际上都是一次递归，这是一个先序遍历。`planLater` 的实现是 `this.plan(plan).next()`，意味着即使 strategies 中可应用于传入子树的策略不止一个，返回的 Physical Plan 数也可能不止一个（注意 `Strategy` 的 `apply` 函数返回的是个 `Seq`），但 `planLater` 都只取第一个。

我们回到最初启动 plan 过程的入口：

```scala
lazy val sparkPlan: SparkPlan = {
  SparkPlan.currentContext.set(self)
  planner.plan(optimizedPlan).next()
}
```

这里就是这个先序遍历开始的地方，同样使用了和 `planLater` 一样的调用方式，这就证明了我的猜想。这同时说明，尽管 Spark 可以为同一个 Logical Plan 生成多个 Physical Plan，但本该在这些 Physical Plan 中选出最低代价执行计划的功能并未实现。在 `LogicalPlan` 中我们有看到过疑似要用于 cost-based 优化的 `Statistics` 变量，但在 Physical Plan 这边实际上我们并未见到它的身影，而且 `Statistics` 类本身的设计也过于简单（它是一个只包含了一个 `BigInt` 变量的 case class，并未继承任何类），显得有些许儿戏。

但这毕竟是不能怪 SparkSQL 的，查询代价受环境的影响很大，比起 rule-based 优化来说，cost-based 太过不稳定，实现起来也复杂很多。不过不管怎么说，SparkSQL 仍然留下了可用于实现 cost-based 优化的接口，也许有朝一日这个功能真的会实现。

## toRDD

我们接着往下走：

```scala
lazy val executedPlan: SparkPlan = prepareForExecution.execute(sparkPlan)

// 执行并返回结果
lazy val toRdd: RDD[Row] = executedPlan.execute()
```

上文中出现的 `prepareForExecution` 实际上是一个 `RuleExecutor` 的子类，它唯一的 rule 是 `EnsureRequirements`，它会确保输入数据的 `Partitioning` 满足 `SparkPlan` 中规定的 childDistribution，如果不满足则会通过添加子结点等方式尝试修复。

最终，`toRDD` 通过调用 `SparkPlan` 的 `execute` 方法，获取到计算结果。

## 结语

至此，我们大概了解了 SparkSQL 是如何处理用户的 SQL 语句，如何一步一步把它解析成 Logical Plan 再解析成 Physical Plan 再变成结果 RDD。如此粗略的介绍实在很难让你就此成为 SparkSQL 大师，因为 Catalyst 还有相当多的代码量用于定义优化规则即 Logical/Physical Plan 转换规则。以后我会考虑出一些进阶篇来讲讲这之中一些进阶级的细节实现，敬请期待咯。
