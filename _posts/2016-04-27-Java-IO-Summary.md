---
layout: post_original
title: Java IO 总结
author: Robert Peng
category: Java
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

本博文为 Java IO 框架的总结，大部分内容将集中在 `java.io` 内的类。本文只用于作为我个人的知识索引。Java IO 的详细内容可参考 《Java 核心技术》卷 II 的第一章、
<code>java.io</code> 的 <a href="http://docs.oracle.com/javase/8/docs/api/java/io/package-summary.html">JavaDoc</a> 或
Java 的<a href="http://docs.oracle.com/javase/tutorial/essential/io/streams.html">官方教程</a>。

## 总览

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
  	<td>
      <code><a href="#InputStream">InputStream</a></code>、<br>
      <code><a href="#OutputStream">OutputStream</a></code>
    </td>
  	<td>所有字节流类（byte stream）的公有抽象类，定义了 <code>read</code> 和 <code>write</code> 方法，分别用于进行 8 位字节的读操作和写操作。</td>
  </tr>
  <tr>
  	<td>
      <code><a href="#FileInputStream">FileInputStream</a></code>、<br>
      <code><a href="#FileOutputStream">FileOutputStream</a></code>
    </td>
  	<td>使用指定的 <code>File</code>、<code>FileDescriptor</code> 或文件名 <code>String</code> 来构建，可对指定文件进行 8 位字节读写。</td>
  </tr>
  <tr>
  	<td>
      <code><a href="#PipedInputStream">PipedInputStream</a></code>、<br>
      <code><a href="#PipedOutputStream">PipedOutputStream</a></code>
    </td>
  	<td>
  		可直接使用对应的 <code>PipedOutputStream</code> 和 <code>PipedInputStream</code> 进行构造并连接，也可在分别构建后再相互连接。
  		相互连接后的 <code>PipedOutputStream</code> 和 <code>PipedInputStream</code> 实现了管道的功能，从 <code>PipedOutputStream</code> 写入的数据能从 <code>PipedInputStream</code> 读出。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/ByteArrayInputStream.html">ByteArrayInputStream</a></code>、<br />
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/ByteArrayOutputStream.html">ByteArrayOutputStream</a></code>
    </td>
  	<td>
  		<code>ByteArrayInputStream</code> 用于从构建时指定的 <code>byte[]</code> 中读取 <code>byte</code> 数据，
  		可被视为将指定的 <code>byte[]</code> 转换为 <code>InputStream</code>。
  		<code>ByteArrayOutputStream</code>用于将数据写入到一个 <code>byte</code> 数组，可被视作一个动态的 <code>byte</code> 数组。
  		可通过其提供的 <code>toByteArray()</code> 方法将写入的数据转换为一个 <code>byte[]</code> 实例，
  		或通过 <code>toString(String charsetName)</code> 将写入的字节数据按照给定的字符集解析为字符串。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/ObjectInputStream.html">ObjectInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/ObjectOutputStream.html">ObjectOutputStream</a></code>
    </td>
  	<td>
  		用于为实现了 <code>Serializable</code> 的类提供序列化的支持。在构建时指定使用的 <code>InputStream</code>/<code>OutputStream</code>，
  		序列化的类将从指定的流中读入/写出。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/SequenceInputStream.html">SequenceInputStream</a></code></td>
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
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FilterInputStream.html">FilterInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FilterInputStream.html">FilterOutputStream</a></code>
    </td>
  	<td>
  	  其子类均需通过指定的 <code>InputStream</code>/<code>OutputStream</code> 进行构建，对给定的输入输出流进行封装。
  	  对 <code>FilterInputStream</code>、 <code>FilterOutputStream</code> 的 <code>read</code>、<code>write</code> 方法的调用默认委托给被封装的输入输出流，
  	  子类通过重载这两个方法来在被封装输入输出流的基础上提供额外的功能。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/BufferedInputStream.html">BufferedInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/BufferedOutputStream.html">BufferedOutputStream</a></code>
    </td>
  	<td>
  	  在底层 <code>InputStream</code>/<code>OutputStream</code> 基础上提供缓冲功能，以减少对底层 <code>InputStream</code>/<code>OutputStream</code> 的
  	  <code>read</code>/<code>write</code> 方法的请求。
  	</td> 
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/CheckedInputStream.html">CheckedInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/CheckedOutputStream.html">CheckedOutputStream</a></code>
    </td>
  	<td>
  	  在构建时除底层的 <code>InputStream</code>/<code>OutputStream</code> 外还需提供一个 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/Checksum.html">Checksum</a></code> 对象。读入/写出时，<code>CheckedInputStream</code>/<code>CheckedOutputStream</code> 将利用给定的 <code>Checksum</code> 对数据进行校验和检验。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/javax/crypto/CipherInputStream.html">CipherInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/javax/crypto/CipherOutputStream.html">CipherOutputStream</a></code>
    </td>
  	<td>
  	  在构建时除底层的 <code>InputStream</code>/<code>OutputStream</code> 外还需提供一个 <code><a href="http://docs.oracle.com/javase/8/docs/api/javax/crypto/Cipher.html">Cipher</a></code> 对象。读入/写出时，<code>CheckedInputStream</code>/<code>CheckedOutputStream</code> 将利用给定的 <code>Cipher</code> 对数据进行转换，再进行读入/写出。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/security/DigestInputStream.html">DigestInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/security/DigestOutputStream.html">DigestOutputStream</a></code>
    </td>
  	<td>
  	  在构建时除底层的 <code>InputStream</code>/<code>OutputStream</code> 外还需提供一个 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/security/MessageDigest.html">MessageDigest</a></code> 对象。读入/写出时，读入/写出的数据会同时被用来调用 <code>MessageDigest</code> 的
  	  <code><a href="http://docs.oracle.com/javase/8/docs/api/java/security/MessageDigest.html#update-byte-">update</a></code> 方法。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/DataInputStream.html">DataInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/DataOutputStream.html">DataOutputStream</a></code>
    </td>
  	<td>
  	  为底层的 <code>InputStream</code>/<code>OutputStream</code> 提供读入/写出 Java 基础类型数据的功能。额外提供了如 <code>readInt</code>、<code>readDouble</code>、
  	  <code>readLine</code>、<code>writeInt</code>、<code>writeDouble</code> 等方法。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/DeflaterInputStream.html">DeflaterInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/InflaterOutputStream.html">InflaterOutputStream</a></code>
    </td>
  	<td>
  	  使用 <code>deflate</code> 压缩格式对数据进行压缩/解压处理。
  	  <code>InflaterOutputStream</code> 用于将压缩后的 <code>byte</code> 数据解压缩并写出到底层 <code>OutputStream</code>，
  	  <code>DeflaterInputStream</code> 则将底层 <code>InputStream</code> 读入的未压缩的数据压缩后并返回。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/InflaterInputStream.html">InflaterInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/DeflaterOutputStream.html">DeflaterOutputStream</a></code>
    </td>
  	<td>
  	  使用 <code>deflate</code> 算法对数据进行压缩/解压处理。
  	  <code>DeflaterOutputStream</code> 用于将未压缩的 <code>byte</code> 数据进行压缩并写出到底层 <code>OutputStream</code>，
  	  <code>InflaterInputStream</code> 则将底层 <code>InputStream</code> 读入的压缩后的数据解压缩并返回。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/GZIPInputStream.html">GZipInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/GZIPOutputStream.html">GZipOutputStream</a></code>
    </td>
  	<td>
  	  <code>InflaterInputStream</code>/<code>DeflaterOutputStream</code> 的子类，使用 <code>GZIP</code> 文件格式对数据进行解压缩压缩/解压处理。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipInputStream.html">ZipInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/zip/ZipOutputStream.html">ZipOutputStream</a></code>
    </td>
  	<td>
  	  <code>InflaterInputStream</code>/<code>DeflaterOutputStream</code> 的子类，使用 <code>ZIP</code> 文件格式对数据进行解压缩压缩/解压处理。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/jar/JarInputStream.html">JarInputStream</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/util/jar/JarOutputStream.html">JarOutputStream</a></code>
    </td>
  	<td>
  	  <code>ZipInputStream</code>/<code>ZipOutputStream</code> 的子类，对 <code>JAR</code> 文件提供额外的读写支持。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PushbackInputStream.html">PushbackInputStream</a></code></td>
  	<td>
  	  在底层 <code>InputStream</code> 的基础上提供了推入给定 <code>byte</code> 数据的功能。
  	  通过调用额外提供的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PushbackInputStream.html#unread-byte:A-">unread</a></code>
  	  方法可将指定的 <code>byte</code> 数据放置到输入流的前端，之后的 <code>read</code> 调用会首先返回被推入的数据。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PrintStream.html">PrintStream</a></code></td>
  	<td>
  		<code>System.out</code> 的所属类，在底层的 <code>OutputStream</code> 的基础上提供了写出 <code>String</code> 对象的功能，
  		写出时将使用系统默认的字符编码将 <code>String</code> 转换成 <code>byte</code> 数据写出。
  		额外提供了 <code>print</code>、<code>printf</code>、<code>println</code> 等方法。
  	</td>
  </tr>
