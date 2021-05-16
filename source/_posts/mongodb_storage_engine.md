---
title: MongoDB 存储引擎
category: MongoDB
tags: MongoDB
date: 2015-11-01
updated: 2015-11-01
toc: true
---

2015 年 3 月份，MongoDB 发布了 3.0.1 版，从原本的 2.2、2.4、2.6 升级到了最新的 3.0。大量的新功能在 3.0 版本中引入，其中包括了 MongoDB Java 驱动的大幅更新。但对于 MongoDB 数据库本身来说，可更换的数据存储引擎算得上是 3.0 最重大的更新之一。

在 3.0 之前，MongoDB 是不能像 MySQL 那样随意选择存储引擎的。而到了 3.0，MongoDB 的所使用的存储引擎可由用户自行指定。目前，用户可选择的存储引擎包括 `MMAPv1` 和 `WiredTiger`。

<!-- more -->

## 什么是存储引擎？

存储引擎是数据库与底层硬件沟通的桥梁，数据库通过调用存储引擎提供的接口来完成增删查改等操作。可以说，存储引擎也是一种硬件驱动。

对于“硬件”，这里不仅指的是计算机不同型号的 CPU、内存和磁盘的系统调用，同时还包括了 MongoDB 在硬件上存储数据的方式。比如，对于 `MMAPv1` 和 `WiredTiger`，它们所使用的索引格式就有所不同。

不难想到，数据结构和算法从来都不是面面俱到的，有些时候为了在某些方面表现出出色性能，其他方面必然就会有所欠缺。ACM 中常说的“空间换时间”也大概是这么一个道理。因此，只有了解不同存储引擎的特性才能够更好地优化数据库系统的性能。

## MMAPv1

`MMAPv1` 实际上就是 MongoDB 在 3.0 以前原有的存储引擎，在 3.0 版本它也继续作为 MongoDB 的默认存储引擎（注：MongoDB 3.2 版本将会把默认存储引擎改为 `WiredTiger`）。之所以叫 `MMAP`，实际上是因为这个存储引擎会把数据直接映射到虚拟内存上，即 “memory mapping”。我们知道，MongoDB 的客户端与服务器传输数据都是通过 BSON 格式完成的，而 `MMAPv1` 则会不做修改地将 BSON 数据直接保存在磁盘中。这一点通过观察 `/data/db` 文件夹下的文件即可获知。而 `MMAPv1` 通过将 BSON 数据直接映射到虚拟内存上，实际上也利用操作系统帮助自己完成了不少的工作。

提起 `MMAPv1`，我们这里要先讲讲它的记录分配机制。

## MMAPv1 记录分配机制

在 MongoDB 中，每条数据以 `Document` 的形式进行存储，并通过 `Collection` 来管理 `Document`。通过观察 `/data/db` 文件夹即可得知，同一个 `Collection` 中的 `Document` 会根据插入（<kbd>insert</kbd>）的先后顺序，连续地写入到磁盘的同一个区域（region）上。考虑到 MongoDB schemaless 的特性，即使是同一个 `Collection`，也会存在某些 `Document` 特别大，某些特别小的情况。除此之外，我们还要考虑到在数据库使用过程中，某些 `Document` 会因为<kbd>update</kbd>操作而变大。

`MMAP` 在第一次插入时会为每个 `Document` 开辟一小块专属的区域，你可以管它叫一个"record"（记录），或一个"slot"（record 这个名字容易和别的东西混淆，所以后面我会管它叫 slot），其他新插入的 `Document` 则必须从这一小块区域的结尾处开始写入。

首先，一个 slot 为了能完整放入一个 Document，首先它的大小必须大于等于这个 Document 的初始大小，但它的大小一旦确定，且尾部被写入了新的 Document 以后，它的大小就固定了。上面我们提到，MongoDB 的 Document 有可能因为<kbd>update</kbd>操作而变大。如果在 update 以后，Document 的大小超过了当前的 slot 怎么办？ MongoDB 采取的做法，是在 Collection 的尾部申请一个更大的 slot，并把新的 Document 整个移动过去，同时还要 update 与该 Document 相关的索引，使其指向 Document 所在的新位置。不难想象，这样的操作是比单纯的写入费时得多的，
而且 Document 原本的空间被释放以后，很可能就会形成一个空间碎片。

