---
title: Spark Catalyst 进阶：Parser 词素
category: Spark Catalyst 源码解析
tags:
  - Spark
  - SparkSQL
  - Catalyst
date: 2015-08-22
---

在之前的 SparkSQL Catalyst 源码解析中，我大致的讲解了 SparkSQL 的执行流程，用户输入的 SQL 语句如何一步一步地变为 Logical Plan 再变为 Physical Plan，再执行成为结果 RDD。上一个系列旨在抛砖引玉，该流程中的每个重要部件如 `Parser` 、 `Analyzer` 、`Optimizer` 、 `Planner` 等仅仅讲解了它们是如何管理和运行一些列的 rule，但并未仔细讲解每一个 rule 的功能。

接下来的内容旨在更深入地研究这些被上一个系列所遗漏的细节实现，同时还会在之后考虑解析 SparkSQL 的 UDF 注册以及 cache 表功能。

那么作为进阶篇的第一篇，我们就先从 SparkSQL Parser 开始。

<!-- more -->

## Parsers

之前我们提到，在我们调用 `SQLContext#sql` 方法时，`SQLContext` 实际上以我们传入的 SQL 字符串为参数调用了 `parseSql` 方法来获取对应的 `LogicalPlan`，而 `parseSql` 方法则调用了 `ddlParser` 的 `parse` 方法。除此之外我们还了解到，SparkSQL 有着不止一个 parser，每个 parser 之间是 fallback 的关系，在上一个 parser 解析完成后，剩下的无法解析的内容再移交给下一个 parser。除了最顶层的 `ddlParser` 以外，依次往下还有一个 `SparkSQLParser` 和一个会根据设置而改变的 SQL 方言 Parser。

我们不妨先去了解一下默认环境下这个 SQL 方言 Parser 是什么：

```scala
// SQLContext.scala

// 通过作为 SparkSQLParser 的构造参数将 SQL 方言 Parser 注册为 fallback parser
protected[sql] val sqlParser = new SparkSQLParser(getSQLDialect().parse(_))

protected[sql] def getSQLDialect(): ParserDialect = {
  try {
    val clazz = Utils.classForName(dialectClassName)
    clazz.newInstance().asInstanceOf[ParserDialect]
	// 通过反射机制实例化了一个 ParserDialect 子类实例
  } catch {
    // ...
  }
}

protected[sql] def dialectClassName = if (conf.dialect == "sql") {
  classOf[DefaultParserDialect].getCanonicalName
  // 看来默认情况下的方言 Parser 就是这个 DefaultParserDialect
} else {
  conf.dialect
}
```

那么我们就看看这个 `DefaultParserDialect` 的源代码：

```scala
private[spark] class DefaultParserDialect extends ParserDialect {
  @transient
  protected val sqlParser = new SqlParser

  override def parse(sqlText: String): LogicalPlan = {
    sqlParser.parse(sqlText)
	// 也就是说，真正的 parse 工作由 SqlParser 完成
  }
}
```

那我们就去看看 `SqlParser`：

```scala
// 它和 SparkSQLParser、DDLParser 一样继承于 AbstractSparkSQLParser
class SqlParser extends AbstractSparkSQLParser with DataTypeParser {
  
  // 与 AbstractSparkSQLParser#parse 几乎完全一致，差别仅在于 phrase 的参数变成了 projection
  def parseExpression(input: String): Expression = {
    // Initialize the Keywords.
    initLexical
    phrase(projection)(new lexical.Scanner(input)) match {
      case Success(plan, _) => plan
      case failureOrError => sys.error(failureOrError.toString)
    }
  }
  
  // 一系列的 keyword，由 initLexical 方法注册为词素
  // 与 DDLParser 和 SparkSQLParser 都不同，这里我们找到了剩下的那些 SQL 常见字
  protected val ABS = Keyword("ABS")
  protected val ALL = Keyword("ALL")
  // ...
  protected val WHERE = Keyword("WHERE")
  protected val WITH = Keyword("WITH")
  
  // ...
}
```

OK，由此一来我们搞懂了最后一个 Parser 到底是什么了。它们之间的关系是这样的：

![](/img/Catalyst-Adv@1.jpg)

看起来相当复杂，要想完整理解，我们不仅需要看 Spark 的源代码，甚至还要学习 Scala 自带的分词器。不过，我们先不着急着去学习它们是怎么分词的。现在编译器的开发工作已经不像以前那样一个一个代码码过去了，否则光是实现一个状态转换机便是极其复杂的事。快捷的分词和语义分析器代码通常是由软件自动生成的。学习过编译原理的同学自然不会陌生，这种软件就叫 Flex。我们通过特殊的格式，将分词逻辑写在 flex 文件里，告诉它我们希望符合什么模式的词或表达式变成什么样的实例，Flex 便能根据我们的 flex 文件自动生成分词器。

