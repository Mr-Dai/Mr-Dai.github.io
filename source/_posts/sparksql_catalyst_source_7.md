---
title: Spark Catalyst 进阶：CacheManager
category: Spark Catalyst 源码解析
tags:
  - Spark
  - SparkSQL
  - Catalyst
date: 2015-08-23
---

在[上一篇文章](/sparksql_catalyst_source_6)中，我们详细讲解了 SparkSQL 如何一步一步地将用户输入的 SQL 语句变为 LogicalPlan 再变为 PhysicalPlan。
至此，这个流程本身的内容已经全部讲完了，因此接下来的文章我们将脱离这个主要流程，去讲解 SparkSQL 的其他常用功能。

在今天的这篇文章中，我们先从 SparkSQL 的 DataFrame Cache 机制开始讲起。

<!-- more -->

## CacheManager

在我之前推荐的[那篇论文](/file/SparkSQL.pdf)中实际上有稍微提到 SparkSQL 的缓存机制。我们都知道 RDD 可以以 Partition 为单位进行缓存，对于一些经常需要大量计算但计算结果基本不变且经常需要查询的数据，我们就会考虑使用 RDD 的缓存机制。SparkSQL 中也是同理。平日的数据库访问中我们经常需要访问一些由两张表 Join 得到的数据。这些数据查询频次高、计算复杂度高，但计算的结果在短时间内是基本不变的。为了做到实时性，对于这样的 DataFrame 我们就可以考虑使用 DataFrame 的 Cache 机制。

通常，我们通过调用 `DataFrame` 的 `cache` 方法或 `persist` 方法来对其进行缓存。实际上这两个操作是完全相同的。我们来看一下它们的源代码：

```scala
class DataFrame private[sql](
    @transient val sqlContext: SQLContext,
    @DeveloperApi @transient val queryExecution: SQLContext#QueryExecution)
  extends RDDApi[Row] with Serializable {
  
  // ...
  
  override def cache(): this.type = persist() // 由此可见，这两个接口是完全相同的
  
  // 调用了 SQLContext 的 cacheManager 来完成 Cache 动作
  override def persist(): this.type = {
    sqlContext.cacheManager.cacheQuery(this)
    this
  }

  // 除此之外，persist 接口还允许用户传入不同的存储级别。可用于 DataFrame 的存储级别与 RDD 的完全相同
  override def persist(newLevel: StorageLevel): this.type = {
    sqlContext.cacheManager.cacheQuery(this, None, newLevel)
    this
  }  
 
  // ...
}
```

那我们再去看看 `SQLContext` 的这个 `cacheManager` 是什么：

```scala
protected[sql] val cacheManager = new CacheManager(this) // 很好，简单粗暴
```

由此一来我们就知道这个变量实际上就是个 `CacheManager` 实例，`DataFrame` 通过以自己为参数调用它的 `cacheQuery` 方法来完成缓存动作。那么我们就来看一下 `CacheManager`：

