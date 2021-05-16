---
title: Spark Catalyst 进阶：Join
category: Spark
tags:
  - Spark
  - SparkSQL
date: 2015-08-24
toc: true
---

在之前的文章中，我们已经了解了 SparkSQL 把 SQL 语句变为 SparkJob 的过程。这个过程我们只是做了一个 Overview，具体不同的语句会变为怎样的 Job 我们并未一一列举。实际上列举起来是一件相当大工程的事。

在那么多的 SQL 操作中，有那么一个操作十分常用，但又十分耗时，那就是 Join 操作。在这篇文章里，我们将深入探讨 SparkSQL 会对不同的 Join 做出怎样的操作。

<!-- more -->

## 什么是 Join ？

在 SQL 中，Join 用于根据两个或多个表中的列之间的关系，从这些表中查询数据。表达 Join 的方式有两种：

```sql
SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo
FROM Persons, Orders
WHERE Persons.Id_P = Orders.Id_P;

-- 或

SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo
FROM Persons
INNER JOIN Orders
ON Persons.Id_P = Orders.Id_P
ORDER BY Persons.LastName;
```

实际上，第一种方式更像是 SQL 的语法糖，理论上而言我们更偏向后一种写法。这种使用关键字 `JOIN` 的规范写法使用 `ON` 关键字表明了 Join 的条件，同时在 `JOIN` 前面加上了一个 `INNER` 来表明要执行的 Join 的类型。SparkSQL 支持的 SQL 操作有以下几种：

| Join 类型 | 效果 |
| --- | --- |
| Inner Join | 使用比较运算符根据每个表共有的列的值匹配两个表中的行 |
| Left Semi Join | 对于左表的每个键值，在右表中找到第一个匹配的键值便返回 |
| Left Outer Join | 左向外联接的结果集包括 LEFT OUTER 子句中指定的左表的所有行，而不仅仅是联接列所匹配的行。如果左表的某行在右表中没有匹配行，则在相关联的结果集行中右表的所有选择列表列均为空值
| Right Outer Join | 右向外联接是左向外联接的反向联接。将返回右表的所有行。如果右表的某行在左表中没有匹配行，则将为左表返回空值
| Full Outer Join | 完整外部联接返回左表和右表中的所有行。当某行在另一个表中没有匹配行时，则另一个表的选择列表列包含空值。如果表之间有匹配行，则整个结果集行包含基表的数据值 |

接下来我们就开始看看 SparkSQL 会怎么处理这些 JOIN 语句。

## Parser

首先 JOIN 语句要变成 Logical Plan 就需要先经过 Parser。根据我们之前学习过的内容来判断，JOIN 语句相关的解析规则在 `SqlParser` 类中：

```scala
class SqlParser extends AbstractSparkSQLParser with DataTypeParser {

  // ...
  
  // 直接查找关键字 `Join`，发现在 relations 中创建了这样一个实例
  protected lazy val relations: Parser[LogicalPlan] =
  // 我们知道 relation 指代的是一张表，那么在遇到像 `Table1, Table2` 这样的语句就会进入这里
    ( relation ~ rep1("," ~> relation) ^^ {
        case r1 ~ joins => joins.foldLeft(r1) { case(lhs, r) => Join(lhs, r, Inner, None) } }
		// 对于这样的语句，这里的做法是 foldLeft 地形成了一个由 Inner Join 组成的单边二叉树
    | relation
    )
	
  protected lazy val select: Parser[LogicalPlan] =
    SELECT ~> DISTINCT.? ~
      repsep(projection, ",") ~
	  // FROM 这里引用了上面的 relations，由此可见 SparkSQL 支持我们提到的第一种 SQL 写法，产生的是一个 Inner Join
      (FROM   ~> relations).? ~
      (WHERE  ~> expression).? ~
      (GROUP  ~  BY ~> rep1sep(expression, ",")).? ~
      (HAVING ~> expression).? ~
      sortType.? ~
      (LIMIT  ~> expression).? ^^ {
        case d ~ p ~ r ~ f ~ g ~ h ~ o ~ l =>
          val base = r.getOrElse(OneRowRelation)
          val withFilter = f.map(Filter(_, base)).getOrElse(base)
          val withProjection = g
            .map(Aggregate(_, assignAliases(p), withFilter))
            .getOrElse(Project(assignAliases(p), withFilter))
          val withDistinct = d.map(_ => Distinct(withProjection)).getOrElse(withProjection)
          val withHaving = h.map(Filter(_, withDistinct)).getOrElse(withDistinct)
          val withOrder = o.map(_(withHaving)).getOrElse(withHaving)
          val withLimit = l.map(Limit(_, withOrder)).getOrElse(withOrder)
          withLimit
      }

  // ...	  
	  
  // Join 实例另一次出现的位置在这里	  
  protected lazy val joinedRelation: Parser[LogicalPlan] =
  // 这里对应的语句便是 JOIN `table` [ON ...]
    relationFactor ~ rep1(joinType.? ~ (JOIN ~> relationFactor) ~ joinConditions.?) ^^ {
      case r1 ~ joins =>
        joins.foldLeft(r1) { case (lhs, jt ~ rhs ~ cond) =>
          Join(lhs, rhs, joinType = jt.getOrElse(Inner), cond)
		  // 注意这里 Join 类型在未指定时为 Inner Join。同时注意这里的 cond 是个 Option[Expression]
        }
		// 这里同样是 foldLeft 地形成了一个 Join 的二叉树
    }

  protected lazy val joinConditions: Parser[Expression] =
    ON ~> expression

  // 通过在 JOIN 关键字前加入如下关键字可以改变 Join 的类型	
  protected lazy val joinType: Parser[JoinType] =
    ( INNER           ^^^ Inner
    | LEFT  ~ SEMI    ^^^ LeftSemi
    | LEFT  ~ OUTER.? ^^^ LeftOuter
    | RIGHT ~ OUTER.? ^^^ RightOuter
    | FULL  ~ OUTER.? ^^^ FullOuter
    )

  // ...	

}
```

由此，输入到 SparkSQL 中的 SQL 语句与 Join 类型的关系可以总结如下：

| Join 类型 | SQL 语句 |
| --- | --- |
| Inner Join | `SELECT ... FROM table1, table2[, ...] ...`<hr />`SELECT ... FROM ... JOIN ... [ON ...]` |
| Left Semi Join | `SELECT ... FROM ... LEFT SEMI JOIN ... [ON ...]` |
| Left Outer Join | `SELECT ... FROM ... LEFT [OUTER] JOIN ... [ON ...]` |
| Right Outer Join | `SELECT ... FROM ... RIGHT [OUTER] JOIN ... [ON ...]` |
| Full Outer Join | `SELECT ... FROM ... FULL [OUTER] JOIN ... [ON ...]` |

接下来我们来看一下表示 Logical Plan 的 `Join` 类：

