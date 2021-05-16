---
title: MongoDB CRUD Cookbook
category: MongoDB
tags: MongoDB
date: 2017-03-27
updated: 2017-03-27
toc: true
---

This post is just a cookbook for me to look up all those MongoDB operations, so there won't be too many basic concepts about MongoDB or advanced usage. I'll try to make this post perfect for those who don't know MongoDB at all to get the hang of it as easily as possible.

In this post, I'll show you MongoDB's basic CRUD operations. Note that this post will not teach you how to install MongoDB on your computer or how to open its shell. For these basic usage, you should check out the official tutorial.

<!-- more -->

## What is MongoDB?

So, first of all, what is MongoDB? I guess some of you may have already learned that MongoDB is a NoSQL database, it is somehow faster than traditional relational database like MySQL and Oracle, and maybe some of you even know that MongoDB store data in key-value pairs. But does it make sense? If it truly stores data in key-value pairs, then it probably looks just like the `HashMap` in Java. Is that a data structure that is good enough to support all those complex computations in relational database? Absolutely not, and MongoDB is absolutely more than that.

Before MongoDB, we know there are different types of database systems. Like there is distributed memory database like `Memcached`. Although Memcached has its remarkable performance, Memcached provides way less functions comparing to all those relational databases. Speaking of relational databases, MySQL provides lots of useful functionalities, like aggregation, `JOIN`, and support for transactions. But you may have already known that relational databases are pretty slow and they can hardly meet the requirement of high-performance computing like Big Data Processing.

After all these, here comes the MongoDB. Unlike Memcached and all those relational databases, MongoDB always try to strive a perfect balance between performance and functionality. You may have alreay known that MongoDB is much faster than relational database, but you still don't know that MongoDB also provides lots of functions, which make it a totally sufficient substitution for all those relational databases.

## CRUD - C

First of all, you have to know, MongoDB stores data in `JSON` format, and its shell operation bases on `JavaScript`. Instead of storing _records_ in _tables_ like relational database does, MongoDB stores data as _documents_ in _collections_. So in this section, I'll teach you how to insert documents into a collection.

### Inserting Document

The following JavaScript code insert a document into a collection called `inventory`. If the collection does not exist, it will be created automatically.

```javascript
db.inverntory.insert(
    {
        item: "ABC1",
        details: {
            model: "14Q3",
            manufacturer: "XYZ Company",
        },
        stock: [ { size: "S", qty: 25 }, { size: "M", qty: 50 } ],
        category: "clothing"
    }
);
```

This `insert` method returns a `WriteResult` object with the status of the operation. A successful insertion of the document returns the following object:

```js
WriteResuls({ "nInserted" : 1 })
```

The `nInserted` field gives you the number of documents inserted by this operation. If the operation encounters an error, the `WriteResult` object will contain the error information.

### Inserting an Array of Documents

You can groups the documents you want to save into an array of JavaScript object, than `insert` the whole array:

```js
var myDocuments=
    [
        {
            item: "ABC2",
            details: { model: "14Q3", manufacturer: "M1 Corporation" },
            stock: [ { size: "M", qty: 50 } ],
            category: "clothing"
        },
        {
            item: "MNO2",
            details: { model: "14Q3", manufacturer: "ABC Company" },
            stock: [ { size: "S", qty: 5 }, { size: "M", qty: 5 }, { size: "L", qty: 1 } ],
            category: "clothing"
        },
        {
            item: "IJK2",
            details: { model: "14Q2", manufacturer: "M5 Corporation" },
            stock: [ { size: "S", qty: 5 }, { size: "L", qty: 3 } ],
            category: "houseware"
        }
    ];
db.inventory.insert(myDocuments);
```

This method will return a `BulkWriteResult` object with the status of the operation. The result of a successful insertion of multiple documents might looks as follows:

```js
BulkWriteResult({
    "writeErrors" : [ ],
    "writeConcernErrors" : [ ],
    "nInserted" : 3,
    "nUpserted" : 0,
    "nMatched" : 0,
    "nModified" : 0,
    "nRemoved" : 0,
    "upserted" : [ ]
})
```

Similarly, the `nInserted` field gives you the number of documents inserted. If the operation encounters an error, the error message will be given in the returned object.

