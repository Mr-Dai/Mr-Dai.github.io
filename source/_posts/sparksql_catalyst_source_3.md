---
title: Spark Catalyst 源码解析：LogicalPlan
category: Spark
tags:
  - Spark
  - SparkSQL
date: 2015-08-19
updated: 2015-08-19
toc: true
---

在[上一篇文章](/sparksql_catalyst_source_2)中，我们了解了 SparkSQL 如何将各式语句分别委派到三个不同的 Parser 中进行解析，并返回一个 Unresolved Logical Plan。

在这篇文章中，我打算在讲解 Analyzer 之前先为大家讲解一下 Spark 里的 LogicalPlan 数据结构。

<!-- more -->

## TreeNode

在进入 Analyzer 的学习前，我们不妨先花点时间了解一下这个 LogicalPlan 是一个怎么样的数据结构，为何 Spark 可以在产生一个这样的实例后还能进行如此多的优化操作。

实际上，有学习过数据库原理，或者有看过我之前说的[这篇论文](/file/SparkSQL.pdf)，也基本能猜到，`LogicalPlan` 这个类本质上是一棵抽象语法树（AST）。我们先来看看核心类 `LogicalPlan`：

```scala
// LogicalPlan 本身是一个虚类，父类是 QueryPlan
abstract class LogicalPlan extends QueryPlan[LogicalPlan] with Logging {
  // LogicalPlan 通过自身类型规定子类必须混入 Product 特质
  self: Product =>
  
  override protected def statePrefix = if (!resolved) "'" else super.statePrefix
  
  // ...
  
}
```

`LogicalPlan` 继承自 `QueryPlan`，但实际上 `LogicalPlan` 只定义了一个带有 `override` 关键字的方法。那么我们先不着急看 `LogicalPlan`，我们先去看看它的父类 `QueryPlan`：

![](/img/Spark-Catalyst@2.jpg)

```scala
abstract class QueryPlan[PlanType <: TreeNode[PlanType]] extends TreeNode[PlanType] {
  self: PlanType with Product =>
  
  // ...
  
  /**
   * A prefix string used when printing the plan.
   *
   * We use "!" to indicate an invalid plan, and "'" to indicate an unresolved plan.
   */
  protected def statePrefix = if (missingInput.nonEmpty && children.nonEmpty) "!" else ""

  override def simpleString: String = statePrefix + super.simpleString
  
}  
```

在 `QueryPlan` 中，关键字 `override` 同样只出现了一次。我们看到之前在 `LogicalPlan` 出现的 `statePrefix` 函数，是一个和计算过程本身没啥关系的函数，我们先跳过它。我们注意到 `QueryPlan` 继承自 `TreeNode`，同时其泛型的类型参数十分有意思，而且考虑到 `LogicalPlan` 本身继承的父类是 `QueryPlan[LogicalPlan]`。这是个很有意思的类型设定，我们不妨在看过 `TreeNode` 以后再来仔细推敲这个问题：

![](/img/Spark-Catalyst@3.jpg)