```scala
/** Holds a cached logical plan and its data */
private[sql] case class CachedData(plan: LogicalPlan, cachedRepresentation: InMemoryRelation)
// 从命名上看，这应该是个用来表示单张缓存表的 bean 类，其中包含一个表示其所代表的查询的 LogicalPlan。
// InMemoryRelation 类尚不明朗，但从名字上看，这应该是个 LogicalPlan + LeafNode 的实现类

private[sql] class CacheManager(sqlContext: SQLContext) extends Logging {

  @transient
  private val cachedData = new scala.collection.mutable.ArrayBuffer[CachedData]
  // 通过一个 ArrayBuffer 管理注册到该 manager 中的 DataFrame

  @transient
  private val cacheLock = new ReentrantReadWriteLock
  // 使用一个可重入读写锁来对 Cache 内容进行加锁

  /** Returns true if the table is currently cached in-memory. */
  def isCached(tableName: String): Boolean = lookupCachedData(sqlContext.table(tableName)).nonEmpty
  // 检查某张表是否被 cache 到了内存中。这里调用了一个新方法 lookupCachedData

  /** Caches the specified table in-memory. */
  def cacheTable(tableName: String): Unit = cacheQuery(sqlContext.table(tableName), Some(tableName))
  // 将某张表 cache 到内存中。这里再次调用了 cacheQuery 方法

  /** Removes the specified table from the in-memory cache. */
  def uncacheTable(tableName: String): Unit = uncacheQuery(sqlContext.table(tableName))
  // 将某张表从内存中移除

  /** 为 f 过程赋一个读锁 */
  private def readLock[A](f: => A): A = {
    val lock = cacheLock.readLock()
    lock.lock()
    try f finally {
      lock.unlock()
    }
  }

  /** 为 f 过程赋一个写锁 */
  private def writeLock[A](f: => A): A = {
    val lock = cacheLock.writeLock()
    lock.lock()
    try f finally {
      lock.unlock()
    }
  }

  /** 清除所有缓存表。涉及缓存内容修改，因此这里申请了一个写锁 */
  private[sql] def clearCache(): Unit = writeLock {
    // 这里调用了 InMemoryRelation 的 cachedColumnBuffers 变量的 unpersist 方法来从内存中物理地移除缓存
    cachedData.foreach(_.cachedRepresentation.cachedColumnBuffers.unpersist())
	// 之所以说是物理的，毫无疑问 CachedData 本身只是一些元数据，单纯的 cacheData.clear 是不够的
    cachedData.clear()
	// 当然最后还是得 clear 一下才行
  }

  /** 检查是否有缓存内容。涉及读取缓存内容，申请了一个读锁 */
  private[sql] def isEmpty: Boolean = readLock {
    cachedData.isEmpty
  }

  /**
   * 对传入的 Logical Plan（实际指 DataFrame）进行缓存。这里使用的默认存储级别为 MEMORY_AND_DISK，
   * 因为计算表的列存储表示的过程代价过高。
   *
   * 涉及缓存写操作，申请了一个写锁
   */
  private[sql] def cacheQuery(
      query: DataFrame,
      tableName: Option[String] = None,
      storageLevel: StorageLevel = MEMORY_AND_DISK): Unit = writeLock {
	// 获取到 DataFrame 的 Analyzed Logical Plan
    val planToCache = query.queryExecution.analyzed
	// 先看看这个 Plan 是否已经 cache 了
    if (lookupCachedData(planToCache).nonEmpty) {
      logWarning("Asked to cache already cached data.")
    } else {
	  // 没有的话才 cache
      cachedData +=
        CachedData(
          planToCache,  // CachedData 中保存的是一个 Analyzed Logical Plan
          InMemoryRelation(
            sqlContext.conf.useCompression,
            sqlContext.conf.columnBatchSize,
            storageLevel,
            query.queryExecution.executedPlan, // 但 InMemoryRelation 中保存的是一个 Prepared Physical Plan
            tableName))
    }
  }

  /** 根据给定的 DataFrame 从缓存中移除数据。申请了一个写锁 */
  private[sql] def uncacheQuery(query: DataFrame, blocking: Boolean = true): Unit = writeLock {
    val planToCache = query.queryExecution.analyzed
	// 通过调用 LogicalPlan 的 sameResult 方法来在 cachedData 中找到对应位置
    val dataIndex = cachedData.indexWhere(cd => planToCache.sameResult(cd.plan))
    require(dataIndex >= 0, s"Table $query is not cached.")
	// 物理移除
    cachedData(dataIndex).cachedRepresentation.uncache(blocking)
	// 逻辑移除
    cachedData.remove(dataIndex)
  }

  /**
   * 尝试根据给定的 DataFrame 从缓存中移除数据。申请了一个写锁。
   *
   * 该方法与上一个方法的不同在于，上一个方法如果没有在 cachedData 中找到对应的元素会直接抛出一个错误，
   * 但这个方法不会。
   */
  private[sql] def tryUncacheQuery(
      query: DataFrame,
      blocking: Boolean = true): Boolean = writeLock {
    val planToCache = query.queryExecution.analyzed
    val dataIndex = cachedData.indexWhere(cd => planToCache.sameResult(cd.plan))
    val found = dataIndex >= 0
    if (found) {
      cachedData(dataIndex).cachedRepresentation.cachedColumnBuffers.unpersist(blocking)
      cachedData.remove(dataIndex)
    }
    found
  }

  /** 使用传入 DataFrame 的 Analyzed Logical Plan 来查找 cachedData */
  private[sql] def lookupCachedData(query: DataFrame): Option[CachedData] = readLock {
    lookupCachedData(query.queryExecution.analyzed)
  }

  /** 使用传入的 Analyzed Logical Plan 来查找 cachedData */
  private[sql] def lookupCachedData(plan: LogicalPlan): Option[CachedData] = readLock {
    // 这里同样利用了 LogicalPlan 的 sameResult 方法
    cachedData.find(cd => plan.sameResult(cd.plan))
  }

  /**
   * 尝试将传入的 LogicalPlan 中吻合的子树替换为缓存内容
   * 在 SQLContext#QueryExecution 中，得出 Analyzed Logical Plan 以后，
   * 会在转换为 PhysicalPlan 之前调用该方法。
   */
  private[sql] def useCachedData(plan: LogicalPlan): LogicalPlan = {
    plan transformDown {
      case currentFragment =>
        lookupCachedData(currentFragment)
          .map(_.cachedRepresentation.withOutput(currentFragment.output))
          .getOrElse(currentFragment)
	  // 在 cachedData 中找到相同的 Plan，便将其替换为了一个 InMemoryRelation
	  // 这里还调用了 InMemoryRelation 的 withOutput 方法，传入了原本的 LogicalPlan 的 output	  
    }
  }

  /**
   * 使包含传入 LogicalPlan 的缓存数据失效
   */
  private[sql] def invalidateCache(plan: LogicalPlan): Unit = writeLock {
    cachedData.foreach {
	  // 只要某个 cachedData 包含了该子树，便会调用它的 InMemoryRelation 的 recache 方法
      case data if data.plan.collect { case p if p.sameResult(plan) => p }.nonEmpty =>
        data.cachedRepresentation.recache()
      case _ =>
    }
  }
}
```

