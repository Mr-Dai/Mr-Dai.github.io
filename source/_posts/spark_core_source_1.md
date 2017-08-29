---
title: Spark Core 源码解析：RDD
category: Spark Core 源码解析
date: 2015-08-28
comments: true
tags:
 - Spark
---

我的[上一个系列](/sparksql_catalyst_source_1)的 Spark 源码解析已经完结了一段时间了。当时我出于实习工作的需要阅读了 SparkSQL 以及 Spark REPL 的源代码，并顺势写下了那个系列的源码解析文章。但读 Spark 源代码怎么能只读那些外围插件的源代码呢？于是我又开一个新坑了。

<!-- more -->

要理解 Spark 的中心思想，首先当然得从 Spark Core 开始。Spark Core 中包含了所有 Spark 的核心类的定义，其中就有我们用得最多的 `SparkContext` 和 `RDD`。在开始阅读本文之前，我希望各位可以先完整阅读[这篇](/file/RDDs.pdf">这篇</a>论文以及<a href="/file/Spark.pdf)论文。这两篇论文的撰写者相同，均属 UC Berkeley 大学，虽然我不确定他们是不是，但我想他们应该就是 Spark 的创始人了。前一篇论文在第二节详细介绍了 RDD 的概念，并在第五节详细介绍了 Spark 的一些实现原理。后一篇论文在内容上并不如前一篇论文充分，而且有大量的重复内容，但其中也包含了一些新内容，值得大家学习一下。源代码中会出现很多奇怪的名词，恐怕你必须通过完整阅读这两篇论文才能够理解。我不会在文中重复解释这些术语的确切意思，因此我希望你能静下心来读完这两篇论文再继续往下看。我相信这样的阅读是完全值得的。

首先这个系列的出发点其实就有两个，一个是 `SparkContext`，另一个就是 `RDD`。我有思考过哪个更好，最终我选择了 `RDD`，因为它的实现更简单，与 Spark 其他类的依赖也少得多。在我们完整阅读了 `RDD` 的源代码后，想必阅读 `SparkContext` 的源代码也会变得轻松很多。但这并不代表在这篇文章中不会出现 `SparkContext` 的代码。这篇文章将涵盖与 `RDD` 功能实现有关的代码，至于这些代码来自于哪个类并不重要。

那我们开始吧。

## RDD

在开始跳进去看 RDD 的方法之前，我们应该先了解一下 RDD 的一些基本信息。首先，我们先来看看 RDD 的构造方法：

```scala
abstract class RDD[T: ClassTag](
    @transient private var _sc: SparkContext,
    @transient private var deps: Seq[Dependency[_]]
  ) extends Serializable with Logging {

  if (classOf[RDD[_]].isAssignableFrom(elementClassTag.runtimeClass)) {
    // This is a warning instead of an exception in order to avoid breaking user programs that
    // might have defined nested RDDs without running jobs with them.
    logWarning("Spark does not support nested RDDs (see SPARK-5063)")
  }
  
  /** Construct an RDD with just a one-to-one dependency on one parent */
  def this(@transient oneParent: RDD[_]) =
    this(oneParent.context , List(new OneToOneDependency(oneParent)))
}
```

这里我们看到，`RDD` 在创建时便会放入一个 `SparkContext` 和它的 `Dependency` 们。关于 `Dependency` 类，在上面的论文中有介绍，它包含了当前 `RDD` 的父 `RDD` 的引用，以及足够从父 `RDD` 恢复丢失的 partition 的信息。

接下来我们看看 `RDD` 需要子类实现的虚函数：

```scala
// 由子类实现来计算一个给定的 Partition
def compute(split: Partition, context: TaskContext): Iterator[T]

// 由子类实现，返回这个 RDD 的 Partition 集合
protected def getPartitions: Array[Partition]

// 由子类实现，返回这个 RDD 的 Dependency 集合
protected def getDependencies: Seq[Dependency[_]] = deps

// 可由子类重载，以提供更加偏好的 Partition 放置策略
protected def getPreferredLocations(split: Partition): Seq[String] = Nil

// 可由子类重载来改变 partition 的方式
@transient val partitioner: Option[Partitioner] = None
```

这些函数基本都是用于执行 Spark 计算的方法，也包括了论文中提到的三大 RDD 接口中的两个，即 `getPartitions` 以及 `getPreferredLocations`。其中有两个函数是子类必须实现的，即 `compute` 和 `getPartitions`。我们记住它们的功能定义，以免它们在子类中再次出现时一时想不起来它们的功能。

