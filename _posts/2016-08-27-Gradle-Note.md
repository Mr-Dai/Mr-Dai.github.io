---
layout: post_original
title: Gradle 学习笔记
author: Robert Peng
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushGroovy.js"></script>

本文为我个人的 Gradle 学习笔记，包含了 [Gradle User Guide](https://docs.gradle.org/current/userguide/userguide.html) 各章节的重点归纳。归纳的内容从 User Guide 的第 4 章开始。

本文的章节顺序有所调整以方便阅读。笔记会先从使用已有的 Gradle 项目开始，然后进入创建新的 Gradle 项目的部分。在创建项目的部分则会先以 Java 项目为例，再延伸到其他 JVM 语言项目。

## 4 使用 Gradle 命令行

### 4.1 执行多个任务

在使用 Gradle 时，可以如命令 <kbd>gradle compile test</kbd> 这般指定执行多个 Gradle 任务，Gradle 会按照指定的顺序指定这些任务以及它们的以来任务。在执行时，Gradle 也会合理地绘制任务依赖 DAG，以确保被多个任务依赖的任务只执行一次。

（译者注：在 Gradle 安装目录的 `bin` 文件夹里实际上只有 `gradle` 一个可执行文件，因此所有的 Gradle 功能只能通过 `gradle` 命令或是后面提到的 `gradlew` 命令来执行）

除此之外，在代码示例 4.1 中看到我们可以使用 `<<` 运算符为某些默认任务追加逻辑：

```groovy
task compile << {
    println 'compiling source'
}

task compileTest(dependsOn: compile) << {
    println 'compiling unit tests'
}

task test(dependsOn: [compile, compileTest]) << {
    println 'running unit tests'
}

task dist(dependsOn: [compile, test]) << {
    println 'building the distribution'
}
```

### 4.2 排除任务

通过 <kbd>-x</kbd> 命令行选项可以在构建时排除指定的任务。被排除的任务不会被执行，同样其他依赖该任务的任务也不会被执行。

```
> gradle dist -x test
:compile
compiling source
:dist
building the distribution

BUILD SUCCESSFUL

Total time: 1 secs
```

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

```groovy
description = 'The shared API for the application'
```

#### 4.7.2 显示所有任务

执行 <kbd>gradle tasks</kbd> 即可显示所选项目的所有主要任务，包括项目的默认任务以及每个任务的描述。

默认情况下，该指令只会显示那些被赋予了分组的任务。任务的分组和描述可以分别通过修改其 `group` 和 `description` 属性进行设置：

```groovy
dists {
    description = 'Builds the distribution'
    group = 'build'
}
```

你也可以使用 <kbd>--all</kbd> 选项，如此便会显示所有分组和未分组的任务以及各个任务的依赖。

#### 4.7.3 查看任务的具体使用方法

通过执行 <kbd>gradle help --task someTask</kbd> 即可查看吻合给定任务名的所有任务的详细信息。这些信息包括其完整任务路径、任务类型、可用的命令行参数以及任务的描述。

#### 4.7.4 显示任务的依赖

使用 <kbd>gradle dependencies</kbd> 可以查看每个任务的依赖，其直接与间接的依赖将以树状的形式显示。

由于所有任务的所有依赖加起来可能会包含大量的输出信息，因此可以使用 <kbd>--configuration</kbd> 参数查看指定配置的依赖。

```
> gradle -q api:dependencies --configuration testCompile

------------------------------------------------------------
Project :api - The shared API for the application
------------------------------------------------------------

testCompile
\--- junit:junit:4.12
     \--- org.hamcrest:hamcrest-core:1.3
```

在执行 `gradle` 命令时使用 <kbd>-q</kbd> 命令行参数可以去除 Gradle 的日志信息，只保留任务本身的输出。有关 Gradle 日志的更多信息详见 [22 章](https://docs.gradle.org/current/userguide/logging.html)。

#### 4.7.5 显示项目的构建脚本依赖

运行指令 <kbd>gradle buildEnvironment</kbd> 可以显示项目的构建脚本依赖，显示的格式与 <kbd>gradle dependencies</kbd> 类似。

#### 4.7.6 查看具体依赖的详细信息

运行指令 <kbd>gradle dependencyInsight</kbd> 即可查看具体依赖的指定信息：

```
> gradle -q webapp:dependencyInsight --dependency groovy --configuration compile
org.codehaus.groovy:groovy-all:2.4.7
\--- project :api
     \--- compile
```

该指令可用于查看某个具体的依赖包是从如何被解析出来的。在使用该指令时，我们需要像上述示例那样通过 <kbd>--dependency</kbd> 和 <kbd>--configuration</kbd> 参数指定要查看的依赖和配置。

#### 4.7.7 显示所有项目属性

执行 <kbd>gradle properties</kbd> 可以查看项目的所有属性：

```
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
```

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

对于安装了 Gradle Wrapper 的项目，我们应使用 <kbd>gradlew <task></kbd> 对其执行构建，其中命令 `gradlew` 的使用方法和 `gradle` 完全一致。

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

```groovy
task wrapper(type: Wrapper) {
    gradleVersion = '2.0'
}
```

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

## 7 依赖管理入门

本章内容只是对 Gradle 的依赖管理系统进行了浅显的介绍，在用户手册靠后的章节中会对依赖管理系统的不同部分进行详细的阐述，本章中也会给出具体的链接。

### 7.2 声明依赖

先看一个示例 `build.gradle`：

```groovy
apply plugin: 'java'

repositories {
    mavenCentral()
}

dependencies {
    compile group: 'org.hibernate', name: 'hibernate-core', version: '3.6.7.Final'
    testCompile group: 'junit', name: 'junit', version: '4.+'
}
```

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

```groovy
dependencies {
    compile group: 'org.hibernate', name: 'hibernate-core', version: '3.6.7.Final'
}
```

或者我们也可以将其简写为 `group:name:version` 的形式：

```groovy
dependencies {
    compile 'org.hibernate:hibernate-core:3.6.7.Final'
}
```

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
```groovy
repositories {
    mavenCentral()
}
```
		</td>
	</tr>
	<tr>
		<td>JCenter 库</td>
		<td>
```groovy
repositories {
    jcenter()
}
```
		</td>
	</tr>
	<tr>
		<td>自定义的远程 Maven 库</td>
		<td>
```groovy
repositories {
    maven {
        url "http://repo.mycompany.com/maven2"
    }
}
```
		</td>
	</tr>
	<tr>
		<td>自定义的远程 Ivy 库</td>
		<td>
```groovy
repositories {
    ivy {
        url "http://repo.mycompany.com/repo"
    }
}
```
		</td>
	</tr>
	<tr>
		<td>本地 Ivy 库</td>
		<td>
```groovy
repositories {
    ivy {
        // URL can refer to a local directory
        url "../local-repo"
    }
}
```
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
```groovy
apply plugin: 'maven'

uploadArchives {
    repositories {
        mavenDeployer {
            repository(url: "file://localhost/tmp/myRepo/")
        }
    }
}	
```
		</td>
	</tr>
	<tr>
		<td>Ivy 库</td>
		<td>
```groovy
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
```
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

- 进入你感兴趣的子项目所属的目录并像平常那样通过指令 <kbd>gradle < task></kdb> 执行你想要的任务
- 在任意目录下使用任务的限定名称来执行，如 <kbd>gradle :services:webservice:build</kbd>

对于第一种执行方式，Gradle 实际上会执行当前目录下所有子目录所包含的所有子项目的同名任务。比如执行命令 <kbd>gradle test</kbd> 则会执行所有相对于当前目录的子项目的 `test` 任务。

值得注意的是，使用这种执行方式时，调用 Gradle Wrapper 的方式需要进行一定的调整，因为 Gradle Wrapper 对应的 `gradlew` 执行文件是位于根目录下的，因此在执行时你可能需要输入像 <kbd>../../gradlew build</kbd> 这样的命令。

对于第二种方式，任务的限定名称结构和 Java 类的限定名类似，只是以冒号 `:` 作为分隔符，同时以一个起始的冒号指代根项目。

## 9 持续构建

在使用 Gradle 命令进行构建时，添加 <kbd>-t</kbd> 或 <kbd>--continuous</kbd> 选项即可打开持续构建模式：在该模式下，Gralde 会持续监控所指定任务的输入，并在输入发生变化时自动重新执行任务。例如在执行 `build` 任务时进入持续构建模式，Gradle 便会在源代码文件发生修改时自动重新构建项目。

值得注意的是，Gradle 只会监控所指定任务的输入，但如构建脚本等文件的修改不会导致 Gradle 自动重新执行任务。

任务可以通过一定的方式声明自己的输入和输出，详见[案例 17.24](https://docs.gradle.org/current/userguide/more_about_tasks.html#incrementalTask)。

## 10 使用 Gradle 图形界面

执行命令 <kbd>gradle --gui</kbd> 即可打开 Gradle 图形界面。注意该命令会一直阻塞直到图形界面退出，因此在 *nix 系统下你可以使用命令 <kbd>gradle --gui &</kbd> 来后台执行。

## 15 构建初始化插件

我们可以使用 Gradle 自带的初始化插件在指定文件夹直接生成一个新的 Gradle 项目。

### 15.1 所执行的任务

该初始化插件为 Gradle 添加了如下任务：

- `wrapper`：[`Wrapper`](https://docs.gradle.org/current/dsl/org.gradle.api.tasks.wrapper.Wrapper.html) 类型的任务，在指定文件夹下生成 Gradle Wrapper
- `init`：[`InitBuild`](https://docs.gradle.org/current/dsl/org.gradle.buildinit.tasks.InitBuild.html) 类型的任务，依赖 `wrapper` 任务，用于生成 Gradle 项目

### 15.2 初始化类型

在执行 `init` 任务时，我们需要使用 `--type` 命令行参数来给出初始化项目的类型。如果没有显式给出类型，Gradle 则会尝试自行推断类型。

支持的类型包括如下。

#### 15.3.1 `pom`

`pom` 类型用于将一个已有的 Maven 项目转换为 Gradle 项目。该类型要求当前文件夹或 `-p` 命令行参数指定的文件夹下包含有效的 POM 文件以及 Maven 相关配置。如果在文件夹下能够找到有效的 POM 文件，Gradle 也会在未显式指定类型时推断出类型为 `pom`。

#### 15.3.2 `java-library`

`java-library` 只能通过显式指定，Gradle 不会自动推断为 `java-library` 类型。

该类型将自动为生成的项目使用 `java` 插件并使用 `jcenter` 依赖库，使用 `JUnit` 作为测试框架并生成基本的源代码和测试代码文件夹。

除此之外，在使用该类型时还可以通过 `--test-framework` 参数指定使用除 [JUnit](http://junit.org/) 以外的测试框架。支持的框架包括：

- [Spock](http://code.google.com/p/spock/)：<kbd>gradle init --type java-library --test-framework spock</kbd>
- [TestNG](http://testng.org/doc/index.html)：<kbd>gradle init --type java-library --test-framework testng</kbd>

#### 15.3.3 `scala-library`

`scala-library` 只能通过显式指定，Gradle 不会自动推断为 `scala-library` 类型。

该类型将自动为生成的项目使用 `scala` 插件并使用 `jcenter` 依赖库，使用 [Scala Test](http://www.scalatest.org/)作为测试框架并生成基本的源代码和测试代码文件夹。除此之外，项目会自动使用 2.10 版本的 Scala 并默认使用 Zinc Scala 编译器。

#### 15.3.4 `groovy-library`

`groovy-library` 只能通过显式指定，Gradle 不会自动推断为 `groovy-library` 类型。

该类型将自动为生成的项目使用 `groovy` 插件并使用 `jcenter` 依赖库，使用 [Spock](http://spockframework.org/)作为测试框架并生成基本的源代码和测试代码文件夹。除此之外，项目会自动使用 2.x 版本的 Groovy。

#### 15.3.5 `basic`

默认的初始化类型，当类型没有被显式给出且无法自动推断为 `pom` 类型时便会使用该类型。此时 Gradle 会创建一个示例 `build.gradle` 文件并在其中放入有用的注释和链接。

## 14 构建脚本入门

### 14.1 项目和任务

在 Gradle 中主要包含两个基本概念：项目（Project）和任务（Task）。项目本身的定义并不明确，取决于你想要做些什么：一个项目可以构建什么东西，也可以部署别的什么东西。一个项目可以包含若干个任务，而一个任务则代表着一个构建可以执行的原子逻辑。

### 14.2 Hello World

这节主要给出了一个构建脚本的 Hello World 示例：

```groovy
task hello {
    doLast {
        println 'Hello world!'
    }
}
```

在这段代码中调用了 `Task` 的 `doLast` 方法，其作用即把给定的 Groovy 闭包添加到任务的操作列表末尾。同样的还包括一个 `doFirst` 方法，顾名思义。

在声明了任务以后，我们就可以在脚本内像使用属性那样使用这个任务了：

```groovy
task hello {
    doLast {
        println 'Hello Earth!'
    }
}
hello.doFirst {
    println 'Hello Venus'
}
hello.doLast {
    println "Greetings from the $hello.name task."
}
hello << {
    println 'Hello Jupiter'
}
```

其中方法 `<<` 实际上就是 `doLast` 的别名。

### 14.4 构建脚本就是代码

实际上，Gradle 构建脚本所使用的语言正是 Groovy，因此在构建脚本中我们可以使用任意的 Groovy 代码：

```groovy
task upper << {
    String someString = 'mY_nAmE'
    println "Original: " + someString 
    println "Upper case: " + someString.toUpperCase()
}
```

### 14.5 任务依赖

在声明任务的同时我们也可以声明任务的依赖：

```groovy
task taskX(dependsOn: 'taskY') << {
    println 'taskX'
}
task taskY << {
    println 'taskY'
}
```

注意声明依赖的任务的时候，被依赖的任务并不需要提前定义，正如上面的代码那样，尽管 `taskX` 依赖 `taskY`，`taskY` 也可以在 `taskX` 之后定义。

除此之外我们也可以在完成任务声明后再为任务赋予具体依赖：

```groovy
task taskX << {
	println 'taskX'
}
task taskY << {
	println 'taskY'
}
taskX.dependsOn taskY
```

注意，以属性指定 `taskY` 时需要 `taskY` 以预先定义，否则可以用字符串的形式来给定 `taskY`：

```groovy
task taskX << {
	println 'taskX'
}
taskX.dependsOn 'taskY'

task taskY << {
	println 'taskY'
}
```

### 14.6 动态任务

Gradle 脚本可以利用 Groovy 的动态特性来动态地创建任务：

```groovy
4.times { counter ->
    task "task$counter" << {
        println "I'm task number $counter"
    }
}
task0.dependsOn task2, task3
```

### 14.9 额外属性

在任务定义内可以使用 `ext` 属性为任务定义额外属性：

```groovy
task myTask {
    ext.myProperty = "myValue"
}

task printTaskProperties << {
    println myTask.myProperty
}	
```

有关额外属性的更多内容详见 [16.4.2 节](https://docs.gradle.org/current/userguide/writing_build_scripts.html#sec:extra_properties)。

### 14.10 使用 Ant 任务

多亏了 Groovy 对 Ant 任务的支持，我们同样可以在 Gradle 中使用 Ant 任务来更方便地进行各式各样的文件读写操作：

```groovy
task loadfile << {
    def files = file('../antLoadfileResources').listFiles().sort()
    files.each { File file ->
        if (file.isFile()) {
            ant.loadfile(srcFile: file, property: file.name)
            println " *** $file.name ***"
            println "${ant.properties[file.name]}"
        }
    }
}
```

详见 [Groovy 的 AntBuilder 教程](http://docs.groovy-lang.org/latest/html/documentation/ant-builder.html)以及[第 19 章](https://docs.gradle.org/current/userguide/ant.html)。

### 14.11 使用方法

在 Gradle 脚本里也可以声明方法并在其他任务中调用方法：

```groovy
task checksum << {
    fileList('../antLoadfileResources').each {File file ->
        ant.checksum(file: file, property: "cs_$file.name")
        println "$file.name Checksum: ${ant.properties["cs_$file.name"]}"
    }
}

task loadfile << {
    fileList('../antLoadfileResources').each {File file ->
        ant.loadfile(srcFile: file, property: file.name)
        println "I'm fond of $file.name"
    }
}

File[] fileList(String dir) {
    file(dir).listFiles({file -> file.isFile() } as FileFilter).sort()
}
```

### 14.12 默认任务

可以通过 `defaultTasks` 方法来指定默认任务：

```groovy
defaultTasks 'clean', 'run'
```

### 14.13 基于 DAG 的配置

在[第 20 章](https://docs.gradle.org/current/userguide/build_lifecycle.html)可以了解到，Gradle 执行时分为配置阶段和执行阶段，其中任务 DAG 的解析在配置阶段完成，而任务的实际执行则属于执行阶段。因此，部分任务也可以基于 DAG 的信息来改变自己的行为：

```groovy
task distribution << {
    println "We build the zip with version=$version"
}

task release(dependsOn: 'distribution') << {
    println 'We release now'
}

gradle.taskGraph.whenReady {taskGraph ->
    if (taskGraph.hasTask(release)) {
        version = '1.0'
    } else {
        version = '1.0-SNAPSHOT'
    }
}
```

## 44 Java 项目构建入门

### 44.1 Java 插件

比起 Maven 只能用于构建 JVM 项目，实际上 Gradle 是一个更加 general 的构建工具：在 Gradle 主页上我们也能看到 Gradle 甚至能用于构建 C++ 项目。Gradle 的强大来源于其使用 Groovy 脚本来定义构建逻辑，因此只要你写得出来，Gradle 就做得出来，但前提是你必须在构建脚本里写清楚 Gradle 该怎么做。

但对于同样类型的项目，比如同样是 Java 项目，每次创建一个新项目都要把编译、测试、打包等逻辑写到脚本里是很麻烦的，因此 Gradle 可以使用插件，其中就包括专门用于 Java 项目的 Java 插件。

插件通常通过引入一些预定义的任务来省去程序员编写脚本的功夫。比如说像编译、测试、打包这样十分常见的逻辑，在 Java 插件中就对应着 `compile`、`test`、`jar` 等预定义的任务。

Java 插件本身是基于惯例的，它会为项目默认指定一些配置，例如源代码文件和测试代码文件的位置等。如果项目没有遵循这些惯例也可以通过脚本来进行修改。实际上，由于 Gradle 的 Java 项目构建功能本身就是委托给 Java 插件的，如果实在有必要你甚至可以不使用 Java 插件以寻求最大的定制化。

### 44.2 基本的 Java 项目

在构建文件中加入如下代码：

```groovy
apply plugin: 'java'
```

如此一来，Gradle 就知道这是一个 Java 项目并应用 Java 插件了，你在构建时也就可以使用 Java 插件预定义的任务了。你可以使用 <kbd>gradle tasks</kbd> 来查看由 Java 插件添加的任务。

Java 插件对项目的结构做出如下默认配置：

- 源代码文件位于 `src/main/java`
- 测试代码文件位于 `src/test/java`
- 所有位于 `src/main/resources` 的文件都会被作为资源文件复制到构建出的 JAR 文件中
- 所有位于 `src/test/resources` 的文件都会在运行测试时被添加到 classpath 中
- 所有的构建输出文件都会出现在 `build` 文件夹中，其中构建出的 JAR 文件会位于 `build/libs`

#### 44.2.1 构建项目

主要提到可以用 `build` 任务来构建 Java 项目。

除此之外还提到如下几个有用的任务：

- `clean`：删除 `build` 文件夹
- `assemble`：编译并将代码打包成 JAR 但不执行任何单元测试。其他插件可能会为该任务添加更多的行为，如使用 War 插件时该任务还会为任务构建 WAR 文件
- `check`：编译并测试代码。其他插件可能会为该任务添加更多的行为，如使用 `checkstyle` 插件时该任务还会对你的源代码执行代码风格检测

#### 44.2.2 外部依赖

同第七章。

#### 44.2.3 项目自定义

正如前面所说，Java 插件实际上为项目引入了大量的属性并基于惯例为这些属性赋了默认值。通常来讲这些默认值都足够用于普通的 Java 项目，但你也可以在脚本中改变这些属性值以实现项目定制化。

如如下代码：

```groovy
sourceCompatibility = 1.7
version = '1.0'
jar {
    manifest {
        attributes 'Implementation-Title': 'Gradle Quickstart',
                   'Implementation-Version': version
    }
}
```

你可以通过 <kbd>gradle properties</kbd> 来查看项目的所有属性。

除此之外，由 Java 插件预定义的任务和其他在构建脚本中定义的任务没什么不同，你也可以在脚本中访问这些任务并对它们做出设置。具体设置方式详见第 14 章。

#### 44.2.4 发布 JAR 文件

同 7.6 节。

#### 44.2.5 创建 Eclipse 项目

使用 `eclipse` 插件：

```groovy
apply plugin: 'eclipse'
```

然后执行 <kbd>gradle eclipse</kbd> 命令即可生成 Eclipse 项目文件。详见[第 63 章](https://docs.gradle.org/current/userguide/eclipse_plugin.html)。

### 44.3 多项目 Java 构建

#### 44.3.1 定义多项目构建

首先，多项目构建需要在根目录创建一个 `settings.gradle` 并指定包含的子项目：

```groovy
include "shared", "api", "services:webservice", "services:shared" 
```

详见[第 24 章](https://docs.gradle.org/current/userguide/multi_project_builds.html)。

#### 44.3.2 共用配置

对于大多数的多项目构建而言，总有一些配置是各个子项目都相同的。这些配置可以被集中放在根项目的构建文件中，并使用名为“配置嵌入”的方式来将这些配置应用到每一个子项目。

见如下脚本配置：

```groovy
subprojects {
    apply plugin: 'java'
    apply plugin: 'eclipse-wtp'

    repositories {
       mavenCentral()
    }

    dependencies {
        testCompile 'junit:junit:4.12'
    }

    version = '1.0'

    jar {
        manifest.attributes provider: 'gradle'
    }
}
```

上述代码所使用到的 `subprojects` 方法会遍历项目中的每一个子项目并应用给定的闭包，如此一来便能将闭包内的配置应用到每一个子项目。

值得注意的是，Java 插件的应用语句被放置在了 `subprojects` 里面而不是外面，如此一来 Gradle 便不会把根项目当做是一个 Java 项目并到那些预定义的地方寻找源代码文件了。

#### 44.3.3 子项目间的依赖

如下述代码所示：

```groovy
dependencies {
    compile project(':shared')
} 
```

## 16 编写构建脚本

### 16.1 Gradle 构建语言

Gradle 在 Groovy 的基础上开发出了一套专门用于便捷地进行构建任务的 DSL，因此在 Gradle 构建脚本中我们可以任意地使用 Groovy 语言。除此之外，Gradle 默认假设我们使用 UTF-8 编写脚本。

### 16.2 `Project` API

对于构建中的每个项目，Gradle 都会为它们各自生成一个 [`Project`](https://docs.gradle.org/current/dsl/org.gradle.api.Project.html) 对象并将其与对应项目的构建脚本绑定起来，并在执行脚本时进行如下动作：

- 凡是对任何没有在该构建脚本中定义的方法进行调用时，该调用都会被委托给对应的 `Project` 对象
- 凡是对任何没有在该构建脚本中定义的属性进行访问时，该访问都会被委托给对应的 `Project` 对象

### 16.3 `Script` API

Gradle 在执行脚本时实际上会把脚本内容放入到一个实现了 [`Script`](https://docs.gradle.org/current/dsl/org.gradle.api.Script.html) 接口的类中进行编译，因此你可以在你的脚本中使用所有由 `Script` 声明的属性和方法。

### 16.4 声明变量

#### 16.4.1 本地变量

同 Groovy，使用 `def` 关键字声明本地变量。本地变量只能在其所属的作用域内访问。

#### 16.4.2 额外属性

我们可以通过部分由 Gradle 定义的类的 `ext` 属性为该对象添加更多的属性：

```groovy
apply plugin: "java"

ext {
    springVersion = "3.1.0.RELEASE"
    emailNotification = "build@master.org"
}

sourceSets.all { ext.purpose = null }

sourceSets {
    main {
        purpose = "production"
    }
    test {
        purpose = "test"
    }
    plugin {
        purpose = "production"
    }
}

task printProperties << {
    println springVersion
    println emailNotification
    sourceSets.matching { it.purpose == "production" }.each { println it.name }
}
```

结果如下：

```
> gradle -q printProperties
3.1.0.RELEASE
build@master.org
main
plugin
```

有关额外属性以及其 API 的更多内容详见 [`ExtraPropertiesExtension`](https://docs.gradle.org/current/dsl/org.gradle.api.plugins.ExtraPropertiesExtension.html) 类的文档。

### 16.5 配置任意对象

可以使用 `configure` 方法来配置任意对象：

```groovy
def pos = configure(new java.text.FieldPosition(10)) {
    beginIndex = 1
    endIndex = 5
}
println pos.beginIndex
println pos.endIndex
```

### 16.6 使用其他脚本配置对象

对对象的配置甚至还能放入到另一个 `.gradle` 文件中。

我们可以在 `other.gradle` 中输入：

```groovy
// Set properties.
beginIndex = 1
endIndex = 5   
```

如下代码即可完成与上一节相同的配置：

```groovy
def pos = new java.text.FieldPosition(10)
// Apply the script
apply from: 'other.gradle', to: pos
println pos.beginIndex
println pos.endIndex
```

### 16.7 Groovy 基础

介绍了 Groovy 的一些基本语法特性。可以去看我之前写过的 Groovy 相关的博文。

### 16.8 默认引入

Gradle 脚本本身也会默认引入 Gradle 的包。引入数量较多，详见 [16.8 小节](https://docs.gradle.org/current/userguide/writing_build_scripts.html#script-default-imports)。
