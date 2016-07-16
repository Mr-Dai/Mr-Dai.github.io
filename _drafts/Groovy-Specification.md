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

<h2 id="strings">4 字符串</h2>

<!-- Text literals are represented in the form of chain of characters called strings. Groovy lets you instantiate java.lang.String objects, as well as GStrings (groovy.lang.GString) which are also called interpolated strings in other programming languages. -->
文本字面量被表现为名为字符串的一串字符。在 Groovy 中你可以实例化 `java.lang.String` 对象以及 GString 对象（groovy.lang.GString），而后者在其他某些编程语言中又被称为插值字符串。

### 4.1 带单引号的字符串

<!-- Single quoted strings are a series of characters surrounded by single quotes: -->
带单引号的字符串（Single Quoted String）为一组由单引号包围的字符：

<pre class="brush: groovy">
'a single quoted string'
</pre>


<!-- Single quoted strings are plain java.lang.String and don’t support interpolation. -->
带单引号的字符串实际上即为普通的 `java.lang.String` 且不支持插值操作。

### 4.2 字符串拼接

<!-- All the Groovy strings can be concatenated with the + operator: -->
所有 Groovy 字符串可由 `+` 运算符进行拼接：

<pre class="brush: groovy">
assert 'ab' == 'a' + 'b'
</pre>

### 4.3 带三重单引号的字符串

<!-- Triple single quoted strings are a series of characters surrounded by triplets of single quotes: -->
带三重单引号的字符串（Triple Single Quoted String）是一串由三组单引号包围的字符：

<pre class="brush: groovy">
'''a triple single quoted string'''
</pre>

<!-- Triple single quoted strings are plain java.lang.String and don’t support interpolation. -->
带三重单引号的字符串实际上即为普通的 `java.lang.String` 且不支持插值操作。

<!-- Triple single quoted strings are multiline. You can span the content of the string across line boundaries without the need to split the string in several pieces, without contatenation or newline escape characters: -->
带三重单引号的字符串可包含多行。你无须将字符串分成若干块并利用字符串拼接或转义的换行符即可使字符串的内容横跨若干行。

<pre class="brush: groovy">
def aMultilineString = '''line one
line two
line three'''
</pre>

<!-- If your code is indented, for example in the body of the method of a class, your string will contain the whitespace of the indentation. The Groovy Development Kit contains methods for stripping out the indentation with the String#stripIndent() method, and with the String#stripMargin() method that takes a delimiter character to identify the text to remove from the beginning of a string. -->
如果你的代码中包含缩进，例如在类的方法体中时，你的字符串中也会包含缩进所使用的空白字符。GDK 支持使用 `String#stripIndent()` 方法来移除这些缩进，也可以使用 `String#stripMargin()` 方法通过给定的分隔符来移除字符串前面的字符。

<!-- When creating a string as follows: -->
当你创建如下字符串时：

<pre class="brush: groovy">
def startingAndEndingWithANewline = '''
line one
line two
line three
'''
</pre>

<!-- You will notice that the resulting string contains a newline character as first character. It is possible to strip that character by escaping the newline with a backslash: -->
你会注意到所创建的字符串的第一个字符为换行符。你可以通过添加一个反斜杠将换行符进行转义以将该换行符从字符串中移除：

<pre class="brush: groovy">
def strippedFirstNewline = '''\
line one
line two
line three
'''

assert !strippedFirstNewline.startsWith('\n')
</pre>

#### 4.3.1 对特殊字符进行转义

<!-- You can escape single quotes with the the backslash character to avoid terminating the string literal: -->
你可以对单引号进行转义以免该单引号中断了字符串字面量：

<pre class="brush: groovy">
'an escaped single quote: \' needs a backslash'
</pre>

<!-- And you can escape the escape character itself with a double backslash: -->
你也可以通过输入两个连续的反斜杠来对转义符进行转义：

<pre class="brush: groovy">
'an escaped escape character: \\ needs a double backslash'
</pre>

<!-- Some special characters also use the backslash as escape character: -->
某些特殊字符同样使用了反斜杠来作为转义符：

<table class="table">
	<tr>
		<th>转义序列</th>
		<th>字符</th>
	</tr>
	<tr>
		<td><code>'\t'</code></td>
		<td>制表符</td>
	</tr>
	<tr>
		<td><code>'\b'</code></td>
		<td>退格符</td>
	</tr>
	<tr>
		<td><code>'\n'</code></td>
		<td>换行符</td>
	</tr>
	<tr>
		<td><code>'\r'</code></td>
		<td>回车符</td>
	</tr>
	<tr>
		<td><code>'\f'</code></td>
		<td>进纸符</td>
	</tr>
	<tr>
		<td><code>'\\'</code></td>
		<td>反斜杠</td>
	</tr>
	<tr>
		<td><code>'\''</code></td>
		<td>单引号（用于带单引号的字符串和带三重单引号的字符串）</td>
	</tr>
	<tr>
		<td><code>'\"'</code></td>
		<td>双引号（用于带双引号的字符串和带三重双引号的字符串）</td>
	</tr>
</table>

#### 4.3.2 Unicode 转义序列

<!-- For characters that are not present on your keyboard, you can use unicode escape sequences: a backslash, followed by 'u', then 4 hexadecimal digits. -->
要输入那些不存在于你的键盘上的字符，你可以使用 Unicode 转义序列，序列由一个反斜杠，紧接着一个 `'u'` 再跟着 4 个十六进制数字组成。

