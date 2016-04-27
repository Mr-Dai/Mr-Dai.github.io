---
layout: posts
title: Java IO 总结
author: Robert Peng
category: Java
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

本博文为 Java IO 框架的总结，大部分内容将集中在 `java.io` 内的类。本文只用于作为我个人的知识索引。Java IO 的详细内容可参考 《Java 核心技术》卷 II 的第一章、
<code>java.io</code> 的 <a href="http://docs.oracle.com/javase/8/docs/api/java/io/package-summary.html">JavaDoc</a> 或
Java 的<a href="http://docs.oracle.com/javase/tutorial/essential/io/streams.html">官方教程</a>。

Java IO 中的字节输入输出流对应的类均属于 `InputStream` 和 `OutputStream` 的直接或间接子类，
其中它们的间接子类多为其直接子类 `FilterInputStream` 和 `FilterOutputStream` 的直接子类。
下表总结了 `InputStream` 和 `OutputStream` 及其直接子类：

<table class="table">
  <caption align="head"><code>InputStream</code>、<code>OutputStream</code> 及其直接子类</caption>
  <tr>
    <th>类名</th>
    <th>描述</th>
  </tr>
  <tr>
  	<td><code>InputStream</code>、<br><code>OutputStream</code></td>
  	<td>所有字节流类（byte stream）的公有抽象类，定义了 <code>read</code> 和 <code>write</code> 方法，分别用于进行 8 位字节的读操作和写操作。</td>
  </tr>
  <tr>
  	<td><code>FileInputStream</code>、<br><code>FileOutputStream</code></td>
  	<td>使用指定的 <code>File</code>、<code>FileDescriptor</code> 或文件名 <code>String</code> 来构建，可对指定文件进行 8 位字节读写。</td>
  </tr>
  <tr>
  	<td><code>PipedInputStream</code>、<br><code>PipedOutputStream</code></td>
  	<td>
  		可直接使用对应的 <code>PipedOutputStream</code> 和 <code>PipedInputStream</code> 进行构造并连接，也可在分别构建后再相互连接。
  		相互连接后的 <code>PipedOutputStream</code> 和 <code>PipedInputStream</code> 实现了管道的功能，从 <code>PipedOutputStream</code> 写入的数据能从 <code>PipedInputStream</code> 读出。
  	</td>
  </tr>
  <tr>
  	<td><code>ByteArrayInputStream</code>、<br><code>ByteArrayOutputStream</code></td>
  	<td>
  		<code>ByteArrayInputStream</code> 用于从构建时指定的 <code>byte[]</code> 中读取 <code>byte</code> 数据，
  		可被视为将指定的 <code>byte[]</code> 转换为 <code>InputStream</code>。
  		<code>ByteArrayOutputStream</code>用于将数据写入到一个 <code>byte</code> 数组，可被视作一个动态的 <code>byte</code> 数组。
  		可通过其提供的 <code>toByteArray()</code> 方法将写入的数据转换为一个 <code>byte[]</code> 实例，
  		或通过 <code>toString(String charsetName)</code> 将写入的字节数据按照给定的字符集解析为字符串。
  	</td>
  </tr>
  <tr>
  	<td><code>ObjectInputStream</code>、<br><code>ObjectOutputStream</code></td>
  	<td>
  		用于为实现了 <code>Serializable</code> 的类提供序列化的支持。在构建时指定使用的 <code>InputStream</code>/<code>OutputStream</code>，
  		序列化的类将从指定的流中读入/写出。
  	</td>
  </tr>
  <tr>
  	<td><code>SequenceInputStream</code></td>
  	<td>
  		在构建时可指定两个 <code>InputStream</code> 或一个 <code>InputStream</code> 的 <code>Enumeration</code>（<code>Iterator</code> 的父接口）。
  		<code>SequenceInputStream</code> 将给定的 <code>InputStream</code> 们首尾相连组合成一个 <code>InputStream</code>，并依次从中读取数据。
  	</td>
  </tr>
</table>

除此之外，`InputStream` 的直接子类还包括一个已经 `@Deprecated` 的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/StringBufferInputStream.html">StringBufferInputStream</a></code> 和来自 `javax.sound.sampled` 包的 <code><a href="http://docs.oracle.com/javase/8/docs/api/javax/sound/sampled/AudioInputStream.html">AudioInputStream</a></code>。

下表总结了 `FilterInputStream` 和 `FilterOutputStream` 及其子类：