```scala
case class Join(
  left: LogicalPlan,
  right: LogicalPlan,
  joinType: JoinType, // JoinType 包括 5 个 case object，对应 5 个 Join 类型
  condition: Option[Expression]) extends BinaryNode {

  override def output: Seq[Attribute] = {
    joinType match {
      case LeftSemi =>
        left.output
      case LeftOuter =>
        left.output ++ right.output.map(_.withNullability(true))
      case RightOuter =>
        left.output.map(_.withNullability(true)) ++ right.output
      case FullOuter =>
        left.output.map(_.withNullability(true)) ++ right.output.map(_.withNullability(true))
      case _ =>
        left.output ++ right.output
    }
  }

  // 防止用户构成了一些根本无法 Join 的左右子树
  private def selfJoinResolved: Boolean = left.outputSet.intersect(right.outputSet).isEmpty

  override lazy val resolved: Boolean = {
    childrenResolved && !expressions.exists(!_.resolved) && selfJoinResolved
  }
}
```

Join 的 Logical Plan 本身只有一个类，显得十分简单。

## Analyzer

在通过 Parser 得到 Unresolved Logical Plan 以后，下一步就轮到 Analyzer 了。经过之前的学习，我们知道 Analyzer 所应用的全部规则都位于 `Analyzer.scala` 中：

```scala
class Analyzer(
    catalog: Catalog,
    registry: FunctionRegistry,
    conf: CatalystConf,
    maxIterations: Int = 100)
  extends RuleExecutor[LogicalPlan] with HiveTypeCoercion with CheckAnalysis {
  
  // ...
  
  object ResolveReferences extends Rule[LogicalPlan] {
    def apply(plan: LogicalPlan): LogicalPlan = plan transformUp {
	
	  // ...
	
	  // 同样，经过搜索，Join 仅出现在该分支中
	  // 该处用于处理之前的 selfJoinResolved 为 false 的情况
      case j @ Join(left, right, _, _) if left.outputSet.intersect(right.outputSet).nonEmpty =>
	    // 找出冲突的 Attribute
        val conflictingAttributes = left.outputSet.intersect(right.outputSet)
        logDebug(s"Conflicting attributes ${conflictingAttributes.mkString(",")} in $j")

        // ...
		
		// 根据右子树类型的不同将右子树进行了替换
        val newRight = right transformUp {
          case r if r == oldRelation => newRelation
        } transformUp {
          case other => other transformExpressions {
            case a: Attribute => attributeRewrites.get(a).getOrElse(a)
          }
        }
        j.copy(right = newRight)
		
		// ...
	}
  // ...
}	
```

看起来，Analyzer 对 Join 树做的操作仅在于解决一些很奇怪的属性冲突。这种问题属于少数派，相信大多数时候 SparkSQL 都不会进入这个分支。

## Optimizer

接下来我们来看一下 Optimizer 是否有与 Join 相关的优化逻辑：

```scala
// Join 首先出现在了这个 Rule 中
object ColumnPruning extends Rule[LogicalPlan] {
  
  // 对 c 进行剪枝，只需要包含在 allReferences 中的属性
  // 通过在 c 之上加上一个 Project 计划来实现
  private def prunedChild(c: LogicalPlan, allReferences: AttributeSet) =
    if ((c.outputSet -- allReferences.filter(c.outputSet.contains)).nonEmpty) {
      Project(allReferences.filter(c.outputSet.contains).toSeq, c)
    } else {
      c
    }

  def apply(plan: LogicalPlan): LogicalPlan = plan transform {
    // ...

    // Join 后只 SELECT 了少部分属性
    case Project(projectList, Join(left, right, joinType, condition)) =>
      // Collect the list of all references required either above or to evaluate the condition.
      val allReferences: AttributeSet =
        AttributeSet(
          projectList.flatMap(_.references.iterator)) ++
          condition.map(_.references).getOrElse(AttributeSet(Seq.empty))
	  // 包括 SELECT 了的属性以及出现在了 ON 中的属性  

      /** Applies a projection only when the child is producing unnecessary attributes */
      def pruneJoinChild(c: LogicalPlan): LogicalPlan = prunedChild(c, allReferences)
      // 先对左右子树进行 Project 再 Join
      Project(projectList, Join(pruneJoinChild(left), pruneJoinChild(right), joinType, condition))

    // 消除 LeftSemiJoin 中右子树中不必要的属性
    case Join(left, right, LeftSemi, condition) =>
      // Collect the list of all references required to evaluate the condition.
      val allReferences: AttributeSet =
        condition.map(_.references).getOrElse(AttributeSet(Seq.empty))
      // 包括出现在 ON 中的属性
      Join(left, prunedChild(right, allReferences), LeftSemi, condition)

    // ...
  }
}
```

由此可见，Optimizer 对 Join 操作做出的优化，在于将 SELECT 以及 ON 所包含的属性考虑进去后，将左右子树中不需要的属性先删去再 Join，以此来优化 Join 的性能。

至此，Logical Plan 的处理过程就全部完成了。接下来就是重中之重了。

## Planner

我们知道，Planner 将 Optimized Logical Plan 变为 Physical Plan 的规则全都位于 `SparkStrategies` 类中，那我们直接看吧：