Spark 也是类似。在 Spark 的类中，我们看得最多的就是 `Keyword`。这些对象包含了每一个 SQL 保留字，和我们编写 flex 文件是需要提供的信息内容是一样的。但一个完整的 flex 文件还需要有其它的信息，但我们不着急，毕竟已经找到一个起步点了。我们先来看看 `SqlParser`：

```scala
class SqlParser extends AbstractSparkSQLParser with DataTypeParser {

  // ...

  // 一堆 SQL 关键字...
  protected val ABS = Keyword("ABS")
  protected val ALL = Keyword("ALL")
  // ...
  protected val WHERE = Keyword("WHERE")
  protected val WITH = Keyword("WITH")
  
  // ...
  
  protected lazy val start: Parser[LogicalPlan] = start1 | insert | cte
  // 返回的是一个 Parser[LogicalPlan]，而且 start 这个变量是作为 phrase 参数在 AbstractSparkSQLParser#parse 里使用的
  // 越来越接近了，我们接着往下看
  
  protected lazy val start1: Parser[LogicalPlan] =
    (select | ("(" ~> select <~ ")")) *
    ( UNION ~ ALL        ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Union(q1, q2) }
    | INTERSECT          ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Intersect(q1, q2) }
    | EXCEPT             ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Except(q1, q2)}
    | UNION ~ DISTINCT.? ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Distinct(Union(q1, q2)) }
    )
  // 我倒，这些运算符是什么鬼！
	
  // ...
}
```

好，在继续往下看之前，我们需要先了解这些奇怪的运算符到底是什么意思。但我们先看看那个 `start1` 变量。这种语句格式，很明显是在利用这些关键字表达某些语句模式，并且给定了当符合这些模式时将应用什么方法来将其对应为相应的 `LogicalPlan`。那么我们现在要做的，就是学习这些运算符的含义，这样我们就能理解这些模式了。

我们先看一下 `Keyword` 类：

```scala
// AbstractSparkSQLParser.scala

// 通过隐式调用 Keyword 的 parser 方法来将其变为 Parser 实例
protected implicit def asParser(k: Keyword): Parser[String] = k.parser

protected case class Keyword(str: String) {
  def normalize: String = lexical.normalizeKeyword(str)
  def parser: Parser[String] = normalize
}
```

这下我们就能理解了，`AbstractSparkSQLParser` 通过一个隐式转换把 `Keyword` 转换为了 `Parser`，这些奇怪的运算符实际上是 `Parser` 的方法。这些方法实际上就在 `Parsers.scala` 里，通过查阅 ScalaDoc 就能了解到这些运算符的功能大致如下：

| 运算符 | 作用 |
| --- | --- |
| `~` | `p ~ q` succeeds if `p` succeeds and `q` succeeds on the input left over by `p`.<hr />Return a `Parser` that -- on success -- returns a `~` (like a `Pair`, but easier to pattern match on) that contains the result of `p` and that of `q`. The resulting parser fails if either `p` or `q` fails. |
| `~>` | `p ~> q` succeeds if `p` succeeds and `q` succeeds on the input left over by `p`.<hr />Return a `Parser` that -- on success -- returns the result of `q`. |
| `<~` | `p <~ q` succeeds if `p` succeeds and `q` succeeds on the input left over by `p`.<hr />Return a `Parser` that -- on success -- returns the result of `p`. |
| <code>&#124;</code> | <code>p &#124; q</code> succeeds if `p` succeeds or `q` succeeds.<hr />Return a `Parser` that returns the result of the first parser to succeed (out of `p` and `q`) The resulting parser succeeds if (and only if) - `p` succeeds, ''or'' - if `p` fails allowing back-tracking and `q` succeeds. |
| `^^` | `p ^^ f` succeeds if `p` succeeds; it returns `f` applied to the result of `p`. |
| `^^^` | `p ^^^ v` succeeds if `p` succeeds; discards its result, and returns `v` instead. |
| `*` | Returns a parser that repeatedly parses what this parser parses. |
| `?` | Returns a parser that optionally parses what this parser parses. |

语文不好，就不翻译了，这种等级的英语应该不算难懂。

## DDLParser

在了解过这些运算符的意思以后，我们就可以轻松愉快地阅读 Spark 定义的分词规则了。我们先从 `DDLParser` 开始：