<table class="table">
  <caption align="head"><code>FilterInputStream</code>、<code>FilterOutputStream</code> 及其子类</caption>
  <tr>
  	<th>类名</th>
  	<th>描述</th>
  </tr>
  <tr>
  	<td><code>FilterInputStream</code>、<br><code>FilterOutputStream</code></td>
  	<td>
  	  其子类均需通过指定的 <code>InputStream</code>/<code>OutputStream</code> 进行构建，对给定的输入输出流进行封装。
  	  对 <code>FilterInputStream</code>、 <code>FilterOutputStream</code> 的 <code>read</code>、<code>write</code> 方法的调用默认委托给被封装的输入输出流，
  	  子类通过重载这两个方法来在被封装输入输出流的基础上提供额外的功能。
  	</td>
  </tr>
  <tr>
  	<td><code>BufferedInputStream</code>、<br><code>BufferedOutputStream</code></td>
  	<td>
  	  在底层 <code>InputStream</code>/<code>OutputStream</code> 基础上提供缓冲功能，以减少对底层 <code>InputStream</code>/<code>OutputStream</code> 的
  	  <code>read</code>/<code>write</code> 方法的请求。
  	</td> 
  </tr>
  <tr>
  	<td><code>CheckedInputStream</code>、<br><code>CheckedOutputStream</code></td>
  	<td>
  	  在构建时除底层的 <code>InputStream</code>/<code>OutputStream</code> 外还需提供一个 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/Checksum.html">Checksum</a></code> 对象。读入/写出时，<code>CheckedInputStream</code>/<code>CheckedOutputStream</code> 将利用给定的 <code>Checksum</code> 对数据进行校验和检验。
  	</td>
  </tr>
  <tr>
  	<td><code>CipherInputStream</code>、<br><code>CipherOutputStream</code></td>
  	<td>
  	  在构建时除底层的 <code>InputStream</code>/<code>OutputStream</code> 外还需提供一个 <code><a href="http://docs.oracle.com/javase/8/docs/api/javax/crypto/Cipher.html">Cipher</a></code> 对象。读入/写出时，<code>CheckedInputStream</code>/<code>CheckedOutputStream</code> 将利用给定的 <code>Cipher</code> 对数据进行转换，再进行读入/写出。
  	</td>
  </tr>
  <tr>
  	<td><code>DigestInputStream</code>、<br><code>DigestOutputStream</code></td>
  	<td>
  	  在构建时除底层的 <code>InputStream</code>/<code>OutputStream</code> 外还需提供一个 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/security/MessageDigest.html">MessageDigest</a></code> 对象。读入/写出时，读入/写出的数据会同时被用来调用 <code>MessageDigest</code> 的
  	  <code><a href="http://docs.oracle.com/javase/8/docs/api/java/security/MessageDigest.html#update-byte-">update</a></code> 方法。
  	</td>
  </tr>
  <tr>
  	<td><code>DataInputStream</code>、<br><code>DataOutputStream</code></td>
  	<td>
  	  为底层的 <code>InputStream</code>/<code>OutputStream</code> 提供读入/写出 Java 基础类型数据的功能。额外提供了如 <code>readInt</code>、<code>readDouble</code>、
  	  <code>readLine</code>、<code>writeInt</code>、<code>writeDouble</code> 等方法。
  	</td>
  </tr>
  <tr>
  	<td><code>DeflaterInputStream</code>、<br><code>InflaterOutputStream</code></td>
  	<td>
  	  使用 <code>deflate</code> 压缩格式对数据进行压缩/解压处理。
  	  <code>InflaterOutputStream</code> 用于将压缩后的 <code>byte</code> 数据解压缩并写出到底层 <code>OutputStream</code>，
  	  <code>DeflaterInputStream</code> 则将底层 <code>InputStream</code> 读入的未压缩的数据压缩后并返回。
  	</td>
  </tr>
  <tr>
  	<td><code>InflaterInputStream</code>、<br><code>DeflaterOutputStream</code></td>
  	<td>
  	  使用 <code>deflate</code> 算法对数据进行压缩/解压处理。
  	  <code>DeflaterOutputStream</code> 用于将未压缩的 <code>byte</code> 数据进行压缩并写出到底层 <code>OutputStream</code>，
  	  <code>InflaterInputStream</code> 则将底层 <code>InputStream</code> 读入的压缩后的数据解压缩并返回。
  	</td>
  </tr>
  <tr>
  	<td><code>GZipInputStream</code>、<br><code>GZipOutputStream</code></td>
  	<td>
  	  <code>InflaterInputStream</code>/<code>DeflaterOutputStream</code> 的子类，使用 <code>GZIP</code> 文件格式对数据进行解压缩压缩/解压处理。
  	</td>
  </tr>
  <tr>
  	<td><code>ZipInputStream</code>、<br><code>ZipOutputStream</code></td>
  	<td>
  	  <code>InflaterInputStream</code>/<code>DeflaterOutputStream</code> 的子类，使用 <code>ZIP</code> 文件格式对数据进行解压缩压缩/解压处理。
  	</td>
  </tr>
  <tr>
  	<td><code>JarInputStream</code>、<br><code>JarOutputStream</code></td>
  	<td>
  	  <code>ZipInputStream</code>/<code>ZipOutputStream</code> 的子类，对 <code>JAR</code> 文件提供额外的读写支持。
  	</td>
  </tr>
  <tr>
  	<td><code>PushbackInputStream</code></td>
  	<td>
  	  在底层 <code>InputStream</code> 的基础上提供了推入给定 <code>byte</code> 数据的功能。
  	  通过调用额外提供的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PushbackInputStream.html#unread-byte:A-">unread</a></code>
  	  方法可将指定的 <code>byte</code> 数据放置到输入流的前端，之后的 <code>read</code> 调用会首先返回被推入的数据。
  	</td>
  </tr>
  <tr>
  	<td><code>PrintStream</code></td>
  	<td>
  		<code>System.out</code> 的所属类，在底层的 <code>OutputStream</code> 的基础上提供了写出 <code>String</code> 对象的功能，
  		写出时将使用系统默认的字符编码将 <code>String</code> 转换成 <code>byte</code> 数据写出。
  		额外提供了 <code>print</code>、<code>printf</code>、<code>println</code> 等方法。
  	</td>
  </tr>
