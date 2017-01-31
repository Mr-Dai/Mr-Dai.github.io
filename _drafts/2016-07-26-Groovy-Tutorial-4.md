---
layout: post_translated
title: Groovy 教程 - Grape 依赖管理
author: Robert Peng
category: Groovy
org_title: "Groovy Getting Started - The Grape dependency manager"
org_url: "http://www.groovy-lang.org/grape.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushBash.js"></script>
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushGroovy.js"></script>

## 1 快速入门

### 1.1 添加依赖

<!-- Grape is a JAR dependency manager embedded into Groovy. Grape lets you quickly add maven repository dependencies to your classpath, making scripting even easier. The simplest use is as simple as adding an annotation to your script: -->
Grape 是 Groovy 内置的一个 JAR 依赖管理系统。Grape 可以让你快速地将 Maven 库依赖添加到类路径中，使得脚本编写变得更加容易。最简单的使用方式仅仅只需要在你的脚本中添加一个注解：

<pre class="brush: groovy">
@Grab(group='org.springframework', module='spring-orm', version='3.2.5.RELEASE')
import org.springframework.jdbc.core.JdbcTemplate
</pre>

<!-- @Grab also supports a shorthand notation: -->
`@Grab` 还支持另一种便捷写法：

<pre class="brush: groovy">
@Grab('org.springframework:spring-orm:3.2.5.RELEASE')
import org.springframework.jdbc.core.JdbcTemplate
</pre>