</table>

`FilterInputStream` 的直接子类还包括了已经 `@Deprecated` 的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/LineNumberInputStream.html">LineNumberInputStream</a></code> 以及来自 `javax.swing` 包的 <code><a href="http://docs.oracle.com/javase/8/docs/api/javax/swing/ProgressMonitorInputStream.html">ProgressMonitorInputStream</a></code>。

`InputStream`、`OutputStream` 及其子类均属于字节流类，输入输出以字节为单位。除了 `InputStream` 和 `OutputStream`，Java IO 还提供了 `Reader` 和 `Writer`
作为字符流类，以字符为单位进行输入输出。

<table class="table">
  <caption align="head"><code>Reader</code>、<code>Writer</code> 及其子类</caption>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/Reader.html">Reader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/Writer.html">Writer</a></code>
    </td>
  	<td>所有字符流类（character stream）的公有抽象类，定义了 <code>read</code> 和 <code>write</code> 方法，分别用于进行字符的读操作和写操作。</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/InputStreamReader.html">InputStreamReader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/OutputStreamWriter.html">OutputStreamReader</a></code>
    </td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类，构建时给定所使用的字符集，利用 <code>InputStream</code>/<code>OutputStream</code> 进行数据的写入和读出。
  	  主要用于将 <code>InputStream</code>/<code>OutputStream</code> 转换为 <code>Reader</code>/<code>Writer</code>。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/BufferedReader.html">BufferedReader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/BufferedWriter.html">BufferedWriter</a></code>
    </td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类，构建时需指定底层的 <code>Reader</code>/<code>Writer</code>，在其基础上提供缓冲功能。
  	  功能类似于 <code>BufferedInputStream</code> 和 <code>BufferedOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/CharArrayReader.html">CharArrayReader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/CharArrayWriter.html">CharArrayWriter</a></code>
    </td>
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
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PipedReader.html">PipedReader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PipedWriter.html">PipedWriter</a></code>
    </td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类。
  	  <code>PipedReader</code> 对象与 <code>PipedWriter</code> 对象相互连接，从 <code>PipedWriter</code> 对象写入的数据可从 <code>PipedReader</code> 读出。
  	  功能类似于 <code>PipedInputStream</code> 和 <code>PipedOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/StringReader.html">StringReader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/StringWriter.html">StringWriter</a></code>
    </td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类。
  	  <code>StringReader</code> 在构建时指定 <code>String</code> 对象，并从中读取数据。主要用于将 <code>String</code> 转换为 <code>Reader</code>。
  	  <code>StringWriter</code> 用于动态构建 <code>String</code> 对象，功能与 <code>StringBuilder</code> 类似。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FilterReader.html">FilterReader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FilterWriter.html">FilterWriter</a></code>
    </td>
  	<td>
  	  <code>Reader</code>/<code>Writer</code> 的直接子类，均为虚类。构建时给定底层的 <code>Reader</code>/<code>Writer</code>，子类可在其基础上提供额外的功能。
  	  功能类似于 <code>FilterInputStream</code>/<code>FilterOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FileReader.html">FileReader</a></code>、<br>
      <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FileWriter.html">FileWriter</a></code>
    </td>
  	<td>
  	  <code>InputStreamReader</code>/<code>OutputStreamWriter</code> 的直接子类。使用默认的字符编码和缓冲大小对文本文件进行读写操作。
  	  功能类似于 <code>FileInputStream</code> 和 <code>FileOutputStream</code>。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/LineNumberReader.html">LineNumberReader</a></code></td>
  	<td>
  	  <code>BufferedReader</code> 的直接子类，<code>LineNumberInputStream</code> 的替代品。
  	  可同时记录当前读入数据所处的行数，额外提供了 <code>setLineNumber(int)</code> 方法和
  	  <code>getLineNumber</code> 方法来设置和获取当前行数。
  	</td>
  </tr>
  <tr>
    <td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PushbackReader.html">PushbackReader</a></code></td>
    <td>
      <code>FilterReader</code> 的直接子类。功能类似于 <code>PushbackInputStream</code>。额外提供了 <code>unread</code> 方法推入指定的 <code>char[]</code> 数据，
      之后的 <code>read</code> 调用将首先返回推入的数据。
    </td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PrintWriter.html">PrintWriter</a></code></td>
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
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/lang/AutoCloseable.html">java.lang.AutoCloseable</a></code></td>
  	<td>
  	  定义了 <code>close()</code> 方法，用于关闭对应的类并释放相关的资源。实现了 <code>AutoCloseable</code> 的类都应该在使用完毕后调用其 <code>close()</code> 方法，
  	  否则将导致资源泄漏。可使用 <code>try-with</code> 语句来自动调用 <code>AutoCloseable</code> 实例的 <code>close()</code> 方法。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/lang/Appendable.html">java.lang.Appendable</a></code></td>
  	<td>
  	  定义了 <code>append(char)</code> 和 <code>append(CharSequence)</code> 方法，用于将给定的字符或字符串添加到 <code>Appendable</code> 对象的尾部。
	  实现类包括 <code>StringBuilder</code>、<code>CharBuffer</code>、<code>Writer</code> 等。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/lang/Readable.html">java.lang.Readable</a></code></td>
  	<td>
  	  定义了 <code>read(CharBuffer)</code> 方法，可将 <code>Readable</code> 对象的内容读入到给定的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/nio/CharBuffer.html">CharBuffer</a></code> 对象中。
  	  实现类包括 <code>Reader</code> 等。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/Closeable.html">java.io.Closeable</a></code></td>
  	<td>
  	  <code>AutoCloseable</code> 的子接口，未定义任何新的方法。实现类包括 <code>InputStream</code>、<code>OutputStream</code>、<code>Reader</code>、<code>Writer</code> 等。
  	</td>
  </tr>
  <tr>
  	<td><code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/Flushable.html">java.io.Flushable</a></code></td>
  	<td>
  	  定义了 <code>flush()</code> 方法，用于将输出流类的缓冲进行写出并清空。未实现缓冲功能的输出流类的 <code>flush()</code> 方法无任何效果。
  	  实现类包括 <code>OutputStream</code>、<code>Writer</code> 等。
  	</td>
  </tr>