</table>

<code>FilterInputStream</code> 的直接子类还包括了已经 `@Deprecated` 的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/LineNumberInputStream.html">LineNumberInputStream</a></code> 以及来自 `javax.swing` 包的 <code><a href="http://docs.oracle.com/javase/8/docs/api/javax/swing/ProgressMonitorInputStream.html">ProgressMonitorInputStream</a></code>。

`InputStream`、`OutputStream` 及其子类均属于字节流类，输入输出以字节为单位。除了 `InputStream` 和 `OutputStream`，Java IO 还提供了 `Reader` 和 `Writer`
作为字符流类，以字符为单位进行输入输出。

<table class="table">
  <caption align="head"><code>Reader</code>、<code>Writer</code> 及其子类</caption>
  <tr>
  	<td><code>Reader</code>、<br><code>Writer</code></td>
  	<td>所有字符流类（character stream）的公有抽象类，定义了 <code>read</code> 和 <code>write</code> 方法，分别用于进行字符的读操作和写操作。</td>
  </tr>
  <tr>
  	<td><code>InputStreamReader</code>、<br><code>OutputStreamReader</code></td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类，构建时给定所使用的字符集，利用 <code>InputStream</code>/<code>OutputStream</code> 进行数据的写入和读出。
  	  主要用于将 <code>InputStream</code>/<code>OutputStream</code> 转换为 <code>Reader</code>/<code>Writer</code>。
  	</td>
  </tr>
  <tr>
  	<td><code>BufferedReader</code>、<br><code>BufferedWriter</code></td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类，构建时需指定底层的 <code>Reader</code>/<code>Writer</code>，在其基础上提供缓冲功能。
  	  功能类似于 <code>BufferedInputStream</code> 和 <code>BufferedOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td><code>CharArrayReader</code>、<br><code>CharArrayWriter</code></td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类。
  	  <code>CharArrayReader</code> 将从构建时指定的 <code>char[]</code> 对象读入数据，主要用于将 <code>char[]</code> 转换为 <code>Reader</code> 实例。
  	  功能类似于 <code>ByteArrayInputStream</code>。<br>
  	  <code>CharArrayWriter</code> 用于将数据写入到 <code>char</code> 数组，可被视为一个动态的 <code>char</code> 数组。
  	  额外提供了 <code>append</code> 方法写入 <code>CharSequence</code> 对象，以及 <code>toCharArray</code> 方法和 <code>toString</code> 方法，
  	  分别用于以 <code>char[]</code> 和 <code>String</code> 格式返回写入的数据。功能类似于 <code>ByteArrayOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td><code>PipedReader</code>、<br><code>PipedWriter</code></td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类。
  	  <code>PipedReader</code> 对象与 <code>PipedWriter</code> 对象相互连接，从 <code>PipedWriter</code> 对象写入的数据可从 <code>PipedReader</code> 读出。
  	  功能类似于 <code>PipedInputStream</code> 和 <code>PipedOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td><code>StringReader</code>、<br><code>StringWriter</code></td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类。
  	  <code>StringReader</code> 在构建时指定 <code>String</code> 对象，并从中读取数据。主要用于将 <code>String</code> 转换为 <code>Reader</code>。
  	  <code>StringWriter</code> 用于动态构建 <code>String</code> 对象，功能与 <code>StringBuilder</code> 类似。
  	</td>
  </tr>
  <tr>
  	<td><code>FilterReader</code>、<br><code>FilterWriter</code></td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类，均为虚类。构建时给定底层的 <code>Reader</code>/<code>Writer</code>，子类可在其基础上提供额外的功能。
  	  功能类似于 <code>FilterInputStream</code>/<code>FilterOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td><code>FileReader</code>、<br><code>FileWriter</code></td>
  	<td>
  	  <code>InputStreamReader</code>/<code>OutputStreamWriter</code> 的直接子类。使用默认的字符编码和缓冲大小对文本文件进行读写操作。
  	  功能类似于 <code>FileInputStream</code> 和 <code>FileOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td><code>LineNumberReader</code></td>
  	<td>
  	  <code>BufferedReader</code> 的直接子类，<code>LineNumberInputStream</code> 的替代品。
  	  可同时记录当前读入数据所处的行数，额外提供了 <code>setLineNumber(int)</code> 方法和
  	  <code>getLineNumber</code> 方法来设置和获取当前行数。
  	</td>
  </tr>
  <tr>
    <td><code>PushbackReader</code></td>
    <td>
      <code>FilterReader</code> 的直接子类。功能类似于 <code>PushbackInputStream</code>。额外提供了 <code>unread</code> 方法推入指定的 <code>char[]</code> 数据，
      之后的 <code>read</code> 调用将首先返回推入的数据。
    </td>
  </tr>
  <tr>
  	<td><code>PrintWriter</code></td>
  	<td>
  	  <code>Writer</code> 的直接子类。<code>PrintStream</code> 的替代品，构建时指定写出的文件、<code>Writer</code> 或 <code>OutputStream</code>。
  	  额外提供了 <code>print</code>、<code>printf</code>、<code>println</code> 等方法。
  	</td>
  </tr>
