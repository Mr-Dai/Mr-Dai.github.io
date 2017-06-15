---
layout: post_translated
title: Groovy 教程 - 与 Java 的差异
author: Robert Peng
category: Groovy
org_title: "Groovy Getting Started - Differences with Java"
org_url: "http://www.groovy-lang.org/differences.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushGroovy.js"></script>
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

<!-- Groovy tries to be as natural as possible for Java developers. We’ve tried to follow the principle of least surprise when designing Groovy, particularly for developers learning Groovy who’ve come from a Java background. -->
Groovy 语言在设计时便考虑到要尽可能让语言本身令 Java 程序员感到自然。如此，我们在设计 Groovy 时则尽可能让其少出现出人意料的地方，尤其是对于那些有着 Java 背景的开发者。

<!-- Here we list all the major differences between Java and Groovy. -->
在这篇文章中我们将列举几处 Java 和 Groovy 的显著差异。

## 1 默认引入

如下的这些包和类都会被默认引入 —— 也就是说，你不需要显式的 `import` 语句即可使用它们：

- `java.io.*`
- `java.lang.*`
- `java.math.BigDecimal`
- `java.math.BigInteger`
- `java.net.*`
- `java.util.*`
- `groovy.lang.*`
- `groovy.util.*`

## 2 多方法

<!-- In Groovy, the methods which will be invoked are chosen at runtime. This is called runtime dispatch or multi-methods. It means that the method will be chosen based on the types of the arguments at runtime. In Java, this is the opposite: methods are chosen at compile time, based on the declared types. -->
在 Groovy 中，方法会在运行时被选择并调用。这种机制被称为**运行时分发**（Runtime Dispatch）或**多方法**（Multi-methods）。这意味着具体被调用的方法会在运行时根据实参的类型被挑选。在 Java 中则是截然相反：具体被调用的方法会在编译期根据实参的声明类型被挑选。

<!-- The following code, written as Java code, can be compiled in both Java and Groovy, but it will behave differently: -->
如下 Java 代码可以同时在 Java 环境和 Groovy 环境中编译运行，但却会有不同的行为：

```java
int method(String arg) {
    return 1;
}
int method(Object arg) {
    return 2;
}
Object o = "Object";
int result = method(o);
```

在 Java 中，你会有：

```java
assertEquals(2, result);
```

而在 Groovy 中则会有：

```java
assertEquals(1, result);
```

<!-- That is because Java will use the static information type, which is that o is declared as an Object, whereas Groovy will choose at runtime, when the method is actually called. Since it is called with a String, then the String version is called. -->
这是因为 Java 会利用静态信息类型（变量 `o` 被声明为 `Object`）来挑选被调用的方法，而 Groovy 则会在方法被确实调用的运行时才进行选择。由于调用时所使用的实参是一个 `String`，那么 `String` 版本的方法就被调用了。

## 3 数组初始化语句

<!-- In Groovy, the { …​ } block is reserved for closures. That means that you cannot create array literals with this syntax: -->
在 Groovy 中，`{...}` 块被保留用作定义闭包。也就是说，你不能像如下语句这样来创建数组字面量：

```java
int[] array = { 1, 2, 3 };
```

你需要这样：

```groovy
int[] array = [1, 2, 3]
```

## 4 包可见性

在 Groovy 中，不给出任何修饰符并不会使得一个类的域像 Java 那样仅在该包内可见：

```groovy
class Person {
    String name
}
```

在 Groovy 中这样会创建出一个**属性**（Property），也就是一个 `private` 域和对应的 Getter 和 Setter 方法。

通过为域添加上 `@PackageScope` 注解即可将其声明为包内可见：

```groovy
class Person {
    @PackageScope String name
}
```

## 5 ARM 块

<!-- ARM (Automatic Resource Management) block from Java 7 are not supported in Groovy. Instead, Groovy provides various methods relying on closures, which have the same effect while being more idiomatic. For example: -->
Groovy 不支持 Java7 的自动资源管理（Automatic Resource Management, ARM）代码块，而是提供了各种不同的利用了闭包的方法，使得我们可以使用更简洁的写法来达成同样的效果。例如：

```java
Path file = Paths.get("/path/to/file");
Charset charset = Charset.forName("UTF-8");
try (BufferedReader reader = Files.newBufferedReader(file, charset)) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }

} catch (IOException e) {
    e.printStackTrace();
}
```

可被写作：

```groovy
new File('/path/to/file').eachLine('UTF-8') {
   println it
}
```

或者，如果你想让它看起来更像 Java 的话，也可以这样写：

```groovy
new File('/path/to/file').withReader('UTF-8') { reader ->
   reader.eachLine {
       println it
   }
}
```