</table>

<h2>类详解</h2>

<h3 id="InputStream">InputStream</h3>

<dl>
  <dt>修饰符</dt>
  <dd><code>public</code>、<code>abstract</code></dd>
  <dt>直接父类</dt>
  <dd><code>Object</code></dd>
  <dt>实现接口</dt>
  <dd><code>Closeable</code></dd>
</dl>

<code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/InputStream.html">InputStream</a></code>：字节输入流类的公有虚父类，
提供了 `read` 方法用于以字节为单位读入数据。其中，<code>read()</code> 方法为唯一的虚方法。

<table>
  <tr>
    <th><code>java.io.InputStream</code> —— JDK 1.0</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li>
          <code><b>abstract int</b> read() <b>throws</b> IOException</code><br>
          从输入流读入下一字节的数据并以 <code>int</code> 格式返回。返回值应在 $[0,255]$ 之间。<br>
          读取发生错误时抛出 <code>IOException</code>
        </li>
        <li>
          <code><b>int</b> read(<b>byte</b>[] b) <b>throws</b> IOException</code><br>
          <code><b>int</b> read(<b>byte</b>[] b, <b>int</b> off, <b>int</b> len) <b>throws</b> IOException</code><br>
          尝试从输入流读入数据并填满给定字节数组 <code>b</code> 的指定范围（由起始偏移 <code>off</code> 和范围长度 <code>len</code> 给出），
          并返回实际读入数据的长度。当无数据可读入时（<code>read()</code> 返回 <code>-1</code>）返回 <code>-1</code>。<br>
          读取发生错误时抛出 <code>IOException</code>；给定数组 <code>b</code> 为 <code>null</code> 时抛出 <code>NullPointerException</code>；
          <code>off</code> 和 <code>len</code> 指定的范围超出 <code>b</code> 的边界时抛出 <code>IndexOutOfBoundsException</code>。<br>
          默认实现将重复调用 <code>read()</code> 方法直至遇到输入流末尾或填满给定数组。
        </li>
        <li>
          <code><b>long</b> skip(<b>long</b> n) <b>throws</b> IOException</code><br>
          尝试跳过给定数量字节的数据，并返回实际跳过的数据长度。<br>
          若输入流不支持跳过数据或跳过时发生错误则抛出 <code>IOException</code>。<br>
          默认实现将重复调用 <code>read()</code> 方法直至遇到输入流末尾或已读入给定长度的数据。
        </li>
        <li>
          <code><b>int</b> available() <b>throws</b> IOException</code>
          估计输入流剩余可读取或跳过的数据的字节长度并返回。<br>
          发生错误时抛出 <code>IOException</code>。<br>
          默认实现永远返回 <code>0</code>。
        </li>
        <li>
          <code><b>boolean</b> markSupported()</code><br>
          返回该输入流是否支持 <code>mark(int)</code> 和 <code>reset()</code> 方法。<br>
          默认实现永远返回 <code>false</code>。
        </li>
        <li>
          <code><b>void</b> mark(<b>int</b> readLimit)</code><br>
          若输入流支持标记功能（<code>markSupported()</code> 返回 <code>true</code>），则标记当前输入流所处位置，
          并在下一次调用 <code>reset()</code> 时将输入流重置至该位置；若输入流不支持标记功能则不做任何事。
          给定的读取字节长度 <code>readLimit</code> 确定了标记后允许读入数据的字节长度。当标记后读取数据的长度超过了 <code>readLimit</code>，
          输入流可选择丢弃该标记。<br>
          默认实现不做任何事。
        </li>
        <li>
          <code><b>void</b> reset() <b>throws</b> IOException</code><br>
          将输入流的位置重置至上一次调用 <code>mark(int)</code> 方法标记的位置。<br>
          无法重置时抛出 <code>IOException</code>。可能的情况包括：输入流不支持标记功能（<code>markSupported()</code> 返回 <code>false</code>）；
          <code>mark(int)</code> 方法未曾被调用过；标记后读取的数据长度超过了标记时指定的 <code>readLimit</code> 导致标记已失效。<br>
          默认实现除抛出 <code>IOException</code> 外不做任何事。
        </li>
        <li>
          <code><b>void</b> close() <b>throws</b> IOException</code><br>
          关闭输入流并释放相关资源。<br>
          发生错误时抛出 <code>IOException</code>。<br>
          默认实现不做任何事。
        </li>
      </ul>
    </td>
  </tr>
