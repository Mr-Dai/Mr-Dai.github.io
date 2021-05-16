---
title: Groovy 教程 - 整合 Groovy 至应用程序
category: Groovy
tags: Groovy
date: 2018-04-24
toc: true
---

这是一篇译文，读者可前往 [Groovy Getting Started - Integrating Groovy into applications](http://www.groovy-lang.org/integrating.html) 阅读原文。

<!-- more -->

## 1 Groovy 整合机制

<!--
	The Groovy language proposes several ways to integrate itself into applications (Java or even Groovy) at runtime, from the most basic, simple code execution to the most complete, integrating caching and compiler customization.
-->
Groovy 语言提供了多种在运行时将其整合至（Java 甚至 Groovy）应用程序中的方法，包括了从最简单代码的执行到完整的应用程序整合缓存和编译器定制化。

<!--
	All the examples written in this section are using Groovy, but the same integration mechanisms can be used from Java.
-->
本章中所有的示例都使用 Groovy 编写而成，但这些整合机制同样可用于 Java。

### 1.1 Eval

<!--
	The groovy.util.Eval class is the simplest way to execute Groovy dynamically at runtime. This can be done by calling the me method:
-->
在运行时动态执行 Groovy 代码最简单的方式莫过于使用 `groovy.util.Eval` 类了，我们只需调用该类的 `me` 方法即可：

```groovy
import groovy.util.Eval

assert Eval.me('33*3') == 99
assert Eval.me('"foo".toUpperCase()') == 'FOO'
```

<!--
	Eval supports multiple variants that accept parameters for simple evaluation:
-->
`Eval` 类还提供了许多其他方法来允许用户传入参数进行简单的运算：

```groovy
assert Eval.x(4, '2*x') == 8                // 注1
assert Eval.me('k', 4, '2*k') == 8          // 注2
assert Eval.xy(4, 5, 'x*y') == 20           // 注3
assert Eval.xyz(4, 5, 6, 'x*y+z') == 26     // 注4
```

1. 包含一个名为 `x` 的参数的简单运算
2. 包含一个自定义的名为 `k` 的参数的简单运算
3. 包含两个分别名为 `x` 和 `y` 的参数的简单运算
4. 包含三个分别名为 `x`、`y` 和 `z` 的参数的简单运算

<!--
	The Eval class makes it very easy to evaluate simple scripts, but doesn’t scale: there is no caching of the script, and it isn’t meant to evaluate more than one liners.
-->
尽管 `Eval` 类使得我们可以很方便地运行简单的脚本，但它并不具备很好的横向扩展性：它不会对脚本进行任何缓存，也并不是设计来用于执行长度超过一行的脚本的。

### 1.2 GroovyShell

#### 1.2.1 多种代码来源

<!--
	The groovy.lang.GroovyShell class is the preferred way to evaluate scripts with the ability to cache the resulting script instance. Although the Eval class returns the result of the execution of the compiled script, the GroovyShell class offers more options.
-->
比起 `Eval`，`groovy.lang.GroovyShell` 类提供了更好的执行脚本的方式，同时还提供了对脚本实例运行结果进行缓存的支持。比起像 `Eval` 一般运行脚本并返回结果，`GroovyShell` 类还提供了更多的做法：

```groovy
def shell = new GroovyShell()                           // 注1
def result = shell.evaluate '3*5'                       // 注2
def result2 = shell.evaluate(new StringReader('3*5'))   // 注3
assert result == result2
def script = shell.parse '3*5'                          // 注4
assert script instanceof groovy.lang.Script
assert script.run() == 15                               // 注5
```

1. 创建了一个 `GroovyShell` 实例
2. 可以像 `Eval` 那样直接执行脚本代码
3. 也可以从多种不同的来源中读取代码（`String`、`Reader`、`File`、`InputStream`）
4. `parse` 方法返回一个 `Script` 实例，可以此延迟脚本的执行
5. `Script` 类提供了 `run` 方法

#### 1.2.2 在脚本与应用程序间共享数据

<!--
	It is possible to share data between the application and the script using a groovy.lang.Binding:
-->
我们可以通过 `groovy.lang.Binding` 类来实现脚本与应用程序间的数据共享：

```groovy
def sharedData = new Binding()                          // 注1
def shell = new GroovyShell(sharedData)                 // 注2
def now = new Date()
sharedData.setProperty('text', 'I am shared data!')     // 注3
sharedData.setProperty('date', now)                     // 注4

String result = shell.evaluate('"At $date, $text"')     // 注5

assert result == "At $now, I am shared data!"
```

1. 创建 `Binding` 实例用于存储共享数据
2. 创建即将使用这些共享数据的 `GroovyShell` 实例
3. 将一个 `String` 添加到了 `Binding` 中
4. 讲一个 `Date` 添加到了 `Binding` 中（你可以放入除基本类型外的其他类型的数据
5. 执行脚本

<!--
	Note that it is also possible to write from the script into the binding:
-->
值得注意的是我们还可以在脚本中向 `Binding` 写入数据：

```groovy
def sharedData = new Binding()                          // 注1
def shell = new GroovyShell(sharedData)                 // 注2

shell.evaluate('foo=123')                               // 注3

assert sharedData.getProperty('foo') == 123             // 注4
```

1. 创建 `Binding` 实例
2. 创建即将使用这些共享数据的 `GroovyShell` 实例
3. 通过使用一个**未声明**的变量来讲数据存储到 `Binding` 中
4. 从应用程序中获取数据

<!--
	It is important to understand that you need to use an undeclared variable if you want to write into the binding. Using def or an explicit type like in the example below would fail because you would then create a local variable:
-->
值得注意的是，如果你想要将数据写入到 `Binding` 中，你需要使用未声明的变量。像下面的例子那样使用 `def` 或 `explicit` 类型是不会将数据写入到 `Binding` 中的，因为这样做实际上是创建了一个**局部变量**：

```groovy
def sharedData = new Binding()
def shell = new GroovyShell(sharedData)

shell.evaluate('int foo=123')

try {
    assert sharedData.getProperty('foo')
} catch (MissingPropertyException e) {
    println "foo is defined as a local variable"
}
```

<!--
	You must be very careful when using shared data in a multithreaded environment. The Binding instance that you pass to GroovyShell is not thread safe, and shared by all scripts. 
-->
当你想要在多线程环境中使用共享数据时必须提高警惕：你所传递给 `GroovyShell` 的 `Binding` 实例**不是**线程安全的，而且它被所有脚本所共享。

<!--
	It is possible to work around the shared instance of Binding by leveraging the Script instance which is returned by parse:
-->
我们倒是可以通过利用由 `parse` 方法返回的 `Script` 实例来绕过共享的 `Binding` 实例：

```groovy
def shell = new GroovyShell()

def b1 = new Binding(x:3)                       // 注1
def b2 = new Binding(x:4)                       // 注2
def script = shell.parse('x = 2*x')
script.binding = b1
script.run()
script.binding = b2
script.run()
assert b1.getProperty('x') == 6
assert b2.getProperty('x') == 8
assert b1 != b2
```

1. 将变量 `x = 3` 保存到 `b1` 中
2. 将变量 `x = 4` 保存到 `b2` 中

<!--
	However, you must be aware that you are still sharing the same instance of a script. So this technique cannot be used if you have two threads working on the same script. In that case, you must make sure of creating two distinct script instances:
-->
然而，你仍该意识到，这样做的时候你则是在共享同一个 `Script` 实例的使用，因此如果你想要让两个线程同时使用同样的脚本的话，这样的做法并不合适。在这种情况下，你应创建两个不同的 `Script` 实例：

```groovy
def shell = new GroovyShell()

def b1 = new Binding(x:3)
def b2 = new Binding(x:4)
def script1 = shell.parse('x = 2*x')            // 注1
def script2 = shell.parse('x = 2*x')            // 注2
assert script1 != script2
script1.binding = b1                            // 注3
script2.binding = b2                            // 注4
def t1 = Thread.start { script1.run() }         // 注5
def t2 = Thread.start { script2.run() }         // 注6
[t1,t2]*.join()                                 // 注7
assert b1.getProperty('x') == 6
assert b2.getProperty('x') == 8
assert b1 != b2
```

1. 创建用于 1 号线程的 `Script` 实例
2. 创建用于 2 号线程的 `Script` 实例
3. 将第一个 `Binding` 赋予第一个 `Script`
4. 将第二个 `Binding` 赋予第二个 `Script`
5. 在一个独立的线程中启动第一个 `Script`
6. 在一个独立的线程中启动第二个 `Script`
7. 等待运行结束

<!--
	In case you need thread safety like here, it is more advisable to use the GroovyClassLoader directly instead.
-->
除非你需要像上述案例那样的线程安全性，否则我们更推荐你直接使用 [`GroovyClassLoader`](http://www.groovy-lang.org/integrating.html#groovyclassloader)。

#### 1.2.3 自定义脚本类

<!--
	We have seen that the parse method returns an instance of groovy.lang.Script, but it is possible to use a custom class, given that it extends Script itself. It can be used to provide additional behavior to the script like in the example below:
-->
我们了解到 `parse` 方法可以返回 `groovy.lang.Script` 实例，但它同样可以返回自定义的类，只要该类扩展了 `Script` 类。这么做能像下述的案例那样让 `Script` 实例支持更多的操作：

```groovy
abstract class MyScript extends Script {
    String name

    String greet() {
        "Hello, $name!"
    }
}
```

<!--
	The custom class defines a property called name and a new method called greet. This class can be used as the script base class by using a custom configuration:
-->
这个自定义类定义了一个叫做 `name` 的属性以及一个叫做 `greet` 的新方法。通过一些自定义设置，我们可以使用这个类作为脚本的基类：

```groovy
import org.codehaus.groovy.control.CompilerConfiguration

def config = new CompilerConfiguration()                                    // 注1
config.scriptBaseClass = 'MyScript'                                         // 注2

def shell = new GroovyShell(this.class.classLoader, new Binding(), config)  // 注3
def script = shell.parse('greet()')                                         // 注4
assert script instanceof MyScript
script.setName('Michel')
assert script.run() == 'Hello, Michel!'
```

1. 创建 `CompilerConfiguration` 实例
2. 令其使用 `MyScript` 类作为脚本基类
3. 然后在创建 `GroovyShell` 时使用该 `CompilerConfiguration` 实例
4. 现在返回的脚本可以访问新方法 `greet` 了

<!--
	You are not limited to the sole scriptBaseClass configuration. You can use any of the compiler configuration tweaks, including the compilation customizers. 
-->
你可以进行的设置当然不止 `scriptBaseClass`。你可以使用任意 `CompilerConfiguration` 设置，包括[编译定制器](http://docs.groovy-lang.org/latest/html/gapi/org/codehaus/groovy/control/CompilerConfiguration.html#addCompilationCustomizers(org.codehaus.groovy.control.customizers.CompilationCustomizer))。

### 1.3 GroovyClassLoader

<!--
	In the previous section, we have shown that GroovyShell was an easy tool to execute scripts, but it makes it complicated to compile anything but scripts. Internally, it makes use of the groovy.lang.GroovyClassLoader, which is at the heart of the compilation and loading of classes at runtime.
-->
在之前的章节中，我们看到 `GroovyShell` 可以很方便地执行脚本，但它并不适合用于编译除脚本以外的东西。在 `GroovyShell` 内部它实际上使用了 `groovy.lang.GroovyClassLoader`，而后者则是运行时编译并载入类的核心所在。

<!--
	By leveraging the GroovyClassLoader instead of GroovyShell, you will be able to load classes, instead of instances of scripts:
-->
通过使用 `GroovyClassLoader`，你可以载入类而不是脚本实例：

```groovy
import groovy.lang.GroovyClassLoader

def gcl = new GroovyClassLoader()                                           // 注1
def clazz = gcl.parseClass('class Foo { void doIt() { println "ok" } }')    // 注2
assert clazz.name == 'Foo'                                                  // 注3
def o = clazz.newInstance()                                                 // 注4
o.doIt()                                                                    // 注5
```

1. 创建一个 `GroovyClassLoader` 实例
2. `parseClass` 方法会返回一个 `Class` 实例
3. 可以看到返回的类确实是在脚本中定义的类
4. 你也可以创建一个该类的实例，可见返回的确实是类而不是脚本
5. 你也可以调用所创建实例的方法

<!--
	A GroovyClassLoader keeps a reference of all the classes it created, so it is easy to create a memory leak. In particular, if you execute the same script twice, if it is a String, then you obtain two distinct classes! 
-->
`GroovyClassLoader` 会维持对所有由其所创建的类的引用，而这很容易导致内存泄漏。具体来说，如果你使用一个 `String` 对象来让 `GroovyClassLoader` 对同样的脚本进行两次处理，你实际上会获得两个不同的类！

```groovy
import groovy.lang.GroovyClassLoader

def gcl = new GroovyClassLoader()
def clazz1 = gcl.parseClass('class Foo { }')                                // 注1
def clazz2 = gcl.parseClass('class Foo { }')                                // 注2
assert clazz1.name == 'Foo'                                                 // 注3
assert clazz2.name == 'Foo'
assert clazz1 != clazz2                                                     // 注4
```

1. 动态创建一个名为 `Foo` 的类
2. 使用第二次 `parseClass` 方法调用创建一个一模一样的类
3. 两个类拥有相同的名称
4. 但它们是两个不同的类！

<!--
	The reason is that a GroovyClassLoader doesn’t keep track of the source text. If you want to have the same instance, then the source must be a file, like in this example:
-->
原因在于 `GroovyClassLoader` 不会记录源代码文本。如果你希望它返回相同的 `Class` 实例，你则必须像下面的示例那样使用文件作为代码来源：

```groovy
def gcl = new GroovyClassLoader()
def clazz1 = gcl.parseClass(file)                                           // 注1
def clazz2 = gcl.parseClass(new File(file.absolutePath))                    // 注2
assert clazz1.name == 'Foo'                                                 // 注3
assert clazz2.name == 'Foo'
assert clazz1 == clazz2                                                     // 注4
```

1. 从一个 `File` 中解析类
2. 使用不同的 `File` 实例进行类解析，但两个 `File` 在物理上指向同一个文件
3. 两个类有相同的名称
4. 现在，它们确实是相同的 `Class` 实例了

<!--
	Using a File as input, the GroovyClassLoader is capable of caching the generated class file, which avoids creating multiple classes at runtime for the same source.
-->
使用 `File` 作为输入时，`GroovyClassLoader` 能够对生成的类文件进行**缓存**，这就避免了在运行时对同样的代码生成多个不同的类了。

### 1.4 GroovyScriptEngine

<!--
	The groovy.util.GroovyScriptEngine class provides a flexible foundation for applications which rely on script reloading and script dependencies. While GroovyShell focuses on standalone Script`s and `GroovyClassLoader handles dynamic compilation and loading of any Groovy class, the GroovyScriptEngine will add a layer on top of GroovyClassLoader to handle both script dependencies and reloading.
-->
对于那些需要处理脚本重载与脚本依赖的应用程序来说，`groovy.util.GroovyScriptEngine` 提供了扩展性强的良好基础。前面我们看到，`GroovyShell` 专注于处理各个独立的 `Script` 对象，`GroovyClassLoader` 负责处理任意 Groovy 类的动态编译与载入，而接下来你将看到，`GroovyScriptEngine` 是在 `GroovyClassLoader` 之上添加了新的一层封装，可用于处理脚本的依赖与重载。

<!--
	To illustrate this, we will create a script engine and execute code in an infinite loop. First of all, you need to create a directory with the following script inside:
-->
为此，我们会在接下来的案例中先创建一个 `GroovyScriptEngine` 并在一个无限循环中运行它。首先，你需要创建一个文件夹并在里面放入如下脚本文件：

`ReloadingTest.groovy`

```groovy
class Greeter {
    String sayHello() {
        def greet = "Hello, world!"
        greet
    }
}

new Greeter()
```

<!--
	then you can execute this code using a GroovyScriptEngine
-->
然后你就能用 `GroovyScriptEngine` 运行这个代码了：

```groovy
def binding = new Binding()
def engine = new GroovyScriptEngine([tmpDir.toURI().toURL()] as URL[])        // 注1
while (true) {
    def greeter = engine.run('ReloadingTest.groovy', binding)                 // 注2
    println greeter.sayHello()                                                // 注3
    Thread.sleep(1000)
}
```

1. 创建一个 `GroovyScriptEngine` 并指定其在我们的源文件夹中寻找源文件
2. 运行脚本，返回一个 `Greeter` 实例
3. 打印信息

这样，每秒你都会看到其打印一行信息：

```
Hello, world!
Hello, world!
...
```

<!--
	Without interrupting the script execution, now replace the contents of the ReloadingTest file with:
-->
**不要** 中断脚本的执行，现在我们将 `ReloadingTest.groovy` 文件的内容修改至如下：

```groovy
class Greeter {
    String sayHello() {
        def greet = "Hello, Groovy!"
        greet
    }
}

new Greeter()
```

你应该能看到打印的信息发生了如下的改变：

```
Hello, world!
...
Hello, Groovy!
Hello, Groovy!
...
```

<!--
	But it is also possible to have a dependency on another script. To illustrate this, create the following file into the same directory, without interrupting the executing script:
-->
我们还能依赖另一个脚本。为此，我们先不要中断刚才正在执行的脚本，并在刚刚的文件夹中创建文件如下：

`Dependency.groovy`

```groovy
class Dependency {
	String message = 'Hello, dependency 1'
}
```

然后更新 `ReloadingTest.groovy` 脚本如下：

```groovy
import Dependency

class Greeter {
    String sayHello() {
        def greet = new Dependency().message
        greet
    }
}

new Greeter()
```

这次，你会看到打印信息变成了这样：

```
Hello, Groovy!
...
Hello, dependency 1!
Hello, dependency 1!
...
```

最后，你还能在不修改 `ReloadingTest.groovy` 文件的情况下对 `Dependency.groovy` 文件进行修改：

```groovy
class Dependency {
    String message = 'Hello, dependency 2'
}
```

之后你应该能观察到依赖文件被重新载入了：

```
Hello, dependency 1!
...
Hello, dependency 2!
Hello, dependency 2!
```

### 1.5 CompilationUnit

<!--
	Ultimately, it is possible to perform more operations during compilation by relying directly on the org.codehaus.groovy.control.CompilationUnit class. This class is responsible for determining the various steps of compilation and would let you introduce new steps or even stop compilation at various phases. This is for example how stub generation is done, for the joint compiler.
-->
最后，我们还可以通过直接使用 `org.codehaus.groovy.control.CompilationUnit` 类来进行更多的操作。该类负责确定编译各个步骤的具体行为，还能让你在编译中加入新的步骤甚至在指定的步骤中停止编译。

<!--
	However, overriding CompilationUnit is not recommended and should only be done if no other standard solution works.
-->
然而，我们不推荐你重载 `CompilationUnit`，除非其他标准的做法都无法满足你的需求。

## 2 Bean 脚本框架

<!--
	The Bean Scripting Framework is an attempt to create an API to allow calling scripting languages from Java. It hasn’t been updated for long and abandoned in favor of the standard JSR-223 API. 
-->
[Bean 脚本框架](http://commons.apache.org/proper/commons-bsf/)（Bean Scripting Framework，BSF）尝试为 Java 创建一套 API 用以调用脚本语言。可惜的是，它已经被最新的 JSR-223 API 所替代而且很长一段时间没有更新了。

<!--
	The BSF engine for Groovy is implemented by the org.codehaus.groovy.bsf.GroovyEngine class. However, that fact is normally hidden away by the BSF APIs. You just treat Groovy like any of the other scripting languages via the BSF API.
-->
Groovy 的 BSF 引擎由 `org.codehaus.groovy.bsf.GroovyEngine` 类所实现。然而，BSF 的 API 通常会将这个细节所遮蔽。你只需要在 BSF API 中像处理其他脚本语言那样使用 Groovy 即可。

<!--
	Since Groovy has its own native support for integration with Java, you only need to worry about BSF if you also want to also be able to call other languages, e.g. JRuby or if you want to remain very loosely coupled from your scripting language. 
-->
由于 Groovy 本身有对与 Java 应用程序整合的原生支持，大多数情况下你不需要为 BSF 操心太多，除非你还想要调用如 JRuby 等其他语言，或者你希望你的应用程序与你所使用的脚本语言之间保持极度松耦合的关系。

### 2.1 热身入门

<!--
	Provided you have Groovy and BSF jars in your classpath, you can use the following Java code to run a sample Groovy script:
-->
假设你已经把 Groovy 和 BSF 的 JAR 包放到了类路径中，你可以使用如下 Java 代码来运行一段 Groovy 脚本样例了：

```java
String myScript = "println('Hello World')\n  return [1, 2, 3]";
BSFManager manager = new BSFManager();
List answer = (List) manager.eval("groovy", "myScript.groovy", 0, 0, myScript);
assertEquals(3, answer.size());
```

### 2.2 传递参数

<!--
	BSF lets you pass beans between Java and your scripting language. You can register/unregister beans which makes them known to BSF. You can then use BSF methods to lookup beans as required. Alternatively, you can declare/undeclare beans. This will register them but also make them available for use directly in your scripting language. This second approach is the normal approach used with Groovy. Here is an example:
-->
BSF 还允许你在 Java 应用程序和脚本语言之间传递 Bean 对象。你可以通过注册/注销 Bean 类的方式使 BSF 得知其存在。之后你可以通过 BSF 提供的方法来对 Bean 类进行检索。除此之外，你还可以声明/反声明 Bean 类，如此一来便能注册该 Bean 类且使得脚本语言也能直接使用它们。当我们使用 Groovy 时通常会使用第二种方法，示例如下：

```java
BSFManager manager = new BSFManager();
manager.declareBean("xyz", 4, Integer.class);
Object answer = manager.eval("groovy", "test.groovy", 0, 0, "xyz + 1");
assertEquals(5, answer);
```

### 2.3 其他调用选项

<!--
	The previous examples used the eval method. BSF makes multiple methods available for your use (see the BSF documentation for more details). One of the other available methods is apply. It allows you to define an anonymous function in your scripting language and apply that function to arguments. Groovy supports this function using closures. Here is an example:
-->
上面的案例中均使用了 `eval` 方法。除此之外 BSF 还提供了很多其他方法功能使用（详情可参阅 [BSF 文档](http://commons.apache.org/proper/commons-bsf/manual.html)）。其中包括 `apply` 方法，其允许你在脚本语言中定义一个匿名函数并将其应用于给定的参数。Groovy 则通过闭包来支持该功能。示例如下：

```java
BSFManager manager = new BSFManager();
Vector<String> ignoreParamNames = null;
Vector<Integer> args = new Vector<Integer>();
args.add(2);
args.add(5);
args.add(1);
Integer actual = (Integer) manager.apply("groovy", "applyTest", 0, 0,
        "def summer = { a, b, c -> a * 100 + b * 10 + c }", ignoreParamNames, args);
assertEquals(251, actual.intValue());
```

### 2.4 访问脚本引擎

<!--
	Although you don’t normally need it, BSF does provide a hook that lets you get directly to the scripting engine. One of the functions which the engine can perform is to invoke a single method call on an object. Here is an example:
-->
尽管在一般情况下你不会用到，但 BSF 提供了一些方法使你可以直接访问脚本引擎。脚本引擎的其中一个功能为对给定的对象调用方法。示例如下：

```java
BSFManager manager = new BSFManager();
BSFEngine bsfEngine = manager.loadScriptingEngine("groovy");
manager.declareBean("myvar", "hello", String.class);
Object myvar = manager.lookupBean("myvar");
String result = (String) bsfEngine.call(myvar, "reverse", new Object[0]);
assertEquals("olleh", result);
```

## 3 JSR-223 `javax.script` API

<!--
	JSR-223 is a standard API for calling scripting frameworks in Java. It is available since Java 6 and aims at providing a common framework for calling multiple languages from Java. Groovy provides its own richer integration mechanisms, and if you don’t plan to use multiple languages in the same application, it is recommended that you use the Groovy integration mechanisms instead of the limited JSR-223 API. 
-->
JSR-223 为一套从 Java 中调用脚本框架的标准 API。它从 Java6 开始加入 Java 平台，并企图向开发者提供一套从 Java 中调用多种语言的通用框架。Groovy 本身就提供了功能丰富的整合机制，所以如果你并不打算在同一个应用程序中使用其他脚本语言，我们更推荐你使用 Groovy 的整合机制而不是功能有限的 JSR-223 API。

<!--
	Here is how you need to initialize the JSR-223 engine to talk to Groovy from Java:
-->
你需要通过如下代码来初始化  JSR-223 引擎使其能从 Java 访问 Groovy：

```java
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

ScriptEngineManager factory = new ScriptEngineManager();
ScriptEngine engine = factory.getEngineByName("groovy");
```

然后你就能很轻松地运行 Groovy 脚本了：

```java
Integer sum = (Integer) engine.eval("(1..10).sum()");
assertEquals(new Integer(55), sum);
```

你还能在 Java 和 Groovy 间共享变量：

```java
engine.put("first", "HELLO");
engine.put("second", "world");
String result = (String) engine.eval("first.toLowerCase() + ' ' + second.toUpperCase()");
assertEquals("hello WORLD", result);
```

如下示例展示了如何调用一个可调用函数：

```java
import javax.script.Invocable;

ScriptEngineManager factory = new ScriptEngineManager();
ScriptEngine engine = factory.getEngineByName("groovy");
String fact = "def factorial(n) { n == 1 ? 1 : n * factorial(n - 1) }";
engine.eval(fact);
Invocable inv = (Invocable) engine;
Object[] params = {5};
Object result = inv.invokeFunction("factorial", params);
assertEquals(new Integer(120), result);
```

<!--
	The engine keeps per default hard references to the script functions. To change this you should set a engine level scoped attribute to the script context of the name #jsr223.groovy.engine.keep.globals with a String being phantom to use phantom references, weak to use weak references or soft to use soft references - casing is ignored. Any other string will cause the use of hard references.
-->
默认情况下脚本引擎会对脚本函数维持强引用。你可以通过将一个名为 `#jsr223.groovy.engine.keep.globals` 的引擎属性设置到脚本上下文中来改变此行为。将该变量设置为 `phantom` 来使用虚引用、设置为 `weak` 来使用弱引用、设置为 `soft` 来使用软引用。该变量值不区分大小写，但设置为任何其他 `String` 值都会使引擎继续使用强引用。
