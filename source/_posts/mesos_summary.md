---
title: Mesos 总结
category: 分布式系统
tags:
 - Mesos
 - 集群资源调度
 - 分布式系统
date: 2017-09-04
updated: 2017-09-04
toc: true
---

这篇文章的内容主要基于 [Mesos 的论文](http://static.usenix.org/events/nsdi11/tech/full_papers/Hindman_new.pdf)总结而来。未来若有机会继续深入使用 Mesos，我会直接更新这篇文章的内容。

<!-- more -->

## Mesos 的背景及需求

当下，有越来越多如 Hadoop、Spark、Storm 等各不相同的分布式计算框架出现。每种计算框架都有自己的适用场景，不存在哪个框架可以用于解决所有的问题，因此如此多数的公司都会同时维护多种不同的分布式计算框架，根据不同的需要选择最优的框架。为了提高资源的利用率，很多公司都会需要在同一个集群上运行不同的框架。

传统的集群共享方案包括两类：

1. 将集群分为不同的分区，在每个分区上运行各个框架
2. 在集群上启动虚拟机，将虚拟机分配给框架

上述方案的问题在于，其资源分配的粒度过大，和多数计算框架是不匹配的 -- 如 Hadoop 等框架采用的都是细粒度的资源共享模型，会将作业切分为若干个短时子任务并分配到各个结点上，以提高框架的资源利用率，并通过将子任务分配到存储数据的结点上执行以提高数据本地性。

Mesos 则是一个通过提供统一接口来实现跨框架细粒度资源共享的系统。除此以外，与 Yarn 相比，Mesos 也**有意简化**了自身的设计，通过将更多的调度逻辑委托给上层框架以实现自身的高兼容性，同时确保自身的可扩展性以及可用性。

## Mesos 资源分配流程

本节主要讲述 Mesos 的集群基本组成，并描述 Mesos 资源分配的主要过程，以让读者对 Mesos 有大致的了解。

一个 Mesos 集群主要包括如下几个组件：

![](/img/mesos_summary/mesos_architecture.png)

- **Master**：Mesos 的 Master 结点，保存当前的集群信息，负责进行集群资源分配。同一时间只会有一个 Master 起作用
- **Slave**：Mesos 的 Slave 结点，运行在集群的各个机器上，负责管理宿主机的可用资源，并启动容器运行 Framework Executor
- **Framework**：如 Hadoop 等使用 Mesos 申请集群资源的上层框架
- **Scheduler**：属于 Framework，负责接收来自 Mesos Master 的 Resource Offer，并指定所需资源运行自身的任务
- **Executor**：属于 Framework，运行在 Mesos Slave 中，在 Scheduler 进行任务分配后负责运行所分配的任务

Mesos 的资源分配机制采用了一种叫做 Resource Offer（资源配给）的抽象概念来确保自身的高兼容性：Scheduler 向 Master 注册后，Master 会不时地向 Scheduler 发送 Resource Offer；此时，Scheduler 可以选择接受这个 Offer 并分配任务执行，也可以选择拒绝该 Offer。

如此一来，Mesos 实际上是将部分资源分配的控制逻辑移交到了上层框架，其所实现的实际上是**去中心化的分布式资源调度模型**。

这样的做法主要有两点好处：

1. 这使得上层框架可以根据不同的需要（如高数据本地性或强耐错）采用不同解决方案，并能够独立地迭代这些解决方案
2. 这也使得 Mesos 的功能得以最小化，减小 Mesos 系统进行功能迭代的需要

一次资源分配的过程如下图所示：

![](/img/mesos_summary/resource_offer.png)

1. Slave 会向 Master 报告其可用的资源
2. Master 调用自身的资源分配模块计算要提供给各个框架的资源，然后向对应框架的 Scheduler 发出 Resource Offer
3. Scheduler 收到 Resource Offer 后向 Master 进行响应，指定要在哪个 Slave 上用多少资源运行什么任务
4. Master 会把任务转发给 Slave，由 Slave 将指定的资源分配给框架的 Executor，再由 Executor 执行所分配的任务

## Mesos 机制详解

本节将在上一节的 Mesos 资源分配基本过程的基础之上，详细解释 Mesos 的运行机制。

### Master 资源分配模块

Master 中可以配置一个可插拔式的资源分配模块（Pluggable Allocation Module），用于决定如何将集群可用的资源分配给各个框架，使用不同的分配模块则可以采用不同的分配策略。目前已经支持的分配模块包括按优先级分配和公平分配两种。

通常情况下，Mesos 会认为框架提交的任务都是执行时间较短的小任务，因此 Mesos 只会在任务完成时执行上述的资源分配过程，进行资源的再分配。如果某个任务运行时间过程，Mesos 的资源分配模块可能会直接杀死该任务，而选择具体杀死哪个任务的策略也是由所使用的资源分配模块所决定的。

对于多数如 Hadoop 这般的框架来说，少数几个任务被杀死不会对框架的运行造成影响，但其他一些框架的任务间可能存在相互依赖关系，任务被杀死则可能对框架产生较大的影响。Mesos 为此情况提供了 Guaranteed Allocation 机制，允许框架向 Mesos 集群申请一定的资源：当框架所占用的总资源在该资源阈值之下时，框架的任务不会被杀死；反之，当框架使用的资源超过该阈值时，框架的任务则有可能被杀死。

除此以外，为了能让 Mesos 判断出何时该杀死任务，框架在无可用资源时也需要通过 API 向 Mesos 告知其对资源的需求。

### Slave 资源隔离模块

为了确保 Slave 上 Executor 间的资源隔离和准确分配，Mesos Slave 采用容器技术来为 Executor 分配资源。Mesos Slave 同样可以通过配置可插拔式的资源隔离模块来选用不同的容器技术，目前可用的实现包括了 Linux Container、Solaris 和 Docker。

### 容错机制

Mesos 的容错机制主要体现在其 Master 上。首先，Mesos Master 采用的是软状态（Soft State）容错机制：集群的完整信息会分散在 Scheduler 和 Slave 上，Mesos Master 则可以利用这些信息重建其内部状态。具体而言，Master 会保存的信息包括 Slave 列表、Framework 列表以及当前正在执行的任务列表。与此同时，Mesos Master 会借由 ZooKeeper 集群进行多机热备，当一个 Master 不可用时另一个 Master 就会接替它的位置，Slave 和 Scheduler 也会连接到新的 Master 上。

除了 Master 的容错以外，Mesos 还会把结点故障和 Executor 失效等信息回报给 Scheduler，由 Scheduler 来负责处理这部分失效事件。

为了让上层框架能够处理 Scheduler 失效的问题，Mesos 还允许框架向 Mesos 注册多个 Scheduler，并由 Mesos Master 在某个 Scheduler 失效时通知另一个 Scheduler 接替它的位置。

## Mesos 最佳场景

如前文所述，Mesos 所实现的是去中心化的分布式资源调度模型，交由各个框架的 Scheduler 来决定接受哪些 Offer，实际的资源使用将由框架进行控制，而不是由 Mesos 本身进行控制。这样的做法无疑在确保 Mesos 高兼容性的同时也降低了 Mesos 的复杂度，但正如其他去中心化方案一样，它的表现是有可能比中心化调度器要差的。因此，在使用 Mesos 时，了解 Mesos 表现最佳的场景是有必要的。

从论文第 4 章的论证可以得出结论：如果上层框架的规模能够弹性地伸缩、任务持续时间均大体相当，且框架都会均等地选择使用各个结点时，Mesos 能有十分出色的表现；如果不同的框架倾向于使用不同的集群结点，Mesos 的行为近似于一个在各个框架间公平分配资源的中心化调度器；除此以外，只要框架能确保在大多数时候使用短任务，那么即使任务的持续时间存在差异也不会对框架的性能产生很大的影响。

由此，Mesos 实际上鼓励框架满足以下几点性质以提高其作业的响应时间：

1. **短任务**：框架使用短任务时，Mesos 也更容易为短任务预留资源；除此，在一个任务中只做少量工作也能减小 Mesos 主动杀死任务或结点失效时对框架的影响
2. **弹性伸缩**：框架应能够在获得资源时立刻使用它们，而不是花上较长的时间等到可分配资源达到某个最小阈值
3. **不接受不明资源**：框架不应接受其不能使用的资源，因为这会对多数资源分配策略造成影响

## 可能存在的问题与解决方案

Mesos 的机制无疑是简单高效且可行的，但这样的设计固然也存在着它的不足，论文中也对这部分的内容进行了一定的讨论。本节将分别讨论各种可能存在的问题以及 Mesos 的解决方案。

### Resource Offer 轮询

由于 Mesos 采用 Resource Offer 推送的方式进行资源分配，Mesos 无法预先得知某个框架是否会接受某个 Resource Offer，必须进行一次推送请求。事实是，Mesos 有可能在轮询过多个框架后才能找到接受该 Offer 的框架，浪费过多的时间。

为此，框架能以布尔表达式的形式向 Mesos 注册 Offer Filter，不通过该 Filter 判断代表框架将永远不接受这样的 Offer。如此，Mesos 便能避免过多的网络请求。

实际上，当确保框架的任务都是细粒度时，即便不使用 Filter 也不会对集群的性能产生较大的影响。

### Offer 响应等待

Mesos 的 Resource Offer 推送本质上是网络请求，那么便存在网络延时、网络超时等问题。实际上，当 Offer 发出后，Mesos 就会认为这部分资源已被分配给该框架，直到该框架进行响应。这也就要求 Scheduler 在收到 Offer 后必须尽快响应，或者通过 Filter 来过滤部分 Offer。

除此以外，当超出一定时间后 Master 仍未收到 Offer 响应时，Master 就会撤回这部分资源分配并将其提供给其他框架。

### 资源碎片化

如果任务所需要的资源各不相同的话，那么 Mesos 对不同框架的资源分配可能无法像中心化的调度器那样对资源分配进行优化。不过值得注意的是，在这种情形下产生的资源浪费实际上和最大任务体积与最小结点体积间的比例相关，因此即便存在这样的情况，对于使用“较大”结点（如多核机器）运行“较小”任务的集群来说，使用分布式调度仍然能够提供较高的资源利用率。

另一个可能存在的问题是：假设集群目前有大量资源需求较小任务需要运行，如果此时某个框架有较大的资源需求，那么该框架可能会发生饥饿现象（Starvation），长时间得不到资源分配，因为当现有的小任务完成后，其释放出来的资源可能会被另一个小任务立刻抢走。为了解决这样的问题，Master 资源分配模块可以为每个 Slave 设定**最小供给资源量**（Minimum Offer Size），一直到 Slave 上的可用资源达到该阈值时才向框架发出 Resource Offer。

### 上层框架复杂度增加

将资源调度逻辑交由上层框架完成固然会增加框架的复杂度，但这样的复杂度增加并不一定是坏事。

首先，无论是使用 Mesos 还是其他的中心化调度方案，框架都必须清楚自己的资源使用偏好：在使用中心化的调度器时，框架需要向该调度器告知其资源偏好，而使用 Mesos 时则需要框架基于这些偏好来决定接受哪些 Resource Offer。

除此以外，许多现有框架的调度策略采用的都是即时算法，因为框架无法预测每个任务的所需时间，它们需要能够对失效的任务或进度落后的任务（Straggler）作出处理。使用 Resource Offer 机制，框架能够很好地实现这些调度策略。