```scala
private[sql] class DDLParser(parseQuery: String => LogicalPlan)
  extends AbstractSparkSQLParser with DataTypeParser with Logging {

  // ...
  
  // 关键字
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
  
  protected def start: Parser[LogicalPlan] = ddl
  protected lazy val ddl: Parser[LogicalPlan] = createTable | describeTable | refreshTable
  // 说明 DDLParser 可以 parse 的语句模式就是上面三种。我们接下来分别看看它们各自是什么模式
  
  // 匹配建表 SQL 语句中的一个列。形如 `name String` 、 `age INT COMMENT "user's age"`
  protected lazy val column: Parser[StructField] =
  // ident 匹配一个由字符组成的 identifier
  // 列名     列类型      可能存在的列 COMMENT           生成该列对应的 StructField  
    ident ~ dataType ~ (COMMENT ~> stringLit).?  ^^ { case columnName ~ typ ~ cm =>
      val meta = cm match {
        case Some(comment) =>
          new MetadataBuilder().putString(COMMENT.str.toLowerCase, comment).build()
        case None => Metadata.empty
      }

      StructField(columnName, typ, nullable = true, meta)
    }
	
  // 匹配建表语句中的模式定义部分，形如 `(name STRING, age INT COMMENT "user's age")`
  //                                                        (     由 `,` 间隔的 column 们      )
  protected lazy val tableCols: Parser[Seq[StructField]] = "(" ~> repsep(column, ",") <~ ")"
  
  protected lazy val createTable: Parser[LogicalPlan] =
    //        返回是否 temp                   返回是否 NOT           表名
    (CREATE ~> TEMPORARY.? <~ TABLE) ~ (IF ~> NOT <~ EXISTS).? ~ ident ~
      tableCols.? ~ (USING ~> className) ~ (OPTIONS ~> options).? ~ (AS ~> restInput).? ^^ {
      case temp ~ allowExisting ~ tableName ~ columns ~ provider ~ opts ~ query =>
        if (temp.isDefined && allowExisting.isDefined) {
          throw new DDLException(
            "a CREATE TEMPORARY TABLE statement does not allow IF NOT EXISTS clause.")
        }

        val options = opts.getOrElse(Map.empty[String, String])
        if (query.isDefined) {
          if (columns.isDefined) {
            throw new DDLException(
              "a CREATE TABLE AS SELECT statement does not allow column definitions.")
          }
          // When IF NOT EXISTS clause appears in the query, the save mode will be ignore.
          val mode = if (allowExisting.isDefined) {
            SaveMode.Ignore
          } else if (temp.isDefined) {
            SaveMode.Overwrite
          } else {
            SaveMode.ErrorIfExists
          }

          val queryPlan = parseQuery(query.get)
		  // 使用 AS+SELECT 语句返回的结果建表
          CreateTableUsingAsSelect(tableName,
            provider,
            temp.isDefined,
            Array.empty[String],
            mode,
            options,
            queryPlan)
        } else {
          val userSpecifiedSchema = columns.flatMap(fields => Some(StructType(fields)))
		  // 直接建表
          CreateTableUsing(
            tableName,
            userSpecifiedSchema,
            provider,
            temp.isDefined,
            options,
            allowExisting.isDefined,
            managedIfNoPath = false)
        }
    }
	// 至此我们知道了两个 LogicalPlan 子类，CreateTableUsingAsSelect 和 CreateTableUsing
	
	protected lazy val describeTable: Parser[LogicalPlan] =
  // DESCRIBE      [EXTENDED]      [dataBase.]       table
    (DESCRIBE ~> opt(EXTENDED)) ~ (ident <~ ".").? ~ ident  ^^ {
      case e ~ db ~ tbl =>
        val tblIdentifier = db match {
          case Some(dbName) =>
            Seq(dbName, tbl)
          case None =>
            Seq(tbl)
        }
        DescribeCommand(UnresolvedRelation(tblIdentifier, None), e.isDefined)
    }
	// 又一个 LogicalPlan 子类，DescribeCommand，左子是[db.]tbl 的 UnresolvedRelation，右子是 ` 是否 Extended`

	protected lazy val refreshTable: Parser[LogicalPlan] =
	REFRESH    TABLE    [db.]                 table
    REFRESH ~> TABLE ~> (ident <~ ".").? ~ ident ^^ {
      case maybeDatabaseName ~ tableName =>
        RefreshTable(maybeDatabaseName.getOrElse("default"), tableName)
    }
	// RefreshTable，左子为数据库名，默认为 `default`，右子为表名
}
```

OK，至此 `DDLParser` 支持的三种语句我们就解析完了，它们分别是 `CREATE` 、 `DESCRIBE` 和 `REFRESH` 语句。它无法解析的语句将交由它的 fallback 解析方法来解析。那好，我们 fallback ！

## SparkSQLParser