为了减少这样的操作的发生，MongoDB 采取的做法是在创建 slot 时，不仅使其能够放入一个 Document，同时也会预留一定的空间，称之为 padding（内边距）。这样一来，Document 在自己的专属空间中有了一定的发展空间，合适地选择 padding 的大小便能有效地降低这种操作发生的几率。在 3.0 版之前，MongoDB 尝试根据 Document 大小增加的方式来预估合适的 Padding 大小，而 3.0 则改而使用新的两种选择 padding 的策略，分别是二次幂分配（Power of 2 Sized Allocation）和无 Padding 分配（No Padding Allocation）。

## 二次幂分配策略

二次幂的空间分配策略实际上不止在 MongoDB，在其他系统或语言中都十分常见。大家接触得最多的例子，包括了 C++中的 `vector` 和 Java 中的 `ArrayList`。MongoDB 的二次幂空间分配策略，使得为每个 Document 分配的 slot 的大小从 32B 开始，不断地乘以 2，直到能够放入该 Document：即从 32B 开始，依次增加至 64B、128B、256B... 1MB、2MB，直到能够放入该 Document。当 slot 所需空间超过 2MB 以后，slot 空间的增加策略不再是依次乘以二，而只是单纯的加 2MB：即从 2MB 开始，后面依次是 4MB、6MB... 直到能够放入该 Document 或达到 16MB 的上限。相对固定的 slot 大小保证了每个 slot 为 Document 预留了一定的增长空间，同时使得 slot 扩容时，Document 未必需要移动位置。

首先，slot 扩容是因为当前 slot 无法再放入该 Document，但 slot 的扩容未必就意味着 Document 需要移动：也许该 slot 的尾部正好跟着足够多的空闲空间，那么只要直接加大当前 slot 即可，Document 的位置无需移动，同理其相关的索引也无需修改，这样便能一定程度上较小 slot 扩容的花销，同时有效地利用空间碎片。二次幂分配机制使用相对固定的 slot 大小，使得这种情况发生的几率大大增加，因为如果假设每个 slot 的初始大小都是 n 字节，如果有一个 slot 扩容时移动到了 Collection 的尾部，那么它之前的前一个 slot 便直接获得了一个 n 字节的空余空间，当那个 slot 也需要扩容时就可以正好利用上这个空间了。

## 无 Padding 分配策略

无 Padding，顾名思义，MongoDB 在采用该分配策略时，所有的 slot 都不会为 Document 预留任何的增长空间，slot 的大小与 Document 所需的大小完全一致。由于完全没有增长空间，每次 Document 的大小增加时，几乎是必然会导致 Document 移位，因此这样的分配策略并不适用于<kbd>update</kbd>操作频繁发生的 Collection。但很多情况下，Document 的大小可能确实不会变化。这意味着该 Collection 可能发生的操作只包含查询、插入、删除和不会导致大小增加的更新，如使用 `$inc` 令某个计数器自增。在这种情况下，Document 的移位可以说是不可能会发生，无 Padding 的分配策略最大地利用了磁盘的空间，使得 Document 与 Document 之间更加紧密，同理也使得查询操作的性能得到了提升。

MongoDB 默认情况下使用的是二次幂分配策略。要为某个 Collection 使用无 Padding 的分配策略，我们需要使用如下指令：

`db.runCommand({collMod: <collection-name>, noPadding: true})` 或使用如下指令显式创建一个新的 Collection：`db.createCollection(<collection-name>, {noPadding: true})`

## MMAPv1 锁机制

像 MongoDB 这样可以同时接受多个客户端发来请求的数据库系统，并发自然是个需要处理的问题，而数据同步的方法，自然是对数据文件进行加锁了。MongoDB 使用的是 Multiple-Reader-Single-Writer 锁：这意味着你可以有任意多的 Reader 同时读取数据，但这个时候其他 Writer 都会被阻塞；而当一个 Writer 获得锁时，其他所有的 Reader 和 Writer 都会被阻塞。加锁状态的转移明确了以后，还有一点需要明确的就是单次加锁的范围。

了解过 `/data/db` 目录下的文件的人都知道，每个 Collection 会被独立的存放在各自的区域里。除了 Collection 以外，还会有一个独立的区域保存着数据库的元数据，如索引信息等。对 Collection 的读写，冲突的发生大多数时候都存在于单个 Document 中，毫无疑问我们这时候只需要对涉及的相关 Document 加锁即可。这种加锁方式叫做以 Document 为单位的加锁（Document-wise locking）。而事实是，`MMAPv1` 不支持以 Document 为单位的加锁。

但这只是一方面。有时候，我们会在 Collection 以外的地方发生冲突。比如，两个操作涉及完全不同的两个 Document，但这两个操作却涉及到了同一个索引，于是在这个索引上便发生了冲突。除了索引外，如日志（Journal）等数据库元信息都是有可能发生冲突的。这个时候我们就需要比单个 Document 更大范围的锁了。