经过一番阅读，我们了解到，SparkSQL 通过对 Analyzed Logical Plan 调用 useCachedData 方法，便会将执行计划树中与某个已缓存数据相吻合的子树替换为一个 `InMemoryRelation`。我们之前就接触过 Relation，它主要指的是 SQL 中 `FROM` 关键字指明的表名，所以这里的 `InMemoryRelation` 也可以理解为直接从内存中 SELECT FROM。在注册缓存时，`CacheManager` 利用了一些设置参数、表名、DataFrame 的 Physical Plan 来实例化一个 `InMemoryRelation`。

## InMemoryRelation

那我们就来看一下这个 `InMemoryRelation`：

```scala
private[sql] object InMemoryRelation {
  // CacheManager 就是应用这个方法来创建 InMemoryRelation 实例的
  def apply(
      useCompression: Boolean,
      batchSize: Int,
      storageLevel: StorageLevel,
      child: SparkPlan,
      tableName: Option[String]): InMemoryRelation =
    new InMemoryRelation(child.output, useCompression, batchSize, storageLevel, child, tableName)()
  // 并未对参数进行任何特别的处理，只是把一个 child.output 提取出来又传了进去	
}

// 暂不清楚这是什么，但它包含了一个 Array[Array[Byte]]，这个很有可能就是缓存数据保存在内存中的形式
private[sql] case class CachedBatch(buffers: Array[Array[Byte]], stats: Row)

private[sql] case class InMemoryRelation(
    output: Seq[Attribute],
    useCompression: Boolean,
    batchSize: Int,
    storageLevel: StorageLevel,
    child: SparkPlan,
    tableName: Option[String])(
	// 注意这里有个 CachedBatch 的 RDD，这个应该就是指这张表的缓存数据
    private var _cachedColumnBuffers: RDD[CachedBatch] = null,
    private var _statistics: Statistics = null,
    private var _batchStats: Accumulable[ArrayBuffer[Row], Row] = null)
  extends LogicalPlan with MultiInstanceRelation {
  // 果然 InMemoryRelation 继承自 LogicalPlan，但这个 MultiInstanceRelation 倒是个新名词

  private val batchStats: Accumulable[ArrayBuffer[Row], Row] =
    if (_batchStats == null) {
      child.sqlContext.sparkContext.accumulableCollection(ArrayBuffer.empty[Row])
    } else {
      _batchStats
    }

  // 暂不清楚是什么	
  val partitionStatistics = new PartitionStatistics(output)

  // 计算缓存数据的大小
  private def computeSizeInBytes = {
    val sizeOfRow: Expression =
	  // 需要先了解一下 BindReferences 是什么
      BindReferences.bindReference(
        output.map(a => partitionStatistics.forAttribute(a).sizeInBytes).reduce(Add),
        partitionStatistics.schema)

    batchStats.value.map(row => sizeOfRow.eval(row).asInstanceOf[Long]).sum
  }

  // 传播用的 statistics
  private def statisticsToBePropagated = if (_statistics == null) {
    val updatedStats = statistics
    if (_statistics == null) null else updatedStats
  } else {
    _statistics
  }

  // 重载了 Statistics 逻辑（原本的默认实现是左子 * 右子）
  override def statistics: Statistics = {
    if (_statistics == null) {
      if (batchStats.value.isEmpty) {
        // Underlying columnar RDD hasn't been materialized, no useful statistics information
        // available, return the default statistics.
        Statistics(sizeInBytes = child.sqlContext.conf.defaultSizeInBytes)
      } else {
        // Underlying columnar RDD has been materialized, required information has also been
        // collected via the `batchStats` accumulator, compute the final statistics,
        // and update `_statistics`.
        _statistics = Statistics(sizeInBytes = computeSizeInBytes)
        _statistics
      }
    } else {
      // Pre-computed statistics
      _statistics
    }
  }

  // If the cached column buffers were not passed in, we calculate them in the constructor.
  // As in Spark, the actual work of caching is lazy.
  if (_cachedColumnBuffers == null) {
    // 构建缓存
    buildBuffers()
  }

  // 重新缓存
  def recache(): Unit = {
    // 清空了缓存
    _cachedColumnBuffers.unpersist()
    _cachedColumnBuffers = null
	// 建立缓存
    buildBuffers()
  }

  // 建立缓存
  private def buildBuffers(): Unit = {
    // 注意：child 是传进来的那个 DataFrame 的 Physical Plan
    val output = child.output
	// 执行
    val cached = child.execute().mapPartitions { rowIterator =>
	  // 为每一个 Partition 都生成了一个 Iterator，想必之后会利用这些 Iterator 来访问缓存数据
      new Iterator[CachedBatch] {
	    // 这里我们就了解到，CachedBatch 表示的是一个 Partition 的缓存
        def next(): CachedBatch = {
		  // 这里对每个 Attribute 都生成了一个 ColumnBuilder
		  // 考虑到 SparkSQL 的缓存是以列存储的形式组织的，那么下一步大概就是要利用这些 ColumnBuilder 构建缓存了
          val columnBuilders = output.map { attribute =>
            val columnType = ColumnType(attribute.dataType)
            val initialBufferSize = columnType.defaultSize * batchSize
			// 这里看到 ColumnBuilder 本身包含的信息只是一些元数据
            ColumnBuilder(attribute.dataType, initialBufferSize, attribute.name, useCompression)
          }.toArray

          var rowCount = 0
		  // 遍历整个 Partition
          while (rowIterator.hasNext && rowCount < batchSize) {
            val row = rowIterator.next()

			// ...

			// 将该行的数据放入到各自的 ColumnBuilder 中   
            var i = 0
            while (i < row.length) {
              columnBuilders(i).appendFrom(row, i)
              i += 1
            }
            rowCount += 1
          }

		  // 不知道在干什么
          val stats = Row.merge(columnBuilders.map(_.columnStats.collectedStatistics) : _*)

          batchStats += stats
		  // 返回了该 Partition 的缓存数据
          CachedBatch(columnBuilders.map(_.build().array()), stats)
        }

        def hasNext: Boolean = rowIterator.hasNext
      }
    }.persist(storageLevel)
	// 将整个 RDD 缓存。注意：这个动作是 lazy 的

    cached.setName(tableName.map(n => s"In-memory table $n").getOrElse(child.toString))
    _cachedColumnBuffers = cached
  }

  // 利用传入的 output 新建一个实例
  def withOutput(newOutput: Seq[Attribute]): InMemoryRelation = {
    InMemoryRelation(
      newOutput, useCompression, batchSize, storageLevel, child, tableName)(
      _cachedColumnBuffers, statisticsToBePropagated, batchStats)
  }

  // 无 children，说到底它还是一个叶子节点
  override def children: Seq[LogicalPlan] = Seq.empty

  // 拷贝构造函数
  override def newInstance(): this.type = {
    new InMemoryRelation(
      output.map(_.newInstance()),
      useCompression,
      batchSize,
      storageLevel,
      child,
      tableName)(
      _cachedColumnBuffers,
      statisticsToBePropagated,
      batchStats).asInstanceOf[this.type]
  }

  def cachedColumnBuffers: RDD[CachedBatch] = _cachedColumnBuffers

  override protected def otherCopyArgs: Seq[AnyRef] =
    Seq(_cachedColumnBuffers, statisticsToBePropagated, batchStats)

  // 移除缓存	
  private[sql] def uncache(blocking: Boolean): Unit = {
    // 不清楚在干啥
    Accumulators.remove(batchStats.id)
	// 移除了缓存数据
    cachedColumnBuffers.unpersist(blocking)
    _cachedColumnBuffers = null
  }
}
```