```scala
abstract class TreeNode[BaseType <: TreeNode[BaseType]] {
  self: BaseType with Product =>
  
  val origin: Origin = CurrentOrigin.get
  /** Returns a Seq of the children of this node */
  def children: Seq[BaseType]
  
  // 选择不去重载 Object.equals 方法，以免 Scala 编译器不为 case class 生成该方法
  def fastEquals(other: TreeNode[_]): Boolean = {
    this.eq(other) || this == other
  }
  
  // 从本节点开始，先序遍历整棵树，返回第一个符合 f 命题的节点
  def find(f: BaseType => Boolean): Option[BaseType] = f(this) match {
    case true => Some(this)
    case false => children.foldLeft(None: Option[BaseType]) { (l, r) => l.orElse(r.find(f)) }
  }
  
  // 以下函数名字中的的 Up 和 Down，可以理解为先序遍历的自上而下（down）和后序遍历的自下而上（up）
  
  // 先序地对整棵树遍历使用 f 函数
  def foreach(f: BaseType => Unit): Unit = {
    f(this)
    children.foreach(_.foreach(f))
  }
  
  // 后序地对整棵树遍历使用 f 函数
  def foreachUp(f: BaseType => Unit): Unit = {
    children.foreach(_.foreachUp(f))
    f(this)
  }
  
  // 先序地对整棵树遍历使用 f 函数并以 Seq 的形式返回结果
  def map[A](f: BaseType => A): Seq[A] = {
    val ret = new collection.mutable.ArrayBuffer[A]()
    foreach(ret += f(_))
    ret
  }
  
  def flatMap[A](f: BaseType => TraversableOnce[A]): Seq[A] = // ...
  
  // map 的偏函数版
  def collect[B](pf: PartialFunction[BaseType, B]): Seq[B] = // ...
  
  // 先序遍历整棵树调用传入的偏函数，并返回第一个结果
  def collectFirst[B](pf: PartialFunction[BaseType, B]): Option[B] = // ...
  
  // 返回该节点的拷贝，该拷贝的所有子节点已被应用 f 函数
  def mapChildren(f: BaseType => BaseType): this.type = // ...
  
  // 返回该节点的拷贝，该拷贝的子节点为传入的子节点
  // 注：传入的子节点数必须与原本的节点数相同
  def withNewChildren(newChildren: Seq[BaseType]): this.type = // ...
  
  // 对整棵树先序地遍历使用传入的规则（rule）并返回结果树的根节点
  // 当某个节点无法被应用于该规则时，该节点保持不变。
  def transform(rule: PartialFunction[BaseType, BaseType]): BaseType = // ...
  // 同上
  def transformDown(rule: PartialFunction[BaseType, BaseType]): BaseType = // ...
  
  // 从当前节点的子节点开始先序地遍历使用传入的规则（当前节点不会应用该规则），并返回结果树的根节点
  def transformChildrenDown(rule: PartialFunction[BaseType, BaseType]): this.type = // ...
  
  // 对整棵树后序地遍历使用传入的规则（rule）并返回结果树的根节点
  def transformUp(rule: PartialFunction[BaseType, BaseType]): BaseType = // ...
  // 从当前节点的子节点开始后序地遍历使用传入的规则（当前节点不会应用该规则），并返回结果树的根节点
  def transformChildrenUp(rule: PartialFunction[BaseType, BaseType]): this.type = // ...
  
  // ...
  
}
```

我们可以看到，除去一些比较无关痛痒的函数以外（上述源代码已忽略这些函数），`TreeNode` 类包含的都是一些对整棵树操作的接口。这种设计其实并不难理解。`TreeNode` 作为虚类，它并没有实现自己的 `children` 函数。但实际上同样在 `TreeNode.scala` 文件里，我们可以找到下述三个特质：

```scala
trait BinaryNode[BaseType <: TreeNode[BaseType]] {
  def left: BaseType
  def right: BaseType

  def children: Seq[BaseType] = Seq(left, right)
}

trait LeafNode[BaseType <: TreeNode[BaseType]] {
  def children: Seq[BaseType] = Nil
}

trait UnaryNode[BaseType <: TreeNode[BaseType]] {
  def child: BaseType
  def children: Seq[BaseType] = child :: Nil
}
```

这里就定义了一棵树中的所有节点类型，包括有两个子节点的二元节点 `BinaryNode` 、只有一个子节点的一元节点 `UnaryNode` 以及没有子节点的叶子节点 `LeafNode`。每个节点特质都实现了 `TreeNode` 中的 `children` 函数。

![](/img/Spark-Catalyst@4.jpg)

现在我们似乎还不能直接解答 `QueryPlan` 奇怪的泛型类型是怎么回事，但我们可以先看看 `TreeNode` 的泛型类型。`TreeNode[BaseType <: TreeNode[BaseType]]`，这个 `<: TreeNode` 好像有点死循环的意思。但其实看到 `children` 的类型是 `Seq[BaseType]` 就能理解，这里的 `BaseType` 指的是当前结点的子结点类型，它必然也应该是一个 `TreeNode`。

## QueryPlan

