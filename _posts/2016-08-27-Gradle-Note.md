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

（译者注：在 Gradle 安装目录的 `bin` 文件夹里实际上只有 `gradle` 一个可执行文件，因此所有的 Gradle 功能只能通过 `gradle` 命令或是后面提到的 `gradlew` 命令来执行）

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

## 6 Gradle 守护线程

### 6.1 为何要使用 Gradle 守护线程

启动 Gradle 进行项目构建的过程首先涉及到 JVM 的启动，同时 Gradle 依赖的一些库也需要比较长的时间进行初始化，这就使得启动 Gradle 进行构建首先需要等待其进行初始化。

解决的办法就是使用一个持续在后台运行的 Gradle 守护线程，每一次都将构建任务提交至该守护线程便可跳过这些初始化。除此之外，守护线程还会对项目的如依赖 DAG 等信息进行缓存，更进一步地缩小构建所需的时间。

在使用 `--profile` 选项生成构建报告时可以在报告中看到守护线程可以为构建节省多少时间。

从 3.0 版本开始，Gradle 守护线程将会默认开启。（译者注：实际上是如果 `gradle` 命令发现守护线程不存在便会自动开启守护线程）

### 6.2 检查守护线程的状态

使用 <kbd>--status</kbd> 选项即可查看所有守护线程的状态。

### 6.3 关闭守护线程功能

永久关闭守护线程功能的方式有两种：

- 将标识 `-Dorg.gradle.daemon=false` 添加至 `GRADLE_OPTS` 环境变量
- 将代码 `org.gradle.daemon=false` 添加至属性文件 `$GRADLE_USER_HOME/gradle.properties`

其中，`GRADLE_USER_HOME` 变量的默认值为 `$USER_HOME/.gradle`。该值可以通过 <kbd>-g</kbd> 或 <kbd>--gradle-user-home</kbd> 命令行参数进行设置，或是直接修改 `GRADLE_USER_HOME` 环境变量或 `org.gradle.user.home` JVM 系统属性。

在 Windows 中执行如下指令可为当前用户关闭守护线程功能：

```
(if not exist "%USERPROFILE%/.gradle" mkdir "%USERPROFILE%/.gradle") && (echo org.gradle.daemon=false >> "%USERPROFILE%/.gradle/gradle.properties")
```

类 Unix 系统则可通过如下 Bash 指令为当前用户关闭守护线程功能：

```
mkdir -p ~/.gradle && echo "org.gradle.daemon=false" >> ~/.gradle/gradle.properties
```

在构建时，我们还可以通过 <kbd>--daemon</kbd> 和 <kbd>--no-daemon</kbd> 选项来显式地声明此次构建是否要使用守护线程。

### 6.4 关闭正在运行的守护线程

每个 Gradle 守护线程在闲置时都会不断对比自己占用的内存和系统剩余的内存，并在剩余内存不多时关闭自己以释放内存。因此在大多数时候我们不需要手动关闭守护线程。

不过，我们也可以通过指令 <kbd>gradle --stop</kbd> 关闭所有 Gradle 守护线程。

### 6.6 何时不该使用 Gradle 守护线程

我们应在开发环境里使用 Gradle 守护线程来加速构建，但在持续整合服务器上，稳定性才是至关重要的，这时我们就应关闭 Gradle 守护线程功能，确保不同的构建之间是完全相互独立的。

## 7 依赖管理基础

本章内容只是对 Gradle 的依赖管理系统进行了浅显的介绍，在用户手册靠后的章节中会对依赖管理系统的不同部分进行详细的阐述，本章中也会给出具体的链接。

### 7.2 声明依赖

先看一个示例 `build.gradle`：

<pre class="brush: groovy">
apply plugin: 'java'

repositories {
    mavenCentral()
}

dependencies {
    compile group: 'org.hibernate', name: 'hibernate-core', version: '3.6.7.Final'
    testCompile group: 'junit', name: 'junit', version: '4.+'
}
</pre>

这个示例实际上就包含了声明依赖的几个基本元素。

### 7.3 依赖配置

Gradle 会根据依赖所赋予的配置（Configuration）对其进行分组。对于 Java 项目所使用的 Java 插件来说，插件本身定义了的依赖配置即为 Java 程序编译到运行的几个生命周期。常用的包括：

- `compile`：编译项目源文件所需的依赖
- `runtime`：运行项目所需的依赖。默认包含上述的编译时依赖
- `testCompile`：编译项目测试源文件所需的依赖。默认包含上述的编译时依赖和项目源文件编译后产生的类文件
- `testRuntime`：运行项目测试所需的依赖。默认包含上述的编译依赖、运行依赖和测试编译依赖