继续往下，我们看到除了包含 `SparkContext` 变量和 `Dependency` 们，一个 RDD 还包含了自己的 `id` 以及 `name`：

```scala
// 创建该 RDD 的 SparkContext
def sparkContext: SparkContext = sc

// SparkContext 内部的唯一 ID
val id: Int = sc.newRddId()

// RDD 的名字
@transient var name: String = null

// 给 RDD 一个新的名字
def setName(_name: String): this.type = {
  name = _name
  this
}
```

再继续往下，便是 RDD 的公用 API 了。

## RDD Action

RDD 提供了大量的 API 供我们使用。通过浏览 RDD 的[ScalaDoc](http://spark.apache.org/docs/latest/api/scala/index.html#org.apache.spark.rdd.RDD)，不难发现 RDD 拥有数十种 `public` 的接口，更不要提那些我们即将面对的非 `public` 的接口了。因此直接跳进 `RDD.scala` 从上往下阅读源代码是不科学的。这里我使用另外一种阅读方式。

正如 Spark 的论文中所描述的，RDD 的 API 并不是每一个都会启动 Spark 的计算。被称之为 `Transformation` 的操作可以用一个 RDD 产生另一个 RDD，但这样的操作实际上是 lazy 的：它们并不会被立即计算，而是当你真正触发了计算动作的时候，所有你提交过的 Transformation 们会在经过 Spark 优化以后再顺序执行。那么怎么样的操作会触发 Spark 的计算呢？

![](/img/SparkCore@1.jpg)

这些被称之为 `Action` 的 RDD 操作便会触发 Spark 的计算动作。根据上图，Action 包括 `count`、`collect`、`reduce`、`lookup` 和 `save`（已被更名为 `saveAsTextFile` 和 `saveAsObjectFile`）。不难发现，除了 `save`，其他四个操作都是将结果直接获取到 driver 程序中的操作，由这些操作来启动 Spark 的计算也是十分合理的。

那么我们不妨先来看一下这几个函数的源代码：

```scala

// RDD.scala

def collect(): Array[T] = withScope {
  val results = sc.runJob(this, (iter: Iterator[T]) => iter.toArray)
  Array.concat(results: _*)
}

// 返回 RDD 的元素个数
def count(): Long = sc.runJob(this, Utils.getIteratorSize _).sum

// 使用给定的二元运算符来 reduce 该 RDD
def reduce(f: (T, T) => T): T = withScope {
  // Clean 一下用户传入的 closure，以准备将其序列化
  val cleanF = sc.clean(f)
  // 应用在每个 partition 上的 reduce 函数。相当于 Hadoop MR 中的 combine
  val reducePartition: Iterator[T] => Option[T] = iter => {
    if (iter.hasNext) {
      Some(iter.reduceLeft(cleanF)) // 在单个 Partition 内部使用 Iterator#reduceLeft 来计算结果
    } else {
      None
    }
  }
  
  var jobResult: Option[T] = None
  // 合并每个 partition 的 reduce 结果
  val mergeResult = (index: Int, taskResult: Option[T]) => {
    if (taskResult.isDefined) {
      jobResult = jobResult match {
        case Some(value) => Some(f(value, taskResult.get))
        case None => taskResult
      }
    }
  }
  // 启动 Spark Job
  sc.runJob(this, reducePartition, mergeResult)

  jobResult.getOrElse(throw new UnsupportedOperationException("empty collection"))
}

// PairRDDFunctions.scala

// 根据给定的 RDD 的 key 来查找它对应的 Seq[value]
// 如果该 RDD 有给定的 Partitioner，该方法会先利用 getPartition 方法定位 Partition 再进行搜索，
// 如此一来便能提高效率 
def lookup(key: K): Seq[V] = self.withScope {
  self.partitioner match {
    case Some(p) => // 存在特定的 Partitioner
      val index = p.getPartition(key)  // 定位具体的 Partition
      val process = (it: Iterator[(K, V)]) => {
        val buf = new ArrayBuffer[V]
        for (pair <- it if pair._1 == key) {
          buf += pair._2
        }
        buf
      } : Seq[V]
	  // 仅在该 Partition 上查找
      val res = self.context.runJob(self, process, Array(index), false)
      res(0)  
    case None =>
	  // 若找不到特定的 Partitioner，则使用 RDD#filter 来查找
      self.filter(_._1 == key).map(_._2).collect()
  }
}  
```


上述四个函数都有一个特点：它们都直接或间接地调用了 `sparkContext.runJob` 方法来获取结果。可见这个方法便是启动 Spark 计算任务的入口。我们记下这个入口，留到研读 `SparkContext` 源代码的时候再进行解析。

## RDD Transformations

讲完了 Action，自然就轮到了 Transformation 了。可是有那~么多的 Transformation 啊。我们就一个一个地看看这些常用的 Transformation 吧。

### map

我们先从用得最多的开始。我们直接看源码：

```scala
/**
 * Return a new RDD by applying a function to all elements of this RDD.
 */
def map[U: ClassTag](f: T => U): RDD[U] = withScope {
  val cleanF = sc.clean(f)
  new MapPartitionsRDD[U, T](this, (context, pid, iter) => iter.map(cleanF))
}
```

和论文中说的一样，`map` 函数会利用当前 RDD 以及用户传入的匿名函数构建出一个 `MapPartitionsRDD`。毋庸置疑这个东西肯定是继承自 `RDD` 类的。我们可以看看它的源代码：

```scala
private[spark] class MapPartitionsRDD[U: ClassTag, T: ClassTag](
    prev: RDD[T],
    f: (TaskContext, Int, Iterator[T]) => Iterator[U],  // (TaskContext, partition index, iterator)
    preservesPartitioning: Boolean = false)
  extends RDD[U](prev) {

  override val partitioner = if (preservesPartitioning) firstParent[T].partitioner else None

  override def getPartitions: Array[Partition] = firstParent[T].partitions

  override def compute(split: Partition, context: TaskContext): Iterator[U] =
    f(context, split.index, firstParent[T].iterator(split, context))
}
```

可以看到，`MapPartitionsRDD` 实现了 `getPartitions` 和 `compute` 方法。

`getPartitions` 方法直接返回了它的 `firstParent` 的 partition。实际上 `MapPartitionsRDD` 也只会有一个 parent，也就是构造函数传入的 `prev`。

`compute` 方法在这里直接应用了构造参数传入的方法 `f`。我们看回 `RDD#map`，传入的方法是 `(context, pid, iter) => iter.map(cleanF)`。结合到 `MapPartitionsRDD` 的源代码里就不难看出其实现原理了。这里我们最好记住匿名函数的 `context` 是 `TaskContext` 、 `pid` 是 `Partition` 的 id、`iter` 即该 `Partition` 的 `iterator`。记住这些以免后面再次出现的时候一时晕菜。

注意到，`MapPartitionsRDD` 还重载了 `partitioner` 变量，其值取决于构造函数传入的 `preservesPartitioning` 参数，该参数默认为 `false`。在 `RDD#map` 方法里并未对该参数赋值。

### withScope

我们回到刚才的 `RDD#map` 方法，注意到它还调用了一个函数，就是 `withScope`。这个函数出现的次数相当多，你在很多 RDD API 里都能发现它。我们来看看它的源代码：

```scala

// RDD.scala

private[spark] def withScope[U](body: => U): U = RDDOperationScope.withScope[U](sc)(body)

// RDDOperationScope.scala

/**
 * A general, named code block representing an operation that instantiates RDDs.
 *
 * All RDDs instantiated in the corresponding code block will store a pointer to this object.
 * Examples include, but will not be limited to, existing RDD operations, such as textFile,
 * reduceByKey, and treeAggregate.
 *
 * An operation scope may be nested in other scopes. For instance, a SQL query may enclose
 * scopes associated with the public RDD APIs it uses under the hood.
 *
 * There is no particular relationship between an operation scope and a stage or a job.
 * A scope may live inside one stage (e.g. map) or span across multiple jobs (e.g. take).
 */
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(Array("id", "name", "parent"))
private[spark] class RDDOperationScope(
    val name: String,
    val parent: Option[RDDOperationScope] = None,
    val id: String = RDDOperationScope.nextScopeId().toString) {

  def toJson: String = {
    RDDOperationScope.jsonMapper.writeValueAsString(this)
  }

  /**
   * Return a list of scopes that this scope is a part of, including this scope itself.
   * The result is ordered from the outermost scope (eldest ancestor) to this scope.
   */
  @JsonIgnore
  def getAllScopes: Seq[RDDOperationScope] = {
    parent.map(_.getAllScopes).getOrElse(Seq.empty) ++ Seq(this)
  }

  override def equals(other: Any): Boolean = {
    other match {
      case s: RDDOperationScope =>
        id == s.id && name == s.name && parent == s.parent
      case _ => false
    }
  }

  override def toString: String = toJson
}

/**
 * A collection of utility methods to construct a hierarchical representation of RDD scopes.
 * An RDD scope tracks the series of operations that created a given RDD.
 */
private[spark] object RDDOperationScope extends Logging {
  private val jsonMapper = new ObjectMapper().registerModule(DefaultScalaModule)
  private val scopeCounter = new AtomicInteger(0)

  def fromJson(s: String): RDDOperationScope = {
    jsonMapper.readValue(s, classOf[RDDOperationScope])
  }

  /** Return a globally unique operation scope ID. */
  def nextScopeId(): Int = scopeCounter.getAndIncrement

  /**
   * Execute the given body such that all RDDs created in this body will have the same scope.
   * The name of the scope will be the first method name in the stack trace that is not the
   * same as this method's.
   *
   * Note: Return statements are NOT allowed in body.
   */
  private[spark] def withScope[T](
      sc: SparkContext,
      allowNesting: Boolean = false)(body: => T): T = {
    val ourMethodName = "withScope"
    val callerMethodName = Thread.currentThread.getStackTrace()
      .dropWhile(_.getMethodName != ourMethodName)	// 去掉了 withScope 之后的所有函数调用
      .find(_.getMethodName != ourMethodName)	// 找到调用 withScope 的函数，如 RDD#withScope
      .map(_.getMethodName)
      .getOrElse {
        // Log a warning just in case, but this should almost certainly never happen
        logWarning("No valid method name for this RDD operation scope!")
        "N/A"
      }
    withScope[T](sc, callerMethodName, allowNesting, ignoreParent = false)(body)
  }

  /**
   * Execute the given body such that all RDDs created in this body will have the same scope.
   *
   * If nesting is allowed, any subsequent calls to this method in the given body will instantiate
   * child scopes that are nested within our scope. Otherwise, these calls will take no effect.
   *
   * Additionally, the caller of this method may optionally ignore the configurations and scopes
   * set by the higher level caller. In this case, this method will ignore the parent caller's
   * intention to disallow nesting, and the new scope instantiated will not have a parent. This
   * is useful for scoping physical operations in Spark SQL, for instance.
   *
   * Note: Return statements are NOT allowed in body.
   */
  private[spark] def withScope[T](
      sc: SparkContext,
      name: String,
      allowNesting: Boolean,
      ignoreParent: Boolean)(body: => T): T = {
    // Save the old scope to restore it later
    val scopeKey = SparkContext.RDD_SCOPE_KEY
    val noOverrideKey = SparkContext.RDD_SCOPE_NO_OVERRIDE_KEY
    val oldScopeJson = sc.getLocalProperty(scopeKey)
    val oldScope = Option(oldScopeJson).map(RDDOperationScope.fromJson)
    val oldNoOverride = sc.getLocalProperty(noOverrideKey)
    try {
      if (ignoreParent) {
        // Ignore all parent settings and scopes and start afresh with our own root scope
        sc.setLocalProperty(scopeKey, new RDDOperationScope(name).toJson)
      } else if (sc.getLocalProperty(noOverrideKey) == null) {
        // Otherwise, set the scope only if the higher level caller allows us to do so
        sc.setLocalProperty(scopeKey, new RDDOperationScope(name, oldScope).toJson)
      }
      // Optionally disallow the child body to override our scope
      if (!allowNesting) {
        sc.setLocalProperty(noOverrideKey, "true")
      }
	  // 在执行传入的函数前先将一个新的 RDDOperationScope 设定到 sc 中
      body
    } finally {
	  // 执行完毕后再还原
      // Remember to restore any state that was modified before exiting
      sc.setLocalProperty(scopeKey, oldScopeJson)
      sc.setLocalProperty(noOverrideKey, oldNoOverride)
    }
  }
}
```

暂时来讲，`withScope` 方法所涉及到的环境变量包括 `scopeKey` 和 `noOverrideKey`。以我们目前的高度，这两个变量的具体使用应该是不会接触到的，我们不妨留到深入探讨 `SparkContext` 的时候再仔细研究这两个变量。

### filter

```scala
def filter(f: T => Boolean): RDD[T] = withScope {
  val cleanF = sc.clean(f)
  new MapPartitionsRDD[T, T](
    this,
    (context, pid, iter) => iter.filter(cleanF),
    preservesPartitioning = true)
}
```

可见，`filter` 本质上也是一种 `map`。

### flatMap

```scala
def flatMap[U: ClassTag](f: T => TraversableOnce[U]): RDD[U] = withScope {
  val cleanF = sc.clean(f)
  new MapPartitionsRDD[U, T](this, (context, pid, iter) => iter.flatMap(cleanF))
}
```

基本同上。

### sample

```scala
/**
 * Return a sampled subset of this RDD.
 *
 * @param withReplacement can elements be sampled multiple times (replaced when sampled out)
 * @param fraction expected size of the sample as a fraction of this RDD's size
 *  without replacement: probability that each element is chosen; fraction must be [0, 1]
 *  with replacement: expected number of times each element is chosen; fraction must be >= 0
 * @param seed seed for the random number generator
 */
def sample(
    withReplacement: Boolean,
    fraction: Double,
    seed: Long = Utils.random.nextLong): RDD[T] = withScope {
  require(fraction >= 0.0, "Negative fraction value: " + fraction)
  if (withReplacement) {
    new PartitionwiseSampledRDD[T, T](this, new PoissonSampler[T](fraction), true, seed)
  } else {
    new PartitionwiseSampledRDD[T, T](this, new BernoulliSampler[T](fraction), true, seed)
  }
}
```

可见，`sample` 方法生成了一个 `PartitionwiseSampledRDD`，并根据参数的不同分别传入 `PoissonSampler` 或 `BernoulliSampler`。从名字上看，这两个 Sampler 自然是对应着泊松分布和贝努利分布，只是两种不同的随机采样器。因此这里我们就不解析这两个采样器了。我们来看一下这个 `PartitionwiseSampledRDD`：

```scala
private[spark]
class PartitionwiseSampledRDDPartition(val prev: Partition, val seed: Long)
  extends Partition with Serializable {
  override val index: Int = prev.index
}

/**
 * A RDD sampled from its parent RDD partition-wise. For each partition of the parent RDD,
 * a user-specified [[org.apache.spark.util.random.RandomSampler]] instance is used to obtain
 * a random sample of the records in the partition. The random seeds assigned to the samplers
 * are guaranteed to have different values.
 *
 * @param prev RDD to be sampled
 * @param sampler a random sampler
 * @param preservesPartitioning whether the sampler preserves the partitioner of the parent RDD
 * @param seed random seed
 * @tparam T input RDD item type
 * @tparam U sampled RDD item type
 */
private[spark] class PartitionwiseSampledRDD[T: ClassTag, U: ClassTag](
    prev: RDD[T],
    sampler: RandomSampler[T, U],
    @transient preservesPartitioning: Boolean,
    @transient seed: Long = Utils.random.nextLong)
  extends RDD[U](prev) {

  @transient override val partitioner = if (preservesPartitioning) prev.partitioner else None

  override def getPartitions: Array[Partition] = {
    val random = new Random(seed)
    firstParent[T].partitions.map(x => new PartitionwiseSampledRDDPartition(x, random.nextLong()))
  }

  override def getPreferredLocations(split: Partition): Seq[String] =
    firstParent[T].preferredLocations(split.asInstanceOf[PartitionwiseSampledRDDPartition].prev)

  override def compute(splitIn: Partition, context: TaskContext): Iterator[U] = {
    val split = splitIn.asInstanceOf[PartitionwiseSampledRDDPartition]
    val thisSampler = sampler.clone
    thisSampler.setSeed(split.seed)
    thisSampler.sample(firstParent[T].iterator(split.prev, context))
  }
}
```

实现逻辑也十分直观：`getPartitions` 方法表明 `PartitionwiseSampledRDD` 直接利用它的 parent RDD 的 partition 作为自己的 partition；`compute` 方法则表明 `PartitionwiseSampledRDD` 将通过调用 `RandomSampler` 的 `sample` 方法来对 Iterator 进行取样。

### cartesian

```scala
/**
 * Return the Cartesian product of this RDD and another one, that is, the RDD of all pairs of
 * elements (a, b) where a is in `this` and b is in `other`.
 */
def cartesian[U: ClassTag](other: RDD[U]): RDD[(T, U)] = withScope {
  new CartesianRDD(sc, this, other)
}
```

使用两个 `RDD` 构建了一个 `CartesianRDD`，似乎也十分合理。那我们来看一下这个 `CartesianRDD`：

```scala
private[spark] class CartesianPartition(
    idx: Int,
    @transient rdd1: RDD[_],
    @transient rdd2: RDD[_],
    s1Index: Int,
    s2Index: Int
  ) extends Partition {
  var s1 = rdd1.partitions(s1Index)
  var s2 = rdd2.partitions(s2Index)
  override val index: Int = idx

  // 重载了 Serializable 的 writeObject 方法，在任务序列化时更新 s1、s2
  @throws(classOf[IOException])
  private def writeObject(oos: ObjectOutputStream): Unit = Utils.tryOrIOException {
    // Update the reference to parent split at the time of task serialization
    s1 = rdd1.partitions(s1Index)
    s2 = rdd2.partitions(s2Index)
    oos.defaultWriteObject()
  }
}

private[spark]
class CartesianRDD[T: ClassTag, U: ClassTag](
    sc: SparkContext,
    var rdd1 : RDD[T],
    var rdd2 : RDD[U])
  extends RDD[Pair[T, U]](sc, Nil)
  with Serializable {

  val numPartitionsInRdd2 = rdd2.partitions.length

  // 以 rdd1 与 rdd2 的 partition 来生成自己的 partition
  override def getPartitions: Array[Partition] = {
    // create the cross product split
    val array = new Array[Partition](rdd1.partitions.length * rdd2.partitions.length)
    for (s1 <- rdd1.partitions; s2 <- rdd2.partitions) {
      val idx = s1.index * numPartitionsInRdd2 + s2.index
      array(idx) = new CartesianPartition(idx, rdd1, rdd2, s1.index, s2.index)
    }
    array
  }

  // preferredLocations 依赖于 rdd1 和 rdd2 的 preferredLocations
  override def getPreferredLocations(split: Partition): Seq[String] = {
    val currSplit = split.asInstanceOf[CartesianPartition]
    (rdd1.preferredLocations(currSplit.s1) ++ rdd2.preferredLocations(currSplit.s2)).distinct
  }

  // 直接使用 rdd1 和 rdd2 生成自身结果
  override def compute(split: Partition, context: TaskContext): Iterator[(T, U)] = {
    val currSplit = split.asInstanceOf[CartesianPartition]
    for (x <- rdd1.iterator(currSplit.s1, context);
         y <- rdd2.iterator(currSplit.s2, context)) yield (x, y)
  }

  // 指明自己依赖于 rdd1 和 rdd2
  override def getDependencies: Seq[Dependency[_]] = List(
    new NarrowDependency(rdd1) {
      def getParents(id: Int): Seq[Int] = List(id / numPartitionsInRdd2)
    },
    new NarrowDependency(rdd2) {
      def getParents(id: Int): Seq[Int] = List(id % numPartitionsInRdd2)
    }
  )

  override def clearDependencies() {
    super.clearDependencies()
    rdd1 = null
    rdd2 = null
  }
}
```

也比较直观。

### distinct

```scala
/**
 * Return a new RDD containing the distinct elements in this RDD.
 */
def distinct(numPartitions: Int)(implicit ord: Ordering[T] = null): RDD[T] = withScope {
  map(x => (x, null)).reduceByKey((x, y) => x, numPartitions).map(_._1)
}
```

使用了 `reduceByKey` 的功能实现了 `distinct`，可以理解。

### groupBy

```scala
def groupBy[K](f: T => K)(implicit kt: ClassTag[K]): RDD[(K, Iterable[T])] = withScope {
  groupBy[K](f, defaultPartitioner(this))
}

def groupBy[K](f: T => K, numPartitions: Int)
              (implicit kt: ClassTag[K]): RDD[(K, Iterable[T])] = withScope {
  groupBy(f, new HashPartitioner(numPartitions))
}

def groupBy[K](f: T => K, p: Partitioner)
              (implicit kt: ClassTag[K], ord: Ordering[K] = null) : RDD[(K, Iterable[T])] = withScope {
  val cleanF = sc.clean(f)
  // 利用传入的 f 为每个记录生成 key 以后再 groupByKey
  this.map(t => (cleanF(t), t)).groupByKey(p)
}
```

## 总结

至此，我们便基本能够理解了：RDD Transformation 将以原本的 RDD 作为 parent 来构造一个新的 RDD，不断地调用 Transformation Operation 就可以产生出一条 RDD 操作链，但整条流水线的启动被一直延后到 RDD Action；RDD Action 通过调用 `SparkContext#runJob` 启动整条流水线。
