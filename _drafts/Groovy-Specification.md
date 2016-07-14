---
layout: posts_translated
title: Groovy 语言规范 - 第一章：语法
author: Robert Peng
category: Scala
org_title: "Groovy Specification - Chapter 1 : Syntax"
org_url: "http://www.groovy-lang.org/syntax.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushGroovy.js"></script>

<!-- This chapter covers the syntax of the Groovy programming language. The grammar of the language derives from the Java grammar, but enhances it with specific constructs for Groovy, and allows certain simplifications. -->

本章将讲述 Groovy 语言的语法。Groovy 语言的文法由 Java 语言的文法衍生而来，但同时也通过特定的语法结构对其进行了加强，同时也进行了一定的简化。

## 1 注释

### 1.1 单行注释

<!-- Single line comments start with // and can be found at any position in the line. The characters following //, till the end of the line, are considered part of the comment -->
单行注释由 `//` 起始，可存在于一行中的任意位置。从 `//` 开始到行末之间的字符均被视作注释的内容。

<pre class="brush: groovy">
// 这是一个独占一行的单行注释
println "hello" // 该注释延伸至行末
</pre>

### 1.2 多行注释

<!-- A multiline comment starts with /* and can be found at any position in the line. The characters following /* will be considered part of the comment, including new line characters, up to the first */ closing the comment. Multiline comments can thus be put at the end of a statement, or even inside a statement. -->
多行注释由 `/*` 起始，可起始于一行中的任意位置。从 `/*` 开始到第一个遇到的 `*/` 之间的包括换行符在内的所有字符均被视作注释的内容。由此，多行注释可被放在语句的末尾或是语句之间。

<pre class="brush: groovy">
/* 一个独占了两行的
   多行注释          */
println "hello" /* 一个从语句末尾开始的
                   多行注释              */
println 1 /* 一 */ + 2 /* 二 */
</pre>

### 1.3 GroovyDoc 注释

<!-- Similarly to multiline comments, GroovyDoc comments are multiline, but start with /** and end with */. Lines following the first GroovyDoc comment line can optionally start with a star *. Those comments are associated with: -->
与多行注释类似，GroovyDoc 注释也可以包括多行，但其由 `/**` 起始并由 `*/` 终止。从第二行开始，GroovyDoc 注释中的每一行都可以选择以星号 `*` 起始。这种注释可以与如下几种语言元素相关联：

<!-- 
type definitions (classes, interfaces, enums, annotations),
fields and properties definitions
methods definitions
-->
- 类型定义（类、接口、枚举类型、注解）；
- 域和属性的定义；
- 方法定义

<!-- 
Although the compiler will not complain about GroovyDoc comments not being associated with the above language elements, you should prepend those constructs with the comment right before it.
-->
尽管即使 GroovyDoc 注释没能和这些语言元素关联在一起编译器也不会有任何反应，但将 GroovyDoc 注释放在这些元素的正上方是更好的做法。

<pre class="brush: groovy">
/**
 * 类的描述
 */
class Person {
    /** 人的名字 */
    String name

    /**
     * 为给定的人返回一段问候语
     *
     * @param otherPerson 需要问候的人
     * @return 一段问候语
     */
    String greet(String otherPerson) {
       "Hello ${otherPerson}"
    }
}
</pre>

<!-- 
GroovyDoc follows the same conventions as Java’s own JavaDoc. So you’ll be able to use the same tags as with JavaDoc.
-->
GroovyDoc 使用了和 Java 的 JavaDoc 相同的语法约定，因此你也可以使用和 JavaDoc 相同的文档注释标签。

### 1.4 Shebang 行

<!-- 
Beside the single line comment, there is a special line comment, often called the shebang line understood by UNIX systems which allows scripts to be run directly from the command-line, provided you have installed the Groovy distribution and the groovy command is available on the PATH.
-->
除了一般的单行注释，还有一种被 Unix 系统称为 Shebang 行（译者注：She 和 Bang 分别对应于 `#` 和 `!` 符号） 的注释，它们使得在你安装了 Groovy 并将 `groovy` 命令放置在 `PATH` 中后能够从命令行中运行脚本。

<pre class="brush: groovy">
#!/usr/bin/env groovy
println "Hello from the shebang line"
</pre>

<!-- The # character must be the first character of the file. Any indentation would yield a compilation error. -->
`#` 符号必须为脚本文件的第一个字符，任何缩进都会产生编译错误。

## 2 关键词