有关 Java 插件定义的依赖配置的更多内容详见[表 45.5](https://docs.gradle.org/current/userguide/java_plugin.html#tab:configurations)。

有关依赖配置的更多内容详见 [23.3 小节](https://docs.gradle.org/current/userguide/dependency_management.html#sub:configurations)。

### 7.4 外部依赖

我们可以通过属性 `group`、`name` 和 `version` 为 Gradle 唯一地指定外部依赖：

<pre class="brush: groovy">
dependencies {
    compile group: 'org.hibernate', name: 'hibernate-core', version: '3.6.7.Final'
}
</pre>

或者我们也可以将其简写为 `group:name:version` 的形式：

<pre class="brush: groovy">
dependencies {
    compile 'org.hibernate:hibernate-core:3.6.7.Final'
}
</pre>

有关声明依赖的更多内容详见 [23.4 小节](https://docs.gradle.org/current/userguide/dependency_management.html#sec:how_to_declare_your_dependencies)。

### 7.5 库

Gradle 需要在 `build.gradle` 脚本中为 `Project.repositories` 属性进行设置，指定用于下载依赖的远程库。
常用的设置方式包括如下几种：

<table class="table">
	<tr>
		<th>库类型</th>
		<th>构建脚本</th>
	</tr>
	<tr>
		<td>Maven 中心库</td>
		<td>
<pre class="brush: groovy">
repositories {
    mavenCentral()
}
</pre>
		</td>
	</tr>
	<tr>
		<td>JCenter 库</td>
		<td>
<pre class="brush: groovy">
repositories {
    jcenter()
}
</pre>
		</td>
	</tr>
	<tr>
		<td>自定义的远程 Maven 库</td>
		<td>
<pre class="brush: groovy">
repositories {
    maven {
        url "http://repo.mycompany.com/maven2"
    }
}
</pre>
		</td>
	</tr>
	<tr>
		<td>自定义的远程 Ivy 库</td>
		<td>
<pre class="brush: groovy">
repositories {
    ivy {
        url "http://repo.mycompany.com/repo"
    }
}
</pre>
		</td>
	</tr>
	<tr>
		<td>本地 Ivy 库</td>
		<td>
<pre class="brush: groovy">
repositories {
    ivy {
        // URL can refer to a local directory
        url "../local-repo"
    }
}
</pre>
		</td>
	</tr>
</table>

有关库的更多内容详见 [23.6 小节](https://docs.gradle.org/current/userguide/dependency_management.html#sec:repositories)。

### 7.6 发布程序包

Gradle 同样可以像 Maven 那样发布程序包。要做到这一点，我们需要将需要发布至的目标库定义到 `uploadArchives` 任务中：

<table class="table">
	<tr>
		<th>目标库类型</th>
		<th>构建脚本</th>
	</tr>
	<tr>
		<td>Maven 库</td>
		<td>
<pre class="brush: groovy">
apply plugin: 'maven'

uploadArchives {
    repositories {
        mavenDeployer {
            repository(url: "file://localhost/tmp/myRepo/")
        }
    }
}	
</pre>
		</td>
	</tr>
	<tr>
		<td>Ivy 库</td>
		<td>
<pre class="brush: groovy">
uploadArchives {
    repositories {
        ivy {
            credentials {
                username "username"
                password "pw"
            }
            url "http://repo.mycompany.com"
        }
    }
}
</pre>
		</td>
	</tr>
</table>

而后执行 `uploadArchives` 任务，Gradle 便会构建项目并上传生成的程序包。

## 8 多项目构建

### 8.1 多项目构建的基本结构

部分项目可能包含多个子项目或子模块，子项目相互之间存在一定的依赖关系。构建这样的项目则需要 Gradle 支持多项目构建。

通常，一个多项目构建包括如下几个基本元素：

- 在项目根目录存在一个 `settings.gradle` 文件和一个 `build.gradle`
- 每个子项目的根目录存在各自的 `*.gradle` 构建文件

其中 `settings.gradle` 包含了项目所含子项目以及各个子项目所处位置的信息。除了直接阅读 `settings.gradle`，我们也可以通过执行 <kbd>gradle projects</kbd> 指令来查看项目下的所有子项目。

在默认情况下，Gradle 会将 `settings.gradle` 所处文件夹的名称作为根项目的名称，但部分持续构建服务器有可能会在构建时自动生成该文件夹名称，因此更好的做法是在 `settings.gradle` 中设置 `rootProject.name` 属性。

根目录的 `build.gradle` 用于进行各个子项目共享的设置，例如声明每个子项目都会使用的插件和依赖。

值得注意的是，子项目各自的 `*.gradle` 构建文件的名称有可能不是 `build.gradle`。另一种比较常见的做法是将其以子项目名称命名，如 `api.gradle` 或 `service.gradle`。


### 8.2 执行多项目构建

对于一个项目源代码用户来说，构建包含多个子项目的项目实际上本质上也是通过 Gradle 执行不同的任务，不过控制具体执行哪个任务的方式则有所不同。我们有两种做法：

- 进入你感兴趣的子项目所属的目录并像平常那样通过指令 <kbd>gradle &lt; task></kdb> 执行你想要的任务
- 在任意目录下使用任务的限定名称来执行，如 <kbd>gradle :services:webservice:build</kbd>

对于第一种执行方式，Gradle 实际上会执行当前目录下所有子目录所包含的所有子项目的同名任务。比如执行命令 <kbd>gradle test</kbd> 则会执行所有相对于当前目录的子项目的 `test` 任务。

值得注意的是，使用这种执行方式时，调用 Gradle Wrapper 的方式需要进行一定的调整，因为 Gradle Wrapper 对应的 `gradlew` 执行文件是位于根目录下的，因此在执行时你可能需要输入像 <kbd>../../gradlew build</kbd> 这样的命令。

对于第二种方式，任务的限定名称结构和 Java 类的限定名类似，只是以冒号 `:` 作为分隔符，同时以一个起始的冒号指代根项目。