```scala
private[sql] abstract class SparkStrategies extends QueryPlanner[SparkPlan] {
  self: SQLContext#SparkPlanner =>
  
  object LeftSemiJoin extends Strategy with PredicateHelper {
    def apply(plan: LogicalPlan): Seq[SparkPlan] = plan match {
	  // ExtractEquiJoinKeys 用于将出现在 condition 的相等条件中的属性拆分出来
	  // leftKeys 和 rightKeys 分别对应属于左子树和属于右子树的 Attribute
	  // 相同索引值的 leftKey 和 rightKey 构成原本的 condition 中的一对相等条件，即 `leftKey(i) = rightKey(i)`
	  // 剩余的非相等条件会被放入到结果的 condition 中
	  // 该 unapply 函数当且仅当 leftKeys 和 rightKeys 不为空时会有返回
      case ExtractEquiJoinKeys(LeftSemi, leftKeys, rightKeys, condition, left, right)
	    // 该参数默认为 10 * 1024 * 1024，即 10mb
        if sqlContext.conf.autoBroadcastJoinThreshold > 0 &&
          right.statistics.sizeInBytes <= sqlContext.conf.autoBroadcastJoinThreshold =>
		// 右子树 <= 10 MB
        // 产生一个 BroadcastLeftSemiJoinHash 实例		
        val semiJoin = joins.BroadcastLeftSemiJoinHash(
          leftKeys, rightKeys, planLater(left), planLater(right))
		// 再把剩下的非相等条件以 Filter 的形式覆盖上去  
        condition.map(Filter(_, semiJoin)).getOrElse(semiJoin) :: Nil
      case ExtractEquiJoinKeys(LeftSemi, leftKeys, rightKeys, condition, left, right) =>
	    // 情况基本同上，只是这里改为使用 LeftSemiJoinHash 实例
        val semiJoin = joins.LeftSemiJoinHash(
          leftKeys, rightKeys, planLater(left), planLater(right))
        condition.map(Filter(_, semiJoin)).getOrElse(semiJoin) :: Nil
      // no predicate can be evaluated by matching hash keys
      case logical.Join(left, right, LeftSemi, condition) =>
	    // 剩下的 Left Semi Join 就直接变成 LeftSemiJoinBNL 实例
        joins.LeftSemiJoinBNL(planLater(left), planLater(right), condition) :: Nil
      case _ => Nil
    }
  }
  
  // 到这里，Left Semi Join 已经全部由上面那个 Strategy 变成 Physical Plan 了
  object HashJoin extends Strategy with PredicateHelper {

    private[this] def makeBroadcastHashJoin(
        leftKeys: Seq[Expression],
        rightKeys: Seq[Expression],
        left: LogicalPlan,
        right: LogicalPlan,
        condition: Option[Expression],
        side: joins.BuildSide) = {
		// 产生一个 BroadcastHashJoin 实例，并用 Filter 把剩余的 condition 盖了上去
      val broadcastHashJoin = execution.joins.BroadcastHashJoin(
        leftKeys, rightKeys, side, planLater(left), planLater(right))
      condition.map(Filter(_, broadcastHashJoin)).getOrElse(broadcastHashJoin) :: Nil
    }

    def apply(plan: LogicalPlan): Seq[SparkPlan] = plan match {
      case ExtractEquiJoinKeys(Inner, leftKeys, rightKeys, condition, left, right)
        if sqlContext.conf.autoBroadcastJoinThreshold > 0 &&
           right.statistics.sizeInBytes <= sqlContext.conf.autoBroadcastJoinThreshold =>
		// Inner Join，ON 里有相等条件，右子树不算大 -> BroadcastHashJoin
        makeBroadcastHashJoin(leftKeys, rightKeys, left, right, condition, joins.BuildRight)

      case ExtractEquiJoinKeys(Inner, leftKeys, rightKeys, condition, left, right)
        if sqlContext.conf.autoBroadcastJoinThreshold > 0 &&
           left.statistics.sizeInBytes <= sqlContext.conf.autoBroadcastJoinThreshold =>
		   // Inner Join，ON 里有相等条件，左子树不算大 -> BroadcastHashJoin
          makeBroadcastHashJoin(leftKeys, rightKeys, left, right, condition, joins.BuildLeft)

      case ExtractEquiJoinKeys(Inner, leftKeys, rightKeys, condition, left, right)
        if sqlContext.conf.sortMergeJoinEnabled =>
		// Inner Join，ON 里有相等条件，sortMergeJoin 设置被开启 -> SortMergeJoin
        val mergeJoin =
          joins.SortMergeJoin(leftKeys, rightKeys, planLater(left), planLater(right))
        condition.map(Filter(_, mergeJoin)).getOrElse(mergeJoin) :: Nil

      case ExtractEquiJoinKeys(Inner, leftKeys, rightKeys, condition, left, right) =>
        val buildSide =
          if (right.statistics.sizeInBytes <= left.statistics.sizeInBytes) {
            joins.BuildRight
          } else {
            joins.BuildLeft
          }
		// Inner Join，ON 里有相等条件 -> ShuffledHashJoin，以较小的一边作为 buildSide
        val hashJoin = joins.ShuffledHashJoin(
          leftKeys, rightKeys, buildSide, planLater(left), planLater(right))
        condition.map(Filter(_, hashJoin)).getOrElse(hashJoin) :: Nil

      case ExtractEquiJoinKeys(joinType, leftKeys, rightKeys, condition, left, right) =>
	  // ON 里有相等条件 -> HashOuterJoin
        joins.HashOuterJoin(
          leftKeys, rightKeys, joinType, condition, planLater(left), planLater(right)) :: Nil

      case _ => Nil
    }
  }
  
  // ...
  
  object CartesianProduct extends Strategy {
    def apply(plan: LogicalPlan): Seq[SparkPlan] = plan match {
      case logical.Join(left, right, _, None) =>
	    // 没有 ON 语句 -> CartesianProduct
        execution.joins.CartesianProduct(planLater(left), planLater(right)) :: Nil
      case logical.Join(left, right, Inner, Some(condition)) =>
	    // Inner Join，有 ON 语句 -> CartesianProduct 再盖一个 Filter
        execution.Filter(condition,
          execution.joins.CartesianProduct(planLater(left), planLater(right))) :: Nil
      case _ => Nil
    }
  }
  
  object BroadcastNestedLoopJoin extends Strategy {
    def apply(plan: LogicalPlan): Seq[SparkPlan] = plan match {
      case logical.Join(left, right, joinType, condition) =>
        val buildSide =
          if (right.statistics.sizeInBytes <= left.statistics.sizeInBytes) {
            joins.BuildRight
          } else {
            joins.BuildLeft
          }
		// 剩下的 JOIN -> 以较小一侧为 buildSide 的 BroadcastNestedLoopJoin
        joins.BroadcastNestedLoopJoin(
          planLater(left), planLater(right), buildSide, joinType, condition) :: Nil
      case _ => Nil
    }
  }
  
  // ...
  
}  
```

通过阅读上述代码，我们找到了如下几个与 JOIN 有关的 SparkPlan：

<ul>
  <li>`BroadcastLeftSemiJoinHash`：Left Semi Join，ON 中存在相等条件，右子树小于阈值（默认 10MB）</li>
  <li>`LeftSemiJoinHash`：Left Semi Join，ON 中存在相等条件</li>
  <li>`LeftSemiJoinBNL`：Left Semi Join</li>
  <li>`BroadcastHashJoin`：Inner Join，ON 里有相等条件，左子树或右子树小于阈值（默认 10MB）。以较小的一侧为 BuildSide</li>
  <li>`SortMergeJoin`：Inner Join，ON 里有相等条件，sortMergeJoin 设置被开启</li>
  <li>`ShuffledHashJoin`：Inner Join，ON 里有相等条件。以较小的一侧为 buildSide。</li>
  <li>`HashOuterJoin`：ON 里有相等条件</li>
  <li>`CartesianProduct`：Inner Join，有 ON 语句</li>
  <li>`CartesianProduct`：没有 ON 语句</li>
  <li>`BroadcastNestedLoopJoin`：剩下的都是它</li>
</ul>

足足 10 种用于 Join 的 Physical Plan。看来 SparkSQL 也知道这是最关键的操作。接下来我们逐个解析这些 Plan。

## Physical Plan

### BroadcastLeftSemiJoinHash

准入条件：Left Semi Join，ON 中存在相等条件，右子树小于阈值（默认 10MB）