## 6 内部类

<!-- The implementation of anonymous inner classes and nested classes follows the Java lead, but you should not take out the Java Language Spec and keep shaking the head about things that are different. The implementation done looks much like what we do for groovy.lang.Closure, with some benefits and some differences. Accessing private fields and methods for example can become a problem, but on the other hand local variables don’t have to be final. -->
Groovy 的匿名内部类和嵌套类在某种程度上以 Java 为指导，但你不需要再翻阅 Java 语言规范并苦想二者之间的差异。实际的实现实际上与 `groovy.lang.Closure` 很接近，只是还多了一点其他的不同，例如无法访问私有的域或方法，但局部变量则不需要被声明为 `final` 了。

### 6.1 静态内部类

如下为静态内部类的案例：

```groovy
class A {
    static class B {}
}

new A.B()
```

<!-- The usage of static inner classes is the best supported one. If you absolutely need an inner class, you should make it a static one. -->
实际上，Groovy 对静态内部类的支持是最好的，因此如果你确实需要一个内部类的话，你应该将其声明为静态的。

### 6.2 匿名内部类

```groovy
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

CountDownLatch called = new CountDownLatch(1)

Timer timer = new Timer()
timer.schedule(new TimerTask() {
    void run() {
        called.countDown()
    }
}, 0)

assert called.await(10, TimeUnit.SECONDS)
```

### 6.3 创建非静态内部类的实例

在 Java 中，你可以这样：

```java
public class Y {
    public class X {}
    public X foo() {
        return new X();
    }
    public static X createX(Y y) {
        return y.new X();
    }
}
```

Groovy 并不支持像 `y.new X()` 这样的语法。你应该像如下代码那样，写成 `new X(y)`：

```groovy
public class Y {
    public class X {}
    public X foo() {
        return new X()
    }
    public static X createX(Y y) {
        return new X(y)
    }
}
```

<!-- Caution though, Groovy supports calling methods with one parameter without giving an argument. The parameter will then have the value null. Basically the same rules apply to calling a constructor. There is a danger that you will write new X() instead of new X(this) for example. Since this might also be the regular way we have not yet found a good way to prevent this problem. -->
值得注意的是，Groovy 允许你在调用只有一个参数的方法时不给出任何实参。如此一来参数值会被设置为 `null`。对构造器的调用同样遵循此规则。因此你有可能会写成 `new X()` 而不是 `new X(this)`。由于这样做在某种情况下也有可能是合理的，因此我们还没有找出一个很好的办法来避免这样的问题。

## 7 Lambda 表达式

Java8 支持 Lambda 表达式和方法引用：

```java
Runnable run = () -> System.out.println("Run");
list.forEach(System.out::println);
```

Java8 的 Lambda 表达式在某种程度上可以被看作是匿名内部类。Groovy 不支持这样的语法，但支持闭包：

```groovy
Runnable run = { println 'run' }
list.each { println it } // or list.each(this.&println)
```

## 8 GString

<!-- As double-quoted string literals are interpreted as GString values, Groovy may fail with compile error or produce subtly different code if a class with String literal containing a dollar character is compiled with Groovy and Java compiler. -->
由于带双引号的字符串字面量会被解析为 `GString` 对象，如果一个类包含一个 `String` 字面量其中包含了美金符号，Groovy 可能会无法编译或是给出与 Java 编译器所给出的大相径庭的代码。

<!-- While typically, Groovy will auto-cast between GString and String if an API declares the type of a parameter, beware of Java APIs that accept an Object parameter and then check the actual type. -->
尽管 Groovy 能够根据 API 声明的参数类型来对 `GString`
对象和 `String` 对象家进行自动转换，你仍然需要注意那些将参数类型声明为 `Object` 但在方法体内对实参类型进行判断的 Java API。

## 9 `String` 和 `Character` 字面量

<!-- Singly-quoted literals in Groovy are used for String, and double-quoted result in String or GString, depending whether there is interpolation in the literal. -->
在 Groovy 中，带单引号的字符串字面量被用作 `String` 对象的创建，而带双引号的字符串字面量则会创建出 `GString` 或 `String` 对象，取决于字面两种是否包含插值占位符。

```groovy
assert 'c'.getClass()==String
assert "c".getClass()==String
assert "c${1}".getClass() in GString
```

<!-- Groovy will automatically cast a single-character String to char only when assigning to a variable of type char. When calling methods with arguments of type char we need to either cast explicitly or make sure the value has been cast in advance. -->
只有当赋值给一个类型为 `char` 的变量时，Groovy 才会自动地将一个只包含一个字符的 `String` 转换为 `char` 类型。当你想调用一个参数类型为 `char` 的方法时，你需要显式地对类型进行转换或者预先进行类型转换。

