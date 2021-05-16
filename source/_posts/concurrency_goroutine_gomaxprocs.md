---
layout: post_translated
title: 并发、Goroutine 与 GOMAXPROCS
category: Go
tags: Go
org_title: Concurrency, Goroutines and GOMAXPROCS
org_url: "https://www.goinggo.net/2014/01/concurrency-goroutines-and-gomaxprocs.html"
date: 2017-06-14
updated: 2017-06-14
toc: true
---

<!--
When new people join the Go-Miami group they always write that they want to learn more about Go ’ s concurrency model. Concurrency seems to be the big buzz word around the language. It was for me when I first started hearing about Go. It was Rob Pike ’ s Go Concurrency Patterns video that finally convinced me I needed to learn this language.
-->
每当有新人加入 [Go-Miami](http://www.meetup.com/Go-Miami/) 小组的时候，他们总会提到他们有多想学习更多有关 Go 并发模型的东西。似乎并发就像这个语言的大新闻一样。不过，在我第一次听说 Go 时确实如此 -- 实际上正是 Rob Pike 的 [Go 并发模式](http://www.youtube.com/watch?v=f6kdp27TYZs)这个视频让我确信我需要去学这门语言。

<!--
To understand how Go makes writing concurrent programs easier and less prone to errors, we first need to understand what a concurrent program is and the problems that result from such programs. I will not be talking about CSP (Communicating Sequential Processes) in this post, which is the basis for Go ’ s implementation of channels. This post will focus on what a concurrent program is, the role that goroutines play and how the GOMAXPROCS environment variable and runtime function affects the behavior of the Go runtime and the programs we write.
-->
要想理解为什么用 Go 编写并发程序会更加容易而且更难出错，我们首先得了解一个并发程序是什么样的，以及它可能会出现哪些问题。我不会在这篇文章中讨论 CSP（Communicating Sequential Processes，通信顺序进程），尽管它确实是 Go 的 Channel 实现的基础。这篇文章主要讲述一个并发程序会是什么样的、Goroutine 在这之中起着什么样的作用、以及 `GOMAXPROCS` 环境变量和运行时函数会如何影响 Go 运行时和我们编写的程序的行为。

<!-- more -->

## 进程与线程

<!--
When we run an application, like the browser I am using to write this post, a process is created by the operating system for the application. The job of the process is to act like a container for all the resources the application uses and maintains as it runs. These resources include things like a memory address space, handles to files, devices and threads.
-->
在我们启动一个应用程序，例如我现在正在用来写这篇文章的浏览器时，操作系统会为应有程序创建一个进程。进程的作用就像一个容器，装着应用程序在运行的过程中会使用并且维护的资源，包括内存地址空间、指向文件或设备的句柄以及线程。

<!--
A thread is a path of execution that is scheduled by the operating system to execute the code we write in our functions against a processor. A process starts out with one thread, the main thread, and when that thread terminates the process terminates. This is because the main thread is the origin for the application. The main thread can then in turn launch more threads and those threads can launch even more threads.
-->
一条线程是一个由操作系统负责调度的执行路径，负责在一个处理器上执行我们在函数中编写的代码。一个进程在开始时只有一条线程，即主线程。当主线程结束时，进程也随之终止，因为主线程是整个应用程序的起点。主线程可以启动新线程，而这些新线程也可以启动更多的新线程。

<!--
The operating system schedules a thread to run on an available processor regardless of which process the thread belongs to. Each operating system has its own algorithms that make these decisions and it is best for us to write concurrent programs that are not specific to one algorithm or the other. Plus these algorithms change with every new release of an operating system, so it is dangerous game to play.
-->
操作系统负责调度线程到可用的处理器上执行，且不会考虑该线程属于哪个进程。每个操作系统都会有它自己的调度算法，因此对我们来说最好还是不要编写依赖于某种调度算法的并发程序。再说了，这些调度算法在每次操作系统发布新版本时都可能会变化。


## Goroutine 与并行

<!--
Any function or method in Go can be created as a goroutine. We can consider that the main function is executing as a goroutine, however the Go runtime does not start that goroutine. Goroutines are considered to be lightweight because they use little memory and resources plus their initial stack size is small. Prior to version 1.2 the stack size started at 4K and now as of version 1.4 it starts at 8K. The stack has the ability to grow as needed.
-->
Go 的任何函数和方法都可以被创建为一个 Goroutine。我们可以认为 `main` 函数就作为一个 Goroutine 在执行，尽管 Go 运行时并没有启动这个 Goroutine。Goroutine 是轻量级的，因为它们通常只会占用很少的内存和资源，以及它们的初始栈空间很小。在 1.2 版之前的初始栈空间为 4K 而在 1.4 版之后初始栈空间为 8K。Goroutine 的栈还可以按需增长。

<!--
The operating system schedules threads to run against available processors and the Go runtime schedules goroutines to run within a logical processor that is bound to a single operating system thread. By default, the Go runtime allocates a single logical processor to execute all the goroutines that are created for our program. Even with this single logical processor and operating system thread, hundreds of thousands of goroutines can be scheduled to run concurrently with amazing efficiency and performance. It is not recommended to add more that one logical processor, but if you want to run goroutines in parallel, Go provides the ability to add more via the GOMAXPROCS environment variable or runtime function.
-->
操作系统负责将线程调度到可用的处理器上执行，而 Go 运行时则将 Goroutine 调度到与单个操作系统线程相绑定的[逻辑处理器](http://www.goinggo.net/2015/02/scheduler-tracing-in-go.html)上执行。在默认情况下，Go 运行时会使用一个逻辑处理器来运行我们程序创建的所有 Goroutine。不过，即使只用这唯一一个逻辑处理器和操作系统线程，成千上万个 Goroutine 仍然可以以惊人的效率和性能并发执行。尽管并不推荐你添加更多的逻辑处理器，但如果你想要并行地运行 Goroutine，Go 也允许你通过 `GOMAXPROCS` 环境变量和运行时函数来添加逻辑处理器。

<!--
Concurrency is not Parallelism. Parallelism is when two or more threads are executing code simultaneously against different processors. If you configure the runtime to use more than one logical processor, the scheduler will distribute goroutines between these logical processors which will result in goroutines running on different operating system threads. However, to have true parallelism you need to run your program on a machine with multiple physical processors. If not, then the goroutines will be running concurrently against a single physical processor, even though the Go runtime is using multiple logical processors.
-->
并发（Concurrency）并不是并行（Parallelism）。并行是指多个线程在多个处理器上同时执行代码。如果你通过配置让运行时使用多个逻辑处理器，调度器就会将 Goroutine 分配到这些逻辑处理器上，如此一来这些 Goroutine 便会运行在不同的操作系统线程中。然而，要想真正实现并行，你需要将你的程序运行在一个拥有多个物理处理器的机器上。否则，这些 Goroutine 只会在一个物理处理器上并发执行，即使 Go 运行时在使用多个逻辑处理器。

## 并发案例

<!--
Let ’ s build a small program that shows Go running goroutines concurrently. In this example we are running the code with one logical processor:
-->
接下来我们来创建一个小程序来看看 Go 是如何并发运行 Goroutine 的。在执行这个案例时我们会使用一个逻辑处理器：

```go
package main

import (
    "fmt"
    "runtime"
    "sync"
)

func main() {
    runtime.GOMAXPROCS(1) // <-----

    var wg sync.WaitGroup
    wg.Add(2)

    fmt.Println("Starting Go Routines")
    go func() {
        defer wg.Done()

        for char := 'a'; char < 'a'+26; char++ {
            fmt.Printf("%c ", char)
        }
    }()

    go func() {
        defer wg.Done()

        for number := 1; number < 27; number++ {
            fmt.Printf("%d ", number)
        }
    }()

    fmt.Println("Waiting To Finish")
    wg.Wait()

    fmt.Println("\nTerminating Program")
}
```

<!--
This program launches two goroutines by using the keyword go and declaring two anonymous functions. The first goroutine displays the english alphabet using lowercase letters and the second goroutine displays numbers 1 through 26. When we run this program we get the following output:
-->
这个程序使用 `go` 关键字和两个匿名函数启动了两个 Goroutine。第一个 Goroutine 负责以小写字母打印英文字母表，第二个 Goroutine 则打印数字 1 到数字 26。如果我们运行该程序我们将得到如下输出：

```
Starting Go Routines
Waiting To Finish
a b c d e f g h i j k l m n o p q r s t u v w x y z 1 2 3 4 5 6 7 8 9 10 11
12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
Terminating Program
```

<!--
When we look at the output we can see that the code was run concurrently. Once the two goroutines are launched, the main goroutine waits for the goroutines to complete. We need to do this because once the main goroutine terminates, the program terminates. Using a WaitGroup is a great way for goroutines to communicate when they are done.
-->
从输出来看，我们可以看到代码是并发执行的。在两个 Goroutine 启动后，主 Goroutine 开始等待这两个 Goroutine 完成。这么做的原因是一旦主 Goroutine 结束后，应用程序就终止了。使用 `WaitGroup` 即可很好地让 Goroutine 相互知会它们何时结束执行。

<!--
We can see that the first goroutine completes displaying all 26 letters and then the second goroutine gets a turn to display all 26 numbers. Because it takes less than a microsecond for the first goroutine to complete its work, we don ’ t see the scheduler interrupt the first goroutine before it finishes its work. We can give a reason to the scheduler to swap the goroutines by putting a sleep into the first goroutine:
-->
我们可以看到，第一个 Goroutine 在完成打印所有 26 个字母后才轮到第二个 Goroutine 打印它需要打印的 26 个数字。因为第一个 Goroutine 在一微秒之内就完成了它的工作，因此我们没能看到调度器在第一个 Goroutine 执行完成前中断它。我们可以通过在第一个 Goroutine 中调用 `Sleep` 函数来让调度器切换 Goroutine：

```go
package main

import (
    "fmt"
    "runtime"
    "sync"
    "time"
)

func main() {
    runtime.GOMAXPROCS(1)

    var wg sync.WaitGroup
    wg.Add(2)

    fmt.Println("Starting Go Routines")
    go func() {
        defer wg.Done()

        time.Sleep(1 * time.Microsecond) // <---------
        for char := 'a'; char < 'a'+26; char++ {
            fmt.Printf("%c ", char)
        }
    }()

    go func() {
        defer wg.Done()

        for number := 1; number < 27; number++ {
            fmt.Printf("%d ", number)
        }
    }()

    fmt.Println("Waiting To Finish")
    wg.Wait()

    fmt.Println("\nTerminating Program")
}
```

<!--
This time we add a sleep in the first goroutine as soon as it starts. Calling sleep causes the scheduler to swap the two goroutines:
-->
这次我们在第一个 Goroutine 启动时就调用了 `Sleep` 函数，这使得调度器切换了两个 Goroutine：

```
Starting Go Routines
Waiting To Finish
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 a
b c d e f g h i j k l m n o p q r s t u v w x y z
Terminating Program
```

## 并行案例

<!--
In our past two examples the goroutines were running concurrently, but not in parallel. Let ’ s make a change to the code to allow the goroutines to run in parallel. All we need to do is add a second logical processor to the scheduler to use two threads:
-->
在我们上面的两个示例中，Goroutine 都是在并发执行而不是并行执行。接下来我们对代码做些修改来让 Goroutine 并行执行。我们只需要添加第二个逻辑处理器来让调度器使用两条线程即可：

```go
package main

import (
    "fmt"
    "runtime"
    "sync"
)

func main() {
    runtime.GOMAXPROCS(2) // <------------

    var wg sync.WaitGroup
    wg.Add(2)

    fmt.Println("Starting Go Routines")
    go func() {
        defer wg.Done()

        for char := 'a'; char < 'a'+26; char++ {
            fmt.Printf("%c ", char)
        }
    }()

    go func() {
        defer wg.Done()

        for number := 1; number < 27; number++ {
            fmt.Printf("%d ", number)
        }
    }()

    fmt.Println("Waiting To Finish")
    wg.Wait()

    fmt.Println("\nTerminating Program")
}
```

<!--
Here is the output for the program:
-->
程序输出如下：

```
Starting Go Routines
Waiting To Finish
a b 1 2 3 4 c d e f 5 g h 6 i 7 j 8 k 9 10 11 12 l m n o p q 13 r s 14
t 15 u v 16 w 17 x y 18 z 19 20 21 22 23 24 25 26
Terminating Program
```

<!--
Every time we run the program we are going to get different results. The scheduler does not behave exactly the same for each and every run. We can see that the goroutines are truly running in parallel. Both goroutines start running immediately and you can see them both competing for standard out to display their results.
-->
我们每次运行该程序时都会得到不一样的结果。调度器的行为在每次程序执行时都不尽相同。我们可以看到 Goroutine 是真的在并行执行。两个 Goroutine 都同时开始运行，而且你能看到它们都在争夺标准输出来输出它们的结果。

## 结语

<!--
Just because we can add multiple logical processors for the scheduler to use doesn ’ t mean we should. There is a reason the Go team has set the defaults to the runtime the way they did. Especially the default for only using a single logical processor. Just know that arbitrarily adding logical processors and running goroutines in parallel will not necessarily provide better performance for your programs. Always profile and benchmark your programs and make sure the Go runtime configuration is only changed if absolutely required.
-->
我们可以为调度器添加更多的逻辑处理器，但这并不意味着我们应该这么做。Go 开发团队如此设计运行时的默认设置是有原因的，由其是默认只使用一个逻辑处理器的设置。你要记住，随意地添加逻辑处理器以并行地执行 Goroutine 并不一定能为你的程序带来更高的性能。永远要记得为你的程序进行基准测试和[性能分析](http://blog.golang.org/profiling-go-programs)并在绝对必要时才去修改 Go 的运行时配置。

<!--
The problem with building concurrency into our applications is eventually our goroutines are going to attempt to access the same resources, possibly at the same time. Read and write operations against a shared resource must always be atomic. In other words reads and writes must happen by one goroutine at a time or else we create race conditions in our programs. To learn more about race conditions read my post.
-->
为我们的程序引入并发的问题在于，我们的 Goroutine 最终都会开始尝试访问同一个资源，有可能还是同时尝试。对共享资源执行的读写操作必须是原子的。也就是说，同一时间只能有一个 Goroutine 进行读写，否则我们的程序就会出现竞态条件。要想了解更多有关竞态条件的事可以阅读我的[另一篇文章](http://www.goinggo.net/2013/09/detecting-race-conditions-with-go.html)。

<!--
Channels are the way in Go we write safe and elegant concurrent programs that eliminate race conditions and make writing concurrent programs fun again. Now that we know how goroutines work, are scheduled and can be made to run in parallel, channels are the next thing we need to learn.
-->
Channel 便是我们在 Go 中编写安全而优雅的并发应用程序的方法，使用它可以很好地消除竞态条件并让编写并发程序变得有趣起来。既然现在我们知道 Goroutine 是如何工作、如何被调度以及如何能并行执行，Channel 就是下一个我们需要学习的东西了。