</table>

除此之外，Java IO 包中多数输入输出流类实现了如下几个接口：

<table class="table">
  <caption align="head">Java IO 功能接口</caption>
  <tr>
  	<th>接口名</th>
  	<th>描述</th>
  </tr>
  <tr>
  	<td><code>java.lang.AutoCloseable</code></td>
  	<td>
  	  定义了 <code>close()</code> 方法，用于关闭对应的类并释放相关的资源。实现了 <code>AutoCloseable</code> 的类都应该在使用完毕后调用其 <code>close()</code> 方法，
  	  否则将导致资源泄漏。可使用 <code>try-with</code> 语句来自动调用 <code>AutoCloseable</code> 实例的 <code>close()</code> 方法。
  	</td>
  </tr>
  <tr>
  	<td><code>java.lang.Appendable</code></td>
  	<td>
  	  定义了 <code>append(char)</code> 和 <code>append(CharSequence)</code> 方法，用于将给定的字符或字符串添加到 <code>Appendable</code> 对象的尾部。
	  实现类包括 <code>StringBuilder</code>、<code>CharBuffer</code>、<code>Writer</code> 等。
  	</td>
  </tr>
  <tr>
  	<td><code>java.lang.Readable</code></td>
  	<td>
  	  定义了 <code>read(CharBuffer)</code> 方法，可将 <code>Readable</code> 对象的内容读入到给定的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/nio/CharBuffer.html">CharBuffer</a></code> 对象中。
  	  实现类包括 <code>Reader</code> 等。
  	</td>
  </tr>
  <tr>
  	<td><code>java.io.Closeable</code></td>
  	<td>
  	  <code>AutoCloseable</code> 的子接口，未定义任何新的方法。实现类包括 <code>InputStream</code>、<code>OutputStream</code>、<code>Reader</code>、<code>Writer</code> 等。
  	</td>
  </tr>
  <tr>
  	<td><code>java.io.Flushable</code></td>
  	<td>
  	  定义了 <code>flush()</code> 方法，用于将输出流类的缓冲进行写出并清空。未实现缓冲功能的输出流类的 <code>flush()</code> 方法无任何效果。
  	  实现类包括 <code>OutputStream</code>、<code>Writer</code> 等。
  	</td>
  </tr>
</table>
