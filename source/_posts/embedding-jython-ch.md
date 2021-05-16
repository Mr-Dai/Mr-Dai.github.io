---
title: Jython：在 Java 程序里运行 Python 代码
category: Java
tags:
 - Java
 - Python
date: 2019-02-19
toc: true
---

教你如何使用 Jython 在 Java 程序中嵌入 Python 代码。

<!-- more -->

## 前言

众所周知，JVM 在大数据基础架构领域可以说是独占鳌头，当我们需要开发大数据处理的相关组件时，首先会想到要使用的语言便是 Java 和 Scala。相比于 Java，Scala 的代码会更加简洁，但也有着高得多的入门门槛，因此为了保证核心组件的稳定和易于维护，我们多数时候都会更倾向于使用 Java 进行开发。

不过，组件中相对稳定的基本功能和框架尚且不谈，对于那些需要快速灵活变化的部分，使用 Java 进行开发则会有些捉襟见肘。例如，我们在为业务方开发一套通用的实时作业时，业务方需要作业在特定的处理环节中支持通过配置自定义的代码来指定算子的行为，并且在配置发生变化时需要可以在不重启实时作业的情况下进行热更新。直接使用 Java 实现这样的功能无疑会有点力不从心，为此我们就需要借助动态语言的力量了。

实际上，在 JVM 平台上使用动态语言的场景并不少见：[Groovy](http://groovy-lang.org/) 便是为此而生的一门语言。尽管在部分场景下 Groovy 确实是不错的选择，但对于大数据分析来说，Groovy 并不为多数数据开发人员所熟知，相比之下 Python 会是更好的选择。

目前也有不少的大数据框架支持用户提交运行 Python 代码：

- Hadoop MapReduce 借助 [Hadoop Streaming](http://hadoop.apache.org/docs/current/hadoop-streaming/HadoopStreaming.html)，使用标准输入流和标准输出流进行进程间的数据交换，可以运行包括 Python 在内任意语言写成的可执行文件
- Apache Spark 提供了 [`pyspark`](https://spark.apache.org/docs/latest/api/python/index.html) 编程入口，其使用了 [Py4J](https://www.py4j.org/) 来实现 JVM 与 Python 进程间的高效数据传输
- Apache Flink 则使用了 [Jython](https://ci.apache.org/projects/flink/flink-docs-stable/dev/stream/python.html#jython-framework) 来运行用户的 Python 代码。

最终，我们选择了使用 Jython 来实现这样的功能。Jython 类似于 Groovy，能够与宿主 Java 程序在同一个 JVM 进程中运行，相比于 Hadoop Streaming 或是 Py4J 的方案减少了进程间数据传输的损耗，以换来更高的性能。

但在使用 Jython 的时候我们仍然需要注意几点：

 - 部分 PyPI 包可能无法在 Jython 中运行，尤其是那些包含 C 语言扩展的包
 - 和 [Groovy](https://dzone.com/articles/groovyshell-and-memory-leaks) 一样，随意地使用 Jython 可能会导致内存泄漏

目前，Jython 已在 2017 年 6 月发布了 2.7.1 版，支持所有 Python 2.7 语法。尽管距离其上一次发布更新已经过去了很长一段时间，但如果你有兴趣看一下它的[源代码仓库](http://hg.python.org/jython)的话，你会发现它仍在持续迭代中。

## Jython 基本使用

本文剩下的内容会集中介绍如何在 Java 程序中使用 Jython。关于其他使用 Jython 的方式，可以参考 Jython 官方给出的 [Jython Book](http://www.jython.org/jythonbook/en/1.0/)，这里我们便不再赘述。

实际上，Jython 的[官方文档](http://www.jython.org/archive/21/docs/embedding.html)也给出了在 Java 中嵌入 Jython 的基本示例，极其简单：

```java
import org.python.util.PythonInterpreter; 
import org.python.core.*; 

public class SimpleEmbedded { 
    public static void main(String[] args) throws PyException { 
        PythonInterpreter interp = new PythonInterpreter();

        System.out.println("Hello, brave new world");
        interp.exec("import sys");
        interp.exec("print sys");

        interp.set("a", new PyInteger(42));
        interp.exec("print a");
        interp.exec("x = 2+2");
        PyObject x = interp.get("x");

        System.out.println("x: "+x);
        System.out.println("Goodbye, cruel world");
    }
}
```

简单，但并不可用。

首先，[`PythonInterpreter`](http://www.jython.org/javadoc/org/python/util/PythonInterpreter.html) 是个非常重的类，其中包含了 Jython 用于编译 Python 代码所需的所有资源和上下文信息。你不会想要大量创建这样的实例的。

此外，Jython 的实现导致对 [`PythonInterpreter.eval`](http://www.jython.org/javadoc/org/python/util/PythonInterpreter.html#eval(java.lang.String)) 方法的重复调用会对相同的 Python 代码不断重复编译运行，导致内存泄漏。

要解决以上问题，我们需要复用 `PythonInterpreter` 对象，并尽可能不要调用 `PythonInterpreter.eval` 方法。

复用 `PythonInterpreter` 对象十分简单：将其实现为单例维护起来即可。你可以以任何形式实现这样的单例模式，简单起见我们这里直接将其设置为一个 `private static final` 变量：

```java
public class PythonRunner {

    private static final PythonInterpreter intr = new PythonInterpreter();

    public PythonRunner(String code) {
        // ...
    }
    
    public Object run() {
        // ...
    }
}
```

要想绕过 `PythonInterpreter.eval` 并不容易，毕竟这是 `PythonInterpreter` 提供给我们唯一可以运行指定 Python 代码并获取结果的方法。

Groovy 提供了 [`GroovyShell.parse`](http://docs.groovy-lang.org/latest/html/api/groovy/lang/GroovyShell.html#parse-java.lang.String-) 方法，可以对给定的 Groovy 代码进行编译，并返回一个 [`Script`](http://docs.groovy-lang.org/latest/html/api/groovy/lang/Script.html) 对象。Groovy 这里做的事情实际上是把客户端给定的 Groovy 代码封装在了一个新的 Java 类中（这个类继承了 `Script`），因此实际上程序可以使用这个 `Script` 对象的类创建出新的 `Script` 对象，即可复用这段 Groovy 代码。

我们同样可以在 Jython 这边实现类似的功能 —— 实际上官方的 Jython Book 有提到类似的做法，名为[对象工厂模式](http://www.jython.org/jythonbook/en/1.0/JythonAndJavaIntegration.html#object-factories)。按照 Jython Book 中给出的示例，你可以将你需要使用的 Python 代码放到一个 Python 类中，再进行编译，但考虑到我们的场景比较简单，这里我们就简单地将代码放在一个 Python 函数中即可：

```java
import org.python.core.PyFunction;
import org.python.util.PythonInterpreter;

public class PythonRunner {

    private static final PythonInterpreter intr = new PythonInterpreter();
    
    private static final String FUNC_TPL = String.join("\n", new String[]{
        "def func():",
        "    %s",
        "",
    });
    
    private final PyFunction func;
    
    public PythonRunner(String code) {
        // 渲染函数内容
        String[] lines = code.split("\n");
        for (int i = 1; i < lines.length; i++)
            lines[i] = "    " + lines[i];
        code = String.join("\n", lines);
        code = String.format(FUNC_TPL, code);
        
        // 编译并获取 PyFunction 对象
        intr.exec(code);
        func = (PyFunction) intr.get(funcName);
    }

    public Object run() {
        // 使用 PyFunction 对象的 __call__ 方法，调用指定的 Python 代码
        return func.__call__();
    }
}
```

## 功能扩展

目前，你已经学到了如何在 Java 程序中使用 Jython 安全地运行 Python 代码，你可以对上述代码进行进一步的扩展来满足你的需求。这里我再简单介绍下我们做的两个比较有用的扩展。

### 在 Python 代码中使用 Java 对象

在你使用编译后得到的 `PyFunction` 对象时，你可能会注意到它的 [`__call__`](http://www.jython.org/javadoc/org/python/core/PyFunction.html#__call__(org.python.core.PyObject)) 方法可以接收任意个类型为 `PyObject` 的参数。这是不是说，我们得把我们的 Java 对象转换成 `PyObject`，我们的 Python 代码才能使用这些 Java 对象呢？

答案是否定的，实际上 Jython 已经实现了类似的自动转换功能。如果你提供的是“标准的” Java 对象，那么 Jython 就会把它 “mock” 成对应的 Python 基本类型对象：

- 所有的 Java 基本数据类型都会被转换为对应的 Python 基本数据类型（例如 `short` 转 `int`、`boolean` 转 `bool`）
- 可以像使用普通 Python `dict` 对象那样使用 `java.util.Map` 实例
- 可以像使用普通 Python `list` 对象那样使用 `java.util.List` 实例

举个例子，我们的项目需要使用到 [FastJSON](https://github.com/alibaba/fastjson) 的 [`JSONObject`](https://github.com/alibaba/fastjson/blob/master/src/main/java/com/alibaba/fastjson/JSONObject.java)，而这个类实现了 `java.util.Map`，因此在我们的 Python 代码中，我们只要将它当做一个普通的 Python `dict` 来使用就好了:

```python
def func(json):
    if not json['test']:
        json['test'] = True
    return True
```

值得注意的是，Jython 并不会改变你的对象的类型：如果你在你的 Python 代码中使用 `instanceof` 的话就会发现，实际上传入对象的类型并未改变。除外，如果你对一个 Java `bool` 值在 Python 代码中使用 `is True` 或 `is False` 判断时，你都会得到 `False` 结果。实际上 Jython 仅仅是为你给定的 Java 对象模拟出了对应的 Python 类型的行为（鸭子类型），但实际上它们依然是不同的类型。

## 引入 PyPI 包

为了进一步减少我们需要写的 Python 代码量，我们也可以把部分公用的 Python 代码维护在统一的包中，然后在自定义的 Python 代码中 `import` 并使用它。要做到这一点，首先我们要设置好 `sys.path`。

Jython 默认会把当前工作目录放到 `sys.path` 中（实际上这应该是所有 Python 解释器的标准行为），所以如果我们需要复用某个自制的 Python 库文件，我们只要将它放在当前工作目录下然后 `import` 就可以了。但如果我们想要使用 PIP 安装的包，我们就需要额外做一些配置了。

实际上，我们只要把本地的 PIP 安装目录路径放到 Jython 的 `sys.path` 中即可。有很多种方法可以做到这一点，但最安全的做法就是直接询问本地安装好的 Python：

```java
public class PythonRunner {

    private static final PythonInterpreter intr = new PythonInterpreter();
    static {
        intr.exec("import sys");
    
        try {
            // 启动子进程，运行本地安装的 Python，获取 sys.path 配置
            Process p = Runtime.getRuntime().exec(new String[]{
                "python2", "-c", "import json; import sys; print json.dumps(sys.path)"});
            p.waitFor();
            
            // 从中获取到相关的 PIP 安装路径，放入 Jython 的 sys.path
            String stdout = IOUtils.toString(p.getInputStream());
            JSONArray syspathRaw = JSONArray.parseArray(stdout);
            for (int i = 0; i < syspathRaw.size(); i++) {
                String path = syspathRaw.getString(i);
                if (path.contains("site-packages") || path.contains("dist-packages"))
                    inter.exec(String.format("sys.path.insert(0, '%s')", path));
            }
        } catch (Exception ex) {}
    }

    // ...
}
```

正如我在一开始所说的那样，并不是所有 PyPI 包都能在 Jython 中运行，尤其是那些包含 C 语言代码的包。因此，在你做更多的尝试前，不妨先在 Jython Shell 中 `import` 一下你想使用的包，验证一下。

## 结语

这篇博文一方面是对最近我们在做的工作进行一次总结，同时希望这些经验也能够帮助到大家。

不过，我不会认为 Jython 是个 100% 安全的解决方案 —— 实际上，你在使用的过程中有可能会遇到十分诡异的 Bug，而且 Jython 的 API 和文档也还远算不上是“友好”。但不管怎么说，如果你有和我们类似的需求的话，也不妨尝试一下 Jython。