### Inserting Multiple Documents Using Bulk Operation

First, you need to use the following code to initialize a bulk operation:

```js
var bulk = db.inventory.initializeUnorderedBulkOp();
```

By "unordered opertion", it means the execution order of the operations in the bulk is not important, and MongoDB can execute all these operations in parallel. If an error occurs when processing one of the write operations, MongoDB will continue to process the remaining write operations.

```js
bulk.insert(
    {
        item: "BE10",
        details: { model: "14Q2", manufacturer: "XYZ Company" },
        stock: [ { size: "L", qty: 5 } ],
        category: "clothing"
    }
);
bulk.insert(
    {
        item: "ZYT1",
        details: { model: "14Q1", manufacturer: "ABC Company" },
        stock: [ { size: "S", qty: 5 }, { size: "M", qty: 5 } ],
        category: "houseware"
    }
);
bulk.execute();
```

The `execute` method execute the operations specified in the bulk and returns a `BulkWriteResult` object.

## CRUD - R

### Selecting All Documents in a Collection

```js
db.inventory.find( {} );
db.inventory.find();
```

Both commands do the same thing.

### Specifying Equality Condition

```js
db.inventory.find( { type: "snacks" } );
```

### Specifying Conditions Using Query Operators

```js
db.inventory.find( { type: { $in: [ "food", "snacks" ] } } );
```

Although you can express this query using the `$or` operator, use the `$in` operator rather than the `$or` operator when performing equality checks on the same field.

### Specifying AND Conditions

```js
db.inventory.find( { type: 'food', price: { $lt: 9.95 } } );
```

### Specifying OR Conditions

```js
db.inventory.find(
    {
        $or: [ { qty: { $gt: 100 } }, { price: { $lt: 9.95 } } ]
    }
);
```

### Specifying AND as well as OR Conditions

```js
db.inventory.find(
    {
        type: "food",
        $or: [ { qty: { $gt: 100 } }, { price: { $lt: 9.95 } } ]
    }
);
```

### Embedded Documents

As you may have already seen that documents can be hierarchical, meaning document contains documents, which is also called embedded documents. When the field holds an embedded document, a query can either specify an exact match on the embedded document or specify a match by individual fields in the embedded document using the _dot notation_.

#### Exact Match on the Embedded Document

To specify an equality match on the whole embedded document, use the query document `{ <field>: <value> }` where `<value>` is the document to match.

> Equality match on an embedded document requires an *exact* match of the specified `<value>`, **including** the field order.

```js
db.invntory.find(
    {
        producer:
            {
                company: "ABC123",
                address: "123 Street"
            }
    }
);
```

#### Equality Match on Fields within an Embedded Document

Use the _dot notation_ to match by specific fields in an embedded document. Equality matches for specific fields in an embedded document will select documents in the collection  where the embedded document contains the specified fields with the specified values. The embedded document can contain additional fields.

```js
db.inventory.find( { "producer.company": "ABC123" } );
```

### Arrays

When the field holds an array, you can query for an exact array match or for specific values in the array. If the array contains embedded documents, you can query for specific fields in the embedded documents using _dot notation_.

If you specify multiple conditions using the `$elemMatch` operator, the array must contain at least one element that satisfies all the conditions.

If you specify multiple conditions without using the `$elemMatch` operator, then some combination of the array elements, not necessarily a single element, must satisfy all the conditions; i.e. different elements in the array can satisfy different parts of the conditions.

Consider an `inventory` collection that contains the following documents:

```json
{ "_id": 5, "type": "food", "item": "aaa", "ratings": [ 5, 8, 9 ]}
{ "_id": 6, "type": "food", "item": "bbb", "ratings": [ 5, 9 ]}
{ "_id": 7, "type": "food", "item": "ccc", "ratings": [ 9, 5, 8 ]}
```

#### Exact Match on an Array

To specify an equality match on an array, use the query document `{ <field>: <value> }` where `<value>` is the array to match.

> Equality matches on the array require an _exact_ match of the specified `<value>`, **including** the element order.

```js
db.inventory.find( { ratings: [ 5, 8, 9 ] } );
```

This operation returns the following document:

```json
{ "_id": 5, "type": "food", "item": "aaa", "ratings": [ 5, 8, 9 ]}
```