我们回到 `QueryPlan`：

```scala
// 这里我们就可以理解，TreeNode 指的是用于构建一般的树的结点，它比起 QueryPlan 更加的 general；而 QueryPlan 则专门指一棵执行计划树
// 执行计划树仅仅要求根结点属于 QueryPlan 类，并不要求子结点们都是该类的子类，因此 QueryPlan 的泛型参数仅要求为 TreeNode 的子类
abstract class QueryPlan[PlanType <: TreeNode[PlanType]] extends TreeNode[PlanType] {
  self: PlanType with Product =>
  
  // 返回该查询计划包含的所有表达式（Expression）
  def expressions: Seq[Expression] = {
    productIterator.flatMap {
      case e: Expression => e :: Nil
      case Some(e: Expression) => e :: Nil
      case seq: Traversable[_] => seq.flatMap {
        case e: Expression => e :: Nil
        case other => Nil
      }
      case other => Nil
    }.toSeq
  }
	
  // 先序地对当前结点的 Expression 遍历使用传入的规则
  def transformExpressions(rule: PartialFunction[Expression, Expression]): this.type = // ...
  // 同上
  def transformExpressionsDown(rule: PartialFunction[Expression, Expression]): this.type = // ...
  // 你懂的
  def transformExpressionsUp(rule: PartialFunction[Expression, Expression]): this.type = // ...
  
  // 对整棵树先序地遍历使用 transformExpressions
  def transformAllExpressions(rule: PartialFunction[Expression, Expression]): this.type = {
    transform {
      case q: QueryPlan[_] => q.transformExpressions(rule).asInstanceOf[PlanType]
    }.asInstanceOf[this.type]
  }
  
  // 结果的模式。用过 SparkSQL 的读者应该对 StructType 不会陌生
  lazy val schema: StructType = StructType.fromAttributes(output)

  // 结果表的所有属性（Attribute，特指表中的一个字段）
  def output: Seq[Attribute]
  def outputSet: AttributeSet = AttributeSet(output)
  // 出现在当前结点表达式中的属性
  def references: AttributeSet = AttributeSet(expressions.flatMap(_.references))
  // 通过子结点输入到当前结点的所有属性
  def inputSet: AttributeSet =
    AttributeSet(children.flatMap(_.asInstanceOf[QueryPlan[PlanType]].output))
  // 上述两个集合的差，缺失的输入
  def missingInput: AttributeSet =
    (references -- inputSet).filter(_.name != VirtualColumn.groupingIdName)
}
```

通过阅读上述代码，我们发现了 3 个新名词：`schema` 、 `Attribute` 和 `Expression`。`schema` 的类型是 `StructType`，使用过 SparkSQL 的读者就会明白，这个指的就是一个表的模式。`Attribute` 这个词曾经出现在我之前说过的[那篇论文](/file/SparkSQL.pdf)中，指的是表中的一个字段。而 `Expression` 意为表达式，从 `QueryPlan` 中的方法可以看出这个 `Expression` 也是一棵树。我们可以去看看它的源代码：

```scala
abstract class Expression extends TreeNode[Expression] {
  self: Product =>
  
  /** The narrowest possible type that is produced when this expression is evaluated. */
  type EvaluatedType <: Any

  // 树状结构的 fold 指收缩（展开是 expand）
  // 这里即指该表达式树是否可以直接变为某个常量，比如像 1 = 1 这样不需要计算也知道结果的表达式就属于 foldable 的
  def foldable: Boolean = false
  
  // 确定性：对于相同的输入，该表达式是否总能返回相同的结果
  def deterministic: Boolean = true
  
  // 虚函数，暂不明具体是否指"结果是否可 null"
  def nullable: Boolean
  
  // 表达式中引用的所有 Attribute
  def references: AttributeSet = AttributeSet(children.flatMap(_.references.iterator))
  
  // 在给定的行数据上应用该 Expression 并返回结果
  def eval(input: Row = null): EvaluatedType
  
  lazy val resolved: Boolean = childrenResolved
  def childrenResolved: Boolean = children.forall(_.resolved)
  
  // 结果的数据类型
  def dataType: DataType
  
  // 格式比较漂亮的 toString
  def prettyString: String = // ...
  
  // Returns true when two expressions will always compute the same result
  def semanticEquals(other: Expression): Boolean = // ...
}

// 二元 Expression 结点
abstract class BinaryExpression extends Expression with trees.BinaryNode[Expression] {
  self: Product =>

  def symbol: String

  override def foldable: Boolean = left.foldable && right.foldable

  override def nullable: Boolean = left.nullable || right.nullable

  override def toString: String = s"($left $symbol $right)"
}

// 一元 Expression 结点
abstract class UnaryExpression extends Expression with trees.UnaryNode[Expression] {
  self: Product =>
}

// 叶子 Expression 结点
abstract class LeafExpression extends Expression with trees.LeafNode[Expression] {
  self: Product =>
}
```

