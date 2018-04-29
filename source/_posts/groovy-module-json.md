---
title: Groovy 模块 - JSON 解析与生成
category: Groovy
tags: Groovy
date: 2018-04-24
---

这是一篇译文，读者可前往 [Groovy Module Guide - Parsing and producing JSON](http://www.groovy-lang.org/json.html) 阅读原文。

<!-- Groovy comes with integrated support for converting between Groovy objects and JSON. The classes dedicated to JSON serialisation and parsing are found in the groovy.json package. -->
Groovy 内置了从 Groovy 对象到 JSON 之间相互转换的功能类，而这些被用于进行 JSON 序列化或解析的类都被放在了 `groovy.json` 包中。

<!-- more -->

## 1 JsonSlurper

<!-- JsonSlurper is a class that parses JSON text or reader content into Groovy data structures (objects) such as maps, lists and primitive types like Integer, Double, Boolean and String. -->
`JsonSlurer` 类主要用于解析 JSON 文本并转换成 Groovy 数据结构（对象），如映射、列表或 `Integer`、`Double`、`Boolean`、`String` 等基本数据类型。

<!-- The class comes with a bunch of overloaded parse methods plus some special methods such as parseText, parseFile and others. For the next example we will use the parseText method. It parses a JSON String and recursively converts it to a list or map of objects. The other parse* methods are similar in that they return a JSON String but for different parameter types. -->
该类包含了大量不同版本的 `parse` 方法以及如 `parseText`、`parseFile` 的特殊方法。在下一个例子中我们将使用 `parseText` 方法，该方法会对给定的 JSON `String` 进行解析并递归地将其转换为列表或映射。其他的 `parse*` 方法也是类似，同样会返回解析后的 Groovy 对象，只是它们接受不同类型的参数：

```groovy
def jsonSlurper = new JsonSlurper()
def object = jsonSlurper.parseText('{ "name": "John Doe" } /* some comment */')

assert object instanceof Map
assert object.name == 'John Doe'
```

<!-- Notice the result is a plain map and can be handled like a normal Groovy object instance. JsonSlurper parses the given JSON as defined by the ECMA-404 JSON Interchange Standard plus support for JavaScript comments and dates. -->
值得注意的是，解析的结果是一个普通的映射而且可以被当做普通的 Groovy 实例那样处理。`JsonSlurper` 支持对由 [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf) JSON 交换标准定义的 JSON 格式进行解析，同时还对 JavaScript 注释和日期格式提供了额外的支持。

<!-- In addition to maps JsonSlurper supports JSON arrays which are converted to lists. -->
除了映射，`JsonSlurper` 同样支持 JSON 数组并将其转换为列表。

```groovy
def jsonSlurper = new JsonSlurper()
def object = jsonSlurper.parseText('{ "myList": [4, 8, 15, 16, 23, 42] }')

assert object instanceof Map
assert object.myList instanceof List
assert object.myList == [4, 8, 15, 16, 23, 42]
```

<!-- The JSON standard supports the following primitive data types: string, number, object, true, false and null. JsonSlurper converts these JSON types into corresponding Groovy types. -->
JSON 标准包含对如下几种基础类型的支持：字符串、数字、对象、`true`、`false` 和 `null`。`JsonSlurper` 会将这些 JSON 类型转换成对应的 Groovy 类型。

```groovy
def jsonSlurper = new JsonSlurper()
def object = jsonSlurper.parseText '''
    { "simple": 123,
      "fraction": 123.66,
      "exponential": 123e12
    }'''

assert object instanceof Map
assert object.simple.class == Integer
assert object.fraction.class == BigDecimal
assert object.exponential.class == BigDecimal
```

<!-- As JsonSlurper is returning pure Groovy object instances without any special JSON classes in the back, its usage is transparent. In fact, JsonSlurper results conform to GPath expressions. GPath is a powerful expression language that is supported by multiple slurpers for different data formats (XmlSlurper for XML being one example). -->
鉴于 `JsonSlurper` 能够返回完全转换后的 Groovy 对象而无需显式借助其他的特殊 JSON 类，我们可以说 `JsonSlurper` 的使用体验是透明的。事实上，`JsonSlurper` 的结果遵从 GPath 表达式。GPath 是一门十分强大的表达式语言，包括 `JsonSlurper` 在内的其他不同数据格式的 `Slurper` 均支持该语言（如用于 XML 的 `XmlSlurper`）。

<!-- For more details please have a look at the section on GPath expressions. -->
有关 GPath 的更多内容请查阅[这里](http://docs.groovy-lang.org/latest/html/documentation/core-semantics.html#gpath_expressions)。

<!-- The following table gives an overview of the JSON types and the corresponding Groovy data types: -->
下表给出了 JSON 类型与其对应的 Groovy 数据类型：

<table class="table">
	<tr>
		<th>JSON</th>
		<th>Groovy</th>
	</tr>
	<tr>
		<td>字符串</td>
		<td><code>java.lang.String</code></td>
	</tr>
	<tr>
		<td>数字</td>
		<td><code>java.lang.BigDecimal</code> 或 <code>java.lang.Integer</code></td>
	</tr>
	<tr>
		<td>对象</td>
		<td><code>java.util.LinkedHashMap</code></td>
	</tr>
	<tr>
		<td>数组</td>
		<td><code>java.util.ArrayList</code></td>
	</tr>
	<tr>
		<td><code>true</code></td>
		<td><code>true</code></td>
	</tr>
	<tr>
		<td><code>false</code></td>
		<td><code>false</code></td>
	</tr>
	<tr>
		<td><code>null</code></td>
		<td><code>null</code></td>
	</tr>
	<tr>
		<td>日期</td>
		<td>基于 <code>yyyy-MM-dd'T'HH:mm:ssZ</code> 日期格式的 <code>java.util.Date</code></td>
	</tr>
</table>

<!-- Whenever a value in JSON is null, JsonSlurper supplements it with the Groovy null value. This is in contrast to other JSON parsers that represent a null value with a library-provided singleton object. -->
当 JSON 中出现 `null` 值时，`JsonSlurper` 则会在转换结果中的对应位置放入一个 Groovy `null` 值。这一点和部分用特定的单例对象表示 JSON `null` 值的 JSON 解析库有所不同。

### 1.1 解析器变体

<!-- JsonSlurper comes with a couple of parser implementations. Each parser fits different requirements, it could well be that for certain scenarios the JsonSlurper default parser is not the best bet for all situations. Here is an overview of the shipped parser implementations: -->
`JsonSlurper` 自带了各种不同的解析器实现。每种解析器有着不同的特性，考虑到 `JsonSlurper` 默认的解析器可能不是在任何情况下都是最好的。如下是对各种不同解析器实现的简单介绍：

- `JsonParserCharArray` 解析器接受传入的 JSON 字符串并直接对其底层的字符数组进行操作。在进行值转换时它会复制字符子数组（利用一种叫做“斩断”的机制）并对其进行操作。
- `JsonFastParser` 是 `JsonParserCharArray` 的变体，也是最快的解析器，但它未被用作默认的解析器是有原因的。`JsonFastParser` 实际上是所谓的索引覆盖解析器。在对给定的 JSON `String` 进行解析时，它会尽可能地不去创建新的 `String` 或字符数组实例。它只会维持一些指向底层字符数组的指针。除此之外，它也会尽可能地推迟对象的创建。如果解析出来的结果映射会被长时间用作缓存，那么你就需要意识到映射中的对象很可能还未被创建，映射本身只包含了对原本的字符缓冲的指针。不过，`JsonFastParser` 还包含一种特殊的斩断模式，在这个模式中它会很早就对原本的字符缓冲进行切分并维持对其的一小部分拷贝。如此，我们更推荐你对小于 2MB 的 JSON 缓冲使用 `JsonFastParser` 并记住其在长时间缓存方面的限制。
- `JsonParserLax` 是 `JsonParserCharArray` 的特殊变体。它的性能特征和 `JsonFastParser` 十分相似，但它不止依赖于 ECMA-404 JSON 语法。例如，它还能处理注释和不带引号的字符串等。
- `JsonParserUsingCharacterSource` 是一种用于大文件的特殊解析器。它使用了一种叫做“字符窗口”的技术来解析较大的 JSON 文件（所谓“较大”即指大小在 2MB 以上的文件）并使得其性能特征保持恒定不变。

<!-- The default parser implementation for JsonSlurper is JsonParserCharArray. The JsonParserType enumeration contains constants for the parser implementations described above: -->
`JsonSlurper` 默认的解析器实现是 `JsonParserCharArray`。`JsonParserType` 枚举中包含了对应上述所有实现的常量：

<table class="table">
	<tr>
		<th>实现</th>
		<th>常量</th>
	</tr>
	<tr>
		<td><code>JsonParserCharArray</code></td>
		<td><code>JsonParserType#CHAR_BUFFER</code></td>
	</tr>
	<tr>
		<td><code>JsonFastParser</code></td>
		<td><code>JsonParserType#INDEX_OVERLAY</code></td>
	</tr>
	<tr>
		<td><code>JsonParserLax</code></td>
		<td><code>JsonParserType#LAX</code></td>
	</tr>
	<tr>
		<td><code>JsonParserUsingCharacterSource</code></td>
		<td><code>JsonParserType#CHARACTER_SOURCE</code></td>
	</tr>
</table>

<!-- Changing the parser implementation is as easy as setting the JsonParserType with a call to JsonSlurper#setType(). -->
改变解析器实现只需要调用 `JsonSlurper#setType()` 改变 `JsonParserType` 值即可：

```groovy
def jsonSlurper = new JsonSlurper(type: JsonParserType.INDEX_OVERLAY)
def object = jsonSlurper.parseText('{ "myList": [4, 8, 15, 16, 23, 42] }')

assert object instanceof Map
assert object.myList instanceof List
assert object.myList == [4, 8, 15, 16, 23, 42]
```

## 2 JsonOutput

<!-- JsonOutput is responsible for serialising Groovy objects into JSON strings. It can be seen as companion object to JsonSlurper, being a JSON parser. -->
`JsonOutput` 用于将 Groovy 对象序列化为 JSON 字符串。它可以被视为 JSON 解析器 `JsonSlurper` 的伴生对象。

<!-- JsonOutput comes with overloaded, static toJson methods. Each toJson implementation takes a different parameter type. The static method can either be used directly or by importing the methods with a static import statement. -->
`JsonOutput` 包括几种不同版本的静态 `toJson` 方法，每种方法都接受不同的参数类型。这些静态方法可以被直接使用，也可以使用静态引入语句进行引入。

<!-- The result of a toJson call is a String containing the JSON code. -->
调用 `toJson` 方法的结果为包含结果 JSON 代码的 `String`。

```groovy
def json = JsonOutput.toJson([name: 'John Doe', age: 42])

assert json == '{"name":"John Doe","age":42}'
```

<!-- JsonOutput does not only support primitive, maps or list data types to be serialized to JSON, it goes further and even has support for serialising POGOs, that is, plain-old Groovy objects. -->
`JsonOutput` 并不支持基本数据类型，还支持映射和列表，甚至还能对 POGO 进行序列化，也就是普通的 Groovy 对象。

```groovy
class Person { String name }

def json = JsonOutput.toJson([ new Person(name: 'John'), new Person(name: 'Max') ])

assert json == '[{"name":"John"},{"name":"Max"}]'
```

<!-- As we saw in previous examples, the JSON output is not pretty printed per default. However, the prettyPrint method in JsonOutput comes to rescue for this task. -->
在上一个例子中我们看到，输出的 JSON 字符串默认是没有任何换行或缩进之类的格式符号的。通过调用 `JsonOutput` 的 `prettyPrint` 方法即可完成此任务：

```groovy
def json = JsonOutput.toJson([name: 'John Doe', age: 42])

assert json == '{"name":"John Doe","age":42}'

assert JsonOutput.prettyPrint(json) == '''\
{
    "name": "John Doe",
    "age": 42
}'''.stripIndent()
```

<!-- prettyPrint takes a String as single parameter; therefore, it can be applied on arbitrary JSON String instances, not only the result of JsonOutput.toJson. -->
`prettyPrint` 方法只接受一个 `String` 作为参数，因此它可用于任意的 JSON `String` 而不局限于 `JsonOutput.toJson` 的结果。

<!-- Another way to create JSON from Groovy is to use JsonBuilder or StreamingJsonBuilder. Both builders provide a DSL which allows to formulate an object graph which is then converted to JSON. -->
除此之外，在 Groovy 中创建 JSON 还可以使用 `JsonBuilder` 或 `StreamingJsonBuilder`。两种 `Builder` 都提供了各自的 DSL 用于构建对象图并最后将其转换为 JSON。

<!-- For more details on builders, have a look at the builders chapter which covers both JsonBuilder and StreamingJsonBuilder. -->
有关这些 `Builder` 的详细信息请查阅 [`JsonBuilder`](http://docs.groovy-lang.org/latest/html/documentation/core-domain-specific-languages.html#_jsonbuilder) 和 [`StreamingJsonBuilder`](http://docs.groovy-lang.org/latest/html/documentation/core-domain-specific-languages.html#_streamingjsonbuilder)。
