---
title: Spark Catalyst 源码解析：Parser
category: Spark
tags:
  - Spark
  - SparkSQL
date: 2015-08-18
updated: 2015-08-18
toc: true
---

在[上一篇文章](/sparksql_catalyst_source_1/)中，我们了解了 SparkSQL 查询的基本执行过程，并了解到 `SQLContext` 的内部类 `QueryExecution` 包含了整个执行过程的每一个执行步骤。

在这篇文章中，我将开始讲解 SQL 语句如何通过 Parser 转变为 Unresolved Logical Plan。

<!-- more -->

## DDLParser

我们回到 `SQLContext#parseSql` 方法：

```scala
@transient
protected[sql] val ddlParser = new DDLParser(sqlParser.parse(_))

@transient
protected[sql] val sqlParser = new SparkSQLParser(getSQLDialect().parse(_))

protected[sql] def parseSql(sql: String): LogicalPlan = ddlParser.parse(sql, false)
```

可以看到，`parseSql` 方法调用了 `ddlParser` 的 `parse` 方法。`ddlParser` 在初始化时传入了 `sqlParser.parse` 方法作为参数，而 `sqlParser` 在初始化时也传入了一个 SQL 方言的 `parse` 方法作为参数。这三个 `parse` 之间很有可能是一个 `fallback` 的关系。那我们先来看看 `DDLParser`：

```scala
/**
 * A parser for foreign DDL commands.
 */
private[sql] class DDLParser(parseQuery: String => LogicalPlan)
  extends AbstractSparkSQLParser with DataTypeParser with Logging {

  def parse(input: String, exceptionOnError: Boolean): LogicalPlan = {
    try {
      // 先尝试用 AbstractSparkSQLParser#parse 进行解析
      parse(input)
    } catch {
      case ddlException: DDLException => throw ddlException
      
	  // 解析失败则使用传入的解析函数 parseQuery 进行解析
      case _ if !exceptionOnError => parseQuery(input)
      case x: Throwable => throw x
    }
  }
  
  // ...
}
```

先不急着往下看，因为这里调用了 `AbstractSparkSQLParser` 的 `parse` 方法。我们先看看 `AbstractSparkSQLParser`：

```scala
private[sql] abstract class AbstractSparkSQLParser
  extends StandardTokenParsers with PackratParsers {

  def parse(input: String): LogicalPlan = {
    // 将 Keyword 们作为保留字放入到 lexical 变量中
    initLexical
	// 开始解释传入的字符串
    phrase(start)(new lexical.Scanner(input)) match {
      case Success(plan, _) => plan
      case failureOrError => sys.error(failureOrError.toString)
    }
  }
  /* One time initialization of lexical.This avoid reinitialization of  lexical in parse method */
  protected lazy val initLexical: Unit = lexical.initialize(reservedWords)

  protected case class Keyword(str: String) {
    def normalize: String = lexical.normalizeKeyword(str)
    def parser: Parser[String] = normalize
  }

  protected implicit def asParser(k: Keyword): Parser[String] = k.parser

  // 通过反射机制将类的所有返回 Keyword 类型的函数结果注册为保留字（reserved word）
  protected lazy val reservedWords: Seq[String] =
    this.getClass
      .getMethods
      .filter(_.getReturnType == classOf[Keyword])
      .map(_.invoke(this).asInstanceOf[Keyword].normalize)

  // Set the keywords as empty by default, will change that later.
  // SQL 词素
  override val lexical = new SqlLexical

  protected def start: Parser[LogicalPlan]

  // Returns the whole input string
  protected lazy val wholeInput: Parser[String] = new Parser[String] {
    def apply(in: Input): ParseResult[String] =
      Success(in.source.toString, in.drop(in.source.length()))
  }

  // Returns the rest of the input string that are not parsed yet
  protected lazy val restInput: Parser[String] = new Parser[String] {
    def apply(in: Input): ParseResult[String] =
      Success(
        in.source.subSequence(in.offset, in.source.length()).toString,
        in.drop(in.source.length()))
  }
}
```

我们看到，真正启动 `parse` 过程的实际上是如下代码块：

```scala
phrase(start)(new lexical.Scanner(input)) match {
  case Success(plan, _) => plan
  case failureOrError => sys.error(failureOrError.toString)
}
```

这里调用的 `phrase` 方法实际上来自于 `AbstractSparkSQLParser` 的父类 `PackratParsers`。`PackratParsers` 和 `StandardTokenParsers` 实际上都是 Scala 自带的类。它们的功能较为复杂，而且 SparkSQL 本身的作用原理关系并不是很大，我在这里就简单讲述一下。