</table>

<h3 id="OutputStream">OutputStream</h3>

<dl>
  <dt>修饰符</dt>
  <dd><code>public</code>、<code>abstract</code></dd>
  <dt>直接父类</dt>
  <dd><code>Object</code></dd>
  <dt>实现接口</dt>
  <dd><code>Closeable</code>、<code>Flushable</code></dd>
</dl>

<code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/OutputStream.html">OutputStream</a></code>：字节输出流类的公有虚父类，
提供了 `write` 方法用于以字节为单位写出数据。其中，<code>write(int)</code> 方法为唯一的虚方法。

<table>
  <tr>
    <th><code>java.io.OutputStream</code> —— JDK 1.0</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li>
          <code><b>abstract void</b> write(<b>int</b> n) <b>throws</b> IOException</code>
          写出给定的字节数据。给定的 <code>int</code> 变量会被强制转换为 <code>byte</code> 只保留前 8 位）再写出。<br>
          写出发生错误时抛出 <code>IOException</code>。
        </li>
        <li>
          <code><b>void</b> write(<b>byte</b>[] b) <b>throws</b> IOException</code><br>
          <code><b>void</b> write(<b>byte</b>[] b, <b>int</b> off, <b>int</b> len) <b>throws</b> IOException</code><br>
          写出给定字符数组 <code>b</code> 中给定范围（由起始偏移 <code>off</code> 和范围长度 <code>len</code> 给出）的字节数据。<br>
          写出发生错误时抛出 <code>IOException</code>；给定数组 <code>b</code> 为 <code>null</code> 时抛出 <code>NullPointerException</code>；
          <code>off</code> 与 <code>len</code> 指定的范围超出 <code>b</code> 边界时抛出 <code>IndexOutOfBoundsException</code>。<br>
          默认实现将重复调用 <code>write(int)</code> 方法直至写出所有数据。
        </li>
        <li>
          <code><b>void</b> flush() <b>throws</b> IOException</code><br>
          清空并写出输出流缓冲区中的数据。若输出流不支持缓冲功能则可以不做任何事。<br>
          发生错误时抛出 <code>IOException</code>。<br>
          默认实现不做任何事。
        </li>
        <li>
          <code><b>void</b> close() <b>throws</b> IOException</code><br>
          关闭输出流并释放相关资源。<br>
          发生错误时抛出 <code>IOException</code>。<br>
          默认实现不做任何事。
        </li>
      </ul>
    </td>
  </tr>
