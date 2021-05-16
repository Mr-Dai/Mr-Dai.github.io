---
title: MongoDB Sharding
category: MongoDB
tags:
  - MongoDB
  - 分布式存储
  - 分布式系统
date: 2017-03-28
updated: 2017-03-28
toc: true
---

在[上一篇](/mongodb_replica_set)博文中，我详细讲解了 MongoDB Replica Set 相关的概念。作为 MongoDB 分布式解决方案之一，
Replica Set 主要用于提高 MongoDB 集群的可用性，但不难发现，同一个 Replica Set 中的 `Primary` 和 `Secondary` 
往往承受着大致相同的写压力，因此 Replica Set 实际上并不能用来提高集群的处理能力。

在这篇博文中，我将详细介绍另一种 MongoDB 分布式解决方案 —— Sharding 的相关概念，并介绍如何利用 Sharding 来对数据库进行水平拓展。

<!-- more -->

## Why Sharding?

MongoDB 提供了 Sharding 机制来为数据库系统提供横向扩展（Horizontal Scaling），生产系统可利用 Sharding 机制来存储庞大的数据集并提高系统的数据吞吐量。

当应用程序需要数据库存储更多的数据并提供更高的吞吐量时，往往单一机器的处理能力就成了数据库系统的瓶颈：高吞吐量意味着高 CPU 占用，而日渐庞大的数据集也会挑战机器的磁盘容量。

当我们拓展一个系统的性能时，往往有两种拓展方向，分别是纵向拓展（Vertical Scaling）和横向拓展（Horizontal Scaling）。

**纵向拓展**即为机器换上更强的 CPU 或者加内存加硬盘。在一定程度内，纵向拓展是可行的，但一旦超过某种程度就会出现限制：越高性能的硬件往往性价比越低。除此之外，如亚马逊和阿里云等云服务器提供商往往不会为单个实例提供过高的性能。比如，阿里云的单个 ECS 服务实例最高的配置只能去到 16 核 CPU + 64G 内存。综合考虑上述两个因素，不难看出纵向扩展是存在极限的，而且实例越接近该极限，扩展的性价比就越低。

**横向扩展**则是在不改变单个实例的配置的情况下，通过增加新的实例来扩展系统的处理能力。横向扩展的案例有很多，比如目前十分热门的分布式计算，或者只是简单的负载均衡。横向扩展允许每个实例的配置相对较低，因此横向扩展有着高得多的性价比，不会再受到限制。

具体到 MongoDB 上，其所提供的 Sharding 便是横向扩展的典型代表。采用 Sharding 构成的高可用 MongoDB 架构由多个 Shard 组成，每个 Shard 可以是一个单一的 `mongod` 实例，也可以是一个 Replica Set。Sharding 将 Collection 里的数据分成若干个块（Chunk），再将每个块分散到 Shard 中。

总的来讲，Sharding 能为 MongoDB 集群带来如下优势：

- 更高的吞吐量：Sharding 将数据集分散到了不同的 Shard 中，同时也将针对不同 Chunk 的读写压力分散到了这些 Shard 上
- 更高的存储容量：通过将数据集分散到不同的 Shard 中，每个 Shard 只需要存储部分数据集，因此横向扩展时也能够线性地提高 MongoDB 集群的存储容量
- 高可用性：Shard 集群在部分 Shard 不可用时仍然可以完成客户端发来的操作。尽管 Shard 上的数据在 Shard 不可用时也无法访问了，但针对其他 Shard 上的数据的操作仍然可以顺利完成

## Shard 集群成员

一个 MongoDB Shard 集群由如下几种成员组成：