<!-- For example, the Euro currency symbol can be represented with: -->
例如，欧元货币符号可以这样输入：

<pre class="brush: groovy">
'The Euro currency symbol: \u20AC'
</pre>

### 4.4 带双引号的字符串

<!-- Double quoted strings are a series of characters surrounded by double quotes: -->
带双引号的字符串为一组由双引号包围的字符：

<pre class="brush: groovy">
"a double quoted string"
</pre>

<!-- Double quoted strings are plain java.lang.String if there’s no interpolated expression, but are groovy.lang.GString instances if interpolation is present.
To escape a double quote, you can use the backslash character: -->
当不包含插值表达式时，带双引号的字符串将产生一个 `java.lang.String` 实例，否则将产生一个 `groovy.lang.GString` 实例。

你可以使用反斜杠对双引号进行转义：

<pre class="brush: groovy">
"A double quote: \""
</pre>

#### 4.4.1 字符串插值

<!-- Any Groovy expression can be interpolated in all string literals, apart from single and triple single quoted strings. Interpolation is the act of replacing a placeholder in the string with its value upon evaluation of the string. The placeholder expressions are surrounded by ${} or prefixed with $ for dotted expressions. The expression value inside the placeholder is evaluated to its string representation when the GString is passed to a method taking a String as argument by calling toString() on that expression. -->
除了带单引号的字符串和带三重单引号的字符串，任何 Groovy 表达式都可以被放入到任意的字符串字面量中。插值操作即通过对给定字符串进行处理并用所得值替换字面量中的占位符的操作。占位符表达式可用 `${}` 包围，对于句点表达式也可以仅用 `$` 起始。当 `GString` 被传递至一个以 `String` 为参数的方法时，占位符中的表达式将会运算求值，最终调用所得值的 `toString()` 方法获得其字符串表示。

<!-- Here, we have a string with a placeholder referencing a local variable: -->
这里，我们创建了一个字符串，其中包含了一个引用了局部变量的占位符：

<pre class="brush: groovy">
def name = 'Guillaume' // a plain string
def greeting = "Hello ${name}"

assert greeting.toString() == 'Hello Guillaume'
</pre>

<!-- But any Groovy expression is valid, as we can see in this example with an arithmetic expression: -->
但实际上在占位符中使用任何 Groovy 表达式都是合法的。在下面的例子中我们可以看到可以使用代数表达式：

<pre class="brush: groovy">
def sum = "The sum of 2 and 3 equals ${2 + 3}"
assert sum.toString() == 'The sum of 2 and 3 equals 5'
</pre>


<!-- Not only expressions are actually allowed in between the ${} placeholder. Statements are also allowed, but a statement’s value is just null. So if several statements are inserted in that placeholder, the last one should somehow return a meaningful value to be inserted. For instance, "The sum of 1 and 2 is equal to ${def a = 1; def b = 2; a + b}" is supported and works as expected but a good practice is usually to stick to simple expressions inside GString placeholders. -->
实际上除了表达式以外，`${}` 占位符中同样可以放入语句，但语句的值为 `null`，因此如果要在占位符中放入多个语句的话，最后一个语句则应该返回一个比较有意义的用于替换占位符的结果。例如，`"The sum of 1 and 2 is equal to ${def a = 1; def b = 2; a + b}"` 实际上是可以产生出想要的结果的，但在 `GString` 占位符中使用简单的表达式依然是更好的做法。

<!-- In addition to ${} placeholders, we can also use a lone $ sign prefixing a dotted expression: -->

除了 `${}` 占位符，我们还可以使用以 `$` 符号起始的句点表达式：

<pre class="brush: groovy">
def person = [name: 'Guillaume', age: 36]
assert "$person.name is $person.age years old" == 'Guillaume is 36 years old'
</pre>

<!-- But only dotted expressions of the form a.b, a.b.c, etc, are valid, but expressions that would contain parentheses like method calls, curly braces for closures, or arithmetic operators would be invalid. Given the following variable definition of a number: -->
但只有形如 `a.b` 或 `a.b.c` 等的句点表达式可以使用这种写法，如方法调用、闭包等带括号或带代数运算符的表达式是不能这样写的。假设我们定义了如下的数字变量：

<pre class="brush: groovy">
def number = 3.14
</pre>

<!-- The following statement will throw a groovy.lang.MissingPropertyException because Groovy believes you’re trying to access the toString property of that number, which doesn’t exist: -->
如下语句将会抛出一个 `groovy.lang.MissingPropertyException` 因为 Groovy 以为你想要访问该变量的 `toString` 属性，而数字变量本身不包含这样一个属性：

<pre class="brush: groovy">
shouldFail(MissingPropertyException) {
    println "$number.toString()"
}
</pre>

<!-- You can think of "$number.toString()" as being interpreted by the parser as "${number.toString}()". -->
你可能会以为 `"$number.toString()"` 会被解析器理解为 `"${number.toString}()"`。

<!-- If you need to escape the $ or ${} placeholders in a GString so they appear as is without interpolation, you just need to use a \ backslash character to escape the dollar sign: -->
如果你想要对 GString 中的 `$` 或 `${}` 占位符进行转义使其不要触发插值操作，你只需要使用一个反斜杠符号对 `$` 符号转义即可：

<pre class="brush: groovy">
assert '${name}' == "\${name}"
</pre>