在学习过 `TreeNode` 以后，这个类就显得很好懂了。UML 类图变成了这样：

![](/img/Spark-Catalyst@5.jpg)

为了有助于吸收，我们可以把 `QueryPlan` 理解为单个执行计划，其中包括唯一的一个 `SELECT` 或 `CREATE` 等关键字。这类关键字在一条 SQL 语句中可以多次出现，因此 SparkSQL 把我们输入的语句解析为多个 `QueryPlan`，并以树状结构把它们组织起来，方便优化以及分清他们执行的先后顺序。在这里，`QueryPlan` 这棵树并不是那篇论文中提到的抽象语法树。每个查询计划对应着一句表达式，这些表达式从我们输入的 SQL 语句中拆分出来，也就是 `Expression` 树。一句表达式的词素被 Parser 以树状结构组织，这棵树才是那篇论文中提到的抽象语法树。不信的话，你可以在项目中找到 `Literal` 类（用于表示 SQL 语句中的一个常量词素），它继承自 `LeafExpression`。

除了 `Expression`，`QueryPlan` 还出现了 `Attribute` 类。也许你和我一开始一样会认为这个类的角色相当于一个 bean，实则不然。我们先来看看它的源代码：

```scala
abstract class Attribute extends NamedExpression {
  self: Product =>

  override def references: AttributeSet = AttributeSet(this)

  override def toAttribute: Attribute = this
  
  def withNullability(newNullability: Boolean): Attribute
  def withQualifiers(newQualifiers: Seq[String]): Attribute
  def withName(newName: String): Attribute

  def newInstance(): Attribute

}
```

可以看到该类继承自 `NamedExpression`，从命名上看也能猜出这个类继承自 `Expression`。`Attribute` 类重载了 `Expression` 的 `references` 函数使其指向自身，可见 Spark 认为出现在语句中的 Attribute 本身也应该属于一个 Expression，因为在之前的分析中我们就知道，`Expression` 这个类不仅仅用来表达一句表达式，还用来表达表达式中的一个词素，因此这样的设计也是合情合理的。

我们再来看看 `NamedExpression`：

```scala
object NamedExpression {
  private val curId = new java.util.concurrent.atomic.AtomicLong()
  def newExprId: ExprId = ExprId(curId.getAndIncrement())
  def unapply(expr: NamedExpression): Option[(String, DataType)] = Some(expr.name, expr.dataType)
}

/**
 * A globally unique (within this JVM) id for a given named expression.
 *
 * Used to identify which attribute output by a relation is being
 * referenced in a subsequent computation.
 */
case class ExprId(id: Long)

abstract class NamedExpression extends Expression {
  self: Product =>

  def name: String
  def exprId: ExprId
  
  /**
   * All possible qualifiers for the expression.
   *
   * For now, since we do not allow using original table name to qualify a column name once the
   * table is aliased, this can only be:
   *
   * 1. Empty Seq: when an attribute doesn't have a qualifier,
   *    e.g. top level attributes aliased in the SELECT clause, or column from a LocalRelation.
   * 2. Single element: either the table name or the alias name of the table.
   */
  def qualifiers: Seq[String]

  /**
   * Returns a dot separated fully qualified name for this attribute.  Given that there can be
   * multiple qualifiers, it is possible that there are other possible way to refer to this
   * attribute.
   */
  def qualifiedName: String = (qualifiers.headOption.toSeq :+ name).mkString(".")

  def toAttribute: Attribute

  /** Returns the metadata when an expression is a reference to another expression with metadata. */
  def metadata: Metadata = Metadata.empty

  protected def typeSuffix = // ...
}
```