```scala
private[sql] class SparkSQLParser(fallback: String => LogicalPlan) extends AbstractSparkSQLParser {

  // ...

  // 关键字
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
 
  override protected lazy val start: Parser[LogicalPlan] = cache | uncache | set | show | others
  // 一共五个：CACHE、UNCACHE、SET、SHOW，还有一个 others，也许包含不止一种操作
  
  private lazy val cache: Parser[LogicalPlan] =
    CACHE ~> LAZY.? ~ (TABLE ~> ident) ~ (AS ~> restInput).? ^^ {
      case isLazy ~ tableName ~ plan =>
        CacheTableCommand(tableName, plan.map(fallback), isLazy.isDefined)
    }
  // CacheTableCommand(表名, 查询用的 Logical Plan, 是否 lazy)
  
  private lazy val uncache: Parser[LogicalPlan] =
    ( UNCACHE ~ TABLE ~> ident ^^ {
        case tableName => UncacheTableCommand(tableName)
      }
    | CLEAR ~ CACHE ^^^ ClearCacheCommand
    )
  // UncacheTableCommand(表名)、ClearCacheCommand 清空 cache

  private lazy val set: Parser[LogicalPlan] =
    SET ~> restInput ^^ {
      case input => SetCommandParser(input)
    }
  // SetCommandParser(输入)，该类就定义在 SparkSQLParsers 里，会尝试从输入中拆分出键值对，并返回 SetCommand(key, value)

  private lazy val show: Parser[LogicalPlan] =
    SHOW ~> TABLES ~ (IN ~> ident).? ^^ {
      case _ ~ dbName => ShowTablesCommand(dbName)
    }
  // ShowTablesCommand(数据库名)
  
  // 剩余的其他所有输入
  protected lazy val wholeInput: Parser[String] = new Parser[String] {
    def apply(in: Input): ParseResult[String] =
      Success(in.source.toString, in.drop(in.source.length()))
  }
  
  private lazy val others: Parser[LogicalPlan] =
    wholeInput ^^ {
      case input => fallback(input)
  }
  // 这下我们就明白了，CACHE、UNCACHE、SET、SHOW 四种模式无法匹配的语句将通过 others 直接分配给 fallback
  
}
```

至此我们又收集到了五种 `LogicalPlan`：`CacheTableCommand`、`UncacheTableCommand`、`ClearCacheCommand`、`SetCommand`、`ShowTablesCommand`。那么我们继续 fallback ！

## SqlParser