```scala
// PackratParsers.scala

/**
 *  A parser generator delimiting whole phrases (i.e. programs).
 *
 *  Overridden to make sure any input passed to the argument parser
 *  is wrapped in a `PackratReader`.
 */
override def phrase[T](p: Parser[T]) = {
  val q = super.phrase(p)
  new PackratParser[T] {
    def apply(in: Input) = in match {
      case in: PackratReader[_] => q(in)
      case in => q(new PackratReader(in))
    }
  }
}
```

可以看到，`PackratParsers#phrase` 方法接受一个 `Parser` 作为参数，并以其为参数调用了其父类 `Parsers` 的 `phrase` 方法，该方法同样返回一个 `Parser`。而后，`PackratParsers#phrase` 返回了一个 `PackratParser`，由 `AbstractSparkSQLParser` 调用这个对象的 `apply` 方法传入 SQL 语句。

我们回到 `DDLParser`：

```scala
private[sql] class DDLParser(parseQuery: String => LogicalPlan)
  extends AbstractSparkSQLParser with DataTypeParser with Logging {

  def parse(input: String, exceptionOnError: Boolean): LogicalPlan = {
    // ...
  }

  // 这些 keyword 会在 initLexical 时被加载
  protected val CREATE = Keyword("CREATE")
  protected val TEMPORARY = Keyword("TEMPORARY")
  protected val TABLE = Keyword("TABLE")
  protected val IF = Keyword("IF")
  protected val NOT = Keyword("NOT")
  protected val EXISTS = Keyword("EXISTS")
  protected val USING = Keyword("USING")
  protected val OPTIONS = Keyword("OPTIONS")
  protected val DESCRIBE = Keyword("DESCRIBE")
  protected val EXTENDED = Keyword("EXTENDED")
  protected val AS = Keyword("AS")
  protected val COMMENT = Keyword("COMMENT")
  protected val REFRESH = Keyword("REFRESH")

  protected lazy val ddl: Parser[LogicalPlan] = createTable | describeTable | refreshTable

  protected def start: Parser[LogicalPlan] = ddl
  
  // ...
  
}
```

在接下来的代码中，`AbstractSparkSQLParser` 实现了三个 parser：`createTable` 、 `describeTable` 和 `refreshTable`，并将其重载为 `AbstractSparkSQLParser#start` 变量，由此 `DDLParser` 改变了 `AbstractSparkSQLParser#start` 的功能。

上述的这些 Keyword 全都是 Spark 所支持的 DLL keyword，没有包含 SQL 的保留字。不难想象 `DDLParser` 仅用于解析 DDL 语句，当遇到 SQL 语句时，解析器将 fallback 到实例化 `DDLTask` 时传入的 `parseQuery` 函数，而这个函数正是 `SparkSQLParser#parse` 函数。

通过查看 `SparkSQLParser` 的源代码，可以有如下发现：

```scala
/**
 * The top level Spark SQL parser. This parser recognizes syntaxes that are available for all SQL
 * dialects supported by Spark SQL, and delegates all the other syntaxes to the `fallback` parser.
 *
 * @param fallback A function that parses an input string to a logical plan
 */
private[sql] class SparkSQLParser(fallback: String => LogicalPlan) extends AbstractSparkSQLParser {

  // ...
	
  protected val AS = Keyword("AS")
  protected val CACHE = Keyword("CACHE")
  protected val CLEAR = Keyword("CLEAR")
  protected val IN = Keyword("IN")
  protected val LAZY = Keyword("LAZY")
  protected val SET = Keyword("SET")
  protected val SHOW = Keyword("SHOW")
  protected val TABLE = Keyword("TABLE")
  protected val TABLES = Keyword("TABLES")
  protected val UNCACHE = Keyword("UNCACHE")
  
  // ...
  
}
```

从注释上看，`SparkSQLParser` 用于解析所有 SparkSQL 所支持的 SQL 方言所共有的关键字。当该解析器失败时，将会继续 fallback 到当时在 `SQLContext` 传入的 `getSQLDialect().parse(_)`，使用某个特定的 SQL 方言进行解析。


## 总结

个人认为大多数人应该不会太在意 Parser 的原理，毕竟没什么人会需要去修改 SparkSQL 语句的解析逻辑，因此这一篇文章只能算是抛砖引玉，真正的解析逻辑还有待你们自己去发掘。在下一篇文章中我会先为大家讲解一下 LogicalPlan 的数据结构，敬请期待。
