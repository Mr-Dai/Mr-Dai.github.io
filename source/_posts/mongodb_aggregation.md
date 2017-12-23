---
title: MongoDB Aggregation
category: MongoDB
tags: MongoDB
date: 2015-11-12
---

在[之前的文章](/mongodb/2015/06/11/MongoDB-CRUD.html)中，我总结了 MongoDB CRUD 操作的基本方法，而本文将会介绍 MongoDB 的 Aggregation Framework。

<!-- more -->

MongoDB 的 Aggregation 操作的灵感主要源于 SQL 的 Aggregation 操作。在 SQL 中，我们可以通过 `count` 、 `sum` 等运算符来为某张表的数据进行统计。比如，为了统计每个电子设备制造厂商所发行的设备的种数，我们可能会这样写：

```sql
SELECT manufacturer, count(*)
  FROM products
```

由此，我们便能获得统计结果，比如苹果发行了 10 种不同的电子设备。MongoDB 同样也为用户提供了对 Aggregation 操作的支持。通过运用 MongoDB 的这项功能，我们同样可以达成如上述 SQL 语句那般的效果。接下来我们就来学习一下 MongoDB Aggregation 的基本使用方法。

## Aggregation Pipeline

MongoDB Aggregation 使用 Pipeline 的形式来组织用户指定的操作。使用过 Unix 或 Linux 的读者应该对 Shell 的管道操作十分熟悉了，不过即使你没有学过也没有关系。接下来将通过实际操作来演示 MongoDB 的 Aggregation Pipeline。

