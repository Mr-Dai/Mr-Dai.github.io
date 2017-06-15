---
layout: post_translated
title: Groovy 教程 - Grape 依赖管理
author: Robert Peng
category: Groovy
org_title: "Groovy Getting Started - The Grape Dependency Manager"
org_url: "http://www.groovy-lang.org/grape.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushGroovy.js"></script>
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

## 1 快速入门

### 1.1 添加依赖

<!--
	Grape is a JAR dependency manager embedded into Groovy. Grape lets you quickly add maven repository dependencies to your classpath, making scripting even easier. The simplest use is as simple as adding an annotation to your script:
-->
Grape 是 Groovy 自带的 JAR 依赖管理器，可以让你快速地将 Maven 库依赖添加到类路径中，让脚本的编写变得更加简单。在最简单的情形里，你只要把一句注解加入到你的脚本中即可：

```groovy
@Grab(group='org.springframework', module='spring-orm', version='3.2.5.RELEASE')
import org.springframework.jdbc.core.JdbcTemplate
```

`@Grab` 还支持另一种简写形式：

```groovy
@Grab('org.springframework:spring-orm:3.2.5.RELEASE')
import org.springframework.jdbc.core.JdbcTemplate
```

<!--
	Note that we are using an annotated import here, which is the recommended way. You can also search for dependencies on mvnrepository.com and it will provide you the @Grab annotation form of the pom.xml entry.