```scala
case class BroadcastLeftSemiJoinHash(
    leftKeys: Seq[Expression],
    rightKeys: Seq[Expression],
    left: SparkPlan,
    right: SparkPlan) extends BinaryNode with HashJoin {
    // 继承自 HashJoin
    // ...
}
```

好，在看之前我们先看看 `HashJoin`：

```scala
trait HashJoin {
  self: SparkPlan =>

  // 这些成员大部分由子类的构造函数传入
  val leftKeys: Seq[Expression]
  val rightKeys: Seq[Expression]
  val buildSide: BuildSide  // 只有两个子类 case object：BuildLeft 和 BuildRight
  val left: SparkPlan
  val right: SparkPlan

  // buildPlan 为 buildSide 指定的那边的 SparkPlan，streamedPlan 则为剩下那个
  protected lazy val (buildPlan, streamedPlan) = buildSide match {
    case BuildLeft => (left, right)
    case BuildRight => (right, left)
  }

  // buildKeys 为 buildSide 指定的那边的 keys，streamedKeys 则为剩下那边的 keys
  protected lazy val (buildKeys, streamedKeys) = buildSide match {
    case BuildLeft => (leftKeys, rightKeys)
    case BuildRight => (rightKeys, leftKeys)
  }

  override def output: Seq[Attribute] = left.output ++ right.output

  // abstract class Projection extends (Row => Row)
  // 根据 key 和 output 生成了一个 key generator
  // 子类会使用这个 generator 为每个 Row 生成一个 key(也是一个 Row)并放入到 HashSet 或 HashMap
  // 想必这个 key 应该实现了比较高效的 hashCode 方法
  @transient protected lazy val buildSideKeyGenerator: Projection =
    newProjection(buildKeys, buildPlan.output)
  
  // 同理
  @transient protected lazy val streamSideKeyGenerator: () => MutableProjection =
    newMutableProjection(streamedKeys, streamedPlan.output)

  // 直接看比较复杂，等用到时我们再进行解析
  protected def hashJoin(streamIter: Iterator[Row], hashedRelation: HashedRelation): Iterator[Row] = {
    // ...
  }
}
```

好，我们再回到 `BroadcastLeftSemiJoinHash`：

```scala
case class BroadcastLeftSemiJoinHash(
    leftKeys: Seq[Expression],
    rightKeys: Seq[Expression],
    left: SparkPlan,
    right: SparkPlan) extends BinaryNode with HashJoin {

  // 以右子树为 buildSide
  override val buildSide: BuildSide = BuildRight
  
  // 输出属性集与左子树相同
  override def output: Seq[Attribute] = left.output

  // SparkPlan 入口方法
  protected override def doExecute(): RDD[Row] = {
    // 获取右子树结果集
    val buildIter = buildPlan.execute().map(_.copy()).collect().toIterator
    
	val hashSet = new java.util.HashSet[Row]()
    var currentRow: Row = null
    // 利用右子树结果集构建一个 key 的 HashSet
    while (buildIter.hasNext) {
      currentRow = buildIter.next()
	  // 利用 buildSideKeyGenerator 为右子树结果集的每个 Row 都生成一个 key
      val rowKey = buildSideKeyGenerator(currentRow)
      if (!rowKey.anyNull) {
        val keyExists = hashSet.contains(rowKey)
        if (!keyExists) {
		  // key 们放入到 hashSet 中
          hashSet.add(rowKey)
        }
      }
    }

	// 将 hashSet 广播出去
    val broadcastedRelation = sparkContext.broadcast(hashSet)

    streamedPlan.execute().mapPartitions { streamIter =>
	  // 利用 streamSideKeyGenerator 为左子树的 Row 生成 key
      val joinKeys = streamSideKeyGenerator()
      streamIter.filter(current => {
        !joinKeys(current).anyNull && broadcastedRelation.value.contains(joinKeys.currentValue)
		// 在之前的 hashSet 中包含本 key，则放入到结果集中
      })
    }
  }
}
```

首先，在实例化结果 RDD 的时候，右子树的结果就已经计算完毕并被收集回来，将右子树的 Row 变为 key 并放入 HashSet 再广播出去的动作将由 Master 独自完成。在结果 RDD 的 `collect` 或其他方法被调用的时候，左子树的每个 Partition 同样会将自己的 Row 变为 key，并与之前广播的 HashSet 中的元素进行比对，返回 key 存在于 HashSet 中的记录。

RDD 的计算本该是 lazy 的。诚然，这里左子树的计算确实是 lazy 的，但右子树不是，右子树在 RDD 实例化的时候就已经计算完毕了，因此该方法不太适用于较大的右子树。不过，能产生这种 SparkPlan 本来就要求 LeftSemiJoin 操作右子树的 Statistics 值小于一定的阈值，因此这样做还是合理的。

### LeftSemiJoinHash

准入条件：Left Semi Join，ON 中存在相等条件

```scala
case class LeftSemiJoinHash(
    leftKeys: Seq[Expression],
    rightKeys: Seq[Expression],
    left: SparkPlan,
    right: SparkPlan) extends BinaryNode with HashJoin {

  // 同样以右子树作为 BuildSide	
  override val buildSide: BuildSide = BuildRight

  // 表明对于 leftKeys 以及 rightKeys 的每个属性，具有相同值的 Row 可能分散在不同的 Partition 中
  override def requiredChildDistribution: Seq[ClusteredDistribution] =
    ClusteredDistribution(leftKeys) :: ClusteredDistribution(rightKeys) :: Nil

  // 同样直接以左子树的输入作为输出	
  override def output: Seq[Attribute] = left.output

  protected override def doExecute(): RDD[Row] = {
    // 先计算出右子树的结果 RDD
	// 再把左右子树的 Partition 们 zip 起来（意味着左右子树的结果 Partition 数相同）
    buildPlan.execute().zipPartitions(streamedPlan.execute()) { (buildIter, streamIter) =>
	  // 在 zip 起来的 Partition 内采取了和之前一样的算法
      val hashSet = new java.util.HashSet[Row]()
      var currentRow: Row = null

      // Create a Hash set of buildKeys
	  // 先构建右子树的 key set
      while (buildIter.hasNext) {
        currentRow = buildIter.next()
        val rowKey = buildSideKeyGenerator(currentRow)
        if (!rowKey.anyNull) {
          val keyExists = hashSet.contains(rowKey)
          if (!keyExists) {
            hashSet.add(rowKey)
          }
        }
      }

	  // 再从左子树中筛选返回
      val joinKeys = streamSideKeyGenerator()
      streamIter.filter(current => {
        !joinKeys(current).anyNull && hashSet.contains(joinKeys.currentValue)
      })
    }
  }
}
```