目前来讲，我们已经能看懂大部分的代码。其中出现了一个 `ColumnBuilder`，正是用来构建列缓存的类。那我们去看看这个 `ColumnBuilder`：

```scala
// 完蛋了，这居然只是个接口
private[sql] trait ColumnBuilder {
  // 初始化
  def initialize(initialSize: Int, columnName: String = "", useCompression: Boolean = false)

  // 将该行指定的元素放入到 ColumnBuilder 
  def appendFrom(row: Row, ordinal: Int)

  // Statistics Information
  def columnStats: ColumnStats

  // 返回最终的列缓存
  def build(): ByteBuffer
}
```

我们先不着急看它的实现类，我们先去看看它的实例化方法：

```scala
private[sql] object ColumnBuilder {
  // 默认的初始缓存大小，1MB
  val DEFAULT_INITIAL_BUFFER_SIZE = 1024 * 1024

  // 保证空余空间。这里我们就可以看出来，ByteBuffer 就是最底层的缓存数据容器了
  private[columnar] def ensureFreeSpace(orig: ByteBuffer, size: Int) = {
    // 有足够的空闲空间，则不需要做任何操作
    if (orig.remaining >= size) {
      orig
    } else {
	  // 空闲空间不足，尝试扩充 ByteBuffer
      // grow in steps of initial size
      val capacity = orig.capacity()
      val newSize = capacity + size.max(capacity / 8 + 1)
      val pos = orig.position()

	  // 新建一个更大的 ByteBuffer 并放入原 ByteBuffer 的数据
      ByteBuffer
        .allocate(newSize)
        .order(ByteOrder.nativeOrder())
        .put(orig.array(), 0, pos)
    }
  }

  // InMemoryRelation 就是通过这个方法实例化 ColumnBuilder 的
  def apply(
      dataType: DataType,
      initialSize: Int = 0,
      columnName: String = "",
      useCompression: Boolean = false): ColumnBuilder = {
	// 如此看来，ColumnBuilder 是根据传入的数据类型来实例化不同的子类
    val builder: ColumnBuilder = dataType match {
      case IntegerType => new IntColumnBuilder
      case LongType => new LongColumnBuilder
      case FloatType => new FloatColumnBuilder
      case DoubleType => new DoubleColumnBuilder
      case BooleanType => new BooleanColumnBuilder
      case ByteType => new ByteColumnBuilder
      case ShortType => new ShortColumnBuilder
      case StringType => new StringColumnBuilder
      case BinaryType => new BinaryColumnBuilder
      case DateType => new DateColumnBuilder
      case TimestampType => new TimestampColumnBuilder
      case DecimalType.Fixed(precision, scale) if precision < 19 =>
        new FixedDecimalColumnBuilder(precision, scale)
      case _ => new GenericColumnBuilder
    }
    // 初始化后便实例化完毕
    builder.initialize(initialSize, columnName, useCompression)
    builder
  }
}
```