假设我们有一个叫做 `zips` 的 Collection（数据文件可在[这里](http://media.mongodb.org/zips.json)下载到），这个 Collection 的模式大致如下：

```js
{
  "_id": 35004,
  "city": "ACMAR",
  "loc": [
    -86.51557,
    33.584132
  ],
  "pop": 6055,
  "state": AL
}
```

可以看到，`zips` 中的一条 Document 以城市的邮政编码（zip）作为 `_id`，并给出了城市名 `city` 、城市坐标 `loc` 、城市人口 `pop` 以及城市所属州的缩写 `state`。

上述 Collection 的模式并不复杂，如果忽略 `loc` 字段，剩余的模式完全可以直接作为关系型数据库的表模式。那么假设我们有这么一条 SQL 语句：

```sql
  SELECT city, sum(pop) AS population
    FROM zips
   WHERE state = "NY"
GROUP BY city
```

不难看出，上述语句计算的是纽约州每个城市的总人口（我并不是很懂 SQL，写错了别打我）。那么在 MongoDB 中，同样的操作是这样写的：

```js
db.zips.aggregate([{
    $match: {
      state: "NY"
    }
  }, {
    $group: {
      _id: "$city",
      population: { $sum: "$pop" }      
    }
  }, { 
    $project: {
      _id: 0,
      city: "$_id",
      population: 1,
    }
  }
])
```

首先这里出现了三个 Aggregation 专用的运算符：`$match` 、 `$group` 和 `$project`。它们具体的作用我会在后文详述。我们之所以说 MongoDB 的 Aggregation 使用的是 Pipeline 来组织用户的操作，正是因为 `db.zips.aggregate` 方法接受的是一个由 Aggregation 操作组成的数列，数列中的每个操作将按顺序执行，前一个操作的结果将作为后一个操作的输入。

上面这条语句中，首先第一个 `$match` 运算符相当于之前的 SQL 语句中的 `WHERE` 子句，它从 Collection 中筛选出所有属于纽约州的邮政编码，并将其作为下一个操作的输入。下一个操作为 `$group` 操作，它相当于 SQL 中的 `GROUP BY`，并以一个 `_id` 来指明，我们将以 `city` 字段来进行 group。同时在该操作中还搭配使用了 `$sum` 运算符，将各个城市的 `pop` 字段值进行求和，赋给了新的 `population` 字段。最后的 `$project` 则相当于 SQL 中的 `SELECT AS`，将上一个操作传来的结果集中的 `_id` 重新改名为 `city`，并保留了 `population` 字段。

尽管这么说其实还是比较模糊，但正如我所说，我将在下文逐个讲述每个 Aggregation 操作符的作用，这里我们只需要了解到 MongoDB Aggregation 的 Pipeline 意味着所有 Aggregation 操作将以流水线的形式来处理数据即可。

Aggregation Pipeline 中的每一次操作被称为一个 *stage*。*Stage*的操作种类包括如下：

| 名称 | 作用 |
| --- | --- |
| `$project` | 改变 Pipeline 中的 Document 的模式，如添加一个新的字段、改变字段值或删除字段等 |
| `$match` | 过滤传入的 Document，并不做改变地输出匹配的 Document |
| `$redact` | 综合 `$project` 和 `$redact` 的功能，对 Document 进行改写 |
| `$limit` | 给定一个数字 *n*，仅输出传入的前 *n* 个 Document |
| `$skip` | 给定一个数字 *n*，跳过传入的前 *n* 个 Document |
| `$unwind` | 拆散输入 Document 中指定的一个数组字段，为数组中的每个元素生成一个新的 Document，并用该元素作为该字段的值 |
| `$group` | 根据给定的标识表达式组织传入的 Document，并在声明了累积操作符的情况下将其应用于每一组 Document |
| `$sort` | 根据指定的字段和顺序，对输入的所有 Document 进行排序 |
| `$geoNear` | 根据 Document 与给定地理坐标的远近程度进行排序后输出 |
| `$out` | 将 Aggregation 的结果写入到指定的 Collection 中。`$out` 只能作为 Aggregation 的最后一个 *Stage* |

接下来我将逐个介绍上述的所有 *Stage*。

## `$project`

`$project` 只会将设定好的字段值传递给 Pipeline 的下一个 Stage，这些字段可以来自原有的字段，也可以是新创建的字段。从形式上，`$project` 的标准使用格式如下：

```json
{ $project: { <specifications> } }
```

可以看到，`$project` 的参数为一个 Document，该 Document 说明哪些字段该输出、如何得出这些字段以及哪些字段该被删除。该 Document 的格式如下：

| 语法 | 说明 |
| --- | --- |
| `<field>: <1 or true>` | 指定结果 Document 包含原有的某个字段 |
| `_id: <0 or false>` | 指定结果 Document 不包含原有的 `_id` 字段 |
| `<field>: <expression>` | 根据给定表达式为结果 Document 创建一个新的字段 |

默认情况下，输入 Document 的 `_id` 字段将会保留在输出 Document 中，除非显式地将其声明为 `_id: 0` 或修改为其他值。同时，除 `_id` 外的其他所有字段默认是不保留的，如果需要保留在输出 Document 中则必须通过上述语法显式地指定。

如果你用 `<field>: <1 or true>` 语法指定包含某个原本不存在的字段，`$project` 会忽略你的这项设置，即 `$project` 不会因你这项设置而为输出 Document 新增一个字段。

使用 `<field>: <expression>` 为输出 Document 新增字段时，我们可以指定新增字段的字段名，同时用表达式给出字段的值。更多有关*表达式*的内容，详见[这里](https://docs.mongodb.org/manual/meta/aggregation-quick-reference/#aggregation-expressions)。

如果要为某个字段设置一个数字或布尔值，必须使用[$literal](https://docs.mongodb.org/manual/reference/operator/aggregation/literal/#exp._S_literal)操作符。否则，`$project` 会认为你只是在指定包含或删除某个原有字段。

举个例子，假设我们有一个叫做 `orders` 的 Collection，其中的一个 Document 模式如下：

```js
{
  _id: 5,
  product_id: 123,
  price: 50,
  quantity: 5
}
```

订单给出了用户购买的物品的单价 `price` 以及用户购买的数量 `quantity`。我们完全可以通过 `$project` 来生成只包含订单总价的 Document：

```js
db.orders.aggregate([{
    $project: {
        product_id: true,
        amount: { $multiply: [ $price, $quantity ] }
    }
  }
])
```

如此，新的 Document 中保留了原有的商品 id`product_id`，同时利用原有的商品单价和商品数量计算出了订单总价 `amount`。

实际上，`$project` 所接受的参数之所以被叫做 `specifications`，是因为它正是输出 Document 的模式的 `specification`，
输出 Document 的模式将与其保持一致。我们完全可以利用这一特性使输出 Document 的某个字段包含一个子 Document 或数组：

```js
db.orders.aggregate([{
    $project: {
        product: {
          product_id: "$product_id",
            price: "$price"
        },
        amount: { $multiply: [ $price, $quantity ] }
    }
  }
])
```

如此一来，新的 Document 中的 `product` 字段的值便是一个包含了商品 id 和商品单价的 Document 了。

## `$match`

`$match` 接受一个表示查询条件的 Document 作为参数，只把匹配该查询条件的 Document 传递到下一个 Stage。`$match` 的标准使用格式如下：

```json
{ $match: { <query> } }
```

其中，用于表示查询条件的 `query` 使用与 `find` 和 `findOne` 方法中的查询条件完全相同的格式。有关查询语法，详见[这里](https://docs.mongodb.org/manual/tutorial/query-documents/#read-operations-query-argument)。

将 `$match` 放在 Pipeline 中尽可能靠前的位置，可以更早地降低 Pipeline 中 Document 的数量，因为 Pipeline 实际上是在内存中做运算的。如果你将 `$match` 作为第一个 Stage，它就可以像 `find` 和 `findOne` 那样利用上 Collection 中的索引了。

你不能在 `$match` 中使用[$where](https://docs.mongodb.org/manual/reference/operator/query/where/#op._S_where)操作符。同时，想要在 `$match` 中使用[$text](https://docs.mongodb.org/manual/reference/operator/query/text/#op._S_text)操作符，必须确保 `$match` 为 Pipeline 的第一个 Stage。

举个例子，还是上述那个 `orders` Collection，我们可以编写如下 Aggregation：

```js
db.orders.aggregate([{
    $project: {
      product: {
        product_id: "$product_id",
        price: "$price"
      },
      amount: { $multiply: [ $price, $quantity ] }
    }
  }, {
    $match: {
      amount: {$gt: 500}
    }
  }
])
```

如此一来，我们就只会得到总价大于 500 的订单了。

## `$sort`

`$sort` 对传入的 Collection 进行排序后传递到下一个 Stage。`$sort` 的标准使用格式如下：

```json
{ $sort: { <field1>: <sort order>, <field2>: <sort order> ... } }
```

实际上这些参数并没有看上去那么复杂，它的格式和 `sort()` 方法的参数是完全一致的。比如：

```js
db.orders.aggregate([{
    $project: {
      product: {
        product_id: "$product_id",
        price: "$price"
      },
      amount: { $multiply: [ $price, $quantity ] }
  }, {
    $sort: {
      amount: -1
    }
  }
])
```

我们就获得了总价按降序排列的订单列表了。

## `$limit`

`$limit` 接受一个正整数参数 *n*，只把传入的前 *n* 个 Document 传递到下一个 Stage。`$limit` 的标准使用格式如下：

```json
{ $limit: <positive integer> }
```

从功能上讲，`$limit` 和 `limit()` 方法是完全一致的。举个例子：

```js
db.orders.aggregate(
    { $limit : 5 }
);
```

这样一来我们便可以获得前 *5* 个订单了。

值得注意的是，如果 `$limit` 紧接着一个 `$sort`，`$sort` 将会采用 Lazy 的排序方式，在选出前 *n* 个 Document 以后便结束排序，而不会对整个 Collection 进行排序。

## `$skip`

`$skip` 接受一个正整数参数<i>n</i>，跳过传入的前<i>n</i>个 Document 后，将剩余的 Document 原封不动地传给下一个 Stage。`$skip` 的标准使用格式如下：

```json
{ $skip: <positive integer> }
```

从功能上讲，`$skip` 和 `skip()` 方法是完全一致的。举个例子：

```js
db.orders.aggregate(
    { $skip : 5 }
);
```

这样一来我们便跳过了前 *5* 个订单了。

## `$unwind`

`$unwind` 接受一个字段名作为参数，拆散指定的数组字段，为数组中的每一个元素生成一个新的 Document，并以该元素作为新的 Document 中该数组字段的值。`$unwind` 的标准使用格式如下：

```json
{ $unwind: <field path> }
```

注意，在指定字段名时，字段名前面要加上一个 `$` 符号。举个例子，假设我们有 Document 如下：

```json
{ a : 0, b : 0, c : [ 0 1 2 ] }
```

我们执行 `{ $unwind: "$c" }` 操作后，将得到如下几个 Document：

```json
{ a : 0, b : 0, c : 0 }
{ a : 0, b : 0, c : 1 }
{ a : 0, b : 0, c : 2 }
```

在使用 `$unwind` 时，有几点需要注意一下：

- 如果传入的某个 Document 的指定字段的值不是一个数组，`aggregate` 方法会抛出一个错误
- 如果传入的某个 Document 不包含你所指定的字段，`$match` 会忽略该 Document，不会为其生成任何 Document
- 如果传入的某个 Document 的该字段的值为空数组（`[]`），`$match` 同样会忽略该 Document，不为其生成任何 Document

## `$group`

`$group` 基于给定的规则将 Document 分入不同的分组中，为每个分组产生一个新的 Document，该 Document 的字段值将由累积表达式给出。`$group` 的标准适用格式如下：

```json
{ $group: { _id: <expression>, <field1>: { <accumulator1> : <expression1> }, ... } }
```

其中，我们需要显式地给出 `_id` 的值的计算方式，被计算出拥有相同的 `_id` 值的 Document 将被放入到同一组中。如果你想要让所有 Document 都被分入同一组，将 `_id` 设为 `null` 即可。

其他字段的值将由累积表达式给出，而累积表达式由累积操作符和普通的表达式组成。可选的累积操作符如下：

| 名称 | 作用 |
| --- | --- |
| `$num` | 返回每组 Document 的表达式所得值的和。自动忽略非数字的值 |
| `$avg` | 返回每组 Document 的表达式所得值的平均数。自动忽略非数字的值 |
| `$first` | 返回每组中第一个 Document 的表达式所得值 |
| `$last` | 返回每组中最后一个 Document 的表达式所得值 |
| `$max` | 返回每组 Document 的表达式所得值的最大值 |
| `$min` | 返回每组 Document 的表达式所得值的最小值 |
| `$push` | 以一个数组包含一组所有 Document 的表达式所得值 |
| `$addToSet` | 以一个集合包含一组所有 Document 的表达式所得值 |

举个例子，假设我们有 Document 如下：

```js
{ a : 0, b : 0, c : 0 }
{ a : 0, b : 0, c : 1 }
{ a : 0, b : 1, c : 0 }
{ a : 0, b : 1, c : 1 }
{ a : 1, b : 0, c : 0 }
{ a : 1, b : 0, c : 1 }
{ a : 1, b : 1, c : 0 }
{ a : 1, b : 1, c : 1 }
```

我们执行如下操作：

```js
{
  $group: {
    _id: {a: "$a", b: "$b"},
    c: {$max: "$c"}
  }
}
```

即可获得结果如下：

```js
{ _id : { a : 0, b : 0 }, c : 1 }
{ _id : { a : 0, b : 1 }, c : 1 }
{ _id : { a : 1, b : 0 }, c : 1 }
{ _id : { a : 1, b : 1 }, c : 1 }
```

其他累积运算符的用法也是类似，这里不再赘述。具体的用法可以参考[这里](https://docs.mongodb.org/manual/reference/operator/aggregation/#aggregation-pipeline-operator-reference)。

## Aggregation 的局限

尽管 MongoDB Aggregation 和 SQL Aggregation 相同，都会是我们日常生产所必须用到的工具，但在使用的时候，MongoDB Aggregation 相关的几个条件限制也是我们所需要考虑的。

### 最大内存占用：100MB

MongoDB Aggregation 为单个 Stage 所能分配的最大内存为 100MB，当某个 Stage 的内存占用超过 100MB 时，你可能就拿不到结果了。因此，我们应将 `$match` 等可削减 Document 数量的 Stage 放在尽可能靠前的位置，以免某个 Stage 产生了过大的中间结果。如果无论如何都需要使用上超过 100MB 的内存，可以在为 `aggregate` 方法加上 `allowDiskUse: true` 参数，允许其使用磁盘空间来辅助计算。

更多有关 `allowDiskUse` 的内容，详见[这里](https://docs.mongodb.org/manual/reference/method/db.collection.aggregate/#db.collection.aggregate)。

### 单个结果 Document 最大体积：16MB

MongoDB Document 不能超过 16MB 大小这一限制来自于其所使用的 BSON 格式的大小限制。鉴于 Aggregation 产生的结果固然也会以 BSON Document 的形式传递给客户端，自然单个结果 Document 也不能超过 16MB。

更多有关 Aggregation 限制的内容，详见[这里](https://docs.mongodb.org/manual/core/aggregation-pipeline-limits/)。