</table>

<h3 id="FileInputStream">FileInputStream</h3>

<dl>
  <dt>修饰符</dt>
  <dd><code>public</code></dd>
  <dt>直接父类</dt>
  <dd><code>InputStream</code></dd>
  <dt>实现接口</dt>
  <dd><code>Closeable</code></dd>
</dl>

<code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FileInputStream.html">FileInputStream</a></code>：用于读入文件内容的 <code>InputStream</code>，
以字节为单位读取指定文件的内容。通常用于直接读入如图片等文件的二进制数据。<code>FileInputStream</code> 不支持标记功能，
<code>available()</code> 方法已可正确估计剩余数据的字节长度。

<table>
  <tr>
    <th><code>java.io.FileInputStream</code> —— JDK 1.0</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li>
          <code>FileInputStream(String name) <b>throws</b> FileNotFoundException</code><br>
          <code>FileInputStream(File file) <b>throws</b> FileNotFoundException</code><br>
          <code>FileInputStream(FileDescriptor fdObj)</code><br>
          根据给定的指示读取文件的参数构建 <code>FileInputStream</code>。<br>
          当无法打开指定文件时抛出 <code>FileNotFoundException</code>；
          当存在一个 <code>SecurityManager</code> 且其禁止程序访问该文件时抛出 <code>SecurityException</code>；
          当给定参数为 <code>null</code> 时抛出 <code>NullPointerException</code>。
        </li>
        <li>
          <code>FileChannel getChannel()</code><br>
          返回该 <code>FileInputStream</code> 的唯一 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/nio/channels/FileChannel.html">FileChannel</a></code>。
        </li>
        <li>
          <code><b>final</b> FileDescriptor getFD() <b>throws</b> IOException</code><br>
          返回代表该 <code>FileInputStream</code> 所使用的与文件系统中的实际文件的连接的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FileDescriptor.html">FileDescriptor</a></code>。
        </li>
      </ul>
    </td>
  </tr>