由此看来，`ColumnBuilder` 的工作是构建一个列缓存，但列缓存本身由一个 `ByteBuffer` 表示，所以 `build` 方法返回的是一个 `ByteBuffer`。`ByteBuffer` 实际上是一个抽象类，它来自 `java.nio` 包。通过调用 `ByteBuffer` 的静态方法来获取其子类实例可以让外部调用者不去在意其底部的内存分配方式。

实际上，`ColumnBuilder` 的子类们有着极为复杂的继承关系。画成类图大致如下：

![](/img/Catalyst-Adv@2.jpg)

由此看来，我们最好不要再往下深究。

除了 `ColumnBuilder`，我们还需要关注出现在 `InMemoryRelation` 中的 `PartitionStatistics`。我们来看看它的代码：

```scala
// 实例化时，InMemoryRelation 会把 Physical Plan 的 output 作为参数传入
private[sql] class PartitionStatistics(tableSchema: Seq[Attribute]) extends Serializable {
  // 这里同时设定了它的两个变量
  val (forAttribute, schema) = {
    // 这里形成了一个从 Attribute 到它的 ColumnStatisticsSchema 实例的映射
    val allStats = tableSchema.map(a => a -> new ColumnStatisticsSchema(a))
    (AttributeMap(allStats), allStats.map(_._2.schema).foldLeft(Seq.empty[Attribute])(_ ++ _))
	// 这里前者是一个从 Attribute.exprId 到 ColumnStatisticsSchema 的映射
    // 后者则是 ColumnStatisticsSchema 们的 schema 变量的首尾相连
  }
}

// 实际上 ColumnStatisticsSchema 的定义就在这个类的上面
private[sql] class ColumnStatisticsSchema(a: Attribute) extends Serializable {
  // AttributeReference 是 Attribute 的一个实现类，是一个 case class
  val upperBound = AttributeReference(a.name + ".upperBound", a.dataType, nullable = true)()
  val lowerBound = AttributeReference(a.name + ".lowerBound", a.dataType, nullable = true)()
  val nullCount = AttributeReference(a.name + ".nullCount", IntegerType, nullable = false)()
  val count = AttributeReference(a.name + ".count", IntegerType, nullable = false)()
  val sizeInBytes = AttributeReference(a.name + ".sizeInBytes", LongType, nullable = false)()

  // 这里看到对于每个传入的 Attribute，生成的 schema 实际上就是这样 5 个元素组成的 Seq
  // 从上面可以看到，这其中的信息包括了 Attribute 的名字、类型、上下界、是否可为 null、大小，以及一个不知道指代什么的 count
  val schema = Seq(lowerBound, upperBound, nullCount, count, sizeInBytes)
  // 该类的名字叫 ColumnStatisticsSchema，从它把一个 Attribute 拆成 5 个 Attribute 的行为来看，它确实是一个 Schema，
  // 而这五个元素应该就是这个 Column 的 Statistics 了
}
```