可见，其核心算法本身和 `BroadcastLeftSemiJoinHash` 并无不同，但却使用了 `zipPartitions` 方法来计算两个 RDD 的 Join 结果。如果要确保结果完全正确，就需要两个 RDD 的 Partition 数相同，同时在 key 上有着相同值的 Row 必然处于 index 相同的 Partition 内。我暂时无法理解 SparkSQL 要如何保证这两个条件同时满足，只能先放一放了。

### LeftSemiJoinBN

准入条件：Left Semi Join

```scala
case class LeftSemiJoinBNL(streamed: SparkPlan, broadcast: SparkPlan, condition: Option[Expression])
// 注：实例化时传入的 streamed 为左子树，broadcast 为右子树
  extends BinaryNode {
  // 由于 ON 语句中不再有相等条件，因此该算法也不使用 HashSet 来查找相同元素了

  override def left: SparkPlan = streamed
  override def right: SparkPlan = broadcast
  
  // 输出的属性与 Partition 方法与左子树保持一致
  override def outputPartitioning: Partitioning = streamed.outputPartitioning
  override def output: Seq[Attribute] = left.output

  // 根据传入的 ON condition 生成了一个(Row) => Boolean
  @transient private lazy val boundCondition =
    newPredicate(condition.getOrElse(Literal(true)), left.output ++ right.output)

  protected override def doExecute(): RDD[Row] = {
    // 计算右子树并把结果广播出去
    val broadcastedRelation =
      sparkContext.broadcast(broadcast.execute().map(_.copy()).collect().toIndexedSeq)

    streamed.execute().mapPartitions { streamedIter =>
      val joinedRow = new JoinedRow

	  // 筛选吻合的行
      streamedIter.filter(streamedRow => {
        var i = 0
        var matched = false

		// 遍历右子树结果，并在找到第一个匹配结果的时候结束循环
        while (i < broadcastedRelation.value.size && !matched) {
          val broadcastedRow = broadcastedRelation.value(i)
		  // 利用当前的两个 Row 生成一个 JoinedRow 并验证是否吻合条件
          if (boundCondition(joinedRow(streamedRow, broadcastedRow))) {
            matched = true
          }
          i += 1
        }
        matched
      })
    }
  }
}
```

没什么特别，相当好理解。

### BroadcastHashJoin

准入条件：Inner Join，ON 里有相等条件，左子树或右子树小于阈值（默认 10MB），以较小的一侧为 BuildSide

```scala
case class BroadcastHashJoin(
    leftKeys: Seq[Expression],
    rightKeys: Seq[Expression],
    buildSide: BuildSide,
    left: SparkPlan,
    right: SparkPlan)
  extends BinaryNode with HashJoin {

  val timeout: Duration = {
    // 默认为 5*60，即 5 分钟
    val timeoutValue = sqlContext.conf.broadcastTimeout
    if (timeoutValue < 0) {
      Duration.Inf
    } else {
      timeoutValue.seconds
    }
  }
  
  override def outputPartitioning: Partitioning = streamedPlan.outputPartitioning

  override def requiredChildDistribution: Seq[Distribution] =
    UnspecifiedDistribution :: UnspecifiedDistribution :: Nil

  // 启动一个异步计算
  @transient
  private val broadcastFuture = future {
    // Note that we use .execute().collect() because we don't want to convert data to Scala types
	// 收集较小子树的结果
    val input: Array[Row] = buildPlan.execute().map(_.copy()).collect()
	// 生成一个 Key 到 Row(s)的 HashMap 并广播出去
    val hashed = HashedRelation(input.iterator, buildSideKeyGenerator, input.length)
    sparkContext.broadcast(hashed)
  }(BroadcastHashJoin.broadcastHashJoinExecutionContext)

  protected override def doExecute(): RDD[Row] = {
    // 等待异步计算完成
    val broadcastRelation = Await.result(broadcastFuture, timeout)

    streamedPlan.execute().mapPartitions { streamedIter =>
      hashJoin(streamedIter, broadcastRelation.value)
    }
  }
}
```

我们看到，在最后 `BroadcastHashJoin` 调用了父类 `HashJoin` 的 `hashJoin` 方法。我们来看看那个方法：

```scala
trait HashJoin {
  self: SparkPlan =>
  
  // ...
  
  // 参考上面，这里传入的 hashedRelation 实际上是 Key 到 Row(s)的 HashMap
  protected def hashJoin(streamIter: Iterator[Row], hashedRelation: HashedRelation): Iterator[Row] = {
    new Iterator[Row] {
      private[this] var currentStreamedRow: Row = _
      private[this] var currentHashMatches: CompactBuffer[Row] = _
      private[this] var currentMatchPosition: Int = -1

      private[this] val joinRow = new JoinedRow2

      private[this] val joinKeys = streamSideKeyGenerator()
	  
	  /**
	   * 这里我们需要考虑我们平常使用 Iterator 的方式，基本都是这样：
	   * while (iterator.hasNext) {
	   *    sth = iterator.next 
	   *    ..
	   * }
	   * 意味着 hasNext 和 next 会被交替调用
	   */
	  override final def hasNext: Boolean =
        (currentMatchPosition != -1 && currentMatchPosition < currentHashMatches.size) ||
          (streamIter.hasNext && fetchNext())
	  // 在最初时，我们会先调用 hasNext，这里进入第二条条件判断式，fetchNext 被调用，获取到一个 currentHashMatches
      // 接下来，hasNext 在第一条条件判断式就会返回 true，第二条被短路。我们通过调用 next，让迭代器遍历 currentHashMatches
      // 当一个 currentHashMatches 被遍历完毕，第一条条件判断式会返回 false，这里就会进入第二条条件判断式，由 fetchNext 获取下一个 currentHashMatches
	  // 综上，当且仅当 fetchNext 或 streamIter.hasNext 返回 false 时（实际上 fetchNext 也只有在!streamIter.hasNext 时才会返回 false），这里会返回 false
      

      override final def next(): Row = {
	    // 遍历在 fetchNext 中拿到的 currentHashMatches，生成 JoinedRow
        val ret = buildSide match {
          case BuildRight => joinRow(currentStreamedRow, currentHashMatches(currentMatchPosition))
          case BuildLeft => joinRow(currentHashMatches(currentMatchPosition), currentStreamedRow)
        }
        currentMatchPosition += 1
        ret
      }

      // 找到下一个 streamSide 中吻合的条目
      private final def fetchNext(): Boolean = {
        currentHashMatches = null
        currentMatchPosition = -1

		// 找到一个吻合的条目并退出循环
        while (currentHashMatches == null && streamIter.hasNext) {
          currentStreamedRow = streamIter.next()
          if (!joinKeys(currentStreamedRow).anyNull) {
            currentHashMatches = hashedRelation.get(joinKeys.currentValue)
          }
        }

        if (currentHashMatches == null) {
          false // streamIter 已完成遍历，故该迭代器也已完成遍历，返回 false
        } else {
		  // 找到吻合的条目，迭代器再次初始化
          currentMatchPosition = 0
          true
        }
      }
    }
  }
}   
```