```groovy
char a='a'
assert Character.digit(a, 16)==10 : 'But Groovy does boxing'
assert Character.digit((char) 'a', 16)==10

try {
  assert Character.digit('a', 16)==10
  assert false: 'Need explicit cast'
} catch(MissingMethodException e) {
}
```

<!-- Groovy supports two styles of casting and in the case of casting to char there are subtle differences when casting a multi-char strings. The Groovy style cast is more lenient and will take the first character, while the C-style cast will fail with exception. -->
Groovy 支持两种不同的类型转换语法，而当转换包含多个字符的字符串至 `char` 时，两种语法会有不同的表现。Groovy 风格的类型转换会更为智能，只以字符串的第一个字符作为转换结果，而 C 风格的强制类型转换则会直接抛出异常。

```groovy
// for single char strings, both are the same
assert ((char) "c").class==Character
assert ("c" as char).class==Character

// for multi char strings they are not
try {
  ((char) 'cx') == 'c'
  assert false: 'will fail - not castable'
} catch(GroovyCastException e) {
}
assert ('cx' as char) == 'c'
assert 'cx'.asType(char) == 'c'	
```

## 10 基本数据类型和包装类

<!-- Because Groovy uses Objects for everything, it autowraps references to primitives. Because of this, it does not follow Java’s behavior of widening taking priority over boxing. Here’s an example using int -->
由于在 Groovy 中所有东西都是对象，Groovy 会对对基本数据类型的引用进行[自动包装](http://docs.groovy-lang.org/latest/html/documentation/core-object-orientation.html#_primitive_types)。鉴于此，Groovy 不会像 Java 那样让类型扩充享有比装箱更高的优先级。例如：

```groovy
int i
m(i)

void m(long l) {           // 注1
  println "in m(long)"
}

void m(Integer i) {        // 注2
  println "in m(Integer)"
}
```

<table style="width: 100%">
  <colgroup>
    <col style="width: 5%">
    <col style="width: 95%">
  </colgroup>
  <tr>
    <td>1</td>
    <td>如果是 Java 的话就会调用这个方法，因为类型扩充比装拆箱享有更高的优先级</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Groovy 则会调用这个方法，因为所有对基本数据类型变量的引用的类型实际上都是为其对应的包装类</td>
  </tr>
</table>

## 11 `==` 的行为

<!-- In Java == means equality of primitive types or identity for objects. In Groovy == translates to a.compareTo(b)==0, if they are Comparable, and a.equals(b) otherwise. To check for identity, there is is. E.g. a.is(b). -->
在 Java 中，`==` 用于检验基本数据类型的相等性和引用的一致性。而在 Groovy 中，对于 `Comparable` 类，`==` 会被理解为 `a.compareTo(b) == 0`，否则理解为 `a.equals(b)`。要检测引用的一致性，需要这样写：`a.is(b)`。

## 12 转换

<!-- Java does automatic widening and narrowing conversions. -->
Java 会自动进行类型扩充或类型收窄的[转换](https://docs.oracle.com/javase/specs/jls/se7/html/jls-5.html)。

<table class="table">
  <tr>
    <th></th>
    <th>转换至</th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
  </tr>
  <tr>
    <th>转换自</th>
    <th><code>boolean</code></th>
    <th><code>byte</code></th>
    <th><code>short</code></th>
    <th><code>char</code></th>
    <th><code>int</code></th>
    <th><code>long</code></th>
    <th><code>float</code></th>
    <th><code>double</code></th>
  </tr>
  <tr>
    <th><code>boolean</code></th>
    <td>-</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
  </tr>
  <tr>
    <th><code>byte</code></th>
    <td>N</td>
    <td>-</td>
    <td>Y</td>
    <td>C</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>short</code></th>
    <td>N</td>
    <td>C</td>
    <td>-</td>
    <td>C</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>char</code></th>
    <td>N</td>
    <td>C</td>
    <td>C</td>
    <td>-</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>int</code></th>
    <td>N</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>-</td>
    <td>Y</td>
    <td>T</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>long</code></th>
    <td>N</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>-</td>
    <td>T</td>
    <td>T</td>
  </tr>
  <tr>
    <th><code>float</code></th>
    <td>N</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>-</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>double</code></th>
    <td>N</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>C</td>
    <td>-</td>
  </tr>
</table>

<!-- * 'Y' indicates a conversion Java can make, 'C' indicates a conversion Java can make when there is an explicit cast, 'T` indicates a conversion Java can make but data is truncated, 'N' indicates a conversion Java can’t make. -->
\* `'Y'` 即指 Java 可以自动执行该转换，`'C'` 即指 Java 可在显式声明了强制类型转换时执行该转换，`'T'` 即指 Java 可执行该转换但会导致有效数据被删节，`'N'` 即指 Java 无法执行该转换。

Groovy 则大大扩充了这些转换规则。

<table class="table">
  <tr>
    <th></th>
    <th>转换至</th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
    <th></th>
  </tr>
  <tr>
    <th>转换自</th>
    <th><code>boolean</code></th>
    <th><code>Boolean</code></th>
    <th><code>byte</code></th>
    <th><code>Byte</code></th>
    <th><code>short</code></th>
    <th><code>Short</code></th>
    <th><code>char</code></th>
    <th><code>Character</code></th>
    <th><code>int</code></th>
    <th><code>Integer</code></th>
    <th><code>long</code></th>
    <th><code>Long</code></th>
    <th><code>BigInteger</code></th>
    <th><code>float</code></th>
    <th><code>Float</code></th>
    <th><code>double</code></th>
    <th><code>Double</code></th>
    <th><code>BigDecimal</code></th>
  </tr>
  <tr>
    <th><code>boolean</code></th>
    <td>-</td>
    <td>B</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
  </tr>
  <tr>
    <th><code>Boolean</code></th>
    <td>B</td>
    <td>-</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
    <td>N</td>
  </tr>
  <tr>
    <th><code>byte</code></th>
    <td>T</td>
    <td>T</td>
    <td>-</td>
    <td>B</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>D</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>Byte</code></th>
    <td>T</td>
    <td>T</td>
    <td>B</td>
    <td>-</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>D</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>short</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>-</td>
    <td>B</td>
    <td>Y</td>
    <td>D</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>Short</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>B</td>
    <td>-</td>
    <td>Y</td>
    <td>D</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>char</code></th>
    <td>T</td>
    <td>T</td>
    <td>Y</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>-</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>D</td>
  </tr>
  <tr>
    <th><code>Character</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>-</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
  </tr>
  <tr>
    <th><code>int</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>-</td>
    <td>B</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>Integer</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>B</td>
    <td>-</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>long</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>Y</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>-</td>
    <td>B</td>
    <td>Y</td>
    <td>T</td>
    <td>T</td>
    <td>T</td>
    <td>T</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>Long</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>Y</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>B</td>
    <td>-</td>
    <td>Y</td>
    <td>T</td>
    <td>T</td>
    <td>T</td>
    <td>T</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>BigInteger</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>-</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
  </tr>
  <tr>
    <th><code>float</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>-</td>
    <td>B</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>Float</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>B</td>
    <td>-</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>double</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>-</td>
    <td>B</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>Double</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>B</td>
    <td>-</td>
    <td>Y</td>
  </tr>
  <tr>
    <th><code>BigDecimal</code></th>
    <td>T</td>
    <td>T</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>T</td>
    <td>D</td>
    <td>-</td>
  </tr>
</table>

<!-- * 'Y' indicates a conversion Groovy can make, 'D' indicates a conversion Groovy can make when compiled dynamically or explicitly cast, 'T` indicates a conversion Groovy can make but data is truncated, 'B' indicates a boxing/unboxing operation, 'N' indicates a conversion Groovy can’t make. -->
\* `'Y'` 即指 Groovy 可以执行该转换，`'D'` 即指 Groovy 进行动态编译或遇到显式类型转换语句时可执行该转换，`'T'` 即指 Groovy 可以执行该转换但有效数据会被删节，`'B'` 即指该转换为装箱/拆箱操作，`'N'` 即指 Groovy 不能执行该转换。

<!-- The truncation uses Groovy Truth when converting to boolean/Boolean. Converting from a number to a character casts the Number.intvalue() to char. Groovy constructs BigInteger and BigDecimal using Number.doubleValue() when converting from a Float or Double, otherwise it constructs using toString(). Other conversions have their behavior defined by java.lang.Number. -->
当转换至 `boolean`/`Boolean` 时，Groovy 会使用 [Groovy 真值](http://docs.groovy-lang.org/latest/html/documentation/core-semantics.html#Groovy-Truth)；从数字到字符的转换实为从 `Number.intvalue()` 到 `char` 的强制转换；当转换至 `BigInteger` 或 `BigDecimal` 时，如果源类型为 `Float` 或 `Double`，Groovy 会使用 `Number.doubleValue()` 来构建结果，否则则使用 `toString()` 的 结果来构建。其他类型转换的行为均如 `java.lang.Number` 类所定义。

## 13 新增的关键词

<!-- There are a few more keywords in Groovy than in Java. Don’t use them for variable names etc. -->
Groovy 比起 Java 新增了如下几个关键词。不要将它们用作变量名等标识符：

- `as`
- `def`
- `in`
- `trait`