#### Matching an Array Element

Equality matches can be specified to match only a single element in the array. These specifications match if the array contains at least _one_ element with the specified value.

```js
db.inventory.find( { ratings : 5 } );
```

This operation returns the following documents:

```json
{ "_id": 5, "type": "food", "item": "aaa", "ratings": [ 5, 8, 9 ]}
{ "_id": 6, "type": "food", "item": "bbb", "ratings": [ 5, 9 ]}
{ "_id": 7, "type": "food", "item": "ccc", "ratings": [ 9, 5, 8 ]}
```

#### Matching a Specific Element in an Array

Equality matches can be specified  to match an element with particular index using the _dot notation_.

```js
db.inventory.find( { "ratings.0": 5 } );
```

This operation returns the following documents:

```json
{ "_id": 5, "type": "food", "item": "aaa", "ratings": [ 5, 8, 9 ]}
{ "_id": 6, "type": "food", "item": "bbb", "ratings": [ 5, 9 ]}
```

#### Specifying Multiple Criteria for Array Elements

You can use `$elemMatch` to specify multiple criteria on the elements of an array so that the returned documents
have at least one element in the array field satisfies all the specified criteria.

```js
db.inventory.find( { ratings: { $elemMatch: { $gt: 5, $lt: 9 } } } );
```

This operation returns the following documents:

```json
{ "_id": 5, "type": "food", "item": "aaa", "ratings": [ 5, 8, 9 ]}
{ "_id": 7, "type": "food", "item": "ccc", "ratings": [ 9, 5, 8 ]}
```

The following code queries for documents whose `ratings` array contains elements that in some combination satisfy the query conditions;
e.g., one element satisfying the "greater than 5: condition while another element satisfying the "less than 9" condition, or a single element satisfying both:

```js
db.inventory.find( { ratings: { $gt: 5, $lt: 9 } } );
```

This operation returns the following documents:

```json
{ "_id": 5, "type": "food", "item": "aaa", "ratings": [ 5, 8, 9 ]}
{ "_id": 6, "type": "food", "item": "bbb", "ratings": [ 5, 9 ]}
{ "_id": 7, "type": "food", "item": "ccc", "ratings": [ 9, 5, 8 ]}
```
#### Array of Embedded Documents

Consider that the `inventory` collection includes the following documents:

```json
[
    {
        "_id": 100,
        "type": "food",
        "item": "xyz",
        "qty": 25,
        "price": 2.5,
        "ratings": [ 5, 8, 9 ],
        "memos": [ { "memo": "on time", "by": "shipping" }, { "memo": "approved", "by": "billing" } ]
    },

    {
        "_id": 101,
        "type": "fruit",
        "item": "jkl",
        "qty": 10,
        "price": 4.25,
        "ratings": [ 5, 9 ],
        "memos": [ { "memo": "on time", "by": "payment" }, { "memo": "delayed", "by": "shipping" } ]
    }
]
```

If you know the index of the embedded document, you can specify the criteria with the embedded document's position using the _dot notation_.

```js
db.inventory.find( { "memos.0.by": "shiping" } );
```

This operation returns the following document:

```json
{
    "_id": 100,
    "type": "food",
    "item": "xyz",
    "qty": 25,
    "price": 2.5,
    "ratings": [ 5, 8, 9 ],
    "memos": [ { "memo": "on time", "by": "shipping" }, { "memo": "approved", "by": "billing" } ]
}
```

If you do not know the index position of the document in the array, concatenate the name of the array field, a dot (`.`) and the name of the field in the embedded document.

```js
db.inventory.find( { "memos.by": "shipping" } );
```

This operation returns the following documents:

```json
{
    "_id": 100,
    "type": "food",
    "item": "xyz",
    "qty": 25,
    "price": 2.5,
    "ratings": [ 5, 8, 9 ],
    "memos": [ { "memo": "on time", "by": "shipping" }, { "memo": "approved", "by": "billing" } ]
}
{
    "_id": 101,
    "type": "fruit",
    "item": "jkl",
    "qty": 10,
    "price": 4.25,
    "ratings": [ 5, 9 ],
    "memos": [ { "memo": "on time", "by": "payment" }, { "memo": "delayed", "by": "shipping" } ]
}
```