这里只能看出，`PartitionStatistics` 倒是做了个很奇怪的工作，而且 `InMemoryRelation` 再没用到过它。也许后面会有什么地方用到它。

至此，我们就知道，在实例化 `InMemoryRelation` 的时候就已经完成了 `RDD.persist` 的动作，但我们也要知道 RDD 的缓存本身是 lazy 的，即使调用了这个 `persist` 方法，真正的缓存动作是还没有执行的。

接下来我们开始看看 SparkSQL 会如何获取这些缓存数据。

## InMemoryColumnarTableScan

之前我们学习到，Optimized Logical Plan 由 `SparkPlanner` 转变为 Physical Plan，而 `SparkPlanner` 所应用的转换策略都位于 `SparkStrategies` 中。
那么我们就去看一下：

```scala
// 经搜索发现，InMemoryRelation 仅在此处出现过
object InMemoryScans extends Strategy {
  def apply(plan: LogicalPlan): Seq[SparkPlan] = plan match {
    // 这里对传入的 plan 调用了 PhysicalOperation 的 unapply 方法
    case PhysicalOperation(projectList, filters, mem: InMemoryRelation) =>
      pruneFilterProject(
        projectList,
        filters,
        identity[Seq[Expression]], // All filters still need to be evaluated.
        InMemoryColumnarTableScan(_, filters, mem)) :: Nil
    case _ => Nil
  }
}
```

