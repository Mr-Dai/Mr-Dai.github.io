---
title: MongoDB Replica Set
tags:
 - MongoDB
 - Replica Set
date: 2017-03-28
---

本篇文章将脱离基本的 MongoDB 数据存储和操作，立足于 MongoDB 提供的高可用方案。MongoDB 的高可用方案包括 Replica Set 和 Sharding，这篇文章将介绍 MongoDB 的 Replica Set。

<!-- more -->

## 什么是 Replica Set

Replica Set 由一组 `mongod` 实例组成，这些 `mongod` 都维护着相同的数据集，通过冗余备份的方式提高数据的可用性。其中一个被称为 `Primary`（等同于 `Master`）的 `mongod` 负责接收所有客户端发来的写操作请求。其他被称为 `Secondary`（等同于 `Slave`）的 `mongod` 也会执行相同的操作，以与 `Primary` 进行同步。

![](https://docs.mongodb.com/manual/_images/replica-set-read-write-operations-primary.bakedsvg.svg)

`Primary` 会将发生在数据集上的改动记录在自己的 [oplog](#oplog) 中，其他 `Secondary` 则负责复制 `Primary` 的 oplog，并把相关的改动应用在自己的数据集上。由此，`Secondary` 将始终持有与 `Primary` 完全相同的数据。

Replica Set 中的任何成员都可以接受客户端发来的读请求，但默认情况下，应用程序的驱动程序只会把读请求发往 `Primary`，客户端必须通过显式设置 [Read Preference](#read_preference) 才能改变这种行为。

整个 Replica Set 通过在实例间发送心跳信号来互相知会哪些实例在正常运转，任意一个实例都会与其他所有实例进行心跳通信。

![](https://docs.mongodb.com/manual/_images/replica-set-primary-with-two-secondaries.bakedsvg.svg)

当 `Primary` 超过 10 秒不与 Replica Set 中其他成员通信时，Replica Set 则认为该 `Primary` 因各种原因不可用了（断电、断网、死机）。此时，`Secondary` 们会开始[选举](#election)，得票最高的 `Secondary` 则成为新的 `Primary`。Replica Set 的这项特性被称为 [Automatic Failover](#automatic-failover)（自动恢复）。

![](https://docs.mongodb.com/manual/_images/replica-set-trigger-election.bakedsvg.svg)

通过配置，负责维持备份数据的 `Secondary` 结点还能成为如下三种特殊 `Secondary` 结点：

- [Priority 0 `Secondary`](https://docs.mongodb.com/manual/core/replica-set-priority-0-member/)：优先级为 `0` 的 `Secondary` 结点，无法在 `Primary` 不可用时被选举为 `Primary`，适合作为次级数据中心的 `Secondary` 结点
- [Hidden `Secondary`](https://docs.mongodb.com/manual/core/replica-set-hidden-member/)：Hidden `Secondary` 对客户端不可见，客户端无法将读请求发往 Hidden `Secondary`。Hidden `Secondary` 同时也必须是 Priority 0 的
- [Delayed `Secondary`](https://docs.mongodb.com/manual/core/replica-set-delayed-member/)：Delayed `Secondary` 会在指定的延时后才应用 `Primary` oplog 上的记录，其维护的数据反映了整个 Replica Set 在一定时间以前的状态。Delayed `Secondary` 必须也是 Priority 0 的，也应该是 Hidden 的

除此之外，Replica Set 中还可以存在一种特殊的 `Secondary` 结点，它不负责备份任何数据，只负责在 `Primary` 不可用时进行投票，这样的 `Secondary` 被称为 [`Arbiter`](#arbiter)（仲裁者）。

![](https://docs.mongodb.com/manual/_images/replica-set-primary-with-secondary-and-arbiter.bakedsvg.svg)

在 `Primary` 不可用时，其他某个 `Secondary` 可能成为新的 `Primary`，而原本的 `Primary` 在重新上线后变为 `Secondary`，但 `Arbiter` 永远都是 `Arbiter`。

<h2 id="data-synchronization">Replica Set 主从数据同步</h2>

为确保每个 `Secondary` 上都能保持一份最新的数据备份，Replica Set 的实例间会相互进行同步。

具体来说，MongoDB 所使用的同步方式可以被分为两种形式：

- MongoDB 会使用[初始化同步](#initial-sync)为新加入的成员在本地迅速生成一份完整的数据备份
- 之后，`Secondary` 便不断地将数据集发生的变化同步应用在自己的数据集上，以确保自己的数据集能和 `Primary` 保持同步。

接下来我们就分开来看一下这两种同步形式。

<h3 id="initial-sync">初始化同步</h3>

初始化同步（Initial Sync）相当于从同步源将整个数据集复制到本地。在以下两种情况下会触发 `mongod` 的初始化同步操作：

- 一个新的 `mongod` 实例加入了 Replica Set
- 某个已经加入 Replica Set 的 `mongod` 实例由于种种原因，其同步状态落后过多，以至于 `Primary` 的 oplog 中那些它还未同步的修改记录已经被覆写

初始化同步操作大概包含 2 个方面：

- 复制同步源上除 `local` 数据库以外的所有数据。这个过程也会同时构建索引；
- 使用同步源的 oplog 将后来发生的数据集变动应用到本地的备份数据集上。这个过程在后面会一直进行，以始终确保 `Secondary` 的同步性

在上述两步完成后，新的节点也就会进入到了正常运转的状态，成为一个可用的 `Secondary`。

有关手动触发初始化同步的更多细节，详见[这里](https://docs.mongodb.org/manual/tutorial/resync-replica-set-member/)。

### 后续数据同步

在完成初始化同步后，`Secondary` 便会持续地从其同步源处同步数据，异步地读取同步源 oplog 上的新纪录并应用到自己的数据集上。

值得注意的是，`Secondary` 的同步源并不一定是 `Primary` 结点，其同步源也有可能随着结点间 Ping 延时长短和状态的变化而发生改变。

<h2 id="oplog">Replica Set Oplog</h2>

`Oplog`（Operations Log）用于保存所有应用在数据库上的数据修改。MongoDB 会把数据库的写操作发往 `Primary`，
由 `Primary` 将该操作所产生的数据修改记录到 oplog 上。其他所有的 `Secondary` 异步地将 `Primary` 的 oplog
复制到本地并将其中的数据修改应用到自己的数据集中。

所有的 `mongod` 实例都会有一个自己的 oplog。Oplog 实际上储存在 Collection `local.oplog.rs` 中，而这是一个 [Capped Collection](https://docs.mongodb.com/manual/core/capped-collections/)（大小固定的 Collection，当达到容量上限时会覆写旧的 Document）。

有关 oplog 的更多信息，详见[这里](https://docs.mongodb.com/manual/core/replica-set-oplog/)。

### Replica Set 数据同步的异步性

`Secondary` 与 `Primary` 之间的同步实际上是异步的。当用户发送写操作到 `Primary` 时，`Primary` 在 oplog 上写下记录并将操作应用在自己的数据集上，然后便会立刻向客户端返回写操作的结果（成功或失败、修改了多少个 Document）。如果使用线程同步的同步操作，`Primary` 则会等到所有的 `Secondary` 都将该操作应用到自己的数据集上时才向客户端返回响应，而 MongoDB Replica Set 的同步操作是异步的，`Primary` 不会等待其他 `Secondary`。`Secondary` 会通过心跳信号发现 `Primary` 的 oplog 上的新修改，而后将其复制到自己的 oplog，并应用在自己的数据集上。

### Oplog 记录的幂等性

`Primary` 并不会把用户传来的写操作直接原封不动地记录在 oplog 上，oplog 上记录的操作必须确保是幂等的（idempotent）。所谓幂等，即指这些操作对于同一个 Collection，无论应用多少次都应产生相同的结果。

举个例子。比如说我们发送了一个删除记录的请求：`db.users.remove({ age : 30 })`。这个记录删除掉 `users` 中所有年龄为 30 的用户记录。这个操作不是幂等的，因为对于同一个 `users`，`users` 中实际存放的数据会影响执行的结果。实际上，`Primary` 接收到这样的请求，真正记录到 oplog 上的记录会是：

```js
db.users.remove({ _id : ... })
db.users.remove({ _id : ... })
db.users.remove({ _id : ... })
db.users.remove({ _id : ... })
db.users.remove({ _id : ... })
```

也就是说，`Primary` 会先计算这个操作所会影响的 Document，并在 oplog 中写下对这些 Document 的修改。正是由于 `_id` 的唯一性，我们可以确保这样的操作记录是幂等的。

<h2 id="read-preference">Read Preference</h2>

客户端可以使用 Read Preference 来决定将读操作发往 Replica Set 的哪个成员。

![](https://docs.mongodb.com/manual/_images/replica-set-read-preference.bakedsvg.svg)

默认的 Read Preference 会把读操作发往 `Primary`。考虑到 Replica Set 数据同步的异步性，`Secondary` 的备份数据集实际上总是滞后于 `Primary` 的，其滞后程度甚至有可能十分严重以至于其实际上已经和 `Primary` 失去同步。客户端是没有办法得知某个 `Secondary` 具体滞后多少的。因此，将读操作发往 `Primary` 可以确保拿到的数据只会是最新的数据。

而对于那些对数据同步性要求不是那么高的应用程序，将读操作发往距离客户端最近的 Replica Set 成员可以有效地降低 `Primary` 的压力，提高客户端请求的响应速度。总的来讲，可以直接从 `Secondary` 读取数据的应用程序用例包括如下几种：

- 执行不会影响前端应用程序的系统操作
- 直接从位于本地的 Replica Set 成员读取数据。在这种情况下，`Primary` 可能距离客户端十分遥远，一次读操作光是花费在链路上的时间可能就达到了上百毫秒，
	而直接访问位于本地数据中心的 `Secondary` 往往可以在几毫秒之内得到响应
- 确保应用程序在 `Primary` 不可用时不会受到影响。尽管 MongoDB 有着自动恢复的特性，但仍然需要花费几十秒的时间来重新选举出一个新的 `Primary`

但实际上，更多时候我们并不推荐使用这种读取模式，因为：

- Replica Set 中的每个成员都有着大致相同的写操作压力。尽管写操作会被直接发往 `Primary`，但数据的同步使得这些操作也会发生在每一个 `Secondary` 上，
	而每一个写操作往往都隐含着读操作，因此 Replica Set 的每个成员也有着大致相同的读操作压力；
- Replica Set 的数据同步是异步的，这意味着 `Secondary` 的数据必然或多或少落后于 `Primary`，从 `Secondary` 读取数据很有可能会拿到过时的数据；
- 读操作分布在 `Secondary` 上，这同样要求在某个 `Secondary` 不可用时，其他 `Secondary` 要能够处理所有这些多出来的请求。在某种程度上，
	这样的读取模式会使得系统的可用性难以估量；

总的来看，在大多数时候，使用 Sharding 来分散压力会是更好的选择。我将在之后的文章里介绍 MongoDB 的 Sharding 功能。

MongoDB 驱动所支持的 Read Preference 包括如下几种：

| Read Preference 模式 | 功能 |
| --- | --- |
| [primary](https://docs.mongodb.org/manual/reference/read-preference/#primary) | 默认的模式，所有读操作都发往 `Primary` |
| [primaryPreferred](https://docs.mongodb.org/manual/reference/read-preference/#primaryPreferred) | 优先将读操作发往 `Primary`，仅在 `Primary` 不可用时才把读操作发往 `Secondary` |
| [secondary](https://docs.mongodb.org/manual/reference/read-preference/#secondary) | 所有读操作都发往 `Secondary` |
| [secondaryPreferred](https://docs.mongodb.org/manual/reference/read-preference/#secondaryPreferred) | 优先将读操作发往 `Secondary`，仅在所有 `Secondary` 都不可用时才把读操作发往 `Primary` |
| [nearest](https://docs.mongodb.org/manual/reference/read-preference/#nearest) | 将读操作发往与客户端有着最低网络延迟（最“近”）的 Replica Set 成员，不管它是 `Primary` 还是 `Secondary` |

有关 Read Preference 的更多内容，详见[这里](https://docs.mongodb.org/manual/core/read-preference-mechanics)。

<h2 id="write-concern">Write Concern</h2>

前文的 Read Preference 决定了驱动程序从 Replica Set 读取数据时的行为，而相对的 Write Concern 则决定了驱动程序写数据时的行为。

实际上，比起只用于 Replica Set 的 Read Preference，Write Concern 还适用于 standalone 的 MongoDB 实例。驱动程序在发出写操作请求时同时发出 Write Concern，MongoDB 实例则会根据 Write Concern 的设置来决定什么时候给客户端返回写操作成功的响应。因此，对于越强的 Write Concern，当 MongoDB 成功返回响应时，你就更能确定数据已被安全保存。但实际上，越强的 Write Concern 往往需要更多的时间等待 MongoDB 返回。

Write Concern 由三个参数组成，分别是 `w` 、 `j` 和 `wtimeout`。接下来将一一介绍。

### w 参数

`w` 参数决定了 MongoDB 在多少个实例上写入数据后返回响应。该响应实际上是在 MongoDB 将数据写入到内存缓存后返回，因此返回后仍有可能因为断电等原因导致内存缓存丢失从而丢失该操作引起的数据修改。更高等级的 Write Concern 需由 `j` 参数给出，我们将在后文讲述。

`w` 参数可选的值包括如下：

| 值 | 功能 |
| --- | --- |
| `1` | 默认值，在 standalone 的 MongoDB 实例或者 Replica Set 的 `Primary` 成功执行该写操作后返回响应 |
| `0` | 完全关闭 MongoDB 的执行响应，但由网络错误引起的 Exception 仍会抛出。值得注意的是，即使使用了该设定，如果你还用 `j` 参数要求 MongoDB 返回日志提交的响应，MongoDB 还是会返回写操作响应的 |
| 大于 `1` 的任意整数 | MongoDB 会确保该操作顺利传播到指定数量的 Replica Set 成员上再返回。如果设定的值大于 Replica Set 的总成员数，MongoDB 会继续等待那些“不存在”的成员接收到该操作，这意味着驱动可能会一直阻塞。此时我们应搭配使用 `wtimeout` 参数 |
| `"majority"` | MongoDB 确保该操作顺利传播到大多数 Replica Set 数据成员上后再返回 |
| `<tag set>` | MongoDB 确定该操作顺利传播到属于给定 Tag Set 的 Replica Set 成员上后再返回。关于 Tag Set，详见[这里](https://docs.mongodb.org/manual/tutorial/configure-replica-set-tag-sets/#replica-set-configuration-tag-sets)。|

### j 参数

`j` 参数决定了 MongoDB 是否要在将该操作成功写入到日志后再返回。`j` 参数只有两种值：`false` 和 `true`。当设定 `j: true` 时，驱动将会等待 MongoDB 把该写操作记录到日志上以后再返回。

通常情况下，`j: true` 意味着最高级别的 Write Concern —— 操作一旦记录到日志上以后就意味着该改动已被安全保存，即使因断电导致内存数据丢失，MongoDB 实例在重新启动时也可根据日志恢复该操作。不过，对于 Replica Set 的 `Primary ` 而言，如果该操作在传播到其它 Replica Set 成员的 oplog 之前，该 `Primary` 就降级了的话，在该结点重新上线时还是会回滚该操作，导致该操作丢失。因此，对于 Replica Set 而言，最安全的做法是 `{w: "majority", j: true}`。

### wtimeout 参数

`wtimeout` 参数只在 `w` 参数被设定为大于 `1` 的值时才会生效，它用于为 Write Concern 设定以**毫秒**为单位的超时时间，在时限到达后直接抛出错误。

如果你设定的 `w` 参数值大于 Replica Set 当前成员数且没有设置 `wtimeout`，驱动将会一直阻塞。设定 `wtimeout: 0` 会使 MongoDB 忽略 `wtimeout` 参数。

关于 Write Concern 的更多内容，请看[这里](https://docs.mongodb.org/manual/core/write-concern)和[这里](https://docs.mongodb.org/manual/reference/write-concern/)。

<h2 id="automatic-failover">Replica Set 自动恢复</h2>

MongoDB Replica Set 的高可用性体现在其所提供的自动恢复功能（Automatic Failover）上。当 Replica Set 的 `Primary` 因各种原因而不可用时，Replica Set 的自动恢复特性使得某个 `Secondary` 可以升级为 `Primary` 而替代原本的已经不可用的 `Primary`。这个过程是完全自动的，不需要任何人的手动干预即可自然发生。

Replica Set 的自动恢复特性包含两个方面：

- `Secondary` 会在发现 `Primary` 不可用时进行[选举](#election)，获得最高票数的 `Secondary` 成为新的 `Primary`
- 有些情况下，自动恢复的过程可能还需要进行一次[回滚](#rollback)

接下来我们逐个看一下这两种不同的恢复动作。

<h3 id="election">Replica Set 选举</h3>

Replica Set 会使用选举的形式来决定谁成为 `Primary`。这个过程在启动 Replica Set 时就会发生一次。在 Replica Set 运行的过程中，每当其他 `Secondary` 达成共识认为 `Primary` 已经不可用时，它们就会发起一次选举，得票数最高的 `Secondary` 成为新的 `Primary`。

![](https://docs.mongodb.com/manual/_images/replica-set-trigger-election.bakedsvg.svg)

尽管这样的功能十分 fancy，但选举的过程仍然是需要时间的。在进行选举时，整个 Replica Set 没有 `Primary`，因此整个 Replica Set 也无法接受任何写操作，所有的结点都会是只读的。因此，MongoDB 会尽可能地避免进行选举。

除了上述两种情况，当 `Primary` 降级时，Replica Set 也会进行一次选举。总的来说，`Primary` 在如下情况下会降级：

- 接收到 [`replSetStepDown`](https://docs.mongodb.org/manual/reference/command/replSetStepDown/#dbcmd.replSetStepDown) 命令
- 某个 `Secondary` 被选举为新的 `Primary` 而且它有更高的优先级
- `Primary` 无法连接到 Replica Set 中的其他大多数成员（`Primary` 会得出自己已经断网了的结论）

Replica Set 通过让每个成员相互之间发送心跳信号来判断某个成员是否已经变得不可用。因此，成员所处的网络拓补结构将会影响选举的结果。在选取网络拓补结构时，我们应确保在某个 `Primary` 节点不可用时，剩下的节点确实能够选举出新的 `Primary`，因为 `Secondary` 成为新的 `Primary` 除了需要得到最高的票数，还需要其所得票数达到集群的总票数的大多数。如果有相当一部分成员同时不可用，Replica Set 将始终无法收集到足够多的票数，那么 Replica Set 将无法选举出新的 `Primary`。由此，我们应该将 Replica Set 的大多数投票成员以及所有可以成为 `Primary` 的成员放置在与应用程序系统相同的设施中，使得 Replica Set 不至于因为网络隔离而无法收集到大多数成员的选票。

更多有关选举的内容，详见[这里](https://docs.mongodb.org/manual/core/replica-set-elections/)。

<h3 id="rollback">回滚</h3>

Replica Set 的 `Secondary` 在发现 `Primary` 已经不可用前是需要花费一些时间的：每个成员每隔 2 秒会发送一次心跳信号，如果该心跳信号在 10 秒内没有收到某个节点的响应，则这个节点被标记为“不可达”；当大多数 `Secondary` 都将 `Primary`标记为“不可达”时，它们才会达成共识认为 `Primary` 已经从 Replica Set 不可达。而原本的 `Primary`如果只是从大多数节点不可达但不是因为断电或死机之类的原因导致其不可用的话，它在意识到自己已经不可达并主动降级为 `Secondary`前也需要一定的时间。

然而网络环境是复杂的。有些时候，Replica Set 成员间的不可达并不代表这个结点是客户端所不可达的。在 Replica Set 的 `Secondary`选举出新的 `Primary` 以及原有的 `Primary` 主动降级之前，只要客户端仍能连接上原本的 `Primary` ，那么客户端就会认为一切正常，依旧将写操作发往这个原有的 `Primary`，即使由于该 `Primary` 已与大多数 `Secondary` 无法连接，这些写操作很有可能永远不会被同步到其他 `Secondary` 上。

在选举的过程中，`Secondary` 们会倾向于将票投给拥有最“新”的备份数据（上一次备份时间最近）的 `Secondary`。但尽管如此，原本的 `Primary` 仍然可能已经执行了其他所有 `Secondary` 都没有同步的数据修改。在原本的 `Primary` 降级为 `Secondary`，或者说它以 `Secondary` 的身份重新加入 Replica Set 时，这些数据修改是仍然会保留在它的本地数据里的。

这个时候，为了让它与新的 `Primary` 进行同步，它会根据自己的 oplog 对本地数据进行回滚，撤销那些未同步的数据修改，然后再从新的 `Primary` 上同步新的数据修改。

当回滚发生后，被回滚的数据会以 [BSON](https://docs.mongodb.com/manual/reference/glossary/#term-bson)文件的形式保存在 [dbPath](https://docs.mongodb.com/manual/reference/configuration-options/#storage.dbPath)目录下的 `rollback/` 目录中，文件名格式为 `<database>.<collection>.<timestamp>.bson`。管理员可以使用 [bsondump](https://docs.mongodb.com/manual/reference/program/bsondump/) 工具查看具体内容并自行决定如何处理。

由于 MongoDB 的这项设置，我们需要确保 Replica Set 中的成员全都有着大致相同的性能。由于网络不可达而导致回滚是一回事，但如果 `Secondary` 由于性能限制无法跟上 `Primary` 的节拍，`Secondary` 的备份数据则会始终落后于 `Primary`，也就导致 `Primary` 在降级时需要回滚更多的操作了。

为保证部分关键的写操作数据不因 `Primary` 不可用而导致被回滚，客户端可在请求时使用 `{w: "majority"}` Write Concern来确保该写操作能顺利传递到其他 Replica Set 成员上。

由此我们也可以认识到，同一个 Replica Set 中的所有成员都始终经受着大致相同的读写压力，企图通过将读操作分布在不同的 Replica Set成员上来提高吞吐量并不是最好的做法，更好的做法应该是使用 Sharding。

更多有关回滚的内容，详见[这里](https://docs.mongodb.org/manual/core/replica-set-rollbacks/)。

<h2 id="arbiter">Arbiter</h2>

正如我之前所说，一旦涉及到分布式，网络环境可能出现的情况是繁杂多样的，我们很难考虑全面。考虑这么一种情况：你的 Replica Set 中有两个服务器，突然 `Primary` 不可用了。实际上在这个时候，你的 Replica Set 无法进行自动恢复，因为整个 Replica Set 中只剩下一个可用的 `Secondary`，它无法获得“大多数”的选票，因为它只能获得它自己的那一票，而整个 Replica Set 总共应有两张票，50% 可不是“大多数”。

最直观的解决方案，便是为 Replica Set 引入一名新的成员。在成员数为 3 的情况下，任意一名成员不可用都不会导致 Replica Set 无法自动恢复，因为新的 `Primary` 会在选举时获得 2/3 的票数，正好属于“大多数”。

但这个解决方案有个不好的地方。我们引入一个新的节点只是为了打破原有结构的选票平局，我们真正需要的是它的选票。但加入 Replica Set成为 `Secondary` 意味着它也要备份 `Primary` 的数据，经受和 `Primary` 相当的写压力，也就要求它的性能起码能与 `Primary` 相当了。这么想来，性价比还是比较低的。MongoDB 为此提供的解决方案，便是 `Arbiter`（仲裁者）。

![](https://docs.mongodb.com/manual/_images/replica-set-primary-with-secondary-and-arbiter.bakedsvg.svg)

`Arbiter` 也是 Replica Set 的成员，但它不是 `Secondary`：`Arbiter` 会在 Replica Set 发起选举时参与投票，但它不会像 `Secondary` 那样备份 `Primary` 的数据，而这正是我们想要的：我们想要的就是 `Arbiter` 的投票能力。没有了备份 `Primary` 数据所带来的读写压力，`Arbiter` 的性能要求实际上会很低很低，我们完全可以用一台小型机来支撑起一个担任 `Arbiter` 的 `mongod`。

更多关于 Arbiter 的内容，详见[这里](https://docs.mongodb.com/manual/core/replica-set-arbiter/)。

## 结语

关于 MongoDB 高可用解决方案之一的 Replica Set，其分布式备份的功能固然使其需要考虑更多的情况。本文只是对 Replica Set 相关概念的一个 Intro，想要了解更多详细内容还需读者自行查阅 MongoDB 的[官方文档](https://docs.mongodb.com/manual/replication/)。

Anyway, I did what I could. Hopefully you can enjoy it.