#### Specify Multiple Criteria for Array of Documents

Use `$elemMatch` operator to specify multiple criteria on an array of embedded documents.
Such operations only return documents that have at least one embedded document satisfies all the specified criteria.

```js
db.inventory.find(
    {
        memos:
            {
                $elemMatch:
                    {
                        memo: "on time",
                        by: "shipping"
                    }
            }
    }
);
```

This operation returns the following document:

```json
{
    "_id": 100,
    "type": "food",
    "item": "xyz",
    "qty": 25,
    "price": 2.5,
    "ratings": [ 5, 8, 9 ],
    "memos": [ { "memo": "on time", "by": "shipping" }, { "memo": "approved", "by": "billing" } ]
}
```

The following example queries for documents whose `memos` array contains elements that in some combination satisfy the query conditions; e.g. one element satisfying the "field `memo` equal to `'on time'`" condition and another element satisfying the "field `by` equal to `'shipping'`" condition, or a single element satisfying both criteria:

```js
db.inventory.find(
    {
        "memos.memo": "on time",
        "memos.by": "shipping"
    }
);
```

This query returns the following documents:

```json
{
    "_id": 100,
    "type": "food",
    "item": "xyz",
    "qty": 25,
    "price": 2.5,
    "ratings": [ 5, 8, 9 ],
    "memos": [ { "memo": "on time", "by": "shipping" }, { "memo": "approved", "by": "billing" } ]
}
{
    "_id": 101,
    "type": "fruit",
    "item": "jkl",
    "qty": 10,
    "price": 4.25,
    "ratings": [ 5, 9 ],
    "memos": [ { "memo": "on time", "by": "payment" }, { "memo": "delayed", "by": "shipping" } ]
}
```

### Limiting Fields Returned by a Query

The _projection_ document limits the returned fields of matching documents. The projection document can specify inclusion or exclusion rules of fields.

```js
db.users.find(
    { age: { $gt: 18 } },
    { name: 1, age: 1, id_: 0 }
);
```

Projection operation has inclusive mode and exclusive mode, in which you can specify which fields to include and which fields to exclude respectively.

> You cannot specify inclusion rules and exclusion rules in one query, but you can exclude the `_id` field when you are using inclusion projections.

#### Returning All Fields of Matched Documents

```js
db.inventory.find( { type: 'food' } )
```

#### Returning the Specified Fields and the _id Field Only

```js
db.inventory.find( { type: 'food' }, { item: 1, qty: 1 } )
```

#### Returning Specified Fields Only (Inclusive Mode)

```js
db.inventory.find( { type: 'food' }, { item: 1, qty: 1, _id:0 } )
```

#### Returning All But the Specified Fields (Exclusive Mode)

```js
db.inventory.find( { type: 'food' }, { type:0 } )
```

#### Projection on Array Fields

For fields that contain arrays, MongoDB provides the following projection operators: `$elemMatch`, `$slice`, and `$`.

For example, consider the `inventory` collection contains the following document:

```json
{ "_id" : 5, "type" : "food", "item" : "aaa", "ratings" : [ 5, 8, 9 ] }
```

Then the following operation uses the `$slice` projection operator to return just the first two elements in the `ratings` array.

```js
db.inventory.find( { _id: 5 }, { ratings: { $slice: 2 } } )
```

`$elemMatch`, `$slice`, and `$` are the only way to project portions of an array. For instance, you cannot project a portion of an array using the array index; e.g. `{ "ratings.0": 1 }` is not equivalent to returning just the first element of the array field.

## CRUD - U

MongoDB provides the `update()` method to update the documents of a collection. This method accepts the following parameters:

- an update conditions document to match the documents to update,
- an update operations document to specify the modification to perform, and
- an options document.

<p class="info">
    To specify the update condition, use the same structure and syntax as the query conditions.
</p>

### Updating Specific Fields in a Document

#### Using update operators to change field values

The following code uses the `$set` operator to update the `category` field and the  `details` field to the specified values and the `$currentDate` operator to update the field `lastModified` with the current date for the document with `item` equal to `"MNO2"`:

```js
db.inventory.update(
    { item: "MNO2" },
    {
        $set: {
            category: "apparel",
            details: { model: "14Q3", manufacturer: "XYZ Company" }
        },
        $currentDate: { lastModified: true }
    }
);
```