```scala
class SqlParser extends AbstractSparkSQLParser with DataTypeParser {

  def parseExpression(input: String): Expression = {
    // Initialize the Keywords.
    initLexical
    phrase(projection)(new lexical.Scanner(input)) match {
      case Success(plan, _) => plan
      case failureOrError => sys.error(failureOrError.toString)
    }
  }

  // 各种 SQL 关键字
  protected val ABS = Keyword("ABS")
  protected val ALL = Keyword("ALL")
  protected val AND = Keyword("AND")
  protected val APPROXIMATE = Keyword("APPROXIMATE")
  protected val AS = Keyword("AS")
  protected val ASC = Keyword("ASC")
  protected val AVG = Keyword("AVG")
  protected val BETWEEN = Keyword("BETWEEN")
  protected val BY = Keyword("BY")
  protected val CASE = Keyword("CASE")
  protected val CAST = Keyword("CAST")
  protected val COALESCE = Keyword("COALESCE")
  protected val COUNT = Keyword("COUNT")
  protected val DESC = Keyword("DESC")
  protected val DISTINCT = Keyword("DISTINCT")
  protected val ELSE = Keyword("ELSE")
  protected val END = Keyword("END")
  protected val EXCEPT = Keyword("EXCEPT")
  protected val FALSE = Keyword("FALSE")
  protected val FIRST = Keyword("FIRST")
  protected val FROM = Keyword("FROM")
  protected val FULL = Keyword("FULL")
  protected val GROUP = Keyword("GROUP")
  protected val HAVING = Keyword("HAVING")
  protected val IF = Keyword("IF")
  protected val IN = Keyword("IN")
  protected val INNER = Keyword("INNER")
  protected val INSERT = Keyword("INSERT")
  protected val INTERSECT = Keyword("INTERSECT")
  protected val INTO = Keyword("INTO")
  protected val IS = Keyword("IS")
  protected val JOIN = Keyword("JOIN")
  protected val LAST = Keyword("LAST")
  protected val LEFT = Keyword("LEFT")
  protected val LIKE = Keyword("LIKE")
  protected val LIMIT = Keyword("LIMIT")
  protected val LOWER = Keyword("LOWER")
  protected val MAX = Keyword("MAX")
  protected val MIN = Keyword("MIN")
  protected val NOT = Keyword("NOT")
  protected val NULL = Keyword("NULL")
  protected val ON = Keyword("ON")
  protected val OR = Keyword("OR")
  protected val ORDER = Keyword("ORDER")
  protected val SORT = Keyword("SORT")
  protected val OUTER = Keyword("OUTER")
  protected val OVERWRITE = Keyword("OVERWRITE")
  protected val REGEXP = Keyword("REGEXP")
  protected val RIGHT = Keyword("RIGHT")
  protected val RLIKE = Keyword("RLIKE")
  protected val SELECT = Keyword("SELECT")
  protected val SEMI = Keyword("SEMI")
  protected val SQRT = Keyword("SQRT")
  protected val SUBSTR = Keyword("SUBSTR")
  protected val SUBSTRING = Keyword("SUBSTRING")
  protected val SUM = Keyword("SUM")
  protected val TABLE = Keyword("TABLE")
  protected val THEN = Keyword("THEN")
  protected val TRUE = Keyword("TRUE")
  protected val UNION = Keyword("UNION")
  protected val UPPER = Keyword("UPPER")
  protected val WHEN = Keyword("WHEN")
  protected val WHERE = Keyword("WHERE")
  protected val WITH = Keyword("WITH")

  protected def assignAliases(exprs: Seq[Expression]): Seq[NamedExpression] = {
    exprs.zipWithIndex.map {
      case (ne: NamedExpression, _) => ne
      case (e, i) => Alias(e, s"c$i")()
    }
  }

  protected lazy val start: Parser[LogicalPlan] = start1 | insert | cte
  // 这里的 start1 和 cte 很有可能包含了不止一个操作
  
  
  // 用于解析表达式（Expression）的 Parser 们
  
  // 最基本的表达式词素，包括 `*` 、 `table.*`
  protected lazy val baseExpression: Parser[Expression] =
    ( "*" ^^^ UnresolvedStar(None)
    | ident <~ "." ~ "*" ^^ { case tableName => UnresolvedStar(Option(tableName)) }
    | primary
    )
	
  // 根据表达式运算符的优先级开始逐渐建树
  // 首先是乘除、取余与位运算
  protected lazy val productExpression: Parser[Expression] =
    baseExpression *
      ( "*" ^^^ { (e1: Expression, e2: Expression) => Multiply(e1, e2) }
      | "/" ^^^ { (e1: Expression, e2: Expression) => Divide(e1, e2) }
      | "%" ^^^ { (e1: Expression, e2: Expression) => Remainder(e1, e2) }
      | "&" ^^^ { (e1: Expression, e2: Expression) => BitwiseAnd(e1, e2) }
      | "|" ^^^ { (e1: Expression, e2: Expression) => BitwiseOr(e1, e2) }
      | "^" ^^^ { (e1: Expression, e2: Expression) => BitwiseXor(e1, e2) }
      )
	  
  // 然后是加减	  
  protected lazy val termExpression: Parser[Expression] =
    productExpression *
      ( "+" ^^^ { (e1: Expression, e2: Expression) => Add(e1, e2) }
      | "-" ^^^ { (e1: Expression, e2: Expression) => Subtract(e1, e2) }
      )

  // 然后是比较符	  
  protected lazy val comparisonExpression: Parser[Expression] =
    ( termExpression ~ ("="  ~> termExpression) ^^ { case e1 ~ e2 => EqualTo(e1, e2) }
    | termExpression ~ ("<"  ~> termExpression) ^^ { case e1 ~ e2 => LessThan(e1, e2) }
    | termExpression ~ ("<=" ~> termExpression) ^^ { case e1 ~ e2 => LessThanOrEqual(e1, e2) }
    | termExpression ~ (">"  ~> termExpression) ^^ { case e1 ~ e2 => GreaterThan(e1, e2) }
    | termExpression ~ (">=" ~> termExpression) ^^ { case e1 ~ e2 => GreaterThanOrEqual(e1, e2) }
    | termExpression ~ ("!=" ~> termExpression) ^^ { case e1 ~ e2 => Not(EqualTo(e1, e2)) }
    | termExpression ~ ("<>" ~> termExpression) ^^ { case e1 ~ e2 => Not(EqualTo(e1, e2)) }
    | termExpression ~ ("<=>" ~> termExpression) ^^ { case e1 ~ e2 => EqualNullSafe(e1, e2) }
    | termExpression ~ NOT.? ~ (BETWEEN ~> termExpression) ~ (AND ~> termExpression) ^^ {
        case e ~ not ~ el ~ eu =>
          val betweenExpr: Expression = And(GreaterThanOrEqual(e, el), LessThanOrEqual(e, eu))
          not.fold(betweenExpr)(f => Not(betweenExpr))
      }
    | termExpression ~ (RLIKE  ~> termExpression) ^^ { case e1 ~ e2 => RLike(e1, e2) }
    | termExpression ~ (REGEXP ~> termExpression) ^^ { case e1 ~ e2 => RLike(e1, e2) }
    | termExpression ~ (LIKE   ~> termExpression) ^^ { case e1 ~ e2 => Like(e1, e2) }
    | termExpression ~ (NOT ~ LIKE ~> termExpression) ^^ { case e1 ~ e2 => Not(Like(e1, e2)) }
    | termExpression ~ (IN ~ "(" ~> rep1sep(termExpression, ",")) <~ ")" ^^ {
        case e1 ~ e2 => In(e1, e2)
      }
    | termExpression ~ (NOT ~ IN ~ "(" ~> rep1sep(termExpression, ",")) <~ ")" ^^ {
        case e1 ~ e2 => Not(In(e1, e2))
      }
    | termExpression <~ IS ~ NULL ^^ { case e => IsNull(e) }
    | termExpression <~ IS ~ NOT ~ NULL ^^ { case e => IsNotNull(e) }
    | NOT ~> termExpression ^^ {e => Not(e)}
    | termExpression
    )    	  
  
  // 然后是 AND 关系
  protected lazy val andExpression: Parser[Expression] =
    comparisonExpression * (AND ^^^ { (e1: Expression, e2: Expression) => And(e1, e2) })
	
  // OR 关系	
  protected lazy val orExpression: Parser[Expression] =
    andExpression * (OR ^^^ { (e1: Expression, e2: Expression) => Or(e1, e2) })	
  
  // 基本表达式解析树的顶层
  protected lazy val expression: Parser[Expression] =
    orExpression

  // 函数	
  protected lazy val function: Parser[Expression] =
    ( SUM   ~> "(" ~> expression             <~ ")" ^^ { case exp => Sum(exp) }
    | SUM   ~> "(" ~> DISTINCT ~> expression <~ ")" ^^ { case exp => SumDistinct(exp) }
    | COUNT ~  "(" ~> "*"                    <~ ")" ^^ { case _ => Count(Literal(1)) }
    | COUNT ~  "(" ~> expression             <~ ")" ^^ { case exp => Count(exp) }
    | COUNT ~> "(" ~> DISTINCT ~> repsep(expression, ",") <~ ")" ^^
      { case exps => CountDistinct(exps) }
    | APPROXIMATE ~ COUNT ~ "(" ~ DISTINCT ~> expression <~ ")" ^^
      { case exp => ApproxCountDistinct(exp) }
    | APPROXIMATE ~> "(" ~> floatLit ~ ")" ~ COUNT ~ "(" ~ DISTINCT ~ expression <~ ")" ^^
      { case s ~ _ ~ _ ~ _ ~ _ ~ e => ApproxCountDistinct(e, s.toDouble) }
    | FIRST ~ "(" ~> expression <~ ")" ^^ { case exp => First(exp) }
    | LAST  ~ "(" ~> expression <~ ")" ^^ { case exp => Last(exp) }
    | AVG   ~ "(" ~> expression <~ ")" ^^ { case exp => Average(exp) }
    | MIN   ~ "(" ~> expression <~ ")" ^^ { case exp => Min(exp) }
    | MAX   ~ "(" ~> expression <~ ")" ^^ { case exp => Max(exp) }
    | UPPER ~ "(" ~> expression <~ ")" ^^ { case exp => Upper(exp) }
    | LOWER ~ "(" ~> expression <~ ")" ^^ { case exp => Lower(exp) }
    | IF ~ "(" ~> expression ~ ("," ~> expression) ~ ("," ~> expression) <~ ")" ^^
      { case c ~ t ~ f => If(c, t, f) }
    | CASE ~> expression.? ~ rep1(WHEN ~> expression ~ (THEN ~> expression)) ~
        (ELSE ~> expression).? <~ END ^^ {
          case casePart ~ altPart ~ elsePart =>
            val branches = altPart.flatMap { case whenExpr ~ thenExpr =>
              Seq(whenExpr, thenExpr)
            } ++ elsePart
            casePart.map(CaseKeyWhen(_, branches)).getOrElse(CaseWhen(branches))
        }
    | (SUBSTR | SUBSTRING) ~ "(" ~> expression ~ ("," ~> expression) <~ ")" ^^
      { case s ~ p => Substring(s, p, Literal(Integer.MAX_VALUE)) }
    | (SUBSTR | SUBSTRING) ~ "(" ~> expression ~ ("," ~> expression) ~ ("," ~> expression) <~ ")" ^^
      { case s ~ p ~ l => Substring(s, p, l) }
    | COALESCE ~ "(" ~> repsep(expression, ",") <~ ")" ^^ { case exprs => Coalesce(exprs) }
    | SQRT  ~ "(" ~> expression <~ ")" ^^ { case exp => Sqrt(exp) }
    | ABS   ~ "(" ~> expression <~ ")" ^^ { case exp => Abs(exp) }
    | ident ~ ("(" ~> repsep(expression, ",")) <~ ")" ^^
      { case udfName ~ exprs => UnresolvedFunction(udfName, exprs) }
    )

  // CAST 关键字的类型转换	
  protected lazy val cast: Parser[Expression] =
    CAST ~ "(" ~> expression ~ (AS ~> dataType) <~ ")" ^^ {
      case exp ~ t => Cast(exp, t)
    }

  // 解析常量的入口，可以看到包括数字、布尔常量、字符串常量和 NULL	
  protected lazy val literal: Parser[Literal] =
    ( numericLiteral
    | booleanLiteral
    | stringLit ^^ {case s => Literal.create(s, StringType) }
    | NULL ^^^ Literal.create(null, NullType)
    )

  // 解析布尔常量	
  protected lazy val booleanLiteral: Parser[Literal] =
    ( TRUE ^^^ Literal.create(true, BooleanType)
    | FALSE ^^^ Literal.create(false, BooleanType)
    )

  // 解析数字常量	
  protected lazy val numericLiteral: Parser[Literal] =
    signedNumericLiteral | unsignedNumericLiteral

  // 解析正负符号	
  protected lazy val sign: Parser[String] =
    "+" | "-"

  // 解析有符号数字常量	
  protected lazy val signedNumericLiteral: Parser[Literal] =
    ( sign ~ numericLit  ^^ { case s ~ l => Literal(toNarrowestIntegerType(s + l)) }
    | sign ~ floatLit ^^ { case s ~ f => Literal((s + f).toDouble) }
    )

  // 解析无符号数字常量	
  protected lazy val unsignedNumericLiteral: Parser[Literal] =
    ( numericLit ^^ { n => Literal(toNarrowestIntegerType(n)) }
    | floatLit ^^ { f => Literal(f.toDouble) }
    )

  private def toNarrowestIntegerType(value: String): Any = {
    val bigIntValue = BigDecimal(value)

    bigIntValue match {
      case v if bigIntValue.isValidInt => v.toIntExact
      case v if bigIntValue.isValidLong => v.toLongExact
      case v => v.underlying()
    }
  }

  // 解析浮点数
  protected lazy val floatLit: Parser[String] =
    ( "." ~> unsignedNumericLiteral ^^ { u => "0." + u }
    | elem("decimal", _.isInstanceOf[lexical.FloatLit]) ^^ (_.chars)
    )

  protected lazy val signedPrimary: Parser[Expression] =
    sign ~ primary ^^ { case s ~ e => if (s == "-") UnaryMinus(e) else e}

  protected lazy val primary: PackratParser[Expression] =
    ( literal
    | expression ~ ("[" ~> expression <~ "]") ^^
      { case base ~ ordinal => UnresolvedExtractValue(base, ordinal) }
    | (expression <~ ".") ~ ident ^^
      { case base ~ fieldName => UnresolvedExtractValue(base, Literal(fieldName)) }
    | cast
    | "(" ~> expression <~ ")"
    | function
    | dotExpressionHeader
    | ident ^^ {case i => UnresolvedAttribute.quoted(i)}
    | signedPrimary
    | "~" ~> expression ^^ BitwiseNot
    )

  // a.b[.c ...]	
  protected lazy val dotExpressionHeader: Parser[Expression] =
    (ident <~ ".") ~ ident ~ rep("." ~> ident) ^^ {
      case i1 ~ i2 ~ rest => UnresolvedAttribute(Seq(i1, i2) ++ rest)
    }

  // 投影表达式的顶层
  protected lazy val projection: Parser[Expression] =
    expression ~ (AS.? ~> ident.?) ^^ {
      case e ~ a => a.fold(e)(Alias(e, _)())
    }
	
  // 用于 FROM 的 relation 们	
  protected lazy val relations: Parser[LogicalPlan] =
   // rep1 相当于正则表达式的{1,}或+
    ( relation ~ rep1("," ~> relation) ^^ {
        case r1 ~ joins => joins.foldLeft(r1) { case(lhs, r) => Join(lhs, r, Inner, None) } }
    | relation
    )

  // 解析单个 relation	
  protected lazy val relation: Parser[LogicalPlan] =
    joinedRelation | relationFactor

  protected lazy val relationFactor: Parser[LogicalPlan] =
    ( rep1sep(ident, ".") ~ (opt(AS) ~> opt(ident)) ^^ {
        case tableIdent ~ alias => UnresolvedRelation(tableIdent, alias)
      }
      | ("(" ~> start <~ ")") ~ (AS.? ~> ident) ^^ { case s ~ a => Subquery(a, s) }
    )

  protected lazy val joinedRelation: Parser[LogicalPlan] =
    relationFactor ~ rep1(joinType.? ~ (JOIN ~> relationFactor) ~ joinConditions.?) ^^ {
      case r1 ~ joins =>
        joins.foldLeft(r1) { case (lhs, jt ~ rhs ~ cond) =>
          Join(lhs, rhs, joinType = jt.getOrElse(Inner), cond)
        }
    }
  
  // 条件 JOIN
  protected lazy val joinConditions: Parser[Expression] =
    ON ~> expression

  // JOIN 类型	
  protected lazy val joinType: Parser[JoinType] =
    ( INNER           ^^^ Inner
    | LEFT  ~ SEMI    ^^^ LeftSemi
    | LEFT  ~ OUTER.? ^^^ LeftOuter
    | RIGHT ~ OUTER.? ^^^ RightOuter
    | FULL  ~ OUTER.? ^^^ FullOuter
    )

  // 排序类型	
  protected lazy val sortType: Parser[LogicalPlan => LogicalPlan] =
    ( ORDER ~ BY  ~> ordering ^^ { case o => l: LogicalPlan => Sort(o, true, l) }
    | SORT ~ BY  ~> ordering ^^ { case o => l: LogicalPlan => Sort(o, false, l) }
    )

  protected lazy val ordering: Parser[Seq[SortOrder]] =
    ( rep1sep(expression ~ direction.? , ",") ^^ {
        case exps => exps.map(pair => SortOrder(pair._1, pair._2.getOrElse(Ascending)))
      }
    )

  protected lazy val direction: Parser[SortDirection] =
    ( ASC  ^^^ Ascending
    | DESC ^^^ Descending
    )
  
  // SELECT 语句
  protected lazy val select: Parser[LogicalPlan] =
    SELECT ~> DISTINCT.? ~
      repsep(projection, ",") ~
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
  
  // 通过 UNION、INTERSET、EXCEPT 等串联 SELECT 语句
  protected lazy val start1: Parser[LogicalPlan] =
    (select | ("(" ~> select $lt;~ ")")) *
    ( UNION ~ ALL        ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Union(q1, q2) }
    | INTERSECT          ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Intersect(q1, q2) }
    | EXCEPT             ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Except(q1, q2)}
    | UNION ~ DISTINCT.? ^^^ { (q1: LogicalPlan, q2: LogicalPlan) => Distinct(Union(q1, q2)) }
    )

  // INSERT 语句	
  protected lazy val insert: Parser[LogicalPlan] =
    INSERT ~> (OVERWRITE ^^^ true | INTO ^^^ false) ~ (TABLE ~> relation) ~ select ^^ {
      case o ~ r ~ s => InsertIntoTable(r, Map.empty[String, Option[String]], s, o, false)
    }

  protected lazy val cte: Parser[LogicalPlan] =
    WITH ~> rep1sep(ident ~ ( AS ~ "(" ~> start1 <~ ")"), ",") ~ (start1 | insert) ^^ {
      case r ~ s => With(s, r.map({case n ~ s => (n, Subquery(n, s))}).toMap)
    }
}
```

