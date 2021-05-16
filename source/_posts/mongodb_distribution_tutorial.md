---
title: MongoDB 分布式部署教程
category: MongoDB
tags: MongoDB
date: 2015-11-23
updated: 2015-11-23
toc: true
---

本文将介绍如何使用 MongoDB 提供的 Replica Set 和 Shards 功能构建一个分布式 MongoDB 集群。

<!-- more -->

## Replica Set 部署

我们先从部署一个三节点的 Replica Set 开始。

![](https://docs.mongodb.com/manual/_images/replica-set-read-write-operations-primary.bakedsvg.svg)

首先，我们要为每个 `mongod` 实例创建它自己的 `dbpath`：

```bash
mkdir 1
mkdir 2
mkdir 3
```

然后，我们便可以开始启动这三个 `mongod` 实例了：

```bash
mongod --dbpath 1 --port 27001 --replSet myRS
mongod --dbpath 2 --port 27002 --replSet myRS
mongod --dbpath 3 --port 27003 --replSet myRS
```

注意，这里我是为了在同一台机器上运行三个 `mongod` 实例，所以需要为它们分别指定不同的端口。如果是真实的分布式 Replica Set，在每台机器上使用默认的 `27017` 端口是完全可行的。

除此之外，我使用 `--replSet` 参数指定了 `mongod` 实例所属 Replica Set 的名字。这个名字是可以随意起的，但必须确保属于同一个 Replica Set 的 `mongod` 实例设置了相同的 `--replSet`，否则可能会产生一些不可预期的后果。

在顺利打开这些 `mongod` 实例后以后，不出意外的话我们应该能在输出的日志信息中看到如下记录：

```
2015-11-14T16:25:46.060+0800 I JOURNAL  [initandlisten] journal dir=3\journal
2015-11-14T16:25:46.061+0800 I JOURNAL  [initandlisten] recover : no journal files present, no recovery needed
2015-11-14T16:25:46.078+0800 I JOURNAL  [durability] Durability thread started
2015-11-14T16:25:46.078+0800 I JOURNAL  [journal writer] Journal writer thread started
2015-11-14T16:25:46.613+0800 I CONTROL  [initandlisten] MongoDB starting : pid=9812 port=27003 dbpath=3 64-bit host=mrdai-Laptop
2015-11-14T16:25:46.613+0800 I CONTROL  [initandlisten] targetMinOS: Windows 7/Windows Server 2008 R2
2015-11-14T16:25:46.613+0800 I CONTROL  [initandlisten] db version v3.0.7
2015-11-14T16:25:46.614+0800 I CONTROL  [initandlisten] git version: 6ce7cbe8c6b899552dadd907604559806aa2e9bd
2015-11-14T16:25:46.614+0800 I CONTROL  [initandlisten] build info: windows sys.getwindowsversion(major=6, minor=1, build=7601, platform=2, service_pack='Service Pack 1') BOOST_LIB_VERSION=1_49
2015-11-14T16:25:46.614+0800 I CONTROL  [initandlisten] allocator: tcmalloc
2015-11-14T16:25:46.614+0800 I CONTROL  [initandlisten] options: { net: { port: 27003 }, replication: { replSet: "myRS" }, storage: { dbPath: "3" } }
2015-11-14T16:25:46.615+0800 I INDEX    [initandlisten] allocating new ns file 3\local.ns, filling with zeroes...
2015-11-14T16:25:47.542+0800 I STORAGE  [FileAllocator] allocating new datafile 3\local.0, filling with zeroes...
2015-11-14T16:25:47.543+0800 I STORAGE  [FileAllocator] creating directory 3\_tmp
2015-11-14T16:25:47.544+0800 I STORAGE  [FileAllocator] done allocating datafile 3\local.0, size: 64MB,  took 0 secs
2015-11-14T16:25:47.551+0800 I REPL     [initandlisten] Did not find local replica set configuration document at startup;  NoMatchingDocument Did not find replica set configuration document in local.system.replset
2015-11-14T16:25:47.552+0800 I NETWORK  [initandlisten] waiting for connections on port 27003
```

可以注意到，倒数第二条记录显示 `mongod` 未能在本地数据中找到 Replica Set 的设置信息。这是正常的，因为这是第一次创建的 Replica Set。最后一条信息显示 `mongod` 启动完毕，等待外界连接它的端口。

那么，我们开始启动 Replica Set。使用 `mongo` 连入随便一个 `mongod` 实例，并进行设置：

```js
var conf = {
  _id : "myRS",
  members : [
    { _id : 1, host : "localhost:27001" },
    { _id : 2, host : "localhost:27002" },
    { _id : 3, host : "localhost:27003" }
  ]
}

rs.initiate(conf)
```

在 `conf` 中，我们将 `_id` 设置为 Replica Set 的名称，并在 `members` 中设置了 Replica Set 所有成员的信息，其中包括成员的名称 `_id` 以及成员的主机名 `host`。

> **注意**，尽管这里可以直接使用了 `IP:端口 ` 的形式来指定 `mongod` 实例，但在真实环境中，**不要**这么做，这种做法十分糟糕。不过现在搭建分布式，大家的做法似乎更倾向于为每台机器修改 `hosts` 文件。同样，**不要**这么做，这两种做法都属于 bad practice。最好的做法，是在你的集群环境中配置一台 DNS 服务器。这样，当你的某一个结点的 IP 发生变化时，你就只需要修改 DNS 服务器中的那条解析条目，而不需要修改每个结点的 `hosts` 文件了。

> 直接以数字作为每个结点的名称也是不好的做法，因为这个名称在 `mongod` 的日志信息中会经常出现。使用更加可读的名称是更好的做法。

一切正常的话，你应该会在其中一个结点上看到如下日志信息：

```
2015-11-14T16:41:54.946+0800 I NETWORK  [initandlisten] connection accepted from 127.0.0.1:61875 #1 (1 connection now open)
2015-11-14T16:41:54.951+0800 I NETWORK  [conn1] end connection 127.0.0.1:61875 (0 connections now open)
2015-11-14T16:41:54.953+0800 I NETWORK  [initandlisten] connection accepted from 127.0.0.1:61877 #2 (1 connection now open)
2015-11-14T16:41:55.013+0800 I NETWORK  [initandlisten] connection accepted from 127.0.0.1:61882 #3 (2 connections now open)
2015-11-14T16:41:55.018+0800 I NETWORK  [conn3] end connection 127.0.0.1:61882 (1 connection now open)
2015-11-14T16:41:55.078+0800 I REPL     [WriteReplSetConfig] Starting replication applier threads
2015-11-14T16:41:55.082+0800 I REPL     [ReplicationExecutor] New replica set config in use: { _id: "myRS", version: 1, members: [ { _id: 1, host: "localhost:27001", arbiterOnly: false, buildIndexes: true, hidden: false, priority: 1.0, tags: {}, slaveDelay: 0, votes: 1 }, { _id: 2, host: "localhost:27002", arbiterOnly: false, buildIndexes: true, hidden: false, priority: 1.0, tags: {}, slaveDelay: 0, votes: 1 }, { _id:3, host: "localhost:27003", arbiterOnly: false, buildIndexes: true, hidden: false, priority...(line truncated)...
2015-11-14T16:41:55.086+0800 I NETWORK  [initandlisten] connection accepted from 127.0.0.1:61884 #4 (2 connections now open)
2015-11-14T16:41:55.115+0800 I REPL     [ReplicationExecutor] This node is localhost:27003 in the config
2015-11-14T16:41:55.128+0800 I REPL     [ReplicationExecutor] transition to STARTUP2
2015-11-14T16:41:55.134+0800 I REPL     [rsSync] ******
2015-11-14T16:41:55.136+0800 I REPL     [rsSync] creating replication oplog of size: 6172MB...
2015-11-14T16:41:55.137+0800 I STORAGE  [FileAllocator] allocating new datafile 3\local.1, filling with zeroes...
2015-11-14T16:41:55.139+0800 I REPL     [ReplicationExecutor] Member localhost:27001 is now in state STARTUP2
2015-11-14T16:41:55.151+0800 I STORAGE  [FileAllocator] done allocating datafile 3\local.1, size: 2047MB,  took 0.001 secs
2015-11-14T16:41:55.153+0800 I STORAGE  [FileAllocator] allocating new datafile 3\local.2, filling with zeroes...
2015-11-14T16:41:55.161+0800 I STORAGE  [FileAllocator] done allocating datafile 3\local.2, size: 2047MB,  took 0.001 secs
2015-11-14T16:41:55.170+0800 I STORAGE  [FileAllocator] allocating new datafile 3\local.3, filling with zeroes...
2015-11-14T16:41:55.171+0800 I REPL     [ReplicationExecutor] Member localhost:27002 is now in state STARTUP2
2015-11-14T16:41:55.186+0800 I STORAGE  [FileAllocator] done allocating datafile 3\local.3, size: 2047MB,  took 0.001 secs
2015-11-14T16:41:56.198+0800 I REPL     [rsSync] ******
2015-11-14T16:41:56.198+0800 I REPL     [rsSync] initial sync pending
2015-11-14T16:41:56.200+0800 I REPL     [rsSync] no valid sync sources found in current replset to do an initial sync
2015-11-14T16:41:57.139+0800 I REPL     [ReplicationExecutor] Member localhost:27001 is now in state SECONDARY
2015-11-14T16:41:57.206+0800 I REPL     [rsSync] initial sync pending
2015-11-14T16:41:57.206+0800 I REPL     [ReplicationExecutor] syncing from: localhost:27001
2015-11-14T16:41:57.221+0800 I REPL     [rsSync] initial sync drop all databases
2015-11-14T16:41:57.222+0800 I STORAGE  [rsSync] dropAllDatabasesExceptLocal 1
2015-11-14T16:41:57.222+0800 I REPL     [rsSync] initial sync clone all databases
2015-11-14T16:41:57.229+0800 I REPL     [rsSync] initial sync data copy, starting syncup
2015-11-14T16:41:57.234+0800 I REPL     [rsSync] oplog sync 1 of 3
2015-11-14T16:41:57.239+0800 I REPL     [rsSync] oplog sync 2 of 3
2015-11-14T16:41:57.254+0800 I REPL     [rsSync] initial sync building indexes
2015-11-14T16:41:57.258+0800 I REPL     [rsSync] oplog sync 3 of 3
2015-11-14T16:41:57.265+0800 I REPL     [rsSync] initial sync finishing up
2015-11-14T16:41:57.268+0800 I REPL     [rsSync] replSet set minValid=5646f3d4:1
2015-11-14T16:41:57.274+0800 I REPL     [rsSync] initial sync done
2015-11-14T16:41:57.290+0800 I REPL     [ReplicationExecutor] transition to RECOVERING
2015-11-14T16:41:57.292+0800 I REPL     [ReplicationExecutor] transition to SECONDARY
2015-11-14T16:41:58.136+0800 I REPL     [ReplicationExecutor] could not find member to sync from
2015-11-14T16:41:58.971+0800 I REPL     [ReplicationExecutor] replSetElect voting yea for localhost:27001 (1)
2015-11-14T16:41:59.140+0800 I REPL     [ReplicationExecutor] Member localhost:27001 is now in state PRIMARY
2015-11-14T16:41:59.171+0800 I REPL     [ReplicationExecutor] Member localhost:27002 is now in state SECONDARY
```

从日志中，我们可以很清晰地看到，发起 `rs.initiate` 的 `mongod` 向其他 `mongod` 开启了连接，其他 `mongod` 获取到了我们配置的 `conf` 信息。而后，Replica Set 开始启动。首先是各结点进行初始化同步，从发起 `rs.initiate` 的 `mongod` 处同步了 oplog，并进入 `Secondary` 状态。然后，3 个 `Secondary` 发现 Replica Set 中没有 `Primary`，于是发起选举。日志里，我们甚至可以看到这个 `mongod` 把票投给了谁。最后，选举结束，`localhost:27001` 成为了 `Primary`。

## 使用 Java 驱动连接至 Replica Set

我们通过如下语句连接至单一的 MongoDB 实例：

```java
MongoClient client = new MongoClient("localhost", 27001);
```

我们为 `MongoClient` 对象指定了一个 MongoDB 实例的主机名和端口号。以这种方式初始化的 `MongoClient` 会假设目标 MongoDB 实例只是一个 standalone 的实例，如果该实例不是 `Primary` 时，客户端执行写操作则可能被该 MongoDB 实例拒绝。

通过如下语句可使 `MongoClient` 进入 Replica Set 模式：

```java
MongoClient client = new MongoClient(asList(
                         new ServerAddress("localhost", 27001)
				     ));
```

我们通过 `Arrays#asList` 方法为 `MongoClient` 传入了一个 `List`，`MongoClient` 便会进入 Replica Set 模式。在这种模式下，客户端会利用给定的主机（seedlist）来发现 Replica Set 的其他所有结点，其中就包括了 `Primary`。因此，即使 `localhost:27001` 不是 `Primary` 也没关系，客户端会通过它获知 `Primary` 的地址并自动连接至 `Primary`。

但以上做法仍不全面：如果 `localhost:27001` 进程已经挂了，或者它并不是 Replica Set 的成员，我们便无法通过上述语句连接至 Replica Set。
我们可以为构造函数传入更多的 MongoDB 实例的地址来降低这种情况发生的几率：

```java
MongoClient client = new MongoClient(asList(
                         new ServerAddress("localhost", 27001),
                         new ServerAddress("localhost", 27002),
                         new ServerAddress("localhost", 27003)
					 ));
```

当然，也有可能正好你指定的这多个结点都同时挂掉，那样自然是防不胜防了。不过，提高 Replica Set 拓扑可用性就是网络架构的问题了。当我们在执行写操作时，我们还需要考虑 `Primary` 会突然挂掉。比如说，我们正在执行这样的写操作：

```java
MongoCollection collection = client.getDatabase("foo").getCollection("bar");

for (int i = 0; i < Integer.MAX_VALUE; i++) {
    collection.insertOne(new Document("_id", new ObjectId()).append("i", i));
	Thread.sleep(500);
}
```

在执行插入时，如果 `Primary` 突然失效（如调用了 `rs.stepDown()`），那么上述代码中的 `insertOne` 方法会抛出一个错误。因此，更为健壮的做法，是为该 `insertOne` 语句加上 `try/catch` 块：

```java
for (int i = 0; i < Integer.MAX_VALUE; i++) {
	try {
        collection.insertOne(new Document("_id", new ObjectId()).append("i", i));
	} catch (MongoException e) {
	    // Handle the exception
	}
	Thread.sleep(500);
}
```

遗憾的是，抛出错误的 `insertOne` 操作恐怕无法由 MongoDB 驱动自动重试。实际上，不只是触发错误的那一次操作，在 Replica Set 自动选举出新的 `Primary` 前，所有写操作都会抛出错误。但幸运的是，由于加上了 `try/catch` 块，应用程序不会因为单次写入失败便直接退出。在触发错误后，下一次插入前驱动都会重新尝试利用 seedlist 来获取新的 `Primary` 的地址。当 Replica Set 重新选举出新的 `Primary` 后，驱动便可以再次进行写操作了。

通过观察 MongoDB Java 驱动输出的日志信息，你可以更细致地观察驱动的行为。这里就不直接给出了，有兴趣可自己尝试。

## Shard 集群部署

在本节中，我们将会在本机上部署一个完整的生产级别的 MongoDB Shard 集群。集群由 4 个 Shard 负责存储数据，其中每个 Shard 都是包含三个结点的 Replica Set。除此之外，集群还包括 4 个 `mongos` 和 3 个 Config Server。

> **注意**，用于生产环境的 Shard 集群必须遵循如下几个原则：**必须**使用 Replica Set 来作为 Shard，任何一个 Shard 的不可用都会导致集群出现异常；**必须**使用正好 3 个 Config Server，Config Server 不可用将导致整个集群不可用。除此之外，使用两个以上的 `mongos` 实例可以更好地分散压力。

4 个 Replica Set 的信息分别如下：

```json
{
  _id : "a",
  members : [
    { _id : "a1", host : "localhost:27001" },
    { _id : "a2", host : "localhost:27002" },
    { _id : "a3", host : "localhost:27003" }
  ]
}

{
  _id : "b",
  members : [
    { _id : "b1", host : "localhost:27101" },
    { _id : "b2", host : "localhost:27102" },
    { _id : "b3", host : "localhost:27103" }
  ]
}

{
  _id : "c",
  members : [
    { _id : "c1", host : "localhost:27201" },
    { _id : "c2", host : "localhost:27202" },
    { _id : "c3", host : "localhost:27203" }
  ]
}


{
  _id : "d",
  members : [
    { _id : "d1", host : "localhost:27301" },
    { _id : "d2", host : "localhost:27302" },
    { _id : "d3", host : "localhost:27303" }
  ]
}
```

### 集群各成员启动

首先我们分别启动集群的各个成员，分别是 Shard、Config Server 和 Query Router。其中前两种成员均为 `mongod`，而 Query Router 则是 `mongos`。

单个 Replica Set 的配置方式大致上无太大变化，只是作为 Shard Server 在启动 `mongod` 时需要加上<kbd>--shardsvr</kbd>选项。
以 Replica Set `a` 为例：

```bash
mkdir a{1,2,3}

mongod --shardsvr --replSet a --dbpath a1 --logpath log.a1 --port 27001 --fork
mongod --shardsvr --replSet a --dbpath a2 --logpath log.a2 --port 27002 --fork
mongod --shardsvr --replSet a --dbpath a3 --logpath log.a3 --port 27003 --fork
```

> **注意：**当 `--shardsvr` 选项被打开时，`mongod` 的默认端口号变为 **27018**。

再使用 `mongo` 连接至任意一个 `mongod` 实例，启动 Replica Set：

```js
var conf = {
  _id : "a",
  members : [
    { _id : "a1", host : "localhost:27001" },
    { _id : "a2", host : "localhost:27002" },
    { _id : "a3", host : "localhost:27003" }
  ]
}

rs.initiate(conf)
```

重复上述操作即可启动其余三个 Replica Set。

接下来开始启动 Config Server：

```bash
mkdir cfg{1,2,3}

mongod --configsvr --dbpath cfg1 --logpath log.cfg1 --port 26050 --fork
mongod --configsvr --dbpath cfg2 --logpath log.cfg2 --port 26051 --fork
mongod --configsvr --dbpath cfg3 --logpath log.cfg3 --port 26052 --fork
```

> **注意：**当 `--configvr` 选项被打开时，`mongod` 的默认端口号变为**27019**。

最后，启动 Query Router：

```bash
mongos --configdb localhost:26050,localhost:26051,localhost:26052 --logpath log.mongos1 --fork
mongos --configdb localhost:26050,localhost:26051,localhost:26052 --logpath log.mongos2 --port 26061 --fork
mongos --configdb localhost:26050,localhost:26051,localhost:26052 --logpath log.mongos3 --port 26062 --fork
mongos --configdb localhost:26050,localhost:26051,localhost:26052 --logpath log.mongos4 --port 26063 --fork
```

> **注意：**`mongos` 的默认端口号为**27017**，与 `mongod` 、 `mongo` 的默认端口号相同。

如此一来，集群的各个成员都启动完毕了，可以开始配置集群了。

### 添加 Shard

实际上，在启动 `mongos` 时，我们已经指定了集群所使用的 Config Server 的地址。接下来就是为集群指定每个 Shard 的地址了。

打开 `mongo` 连接至任意一个 `mongos`，并执行如下指令：

```bash
sh.addShard("a/localhost:27001")
sh.addShard("b/localhost:27101")
sh.addShard("c/localhost:27201")
sh.addShard("d/localhost:27301")
```

注意到，我们添加 Shard 时，输入了 Replica Set 的名称以及其中一个成员的地址。该成员并不一定得是 `Primary`，只要它是该 Replica Set 的成员，`mongos` 就能自动发现 Replica Set 的其他所有成员。

在添加了 4 个 Shard 以后，整个 Shard 集群便配置完毕，可以开始使用了。