</table>

<h3 id="FileOutputStream">FileOutputStream</h3>

<dl>
  <dt>修饰符</dt>
  <dd><code>public</code></dd>
  <dt>直接父类</dt>
  <dd><code>OutputStream</code></dd>
  <dt>实现接口</dt>
  <dd><code>Closeable</code>、<code>Flushable</code></dd>
</dl>

<code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FileOutputStream.html">FileOutputStream</a></code>：用于写出内容到文件的 <code>OutputStream</code>，
以字节为单位将数据写出到指定的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/File.html">File</a></code> 或 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FileDescriptor.html">FileDescriptor</a></code>。<code>FileOutputStream</code> 不支持缓冲功能。

<table>
  <tr>
    <th><code>java.io.FileOutputStream</code> —— JDK 1.0</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li>
          <code>FileOutputStream(String name) <b>throws</b> FileNotFoundException</code><br>
          <code>FileOutputStream(String name, <b>boolean</b> append) <b>throws</b> FileNotFoundException</code><br>
          <code>FileOutputStream(File file) <b>throws</b> FileNotFoundException</code><br>
          <code>FileOutputStream(File file, <b>boolean</b> append) <b>throws</b> FileNotFoundException</code><br>
          <code>FileOutputStream(FileDescriptor fbObj) <b>throws</b> FileNotFoundException</code><br>
          使用指定的参数构建 <code>FileOutputStream</code>。布尔变量 <code>append</code> 用于指示新写入的数据是写入到原有数据的尾部还是直接覆盖原有的数据。
          变量 <code>append</code> 的值默认为 <code>false</code>。<br>
          当无法打开至指定文件的 <code>FileOutputStream</code> 时抛出 <code>FileNotFoundException</code>；
          当存在一个 <code>SecurityManager</code> 且其禁止程序访问该文件时抛出 <code>SecurityException</code>；
          当给定参数为 <code>null</code> 时抛出 <code>NullPointerException</code>。
        </li>
        <li>
          <code>FileChannel getChannel()</code><br>
          返回该 <code>FileOutputStream</code> 的唯一 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/nio/channels/FileChannel.html">FileChannel</a></code>。
        </li>
        <li>
          <code><b>final</b> FileDescriptor getFD() <b>throws</b> IOException</code><br>
          返回代表该 <code>FileOutputStream</code> 所使用的与文件系统中的实际文件的连接的 <code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/FileDescriptor.html">FileDescriptor</a></code>。
        </li>
      </ul>
    </td>
  </tr>