总结下来，SQL 语句与 `LogicalPlan` 实现类之间的完整对应关系是这样的：

DDLParser：

| 实现类 | SQL 语句 |
| --- | --- |
| `CreateTableUsingAsSelect` | `CREATE [TEMPORARY] TABLE [IF NOT EXISTS] <Table> [(<Columns>])] USING <ClassName>] [OPTIONS <Options>] AS ...` |
| `CreateTableUsing` | `CREATE [TEMPORARY] TABLE [IF NOT EXISTS] <Table> [(<Columns>])] USING <ClassName> [OPTIONS <Options>]` |
| `DescribeCommand` | `DESCRIBE [EXTENDED] [<Database>.]<Table>` |
| `RefreshTable` | `REFRESH TABLE [<Database>.]<Table>` |

SparkSQLParser：

| 实现类 | SQL 语句 |
| --- | --- |
| `CacheTableCommand` | `CACHE [LAZY] TABLE <Table> [AS ...]` |
| `UncacheTableCommand` | `UNCACHE TABLE <Table>` |
| `ClearCacheCommand` | `CLEAR CACHE` |
| `SetCommand` | `SET <key>=<value>` |
| `ShowTablesCommand` | `SHOW TABLES [IN <Database>]` |

## 总结

在本篇文章中，我们通过更加仔细地阅读 `DDLParser` 、 `SparkSQLParser` 和 `SqlParser` 的源代码，彻底理解了 SQL 语句与抽象语法树结点之间的一一对应关系。相信这些 case class 树节点大家阅读起来应该是十分轻松愉快的一件事，这里就不赘述了。

下一次，我们将脱离 SparkSQL 常规执行工作流，开始探究 SparkSQL 的 CacheManager，敬请期待。