在 3.0 版本之前，`MMAPv1` 对锁请求的做法是，以 Database 为单位加锁（database-wise locking），对同一个 Database 的其他 Collection 所做的操作也会被阻塞。而到了 3.0 版本，`MMAPv1` 则开始使用以 Collection 为单位的加锁（collection-wise locking）。如此一来，MongoDB 3.0 便拥有了更好的并发性能。

## 更新更快：WiredTiger

综合上述对 `MMAPv1` 的介绍，我们不难发现 `MMAPv1` 存在着两个缺点：1. 即使是 3.0 版本更新后的 `MMAPv1` 最小也只能支持到以 Collection 为单位的加锁。由于缺乏以 Document 为单位的加锁机制，这注定 `MMAPv1` 的并发性能比较有限；2. `MMAPv1` 对 Document 的 slot 的分配机制使得 Document 的移动时常发生。尽管升级后的分配策略一定程度上减少了这种操作的发生，但这种操作依然会发生，而且发生时依然会在磁盘上留下空间碎片。这使得 `MMAPv1` 的磁盘利用率有限。

在 2014 年的 12 月，MongoDB 正式收购了 WiredTiger 公司。之后，WiredTiger 便为 MongoDB 3.0 开发了一个专用版本的存储引擎。WiredTiger 引擎的架构和算法是和 `MMAPv1` 完全不同的，结果就是使用 WiredTiger 引擎的 MongoDB 比起 MMAPv1 有了极其显著的性能提升。

我们接下来逐条看一下 WiredTiger 的优点。

## WiredTiger 的 Document 级锁机制

我们已经见识到，`MMAPv1` 对于所有操作都会使用至少为 Collection 级以上的共享互斥锁机制，这样的机制会使得整个数据库系统的并发性能下降。`WiredTiger` 在这一点上则截然不同。在平常的使用中，大多数对数据库的更新操作都只会对某个 Collection 中的少量 Document 进行更新。对多个 Collection 进行同时更新的情况已是十分稀有，对多个 Database 进行同时更新则是更为罕见了。由此可见，加锁粒度最小只支持到 Collection 是远远不够的。相对于 `MMAPv1`，`WiredTiger` 使用的实际为 Document 级的乐观锁机制。

`WiredTiger` 的乐观锁机制与其他乐观锁机制实现大同小异。`WiredTiger` 会在更新 Document 前记录住即将被更新的所有 Document 的当前版本号，并在进行更新前再次验证其当前版本号。若当前版本号没有发生改变，则说明该 Document 在该原子事件中没有被其他请求所更新，可以顺利进行写入，并修改版本号；但如果版本号发生改变，则说明该 Document 在更新发生之前已被其他请求所更新，由此便触发了一次“写冲突”。不过，在遇到写冲突以后，`WiredTiger` 也会自动重试更新操作。

但这并不代表 `WiredTiger` 对所有操作都会使用如此松散的乐观锁机制。对于某些的全局的操作，`WiredTiger` 仍然会使用 Collection 级、Database 级甚至是 Instance 级的互斥锁，但这样的全局操作实际上甚少发生，通常只会在 DBA 需要对数据库进行维护时才会被触发。在产品运行的过程中，支撑应用程序的绝大多数数据库访问和修改都不属于全局操作。

## WiredTiger 的压缩机制

相比于 `MMAPv1` 只是单纯地将 BSON 数据直接存储在磁盘上，`WiredTiger` 则会在在数据从内存存储到磁盘前进行一次数据压缩。毫无疑问，这样的处理可以更好地利用磁盘的空间，但也为服务器带来了额外的 CPU 负荷。`WiredTiger` 目前使用 `snappy` 压缩和前缀压缩两种压缩算法，其中 `snappy` 是默认的用于所有 Collection 的压缩算法，而前缀压缩则默认用于对索引的压缩。

## WiredTiger 的未来

8 个月后的今天，MongoDB 宣布即将发布 3.2 版本，而在 3.2 版本中，`WiredTiger` 替代 `MMAPv1` 成为了 MongoDB 默认的存储引擎。至此，`MMAPv1` 彻底走下神坛。尽管从 3.0 到 3.2，`WiredTiger` 的不稳定导致它暂且不能直接用于生产环境，但相信在 MongoDB 3.2 发布后，性能几倍于 `MMAPv1` 的 `WiredTiger` 将成为大家的首选。