如下表格给出了 Groovy 语言中的所有关键词：

<table class="table table-bordered">
	<caption>表 1：关键词</caption>
	<colgroup>
		<col style="width: 25%">
		<col style="width: 25%">
		<col style="width: 25%">
		<col style="width: 25%">
	</colgroup>
	<tbody>
	<tr>
		<td><code>as</code></td>
		<td><code>assert</code></td>
		<td><code>break</code></td>
		<td><code>case</code></td>
	</tr>
	<tr>
		<td><code>catch</code></td>
		<td><code>class</code></td>
		<td><code>const</code></td>
		<td><code>continue</code></td>
	</tr>
	<tr>
		<td><code>def</code></td>
		<td><code>default</code></td>
		<td><code>do</code></td>
		<td><code>else</code></td>
	</tr>
	<tr>
		<td><code>enum</code></td>
		<td><code>extends</code></td>
		<td><code>false</code></td>
		<td><code>finally</code></td>
	</tr>
	<tr>
		<td><code>for</code></td>
		<td><code>goto</code></td>
		<td><code>if</code></td>
		<td><code>implements</code></td>
	</tr>
	<tr>
		<td><code>import</code></td>
		<td><code>in</code></td>
		<td><code>instanceof</code></td>
		<td><code>interface</code></td>
	</tr>
	<tr>
		<td><code>new</code></td>
		<td><code>null</code></td>
		<td><code>package</code></td>
		<td><code>return</code></td>
	</tr>
	<tr>
		<td><code>super</code></td>
		<td><code>switch</code></td>
		<td><code>this</code></td>
		<td><code>throw</code></td>
	</tr>
	<tr>
		<td><code>throws</code></td>
		<td><code>trait</code></td>
		<td><code>true</code></td>
		<td><code>try</code></td>
	</tr>
	<tr>
		<td><code>while</code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
	</tr>
</tbody>
</table>

（译者注：比 Java 多了 `def`、`in` 和 `trait`）

## 3 标识符

### 3.1 普通标识符

标识符可由字母、美金符号或下滑钱开头，不能以数字开头。

所谓“字母”包括如下范围内的字符：

- `a` 到 `z`（ASCII 小写字母）
- `A` 到 `Z`（ASCII 大写字母）
- `\u00C0` 到 `\u00D6`
- `\u00D8` 到 `\u00F6`
- `\u00F8` 到 `\u00FF`
- `\u0100` 到 `\uFFFE`

标识符接下来的字符可以包括字母和数字。

如下为部分合法标识符：

<pre class="brush: groovy">
def name
def item3
def with_underscore
def $dollarStart
</pre>

如下为部分非法标识符：

<pre class="brush: groovy">
def 3tier
def a+b
def a#b
</pre>

当跟在一个句点（`.`）后时，所有关键字均为合法标识符：

<pre class="brush: groovy">
foo.as
foo.assert
foo.break
foo.case
foo.catch
</pre>

### 3.2 带引号的标识符

带引号的标识符可出现在句点表达式的句点之后。例如，`person.name` 表达式中的 `name` 即可被引号包裹，写作 `person."name"` 或 `person.'name'`。如果某些标识符中包含 Java 语言规范不允许但在 Groovy 中被引号包裹时允许存在的字符时，这样的写法就十分有用了。这样的字符包括破折号、空格和感叹号。

<pre class="brush: groovy">
def map = [:]

map."an identifier with a space and double quotes" = "ALLOWED"
map.'with-dash-signs-and-single-quotes' = "ALLOWED"

assert map."an identifier with a space and double quotes" == "ALLOWED"
assert map.'with-dash-signs-and-single-quotes' == "ALLOWED"
</pre>

在后面讲述[字符串](#strings)的章节中我们还能了解到，Groovy 提供了好几种不同的字符串字面量，而所有的这些字符串都可以被放在句点后作为带引号的标识符：

<pre class="brush: groovy">
map.'single quote'
map."double quote"
map.'''triple single quote'''
map."""triple double quote"""
map./slashy string/
map.$/dollar slashy string/$
</pre>

值得注意的是，当使用 Groovy 的 GString（插值字符串）作为带引号的标识符时是和使用普通字符串有所区别的：插值字符串中的值将会被填充，而后再以插值的结果作为标识符进行处理：

<pre class="brush: groovy">
def firstname = "Homer"
map."Simson-${firstname}" = "Homer Simson"

assert map.'Simson-Homer' == "Homer Simson"
</pre>