那我们先去看看这个 `PhysicalOperation`：

```scala
object PhysicalOperation extends PredicateHelper {
  type ReturnType = (Seq[NamedExpression], Seq[Expression], LogicalPlan)

  def unapply(plan: LogicalPlan): Option[ReturnType] = {
    val (fields, filters, child, _) = collectProjectsAndFilters(plan)
	// 从之前 InMemoryScans 的代码可知，InMemoryRelation 指的是这里的 child，也就是 collectProjectsAndFilters 的第三个结果
    Some((fields.getOrElse(child.output), filters, child))
  }

  // 我们只考虑传入的 LogicalPlan 是个 InMemoryRelation 的情况
  def collectProjectsAndFilters(plan: LogicalPlan):
      (Option[Seq[NamedExpression]], Seq[Expression], LogicalPlan, Map[Attribute, Expression]) =
    plan match {
	  // Project 是个 case class，InMemoryRelation 不会进入这个分支
      case Project(fields, child) =>
        val (_, filters, other, aliases) = collectProjectsAndFilters(child)
        val substitutedFields = fields.map(substitute(aliases)).asInstanceOf[Seq[NamedExpression]]
        (Some(substitutedFields), filters, other, collectAliases(substitutedFields))

	  // Filter 同样是个 case class
      case Filter(condition, child) =>
        val (fields, filters, other, aliases) = collectProjectsAndFilters(child)
        val substitutedCondition = substitute(aliases)(condition)
        (fields, filters ++ splitConjunctivePredicates(substitutedCondition), other, aliases)

	  // 毫无疑问，InMemoryRelation 会进入这个分支，作为第三个结果被原封不动地返回，同时前两个结果都是空	
      case other =>
        (None, Nil, other, Map.empty)
    }
	
  // ...

}  
```

那么回到刚才的 Strategy：

```scala
object InMemoryScans extends Strategy {
  def apply(plan: LogicalPlan): Seq[SparkPlan] = plan match {
    case PhysicalOperation(projectList, filters, mem: InMemoryRelation) =>
	  // 也就是说到了这里，projectList 和 filters 都是空
      pruneFilterProject(
        projectList,
        filters,
        identity[Seq[Expression]], // All filters still need to be evaluated.
        InMemoryColumnarTableScan(_, filters, mem)) :: Nil
		// 这里构建了一个 InMemoryColumnarTableScan 实例
    case _ => Nil
  }
}
```

