---
layout: posts
title: Gradle 学习笔记
author: Robert Peng
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushGroovy.js"></script>

本文为我个人的 Gradle 学习笔记，包含了 [Gradle User Guide](https://docs.gradle.org/current/userguide/userguide.html) 各章节的重点归纳。归纳的内容从 User Guide 的第 4 章开始。

## 4 使用 Gradle 命令行

### 4.1 执行多个任务

在使用 Gradle 时，可以如命令 <kbd>gradle compile test</kbd> 这般指定执行多个 Gradle 任务，Gradle 会按照指定的顺序指定这些任务以及它们的以来任务。在执行时，Gradle 也会合理地绘制任务依赖 DAG，以确保被多个任务依赖的任务只执行一次。

除此之外，在代码示例 4.1 中看到我们可以使用 `<<` 运算符为某些默认任务追加逻辑：

<pre class="brush: groovy">
task compile &lt;&lt; {
    println 'compiling source'
}

task compileTest(dependsOn: compile) &lt;&lt; {
    println 'compiling unit tests'
}

task test(dependsOn: [compile, compileTest]) &lt;&lt; {
    println 'running unit tests'
}

task dist(dependsOn: [compile, test]) &lt;&lt; {
    println 'building the distribution'
}
</pre>

### 4.2 排除任务

通过 <kbd>-x</kbd> 命令行选项可以在构建时排除指定的任务。被排除的任务不会被执行，同样其他依赖该任务的任务也不会被执行。

<pre>
> gradle dist -x test
:compile
compiling source
:dist
building the distribution

BUILD SUCCESSFUL

Total time: 1 secs
</pre>

### 4.3 在任务失败后继续构建

在默认情况下，Gradle 会在某个任务执行失败后立刻停止执行。使用 <kbd>--continue</kbd> 选项可以使 Gradle 继续执行其它不相关的任务，但当一个任务执行失败后，其它依赖它的任务仍然不会被执行。

### 4.4 任务名称缩写

在 Gradle 命令行中指定任务并不需要给出任务的全名，只要给出任务的前面几个字母足够给 Gradle 确定唯一的任务即可。如 `dist` 任务的执行可写作 <kbd>gradle d</kbd>。

对于使用驼峰命名法的任务我们还可以给出任务名每个单词的缩写，如 `compileTest` 任务可写作 <kbd>compTest</kbd> 甚至 <kbd>cT</kbd>。

任务名称缩写同样可用于前面提到的 `-x` 参数。

### 4.5 选择要执行的构建

执行 <kbd>gradle</kbd> 指令时，Gradle 会在当前路径下查找构建文件。我们还可以使用 <kbd>-b</kbd> 参数指定其他构建文件。但需要注意的是，使用了 <kbd>-b</kbd> 参数后 `settings.gradle` 文件便不会被使用。

除此之外，我们还可以通过 <kbd>-p</kbd> 来指定所使用的项目目录，对于多项目构建而言这是更好的做法。

### 4.6 强制任务执行

需要 Gradle 任务都支持增性构建：当它们检测到输入与输出和上一次执行相比没有发生变化时便会不执行，并在执行 <kbd>gradle</kbd> 命令时显示为 `UP-TO-DATE`。我们可以通过使用 <kbd>--rerun-tasks</kbd> 选项来强制执行所需的所有任务。

### 4.7 获取构建的相关信息

#### 4.7.1 显示所有项目

执行 <kbd>gradle projects</kbd> 即可显示所选项目的所有子项目，并显示各个项目的描述。项目的描述可在各个项目的 `build.gradle` 内通过修改项目的 `description` 属性进行设置：

<pre class="brush: groovy">
description = 'The shared API for the application'
</pre>

#### 4.7.2 显示所有任务

执行 <kbd>gradle tasks</kbd> 即可显示所选项目的所有主要任务，包括项目的默认任务以及每个任务的描述。

默认情况下，该指令只会显示那些被赋予了分组的任务。任务的分组和描述可以分别通过修改其 `group` 和 `description` 属性进行设置：

<pre class="brush: groovy">
dists {
    description = 'Builds the distribution'
    group = 'build'
}
</pre>

你也可以使用 <kbd>--all</kbd> 选项，如此便会显示所有分组和未分组的任务以及各个任务的依赖。

#### 4.7.3 查看任务的具体使用方法

通过执行 <kbd>gradle help --task someTask</kbd> 即可查看吻合给定任务名的所有任务的详细信息。这些信息包括其完整任务路径、任务类型、可用的命令行参数以及任务的描述。

#### 4.7.4 显示任务的依赖

使用 <kbd>gradle dependencies</kbd> 可以查看每个任务的依赖，其直接与间接的依赖将以树状的形式显示。

由于所有任务的所有依赖加起来可能会包含大量的输出信息，因此可以使用 <kbd>--configuration</kbd> 参数查看指定配置的依赖。

<pre>
> gradle -q api:dependencies --configuration testCompile

------------------------------------------------------------
Project :api - The shared API for the application
------------------------------------------------------------

testCompile
\--- junit:junit:4.12
     \--- org.hamcrest:hamcrest-core:1.3
</pre>

#### 4.7.5 显示项目的构建脚本依赖

运行指令 <kbd>gradle buildEnvironment</kbd> 可以显示项目的构建脚本依赖，显示的格式与 <kbd>gradle dependencies</kbd> 类似。

#### 4.7.6 查看具体依赖的详细信息

运行指令 <kbd>gradle dependencyInsight</kbd> 即可查看具体依赖的指定信息：

<pre>
> gradle -q webapp:dependencyInsight --dependency groovy --configuration compile
org.codehaus.groovy:groovy-all:2.4.7
\--- project :api
     \--- compile
</pre>

该指令可用于查看某个具体的依赖包是从如何被解析出来的。在使用该指令时，我们需要像上述示例那样通过 <kbd>--dependency</kbd> 和 <kbd>--configuration</kbd> 参数指定要查看的依赖和配置。

#### 4.7.7 显示所有项目属性

执行 <kbd>gradle properties</kbd> 可以查看项目的所有属性：

<pre>
> gradle -q api:properties

------------------------------------------------------------
Project :api - The shared API for the application
------------------------------------------------------------

allprojects: [project ':api']
ant: org.gradle.api.internal.project.DefaultAntBuilder@12345
antBuilderFactory: org.gradle.api.internal.project.DefaultAntBuilderFactory@12345
artifacts: org.gradle.api.internal.artifacts.dsl.DefaultArtifactHandler_Decorated@12345
asDynamicObject: DynamicObject for project ':api'
baseClassLoaderScope: org.gradle.api.internal.initialization.DefaultClassLoaderScope@12345
buildDir: /home/user/gradle/samples/userguide/tutorial/projectReports/api/build
buildFile: /home/user/gradle/samples/userguide/tutorial/projectReports/api/build.gradle
</pre>

#### 4.7.8 构建报告

在执行构建时使用 <kbd>--profile</kbd> 选项即可在构建后于 `build/reports/profile` 处生成构建报告。报告的内容包括从配置到任务执行等各个阶段所花的时间。

### 4.8 构建预演

在构建时使用 <kbd>-m</kbd> 选项可进入构建预演模式，会显示此次构建会以何种顺序执行哪些任务，但不会执行这些任务。

### 4.9 总结

有关 Gradle 命令行的详细介绍可参阅[附录 D：Gradle 命令行](https://docs.gradle.org/current/userguide/gradle_command_line.html)。

## 5 Gradle Wrapper

在分发项目源代码时，源代码中可以放入特定版本的 Gradle Wrapper。此举的好处有两点：

- 避免代码用户因所使用的 Gradle 版本不同导致构建出错
- 使我们无需对所使用的持续构建服务器做过多的配置

### 5.1 使用 Gradle Wrapper 执行构建

对于安装了 Gradle Wrapper 的项目，我们应使用 <kbd>gradlew &lt;task></kbd> 对其执行构建，其中命令 `gradlew` 的使用方法和 `gradle` 完全一致。

Gradle Wrapper 的所有文件包括如下，注意不要让版本控制系统忽略这些文件：

- `gradlew`（Unix Shell 脚本）
- `gradlew.bat`（Windows 批处理文件）
- `gradle/wrapper/gradle-wrapper.jar`（Wrapper 的 JAR）
- `gradle/wrapper/gradle-wrapper.properties`（Wrapper 的 properties 文件）

（译者注：可考虑让版本控制系统忽略 `.gradle` 文件夹）

在执行的过程中，`gradlew` 会把指定版本的 Gradle 下载至 `$USER_HOME/.gradle/wrapper/dists` 并执行。

### 5.2 为项目安装 Wrapper

执行 <kbd>gradle wrapper</kbd> 即可为项目安装 Gradle Wrapper。在执行该指令时，我们可以通过参数 <kbd>--gradle-version</kbd> 和 <kbd>--gradle-distribution-url</kbd> 配置需要安装的 Wrapper 的版本和下载 Gradle 的路径。默认安装的 Wrapper 版本与安装时所使用的 Gradle 版本相同。

除此之外，我们还可以在构建脚本中配置一个 [`Wrapper`](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.wrapper.Wrapper.html) 任务，如通过设置属性 `gradleVersion` 来改变默认的 Wrapper 版本：

<pre class="brush: groovy">
task wrapper(type: Wrapper) {
    gradleVersion = '2.0'
}
</pre>

有关 `Wrapper` 任务的更多配置方式，请查阅 `Wrapper` 的 [API 文档](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.wrapper.Wrapper.html)。