<!-- Note that we are using an annotated import here, which is the recommended way. You can also search for dependencies on mvnrepository.com and it will provide you the @Grab annotation form of the pom.xml entry. -->
注意这里我们使用的是一个带注解的引入语句，而这样是最好的做法。你还可以在 [mvnrepository.com](http://mvnrepository.com/) 上搜索依赖，而它能给出所有 `pom.xml` 项的 `@Grab` 注解形式。

### 1.2 声明其他库

<!-- Not all dependencies are in maven central. You can add new ones like this: -->
并不是所有依赖都存在于 Maven 中心库。你可以这样添加一个新的库：

<pre class="brush: groovy">
@GrabResolver(name='restlet', root='http://maven.restlet.org/')
@Grab(group='org.restlet', module='org.restlet', version='1.1.6')
</pre>

### 1.3 Maven 分类器

<!-- Some maven dependencies need classifiers in order to be able to resolve. You can fix that like this: -->
某些 Maven 依赖需要添加分类器才能被成功解析。你可以这样添加分类器：

<pre class="brush: groovy">
@Grab(group='net.sf.json-lib', module='json-lib', version='2.2.3', classifier='jdk15')
</pre>

### 1.4 排除间接依赖

<!-- Sometimes you will want to exclude transitive dependencies as you might be already using a slightly different but compatible version of some artifact. You can do this as follows: -->
有时可能你已经添加了另一个有点不同但又相互兼容的依赖使得你需要排除某些间接依赖。你可以这样做：

<pre class="brush: groovy">
@Grab('net.sourceforge.htmlunit:htmlunit:2.8')
@GrabExclude('xml-apis:xml-apis')
</pre>

### 1.5 JDBC 驱动

<!-- Because of the way JDBC drivers are loaded, you’ll need to configure Grape to attach JDBC driver dependencies to the system class loader. I.e: -->
考虑到 JDBC 驱动载入的方式，你需要对 Grape 进行特殊的设置来让它将 JDBC 驱动依赖放入到系统类加载器中，即这样：

<pre class="brush: groovy">
@GrabConfig(systemClassLoader=true)
@Grab(group='mysql', module='mysql-connector-java', version='5.1.6')
</pre>

### 1.6 在 Groovy Shell 里使用 Grape

<!-- From groovysh use the method call variant: -->
在 `groovysh` 中可以调用同名的方法：

<pre class="brush: groovy">
groovy.grape.Grape.grab(group:'org.springframework', module:'spring', version:'2.5.6')
</pre>

### 1.7 代理设置

<!-- If you are behind a firewall and/or need to use Groovy/Grape through a proxy server, you can specify those settings on the command like via the http.proxyHost and http.proxyPort system properties: -->
如果你的设备处于防火墙之后，或者你需要通过一个代理服务器来让 Groovy 或 Grape 访问外部网络的话，你可以在命令行设置 `http.proxyHost` 和 `http.proxyPort` 系统属性：

<pre class="brush: bash">
groovy -Dhttp.proxyHost=yourproxy -Dhttp.proxyPort=8080 yourscript.groovy
</pre>

<!-- Or you can make this system wide by adding these properties to your JAVA_OPTS environment variable: -->
或者你也可以将这些设置添加到 `JAVA_OPTS` 环境变量中来让其在全系统中生效：

<pre class="brush: bash">
JAVA_OPTS = -Dhttp.proxyHost=yourproxy -Dhttp.proxyPort=8080
</pre>

### 1.8 日志

<!-- If you want to see what Grape is doing set the system property groovy.grape.report.downloads to true (e.g. add -Dgroovy.grape.report.downloads=true to invocation or JAVA_OPTS) and Grape will print the following infos to System.error: -->
如果你想要知道 Grape 都会做些什么，你可以将系统属性 `groovy.grape.repost.downloads` 设置为 `true`（也就是在启动脚本的命令行或者 `JAVA_OPTS` 中添加 `-Dgroovy.grape.report.downloads=true`），如此一来 Grape 便会将如下信息输出至 `System.error`：

- 开始解析依赖
- 开始下载包
- 重新尝试下载包
- 下载包的大小和下载时间

<!-- To log with even more verbosity, increase the Ivy log level (defaults to -1). For example -Divy.message.logger.level=4. -->
如果想让日志输出更多的信息，你可以提高 Ivy 的日志等级（默认为 `-1`），例如 `-Divy.message.logger.level=4`。

## 2 细节

<!-- Grape (The Groovy Adaptable Packaging Engine or Groovy Advanced Packaging Engine) is the infrastructure enabling the grab() calls in Groovy, a set of classes leveraging Ivy to allow for a repository driven module system for Groovy. This allows a developer to write a script with an essentially arbitrary library requirement, and ship just the script. Grape will, at runtime, download as needed and link the named libraries and all dependencies forming a transitive closure when the script is run from existing repositories such as JCenter, Ibiblio and java.net. -->
Grape，又称为 Groovy 可适应包装引擎（Groovy Adaptable Packaging Engine）或 Groovy 高级包装引擎（Groovy Advanced Packaging Engine），即为在 Groovy 背后支撑 `grab()` 调用的框架，包含一系列的不同的类，利用 [Ivy](http://ant.apache.org/ivy/) 为 Groovy 实现了一个由依赖库驱动的模块系统。这使得开发者可以在自己编写的脚本中使用任意的库依赖而只需要对自己的脚本进行分发。Grape 会在运行时下载所有需要的依赖，并能够在脚本从某些如 JCenter、Ibiblio 和 java.net 这些已存在的库中运行时把声明的库以其它们的依赖连接起来形成一个传递闭包。

<!-- Grape follows the Ivy conventions for module version identification, with naming change. -->
Grape 仍使用 Ivy 的规范来对模块版本进行区分，尽管部分名称有所改变：

- `group`：模块所来自的模块组。会被直接翻译为 Maven 的 `groupId` 或者 Ivy Organization。任何匹配 `/groovy[x][\..*]^/` 的模块组名都属于保留字且对于 Groovy 自带的模块可能有其他特殊含义。
- `module`：需要载入的模块名。会被直接翻译为 Maven 的 `artifactId` 或者 Ivy artifact。
- `version`：所使用的模块的版本。可以是版本号字面量如 `1.1-RC3` 或者 Ivy 版本区间如 `[2.2.1,)`（即 2.2.1 或更高的版本）。
- `classifier`：可使用的分类器（如 `jdk15`）

<!-- The downloaded modules will be stored according to Ivy’s standard mechanism with a cache root of ~/.groovy/grape -->
被下载的模块会按照 Ivy 的标准机制缓存在 `~/.groovy/grape` 目录下。

## 3 使用

### 3.1 注解

<!-- One or more groovy.lang.Grab annotations can be added at any place that annotations are accepted to tell the compiler that this code relies on the specific library. This will have the effect of adding the library to the classloader of the groovy compiler. This annotation is detected and evaluated before any other resolution of classes in the script, so imported classes can be properly resolved by a @Grab annotation. -->
`groovy.lang.Grab` 注解可被添加至任何可添加注解的位置以告诉编译器这些代码依赖于某个特定的库。这样会使得库被添加到 Groovy 编译器的类加载器中。该注解会在脚本文件中的类被解析之前就被发现并处理，因此引入的类也可以由 `@Grab` 注解而正确地解析。

<pre class="brush: groovy">
import com.jidesoft.swing.JideSplitButton
@Grab(group='com.jidesoft', module='jide-oss', version='[2.2.1,2.3.0)')
public class TestClassAnnotation {
    public static String testMethod () {
        return JideSplitButton.class.name
    }
}
</pre>
