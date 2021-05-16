---
title: MIT 6.824 Lab 1 - 实现 MapReduce
category: 分布式系统
tags:
 - 分布式计算
 - 分布式系统
 - MIT 6.824
date: 2021-05-13
updated: 2021-05-13
toc: true
---

在这篇文章中，我们将按照 MIT-6.824 2021 Spring 的安排，完成 Lab 1，用 Golang 实现 MapReduce 分布式计算框架。

<!-- more -->

完整的 Lab 说明可参阅链接 <http://nil.csail.mit.edu/6.824/2021/labs/lab-mr.html>。

不了解 MapReduce 原理的读者，也可以先阅读我先前的文章[《Google MapReduce 总结》](/mapreduce_summary)。

## 牛刀小试

首先，我们通过 Git 获取 Lab 的初始代码：

```bash
git clone git://g.csail.mit.edu/6.824-golabs-2021 6.824
```

初始代码中默认已经提供了 **单进程串行** 的 MapReduce 参考实现，在 [main/mrsequential.go](https://github.com/Mr-Dai/MIT-6.824/blob/master/src/main/mrsequential.go) 中。我们可以通过以下命令来试玩一下：

```bash
cd 6.824
cd src/main

# 构建 MR APP 的动态链接库
go build -race -buildmode=plugin ../mrapps/wc.go

# 运行 MR
rm mr-out*
go run -race mrsequential.go wc.so pg*.txt

# 查看结果
more mr-out-0
```

除了 `mrapps/wc.go`，初始代码在 `mrapps` 中还提供了其他 MR APP 实现，也可以参照着替换上述命令中的参数来试玩一下。

> 这里使用了 Golang 的 [Plugin](https://golang.org/pkg/plugin/) 来构建 MR APP，使得 MR 框架的代码可以和 MR APP 的代码分开编译，而后 MR 框架再通过动态链接的方式载入指定的 MR APP 运行。

## 任务分析

如上文所述，在 [main/mrsequential.go](https://github.com/Mr-Dai/MIT-6.824/blob/master/src/main/mrsequential.go) 中我们可以找到初始代码预先提供的 **单进程串行** 的 MapReduce 参考实现，而我们的任务是实现一个 **单机多进程并行** 的版本。

通过阅读 Lab 文档 <http://nil.csail.mit.edu/6.824/2021/labs/lab-mr.html> 以及初始代码，可知信息如下：

 - 整个 MR 框架由一个 Coordinator 进程及若干个 Worker 进程构成
 - Coordinator 进程与 Worker 进程间通过本地 Socket 进行 [Golang RPC](https://golang.org/pkg/net/rpc/) 通信
 - 由 Coordinator 协调整个 MR 计算的推进，并分配 Task 到 Worker 上运行
 - 在启动 Coordinator 进程时指定 输入文件名 及 Reduce Task 数量
 - 在启动 Worker 进程时指定所用的 MR APP 动态链接库文件
 - Coordinator 需要留意 Worker 可能无法在合理时间内完成收到的任务（Worker 卡死或宕机），在遇到此类问题时需要重新派发任务
 - Coordinator 进程的入口文件为 [main/mrcoordinator.go](https://github.com/Mr-Dai/MIT-6.824/blob/master/src/main/mrcoordinator.go)
 - Worker 进程的入口文件为 [main/mrworker.go](https://github.com/Mr-Dai/MIT-6.824/blob/master/src/main/mrworker.go)
 - 我们需要补充实现 mr/coordinator.go、mr/worker.go、mr/rpc.go 这三个文件

基于此，我们不难设计出，Coordinator 需要有以下功能：

 - 在启动时根据指定的输入文件数及 Reduce Task 数，生成 Map Task 及 Reduce Task
 - 响应 Worker 的 Task 申请 RPC 请求，分配可用的 Task 给到 Worker 处理
 - 追踪 Task 的完成情况，在所有 Map Task 完成后进入 Reduce 阶段，开始派发 Reduce Task；在所有 Reduce Task 完成后标记作业已完成并退出

而 Worker 的功能则相对简单，只需要保证在空闲时通过 RPC 向 Coordinator 申请 Task 并运行，再不断重复该过程即可。

此外 Lab 要求我们考虑 Worker 的 Failover，即 Worker 获取到 Task 后可能出现宕机和卡死等情况。这两种情况在 Coordinator 的视角中都是相同的，就是该 Worker 长时间不与 Coordinator 通信了。为了简化任务，Lab 说明中明确指定了，设定该超时阈值为 10s 即可。为了支持这一点，我们的实现需要支持到：

 1. Coordinator 追踪已分配 Task 的运行情况，在 Task 超出 10s 仍未完成时，将该 Task 重新分配给其他 Worker 重试
 2. 考虑 Task 上一次分配的 Worker 可能仍在运行，重新分配后会出现两个 Worker 同时运行同一个 Task 的情况。要确保只有一个 Worker 能够完成结果数据的最终写出，以免出现冲突，导致下游观察到重复或缺失的结果数据

第一点比较简单，而第二点会相对复杂些，不过在 Lab 文档中也给出了提示 —— 实际上也是参考了 Google MapReduce 的做法，Worker 在写出数据时可以先写出到临时文件，最终确认没有问题后再将其重命名为正式结果文件，区分开了 Write 和 Commit 的过程。Commit 的过程可以是 Coordinator 来执行，也可以是 Worker 来执行：

 - Coordinator Commit：Worker 向 Coordinator 汇报 Task 完成，Coordinator 确认该 Task 是否仍属于该 Worker，是则进行结果文件 Commit，否则直接忽略
 - Worker Commit：Worker 向 Coordinator 汇报 Task 完成，Coordinator 确认该 Task 是否仍属于该 Worker 并响应 Worker，是则 Worker 进行结果文件 Commit，再向 Coordinator 汇报 Commit 完成

这里两种方案都是可行的，各有利弊。我在我的实现中选择了 Coordinator Commit，因为它可以少一次 RPC 调用，在编码实现上会更简单，但缺点是所有 Task 的最终 Commit 都由 Coordinator 完成，在极端场景下会让 Coordinator 变成整个 MR 过程的性能瓶颈。

## 代码设计与实现

代码的设计及实现主要是三个部分：

 - Coordinator 与 Worker 间的 RPC 通信，对应 [mr/rpc.go](https://github.com/Mr-Dai/MIT-6.824/blob/master/src/mr/rpc.go) 文件
 - Coordinator 调度逻辑，对应 [mr/coordinator.go](https://github.com/Mr-Dai/MIT-6.824/blob/master/src/mr/coordinator.go) 文件
 - Worker 计算逻辑，对应 [mr/worker.go](https://github.com/Mr-Dai/MIT-6.824/blob/master/src/mr/worker.go) 文件

### RPC 通信

Coordinator 与 Worker 间的需要进行的通信主要有两块：

 - Worker 在空闲时向 Coordinator 发起 Task 请求，Coordinator 响应一个分配给该 Worker 的 Task
 - Worker 在上一个 Task 运行完成后向 Coordinator 汇报

考虑到上述两个过程总是交替进行的，且 Worker 在上一个 Task 运行完成后总是立刻会需要申请一个新的 Task，在实现上这里我把它们合并为了一个 RPC 调用：

> ApplyForTask RPC：
>
>  - 由 Worker 向 Coordinator 发起，申请一个新的 Task，同时汇报上一个运行完成的 Task（如有）
>  - Coordinator 接收到 RPC 请求后将同步阻塞，直到有可用的 Task 分配给该 Worker 或整个 MR 作业已运行完成
>
> 参数：
>
>  - Worker ID
>  - 上一个完成的 Task 的类型及 Index。可能为空
>
> 响应：
>
>  - 新 Task 的类型及 Index。若为空则代表 MR 作业已完成，Worker 可退出
>  - 运行新 Task 所需的其他信息，包括：
>    * 如果是 MAP Task，需要
>      - 对应的输入文件名
>      - 总 REDUCE Task 数量，用于生成中间结果文件
>    * 如果是 REDUCE Task，需要总 MAP Task 数量，用于生成对应中间结果文件的文件名

可点击链接 <https://github.com/Mr-Dai/MIT-6.824/blob/master/src/mr/rpc.go> 查看我的完整实现。

### Coordinator

由于涉及整个 MR 作业的运行过程调度以及 Worker Failover 的处理，Coordinator 组件的逻辑会相对复杂。

首先，Coordinator 需要维护以下状态信息：

 - 基础配置信息，包括 总 MAP Task 数量、总 Reduce Task 数量
 - 调度所需信息，包括
   * 当前所处阶段，是 MAP 还是 REDUCE
   * 所有仍未完成的 Task 及其所属的 Worker 和 Deadline（若有），使用 Golang Map 结构实现
   * 所有仍未分配的 Task 池，用于响应 Worker 的申请及 Failover 时的重新分配，使用 Golang Channel 实现

```golang
type Coordinator struct {
    lock sync.Mutex // 保护共享信息，避免并发冲突

    stage          string // 当前作业阶段，MAP or REDUCE。为空代表已完成可退出
    nMap           int
    nReduce        int
    tasks          map[string]Task
    availableTasks chan Task
}
```

然后，Coordinator 需要实现以下几个过程：

 - 在启动时，基于指定的输入文件生成 MAP Task 到可用 Task 池中
 - 处理 Worker 的 Task 申请 RPC，从池中分配一个可用的 Task 给 Worker 并响应
 - 处理 Worker 的 Task 完成通知，完成 Task 最终的结果数据 Commit
 - 在 MAP Task 全部完成后，转移至 REDUCE 阶段，生成 REDUCE Task 到可用 Task 池
 - 在 REDUCE Task 全部完成后，标记 MR 作业已完成，退出
 - 周期巡检正在运行的 Task，发现 Task 运行时长超出 10s 后重新分配其到新的 Worker 上运行

这里我们一个个来。先看 **Coordinator 启动时的 MAP Task 生成**：

```golang
func MakeCoordinator(files []string, nReduce int) *Coordinator {
    c := Coordinator{
        stage:          MAP,
        nMap:           len(files),
        nReduce:        nReduce,
        tasks:          make(map[string]Task),
        availableTasks: make(chan Task, int(math.Max(float64(len(files)), float64(nReduce)))),
    }

    // 每个输入文件生成一个 MAP Task
    for i, file := range files {
        task := Task{
            Type: MAP,
            Index: i,
            MapInputFile: file,
        }
        c.tasks[GenTaskID(task.Type, task.Index)] = task
        c.availableTasks <- task
    }

    // 启动 Coordinator，开始响应 Worker 请求
    log.Printf("Coordinator start\n")
    c.server()

    // 启动 Task 自动回收过程
    // ...

    return &c
}
```

然后我们再来看 **可用 Task 获取与分配**：

```golang
// 基于 Task 的类型和 Index 值生成唯一 ID
func GenTaskID(t string, index int) string {
    return fmt.Sprintf("%s-%d", t, index)
}

// ApplyForTask RPC 的处理入口，由 Worker 调用
func (c *Coordinator) ApplyForTask(args *ApplyForTaskArgs, reply *ApplyForTaskReply) error {
    if args.LastTaskType != "" {
        // 记录 Worker 的上一个 Task 已经运行完成
        // ...
    }

    // 获取一个可用 Task 并返回
    task, ok := <- c.availableTasks
    if !ok { // Channel 关闭，代表整个 MR 作业已完成，通知 Worker 退出
        return nil
    }

    c.lock.Lock()
    defer c.lock.Unlock()
    log.Printf("Assign %s task %d to worker %s\n", task.Type, task.Index, args.WorkerID)
    task.WorkerID = args.WorkerID
    task.Deadline = time.Now().Add(10 * time.Second)
    c.tasks[GenTaskID(task.Type, task.Index)] = task // 记录 Task 分配的 Worker ID 及 Deadline
    reply.TaskType = task.Type
    reply.TaskIndex = task.Index
    reply.MapInputFile = task.MapInputFile
    reply.MapNum = c.nMap
    reply.ReduceNum = c.nReduce

    return nil
}
```

然后是 **Worker Task 已完成的处理**：

```golang
// ApplyForTask RPC 的处理入口，由 Worker 调用
func (c *Coordinator) ApplyForTask(args *ApplyForTaskArgs, reply *ApplyForTaskReply) error {
    if args.LastTaskType != "" {
        // 记录 Worker 的上一个 Task 已经运行完成
        c.lock.Lock()

        lastTaskID := GenTaskID(args.LastTaskType, args.LastTaskIndex)
        // 判断该 Task 是否仍属于该 Worker，如果已经被重新分配则直接忽略，进入后续的新 Task 分配过程
        if task, exists := c.tasks[lastTaskID]; exists && task.WorkerID == args.WorkerID {
            log.Printf(
                "Mark %s task %d as finished on worker %s\n",
                task.Type, task.Index, args.WorkerID)
            // 将该 Worker 的临时产出文件标记为最终产出文件
            if args.LastTaskType == MAP {
                for ri := 0; ri < c.nReduce; ri++ {
                    err := os.Rename(
                        tmpMapOutFile(args.WorkerID, args.LastTaskIndex, ri),
                        finalMapOutFile(args.LastTaskIndex, ri))
                    if err != nil {
                        log.Fatalf(
                            "Failed to mark map output file `%s` as final: %e",
                            tmpMapOutFile(args.WorkerID, args.LastTaskIndex, ri), err)
                    }
                }
            } else if args.LastTaskType == REDUCE {
                err := os.Rename(
                    tmpReduceOutFile(args.WorkerID, args.LastTaskIndex),
                    finalReduceOutFile(args.LastTaskIndex))
                if err != nil {
                    log.Fatalf(
                        "Failed to mark reduce output file `%s` as final: %e",
                        tmpReduceOutFile(args.WorkerID, args.LastTaskIndex), err)
                }
            }

            // 当前阶段所有 Task 已完成，进入下一阶段
            delete(c.tasks, lastTaskID)
            if len(c.tasks) == 0 {
                c.transit()
            }
        }
        c.lock.Unlock()
    }

    // 获取一个可用 Task 并返回
    // ...
}
```

然后我们来看 **作业运行阶段的切换**：

```golang
func (c *Coordinator) transit() {
    if c.stage == MAP {
        // MAP Task 已全部完成，进入 REDUCE 阶段
        log.Printf("All MAP tasks finished. Transit to REDUCE stage\n")
        c.stage = REDUCE

        // 生成 Reduce Task
        for i := 0; i < c.nReduce; i++ {
            task := Task{
                Type: REDUCE,
                Index: i,
            }
            c.tasks[GenTaskID(task.Type, task.Index)] = task
            c.availableTasks <- task
        }
    } else if c.stage == REDUCE {
        // REDUCE Task 已全部完成，MR 作业已完成，准备退出
        log.Printf("All REDUCE tasks finished. Prepare to exit\n")
        close(c.availableTasks) // 关闭 Channel，响应所有正在同步等待的 RPC 调用
        c.stage = ""            // 使用空字符串标记作业完成
    }
}
```

最后我们再来看 **过期 Task 的回收**。考虑到该过程需要对已分配的 Task 进行周期巡检，我们直接在 Coordinator 启动时启动一个 Goroutine 来实现：

```golang
func MakeCoordinator(files []string, nReduce int) *Coordinator {
    // ...

    // 启动 Coordinator，开始响应 Worker 请求
    log.Printf("Coordinator start\n")
    c.server()

    // 启动 Task 自动回收过程
    go func() {
        for {
            time.Sleep(500 * time.Millisecond)

            c.lock.Lock()
            for _, task := range c.tasks {
                if task.WorkerID != "" && time.Now().After(task.Deadline) {
                    // 回收并重新分配
                    log.Printf(
                        "Found timed-out %s task %d previously running on worker %s. Prepare to re-assign",
                        task.Type, task.Index, task.WorkerID)
                    task.WorkerID = ""
                    c.availableTasks <- task
                }
            }
            c.lock.Unlock()
        }
    }()

    return &c
}
```

可点击链接 <https://github.com/Mr-Dai/MIT-6.824/blob/master/src/mr/coordinator.go> 查看我的完整实现。

### Worker

Worker 的核心逻辑比较简单，主要是一个死循环，不断地向 Coordinator 调用 ApplyForTask RPC：

 - Coordinator 返回空响应，代表 MR 作业已完成，则退出循环，结束 Worker 进程
 - Coordinator 返回 MAP Task，则
   * 读取对应输入文件的内容
   * 传递至 MR APP 指定的 Map 函数，得到对应的中间结果
   * 按中间结果 Key 的 Hash 值进行分桶，保存至中间结果文件
 - Coordinator 返回 REDUCE Task，则
   * 读取所有属于该 REDUCE Task 的中间结果文件数据
   * 对所有中间结果进行排序，并按 Key 值进行归并
   * 传递归并后的数据至 MR APP 指定的 REDUCE 函数，得到最终结果
   * 写出到结果文件

先看最外层的循环：

```golang
func Worker(mapf func(string, string) []KeyValue, reducef func(string, []string) string) {
    // 单机运行，直接使用 PID 作为 Worker ID，方便 debug
    id := strconv.Itoa(os.Getpid())
    log.Printf("Worker %s started\n", id)

    // 进入循环，向 Coordinator 申请 Task
    var lastTaskType string
    var lastTaskIndex int
    for {
        args := ApplyForTaskArgs{
            WorkerID:      id,
            LastTaskType:  lastTaskType,
            LastTaskIndex: lastTaskIndex,
        }
        reply := ApplyForTaskReply{}
        call("Coordinator.ApplyForTask", &args, &reply)

        if reply.TaskType == "" {
            // MR 作业已完成，退出
            log.Printf("Received job finish signal from coordinator")
            break
        }

        log.Printf("Received %s task %d from coordinator", reply.TaskType, reply.TaskIndex)
        if reply.TaskType == MAP {
            // 处理 MAP Task
            // ...
        } else if reply.TaskType == REDUCE {
            // 处理 REDUCE Task
            // ...
        }
        // 记录已完成 Task 的信息，在下次 RPC 调用时捎带给 Coordinator
        lastTaskType = reply.TaskType
        lastTaskIndex = reply.TaskIndex
        log.Printf("Finished %s task %d", reply.TaskType, reply.TaskIndex)
    }

    log.Printf("Worker %s exit\n", id)
}
```

然后是 MAP Task 的处理：

```golang
// 读取输入数据
file, err := os.Open(reply.MapInputFile)
if err != nil {
    log.Fatalf("Failed to open map input file %s: %e", reply.MapInputFile, err)
}
content, err := ioutil.ReadAll(file)
if err != nil {
    log.Fatalf("Failed to read map input file %s: %e", reply.MapInputFile, err)
}
// 传递输入数据至 MAP 函数，得到中间结果
kva := mapf(reply.MapInputFile, string(content))
// 按 Key 的 Hash 值对中间结果进行分桶
hashedKva := make(map[int][]KeyValue)
for _, kv := range kva {
    hashed := ihash(kv.Key) % reply.ReduceNum
    hashedKva[hashed] = append(hashedKva[hashed], kv)
}
// 写出中间结果文件
for i := 0; i < reply.ReduceNum; i++ {
    ofile, _ := os.Create(tmpMapOutFile(id, reply.TaskIndex, i))
    for _, kv := range hashedKva[i] {
        fmt.Fprintf(ofile, "%v\t%v\n", kv.Key, kv.Value)
    }
    ofile.Close()
}
```

最后是 REDUCE Task 的处理：

```golang
// 读取输入数据
var lines []string
for mi := 0; mi < reply.MapNum; mi++ {
    inputFile := finalMapOutFile(mi, reply.TaskIndex)
    file, err := os.Open(inputFile)
    if err != nil {
        log.Fatalf("Failed to open map output file %s: %e", inputFile, err)
    }
    content, err := ioutil.ReadAll(file)
    if err != nil {
        log.Fatalf("Failed to read map output file %s: %e", inputFile, err)
    }
    lines = append(lines, strings.Split(string(content), "\n")...)
}
var kva []KeyValue
for _, line := range lines {
    if strings.TrimSpace(line) == "" {
        continue
    }
    parts := strings.Split(line, "\t")
    kva = append(kva, KeyValue{
        Key: parts[0],
        Value: parts[1],
    })
}

// 按 Key 对输入数据进行排序
sort.Sort(ByKey(kva))

ofile, _ := os.Create(tmpReduceOutFile(id, reply.TaskIndex))

// 按 Key 对中间结果的 Value 进行归并，传递至 Reduce 函数
i := 0
for i < len(kva) {
    j := i + 1
    for j < len(kva) && kva[j].Key == kva[i].Key {
        j++
    }
    var values []string
    for k := i; k < j; k++ {
        values = append(values, kva[k].Value)
    }
    output := reducef(kva[i].Key, values)

    // 写出至结果文件
    fmt.Fprintf(ofile, "%v %v\n", kva[i].Key, output)

    i = j
}
ofile.Close()
```

可点击链接 <https://github.com/Mr-Dai/MIT-6.824/blob/master/src/mr/worker.go> 查看我的完整实现。

## 思考延伸

在这个 Lab 中，我们实现了 **单机多进程** 的 MapReduce 框架。在 Lab 文档的最后，也有建议同学们尝试实现 **多机分布式** 的版本。这里我就不给出具体代码了，简单分析下要做到这一点大致需要解决以下问题：

 - 调整 Worker ID 的生成方式，保证在多机分布式模式下不重复
 - 实现多机 RPC 通信。Worker 如何知道 Coordinator 的 Hostname 及端口？
 - 中间结果数据的传输？有两类方案：
   * 直接写入到如 AWS S3 等共享存储。改动成本低，但依赖外部服务
   * 参考 Google MapReduce 的做法，保存在 Map Worker 的本地磁盘，Reduce Worker 通过 RPC 向 Map Worker 拉取数据

此外，我在上文中给出的实现代码也比较简单，在大数据量的场景下也有着不小的改进空间，包括：

 - Worker 是否可以得知自己的 Task 已超出 Deadline 并主动处理？
 - 调整 Map / Reduce 函数签名，让整个 Map / Reduce 过程 Streaming 化，避免因总输入/输出数据量过大导致进程 OOM
 - 比起在 Reduce Task 开始时对完整输入数据进行全排序，也可在各个 Map Task 末尾先进行局部排序，再在 Reduce Task 开始时进行有序归并

时至今日，随着 Hadoop 生态的流行，MapReduce 的运行时实现方案已经非常成熟，上述问题的答案想必都能在 Hadoop 的实现中找到。感兴趣的读者也可在此次 Lab 后自行翻阅 Hadoop MapReduce 的源码，了解并学习我们的实现相比真实的大数据集生产环境还有哪些可以改进的地方。