嗯，这背后确实是个标准的 Hash Join 算法，但我必须得说，这写得实在是太巧妙了。

`BroadcastHashJoin` 实际上和 `BroadcastLeftSemiJoinHash` 很像，但后者的 buildSide 结果的收集是在 `doExecute` 被调用时进行，而前者在实例化时就已经以一个异步计算的形式开始了。考虑到 SparkSQL 的各种 lazy 变量，实际上前者的计算的启动时机比后者要早很多。前者在 `planner.plan` 的时候就已经开始了，而后者则要等到 `QueryExecution#toRDD`。

### SortMergeJoin

准入条件：Inner Join，ON 里有相等条件，sortMergeJoin 设置被开启

```scala
case class SortMergeJoin(
    leftKeys: Seq[Expression],
    rightKeys: Seq[Expression],
    left: SparkPlan,
    right: SparkPlan) extends BinaryNode {

  override def output: Seq[Attribute] = left.output ++ right.output
  override def outputPartitioning: Partitioning = left.outputPartitioning

  override def requiredChildDistribution: Seq[Distribution] =
    ClusteredDistribution(leftKeys) :: ClusteredDistribution(rightKeys) :: Nil

  // this is to manually construct an ordering that can be used to compare keys from both sides
  private val keyOrdering: RowOrdering = RowOrdering.forSchema(leftKeys.map(_.dataType))

  private def requiredOrders(keys: Seq[Expression]): Seq[SortOrder] =
    keys.map(SortOrder(_, Ascending))
  // 左右子树出现在 ON 相等表达式中的属性按升序排序
  override def outputOrdering: Seq[SortOrder] = requiredOrders(leftKeys)
  override def requiredChildOrdering: Seq[Seq[SortOrder]] =
    requiredOrders(leftKeys) :: requiredOrders(rightKeys) :: Nil

  // 类似 HashJoin 的 key generator	
  @transient protected lazy val leftKeyGenerator = newProjection(leftKeys, left.output)
  @transient protected lazy val rightKeyGenerator = newProjection(rightKeys, right.output)

  protected override def doExecute(): RDD[Row] = {
    // 或许到左右子树的结果 RDD
    val leftResults = left.execute().map(_.copy())
    val rightResults = right.execute().map(_.copy())

	// 左右子树的 Partition 们 zip 起来
    leftResults.zipPartitions(rightResults) { (leftIter, rightIter) =>
      new Iterator[Row] {
        // Mutable per row objects.
        private[this] val joinRow = new JoinedRow5
        private[this] var leftElement: Row = _
        private[this] var rightElement: Row = _
        private[this] var leftKey: Row = _
        private[this] var rightKey: Row = _
        private[this] var rightMatches: CompactBuffer[Row] = _
        private[this] var rightPosition: Int = -1
        private[this] var stop: Boolean = false
        private[this] var matchKey: Row = _

        // 迭代器初始化
        initialize()
		
		// 将 leftElement 和 rightElement 分别指向左右侧第一个元素，并生成对应的 key
		private def initialize() = {
          fetchLeft()
          fetchRight()
        }
		
		// 从左子树获取下一个 Row
		private def fetchLeft() = {
          if (leftIter.hasNext) {
            leftElement = leftIter.next()
            leftKey = leftKeyGenerator(leftElement)
          } else {
            leftElement = null
          }
        }

		// 从右子树获取下一个 Row
        private def fetchRight() = {
          if (rightIter.hasNext) {
            rightElement = rightIter.next()
            rightKey = rightKeyGenerator(rightElement)
          } else {
            rightElement = null
          }
        }

		// 同样考虑刚刚提到的 Iterator 的使用方式
        override final def hasNext: Boolean = nextMatchingPair()
		
		// 右迭代器搜索下一个与左侧匹配的条目 
        private def nextMatchingPair(): Boolean = {
          if (!stop && rightElement != null) {
            // 两边的指针一起跑，以找到第一个配对
            while (!stop && leftElement != null && rightElement != null) {
              val comparing = keyOrdering.compare(leftKey, rightKey)
			  // 找到配对，则 stop 为 true，退出当前循环
              stop = comparing == 0 && !leftKey.anyNull			  
              if (comparing > 0 || rightKey.anyNull) {
                fetchRight() // 左边比右边大，右边前进一步
              } else if (comparing < 0 || leftKey.anyNull) {
                fetchLeft() // 右边比左边大，左边前进一步
              }
            }
            rightMatches = new CompactBuffer[Row]()
            if (stop) {
              stop = false
			  // 将右侧的所有 key 相同的 Row 放入 rightMatches，直到遇到第一个不同的 key
              while (!stop && rightElement != null) {
                rightMatches += rightElement
                fetchRight()
                stop = keyOrdering.compare(leftKey, rightKey) != 0
              }
              if (rightMatches.size > 0) {
                rightPosition = 0
                matchKey = leftKey
              }
            }
          }
          rightMatches != null && rightMatches.size > 0
        }

        override final def next(): Row = {
          if (hasNext) {
            val joinedRow = joinRow(leftElement, rightMatches(rightPosition))
            rightPosition += 1
            if (rightPosition >= rightMatches.size) {
              rightPosition = 0
              fetchLeft() // 右侧匹配条目收集完毕，左侧前进一步
              if (leftElement == null || keyOrdering.compare(leftKey, matchKey) != 0) {
                stop = false // stop 置为 false，hasNext 继续寻找下一对配对
                rightMatches = null
              }
            }
            joinedRow
          } else {
            // no more result
            throw new NoSuchElementException
          }
        }
      }
    }
  }
}
```

虽然算法不相同，但迭代器的设计思想上，`SortMergeJoin` 和 `BroadcastHashJoin` 还是很像的，只是前者的迭代器在 `next` 方法里调用了 `hasNext`，这样的设计更为安全，而后者如果在 `next` 之前没有调用过 `hasNext` 则会直接出错。

### ShuffledHashJoin

准入条件：Inner Join，ON 里有相等条件。以较小的一侧为 buildSide。

```scala
case class ShuffledHashJoin(
    leftKeys: Seq[Expression],
    rightKeys: Seq[Expression],
    buildSide: BuildSide,
    left: SparkPlan,
    right: SparkPlan)
  extends BinaryNode with HashJoin {

  override def outputPartitioning: Partitioning = left.outputPartitioning

  override def requiredChildDistribution: Seq[ClusteredDistribution] =
    ClusteredDistribution(leftKeys) :: ClusteredDistribution(rightKeys) :: Nil

  protected override def doExecute(): RDD[Row] = {
    buildPlan.execute().zipPartitions(streamedPlan.execute()) { (buildIter, streamIter) =>
      val hashed = HashedRelation(buildIter, buildSideKeyGenerator)
      hashJoin(streamIter, hashed)
    }
  }
}
```