![](https://docs.mongodb.com/manual/_images/sharded-cluster-production-architecture.bakedsvg.svg)

`Query Router`（查询路由），即 [`mongos`](https://docs.mongodb.org/manual/reference/program/mongos/#bin.mongos) 实例，是客户端与 Shard 之间沟通的桥梁，客户端只应该通过它们来访问 MongoDB 集群。Query Router 接收来自客户端的查询请求，将请求分发到对应的Shard，并收集结果返回至客户端。通常，为了减轻 Query Router 的压力，生产系统可以有多个 Query Router。

有关 Query Router 的更多内容，详见[这里](https://docs.mongodb.com/manual/core/sharded-cluster-query-router/)。

`Config Server`（配置服务器）保存着集群的元数据和配置信息，记录着每个 Shard 上保存的 Chunk 以及每个 Chunk 所关联的 Shard Key 范围。Query Router 会缓存并使用这些元信息来对接收到的读写请求进行分发，同时也在集群 Shard 发生变化时对这些信息进行修改。

从 MongoDB 3.2 版开始，Shard 集群中的 Config Server 还可以是一个 Replica Set 而不是 3 个内容完全相同的 Config Server。而从 MongoDB 3.4 版开始，对后一种方法的支持被移除，Config Server 必须是一个 Replica Set。

有关 Config Server 的更多内容，详见[这里](https://docs.mongodb.com/manual/core/sharded-cluster-config-servers/)。

`Shard` 负责存储数据。它可以是一个 `mongod` 实例，也可以是一个 Replica Set。但为了在生产环境下提供高可用，每个 Shard **必须**是一个 Replica Set。

除了一般的 Shard 以外，Shard 集群会为每一个数据库分配一个 [Primary Shard](https://docs.mongodb.com/manual/core/sharded-cluster-shards/#primary-shard) 用于保存数据库内那些没有 Shard 的 Collection 的数据。Query Router 会在创建新数据库时自动选择当前存储数据最少的 Shard 作为新数据库的 Primary Shard。

![](https://docs.mongodb.com/manual/_images/sharded-cluster-primary-shard.bakedsvg.svg)

有关 Shard 的更多内容，详见[这里](https://docs.mongodb.com/manual/core/sharded-cluster-shards/)。

## Shard 集群数据切分

MongoDB 将 Collection 内的数据分散到 Shard 上，而如何分配这些数据则取决于数据的 _Shard Key_。

### Shard Key

在对一个 Collection 进行 Shard 操作之前，我们必须先为其指定一个 Shard Key。为了支撑 Shard Key，Collection 必须在指定的域上已经建有索引，或者指定的域是该 Collection 某个复合索引的前缀，且在所有 Document 都必须存在该域。如果该 Collection 的内容为空且在 ShardKey 指定的域上不存在索引，MongoDB 则会自动创建一个索引。

MongoDB 根据 Shard Key 的值将每个 Document 放入到不同的 Chunk 中，再将这些 Chunk 平均地分配到每个 Shard 上。在将 Document 放入到 Chunk 时，MongoDB 提供了两种不同的算法，分别是基于值域分割和基于哈希值分割。

值得注意的是，一旦开始 Sharding，Shard Key 便不能再被修改，每个 Document 中 Shard Key 所关联的域的值也不能再被修改。

有关 Shard Key 的更多内容，详见[这里](https://docs.mongodb.org/manual/core/sharding-shard-key/)。

### 基于值域分割

_Range-based Sharding_ 将 Shard Key 所处的值域空间分为若干个子域，Shard Key 值位于某个子域中的 Document 则被分配到对应的 Chunk 中。例如，我们考虑一个由数字组成的 Shard Key，那么 Shard Key 本身可属的值域自然是从全局最小值直到全局的最大值。MongoDB 将这个值域分成若干个不重叠的子域，比如其中有一个子域是从 $[25, 175)$，那么所有 Shard Key 在这个范围之间的 Document 就会被分配到对应的 Chunk 之中。

![](https://docs.mongodb.com/manual/_images/sharding-range-based.bakedsvg.svg)

基于值域的分割模型可以让比较“接近”的 Document 有很高的几率被分配到同一个 Chunk 中，从而被分配到同一个 Shard 中。如此一来， Query Router 在接收到基于 Shard Key 大小比较的查询时也可以立刻得知自己应该将请求分发到哪些 Shard 中，而无需向所有 Shard 广播请求。

基于值域的分割适合有以下性质的域：

- 取值范围大
- 重复频率低
- 非单调变化

基于值域的分割模型的不足在于其可能无法把数据平均地分配在所有 Chunk 上。

更多有关值域分割的内容，详见[这里](https://docs.mongodb.com/manual/core/ranged-sharding/)。

### 基于哈希值分割

_Hash-based Sharding_ 为每个 Document 的 Shard Key 计算哈希值，并将其放入到对应哈希值域的 Chunk 中。如此一来，Document 会被分配到哪个 Chunk 可以视为是随机的，即使是值比较“接近”的 Document 也不大可能会被放入到同一个 Chunk 中。

![](https://docs.mongodb.com/manual/_images/sharding-hash-based.bakedsvg.svg)

在对一个空的 Collection 进行基于哈希值分割时，MongoDB 会自动为每个 Shard 创建两个空的 Chunk。

基于哈希值分割能够更好地将数据平均地分散在每个 Shard 上，但这样的模型无法像基于值域分割那样维持一个集群范围内的索引，当系统请求基于 Shard Key 域的范围查询时，Query Router 只能把该请求广播到每个 Shard 上了。

在使用基于哈希值分割时应尽量选择取值范围较广的域作为 Shard Key。事实上，基于哈希值的分割很适合用于那些会单调变化的域，如默认的 `_id` 或者时间戳。

更多有关哈希分割的内容，详见[这里](https://docs.mongodb.com/manual/core/hashed-sharding/)

## 数据均衡

在生产系统的日常使用中，新的数据会加入到数据库中，也有可能会有新的 Shard 加入集群。这样的事件会导致数据分布的不均衡，比如某个 Chunk 特别大，或者某个 Shard 包含特别多的 Chunk。

MongoDB 维持数据分布均衡的方法可分为两种：Split 和 Balance。

### Splitting

在某个 Chunk 的大小超过了某个[特定的数值](https://docs.mongodb.org/manual/core/sharding-chunk-splitting/#sharding-chunk-size)时，MongoDB 将对其进行 Split 操作，将其分为若干个 Chunk。

![](https://docs.mongodb.com/manual/_images/sharding-splitting.bakedsvg.svg)

Splitting 并不会带来太多的元数据变动，因为该过程实际上不会改变 Document 所处的 Shard。

更多有关 Chunk 分割的内容，详见[这里](https://docs.mongodb.com/manual/core/sharding-data-partitioning/#chunk-splits)。

### Balancing

MongoDB `Balancer` 会监控每个 Shard 上的 Chunk 数，并在其发现某个 Shard 上的 Chunk 数量到达[迁移阈值](https://docs.mongodb.com/manual/core/sharding-balancer-administration/#sharding-migration-thresholds)时，便会试图对 Chunk 进行迁移使得每个 Shard 拥有相同数量的 Chunk。

从 MongoDB 3.4 版本开始，Balancer 会作为后台进程运行在 Config Server Replica Set 的 Primary 结点上。

![](https://docs.mongodb.com/manual/_images/sharding-migrating.bakedsvg.svg)

Chunk 的迁移过程涉及元数据的大量改动。整个过程可以分为如下几个步骤：

1. Balancer 计算出迁移的计划。单次的迁移计划包括从哪个 Shard 把哪个 Chunk 转移到哪个 Shard
2. 迁移过程作为后台进程在源 Shard 和目标 Shard 上启动，指定的 Chunk 开始把当前的所有 Document 复制到目标 Shard，目标 Shard 同时构建所需的索引
3. 发送完毕后，目标 Shard 将迁移期间发生在该 Chunk 上的改动应用到它本地的 Chunk 副本中。这个过程类似于 Replica Set 的同步
4. 最后，修改 Config Server 的元数据，迁移完成，源 Shard 可以删除它的 Chunk 副本了

整个过程可能会花费大量的时间，因此 Config Server 数据的修改和源 Shard 对该 Chunk 的删除被安排在了最后。在整个过程顺利完成之前，对该 Chunk 的请求仍然会被发到源 Shard 中。在这个过程中如果发生了错误，MongoDB 也会立刻终止该过程，源 Shard 上的 Chunk 依然完好如初。