The update operation returns a `WriteResult` object which contains the status of the operation. A successful update of document returns the following object:

```js
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```

The `nMatched` field specifies the number of existing documents matched for the update, and `nModified` specifies the number of existing documents modified.

#### Updating an embedded field

To update a field within an embedded document, use the _dot notation_. When using the dot notation, enclose the whole dotted field name in quotes.

```js
db.inventory.update(
    { item: "ABC1" },
    { $set: { "details.model": "14Q2" } }
);
```

#### Updating multiple documents

By default, the `update()` method updates a single document. To update multiple documents, use the `multi` option in the `update()` method.

```js
db.inventory.update(
    { category: "clothing" },
    {
        $set: { category: "apparel" },
        $currentDate: { lastModified: true }
    },
    { multi: true }
);
```

### Replacing the Whole Document

To replace the entire content of a document except for the `_id` field, pass an entirely new document as the second argument to `update()`.

> The replacement document can have different fields than the original document. In the replacement document, you can omit the `_id` field since the `_id` field is immutable. If you do include the `_id` field, it must be the same value as  the existing value.

```js
db.inventory.update(
    { item: "BE10" },
    {
        item: "BE05",
        stock: [ { size: "S", qty: 20 }, { size: "M", qty: 5 } ],
        category: "apparel"
    }
);
```

### The upsert Option

By default, if no document matches the update query, the `update()` method does nothing.

However, by specifying `upsert: true`, the `update()` method either updates matching document or documents, or inserts a new document using the update specification if no matching document exists.

#### Specifying `upsert: true` in a Document Replacement Operation

When you specify `upsert: true` for an update operation to replace a document and no matching documents are found, MongoDB creates a new document using the equality conditions in the update conditions document, and replaces this document, except for the `_id` field if specified, with the update document. 

```js
db.inventory.update(
    { item: "TBD1" },
    {
        item: "TBD1",
        details: { "model" : "14Q4", "manufacturer" : "ABC Company" },
        stock: [ { "size" : "S", "qty" : 25 } ],
        category: "houseware"
    },
    { upsert: true }
)
```

The update operation returns a `WriteResult` object which contains the status of the operation, including whether the `db.collection.update()` method modified an existing document or added a new document.

```js
WriteResult({
    "nMatched" : 0,
    "nUpserted" : 1,
    "nModified" : 0,
    "_id" : ObjectId("53dbd684babeaec6342ed6c7")
});
```

The `nMatched` field shows that the operation matched 0 documents.

The `nUpserted` of 1 shows that the update added a document.

The `nModified` of 0 specifies that no existing documents were updated.

The `_id` field shows the generated `_id` field for the added document.

#### Specifying `upsert: true` in a Field Updating Operation

When you specify `upsert: true` for an update operation that modifies specific fields and no matching documents are found, MongoDB creates a new document using the equality conditions in the update conditions document, and applies the modification as specified in the update document.

```js
db.inventory.update(
    { item: "TBD2" },
    {
        $set: {
            details: { "model" : "14Q3", "manufacturer" : "IJK Co." },
            category: "houseware"
        }
    },
    { upsert: true }
);
```

The update operation also returns a `WriteResult` object.

## CRUD - D

In MongoDB, you can use the `db.collection.remove()` method to remove documents from a collection. You can choose to remove all documents from a collection, remove documents that match given condition, or just remove a single document.

### Remove All Documents

To remove all documents from a collection (clearing the collection), pass an empty query document `{}` to the `remove()` method. Such operation will not remove the indexes.

```js
db.inventory.remove( {} )
```

> To remove all documents from a collection, it may be more efficient to use the `drop()` method to drop the entire collection, including the indexes, and then recreate the collection and rebuild the indexes.

### Removing Documents that Match Given Condition

To remove the documents that match a deletion criteria, call the `remove()` method with the `<query>` parameter.

```js
db.inventory.remove( { type : "food" } )
```

To remove a single document, call the `remove()` method with the `justOne` parameter set to true or 1.

```js
db.inventory.remove( { type : "food" }, 1 )
```

> To delete a single document sorted by some specified order, use the `findAndModify()`Specific Fields method.