好像没什么需要说的，十分直观。

### HashOuterJoin

准入条件：ON 里有相等条件

```scala
@DeveloperApi
case class HashOuterJoin(
    leftKeys: Seq[Expression],
    rightKeys: Seq[Expression],
    joinType: JoinType,
    condition: Option[Expression],
    left: SparkPlan,
    right: SparkPlan) extends BinaryNode {

  // 从这里看得出来，HashOuterJoin 同时接受三种 Outer Join，只要它们的 ON 里有相等条件
  override def outputPartitioning: Partitioning = joinType match {
    case LeftOuter => left.outputPartitioning
    case RightOuter => right.outputPartitioning
    case FullOuter => UnknownPartitioning(left.outputPartitioning.numPartitions)
    case x => throw new Exception(s"HashOuterJoin should not take $x as the JoinType")
  }

  override def requiredChildDistribution: Seq[ClusteredDistribution] =
    ClusteredDistribution(leftKeys) :: ClusteredDistribution(rightKeys) :: Nil

  override def output: Seq[Attribute] = {
    joinType match {
      case LeftOuter =>
        left.output ++ right.output.map(_.withNullability(true))
      case RightOuter =>
        left.output.map(_.withNullability(true)) ++ right.output
      case FullOuter =>
        left.output.map(_.withNullability(true)) ++ right.output.map(_.withNullability(true))
      case x =>
        throw new Exception(s"HashOuterJoin should not take $x as the JoinType")
    }
  }

  @transient private[this] lazy val DUMMY_LIST = Seq[Row](null)
  @transient private[this] lazy val EMPTY_LIST = Seq.empty[Row]

  @transient private[this] lazy val leftNullRow = new GenericRow(left.output.length)
  @transient private[this] lazy val rightNullRow = new GenericRow(right.output.length)
  @transient private[this] lazy val boundCondition =
    condition.map(newPredicate(_, left.output ++ right.output)).getOrElse((row: Row) => true)
  
  // 出于性能考虑，SparkSQL 自行实现了三种迭代器
  private[this] def leftOuterIterator(
  // 注意：这里传入的 joinedRow 的 left 已经设定，key 就是 left 的 key。见 doExecute
      key: Row, joinedRow: JoinedRow, rightIter: Iterable[Row]): Iterator[Row] = {
    val ret: Iterable[Row] = {
      if (!key.anyNull) {
        val temp = rightIter.collect {
          case r if boundCondition(joinedRow.withRight(r)) => joinedRow.copy()
        }  // 收集右侧所有匹配的条目
        if (temp.size == 0) {
          joinedRow.withRight(rightNullRow).copy :: Nil // 没有收集到，直接返回个 NULL
        } else {
          temp // 收集到了，就全部输出
        }
      } else {
        joinedRow.withRight(rightNullRow).copy :: Nil
      }
    }
    ret.iterator
  }

  // 同上，轴对称一下而已
  private[this] def rightOuterIterator(
      key: Row, leftIter: Iterable[Row], joinedRow: JoinedRow): Iterator[Row] = {

    val ret: Iterable[Row] = {
      if (!key.anyNull) {
        val temp = leftIter.collect {
          case l if boundCondition(joinedRow.withLeft(l)) => joinedRow.copy
        }
        if (temp.size == 0) {
          joinedRow.withLeft(leftNullRow).copy :: Nil
        } else {
          temp
        }
      } else {
        joinedRow.withLeft(leftNullRow).copy :: Nil
      }
    }
    ret.iterator
  }

  // 注意：这里传入的 key 先是左侧的 key，之后才是右侧的 key
  // leftIter 和 rightIter 则是与该 key 对应的左右侧的 Row。见 doExecute
  private[this] def fullOuterIterator(
      key: Row, leftIter: Iterable[Row], rightIter: Iterable[Row],
      joinedRow: JoinedRow): Iterator[Row] = {

    if (!key.anyNull) {
      // 尝试让传入的左右侧条目在 key 上 Join 一下
      val rightMatchedSet = scala.collection.mutable.Set[Int]()
      leftIter.iterator.flatMap[Row] { l =>
        joinedRow.withLeft(l)
        var matched = false
        rightIter.zipWithIndex.collect {
          // 1. For those matched (satisfy the join condition) records with both sides filled,
          //    append them directly

		  // 尝试找到吻合 Inner Join 的左右条目
          case (r, idx) if boundCondition(joinedRow.withRight(r)) =>
            matched = true // matched 置为 true，意为当前左条目找到对应的右条目了
            // if the row satisfy the join condition, add its index into the matched set
			// 匹配到的右条目 index 放入 set 里，避免重复输出
            rightMatchedSet.add(idx)
            joinedRow.copy()

        } ++ DUMMY_LIST.filter(_ => !matched).map( _ => {
          // 2. For those unmatched records in left, append additional records with empty right.

          // DUMMY_LIST.filter(_ => !matched) is a tricky way to add additional row,
          // as we don't know whether we need to append it until finish iterating all
          // of the records in right side.
          // If we didn't get any proper row, then append a single row with empty right.
		  // 当前左条目没有找到对应的右条目，放入一个 NULL
          joinedRow.withRight(rightNullRow).copy()
        })
      } ++ rightIter.zipWithIndex.collect {
        // 3. For those unmatched records in right, append additional records with empty left.

        // Re-visiting the records in right, and append additional row with empty left, if its not
        // in the matched set.
		// 对于剩下的（不在之前那个 set 内）的右条目，也放入一个 NULL
        case (r, idx) if !rightMatchedSet.contains(idx) =>
          joinedRow(leftNullRow, r).copy()
      }
    } else {
	  // key 本身就是个 NULL，那传入的左右侧条目肯定都不能 Join 起来了，直接输出
      leftIter.iterator.map[Row] { l =>
        joinedRow(l, rightNullRow).copy()
      } ++ rightIter.iterator.map[Row] { r =>
        joinedRow(leftNullRow, r).copy()
      }
    }
  }

  // 根据给定的数据以及 key generator，生成<key, Row(s)>映射。同之前的 hashedRelation
  private[this] def buildHashTable(
      iter: Iterator[Row], keyGenerator: Projection): JavaHashMap[Row, CompactBuffer[Row]] = {
    val hashTable = new JavaHashMap[Row, CompactBuffer[Row]]()
    while (iter.hasNext) {
      val currentRow = iter.next()
      val rowKey = keyGenerator(currentRow)

      var existingMatchList = hashTable.get(rowKey)
      if (existingMatchList == null) {
        existingMatchList = new CompactBuffer[Row]()
        hashTable.put(rowKey, existingMatchList)
      }

      existingMatchList += currentRow.copy()
    }

    hashTable
  }

  protected override def doExecute(): RDD[Row] = {
    val joinedRow = new JoinedRow()
    left.execute().zipPartitions(right.execute()) { (leftIter, rightIter) =>
	  // 根据 Join 类型不同分成不同的处理方式
      joinType match {
        case LeftOuter => // 左外连接和右外连接的代码可以一起看，感觉就是个逻辑上的轴对称而已 233
          val rightHashTable = buildHashTable(rightIter, newProjection(rightKeys, right.output))
		  // 生成右侧的 key row 映射
          val keyGenerator = newProjection(leftKeys, left.output)
          leftIter.flatMap( currentRow => {
            val rowKey = keyGenerator(currentRow)
            joinedRow.withLeft(currentRow) // 它的 right 由 leftOuterIterator 设定
            leftOuterIterator(rowKey, joinedRow, rightHashTable.getOrElse(rowKey, EMPTY_LIST))
          })

        case RightOuter =>
          val leftHashTable = buildHashTable(leftIter, newProjection(leftKeys, left.output))
          val keyGenerator = newProjection(rightKeys, right.output)
          rightIter.flatMap ( currentRow => {
            val rowKey = keyGenerator(currentRow)
            joinedRow.withRight(currentRow)
            rightOuterIterator(rowKey, leftHashTable.getOrElse(rowKey, EMPTY_LIST), joinedRow)
          })

        case FullOuter =>
          val leftHashTable = buildHashTable(leftIter, newProjection(leftKeys, left.output))
          val rightHashTable = buildHashTable(rightIter, newProjection(rightKeys, right.output))
          (leftHashTable.keySet ++ rightHashTable.keySet).iterator.flatMap { key =>
            fullOuterIterator(key,
              leftHashTable.getOrElse(key, EMPTY_LIST),
              rightHashTable.getOrElse(key, EMPTY_LIST), joinedRow)
          }

        case x => throw new Exception(s"HashOuterJoin should not take $x as the JoinType")
      }
    }
  }
}
```