</table>

<h3 id="PipedInputStream">PipedInputStream</h3>

<code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PipedInputStream.html">PipedInputStream</a></code>：可被连接至一个 <code>PipedOutputStream</code>。
相互连接后，从 <code>PipedOutputStream</code> 写出的数据能从对应的 <code>PipedInputStream</code> 读入。<code>PipedInputStream</code> 和 <code>PipedOutputStream</code> 可被用于实现线程间通信。<code>PipedInputStream</code> 和 <code>PipedOutputStream</code> 任何一方的 <code>close()</code> 方法被调用后，相互连接的两个实体都将不再可用。<code>PipedInputStream</code> 不支持标记功能。

<table>
  <tr>
    <th><code>java.io.PipedInputStream</code> —— JDK 1.0</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li>
          <code>PipedInputStream()</code><br>
          <code>PipedInputStream(int pipeSize)</code><br>
          创建一个尚未连接的 <code>PipedInputStream</code> 并以给定的参数作为数据缓冲区大小（单位为字节）。缓冲区大小默认为 1024 字节。
        </li>
        <li>
          <code>PipedInputStream(PipedOutputStream src) <b>throws</b> IOException</code><br>
          <code>PipedInputStream(PipedOutputStream src, int pipeSize) <b>throws</b> IOException</code><br>
          创建一个连接至给定 <code>PipedOutputStream</code> 的 <code>PipedInputStream</code> 并以给定的参数作为数据缓冲区大小（单位为字节）。
          缓冲区大小默认为 1024 字节。<br>
          连接发生错误时抛出 <code>IOException</code>。
        </li>
        <li>
          <code><b>void</b> connect(PipedOutputStream src) <b>throws</b> IOException</code><br>
          将该 <code>PipedInputStream</code> 连接至给定的 <code>PipedOutputStream</code>。<br>
          若该 <code>PipedInputStream</code> 已连接至其他 <code>PipedOutputStream</code>
          或给定 <code>PipedOutputStream</code> 已连接至其他 <code>PipedInputStream</code> 则抛出 <code>IOException</code>。
        </li>
      </ul>
    </td>
  </tr>