`NamedExpression` 相对于 `Expression` 做出的扩展并不多，仅仅是加上了 `name` 、`exprId` 、 `qualifiers` 、 `metadata` 字段以及相关方法。

![](/img/Spark-Catalyst@6.jpg)

至此，`QueryPlan` 就全部解析完了，让我们再次回到 `LogicalPlan`。

## LogicalPlan

我们回到梦开始的地方：

```scala
/**
 * 执行计划的代价估计。默认叶子节点的代价为 1，非叶子节点的代价为各子结点代价的乘积。
 * 不同类型的执行计划通过重载其 statistics 函数来改变代价计算方式。
 */
private[sql] case class Statistics(sizeInBytes: BigInt)

abstract class LogicalPlan extends QueryPlan[LogicalPlan] with Logging {
  self: Product =>
  
  // 计算该执行计划的 Statistics。默认结果为子结点的 Statistics 乘积。叶子节点不支持该函数
  def statistics: Statistics = // ...
  
  def childrenResolved: Boolean = !children.exists(!_.resolved)
  lazy val resolved: Boolean = !expressions.exists(!_.resolved) && childrenResolved
  
  override protected def statePrefix = if (!resolved) "'" else super.statePrefix
  
  // 当给定 LogicalPlan 与当前计划返回相同结果时返回 true。当无法直接决定是否返回相同结果时将返回 false
  def sameResult(plan: LogicalPlan): Boolean = // ...
  
  def resolveChildren(
      nameParts: Seq[String],
      resolver: Resolver,
      throwErrors: Boolean = false): Option[NamedExpression] =
    resolve(nameParts, children.flatMap(_.output), resolver, throwErrors)
  // 注：Resolver 实际上是一个用 type 关键字设定的类型别名，原本是一个(String, String) => Boolean
  // 根据设置的不同，Resolver 只可能是两个字符串之间的 equalsIgnoreCase 或者 equals
  
  def resolve(
      nameParts: Seq[String],
      resolver: Resolver,
      throwErrors: Boolean = false): Option[NamedExpression] =
    resolve(nameParts, output, resolver, throwErrors)
	
  def resolveQuoted(
      name: String,
      resolver: Resolver): Option[NamedExpression] =
    resolve(parseAttributeName(name), resolver, true)
  
  // 把传入的 name 按‘.’分开。由一对'`'包裹的字符串不会被拆开
  // `[scope].AttributeName.[nested].[fields]...`
  // "a.`b.c`.d" -> ["a", "b.c", "d"]
  private def parseAttributeName(name: String): Seq[String] = // ...
  
  // 根据传入的 nameParts 和 attribute，可能返回一个(Attribute, [nested fields])对
  // 结果对的[nested] fields 实际上是 nameParts 的[2, ...]，因为第一个元素是 table name，第二个是 AttributeName，实际的 field 名从第三个开始
  // 当传入的 nameParts 就是个 table.column 时，结果对的_2 就是个 Nil
  private def resolveAsTableColumn(
      nameParts: Seq[String],
      resolver: Resolver,
      attribute: Attribute): Option[(Attribute, List[String])] = // ...
  
  /** Performs attribute resolution given a name and a sequence of possible attributes. */
  protected def resolve(
      nameParts: Seq[String],
      input: Seq[Attribute],
      resolver: Resolver,
      throwErrors: Boolean): Option[NamedExpression] = {

    // 根据传入的 nameParts 以及输入的所有 Attribute，产生所有吻合的[Attribute, [field]]对
    var candidates: Seq[(Attribute, List[String])] = {
      // 假设传入的 nameParts 格式为 table.column
      if (nameParts.length > 1) {
        input.flatMap { attr =>
          resolveAsTableColumn(nameParts, resolver, attr)
        }
      } else {
        Seq.empty
      }
    }

    // 如果没有匹配，就假设 nameParts 只包含 column 名
    if (candidates.isEmpty) {
      candidates = input.flatMap { candidate =>
        resolveAsColumn(nameParts, resolver, candidate)
      }
    }

    def name = UnresolvedAttribute(nameParts).name

    candidates.distinct match {
      // 只有一个匹配，没有 nested field，直接返回
      case Seq((a, Nil)) => Some(a)

      // 只有一个匹配，但有 nested fields，对其进行解压
      case Seq((a, nestedFields)) =>
        try {
          // The foldLeft adds GetFields for every remaining parts of the identifier,
          // and aliases it with the last part of the identifier.
          // For example, consider "a.b.c", where "a" is resolved to an existing attribute.
          // Then this will add GetField("c", GetField("b", a)), and alias
          // the final expression as "c".
          val fieldExprs = nestedFields.foldLeft(a: Expression)((expr, fieldName) =>
            ExtractValue(expr, Literal(fieldName), resolver))
          val aliasName = nestedFields.last
          Some(Alias(fieldExprs, aliasName)())
        } catch {
          case a: AnalysisException if !throwErrors => None
        }

      // 没有匹配
      case Seq() =>
        logTrace(s"Could not find $name in ${input.mkString(", ")}")
        None

      // 多个匹配
      case ambiguousReferences =>
        val referenceNames = ambiguousReferences.map(_._1).mkString(", ")
        throw new AnalysisException(
          s"Reference '$name' is ambiguous, could be: $referenceNames.")
    }
  }
}
```

可见，`LogicalPlan` 比起 `QueryPlan` 扩展了 resolve 相关的操作，还加上了一个 `statistics` 变量。该变量实际上就是一个 `BigInt`，代表计划的执行代价，猜想在后续的执行计划优化过程中将会使用这个变量。

![](/img/Spark-Catalyst@7.jpg)

## 实现类

我们由浅到深地研究了三个核心类：`LogicalPlan` 、 `QueryPlan` 和 `TreeNode`，也学习了它们周边的一些核心类，如 `Expression` 、 `Attribute` 等。但以上的这些类都有一个特点：它们都是虚类，我们至今没有见到一个 concrete 的类。同时，早在 `TreeNode` 就已经有使用 `productIterator` 等 `Product` 特质的方法，但直到 `LogicalPlan` 都仍然把混入 `Product` 特质的工作交给子类，我们仍然不知道 `Product` 的元素究竟意味着什么。

现在我们就先来看看 `LogicalPlan` 的子类。实际上就在 `LogicalPlan.scala` 中我们就能看到三个 `LogicalPlan` 的子类：

```scala
abstract class LeafNode extends LogicalPlan with trees.LeafNode[LogicalPlan] {
  self: Product =>
}

abstract class UnaryNode extends LogicalPlan with trees.UnaryNode[LogicalPlan] {
  self: Product =>
}

abstract class BinaryNode extends LogicalPlan with trees.BinaryNode[LogicalPlan] {
  self: Product =>
}
```

![](/img/Spark-Catalyst@8.jpg)

但暂时来讲并没有什么用，这三个类也是虚类，依然没有混入 `Product` 特质，甚至什么方法都没有实现。我们随便抓一个他们的子类：

```scala
case class Intersect(left: LogicalPlan, right: LogicalPlan) extends BinaryNode {
  override def output: Seq[Attribute] = left.output
}
```

这下就真相大白了。所有的这些虚类的实现类都是 Scala 的 case class，而 Scala 的样例类都会自动实现 `Product` 特质，并以 case class 的数据成员作为 Product 的元素。现在你再回到之前的三个核心类中去看那些调用了 `productIterator` 的方法你就能理解了。

## 总结

在这篇文章中，我们学习了以 `LogicalPlan` 类为核心的执行计划树数据结构。下一次我们将开始讲解 Analyzer 的相关代码，敬请期待。
