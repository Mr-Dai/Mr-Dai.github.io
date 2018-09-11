---
title: Embedding Python in Java using Jython
category: Java
tags:
 - Java
 - Python
date: 2018-09-11
---

In the past few days, I managed to find a way to dynamically load and run Python code in a Java program. In this post, I will briefly explain how I achieve this.

<!-- more -->

## Background

Recently, I needed to add a new feature to the project I've been working on: it needs to be able to dynamically load Python code into a Spark Streaming program and use it to process real-time messages. In addition, this module need to support hot-reload: the program should be able to switch to a new Python code configuration without restarting the whole Spark Streaming job.

It is not unusual to use dynamic language in the Java plaform: [the Groovy language](http://groovy-lang.org/) was actually born for this, to some extent. Unfortunately, Groovy is not widly used among data developers, and Python would be a better choice in comparison.

Using Python in JVM-based computing framework is not uncommon either:

- Hadoop MapReduce can invoke ANY executable (not only Python) using [Hadoop Streaming](http://hadoop.apache.org/docs/current/hadoop-streaming/HadoopStreaming.html); it uses stdin/stdout to transmit data between JVM and the designated program, which can be written in any language.
- Apache Spark provides [`pyspark`](https://spark.apache.org/docs/latest/api/python/index.html) using [Py4J](https://www.py4j.org/), which enables efficient communication between JVM and Python program.
- [Apache Flink uses Jython](https://ci.apache.org/projects/flink/flink-docs-stable/dev/stream/python.html#jython-framework) to run user Python code.

In the end, We chose Jython to achieve the highest performance possible. Jython is similar to Groovy, running in the same JVM process as the host Java program, in comparison to Hadoop Streaming or Py4J. But there are still a few things need to be considered when using Jython:

- Some PyPI packages might not be able to run in Jython, especially those with C extensions.
- Using Jython without cautions might lead to memory leak, [like Groovy](https://dzone.com/articles/groovyshell-and-memory-leaks).

For now, Jython has released its 2.7.1 version in June, 2017, and supports up to Python 2.7 syntax. Although it hasn't been updated for a very long time, Jython is actually still under active development, if you could take a look at its [source code repository](http://hg.python.org/jython).

## Using Jython

The [Jython Book](http://www.jython.org/jythonbook/en/1.0/) has given a detailed explaination on how to use Jython, so I would not repeat it here. This post will mainly focus on how to use Jython in Java.

Actually, the [official documentations](http://www.jython.org/archive/21/docs/embedding.html) has already mentioned how to embed Jython in Java, and it's pretty simple:

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

Simple, but not practical:

- [`PythonInterpreter`](http://www.jython.org/javadoc/org/python/util/PythonInterpreter.html) is a super heavy class: it maintains all the context and resources needed to compile and run Python code. You do not want to create too many instances of it.
- Possibly related to how Jython is implemented, repeated invocations of [`PythonInterpreter.eval`](http://www.jython.org/javadoc/org/python/util/PythonInterpreter.html#eval(java.lang.String)) will compile the same Python code over and over again, which can lead to memory leak.

To solve these problems, the key is to reuse `PythonInterpreter` object, and try the best to avoid invoking `PythonInterpreter.eval`.

Reusing `PythonIntrepreter` is simple: just hold it somewhere in your program as a singleton. You can implement this singleton pattern in any way you like: Spring Application Context, double-check locking, you name it. We will just make it a `private static final` variable here:

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

It's a bit trickier to avoid invoking `PythonInterpreter.eval`, as it is the only method we can use to run designated Python code and get its result.

Groovy provides [`GroovyShell.parse`](http://docs.groovy-lang.org/latest/html/api/groovy/lang/GroovyShell.html#parse-java.lang.String-), which takes a Groovy script as input and returns a [`Script`](http://docs.groovy-lang.org/latest/html/api/groovy/lang/Script.html) instance. Groovy here actually wrap the given script in a newly created Java class (which extends `Script`), and so we can use this class to create new `Script` instances, and reuse the same compiled Groovy code.

We can implement the same technique in Jython -- actually the Jython Book has also mentioned this kind of usage, which named [Object Factory](http://www.jython.org/jythonbook/en/1.0/JythonAndJavaIntegration.html#object-factories).

You can choose to compile your Python code in a Python class, but we will just use it as a Python function here, which suffices in our scenario:

```java
import org.python.core.PyFunction;
import org.python.util.PythonInterpreter;

public class PythonRunner {

    private static final PythonInterpreter intr = new PythonInterpreter();
    
    private static final String FUNC_TPL = String.join("\n", new String[]{
        "def __call__():",
        "    %s",
        "",
    });
    
    private final PyFunction func;
    
    public PythonRunner(String code) {
        // Render the function body
        String[] lines = code.split("\n");
        for (int i = 1; i < lines.length; i++)
            lines[i] = "    " + lines[i];
        code = String.join("\n", lines);
        code = String.format(FUNC_TPL, code);
        
        intr.exec(code);
        func = (PyFunction) intr.get(funcName);
    }

    public Object run() {
        return func.__call__();
    }
}
```

Note that you need to use [`PythonInterpreter.exec`](http://www.jython.org/javadoc/org/python/util/PythonInterpreter.html#exec(java.lang.String)) to compile the Python function here, and [`get`](http://www.jython.org/javadoc/org/python/util/PythonInterpreter.html#get(java.lang.String)) the Python function object later.

So far, you have learned how to load and run Python code safely in a Java program. You can easily extend this code to meet your own requirement.

Next I will introduce you some other extensions I made to make it more useful.

## Using Java Object in Jython

When you are using the `PyFunction` object, you may notice that its [`__call__`](http://www.jython.org/javadoc/org/python/core/PyFunction.html#__call__(org.python.core.PyObject)) method accepts `PyObject` as parameter. Does that mean we need to convert our Java object to `PyObject` so that our Python code can use it?

The answer is no, Jython has already implemented such function. If what you provide is a "standard" Java object, Jython will "mock" it into the corresponding Python primitive types:

- All Java primitive types can used as the corresponding Python primitive types
- `java.util.Map` instances can be used as normal Python `dict`
- `java.util.List` instances can be used as normal Python `list`

Take my code as an example, we use [`JSONObject`](https://github.com/alibaba/fastjson/blob/master/src/main/java/com/alibaba/fastjson/JSONObject.java) from [FastJSON](https://github.com/alibaba/fastjson) in our project, which implements `java.util.Map`, so in my Python code, I can access its members in the way I would do to a normal Python `dict`:

```python
def __call__(json):
    if not json['test']:
        json['test'] = True
    return True
```

DO note that Jython won't change the type of your object: if you try to do `instanceof` comparison in your Python code, it would return `False`; if you do `is False` or `is True` to a Java `bool` value, it would return `False`. Jython just mimic the behavior of standard Python entities for these Java objects (duck typing), but essentially they are not the same type.

## Importing PIP Packages

To further reduce the amount of Python code we need to write, we might want to maintain some common Python code in a package and reuse it by `import`ing it. Jython also supports importing external Python source file, but first we will need to set the `sys.path` accordingly.

By default, Jython (or Python) will automatically include the current working directory in the `sys.path`, so if we want to use some self-made Python file, we can just add it to the current working directory and `import` it. But if we want to use those packages installed by PIP, we will need some extra configuration.

The key is to add the local PIP install directory to the `sys.path` of Jython. You can do this in many ways, but the safest solution is to just ask the local Python interpreter:

```java
public class PythonRunner {

    private static final PythonInterpreter intr = new PythonInterpreter();
    static {
        intr.exec("import sys");
    
        try {
            Process p = Runtime.getRuntime().exec(new String[]{
                "python2", "-c", "import json; import sys; print json.dumps(sys.path)"});
            p.waitFor();
            
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

As I mentioned earlier at the beginning of this post, not all PyPI packages can run in Jython, especially those contain C code. Try to `import` the package you want to use in Jython shell and test its fuctions before going further.

## Conclusion

This post is mainly an epilogue to the work I've been doing in the past few days.

I would not consider Jython as an 100% safe solution: the truth is, you may run into some very subtle bug when you use it, and its API and documentations is nothing close to "friendly". But if you want to achieve something like mine, Jython definitely worth a look.
