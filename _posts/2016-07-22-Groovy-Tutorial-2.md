---
layout: post_translated
title: Groovy 教程 - GDK
author: Robert Peng
category: Groovy
org_title: "Groovy Getting Started - The Groovy Development Kit"
org_url: "http://www.groovy-lang.org/groovy-dev-kit.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushGroovy.js"></script>
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

## 1 I/O

<!-- Groovy provides a number of helper methods for working with I/O. While you could use standard Java code in Groovy to deal with those, Groovy provides much more convenient ways to handle files, streams, readers, …​ -->
Groovy 为 I/O 提供了大量的[便捷方法](http://groovy-lang.org/gdk.html)。尽管你仍然可以在 Groovy 中使用标准的 Java 代码，但 Groovy 提供了更多方便的途径来处理文件、流等。

具体来说，你应该了解一下添加至如下类的方法：

- `java.io.File`：[http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/File.html](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/File.html)
- `java.io.InputStream`：[http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/InputStream.html](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/InputStream.html)
- `java.io.OutputStream`：[http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/OutputStream.html](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/OutputStream.html)
- `java.io.Reader`：[http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/Reader.html](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/Reader.html)
- `java.io.Writer`：[http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/Writer.html](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/Writer.html)
- `java.nio.file.Path`：[http://docs.groovy-lang.org/latest/html/groovy-jdk/java/nio/file/Path.html](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/nio/file/Path.html)

<!-- The following section focuses on sample idiomatic constructs using helper methods available above but is not meant to be a complete description of all available methods. For that, please read the GDK API. -->
接下来的内容将重点介绍如何使用上述便捷方法但并不会对所有的这些方法进行完整描述，具体请查阅 [GDK API](http://groovy-lang.org/gdk.html)。

### 1.1 读取文件

<!-- As a first example, let’s see how you would print all lines of a text file in Groovy: -->
在第一个例子中，我们先来看看如何在 Groovy 中打印一个文本文件中的内容：

<pre class="brush: groovy">
new File(baseDir, 'haiku.txt').eachLine { line ->
    println line
}
</pre>

<!-- The eachLine method is a method added to the File class automatically by Groovy and has many variants, for example if you need to know the line number, you can use this variant: -->
`eachLine` 方法是由 Groovy 自动添加到 `File` 类中的新方法而且有很多的变体，例如如果你想要知道文件的行号，你可以使用如下这个变体：

<pre class="brush: groovy">
new File(baseDir, 'haiku.txt').eachLine { line, nb ->
    println "Line $nb: $line"
}
</pre>

<!-- If for whatever reason the an exception is thrown in the eachLine body, the method makes sure that the resource is properly closed. This is true for all I/O resource methods that Groovy adds. -->
如果 `eachLine` 的方法体抛出了异常的话，`eachLine` 方法会确保所有相关资源都被正确地关闭。这一点对于所有由 Groovy 添加的 I/O 方法来说都是相同的。

<!-- For example in some cases you will prefer to use a Reader, but still benefit from the automatic resource management from Groovy. In the next example, the reader will be closed even if the exception occurs: -->
例如在某些时候你更想使用 `Reader`，但依然想利用上 Groovy 的自动资源管理。在下面的例子中，即使抛出了异常，所使用的 `Reader` 依然会被关闭：

<pre class="brush: groovy">
def count = 0, MAXSIZE = 3
new File(baseDir,"haiku.txt").withReader { reader ->
    while (reader.readLine()) {
        if (++count > MAXSIZE) {
            throw new RuntimeException('Haiku should only have 3 verses')
        }
    }
}
</pre>

如果你需要将一个文本文件的每一行内容放入到一个列表中，你可以这样做：

<pre class="brush: groovy">
def list = new File(baseDir, 'haiku.txt').collect {it}
</pre>

或者你也可以使用 `as` 操作符将文本文件每一行的内容放入到一个数组中：

<pre class="brush: groovy">
def array = new File(baseDir, 'haiku.txt') as String[]
</pre>

<!-- How many times did you have to get the contents of a file into a byte[] and how much code does it require? Groovy makes it very easy actually: -->
你有试过把文件的内容读入到一个 `byte[]` 中吗？这么做需要写多少代码呢？Groovy 则使得这么做变得十分简单：

<pre class="brush: groovy">
byte[] contents = file.bytes
</pre>

<!-- Working with I/O is not limited to dealing with files. In fact, a lot of operations rely on input/output streams, hence why Groovy adds a lot of support methods to those, as you can see in the documentation. -->
I/O 功能并不局限于文件读写。实际上，很大一部分操作依赖于输入输出流，因此 Groovy 为它们添加了大量的便捷方法，正如你在它们的[文档](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/io/InputStream.html)中看到的那样。

<!-- As an example, you can obtain an InputStream from a File very easily: -->
例如，你很容易就能够从一个 `File` 中获取一个 `InputStream`：

<pre class="brush: groovy">
def is = new File(baseDir,'haiku.txt').newInputStream()
// 做一些事情 ...
is.close()
</pre>

<!-- However you can see that it requires you to deal with closing the inputstream. In Groovy it is in general a better idea to use the withInputStream idiom that will take care of that for you: -->
然而，正如你所看到的那样，这样做会需要你自己关闭这个 `InputStream`。实际上，在 Groovy 中使用 `withInputStream` 方法来处理资源管理是更好的选择：

<pre class="brush: groovy">
new File(baseDir,'haiku.txt').withInputStream { stream ->
    // 做一些事情 ...
}
</pre>

### 1.2 写入文件

<!-- Of course in some cases you won’t want to read but write a file. One of the options is to use a Writer: -->
当然了，在某些情况下你可能会想要往文件中写入内容而不是读取内容。其中一种做法是使用 `Writer`：

<pre class="brush: groovy">
new File(baseDir,'haiku.txt').withWriter('utf-8') { writer ->
    writer.writeLine 'Into the ancient pond'
    writer.writeLine 'A frog jumps'
    writer.writeLine 'Water’s sound!'
}
</pre>

<!-- But for such a simple example, using the << operator would have been enough: -->
但对于这么简单的功能，使用 `<<` 运算符也许也足够了：

<pre class="brush: groovy">
new File(baseDir,'haiku.txt') &lt;&lt; '''Into the ancient pond
A frog jumps
Water’s sound!'''
</pre>

<!-- Of course we do not always deal with text contents, so you could use the Writer or directly write bytes as in this example: -->
当然了，我们并不总是只需要处理文本内容，所以你也可以使用 `Writer` 或者像如下示例那样直接写入字节：

<pre class="brush: groovy">
file.bytes = [66,22,11]
</pre>

<!-- Of course you can also directly deal with output streams. For example, here is how you would create an output stream to write into a file: -->
当然，你也可以直接处理输出流。例如，你可以像这个样子来创建一个能写入到文件的输出流：

<pre class="brush: groovy">
def os = new File(baseDir,'data.bin').newOutputStream()
// 做一些事情 ...
os.close()
</pre>

<!-- However you can see that it requires you to deal with closing the output stream. Again it is in general a better idea to use the withOutputStream idiom that will handle the exceptions and close the stream in any case: -->
然而，正如你所见，这么做需要你自己关闭该输出流。同样，使用 `withOutputStream` 方法是更好的做法，因为它能处理抛出的异常并最终能在任何情况下关闭输出流：

<pre class="brush: groovy">
new File(baseDir,'data.bin').withOutputStream { stream ->
    // 做一些事情 ...
}
</pre>

### 1.3 遍历文件树

<!-- In scripting contexts it is a common task to traverse a file tree in order to find some specific files and do something with them. Groovy provides multiple methods to do this. For example you can perform something on all files of a directory: -->
在编写脚本的时候我们经常会需要遍历文件树来找到某些特定的文件并进行一些处理。Groovy 为此提供了多种不同的方法。例如你可以对文件夹中的所有文件执行指定的操作：

<pre class="brush: groovy">
dir.eachFile { file ->                      // 注1
    println file.name
}
dir.eachFileMatch(~/.*\.txt/) { file ->     // 注2
    println file.name
}
</pre>

<table style="width: 100%">
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>

	<tr>
		<td>1</td>
		<td>对文件夹中的所有文件执行给定的闭包代码</td>
	</tr>
	<tr>
		<td>2</td>
		<td>对文件夹中所有匹配指定模式的文件执行给定的闭包代码</td>
	</tr>
</table>

<!-- Often you will have to deal with a deeper hierarchy of files, in which case you can use eachFileRecurse: -->
有时你还需要处理更深的文件层次，这时候你就需要使用 `eachFileRecurse` 了：

<pre class="brush: groovy">
dir.eachFileRecurse { file ->                      // 注1
    println file.name
}

dir.eachFileRecurse(FileType.FILES) { file ->      // 注2
    println file.name
}
</pre>

<table>
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>

	<tr>
		<td>1</td>
		<td>从该目录开始递归地查找所有文件或目录并执行指定的闭包代码</td>
	</tr>
	<tr>
		<td>2</td>
		<td>从该目录开始递归地查找所有文件并执行指定的闭包代码</td>
	</tr>
</table>

<!-- For more complex traversal techniques you can use the traverse method, which requires you to set a special flag indicating what to do with the traversal: -->
对于更复杂的遍历操作你可以使用 `traverse` 方法，这需要你要返回特殊的标识位来指示如何进行遍历：

<pre class="brush: groovy">
dir.traverse { file ->
    if (file.directory && file.name=='bin') {
        FileVisitResult.TERMINATE                   // 注1
    } else {
        println file.name
        FileVisitResult.CONTINUE                    // 注2
    }

}
</pre>

<table>
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr>
		<td>1</td>
		<td>如果该文件为一个文件夹且名称为 `bin` 则停止遍历</td>
	</tr>
	<tr>
		<td>2</td>
		<td>否则打印文件的名称并继续遍历</td>
	</tr>
</table>

### 1.4 数据与对象

<!-- In Java it is not uncommon to serialize and deserialize data using the java.io.DataOutputStream and java.io.DataInputStream classes respectively. Groovy will make it even easier to deal with them. For example, you could serialize data into a file and deserialize it using this code: -->
在 Java 中，通过 `java.io.DataOutputStream` 和 `java.io.DataInputStream` 类来对数据进行序列化和反序列化并不少见，而 Groovy 则让这个过程变得更为简单。例如，你可以使用如下代码来将数据序列化到文件中并读取：

<pre class="brush: groovy">
boolean b = true
String message = 'Hello from Groovy'
// 将数据序列化至一个文件
file.withDataOutputStream { out ->
    out.writeBoolean(b)
    out.writeUTF(message)
}
// ...
// 然后重新读取回来
file.withDataInputStream { input ->
    assert input.readBoolean() == b
    assert input.readUTF() == message
}
</pre>

<!-- And similarily, if the data you want to serialize implements the Serializable interface, you can proceed with an object output stream, as illustrated here: -->
同样的，如果你想要序列化的数据实现了 `Serializable` 接口，你还可以像如下代码那样使用 `ObjectOutputStream`：

<pre class="brush: groovy">
Person p = new Person(name:'Bob', age:76)
// 将数据序列化至一个文件
file.withObjectOutputStream { out ->
    out.writeObject(p)
}
// ...
// 然后读取回来
file.withObjectInputStream { input ->
    def p2 = input.readObject()
    assert p2.name == p.name
    assert p2.age == p.age
}
</pre>

### 1.5 执行外部进程

<!-- The previous section described how easy it was to deal with files, readers or streams in Groovy. However in domains like system administration or devops it is often required to communicate with external processes. -->
在上面的章节中我们看到了 Groovy 处理文件、`Reader` 和输入输出流有多简便。然而，在诸如系统管理或者 DevOps 这样的领域中，我们则需要 Groovy 脚本能够与外部进程进行通信。

<!-- Groovy provides a simple way to execute command line processes. Simply write the command line as a string and call the execute() method. E.g., on a *nix machine (or a windows machine with appropriate *nix commands installed), you can execute this: -->
Groovy 提供了一种十分简单的方法来执行命令行进程，只要把命令行写作一个简单的 `String` 对象然后调用其 `execute()` 方法即可。例如，在一个 \*nix 机器上（或者一个安装了合适的 \*nix 命令行环境的 Windows 机器上），你可以这样做：

<pre class="brush: groovy">
def process = "ls -l".execute()             // 注1
println "Found text ${process.text}"        // 注2
</pre>

<table>
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr>
		<td>1</td>
		<td>在一个外部进程中执行 `ls` 命令</td>
	</tr>
	<tr>
		<td>2</td>
		<td>消耗命令的输出并将其作为文本进行读取</td>
	</tr>
</table>

<!-- The execute() method returns a java.lang.Process instance which will subsequently allow the in/out/err streams to be processed and the exit value from the process to be inspected etc. -->
`execute()` 方法会返回一个 `java.lang.Process` 对象，借由此我们可以对标准输入/标准输出/错误输出流进行处理，或者检查进程退出时的退出值。

<!-- e.g. here is the same command as above but we will now process the resulting stream a line at a time: -->
例如，这里我们执行与上例相同的命令，但我们将逐行地处理其输出流：

<pre class="brush: groovy">
def process = "ls -l".execute()             // 注1
process.in.eachLine { line ->               // 注2
    println line                            // 注3
}
</pre>

<table>
	<colgroup>
		<col style="width: 5%">
		<col style="width: 95%">
	</colgroup>
	<tr>
		<td>1</td>
		<td>在一个外部进程中执行 `ls` 命令</td>
	</tr>
	<tr>
		<td>2</td>
		<td>对于该进程的输入流中的每一行内容</td>
	</tr>
	<tr>
		<td>3</td>
		<td>输出该内容</td>
	</tr>
</table>

<!-- It is worth noting that in corresponds to an input stream to the standard output of the command. out will refer to a stream where you can send data to the process (its standard input). -->
值得注意的是 `in` 代表的输入流对应着命令的标准输出，而你可以通过 `out` 代表的输出流向进程的标准输入写入数据。

<!-- Remember that many commands are shell built-ins and need special handling. So if you want a listing of files in a directory on a Windows machine and write: -->
注意，有不少命令实际上是 Shell 的内置功能，需要一些特殊的处理。所以如果你想要在一个 Windows 机器上列出一个文件夹内的所有文件，然后这样写的话：

<pre class="brush: groovy">
def process = "dir".execute()
println "${process.text}"
</pre>

<!-- you will receive an IOException saying  Cannot run program "dir": CreateProcess error=2, The system cannot find the file specified. -->
你会得到一个 `IOException`，内容如下：`Cannot run program "dir": CreateProcess error=2, The system cannot find the file specified.`

<!-- This is because dir is built-in to the Windows shell (cmd.exe) and can’t be run as a simple executable. Instead, you will need to write: -->
这是因为 `dir` 实际上是 Windows Shell（`cmd.exe`）的一个内置功能，不能被当做一个单纯的可执行文件来运行。因此，你应该这样写：

<pre class="brush: groovy">
def process = "cmd /c dir".execute()
println "${process.text}"
</pre>

<!-- Also, because this functionality currently makes use of java.lang.Process undercover, the deficiencies of that class must be taken into consideration. In particular, the javadoc for this class says: -->
除此之外，由于这个功能实际上是通过 `java.lang.Process` 实现的，因此我们也应该考虑到这个类的一些不足之处。具体来说，它的 JavaDoc 是这么说的：

<!-- Because some native platforms only provide limited buffer size for standard input and output streams, failure to promptly write the input stream or read the output stream of the subprocess may cause the subprocess to block, and even deadlock -->

> 因为有些平台只为标准输入和输出流提供了很有限的缓存空间，写入输入流和读取输出流发生错误时可能会导致子进程发生阻塞，甚至发生死锁。

<!-- Because of this, Groovy provides some additional helper methods which make stream handling for processes easier. -->
正是因为这个原因，Groovy 提供了一些额外的便捷方法来更好地处理外部进程的输入输出流。

<!-- Here is how to gobble all of the output (including the error stream output) from your process: -->
通过如下代码你可以消耗掉进程的所有输出（包括错误流输出）：

<pre class="brush: groovy">
def p = "rm -f foo.tmp".execute([], tmpDir)
p.consumeProcessOutput()
p.waitFor()
</pre>

<!-- There are also variations of consumeProcessOutput that make use of StringBuffer, InputStream, OutputStream etc…​ For a complete list, please read the GDK API for java.lang.Process -->
`consumeProcessOutput` 方法还包括其他一些变体可以利用 `StringBuffer`、`InputStream`、`OutputStream` 等，详见 `java.lang.Process` 的 [GDK API](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/lang/Process.html)。

<!-- In addition, these is a pipeTo command (mapped to | to allow overloading) which lets the output stream of one process be fed into the input stream of another process. -->
除此之外，还有一个 `pipeTo` 方法（对应于 `|` 操作符且可进行重载）可以将一个进程的输出流内容转移到另一个进程的输入流中。

如下为使用该方法的案例。

<pre class="brush: groovy">
proc1 = 'ls'.execute()
proc2 = 'tr -d o'.execute()
proc3 = 'tr -d e'.execute()
proc4 = 'tr -d i'.execute()
proc1 | proc2 | proc3 | proc4
proc4.waitFor()
if (proc4.exitValue()) {
    println proc4.err.text
} else {
    println proc4.text
}
</pre>

消耗错误流输出：

<pre class="brush: groovy">
def sout = new StringBuilder()
def serr = new StringBuilder()
proc2 = 'tr -d o'.execute()
proc3 = 'tr -d e'.execute()
proc4 = 'tr -d i'.execute()
proc4.consumeProcessOutput(sout, serr)
proc2 | proc3 | proc4
[proc2, proc3].each { it.consumeProcessErrorStream(serr) }
proc2.withWriter { writer ->
    writer &lt;&lt; 'testfile.groovy'
}
proc4.waitForOrKill(1000)
println "Standard output: $sout"
println "Standard error: $serr"
</pre>

## 2 集合

<!-- Groovy provides native support for various collection types, including lists, maps or ranges. Most of those are based on the Java collection types and decorated with additional methods found in the Groovy development kit. -->
Groovy 为各种不同的集合类型提供了原生的语言支持，包括[列表](http://www.groovy-lang.org/groovy-dev-kit.html#Collections-Lists)、[映射](http://www.groovy-lang.org/groovy-dev-kit.html#Collections-Maps)和[范围](http://www.groovy-lang.org/groovy-dev-kit.html#Collections-Ranges)。这些集合类大多数都基于 Java 原本的集合类型，同时加上了 [GDK](http://www.groovy-lang.org/gdk.html) 特有的方法。

### 2.1 列表

#### 2.1.1 列表字面量

<!-- You can create lists as follows. Notice that [] is the empty list expression. -->
你可以像如下代码那样创建列表。注意 `[]` 是空列表表达式。

<pre class="brush: groovy">
def list = [5, 6, 7, 8]
assert list.get(2) == 7
assert list[2] == 7
assert list instanceof java.util.List

def emptyList = []
assert emptyList.size() == 0
emptyList.add(5)
assert emptyList.size() == 1
</pre>

<!-- Each list expression creates an implementation of java.util.List. -->
每一个列表表达式都会创建一个 [`java.util.List`](http://docs.oracle.com/javase/8/docs/api/java/util/List.html) 实现类。

<!-- Of course lists can be used as a source to construct another list: -->
当然，列表也可以用于创建另一个列表：

<pre class="brush: groovy">
def list1 = ['a', 'b', 'c']
// 创建一个包含 `list1` 元素的新列表
def list2 = new ArrayList&lt;String>(list1)

assert list2 == list1 // == checks that each corresponding element is the same

// clone() can also be called
def list3 = list1.clone()
assert list3 == list1
</pre>

列表实际上就是对象的有序集合：

<pre class="brush: groovy">
def list = [5, 6, 7, 8]
assert list.size() == 4
assert list.getClass() == ArrayList     // 具体使用的列表实现类

assert list[2] == 7                     // 元素索引值从 0 开始
assert list.getAt(2) == 7               // 下标运算符 [] 的等价方法
assert list.get(2) == 7                 // 另一个可用的方法

list[2] = 9
assert list == [5, 6, 9, 8,]            // 在尾部再加一个逗号也是可以的

list.putAt(2, 10)                       // 使用 [] 修改元素值的等价方法
assert list == [5, 6, 10, 8]
assert list.set(2, 11) == 10            // 可用的另一个修改元素的方法，返回旧的元素值
assert list == [5, 6, 11, 8]

assert ['a', 1, 'a', 'a', 2.5, 2.5f, 2.5d, 'hello', 7g, null, 9 as byte]
// 可以包含重复或不同类型的元素

assert [1, 2, 3, 4, 5][-1] == 5             // 使用负索引值从列表末尾开始访问元素
assert [1, 2, 3, 4, 5][-2] == 4
assert [1, 2, 3, 4, 5].getAt(-2) == 4       // getAt() 同样接受负索引值
try {
    [1, 2, 3, 4, 5].get(-2)                 // 但 get() 不接受负索引值
    assert false
} catch (e) {
    assert e instanceof ArrayIndexOutOfBoundsException
}
</pre>

#### 2.1.2 将列表作为布尔表达式

列表可以被估作一个 `boolean` 值：

<pre class="brush: groovy">
assert ![]             // 空白列表会被视作 `false` 值

// 其他所有列表，无论其内容，都会被视作 `true`
assert [1] && ['a'] && [0] && [0.0] && [false] && [null]
</pre>

#### 2.1.3 遍历列表

通常我们可以通过调用 `each` 或 `eachWithIndex` 方法来遍历列表的所有元素并给定处理元素的代码：

<pre class="brush: groovy">
[1, 2, 3].each {
    println "Item: $it" // `it` 是一个隐式参数，指代元素的索引值
}
['a', 'b', 'c'].eachWithIndex { it, i -> // `it` 为当前元素，而 `i` 为当前索引值
    println "$i: $it"
}
</pre>

除了遍历列表，有时我们还需要对一个列表的元素进行转换进而构建出另一个新的列表。这个操作，又被称为映射，在 Groovy 中可通过 `collect` 方法完成：

<pre class="brush: groovy">
assert [1, 2, 3].collect { it * 2 } == [2, 4, 6]

// `collect` 的另一种快捷写法
assert [1, 2, 3]*.multiply(2) == [1, 2, 3].collect { it.multiply(2) }

def list = [0]
// 可以通过给 `collect` 方法给定的列表放入新产生的元素
assert [1, 2, 3].collect(list) { it * 2 } == [0, 2, 4, 6]
assert list == [0, 2, 4, 6]
</pre>

#### 2.1.4 过滤和查找

<pre class="brush: groovy">
assert [1, 2, 3].find { it > 1 } == 2               // 查找第一个匹配给定条件的元素
assert [1, 2, 3].findAll { it > 1 } == [2, 3]       // 查找所有匹配给定条件的元素
assert ['a', 'b', 'c', 'd', 'e'].findIndexOf {      // 查找第一个匹配给定条件的元素的索引值
    it in ['c', 'e', 'g']
} == 2

assert ['a', 'b', 'c', 'd', 'c'].indexOf('c') == 2  // 返回索引值
assert ['a', 'b', 'c', 'd', 'c'].indexOf('z') == -1 // 返回的索引值为 -1 意味着元素未找到
assert ['a', 'b', 'c', 'd', 'c'].lastIndexOf('c') == 4

assert [1, 2, 3].every { it &lt; 5 }                // 如果所有元素都满足给定的条件则返回 true
assert ![1, 2, 3].every { it &lt; 3 }
assert [1, 2, 3].any { it > 2 }                     // 如果存在满足给定条件的元素则返回 true
assert ![1, 2, 3].any { it > 3 }

assert [1, 2, 3, 4, 5, 6].sum() == 21                // 使用元素的 plus() 方法来返回元素的总和值
assert ['a', 'b', 'c', 'd', 'e'].sum {
    it == 'a' ? 1 : it == 'b' ? 2 : it == 'c' ? 3 : it == 'd' ? 4 : it == 'e' ? 5 : 0
    // 使用自定义的值来求和
} == 15
assert ['a', 'b', 'c', 'd', 'e'].sum { ((char) it) - ((char) 'a') } == 10
assert ['a', 'b', 'c', 'd', 'e'].sum() == 'abcde'
assert [['a', 'b'], ['c', 'd']].sum() == ['a', 'b', 'c', 'd']

// 可以提供一个给定的初始值
assert [].sum(1000) == 1000
assert [1, 2, 3].sum(1000) == 1006

assert [1, 2, 3].join('-') == '1-2-3'           // 字符串拼接
assert [1, 2, 3].inject('counting: ') {
    str, item -> str + item                     // 归约操作
} == 'counting: 123'
assert [1, 2, 3].inject(0) { count, item ->
    count + item
} == 6
</pre>

Groovy 还提供了在集合中查找最大值和最小值的方法：

<pre class="brush: groovy">
def list = [9, 4, 2, 10, 5]
assert list.max() == 10
assert list.min() == 2

// 我们还可以比较包括字符在内的可比较的对象
assert ['x', 'y', 'a', 'z'].min() == 'a'

// 我们还可以通过闭包来给定排序的行为
def list2 = ['abc', 'z', 'xyzuvw', 'Hello', '321']
assert list2.max { it.size() } == 'xyzuvw'
assert list2.min { it.size() } == 'z'
</pre>

除了闭包，你还可以使用 `Comparator` 来定义大小比较规则：

<pre class="brush: groovy">
Comparator mc = { a, b -> a == b ? 0 : (a &lt; b ? -1 : 1) }

def list = [7, 4, 9, -6, -1, 11, 2, 3, -9, 5, -13]
assert list.max(mc) == 11
assert list.min(mc) == -13

Comparator mc2 = { a, b -> a == b ? 0 : (Math.abs(a) &lt; Math.abs(b)) ? -1 : 1 }


assert list.max(mc2) == -13
assert list.min(mc2) == -1

assert list.max { a, b -> a.equals(b) ? 0 : Math.abs(a) &lt; Math.abs(b) ? -1 : 1 } == -13
assert list.min { a, b -> a.equals(b) ? 0 : Math.abs(a) &lt; Math.abs(b) ? -1 : 1 } == -1
</pre>

#### 2.1.5 添加和移除元素

我们可以使用 `[]` 来创建一个新的空列表并用 `<<` 来向其中追加元素：

<pre class="brush: groovy">
def list = []
assert list.empty

list &lt;&lt; 5
assert list.size() == 1

list &lt;&lt; 7 &lt;&lt; 'i' &lt;&lt; 11
assert list == [5, 7, 'i', 11]

list &lt;&lt; ['m', 'o']
assert list == [5, 7, 'i', 11, ['m', 'o']]

// &lt;&lt; 调用链的第一个对象为目标列表
assert ([1, 2] &lt;&lt; 3 &lt;&lt; [4, 5] &lt;&lt; 6) == [1, 2, 3, [4, 5], 6]

// 使用 leftShift 方法等价于使用 &lt;&lt; 方法
assert ([1, 2, 3] &lt;&lt; 4) == ([1, 2, 3].leftShift(4))
</pre>

除此之外很有很多种向列表中添加元素的方式：

<pre class="brush: groovy">
assert [1, 2] + 3 + [4, 5] + 6 == [1, 2, 3, 4, 5, 6]
// 等价于调用 `plus` 方法
assert [1, 2].plus(3).plus([4, 5]).plus(6) == [1, 2, 3, 4, 5, 6]

def a = [1, 2, 3]
a += 4      // 创建一个新的列表并赋值给 `a`
a += [5, 6]
assert a == [1, 2, 3, 4, 5, 6]

assert [1, *[222, 333], 456] == [1, 222, 333, 456]
assert [*[1, 2, 3]] == [1, 2, 3]
assert [1, [2, 3, [4, 5], 6], 7, [8, 9]].flatten() == [1, 2, 3, 4, 5, 6, 7, 8, 9]

def list = [1, 2]
list.add(3)
list.addAll([5, 4])
assert list == [1, 2, 3, 5, 4]

list = [1, 2]
list.add(1, 3) // 在索引值 1 之前添加元素 3
assert list == [1, 3, 2]

list.addAll(2, [5, 4]) // 在索引值 2 之前添加元素 5 和 4
assert list == [1, 3, 5, 4, 2]

list = ['a', 'b', 'z', 'e', 'u', 'v', 'g']
list[8] = 'x' // [] 操作符在有需要的时候会扩充列表
// 并在需要的位置插入 null 值
assert list == ['a', 'b', 'z', 'e', 'u', 'v', 'g', null, 'x']
</pre>

<!-- It is however important that the + operator on a list is not mutating. Compared to <<, it will create a new list, which is often not what you want and can lead to performance issues. -->
然而，值得注意的是，对列表使用 `+` 运算符并不会改变原列表。比起 `<<`，它会产生出一个新的列表，很多时候这可能不是你想要的效果进而带来一些性能上的问题。

<!-- The Groovy development kit also contains methods allowing you to easily remove elements from a list by value: -->
GDK 同样包含一些可以让你很方便地从列表中移除元素的方法：

<pre class="brush: groovy">
assert ['a','b','c','b','b'] - 'c' == ['a','b','b','b']
assert ['a','b','c','b','b'] - 'b' == ['a','c']
assert ['a','b','c','b','b'] - ['b','c'] == ['a']

def list = [1,2,3,4,3,2,1]
list -= 3           // 通过从原本的列表中移除 `3` 来创建一个新的列表
assert list == [1,2,4,2,1]
assert ( list -= [2,4] ) == [1,1]
</pre>

<!-- It is also possible to remove an element by referring to its index, in which case the list is mutated: -->
同样，我们还可以通过给定元素的索引值来移除元素，而这种情况则会改变原本的列表：

<pre class="brush: groovy">
def list = [1,2,3,4,5,6,2,2,1]
assert list.removeAt(2) == 3          // 移除第三个元素并返回
assert list == [1,2,4,5,6,2,2,1]
</pre>

<!-- In case you only want to remove the first element having the same value in a list, instead of removing all elements, you call call the remove method: -->

如果你只是想移除列表中第一个拥有给定值的元素而不是移除所有元素，你可以使用 `remove` 方法：

<pre class="brush: groovy">
def list= ['a','b','c','b','b']
assert list.remove('c')             // 移除 'c'。由于成功找到元素并移除，因此返回 `true`
assert list.remove('b')             // 移除第一个 'b'，返回 `true`

assert ! list.remove('z')           // 由于找不到元素 'z'，返回 `false`
assert list == ['a','b','b']
</pre>

<!-- And removing all the elements in a list can be done by calling the clear method: -->
通过 `clear` 方法可以移除列表中的所有元素：

<pre class="brush: groovy">
def list= ['a',2,'c',4]
list.clear()
assert list == []
</pre>

#### 2.1.6 集合操作

GDK 还提供了可以更好地进行集合操作的方法：

<pre class="brush: groovy">
assert 'a' in ['a','b','c']             // 如果该列表包含给定的元素则返回 true
assert ['a','b','c'].contains('a')      // 等价于 Java 的 `contains` 方法
assert [1,3,4].containsAll([1,4])       // `containsAll` 方法会检查列表是否包含所有给定的元素

assert [1,2,3,3,3,3,4,5].count(3) == 4  // 计算列表中拥有给定值的元素个数
assert [1,2,3,3,3,3,4,5].count {
    it%2==0                             // 计算列表中满足给定条件的元素个数
} == 2

assert [1,2,4,6,8,10,12].intersect([1,3,6,9,12]) == [1,6,12]

assert [1,2,3].disjoint( [4,6,9] )
assert ![1,2,3].disjoint( [2,4,6] )
</pre>

#### 2.1.7 排序

<!-- Working with collections often implies sorting. Groovy offers a variety of options to sort lists, from using closures to comparators, as in the following examples: -->
使用集合时通常需要对其进行排序。Groovy 同样提供了多种排序列表的方式，可以使用闭包或是提供 `Comparator`，正如如下例子所示：

<pre class="brush: groovy">
assert [6, 3, 9, 2, 7, 1, 5].sort() == [1, 2, 3, 5, 6, 7, 9]

def list = ['abc', 'z', 'xyzuvw', 'Hello', '321']
assert list.sort {
    it.size()
} == ['z', 'abc', '321', 'Hello', 'xyzuvw']

def list2 = [7, 4, -6, -1, 11, 2, 3, -9, 5, -13]
assert list2.sort { a, b -> a == b ? 0 : Math.abs(a) &lt; Math.abs(b) ? -1 : 1 } ==
        [-1, 2, 3, 4, 5, -6, 7, -9, 11, -13]

Comparator mc = { a, b -> a == b ? 0 : Math.abs(a) &lt; Math.abs(b) ? -1 : 1 }

// 只可用于 JDK 8+
// list2.sort(mc)
// assert list2 == [-1, 2, 3, 4, 5, -6, 7, -9, 11, -13]

def list3 = [6, -3, 9, 2, -7, 1, 5]

Collections.sort(list3)
assert list3 == [-7, -3, 1, 2, 5, 6, 9]

Collections.sort(list3, mc)
assert list3 == [1, 2, -3, 5, 6, -7, 9]
</pre>

#### 2.1.8 复制元素

<!-- The Groovy development kit also takes advantage of operator overloading to provide methods allowing duplication of elements of a list: -->
GDK 还利用了运算符重载的功能为列表提供了复制元素的方法：

<pre class="brush: groovy">
assert [1, 2, 3] * 3 == [1, 2, 3, 1, 2, 3, 1, 2, 3]
assert [1, 2, 3].multiply(2) == [1, 2, 3, 1, 2, 3]
assert Collections.nCopies(3, 'b') == ['b', 'b', 'b']

// JDK 定义的 `nCopies` 则有着不同的语义
assert Collections.nCopies(2, [1, 2]) == [[1, 2], [1, 2]] // 不是 [1,2,1,2]
</pre>

### 2.2 映射

#### 2.2.1 映射字面量

<!-- In Groovy, maps (also known as associative arrays) can be created using the map literal syntax: [:]: -->
在 Groovy 中，映射（又被称为联合数组）可使用映射字面量语法 `[:]` 创建：

<pre class="brush: groovy">
def map = [name: 'Gromit', likes: 'cheese', id: 1234]
assert map.get('name') == 'Gromit'
assert map.get('id') == 1234
assert map['name'] == 'Gromit'
assert map['id'] == 1234
assert map instanceof java.util.Map

def emptyMap = [:]
assert emptyMap.size() == 0
emptyMap.put("foo", 5)
assert emptyMap.size() == 1
assert emptyMap.get("foo") == 5
</pre>

<!-- Map keys are strings by default: [a:1] is equivalent to ['a':1]. This can be confusing if you define a variable named a and that you want the value of a to be the key in your map. If this is the case, then you must escape the key by adding parenthesis, like in the following example: -->
映射的键默认为字符串：`[a:1]` 等价于 `['a':1]`。你有可能会没能意识到这种语句的含义，如果你定义了一个叫 `a` 的变量并且你想将它的值作为映射的键的话。如果你想要这样做的话，你应该像下面的例子那样为键加上括号来进行转义：

<pre class="brush: groovy">
def a = 'Bob'
def ages = [a: 43]
assert ages['Bob'] == null // 无法找到 `Bob`
assert ages['a'] == 43     // 因为 `a` 是一个字面量

ages = [(a): 43]            // 现在我们通过为 `a` 加上括号来进行转义
assert ages['Bob'] == 43   // 这样我们就能找到关联的值了
</pre>

<!-- In addition to map literals, it is possible, to get a new copy of a map, to clone it: -->
除了映射字面量，你还可以获取一个映射的拷贝：

<pre class="brush: groovy">
def map = [
        simple : 123,
        complex: [a: 1, b: 2]
]
def map2 = map.clone()
assert map2.get('simple') == map.get('simple')
assert map2.get('complex') == map.get('complex')
map2.get('complex').put('c', 3)
assert map.get('complex').get('c') == 3
</pre>

<!-- The resulting map is a shallow copy of the original one, as illustrated in the previous example. -->
正如上面的例子所示，所得的映射只是原映射的**浅**拷贝。

#### 2.2.2 映射属性访问语句

<!-- Maps also act like beans so you can use the property notation to get/set items inside the Map as long as the keys are strings which are valid Groovy identifiers: -->
映射同样可以作为 Bean 使用，因此你也可以使用属性访问语句来访问映射，只要映射的键是字符串而且也是合法的 Groovy 标识符：

<pre class="brush: groovy">
def map = [name: 'Gromit', likes: 'cheese', id: 1234]
assert map.name == 'Gromit'     // 可用于替换 map.get('name')
assert map.id == 1234

def emptyMap = [:]
assert emptyMap.size() == 0
emptyMap.foo = 5
assert emptyMap.size() == 1
assert emptyMap.foo == 5
</pre>

<!-- Note: by design map.foo will always look for the key foo in the map. This means foo.class will return null on a map that doesn’t contain the class key. Should you really want to know the class, then you must use getClass(): -->
注意，按这种规则的话，`map.foo` 会导致 Groovy 从映射 `map` 中查找 `foo`。这意味着如果映射 `map` 不包含键 `class` 的话，`map.class` 会返回 `null`。如果你只是想要获取映射的 `Class` 对象，你只能直接使用 `getClass()` 方法 ：

<pre class="brush: groovy">
def map = [name: 'Gromit', likes: 'cheese', id: 1234]
assert map.class == null
assert map.get('class') == null
assert map.getClass() == LinkedHashMap // 也许这才是你想要的

map = [1      : 'a',
       (true) : 'p',
       (false): 'q',
       (null) : 'x',
       'null' : 'z']
assert map.containsKey(1) // `1` 并不是合法的标识符，所以只能这样写
assert map.true == null
assert map.false == null
assert map.get(true) == 'p'
assert map.get(false) == 'q'
assert map.null == 'z'
assert map.get(null) == 'x'
</pre>

#### 2.2.3 遍历映射

正如之前那样，GDK 同样为映射提供了 `each` 和 `eachWithIndex` 方法来进行遍历。值得注意的是通过映射字面量表达式创建的映射是有序的，也就是说如果你尝试遍历映射，映射中的键值对将总是以其被添加到映射中的顺序被遍历。

<pre class="brush: groovy">
def map = [
        Bob  : 42,
        Alice: 54,
        Max  : 33
]

// `entry` 是映射中的一个键值对
map.each { entry ->
    println "Name: $entry.key Age: $entry.value"
}

// `entry` 是映射中的一个键值对，`i` 则为其索引值
map.eachWithIndex { entry, i ->
    println "$i - Name: $entry.key Age: $entry.value"
}

// 除此之外，你也可以直接访问被遍历的键和值
map.each { key, value ->
    println "Name: $key Age: $value"
}

// 还能直接访问键、值以及索引值 `i`
map.eachWithIndex { key, value, i ->
    println "$i - Name: $key Age: $value"
}
</pre>

#### 2.2.4 添加和删除元素

<!-- Adding an element to a map can be done either using the put method, the subscript operator or using putAll: -->
可以通过 `put` 方法、`putAll` 方法或下标运算符来将一个元素添加到映射中：

<pre class="brush: groovy">
def defaults = [1: 'a', 2: 'b', 3: 'c', 4: 'd']
def overrides = [2: 'z', 5: 'x', 13: 'x']

def result = new LinkedHashMap(defaults)
result.put(15, 't')
result[17] = 'u'
result.putAll(overrides)
assert result == [1: 'a', 2: 'z', 3: 'c', 4: 'd', 5: 'x', 13: 'x', 15: 't', 17: 'u']
</pre>

<!-- Removing all the elements of a map can be done by calling the clear method: -->
调用 `clear` 方法可以移除映射中的所有元素：

<pre class="brush: groovy">
def m = [1:'a', 2:'b']
assert m.get(1) == 'a'
m.clear()
assert m == [:]
</pre>

<!-- Maps generated using the map literal syntax are using the object equals and hashcode methods. This means that you should never use an object which hash code is subject to change over time, or you wouldn’t be able to get the associated value back. -->
由映射字面量语法产生的映射依赖于键的 `equals` 和 `hashCode` 方法，因此你不应使用那些 `hashCode` 会发生变化的对象作为键，否则你很有可能无法获取到其关联的值。

<!-- It is also worth noting that you should never use a GString as the key of a map, because the hash code of a GString is not the same as the hash code of an equivalent String: -->
除此之外值得注意的是，你不应使用 `GString` 作为映射的键，因为 `GString` 的哈希码和内容与其相同的 `String` 的哈希码是不同的：

<pre class="brush: groovy">
def key = 'some key'
def map = [:]
def gstringKey = "${key.toUpperCase()}"
map.put(gstringKey,'value')
assert map.get('SOME KEY') == null
</pre>

#### 2.1.5 键、值与键值对

<!-- We can inspect the keys, values, and entries in a view: -->
我们可以在一个视图中读取映射的键、值和键值对：

<pre class="brush: groovy">
def map = [1:'a', 2:'b', 3:'c']

def entries = map.entrySet()
entries.each { entry ->
  assert entry.key in [1,2,3]
  assert entry.value in ['a','b','c']
}

def keys = map.keySet()
assert keys == [1,2,3] as Set
</pre>

<!-- Mutating values returned by the view (be it a map entry, a key or a value) is highly discouraged because success of the operation directly depends on the type of the map being manipulated. In particular, Groovy relies on collections from the JDK that in general make no guarantee that a collection can safely be manipulated through keySet, entrySet, or values. -->
通过该试图来修改映射（修改其键或值或键值对）都是不可取的，因为这样的操作是否能顺利执行直接取决于其背后被修改的映射的类型。具体来说，Groovy 所使用的来自 JDK 的集合类并不保证映射可以安全地通过其 `keySet`、`entrySet` 或 `values` 视图进行修改。

#### 2.1.6 过滤与查找

<!-- The Groovy development kit contains filtering, searching and collecting methods similar to those found for lists: -->
GDK 也为映射提供了与[列表](http://www.groovy-lang.org/groovy-dev-kit.html#List-Filtering)类似的过滤、查找和收集方法：

<pre class="brush: groovy">
def people = [
    1: [name:'Bob', age: 32, gender: 'M'],
    2: [name:'Johnny', age: 36, gender: 'M'],
    3: [name:'Claire', age: 21, gender: 'F'],
    4: [name:'Amy', age: 54, gender:'F']
]

def bob = people.find { it.value.name == 'Bob' } // 查找单一键值对
def females = people.findAll { it.value.gender == 'F' }

// 上述两个方法均返回键值对，但你可以使用 `collect` 方法来获取其域
def ageOfBob = bob.value.age
def agesOfFemales = females.collect {
    it.value.age
}

assert ageOfBob == 32
assert agesOfFemales == [21,54]

// 你还可以使用键值对作为闭包的参数
def agesOfMales = people.findAll { id, person ->
    person.gender == 'M'
}.collect { id, person ->
    person.age
}
assert agesOfMales == [32, 36]

// 如果所有键值对均满足给定的条件则 `every` 方法返回 true 
assert people.every { id, person ->
    person.age > 18
}

// 如果存在键值对满足给定的条件则 `any` 方法返回 true

assert people.any { id, person ->
    person.age == 54
}
</pre>

#### 2.1.7 分组

<!-- We can group a list into a map using some criteria: -->
我们可以通过给定一个条件来让列表中的元素各自分组形成一个列表：

<pre class="brush: groovy">
assert ['a', 7, 'b', [2, 3]].groupBy {
    it.class
} == [(String)   : ['a', 'b'],
      (Integer)  : [7],
      (ArrayList): [[2, 3]]
]

assert [
        [name: 'Clark', city: 'London'], [name: 'Sharma', city: 'London'],
        [name: 'Maradona', city: 'LA'], [name: 'Zhang', city: 'HK'],
        [name: 'Ali', city: 'HK'], [name: 'Liu', city: 'HK'],
].groupBy { it.city } == [
        London: [[name: 'Clark', city: 'London'],
                 [name: 'Sharma', city: 'London']],
        LA    : [[name: 'Maradona', city: 'LA']],
        HK    : [[name: 'Zhang', city: 'HK'],
                 [name: 'Ali', city: 'HK'],
                 [name: 'Liu', city: 'HK']],
]
</pre>

### 2.3 区间

<!-- Ranges allow you to create a list of sequential values. These can be used as List since Range extends java.util.List. -->
你可以使用区间（Range）来创建一个由连续值组成的列表。区间可以被直接用作 `List` 因为 [`Range`](http://docs.groovy-lang.org/latest/html/api/groovy/lang/Range.html) 扩展了 [`java.util.List`](http://docs.oracle.com/javase/8/docs/api/java/util/List.html)。

<!-- Ranges defined with the .. notation are inclusive (that is the list contains the from and to value). -->
使用 `..` 记号定义的区间是一个闭区间（也就是说该列表包含了起始值和终止值）。

<!-- Ranges defined with the ..< notation are half-open, they include the first value but not the last value. -->
使用 `..<` 记号定义的区间则是一个半开区间：它包含起始值但不包含终止值。

<pre class="brush: groovy">
// 闭区间
def range = 5..8
assert range.size() == 4
assert range.get(2) == 7
assert range[2] == 7
assert range instanceof java.util.List
assert range.contains(5)
assert range.contains(8)

// 半开区间
range = 5..&lt;8
assert range.size() == 3
assert range.get(2) == 7
assert range[2] == 7
assert range instanceof java.util.List
assert range.contains(5)
assert !range.contains(8)

// 可以在不使用集体索引值的情况下获取区间的端点值
range = 1..10
assert range.from == 1
assert range.to == 10
</pre>

<!-- Note that int ranges are implemented efficiently, creating a lightweight Java object containing a from and to value. -->
值得注意的是，`int` 类型区间的实现方式十分高效，实际上就是一个只包含了起始值和终止值的 Java 对象。

<!-- Ranges can be used for any Java object which implements java.lang.Comparable for comparison and also have methods next() and previous() to return the next / previous item in the range. For example, you can create a range of String elements: -->
区间可以被用作任何实现了 `java.lang.Comparable` 接口用于进行大小比较，同时又有方法 `next()` 和 `previous()` 用于返回其上一个和下一个值的 Java 对象。例如，你可以创建一个由 `String` 元素组成的区间：

<pre class="brush: groovy">
// 闭区间
def range = 'a'..'d'
assert range.size() == 4
assert range.get(2) == 'c'
assert range[2] == 'c'
assert range instanceof java.util.List
assert range.contains('a')
assert range.contains('d')
assert !range.contains('e')
</pre>

<!-- You can iterate on a range using a classic for loop: -->
你可以使用经典的 `for` 循环来迭代区间：

<pre class="brush: groovy">
for (i in 1..10) {
    println "Hello ${i}"
}
</pre>

<!-- but alternatively you can achieve the same effect in a more Groovy idiomatic style, by iterating a range with each method: -->
但你也可以通过使用 `each` 方法来更 Groovy 地迭代区间：

<pre class="brush: groovy">
(1..10).each { i ->
    println "Hello ${i}"
}
</pre>

<!-- Ranges can be also used in the switch statement: -->
区间还可用于 `switch` 语句：

<pre class="brush: groovy">
switch (years) {
    case 1..10: interestRate = 0.076; break;
    case 11..25: interestRate = 0.052; break;
    default: interestRate = 0.037;
}
</pre>

### 2.4 集合类的语法增强

#### 2.4.1 GPath 支持

多亏了列表和映射都支持属性访问语法，在 Groovy 中我们可以使用语法糖来更好地应对嵌套集合，如下例所示：

<pre class="brush: groovy">
def listOfMaps = [['a': 11, 'b': 12], ['a': 21, 'b': 22]]
assert listOfMaps.a == [11, 21] // GPath 语法
assert listOfMaps*.a == [11, 21] // 延伸点语法

listOfMaps = [['a': 11, 'b': 12], ['a': 21, 'b': 22], null]
assert listOfMaps*.a == [11, 21, null] // 可以很好地应对 null 值
assert listOfMaps*.a == listOfMaps.collect { it?.a } // 判等语法
// 但这时候只会收集非 null 值
assert listOfMaps.a == [11,21]
</pre>

#### 2.4.2 延伸运算符

<!-- The spread operator can be used to "inline" a collection into another. It is syntactic sugar which often avoids calls to putAll and facilitates the realization of one-liners: -->
延伸运算符可用于将一个集合“内联”到另一个集合之中。这个语法糖主要为了使我们不需要调用 `putAll` 方法并能写出更简短的代码：

<pre class="brush: groovy">
assert [ 'z': 900,
         *: ['a': 100, 'b': 200], 'a': 300] == ['a': 300, 'b': 200, 'z': 900]
// 用于映射定义的延伸映射语法
assert [*: [3: 3, *: [5: 5]], 7: 7] == [3: 3, 5: 5, 7: 7]

def f = { [1: 'u', 2: 'v', 3: 'w'] }
assert [*: f(), 10: 'zz'] == [1: 'u', 10: 'zz', 2: 'v', 3: 'w']
// 用于方法实参的延伸映射语法
f = { map -> map.c }
assert f(*: ['a': 10, 'b': 20, 'c': 30], 'e': 50) == 30

f = { m, i, j, k -> [m, i, j, k] }
// 使用延伸映射语法给定方法的具名参数和不具名参数
assert f('e': 100, *[4, 5], *: ['a': 10, 'b': 20, 'c': 30], 6) ==
        [["e": 100, "b": 20, "c": 30, "a": 10], 4, 5, 6]
</pre>

#### 2.4.3 `*.` 运算符

<!-- The "star-dot" operator is a shortcut operator allowing you to call a method or a property on all elements of a collection: -->
星点运算符可用于调用集合中所有元素的某个方法或属性：

<pre class="brush: groovy">
assert [1, 3, 5] == ['a', 'few', 'words']*.size()

class Person {
    String name
    int age
}
def persons = [new Person(name:'Hugo', age:17), new Person(name:'Sandra',age:19)]
assert [17, 19] == persons*.age
</pre>

#### 2.4.4 使用下标运算符进行分割

<!-- You can index into lists, arrays, maps using the subscript expression. It is interesting that strings are considered as special kinds of collections in that context: -->
你可以使用下标运算符根据索引值来访问列表、元素和映射的元素。有趣的是在这种情况下，字符串也会被视作特殊的集合：

<pre class="brush: groovy">
def text = 'nice cheese gromit!'
def x = text[2]

assert x == 'c'
assert x.class == String

def sub = text[5..10]
assert sub == 'cheese'

def list = [10, 11, 12, 13]
def answer = list[2,3]
assert answer == [12,13]
</pre>

值得注意的是你可以使用区间来获取集合中的一小部分：

<pre class="brush: groovy">
list = 100..200
sub = list[1, 3, 20..25, 33]
assert sub == [101, 103, 120, 121, 122, 123, 124, 125, 133]
</pre>

对于那些可变的集合，下标运算符可用于更新集合的值：

<pre class="brush: groovy">
list = ['a','x','x','d']
list[1..2] = ['b','c']
assert list == ['a','b','c','d']
</pre>

除此之外，你还可以使用负索引值来更好地从集合末尾开始提取元素：

<pre class="brush: groovy">
text = "nice cheese gromit!"
x = text[-1]
assert x == "!"

def name = text[-7..-2]
assert name == "gromit"
</pre>

最后，如果你使用的是一个反向区间（起始值大于终止值），那么所得的结果也是反向的：

<pre class="brush: groovy">
text = "nice cheese gromit!"
name = text[3..1]
assert name == "eci"
</pre>

### 2.5 新添加的集合方法

<!-- In addition to lists, maps or ranges, Groovy offers a lot of additional methods for filtering, collecting, grouping, counting, …​ which are directly available on either collections or more easily iterables. -->
除了[列表](http://www.groovy-lang.org/groovy-dev-kit.html#Collections-Lists)、[映射](http://www.groovy-lang.org/groovy-dev-kit.html#Collections-Maps)和[区间](http://www.groovy-lang.org/groovy-dev-kit.html#Collections-Ranges)以外，Groovy 还为其他集合或更普通的 `Iterable` 类提供了更多的用于过滤、收集、分组、计数等方法。

<!-- In particular, we invite you to read the Groovy development kit API docs and specifically: -->
有关这方面的内容，我们希望你能仔细阅读 [GDK](http://www.groovy-lang.org/gdk.html) 的 API 文档。具体来说：

- 在[这里](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/lang/Iterable.html)可以找到 `Iterable` 的新方法
- 在[这里](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/util/Iterator.html)可以找到 `Iterator` 的新方法
- 在[这里](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/util/Collection.html)可以找到 `Collection` 的新方法
- 在[这里](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/util/List.html)可以找到 `List` 的新方法
- 在[这里](http://docs.groovy-lang.org/latest/html/groovy-jdk/java/util/Map.html)可以找到 `Map` 的新方法

## 3 其他好用的功能

### 3.1 ConfigSlurper

<!-- ConfigSlurper is a utility class for reading configuration files defined in the form of Groovy scripts. Like it is the case with Java *.properties files, ConfigSlurper allows a dot notation. But in addition, it allows for Closure scoped configuration values and arbitrary object types. -->
`ConfigSlurper` 是可用于读取以 Groovy 脚本形式编写的配置文件的功能类。正如 Java 的 `*.properties` 文件那样，`ConfigSlurper` 也可以使用点号语法进行访问，除此之外它还能用闭包括号来给定配置值以及任意的对象类型：

<pre class="brush: groovy">
def config = new ConfigSlurper().parse('''
    app.date = new Date()  // 注1
    app.age  = 42
    app {                  // 注2
        name = "Test${42}"
    }
''')

assert config.app.date instanceof Date
assert config.app.age == 42
assert config.app.name == 'Test42'
</pre>

1. 使用点号语法
2. 使用闭包括号语法替代点号语法

<!-- As can be seen in the above example, the parse method can be used to retrieve groovy.util.ConfigObject instances. The ConfigObject is a specialized java.util.Map implementation that either returns the configured value or a new ConfigObject instance but never null. -->
正如我们在上一个例子中所见到的那样，`parse` 方法可用于获取一个 `groovy.util.ConfigObject` 实例。`ConfigObject` 是一种特殊的 `java.util.Map` 实现类，它要么返回具体的配置值要么返回一个新的 `ConfigObject`，但绝不会返回 `null`。

<pre class="brush: groovy">
def config = new ConfigSlurper().parse('''
    app.date = new Date()
    app.age  = 42
    app.name = "Test${42}"
''')

assert config.test != null   // 注1
</pre>

1. 	我们并未给出 `config.test`，但在被调用时仍然返回了一个 `ConfigObject`

<!-- In the case of a dot being part of a configuration variable name, it can be escaped by using single or double quotes. -->
如果点号本身需要作为配置变量的名称的话，可以使用单引号或双引号对其进行转义：

<pre class="brush: groovy">
def config = new ConfigSlurper().parse('''
    app."person.age"  = 42
''')

assert config.app."person.age" == 42
</pre>

<!-- In addition, ConfigSlurper comes with support for environments. The environments method can be used to hand over a Closure instance that itself may consist of a several sections. Let’s say we wanted to create a particular configuration value for the development environment. When creating the ConfigSlurper instance we can use the ConfigSlurper(String) constructor to specify the target environment. -->
除此之外，`ConfigSlurper` 还支持不同的环境。`environments` 方法可被用于处理一个包含若干个配置小节的 `Closure` 实例。假设我们想要为开发环境创建一些特别的配置值。那么在创建 `ConfigSlurper` 实例时我们可以使用 `ConfigSlurper(String)` 构造器来给定目标环境：

<pre class="brush: groovy">
def config = new ConfigSlurper('development').parse('''
  environments {
       development {
           app.port = 8080
       }

       test {
           app.port = 8082
       }

       production {
           app.port = 80
       }
  }
''')

assert config.app.port == 8080
</pre>

<!-- The ConfigSlurper environments aren’t restricted to any particular environment names. It solely depends on the ConfigSlurper client code what value are supported and interpreted accordingly. -->
`ConfigSlurper` 支持的环境并不只局限于几个具体的环境名，它取决于 `ConfigSlurper` 的客户端代码支持的环境并能基于此进行解析。

<!-- The environments method is built-in but the registerConditionalBlock method can be used to register other method names in addition to the environments name. -->
`environments` 方法本身是内置的，但你同样可以通过 `registerConditionalBlock` 来注册除了 `environments` 以外的方法名：

<pre class="brush: groovy">
def slurper = new ConfigSlurper()
slurper.registerConditionalBlock('myProject', 'developers')   // 注1

def config = slurper.parse('''
  sendMail = true

  myProject {
       developers {
           sendMail = false
       }
  }
''')

assert !config.sendMail
</pre>

1. 在注册了新的代码块以后，`ConfigSlurper` 就能进行解析了

<!-- For Java integration purposes the toProperties method can be used to convert the ConfigObject to a java.util.Properties object that might be stored to a *.properties text file. Be aware though that the configuration values are converted to String instances during adding them to the newly created Properties instance. -->
在与 Java 进行整合时，我们可以使用 `toProperties` 方法将 `ConfigObject` 转换成一个 `java.util.Properties`，然后再将其存储至一个 `*.properties` 文本文件中。但要注意的是在转换成新的 `Properties` 实例的时候所有配置值都会被转换为 `String` 实例。

<pre class="brush: groovy">
def config = new ConfigSlurper().parse('''
    app.date = new Date()
    app.age  = 42
    app {
        name = "Test${42}"
    }
''')

def properties = config.toProperties()

assert properties."app.date" instanceof String
assert properties."app.age" == '42'
assert properties."app.name" == 'Test42'
</pre>

### 3.2 Expando

<!-- The Expando class can be used to create a dynamically expandable object. Despite its name it does not use the ExpandoMetaClass underneath. Each Expando object represents a standalone, dynamically-crafted instance that can be extended with properties (or methods) at runtime. -->
`Expando` 类可用于创建一个可动态扩展的对象。尽管它的名字看起来很像，但实际上它并没有利用 `ExpandoMetaClass` 来实现。每个 `Expando` 对象都代表一个独立的、可动态构造的实例，这些实例可在运行时用属性或方法进行扩展。

<pre class="brush: groovy">
def expando = new Expando()
expando.name = 'John'

assert expando.name == 'John'
</pre>

<!-- A special case occurs when a dynamic property registers a Closure code block. Once being registered it can be invoked as it would be done with a method call. -->
当将一个闭包代码块注册为动态属性时则比较特殊：在完成注册后可以像调用方法那样对其进行调用：

<pre class="brush: groovy">
def expando = new Expando()
expando.toString = { -> 'John' }
expando.say = { String s -> "John says: ${s}" }

assert expando as String == 'John'
assert expando.say('Hi') == 'John says: Hi'
</pre>

### 3.3 可观察的列表、映射和集

<!-- Groovy comes with observable lists, maps and sets. Each of these collections trigger java.beans.PropertyChangeEvent events when elements are added, removed or changed. Note that a PropertyChangeEvent is not only signalling that a certain event has occurred, moreover, it holds information on the property name and the old/new value a certain property has been changed to. -->
Groovy 还提供了可观察的列表、映射和集。这些集合在添加、移除或修改元素时都会触发 `java.beans.PropertyChangeEvent` 事件。值得注意的是一个 `PropertiChangeEvent` 并不只用于告诉监听器发生了特定的事件，它还包含了包括属性名以及属性修改前后的值等内容。

<!-- Depending on the type of change that has happened, observable collections might fire more specialized PropertyChangeEvent types. For example, adding an element to an observable list fires an ObservableList.ElementAddedEvent event. -->
根据所发生的修改的类型，可观察的集合甚至可以一次触发多个不同类型的 `PropertyChangeEvent` 事件。例如，向一个可观察的列表中添加一个元素会触发 `ObservableList.ElementAddedEvent` 事件：

<pre class="brush: groovy">
def event                                       // 注1
def listener = {
    if (it instanceof ObservableList.ElementEvent)  {  // 注2
        event = it
    }
} as PropertyChangeListener


def observable = [1, 2, 3] as ObservableList    // 注3
observable.addPropertyChangeListener(listener)  // 注4

observable.add 42                               // 注5

assert event instanceof ObservableList.ElementAddedEvent

def elementAddedEvent = event as ObservableList.ElementAddedEvent
assert elementAddedEvent.changeType == ObservableList.ChangeType.ADDED
assert elementAddedEvent.index == 3
assert elementAddedEvent.oldValue == null
assert elementAddedEvent.newValue == 42
</pre>

1. 声明一个 `PropertyChangeEventListener` 用于捕获触发的事件
2. `ObservableList.ElementEvent` 及其子类都会使该监听器起作用
3. 注册监听器
4. 用给定的列表创建一个 `ObservableList`
5. 触发一个 `ObservableList.ElementAddedEvent` 事件

<!-- Be aware that adding an element in fact causes two events to be triggered. The first is of type ObservableList.ElementAddedEvent, the second is a plain PropertyChangeEvent that informs listeners about the change of property size. -->
注意，添加元素实际上会触发两个事件。第一个事件即为 `ObservableList.ElementAddedEvent`，而第二个实为一个 `PropertyChangeEvent`，用于告诉监听器列表的大小属性发生了变化。

<!-- The ObservableList.ElementClearedEvent event type is another interesting one. Whenever multiple elements are removed, for example when calling clear(), it holds the elements being removed from the list. -->
`ObservableList.ElementClearedEvent` 则是另一种比较有意思的事件。当列表中的复数元素被移除，例如被调用了 `clear()` 方法时，它会包含所有被从列表中移除的元素：

<pre class="brush: groovy">
def event
def listener = {
    if (it instanceof ObservableList.ElementEvent)  {
        event = it
    }
} as PropertyChangeListener


def observable = [1, 2, 3] as ObservableList
observable.addPropertyChangeListener(listener)

observable.clear()

assert event instanceof ObservableList.ElementClearedEvent

def elementClearedEvent = event as ObservableList.ElementClearedEvent
assert elementClearedEvent.values == [1, 2, 3]
assert observable.size() == 0
</pre>

<!-- To get an overview of all the supported event types the reader is encouraged to have a look at the JavaDoc documentation or the source code of the observable collection in use. -->
为更好地了解所有支持的事件类型，读者可以参考所使用的可观察集合的 JavaDoc 文档或源代码。

<!-- ObservableMap and ObservableSet come with the same concepts as we have seen for ObservableList in this section. -->
`ObservableMap` 和 `ObservableSet` 同样包含了在这节中我们所看到的 `ObservableList` 所包含的功能。