看起来有点费劲，写得很是不面向对象，但总体来说并没有什么特别深奥的地方，慢慢看还是可以看得懂的。

### CartesianProduct

准入条件：Inner Join，有 ON 语句；没有 ON 语句

```scala
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

其实就是 RDD 的 `cartesian` 了。

### BroadcastNestedLoopJoin

准入条件：剩下的所有 Join。以较小一侧为 buildSide。

```scala
case class BroadcastNestedLoopJoin(
    left: SparkPlan,
    right: SparkPlan,
    buildSide: BuildSide,
    joinType: JoinType,
    condition: Option[Expression]) extends BinaryNode {
  // 最后一个，最 General 的 Join Physical Plan 出现了

  // ...

  protected override def doExecute(): RDD[Row] = {
    // 收集 buildSide 侧的计算结果并广播
    val broadcastedRelation =
      sparkContext.broadcast(broadcast.execute().map(_.copy()).collect().toIndexedSeq)

    /** All rows that either match both-way, or rows from streamed joined with nulls. */
    val matchesOrStreamedRowsWithNulls = streamed.execute().mapPartitions { streamedIter =>
      val matchedRows = new CompactBuffer[Row]
      // TODO: Use Spark's BitSet.
      val includedBroadcastTuples =
        new scala.collection.mutable.BitSet(broadcastedRelation.value.size)
      val joinedRow = new JoinedRow
      val leftNulls = new GenericMutableRow(left.output.size)
      val rightNulls = new GenericMutableRow(right.output.size)

      streamedIter.foreach { streamedRow =>
        var i = 0
        var streamRowMatched = false

		// 找出所有匹配的 Inner Join 条目
        while (i < broadcastedRelation.value.size) {
          // TODO: One bitset per partition instead of per row.
          val broadcastedRow = broadcastedRelation.value(i)
          buildSide match {
            case BuildRight if boundCondition(joinedRow(streamedRow, broadcastedRow)) =>
              matchedRows += joinedRow(streamedRow, broadcastedRow).copy()
              streamRowMatched = true
              includedBroadcastTuples += i // 记录 broadcast 侧已被匹配的条目
            case BuildLeft if boundCondition(joinedRow(broadcastedRow, streamedRow)) =>
              matchedRows += joinedRow(broadcastedRow, streamedRow).copy()
              streamRowMatched = true
              includedBroadcastTuples += i
            case _ =>
          }
          i += 1
        }

		// 根据 Join 类型不同决定是否要把无法匹配的条目放进结果集中
        (streamRowMatched, joinType, buildSide) match {
          case (false, LeftOuter | FullOuter, BuildRight) =>
            matchedRows += joinedRow(streamedRow, rightNulls).copy()
          case (false, RightOuter | FullOuter, BuildLeft) =>
            matchedRows += joinedRow(leftNulls, streamedRow).copy()
		  // 这里还有 LeftOuter + BuildLeft 和 RightOuter + BuildRight 的情况没有处理 
          case _ =>
        }
      }
      Iterator((matchedRows, includedBroadcastTuples))
    }

    val includedBroadcastTuples = matchesOrStreamedRowsWithNulls.map(_._2)
    val allIncludedBroadcastTuples = // 所有已被匹配的 broadcast 侧条目
      if (includedBroadcastTuples.count == 0) {
        new scala.collection.mutable.BitSet(broadcastedRelation.value.size)
      } else {
        includedBroadcastTuples.reduce(_ ++ _)
      }

    val leftNulls = new GenericMutableRow(left.output.size)
    val rightNulls = new GenericMutableRow(right.output.size)
    /** Rows from broadcasted joined with nulls. */
    val broadcastRowsWithNulls: Seq[Row] = { // 由 broadcast 侧未匹配条目与 NULL 组成的 Row
      val buf: CompactBuffer[Row] = new CompactBuffer()
      var i = 0
      val rel = broadcastedRelation.value
      while (i < rel.length) { // 遍历整个 broadcast 侧
        if (!allIncludedBroadcastTuples.contains(i)) {
          (joinType, buildSide) match { // 未匹配的条目根据不同的 Join 类型生成带 NULL 的 Row
            case (RightOuter | FullOuter, BuildRight) => buf += new JoinedRow(leftNulls, rel(i))
            case (LeftOuter | FullOuter, BuildLeft) => buf += new JoinedRow(rel(i), rightNulls)
            case _ =>
          }
        }
        i += 1
      }
      buf.toSeq
    }

    // TODO: Breaks lineage.
    sparkContext.union(
      matchesOrStreamedRowsWithNulls.flatMap(_._1), sparkContext.makeRDD(broadcastRowsWithNulls))
	  // 将两个结果集 union 起来并返回
  }
}
```

也算是比较直观啦，并没有什么特别神奇的东西。至此，我们就探索完 SparkSQL 为 JOIN 操作设计的 9 种 Physical Plan 了，相信在这个操作上对 SparkSQL 知根知底为以后的工作也能带来莫大的好处。