-->
值得注意的是我们的示例中使用的是带注解的引入语句，而这也是我们最推荐的 Grape 使用方式。你可以到 [mvnrepository.com](http://mvnrepository.com/) 上搜索你需要的库，上面会提供其 `pom.xml` 项对应的 `@Grab` 注解。

### 1.2 使用其他仓库

<!--
	Not all dependencies are in maven central. You can add new ones like this:
-->
并不是所有的依赖库都能在 Maven 中心库中找到。此时，你需要添加如下依赖：

```groovy
@GrabResolver(name='restlet', root='http://maven.restlet.org/')
@Grab(group='org.restlet', module='org.restlet', version='1.1.6')
```

### 1.3 Maven Classifier

<!--
	Some maven dependencies need classifiers in order to be able to resolve. You can fix that like this:
-->
某些 Maven 依赖需要添加 Classifier 才能被正确解析。你可以这样做：

```groovy
@Grab(group='net.sf.json-lib', module='json-lib', version='2.2.3', classifier='jdk15')
```

### 1.4 排除间接依赖

<!--
	Sometimes you will want to exclude transitive dependencies as you might be already using a slightly different but compatible version of some artifact. You can do this as follows:
-->
有些时候，你可能已经依赖了一个有点不同但又相容的库，想要排除掉某个库的间接依赖。你可以这样做：

```groovy
@Grab('net.sourceforge.htmlunit:htmlunit:2.8')
@GrabExclude('xml-apis:xml-apis')
```

### 1.5 JDBC 驱动

<!--
	Because of the way JDBC drivers are loaded, you’ll need to configure Grape to attach JDBC driver dependencies to the system class loader. I.e:
-->
鉴于 JDBC 驱动载入的方式，你需要对 Grape 进行特殊设置令其将 JDBC 驱动依赖附加到系统类加载器中，如下：

```groovy
@GrabConfig(systemClassLoader=true)
@Grab(group='mysql', module='mysql-connector-java', version='5.1.6')
```

### 1.6 在 Groovy Shell 中使用 Grape

在 `groovysh` 中你需要使用如下方法调用：

```groovy
groovy.grape.Grape.grab(group:'org.springframework', module:'spring', version:'2.5.6')
```

### 1.7 代理设置

<!--
	If you are behind a firewall and/or need to use Groovy/Grape through a proxy server, you can specify those settings on the command like via the http.proxyHost and http.proxyPort system properties:
-->
如果你的机器在一个防火墙之后，或者你希望让 Groovy/Grape 使用某个代理服务器，你可以在命令号中设置 `http.proxyHost` 和 `http.proxyPort` 系统属性：

```
groovy -Dhttp.proxyHost=yourproxy -Dhttp.proxyPort=8080 yourscript.groovy
```

<!--
	Or you can make this system wide by adding these properties to your JAVA_OPTS environment variable:
-->
或者你也可以将这些设置放入到 `JAVA_OPTS` 环境变量中，使其在全系统上生效：

```
JAVA_OPTS = -Dhttp.proxyHost=yourproxy -Dhttp.proxyPort=8080
```

### 1.8 日志输出

<!--
	If you want to see what Grape is doing set the system property groovy.grape.report.downloads to true (e.g. add -Dgroovy.grape.report.downloads=true to invocation or JAVA_OPTS) and Grape will print the following infos to System.error:
-->
如果你想要知道 Grape 具体在做什么，你可以将系统属性 `groovy.grape.report.downloads` 设置为 `true`（即在 `JAVA_OPTS` 或在启动脚本的命令中加入 `-Dgroovy.grape.report.downloads=true`），如此一来 Grape 就会将下列信息打印到 `System.error` 流中：

- 开始解析某个依赖
- 开始下载某个包
- 重新尝试下载某个包
- 已下载包的大小与下载时间

<!--
	To log with even more verbosity, increase the Ivy log level (defaults to -1). For example -Divy.message.logger.level=4.
-->
你可以通过设置 Ivy 日志等级（默认为 `-1`）来让 Grape 打印更多的日志信息。如 `-Divy.message.logger.level=4`

## 2 细节

<!--
	Grape (The Groovy Adaptable Packaging Engine or Groovy Advanced Packaging Engine) is the infrastructure enabling the grab() calls in Groovy, a set of classes leveraging Ivy to allow for a repository driven module system for Groovy. This allows a developer to write a script with an essentially arbitrary library requirement, and ship just the script. Grape will, at runtime, download as needed and link the named libraries and all dependencies forming a transitive closure when the script is run from existing repositories such as JCenter, Ibiblio and java.net.
-->
Grape（Groovy Adaptable Packaging Engine 或 Groovy Advanced Packaging Engine）， `grab` 方法调用背后的框架，通过运用 Ivy 为 Groovy 实现了基于库的模块系统。这使得开发者在编写脚本时可以使用任意的依赖库，同时只对脚本本身进行分发。Grape 会在运行时下载并链接所需的依赖。

<!--
	Grape follows the Ivy conventions for module version identification, with naming change.
-->
Grape 仍旧采用了 Ivy 的模块版本声明惯例，但修改了一些属性名称：

- `group`：模块所属的模块组。直接对应于 Maven 的 `groupId` 或者 Ivy 的 Organization。任何匹配 `/groovy[x][\..*]^/` 的组名都是被保留的，而且可能对于某些使用 Groovy 的模块有特殊的含义
- `module`：模块的名称。直接对应于 Maven 的 `artifactId` 或者 Ivy 的 artifact
- `version`：所需模块的版本号。可以使用具体版本号 `1.1-RC3` 或 Ivy 的版本范围表达式 `[2.2.1,)`，即 `2.2.1` 及以上的版本
- `classifier`：可忽略的 Classifier

<!--
	The downloaded modules will be stored according to Ivy’s standard mechanism with a cache root of ~/.groovy/grape
-->
下载下来的模块会采用 Ivy 的标准机制进行管理并存储在 `~/.groovy/grape` 之下。

## 3 具体使用

### 3.1 注解

<!--
	One or more groovy.lang.Grab annotations can be added at any place that annotations are accepted to tell the compiler that this code relies on the specific library. This will have the effect of adding the library to the classloader of the groovy compiler. This annotation is detected and evaluated before any other resolution of classes in the script, so imported classes can be properly resolved by a @Grab annotation.
-->
我们可以将 `groovy.lang.Grab` 注解放在代码中任何可放置注解的地方以告诉编译器该代码依赖特定的库。这会使得指定的库被放入到 Groovy 编译器的类加载器中。这些注解会在脚本中的其他类被解析之前先被发现并处理，因此引入的类是可以根据给出的 `@Grab` 注解被正确解析的。

```groovy
import com.jidesoft.swing.JideSplitButton
@Grab(group='com.jidesoft', module='jide-oss', version='[2.2.1,2.3.0]')
public class TestClassAnnotation {
    public static String testMethod () {
        return JideSplitButton.class.name
    }
}
```

<!--
	An appropriate grab(…​) call will be added to the static initializer of the class of the containing class (or script class in the case of an annotated script element).
-->
由此，对应的 `grab` 方法调用会被自动放入到包含该注解的类的静态初始代码中（如果被注解的是脚本元素，那么该方法调用就会被放入到脚本类的静态初始代码中）。

### 3.2 多个 Grape 注解

<!--
	In order to use a Grape annotation multiple times on the same node you must use the @Grapes annotation, e.g.:
-->
如果需要在一个代码节点上放入多个 Grape 注解，你需要像下面的示例那样使用 `@Grapes` 注解：

```groovy
@Grapes([
   @Grab(group='commons-primitives', module='commons-primitives', version='1.0'),
   @Grab(group='org.ccil.cowan.tagsoup', module='tagsoup', version='0.9.7')])
class Example {
// ...
}
```

<!--
	Otherwise you’ll encounter the following error:
-->
否则你会遇到下面这样的错误：

```
Cannot specify duplicate annotation on the same member
```

### 3.3 方法调用

<!--
	Typically a call to grab will occur early in the script or in class initialization. This is to insure that the libraries are made available to the ClassLoader before the groovy code relies on the code. A couple of typical calls may appear as follows:
-->
一般来讲对 `grab` 方法的调用应被放入到脚本的首部或者类的初始化代码中，以确保代码在对某些库产生实际依赖之前这些库已经被正确载入到类加载器中。下面的示例给出了两种常见的 `grab` 方法调用方式：

```groovy
import groovy.grape.Grape
// random maven library
Grape.grab(group:'com.jidesoft', module:'jide-oss', version:'[2.2.0,)')
Grape.grab([group:'org.apache.ivy', module:'ivy', version:'2.0.0-beta1', conf:['default', 'optional']],
     [group:'org.apache.ant', module:'ant', version:'1.7.0'])
```

<!--
	- Multiple calls to grab in the same context with the same parameters should be idempotent. However, if the same code is called with a different ClassLoader context then resolution may be re-run.
	- If the args map passed into the grab call has an attribute noExceptions that evaluates true no exceptions will be thrown.
	- grab requires that a RootLoader or GroovyClassLoader be specified or be in the ClassLoader chain of the calling class. By default failure to have such a ClassLoader available will result in module resolution and an exception being thrown
	  - The ClassLoader passed in via the classLoader: argument and it’s parent classloaders.
	  - The ClassLoader of the object passed in as the referenceObject: argument, and it’s parent classloaders.
	  - The ClassLoader of the class issuing the call to grab
-->

- 给定相同的上下文，使用相同的参数多次调用 `grab` 方法应该是幂等的。然而，如果该调用发生在不同的 `ClassLoader` 上下文之下，那么对库的解析操作则可能被重新执行
- 如果传给 `grab` 方法的 `args` 映射包含值为真的 `noExceptions` 属性，那么 `grab` 方法不会抛出任何错误
- 调用 `grab` 方法需要显式给出或在调用类的 `ClassLoader` 链中包含一个 `RootLoader` 或 `GroovyClasLoader`。默认情况下，找不到这样一个 `ClassLoader` 会导致模块解析失败并抛出一个错误。Groovy 会在在下述位置依次尝试寻找所需的类加载器：
  - 通过 `classLoader` 参数传入的类加载器及其父类加载器
  - 通过 `referenceObject` 参数传入的对象的类加载器及其父类加载器
  - 调用 `grab` 方法的类的类加载器
  
#### 3.3.1 `grab(HashMap)` 参数

<!--
	- group: - <String> - Which module group the module comes from. Translates directly to a Maven groupId. Any group matching /groovy(|\..|x|x\..)/ is reserved and may have special meaning to the groovy endorsed modules.
	- module: - <String> - The name of the module to load. Translated directly to a Maven artifactId.
	- version: - <String> and possibly <Range> - The version of the module to use. Either a literal version `1.1-RC3' or an Ivy Range `[2.2.1,)' meaning 2.2.1 or any greater version).
	- classifier: - <String> - The Maven classifier to resolve by.
	- conf: - <String>, default default' - The configuration or scope of the module to download. The default conf is `default: which maps to the maven runtime and master scopes.
	- force:- <boolean>, defaults true - Used to indicate that this revision must be used in case of conflicts, independently of
	- conflicts manager
	- changing: - <boolean>, default false - Whether the artifact can change without it’s version designation changing.
	- transitive: - <boolean>, default true - Whether to resolve other dependencies this module has or not.
-->

- `group`: `String`，模块所属的模块组。直接对应于 Maven 的 `groupId`。任何匹配 `/groovy(|\..|x|x\..)/` 的模块组都被 Groovy 保留且可能对 Groovy 模块有特殊的含义
- `module`：`String`，所需模块的名称。直接对应于 Maven 的 `artifactId`
- `version`：`String` 或 `Range`，所需模块的版本号。可为实际版本号 `'1.1-RC3'` 或 Ivy `Range` `[2.2.1,)`，即 `2.2.1` 版或更高
- `force`：`boolean`，默认为真，用于指明当冲突发生时，
