</table>

<h3 id="PipedOutputStream">PipedOutputStream</h3>

<code><a href="http://docs.oracle.com/javase/8/docs/api/java/io/PipedOutputStream.html">PipedOutputStream</a></code>：可被连接至一个 <code>PipedInputStream</code>。
相互连接后，从 <code>PipedOutputStream</code> 写出的数据能从对应的 <code>PipedInputStream</code> 读入。<code>PipedInputStream</code> 和 <code>PipedOutputStream</code> 可被用于实现线程间通信。<code>PipedInputStream</code> 和 <code>PipedOutputStream</code> 任何一方的 <code>close()</code> 方法被调用后，相互连接的两个实体都将不再可用。<code>PipedOutputStream</code> 的数据会直接写入到与之相连的 <code>PipedInputStream</code> 的缓冲区中，因此 <code>PipedOutputStream</code> 支持缓冲功能。

<table>
  <tr>
    <th><code>java.io.PipedOutputStream</code> —— JDK 1.0</th>
  </tr>
  <tr>
    <td>
      <ul>
        <li>
          <code>PipedOutputStream()</code><br>
          创建一个尚未连接的 <code>PipedOutputStream</code>。
        </li>
        <li>
          <code>PipedOutputStream(PipedInputStream snk) <b>throws</b> IOException</code><br>
          创建一个连接至指定 <code>PipedInputStream</code> 的 <code>PipedOutputStream</code>。<br>
          连接发生错误时抛出 <code>IOException</code>。
        </li>
        <li>
          <code><b>void</b> connect(PipedInputStream src) <b>throws</b> IOException</code><br>
          将该 <code>PipedOutputStream</code> 连接至给定的 <code>PipedInputStream</code>。<br>
          若该 <code>PipedOutputStream</code> 已连接至其他 <code>PipedInputStream</code>
          或给定 <code>PipedInputStream</code> 已连接至其他 <code>PipedOutputStream</code> 则抛出 <code>IOException</code>。
        </li>
        <li>
          <code><b>void</b> flush() <b>throws</b> IOException</code><br>
          调用与该 <code>PipedOutputStream</code> 连接的 <code>PipedInputStream</code> 的 <code>notifyAll()</code> 方法。
        </li>
      </ul>
    </td>
  </tr>
</table>