这下好像找到点眉头了。那么我们来看一下这个 `InMemoryColumnarTableScan`：

```scala
private[sql] case class InMemoryColumnarTableScan(
    attributes: Seq[Attribute],
    predicates: Seq[Expression],
    relation: InMemoryRelation)
  extends LeafNode {
  // 它通过 LeafNode 继承自 SparkPlan，由此可以确定这个类正是 InMemoryRelation 对应的 Physical Plan

  override def output: Seq[Attribute] = attributes

  // 这里再次用到了 InMemoRelation 那个很奇怪的变量
  // 这个变量的 forAttribute 是一个基于 Attribute.exprId 的从 Attribute 到 ColumnStatisticsSchema 的映射
  private def statsFor(a: Attribute) = relation.partitionStatistics.forAttribute(a)

  // ...

  // SparkPlan 的入口方法
  protected override def doExecute(): RDD[Row] = {
    // ...

    // 这个 cachedColumnBuffers 就是之前 InMemoryRelation 构建好的 RDD[CachedBatch]
    relation.cachedColumnBuffers.mapPartitions { cachedBatchIterator =>
      // ...

      // 找出需要的列的索引以及数据类型
      val (requestedColumnIndices, requestedColumnDataTypes) = if (attributes.isEmpty) {
        // 未传入任何属性，返回默认体积最小的列
        val (narrowestOrdinal, narrowestDataType) =
          relation.output.zipWithIndex.map { case (a, ordinal) =>
            // Index  ->  DataType
            ordinal -> a.dataType
          } minBy { case (_, dataType) =>
            ColumnType(dataType).defaultSize
          }
        Seq(narrowestOrdinal) -> Seq(narrowestDataType)
      } else {
        // 否则，根据传入的 exprId 找到对应的 Index
        attributes.map { a =>
          relation.output.indexWhere(_.exprId == a.exprId) -> a.dataType
        }.unzip
      }

      val nextRow = new SpecificMutableRow(requestedColumnDataTypes)

      // 将 CachedBatch 转换为 Row
      def cachedBatchesToRows(cacheBatches: Iterator[CachedBatch]): Iterator[Row] = {
        val rows = cacheBatches.flatMap { cachedBatch =>
          // 创建 ColumnAccessor 读取缓存数据
          val columnAccessors = requestedColumnIndices.map { batchColumnIndex =>
            ColumnAccessor(
              relation.output(batchColumnIndex).dataType,
              ByteBuffer.wrap(cachedBatch.buffers(batchColumnIndex)))
          }

          // 通过 ColumnAccessor 将数据解压至 Row
          new Iterator[Row] {
            private[this] val rowLen = nextRow.length
            override def next(): Row = {
              var i = 0
              while (i < rowLen) {
                columnAccessors(i).extractTo(nextRow, i)
                i += 1
              }
              if (attributes.isEmpty) Row.empty else nextRow
            }

            override def hasNext: Boolean = columnAccessors(0).hasNext
          }
        }

        if (rows.hasNext && enableAccumulators) {
          readPartitions += 1
        }

        rows
      }

      // 需要扫描的 CachedBatch
      val cachedBatchesToScan =
	    // 该参数默认为 false
        if (inMemoryPartitionPruningEnabled) {
          cachedBatchIterator.filter { cachedBatch =>
            if (!partitionFilter(cachedBatch.stats)) {
              def statsString: String = relation.partitionStatistics.schema
                .zip(cachedBatch.stats.toSeq)
                .map { case (a, s) => s"${a.name}: $s" }
                .mkString(", ")
              logInfo(s"Skipping partition based on stats $statsString")
              false
            } else {
              if (enableAccumulators) {
                readBatches += 1
              }
              true
            }
          }
        } else {
          // 默认扫描所有 CachedBatch
          cachedBatchIterator
        }

      cachedBatchesToRows(cachedBatchesToScan)
    }
  }
}
```

至此其实我们就全部理解了。
