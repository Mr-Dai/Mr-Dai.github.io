---
title: Groovy 语言规范 - 第一章：语法
category: Groovy
tags: Groovy
date: 2018-04-24
updated: 2018-04-24
toc: true
---

这是一篇译文，读者可前往 [The Apache Groovy programming language - Syntax](http://www.groovy-lang.org/syntax.html) 阅读原文。

<!-- This chapter covers the syntax of the Groovy programming language. The grammar of the language derives from the Java grammar, but enhances it with specific constructs for Groovy, and allows certain simplifications. -->

本章将讲述 Groovy 语言的语法。Groovy 语言的文法由 Java 语言的文法衍生而来，但同时也通过特定的语法结构对其进行了加强，同时也进行了一定的简化。

<!-- more -->

## 1 注释

### 1.1 单行注释

<!-- Single line comments start with // and can be found at any position in the line. The characters following //, till the end of the line, are considered part of the comment -->
单行注释由 `//` 起始，可存在于一行中的任意位置。从 `//` 开始到行末之间的字符均被视作注释的内容。

```groovy
// 这是一个独占一行的单行注释
println "hello" // 该注释延伸至行末
```

### 1.2 多行注释

<!-- A multiline comment starts with /* and can be found at any position in the line. The characters following /* will be considered part of the comment, including new line characters, up to the first */ closing the comment. Multiline comments can thus be put at the end of a statement, or even inside a statement. -->
多行注释由 `/*` 起始，可起始于一行中的任意位置。从 `/*` 开始到第一个遇到的 `*/` 之间的包括换行符在内的所有字符均被视作注释的内容。由此，多行注释可被放在语句的末尾或是语句之间。

```groovy
/* 一个独占了两行的
   多行注释          */
println "hello" /* 一个从语句末尾开始的
                   多行注释              */
println 1 /* 一 */ + 2 /* 二 */
```

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

```groovy
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
```

<!-- 
GroovyDoc follows the same conventions as Java’s own JavaDoc. So you’ll be able to use the same tags as with JavaDoc.
-->
GroovyDoc 使用了和 Java 的 JavaDoc 相同的语法约定，因此你也可以使用和 JavaDoc 相同的文档注释标签。

### 1.4 Shebang 行

<!-- 
Beside the single line comment, there is a special line comment, often called the shebang line understood by UNIX systems which allows scripts to be run directly from the command-line, provided you have installed the Groovy distribution and the groovy command is available on the PATH.
-->
除了一般的单行注释，还有一种被 Unix 系统称为 Shebang 行（译者注：She 和 Bang 分别对应于 `#` 和 `!` 符号） 的注释，它们使得在你安装了 Groovy 并将 `groovy` 命令放置在 `PATH` 中后能够从命令行中运行脚本。

```groovy
#!/usr/bin/env groovy
println "Hello from the shebang line"
```

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

```groovy
def name
def item3
def with_underscore
def $dollarStart
```

如下为部分非法标识符：

```groovy
def 3tier
def a+b
def a#b
```

当跟在一个句点（`.`）后时，所有关键字均为合法标识符：

```groovy
foo.as
foo.assert
foo.break
foo.case
foo.catch
```

### 3.2 带引号的标识符

带引号的标识符可出现在句点表达式的句点之后。例如，`person.name` 表达式中的 `name` 即可被引号包裹，写作 `person."name"` 或 `person.'name'`。如果某些标识符中包含 Java 语言规范不允许但在 Groovy 中被引号包裹时允许存在的字符时，这样的写法就十分有用了。这样的字符包括破折号、空格和感叹号。

```groovy
def map = [:]

map."an identifier with a space and double quotes" = "ALLOWED"
map.'with-dash-signs-and-single-quotes' = "ALLOWED"

assert map."an identifier with a space and double quotes" == "ALLOWED"
assert map.'with-dash-signs-and-single-quotes' == "ALLOWED"
```

在后面讲述[字符串](#strings)的章节中我们还能了解到，Groovy 提供了好几种不同的字符串字面量，而所有的这些字符串都可以被放在句点后作为带引号的标识符：

```groovy
map.'single quote'
map."double quote"
map.'''triple single quote'''
map."""triple double quote"""
map./slashy string/
map.$/dollar slashy string/$
```

值得注意的是，当使用 Groovy 的 GString（插值字符串）作为带引号的标识符时是和使用普通字符串有所区别的：插值字符串中的值将会被填充，而后再以插值的结果作为标识符进行处理：

```groovy
def firstname = "Homer"
map."Simson-${firstname}" = "Homer Simson"

assert map.'Simson-Homer' == "Homer Simson"
```

<h2 id="strings">4 字符串</h2>

<!-- Text literals are represented in the form of chain of characters called strings. Groovy lets you instantiate java.lang.String objects, as well as GStrings (groovy.lang.GString) which are also called interpolated strings in other programming languages. -->
文本字面量被表现为名为字符串的一串字符。在 Groovy 中你可以实例化 `java.lang.String` 对象以及 GString 对象（groovy.lang.GString），而后者在其他某些编程语言中又被称为插值字符串。

### 4.1 带单引号的字符串

<!-- Single quoted strings are a series of characters surrounded by single quotes: -->
带单引号的字符串（Single Quoted String）为一组由单引号包围的字符：

```groovy
'a single quoted string'
```


<!-- Single quoted strings are plain java.lang.String and don’t support interpolation. -->
带单引号的字符串实际上即为普通的 `java.lang.String` 且不支持插值操作。

### 4.2 字符串拼接

<!-- All the Groovy strings can be concatenated with the + operator: -->
所有 Groovy 字符串可由 `+` 运算符进行拼接：

```groovy
assert 'ab' == 'a' + 'b'
```

### 4.3 带三重单引号的字符串

<!-- Triple single quoted strings are a series of characters surrounded by triplets of single quotes: -->
带三重单引号的字符串（Triple Single Quoted String）是一串由三组单引号包围的字符：

```groovy
'''a triple single quoted string'''
```

<!-- Triple single quoted strings are plain java.lang.String and don’t support interpolation. -->
带三重单引号的字符串实际上即为普通的 `java.lang.String` 且不支持插值操作。

<!-- Triple single quoted strings are multiline. You can span the content of the string across line boundaries without the need to split the string in several pieces, without contatenation or newline escape characters: -->
带三重单引号的字符串可包含多行。你无须将字符串分成若干块并利用字符串拼接或转义的换行符即可使字符串的内容横跨若干行。

```groovy
def aMultilineString = '''line one
line two
line three'''
```

<!-- If your code is indented, for example in the body of the method of a class, your string will contain the whitespace of the indentation. The Groovy Development Kit contains methods for stripping out the indentation with the String#stripIndent() method, and with the String#stripMargin() method that takes a delimiter character to identify the text to remove from the beginning of a string. -->
如果你的代码中包含缩进，例如在类的方法体中时，你的字符串中也会包含缩进所使用的空白字符。GDK 支持使用 `String#stripIndent()` 方法来移除这些缩进，也可以使用 `String#stripMargin()` 方法通过给定的分隔符来移除字符串前面的字符。

<!-- When creating a string as follows: -->
当你创建如下字符串时：

```groovy
def startingAndEndingWithANewline = '''
line one
line two
line three
'''
```

<!-- You will notice that the resulting string contains a newline character as first character. It is possible to strip that character by escaping the newline with a backslash: -->
你会注意到所创建的字符串的第一个字符为换行符。你可以通过添加一个反斜杠将换行符进行转义以将该换行符从字符串中移除：

```groovy
def strippedFirstNewline = '''\
line one
line two
line three
'''

assert !strippedFirstNewline.startsWith('\n')
```

#### 4.3.1 对特殊字符进行转义

<!-- You can escape single quotes with the the backslash character to avoid terminating the string literal: -->
你可以对单引号进行转义以免该单引号中断了字符串字面量：

```groovy
'an escaped single quote: \' needs a backslash'
```

<!-- And you can escape the escape character itself with a double backslash: -->
你也可以通过输入两个连续的反斜杠来对转义符进行转义：

```groovy
'an escaped escape character: \\ needs a double backslash'
```

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

```groovy
'The Euro currency symbol: \u20AC'
```

### 4.4 带双引号的字符串

<!-- Double quoted strings are a series of characters surrounded by double quotes: -->
带双引号的字符串为一组由双引号包围的字符：

```groovy
"a double quoted string"
```

<!-- Double quoted strings are plain java.lang.String if there’s no interpolated expression, but are groovy.lang.GString instances if interpolation is present.
To escape a double quote, you can use the backslash character: -->
当不包含插值表达式时，带双引号的字符串将产生一个 `java.lang.String` 实例，否则将产生一个 `groovy.lang.GString` 实例。

你可以使用反斜杠对双引号进行转义：

```groovy
"A double quote: \""
```

#### 4.4.1 字符串插值

<!-- Any Groovy expression can be interpolated in all string literals, apart from single and triple single quoted strings. Interpolation is the act of replacing a placeholder in the string with its value upon evaluation of the string. The placeholder expressions are surrounded by ${} or prefixed with $ for dotted expressions. The expression value inside the placeholder is evaluated to its string representation when the GString is passed to a method taking a String as argument by calling toString() on that expression. -->
除了带单引号的字符串和带三重单引号的字符串，任何 Groovy 表达式都可以被放入到任意的字符串字面量中。插值操作即通过对给定字符串进行处理并用所得值替换字面量中的占位符的操作。占位符表达式可用 `${}` 包围，对于句点表达式也可以仅用 `$` 起始。当 `GString` 被传递至一个以 `String` 为参数的方法时，占位符中的表达式将会运算求值，最终调用所得值的 `toString()` 方法获得其字符串表示。

<!-- Here, we have a string with a placeholder referencing a local variable: -->
这里，我们创建了一个字符串，其中包含了一个引用了局部变量的占位符：

```groovy
def name = 'Guillaume' // a plain string
def greeting = "Hello ${name}"

assert greeting.toString() == 'Hello Guillaume'
```

<!-- But any Groovy expression is valid, as we can see in this example with an arithmetic expression: -->
但实际上在占位符中使用任何 Groovy 表达式都是合法的。在下面的例子中我们可以看到可以使用代数表达式：

```groovy
def sum = "The sum of 2 and 3 equals ${2 + 3}"
assert sum.toString() == 'The sum of 2 and 3 equals 5'
```


<!-- Not only expressions are actually allowed in between the ${} placeholder. Statements are also allowed, but a statement’s value is just null. So if several statements are inserted in that placeholder, the last one should somehow return a meaningful value to be inserted. For instance, "The sum of 1 and 2 is equal to ${def a = 1; def b = 2; a + b}" is supported and works as expected but a good practice is usually to stick to simple expressions inside GString placeholders. -->
实际上除了表达式以外，`${}` 占位符中同样可以放入语句，但语句的值为 `null`，因此如果要在占位符中放入多个语句的话，最后一个语句则应该返回一个比较有意义的用于替换占位符的结果。例如，`"The sum of 1 and 2 is equal to ${def a = 1; def b = 2; a + b}"` 实际上是可以产生出想要的结果的，但在 `GString` 占位符中使用简单的表达式依然是更好的做法。

<!-- In addition to ${} placeholders, we can also use a lone $ sign prefixing a dotted expression: -->

除了 `${}` 占位符，我们还可以使用以 `$` 符号起始的句点表达式：

```groovy
def person = [name: 'Guillaume', age: 36]
assert "$person.name is $person.age years old" == 'Guillaume is 36 years old'
```

<!-- But only dotted expressions of the form a.b, a.b.c, etc, are valid, but expressions that would contain parentheses like method calls, curly braces for closures, or arithmetic operators would be invalid. Given the following variable definition of a number: -->
但只有形如 `a.b` 或 `a.b.c` 等的句点表达式可以使用这种写法，如方法调用、闭包等带括号或带代数运算符的表达式是不能这样写的。假设我们定义了如下的数字变量：

```groovy
def number = 3.14
```

<!-- The following statement will throw a groovy.lang.MissingPropertyException because Groovy believes you’re trying to access the toString property of that number, which doesn’t exist: -->
如下语句将会抛出一个 `groovy.lang.MissingPropertyException` 因为 Groovy 以为你想要访问该变量的 `toString` 属性，而数字变量本身不包含这样一个属性：

```groovy
shouldFail(MissingPropertyException) {
    println "$number.toString()"
}
```

<!-- You can think of "$number.toString()" as being interpreted by the parser as "${number.toString}()". -->
你可能会以为 `"$number.toString()"` 会被解析器理解为 `"${number.toString}()"`。

<!-- If you need to escape the $ or ${} placeholders in a GString so they appear as is without interpolation, you just need to use a \ backslash character to escape the dollar sign: -->
如果你想要对 GString 中的 `$` 或 `${}` 占位符进行转义使其不要触发插值操作，你只需要使用一个反斜杠符号对 `$` 符号转义即可：

```groovy
assert '${name}' == "\${name}"
```

#### 4.4.2 使用闭包表达式进行插值

<!-- So far, we’ve seen we could interpolate arbitrary expressions inside the ${} placeholder, but there is a special case and notation for closure expressions. When the placeholder contains an arrow, ${→}, the expression is actually a closure expression — you can think of it as a closure with a dollar prepended in front of it: -->
目前来讲，我们了解到我们可以向 `${}` 占位符中插入任意的表达式，但如果要插入闭包表达式的话则需要使用一些特殊的符号。当占位符中包含一个箭头符号时，`${→}`，该表达式实际上是一个闭包表达式 —— 你可以将其想象成一个前面带着一个美金符号的闭包：

```groovy
def sParameterLessClosure = "1 + 2 == ${-> 3}"  // 注1
assert sParameterLessClosure == '1 + 2 == 3'

def sOneParamClosure = "1 + 2 == ${ w -> w << 3}"  // 注2 
assert sOneParamClosure == '1 + 2 == 3'
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>该闭包为无参数闭包，无需传入任何实参</td>
	</tr>
	<tr>
		<td>2</td>
		<td>该闭包需要传入一个 <code>java.io.StringWriter</code> 参数，你可以使用 <code><<</code> 左移运算符向其中写入内容。在这两个例子中，两个占位符表达式实际上都是闭包。</td>
	</tr>
</table>

<!-- In appearance, it looks like a more verbose way of defining expressions to be interpolated, but closures have an interesting advantage over mere expressions: lazy evaluation. -->
从外表上看，我们似乎只是找到了一种更为繁琐的定义插值表达式的方式，但比起普通的表达式，闭包实际上有一个更大的优势，那就是懒求值。

我们来考虑下面这个案例：

```groovy
def number = 1    // 注1
def eagerGString = "value == ${number}"
def lazyGString = "value == ${ -> number }"

assert eagerGString == "value == 1"   // 注2
assert lazyGString ==  "value == 1"   // 注3

number = 2   // 注4
assert eagerGString == "value == 1"   // 注5
assert lazyGString ==  "value == 2"   // 注6
```

<table>
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>这里我们定义了一个值为 <code>1</code> 的变量 <code>number</code>，而后将其分别作为普通表达式和闭包插入到了 <code>eagerGString</code> 和 <code>lazyGString</code> 中</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>我们期望 <code>eagerGString</code> 的最终结果包含数值结果 <code>1</code></td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>3</td>
		<td>同理</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>4</td>
		<td>而后我们将 <code>number</code> 的值修改</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>5</td>
		<td>对于普通的插值表达式，插值的结果实际上在创建 <code>GString</code> 的时候就放入其中了</td>
	</tr>
	<tr>
		<td>6</td>
		<td>但对于闭包表达式来说，闭包在每次 <code>GString</code> 转换成 <code>String</code> 时都会被调用，如此一来结果字符串中的数字便能随之更新了。</td>
	</tr>
</table>

<!-- An embedded closure expression taking more than one parameter will generate an exception at runtime. Only closures with zero or one parameters are allowed. -->
如果所使用的闭包表达式包含超过一个的参数的话则会在运行时产生一个异常。只有包含零个或一个参数的闭包可以被用作插值。

#### 4.4.3 Java 插值

<!-- When a method (whether implemented in Java or Groovy) expects a java.lang.String, but we pass a groovy.lang.GString instance, the toString() method of the GString is automatically and transparently called. -->
如果一个方法（无论是 Java 方法还是 Groovy 方法）需要一个 `java.lang.String` 作为参数，而我们传入了一个 `groovy.lang.GString` 对象的话，`GString` 的 `toString()` 方法就会被隐式调用。

```groovy
String takeString(String message) {      // 注4     
    assert message instanceof String     // 注5
    return message
}

def message = "The message is ${'hello'}"   // 注1
assert message instanceof GString           // 注2

def result = takeString(message)            // 注3
assert result instanceof String
assert result == 'The message is hello'
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>我们创建了一个 <code>GString</code> 变量</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>这里我们检查一下，确认该对象为 <code>GString</code> 实例</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>3</td>
		<td>然后我们将该 <code>GString</code> 传入到一个以 <code>String</code> 为参数的方法中</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>4</td>
		<td><code>takeString()</code> 方法的签名表明了它只接受一个 <code>String</code> 作为参数</td>
	</tr>
	<tr>
		<td>5</td>
		<td>我们还确认了实际传入的参数确实是一个 <code>String</code> 而不是 <code>GString</code></td>
	</tr>
</table>

#### 4.4.4 GString 和 String 的 hashCode

<!-- Although interpolated strings can be used in lieu of plain Java strings, they differ with strings in a particular way: their hashCodes are different. Plain Java strings are immutable, whereas the resulting String representation of a GString can vary, depending on its interpolated values. Even for the same resulting string, GStrings and Strings don’t have the same hashCode. -->
尽管插值字符串可用于代替普通的 Java 字符串，但它们实际上有一点不同：它们的 `hashCode` 是不同的。普通的 Java 字符串是不可变的，而同一个 `GString` 的 `String` 表示则可能发生变化，取决于其被插入的值。除此之外，即使两个对象拥有相同的内容，`GString` 和 `String` 的 `hashCode` 也是不同的：

```groovy
assert "one: ${1}".hashCode() != "one: 1".hashCode()
```

<!-- GString and Strings having different hashCode values, using GString as Map keys should be avoided, especially if we try to retrieve an associated value with a String instead of a GString. -->
正是由于 `GString` 和 `String` 有着不同的 `hashCode`，我们不应使用 `GString` 作为 `Map` 的键，尤其是当我们需要在后面使用 `String` 来获取关联的值的时候。

```groovy
def key = "a"
def m = ["${key}": "letter ${key}"]     // 注1

assert m["a"] == null                   // 注2
```

<table>
	<colgroup>
		<col style="width: 5%">
		<col style="wdith: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>在初始化时，映射中便包含了一对键值对，其中键为一个 <code>GString</code></td>
	</tr>
	<tr>
		<td>2</td>
		<td>当我们想要通过一个 <code>String</code> 键获取对应的值时，我们将无法顺利获取，因为 <code>String</code> 和 <code>GString</code> 有着不同的 <code>hashCode</code> 值</td>
	</tr>
</table>

### 4.5 带三重双引号的字符串

<!-- Triple double quoted strings behave like double quoted strings, with the addition that they are multiline, like the triple single quoted strings. -->
带三重双引号的字符串和带双引号的字符串类似，只是它们也像带三重单引号的字符串那样，可以包含多行：

```groovy
def name = 'Groovy'
def template = """
    Dear Mr ${name},

    You're the winner of the lottery!

    Yours sincerly,

    Dave
"""

assert template.toString().contains('Groovy')
```

<!-- Neither double quotes nor single quotes need be escaped in triple double quoted strings. -->
在这样的字符串中，双引号和单引号均不需要转义。

### 4.6 斜杠字符串

<!-- Beyond the usual quoted strings, Groovy offers slashy strings, which use / as delimiters. Slashy strings are particularly useful for defining regular expressions and patterns, as there is no need to escape backslashes. -->
除了普通的带引号的字符串，Groovy 还提供了使用 `/` 作为分隔符的斜杠字符串。斜杠字符串在用来定义正则表达式或正则模式时十分有用，因为在这样的字符串中不需要对反斜杠进行转义：

```groovy
def fooPattern = /.*foo.*/
assert fooPattern == '.*foo.*'
```

只有斜杠符本身需要用反斜杠来进行转义：

```groovy
def escapeSlash = /The character \/ is a forward slash/
assert escapeSlash == 'The character / is a forward slash'
```

（译者注：可能无法用这种写法来定义一个以反斜杠结尾的字符串）

斜杠字符串可包含多行：

```groovy
def multilineSlashy = /one
    two
    three/

assert multilineSlashy.contains('\n')
```

斜杠字符串也可以进行插值（也就是说它也是一个 `GString`）：

```groovy
def color = 'blue'
def interpolatedSlashy = /a ${color} car/

assert interpolatedSlashy == 'a blue car'
```

有几点需要注意一下。

<!-- An empty slashy string cannot be represented with a double forward slash, as it’s understood by the Groovy parser as a line comment. That’s why the following assert would actually not compile as it would look like a non-terminated statement: -->
当你想定义一个空白的斜杠字符串时，你不能将其写作两个连续的斜杠符，因为 Groovy 解析器会将其认作单行注释。这也是为何如下断言语句无法通过编译，因为编译器认为这个语句不完整：

```groovy
assert '' == //
```

<!-- As slashy strings were mostly designed to make regexp easier so a few things that are errors in GStrings like $() will work with slashy strings. -->
由于斜杠字符串主要是设计来让编写正则表达式变得更加容易，因此一些如 `$()` 这样的在 `GString` 中错误的写法实际上是可以被放入到斜杠字符串中的。

### 4.7 美金斜杠字符串

<!-- Dollar slashy strings are multiline GStrings delimited with an opening $/ and and a closing /$. The escaping character is the dollar sign, and it can escape another dollar, or a forward slash. But both dollar and forward slashes don’t need to be escaped, except to escape the dollar of a string subsequence that would start like a GString placeholder sequence, or if you need to escape a sequence that would start like a closing dollar slashy string delimiter. -->
美金斜杠字符串为使用 `$/` 起始且使用 `/$` 结尾的多行 `GString`。这样的字符串使用美金符号作为转义符，而且可用于对斜杠或另一个美金符号进行转义。然而在这样的字符串中，斜杠和美金符号都不需要进行转义，除非某个美金符号与后面的字符子串能够组合成一个占位符或者你的字符串中需要包含一个 `/$` 终止符。

```groovy
def name = "Guillaume"
def date = "April, 1st"

def dollarSlashy = $/
    Hello $name,
    today we're ${date}.

    $ dollar sign
    $$ escaped dollar sign
    \ backslash
    / forward slash
    $/ escaped forward slash
    $/$ escaped dollar slashy string delimiter
/$

assert [
    'Guillaume',
    'April, 1st',
    '$ dollar sign',
    '$ escaped dollar sign',
    '\\ backslash',
    '/ forward slash',
    '$/ escaped forward slash',
    '/$ escaped dollar slashy string delimiter'
].each { dollarSlashy.contains(it) }
```

### 4.8 字符串总结表

<table class="table">
	<tr>
		<th>字符串种类</th>
		<th>字符串语法</th>
		<th>是否支持插值</th>
		<th>是否可包含多行</th>
		<th>转义符</th>
	</tr>
	<tr>
		<td>带单引号的字符串</td>
		<td><code>'...'</code></td>
		<td></td>
		<td></td>
		<td><code>\</code></td>
	</tr>
	<tr>
		<td>带三重单引号的字符串</td>
		<td><code>'''...'''</code></td>
		<td></td>
		<td>是</td>
		<td><code>\</code></td>
	</tr>
	<tr>
		<td>带双引号的字符串</td>
		<td><code>"..."</code></td>
		<td>是</td>
		<td></td>
		<td><code>\</code></td>
	</tr>
	<tr>
		<td>带三重双引号的字符串</td>
		<td><code>"""..."""</code></td>
		<td>是</td>
		<td>是</td>
		<td><code>\</code></td>
	</tr>
	<tr>
		<td>斜杠字符串</td>
		<td><code>/.../</code></td>
		<td>是</td>
		<td>是</td>
		<td><code>\</code></td>
	</tr>
	<tr>
		<td>美金斜杠字符串</td>
		<td><code>$/.../$</code></td>
		<td>是</td>
		<td>是</td>
		<td><code>$</code></td>
	</tr>
</table>

### 4.9 字符

<!-- Unlike Java, Groovy doesn’t have an explicit character literal. However, you can be explicit about making a Groovy string an actual character, by three different means: -->
和 Java 不同的是，Groovy 无法显式地创建字符字面量。不过，你可以通过三种不同的方式来将 Groovy 字符串变成字符：

```groovy
char c1 = 'A' // 注1
assert c1 instanceof Character

def c2 = 'B' as char // 注2
assert c2 instanceof Character

def c3 = (char)'C' // 注3
assert c3 instanceof Character
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>将变量显式地声明为 <code>char</code> 类型</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>使用 <code>as</code> 运算符进行类型转换</td>
	</tr>
	<tr>
		<td>3</td>
		<td>强制转换为 <code>char</code> 类型</td>
	</tr>
</table>

<!-- The first option 1 is interesting when the character is held in a variable, while the other two (2 and 3) are more interesting when a char value must be passed as argument of a method call. -->
其中，第一种方法适用于将字符赋给一个给定的变量，而其他两种方法则更适用于将字符值作为参数传递给方法。

## 5 数字

<!-- Groovy supports different kinds of integral literals and decimal literals, backed by the usual Number types of Java. -->
Groovy 支持各种不同种类的整型数或自然数字面量，所有的字面量都将产生 Java 的不同 `Number` 类型的对象。

### 5.1 整型数字面量

整型数字面量的类型与 Java 相同：

- `byte`
- `char`
- `short`
- `int`
- `long`
- `java.lang.BigInteger`

通过如下的声明方式即可分别创建上述类型的整型数：

```groovy
// primitive types
byte  b = 1
char  c = 2
short s = 3
int   i = 4
long  l = 5

// infinite precision
BigInteger bi =  6
```

<!-- If you use optional typing by using the def keyword, the type of the integral number will vary: it’ll adapt to the capacity of the type that can hold that number. -->
如果你使用了 `def` 关键字并不给定类型，整形数的类型则取决于不同类型的容量大小以及具体给定的数值大小。

对于正整数而言：

```groovy
def a = 1
assert a instanceof Integer

// Integer.MAX_VALUE
def b = 2147483647
assert b instanceof Integer

// Integer.MAX_VALUE + 1
def c = 2147483648
assert c instanceof Long

// Long.MAX_VALUE
def d = 9223372036854775807
assert d instanceof Long

// Long.MAX_VALUE + 1
def e = 9223372036854775808
assert e instanceof BigInteger
```

同理，对于负整数而言：

```groovy
def na = -1
assert na instanceof Integer

// Integer.MIN_VALUE
def nb = -2147483648
assert nb instanceof Integer

// Integer.MIN_VALUE - 1
def nc = -2147483649
assert nc instanceof Long

// Long.MIN_VALUE
def nd = -9223372036854775808
assert nd instanceof Long

// Long.MIN_VALUE - 1
def ne = -9223372036854775809
assert ne instanceof BigInteger
```

#### 5.1.1 其他不以 10 为基的数值表示方法

数字同样可以以二进制、八进制、十六进制或小数形式来表示。

##### 二进制字面量

二进制数字以 `0b` 起始：

```groovy
int xInt = 0b10101111
assert xInt == 175

short xShort = 0b11001001
assert xShort == 201 as short

byte xByte = 0b11
assert xByte == 3 as byte

long xLong = 0b101101101101
assert xLong == 2925l

BigInteger xBigInteger = 0b111100100001
assert xBigInteger == 3873g

int xNegativeInt = -0b10101111
assert xNegativeInt == -175
```

##### 八进制字面量

<!-- Octal numbers are specified in the typical format of 0 followed by octal digits. -->
八进制字面量以 `0` 起始：

```groovy
int xInt = 077
assert xInt == 63

short xShort = 011
assert xShort == 9 as short

byte xByte = 032
assert xByte == 26 as byte

long xLong = 0246
assert xLong == 166l

BigInteger xBigInteger = 01111
assert xBigInteger == 585g

int xNegativeInt = -077
assert xNegativeInt == -63
```

##### 十六进制字面量

十六进制数字以 `0x` 起始：

```groovy
int xInt = 0x77
assert xInt == 119

short xShort = 0xaa
assert xShort == 170 as short

byte xByte = 0x3a
assert xByte == 58 as byte

long xLong = 0xffff
assert xLong == 65535l

BigInteger xBigInteger = 0xaaaa
assert xBigInteger == 43690g

Double xDouble = new Double('0x1.0p0')
assert xDouble == 1.0d

int xNegativeInt = -0x77
assert xNegativeInt == -119
```

### 5.2 小数字面量

小数字面量的类型与 Java 相同：

- `float`
- `double`
- `java.lang.BigDecimal`

你可以通过如下方式来分别声明上述各个类型的小数：

```groovy
// primitive types
float  f = 1.234
double d = 2.345

// infinite precision
BigDecimal bd =  3.456
```

小数还可以使用 `e` 或 `E` 指数符号并接上一个可选的正负符以及代表指数值整型数值：

```groovy
assert 1e3  ==  1_000.0
assert 2E4  == 20_000.0
assert 3e+1 ==     30.0
assert 4E-2 ==      0.04
assert 5e-1 ==      0.5
```

<!-- Conveniently for exact decimal number calculations, Groovy choses java.lang.BigDecimal as its decimal number type. In addition, both float and double are supported, but require an explicit type declaration, type coercion or suffix. Even if BigDecimal is the default for decimal numbers, such literals are accepted in methods or closures taking float or double as parameter types. -->
为了更好地支持精确的小数运算，Groovy 默认使用 `java.lang.BigDecimal` 作为小数的类型。除此之外，你仍然可以使用 `float` 或 `double` 作为小数数值的类型，但这需要你显式的声明变量的类型，或对其进行类型转换或给定特定的后缀。尽管如此，类型为 `java.lang.BigDecimal` 的字面量仍然可以被用于参数类型为 `float` 或 `double` 的闭包和方法。

小数无法使用二进制、八进制或十六进制表示。

### 5.3 字面量中的下划线

<!-- When writing long literal numbers, it’s harder on the eye to figure out how some numbers are grouped together, for example with groups of thousands, of words, etc. By allowing you to place underscore in number literals, it’s easier to spot those groups: -->
在编写很长的数字字面量时，人眼很难判断如何组合这些数字。Groovy 允许你在数字字面量中放入下划线以更好地区分开不同组的数字：

```groovy
long creditCardNumber = 1234_5678_9012_3456L
long socialSecurityNumbers = 999_99_9999L
double monetaryAmount = 12_345_132.12
long hexBytes = 0xFF_EC_DE_5E
long hexWords = 0xFFEC_DE5E
long maxLong = 0x7fff_ffff_ffff_ffffL
long alsoMaxLong = 9_223_372_036_854_775_807L
long bytes = 0b11010010_01101001_10010100_10010010
```

### 5.4 数字类型后缀

<!-- We can force a number (including binary, octals and hexadecimals) to have a specific type by giving a suffix (see table bellow), either uppercase or lowercase. -->
我们可以通过给定一个大写或小写的后缀使得数字字面量使用我们想要的类型：

<table class="table">
	<tr>
		<th>类型</th>
		<th>后缀</th>
	</tr>
	<tr>
		<td><code>BigInteger</code></td>
		<td><code>G</code> 或 <code>g</code></td>
	</tr>
	<tr>
		<td><code>Long</code></td>
		<td><code>L</code> 或 <code>l</code></td>
	</tr>
	<tr>
		<td><code>Integer</code></td>
		<td><code>I</code> 或 <code>i</code></td>
	</tr>
	<tr>
		<td><code>BigDecimal</code></td>
		<td><code>G</code> 或 <code>g</code></td>
	</tr>
	<tr>
		<td><code>Double</code></td>
		<td><code>D</code> 或 <code>d</code></td>
	</tr>
	<tr>
		<td><code>Float</code></td>
		<td><code>F</code> 或 <code>f</code></td>
	</tr>
</table>

```groovy
assert 42I == new Integer('42')
assert 42i == new Integer('42') // lowercase i more readable
assert 123L == new Long("123") // uppercase L more readable
assert 2147483648 == new Long('2147483648') // Long type used, value too large for an Integer
assert 456G == new BigInteger('456')
assert 456g == new BigInteger('456')
assert 123.45 == new BigDecimal('123.45') // default BigDecimal type used
assert 1.200065D == new Double('1.200065')
assert 1.234F == new Float('1.234')
assert 1.23E23D == new Double('1.23E23')
assert 0b1111L.class == Long // binary
assert 0xFFi.class == Integer // hexadecimal
assert 034G.class == BigInteger // octal
```

### 5.5 数学运算

<!-- Although operators are covered later on, it’s important to discuss the behavior of math operations and what their resulting types are. -->
尽管我们会在下一章再具体讲述[运算符](http://www.groovy-lang.org/operators.html)，但我们有必要在这里讲一下各种不同的数学运算的具体行为以及它们的结果类型。

除了除法和乘方运算外：

- `byte`、`char`、`short` 和 `int` 之间的二元运算结果均为 `int` 类型
- `long` 与其他 `byte`、`char`、`short` 或 `int` 的二元运算结果为 `long` 类型
- `BigInteger` 与其他整型类型的二元运算结果为 `BigInteger` 类型
- `BigDecimal` 与 `byte`、`char`、`short`、`int` 或 `BigInteger` 的二元运算结果为 `BigDecimal` 类型
- `float`、`double` 和 `BigDecimal` 之间的二元运算结果均为 `double` 类型
- 两个 `BigDecimal` 进行二元运算的结果为 `BigDecimal` 类型

上述规则可总结为下表：

<table class="table">
	<tr>
		<th><code></code></th>
		<th><code>byte</code></th>
		<th><code>char</code></th>
		<th><code>short</code></th>
		<th><code>int</code></th>
		<th><code>long</code></th>
		<th><code>BigInteger</code></th>
		<th><code>float</code></th>
		<th><code>double</code></th>
		<th><code>BigDecimal</code></th>
	</tr>
	<tr>
		<th><code>byte</code></th>
		<td><code>int</code></td>
		<td><code>int</code></td>
		<td><code>int</code></td>
		<td><code>int</code></td>
		<td><code>long</code></td>
		<td><code>BigInteger</code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
		<td><code>BigDecimal</code></td>
	</tr>
	<tr>
		<th><code>char</code></th>
		<td><code></code></td>
		<td><code>int</code></td>
		<td><code>int</code></td>
		<td><code>int</code></td>
		<td><code>long</code></td>
		<td><code>BigInteger</code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
		<td><code>BigDecimal</code></td>
	</tr>
	<tr>
		<th><code>short</code></th>
		<td><code></code></td>
		<td><code></code></td>
		<td><code>int</code></td>
		<td><code>int</code></td>
		<td><code>long</code></td>
		<td><code>BigInteger</code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
		<td><code>BigDecimal</code></td>
	</tr>
	<tr>
		<th><code>int</code></th>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code>int</code></td>
		<td><code>long</code></td>
		<td><code>BigInteger</code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
		<td><code>BigDecimal</code></td>
	</tr>
	<tr>
		<th><code>long</code></th>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code>long</code></td>
		<td><code>BigInteger</code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
		<td><code>BigDecimal</code></td>
	</tr>
	<tr>
		<th><code>BigInteger</code></th>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code>BigInteger</code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
		<td><code>BigDecimal</code></td>
	</tr>
	<tr>
		<th><code>float</code></th>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
	</tr>
	<tr>
		<th><code>double</code></th>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code>double</code></td>
		<td><code>double</code></td>
	</tr>
	<tr>
		<th><code>BigDecimal</code></th>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code></code></td>
		<td><code>BigDecimal</code></td>
	</tr>
</table>

<!-- Thanks to Groovy’s operator overloading, the usual arithmetic operators work as well with BigInteger and BigDecimal, unlike in Java where you have to use explicit methods for operating on those numbers. -->
多亏了 Groovy 的运算符重载功能，你同样可以为 `BigInteger` 和 `BigDecimal` 使用算术运算符，而不需要像 Java 那样显式地调用它们的方法。

#### 5.5.1 除法运算符

<!-- The division operators / (and /= for division and assignment) produce a double result if either operand is a float or double, and a BigDecimal result otherwise (when both operands are any combination of an integral type short, char, byte, int, long, BigInteger or BigDecimal). -->
如果任意一个算子的类型为 `float` 或 `double`，除法运算符 `/`（以及 `/=` 除等运算符）将产生类型为 `double` 的结果，否则产生类型为 `BigDecimal` 的结果。

<!-- BigDecimal division is performed with the divide() method if the division is exact (i.e. yielding a result that can be represented within the bounds of the same precision and scale), or using a MathContext with a precision of the maximum of the two operands' precision plus an extra precision of 10, and a scale of the maximum of 10 and the maximum of the operands' scale. -->
如果除法操作是精确的话（产生一个处于相同[精确度](http://docs.oracle.com/javase/7/docs/api/java/math/BigDecimal.html#precision())和[幂](http://docs.oracle.com/javase/7/docs/api/java/math/BigDecimal.html#scale())的范围内的结果），`BigDecimal` 的除法由其 `divide()` 方法实现，否则则使用 `MathContext` 进行，其中精确度被设定为两个算子的精确度的最高值再额外加 `10`，而幂则被设为两个算子的幂和 `10` 之间的最大值。

<!-- For integer division like in Java, you should use the intdiv() method, as Groovy doesn’t provide a dedicated integer division operator symbol. -->
对于像 Java 中的那种整型数除法，你应该使用 `intdiv()` 方法，因为 Groovy 并未提供专门的整型数除法运算符。

#### 5.5.2 乘方运算符

<!-- The power operation is represented by the ** operator, with two parameters: the base and the exponent. The result of the power operation depends on its operands, and the result of the operation (in particular if the result can be represented as an integral value). -->
乘方运算符为 `**` 且包含两个参数：基和指数。乘方运算的结果取决于两个算子以及其本身（尤其是当结果可以被表示为整型数时）。

Groovy 的乘方运算使用如下规则来确定结果的类型：

- 如果指数为小数，
  * 如果结果可以被表示为一个 `Integer`，则其类型为 `Integer`
  * 否则，如果结果可以被表示为一个 `Long`，则其类型为 `Long`
  * 否则其类型为 `Double`
- 如果指数为整数，
  * 如果指数为负数，那么结果类型为 `Integer`、`Long` 或 `Double`，取决于结果的数值可以被放入哪个类型中
  * 如果指数为零或正数
    - 如果基为 `BigDecimal`，那么结果类型为 `BigDecimal`
    - 如果基为 `BigInteger`，那么结果类型为 `BigInteger`
    - 如果基为 `Integer` 且结果可放入到一个 `Integer` 中，那么结果类型为 `Integer`，否则为 `BigInteger`
    - 如果基为 `Long` 且结果可放入到一个 `Long` 中，那么结果类型为 `Long`，否则为 `BigInteger`

如下示例展示了上述的规则：

```groovy
// base and exponent are ints and the result can be represented by an Integer
assert    2    **   3    instanceof Integer    //  8
assert   10    **   9    instanceof Integer    //  1_000_000_000

// the base is a long, so fit the result in a Long
// (although it could have fit in an Integer)
assert    5L   **   2    instanceof Long       //  25

// the result can't be represented as an Integer or Long, so return a BigInteger
assert  100    **  10    instanceof BigInteger //  10e20
assert 1234    ** 123    instanceof BigInteger //  170515806212727042875...

// the base is a BigDecimal and the exponent a negative int
// but the result can be represented as an Integer
assert    0.5  **  -2    instanceof Integer    //  4

// the base is an int, and the exponent a negative float
// but again, the result can be represented as an Integer
assert    1    **  -0.3f instanceof Integer    //  1

// the base is an int, and the exponent a negative int
// but the result will be calculated as a Double
// (both base and exponent are actually converted to doubles)
assert   10    **  -1    instanceof Double     //  0.1

// the base is a BigDecimal, and the exponent is an int, so return a BigDecimal
assert    1.2  **  10    instanceof BigDecimal //  6.1917364224

// the base is a float or double, and the exponent is an int
// but the result can only be represented as a Double value
assert    3.4f **   5    instanceof Double     //  454.35430372146965
assert    5.6d **   2    instanceof Double     //  31.359999999999996

// the exponent is a decimal value
// and the result can only be represented as a Double value
assert    7.8  **   1.9  instanceof Double     //  49.542708423868476
assert    2    **   0.1f instanceof Double     //  1.0717734636432956
```

## 6 布尔类型

<!-- Boolean is a special data type that is used to represent truth values: true and false. Use this data type for simple flags that track true/false conditions. -->
布尔类型是一种用于表示真值 `true` 和 `false` 的特殊数据类型。这种数据类型应用于记录最简单的真/假条件标识位。

<!-- Boolean values can be stored in variables, assigned into fields, just like any other data type: -->
正如其他数据类型，布尔值同样可以被赋值给域或储存在变量中：

```groovy
def myBooleanVariable = true
boolean untypedBooleanVar = false
booleanField = true
```

<!-- true and false are the only two primitive boolean values. But more complex boolean expressions can be represented using logical operators. -->
`true` 和 `false` 为仅有的两个布尔值，但使用[逻辑运算符]可以写出更为复杂的布尔表达式。

<!-- In addition, Groovy has special rules (often referred to as Groovy Truth) for coercing non-boolean objects to a boolean value. -->
除此之外，Groovy 还有一些被称之为**Groovy 真值**的特殊规则用于将非布尔类型的对象转换为布尔值。

## 7 列表

<!-- Groovy uses a comma-separated list of values, surrounded by square brackets, to denote lists. Groovy lists are plain JDK java.util.List, as Groovy doesn’t define its own collection classes. The concrete list implementation used when defining list literals are java.util.ArrayList by default, unless you decide to specify otherwise, as we shall see later on. -->
Groovy 使用由逗号分隔且由中括号包围的值来表示列表。由于 Groovy 并未定义自己的集合类，因此 Groovy 的列表实际上就是 JDK 中的 `java.util.List`。若无额外显式声明，Groovy 将默认使用 `java.util.ArrayList` 作为具体的列表实现类。

```groovy
def numbers = [1, 2, 3]         // 注1

assert numbers instanceof List  // 注2
assert numbers.size() == 3      // 注3
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>我们用几个由逗号分隔并由中括号包围的数字定义了一个列表并将其赋值给了一个变量</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>该列表为 Java 的 <code>java.util.List</code> 接口的实例</td>
	</tr>
	<tr>
		<td>3</td>
		<td>可以使用列表的 `size()` 方法查询其大小，且可见我们的列表中包含 3 个元素</td>
	</tr>
</table>

<!-- In the above example, we used a homogeneous list, but you can also create lists containing values of heterogeneous types: -->
上面的例子中创建的列表只包含同类型的元素，但你同样可以创建包含不同类型元素的列表：

```groovy
def heterogeneous = [1, "a", true]  // 注1
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr>
		<td>1</td>
		<td>列表中包含一个数字、一个字符串和一个布尔值</td>
	</tr>
</table>

<!-- You can access elements of the list with the [] subscript operator (both for reading and setting values) with positive indices or negative indices to access elements from the end of the list, as well as with ranges, and use the << leftShift operator to append elements to a list: -->
你可以使用下标运算符 `[]` 来访问列表中的元素（可读取或写入），而当所使用的下标值为负数时则可从列表尾部开始访问元素。你还可以使用一个数值范围来获取一个子列表，或使用 `<<` 左移运算符来向列表追加元素：

```groovy
def letters = ['a', 'b', 'c', 'd']

assert letters[0] == 'a'     // 注1
assert letters[1] == 'b'

assert letters[-1] == 'd'    // 注2
assert letters[-2] == 'c'

letters[2] = 'C'             // 注3
assert letters[2] == 'C'

letters << 'e'               // 注4
assert letters[ 4] == 'e'
assert letters[-1] == 'e'

assert letters[1, 3] == ['b', 'd']         // 注5
assert letters[2..4] == ['C', 'd', 'e']    // 注6
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>访问列表中的第一个元素</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>使用负索引值访问列表的最后一个元素：<code>-1</code> 代表从列表末尾开始的第一个元素</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>3</td>
		<td>使用赋值操作将列表的第三个元素重新赋值</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>4</td>
		<td>使用 <code><<</code> 左移运算符向列表的末尾添加新元素</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>5</td>
		<td>同时访问两个元素，获取到一个包含这两个元素的列表</td>
	</tr>
	<tr>
		<td>6</td>
		<td>使用给定的数值范围访问列表的某个区间之间的数值</td>
	</tr>
</table>

<!-- 
As lists can be heterogeneous in nature, lists can also contain other lists to create multi-dimensional lists:
 -->
由于列表可以包含不同类型的元素，列表也可以包含其他列表来构建出一个多维度列表：

```groovy
def multi = [[0, 1], [2, 3]]     // 注1
assert multi[1][0] == 2          // 注2 
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>定义了一个包含数字列表的列表</td>
	</tr>
	<tr>
		<td>2</td>
		<td>访问最顶层列表的第二个元素，并访问了该内层列表的第一个元素</td>
	</tr>
</table>

## 8 数组

<!-- Groovy reuses the list notation for arrays, but to make such literals arrays, you need to explicitely define the type of the array through coercion or type declaration. -->
Groovy 使用与列表相同的写法来定义数组，但为了使其确实产生出数组，你需要通过类型转换或显式的类型声明来将其类型定义为数组。

```groovy
String[] arrStr = ['Ananas', 'Banana', 'Kiwi']  // 注1

assert arrStr instanceof String[]    // 注2
assert !(arrStr instanceof List)

def numArr = [1, 2, 3] as int[]      // 注3

assert numArr instanceof int[]       // 注4
assert numArr.size() == 3
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>使用显式的变量类型定义定义了一个字符串数组</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>断言我们确实创建了一个字符串数组</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>3</td>
		<td>使用 <code>as</code> 运算符创建了一个整型数组</td>
	</tr>
	<tr>
		<td>4</td>
		<td>断言我们确实创建了一个整型数组</td>
	</tr>
</table>

你也可以创建多维数组：

```groovy
def matrix3 = new Integer[3][3]         // 注1
assert matrix3.size() == 3

Integer[][] matrix2                     // 注2
matrix2 = [[1, 2], [3, 4]]
assert matrix2 instanceof Integer[][]
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>你可以定义新数组的大小</td>
	</tr>
	<tr>
		<td>2</td>
		<td>或者声明数组但不给定其具体大小</td>
	</tr>
</table>

访问数组元素的方式与列表相同：

```groovy
String[] names = ['Cédric', 'Guillaume', 'Jochen', 'Paul']
assert names[0] == 'Cédric'     // 注1

names[2] = 'Blackdrag'          // 注2
assert names[2] == 'Blackdrag'
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>获取数组的第一个元素</td>
	</tr>
	<tr>
		<td>2</td>
		<td>将数组的第三个元素设定为新的值</td>
	</tr>
</table>

<!-- Java’s array initializer notation is not supported by Groovy, as the curly braces can be misinterpreted with the notation of Groovy closures. -->
Groovy 不支持 Java 的数组初始化语法，因为大括号会被误解为 Groovy 闭包。

## 9 映射

<!-- Sometimes called dictionaries or associative arrays in other languages, Groovy features maps. Maps associate keys to values, separating keys and values with colons, and each key/value pairs with commas, and the whole keys and values surrounded by square brackets. -->
尽管在其他语言中又被称为字典或关联数组，Groovy 则支持映射。映射将键与值相互关联，键值使用冒号分隔，而不同的键值对之间使用逗号分隔，最终用中括号包围这些键值对即可定义一个映射。

```groovy
def colors = [red: '#FF0000', green: '#00FF00', blue: '#0000FF']   // 注1

assert colors['red'] == '#FF0000'    // 注2
assert colors.green  == '#00FF00'    // 注3

colors['pink'] = '#FF00FF'           // 注4
colors.yellow  = '#FFFF00'           // 注5

assert colors.pink == '#FF00FF'
assert colors['yellow'] == '#FFFF00'

assert colors instanceof java.util.LinkedHashMap
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>我们定义了一组从颜色名称到其十六进制 HTML 颜色代码的映射</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>我们用下标记号来访问与键 <code>red</code> 相关联的值</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>3</td>
		<td>我们还可以使用属性访问语法来断言绿色的十六进制表示</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>4</td>
		<td>同样的，我们还可以使用下标语法来添加一组新的键值对</td>
	</tr>
	<tr>
		<td>5</td>
		<td>或者使用属性访问语法来添加颜色 `yellow`</td>
	</tr>
</table>

<!-- When using names for the keys, we actually define string keys in the map.
Groovy creates maps that are actually instances of java.util.LinkedHashMap. -->
当使用名称作为键时，实际上我们是在将字符串定义为映射的键。Groovy 创建的映射实为 `java.util.LinkedHashMap` 的实例。

<!-- If you try to access a key which is not present in the map: -->
如果你尝试访问映射中不存在的键：

```groovy
assert colors.unknown == null
```

你所能获得的结果将为 `null`。

在上面的例子中，我们使用字符串作为键，但你也可以使用其他类型的值来作为键：

```groovy
def numbers = [1: 'one', 2: 'two']

assert numbers[1] == 'one'
```

<!-- Here, we used numbers as keys, as numbers can unambiguously be recognized as numbers, so Groovy will not create a string key like in our previous examples. But consider the case you want to pass a variable in lieu of the key, to have the value of that variable become the key: -->
这里我们使用数字来作为键，那么 Groovy 就不会像之前那样创建字符串来作为键了。但假设你想要将一个变量的值作为键

```groovy
def key = 'name'
def person = [key: 'Guillaume']      // 注1

assert !person.containsKey('name')   // 注2
assert person.containsKey('key')     // 注3
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>与名称 <code>'Guillaume'</code> 相关联的 <code>key</code> 会变成 <code>"key"</code> 字符串，而不是 <code>key</code> 变量的值</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>映射中不包含 <code>'name'</code> 键</td>
	</tr>
	<tr>
		<td>3</td>
		<td>而映射中包含的是 <code>'key'</code> 键</td>
	</tr>
</table>

<!-- When you need to pass variable values as keys in your map definitions, you must surround the variable or expression with parentheses: -->
当你想将变量的值作为你的定义映射时的键时，你需要将变量或表达式用括号包起来：

```groovy
person = [(key): 'Guillaume']        // 注1

assert person.containsKey('name')    // 注2
assert !person.containsKey('key')    // 注3
```

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr style="border-bottom: 1px dashed">
		<td>1</td>
		<td>这次，我们将 <code>key</code> 变量用括号包围，以此告诉解析器我们是在传入一个变量而不是在定义一个字符串键</td>
	</tr>
	<tr style="border-bottom: 1px dashed">
		<td>2</td>
		<td>映射中确实包含键 <code>name</code></td>
	</tr>
	<tr>
		<td>3</td>
		<td>且映射中不像之前那样包含键 <code>key</code></td>
	</tr>
</table>

<!-- You can also pass quoted strings as well as keys: ["name": "Guillaume"]. This is mandatory if your key string isn’t a valid identifier, for example if you wanted to create a string key containing a dash like in: ["street-name": "Main street"]. -->
你还可以将带引号的字符串作为映射的键：`["name": "Guillaume"]`。如果你的键字符串不是一个有效的标识符，这么做就是必须的了，比如你想创建一个包含破折号的字符串键：`["street-name": "Main street"]`