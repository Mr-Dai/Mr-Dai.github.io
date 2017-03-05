---
layout: post_original
title: SQL Reference
author: Robert Peng
category: MySQL
---

My personal reference for the SQL language. Much of the post's content comes from [W3Schools.com](https://www.w3schools.com/sql/default.asp).

## Basic CRUD Operations

### Selecting All Columns from Table

The following SQL statement selects all the columns from the `Customers` table:

```sql
SELECT * FROM Customers;
```

### Selecting Designated Columns from Table 

The following SQL statement selects the `CustomerName` and `City` columns from the `Customers` table:

```sql
SELECT CustomerName, City FROM Customers;
```

### Selecting Distinct Values of Given Columns

The following SQL statement returns all the distinct values from the `City` columns of the `Customers` table:

```sql
SELECT DISTINCT City FROM Customers;
```

The following SQL statement returns all the distinct combinations of the `City` and `Country` columns of the `Customers` table:

```sql
SELECT DISTINCT City, Country FROM Customers;
```

### Using the WHERE clause

Using `WHERE` clause can tell the RDBMS to return only records that satisfy the given criteria.

The following SQL statement selects all the customers from the country `Mexico`, in the `Customers` table:

```sql
SELECT * FROM Customers
WHERE Country='Mexico';
```

<p class="info">
    <b>Note:</b> String literals in SQL is represented by single-quoted strings like <code>'Mexico'</code>, while
    double-quoted string represents <b>quoted identifier</b>, being identifier that contains alpha-numeric characters,
    <code>$</code> and <code>#</code>. Quoted identifier can also be specified by strings surrounded by brackets, e.g. <code>[Contact Person]</code>.
</p>

#### The SQL AND, OR & NOT Operators

The `AND` operator returns a record if both the first condition AND the second condition are true.

The following SQL statement selects all customers from the country `Germany` AND the city `Berlin`, in the `Customers` table:

```sql
SELECT * FROM Customers
WHERE Country='Germany'
AND City='Berlin';
```

The `OR` operator returns a record if either the first condition OR the second condition is true.

The following SQL statement selects all customers from the city `Berlin` OR `München`, in the `Customers` table: 

```sql
SELECT * FROM Customers
WHERE City='Berlin'
OR City='München';
```

`AND` and `OR` operator can be combined to form complex expressions. It is important to note that `AND` has higher precedence
than `OR`, while you can also use parenthesis to group sub-expressions.

The following SQL statement selects all customers from the country `Germany` AND the city must be equal to `Berlin` OR `München`,
in the `Customers` table:

```sql
SELECT * FROM Customers
WHERE Country='Germany'
AND (City='Berlin' OR City='München');
```

### Using the ORDER BY Clause

The `ORDER BY` keyword is used to sort the result-set by one or more columns.

The `ORDER BY` keyword sorts the records in ascending order by default.
To sort the records in a descending order, you can use the `DESC` keyword.

The following SQL statement selects all customers from the `Customers` table, sorted ascending by the `Country` and
descending by the `CustomerName` column, while the `ASC` keyword for `Country` column is omittable:

```sql
SELECT * FROM Customers
ORDER BY Country ASC, CustomerName DESC;
```

### Inserting New Record

The `INSERT INTO` statement is used to insert new records in a table.

The following SQL statement will insert a new row to the `Customers` table:

```sql
INSERT INTO Customers
VALUES (25, 'Cardinal','Tom B. Erichsen','Skagen 21','Stavanger','4006','Norway');
```

While the following SQL statement will only insert data in the `CustomerName`, `City`, and `Country` column:

```sql
INSERT INTO Customers (CustomerName, City, Country)
VALUES ('Cardinal', 'Stavanger', 'Norway');
```

### Updating Records

The `UPDATE` and `SET` keyword can be used to update existing records in a table.

The following SQL statement will update all records which have the value `Mexico` in the field `Country`:

```sql
UPDATE Customers
SET ContactName='Juan'
WHERE Country='Mexico';
```

Note that the `WHERE` clause of an `UPDATE` statement is omittable, which causes the statement to update all records in a table.

The following SQL statement will update all records in table `Customers` to have the value `Juan` in the field `ContactName`:

```sql
UPDATE Customers
SET ContactName='Juan';
```

### Deleting Records

The `DELETE` statement is used to delete rows in a table.

The following SQL statement will delete all records which have the value `Mexico` in the field `Country`:

```sql
DELETE FROM Customers
WHERE Country='Mexico';
```

The `WHERE` clause of a `DELETE` statement is also omittable, which causes the statement to delete all records in a table.

The following SQL statement will clear the `Customers` table:

```sql
DELETE FROM Customers;
```

## Advanced Query

### Limiting Size of Result Set

In many cases, one may wants the DBMS to return designated part of the result set, including use cases like result pagination.

In standard SQL, the `SELECT TOP` clause is used to specify the number of records to return. 

The following SQL statement selects the two first records from the `Customers` table:

```sql
SELECT TOP 2 * FROM Customers;
```

By using it in combination of the `PERCENT` keyword, one can also specify to select the first given percentage of the result set.

The following SQL statement selects the first 50% of the records from the `Customers` table:

```sql
SELECT TOP 50 PERCENT * FROM Customers;
```

__Unfortunately__, `TOP` clause is not supported by many RDBMS, while most of them provide different alternatives for the same funtionality.

For instance, in MySQL, one can use `LIMIT` clause to achieve the same result.
The following SQL statement selects the two first records from the `Customers` table in MySQL:

```sql
SELECT * FROM Customers LIMIT 5;
```

### Pattern Matching for String Field

Using `LIKE` operator in `WHERE` clause can search for specific pattern in string fields.

The following SQL statement selects all customers with a `City` starting with the letter `s`:

```sql
SELECT * FROM Customers
WHERE City LIKE 's%';
```

#### SQL Wildcard Characters

SQL wildcard characters are typically used to specify search pattern for `LIKE` operator.

The standard SQL includes the following wildcard:

| WildCard | Description |
| --- | --- |
| `%` | Substitude for zero or more arbitary characters |
| `_` | Substitude for single arbitary character |
| `[charlist]` | Sets or ranges of characters to match |
| `[^charlist]` or `[!charlist]` | Matches only a character NOT specified by the set or range within the brackets |

### Searching for Value in Given Set

The `IN` operator allows you to specify multiple values in a `WHERE` clause.

The following SQL statement selects all customers with a `City` of `Paris` or `London`:

```sql
SELECT * FROM Customers
WHERE City IN ('Paris','London');
```

It can be used with `NOT` operator to selects the records whose designated field do not have the given values.

The following SQL statement selects all customers whose are not from city of `Paris` or `London`:

```sql
SELECT * FROM Customers
WHERE City NOT IN ('Paris','London');
```

### Searching for Value in Given Range

The `BETWEEN` operator is used to select values within a range.

The following SQL statement selects all products with a price BETWEEN `10` and `20`:

```sql
SELECT * FROM Products
WHERE Price BETWEEN 10 AND 20;
```

It can also be used with `NOT` to select values which are not within the given range.

The following SQL statement selects all products with a price smaller than `10` or bigger than `20`:

```sql
SELECT * FROM Products
WHERE Price NOT BETWEEN 10 AND 20;
```

<p class="info">
<b>Note</b> that different result may be returned by different databases, as whether the border values of the given range should be treated exclusively or inclusively
is not specified by the SQL standard.
</p>

### Giving Aliase to Table or Column of Result Set

The `AS` operator is used to give alias to table or column of result set which is only effective within the single SQL statement.

The following SQL statement specifies two aliases, one for the `CustomerName` column and one for the `ContactName` column.

```sql
SELECT CustomerName AS Customer, ContactName AS "Contact Person"
FROM Customers;
```

The following SQL statement selects all the orders issued by the customer with `CustomerName` of `Around the Horn`.
We use the `Customers` and `Orders` tables, and give them the table aliases of `c` and `o` respectively:

```sql
SELECT o.OrderID, o.OrderDate, c.CustomerName
FROM Customers AS c, Orders AS o
WHERE c.CustomerName="Around the Horn" AND c.CustomerID=o.CustomerID;
```

### Using the JOIN Operator

One can use the SQL `JOIN` operator to combine records from different tables by using values common to each.

Normally, `JOIN` queries on more than two tables is constructed by concatenating all the tables with `JOIN` operators,
while the `JOIN` operator itself is a binary operator and is upper-associative, so we can only consider the cases where
are only two tables to join. For simplicity, I will use the terms "left table" and "right table" to refer to the two table operands.

There are 4 different types of `JOIN` operations:

| Name | Description |
| --- | --- |
| `INNER JOIN` | Returns all rows when there is at least one match in BOTH tables |
| `LEFT JOIN` | Return all rows from the left table, and the matched rows from the right table |
| `RIGHT JOIN` | Return all rows from the right table, and the matched rows from the left table |
| `FULL JOIN` | Return all rows when there is a match in ONE of the tables |

#### Inner Join

The `INNER JOIN` keyword selects all rows from both tables as long as there is a match between the columns in both tables.

![](https://www.w3schools.com/sql/img_innerjoin.gif)

The following SQL statement will return all customers with orders, _leaving out the customers that do not have orders recorded in the database_:

```sql
SELECT Customers.CustomerName, Orders.OrderID
FROM Customers
INNER JOIN Orders
ON Customers.CustomerID=Orders.CustomerID
ORDER BY Customers.CustomerName;
```

When not specify, `INNER JOIN` is the default type of `JOIN` operations, hence the `INNER` keyword in the upper code can be omitted and written like this:

```sql
SELECT Customers.CustomerName, Orders.OrderID
FROM Customers
JOIN Orders
ON Customers.CustomerID=Orders.CustomerID
ORDER BY Customers.CustomerName;
```

#### Left Join

The `LEFT JOIN` keyword returns all rows from the left table, with the matching rows in the right table. The result is `NULL` in the right side when there is no match.

![](https://www.w3schools.com/sql/img_leftjoin.gif)

The following SQL statement will return all customers, and any orders they might have:

```sql
SELECT Customers.CustomerName, Orders.OrderID
FROM Customers
LEFT JOIN Orders
ON Customers.CustomerID=Orders.CustomerID
ORDER BY Customers.CustomerName;
```

<p class="info">
<b>Note</b> that in some databases, <code>LEFT JOIN</code> is called <code>LEFT OUTER JOIN</code>, hence an <code>OUTER</code> keyword may need to be added
to the upper code depending on the database you use.
</p>

#### Right Join

Similar to `LEFT JOIN`, the `RIGHT JOIN` keyword returns all rows from the right table, with the matching rows in the left table.
The result is `NULL` in the left side when there is no match.

![](https://www.w3schools.com/sql/img_rightjoin.gif)

The following SQL statement will return all customers, and any orders they might have:

```sql
SELECT Orders.OrderId, Customers.CustomerName, Orders.OrderID
FROM Orders
RIGHT JOIN Customers
ON Customers.CustomerID=Orders.CustomerID
ORDER BY Customers.CustomerName;
```

#### Full Join

`FULL JOIN` is also known as `FULL OUTER JOIN`, which acts as a combination of `LEFT OUTER JOIN` and `RIGHT OUTER JOIN`.
The `FULL OUTER JOIN` keyword returns all rows from the left table and from the right table.

The `FULL OUTER JOIN` keyword combines the result of both `LEFT` and `RIGHT` joins: it returns all the rows from the left table,
and all the rows from the right table. If there are rows in the left table that do not have matches in the right table, or if there are rows
in the right table that do not have matches in the left table, those rows will be listed as well.

![](https://www.w3schools.com/sql/img_fulljoin.gif)

The following SQL statement selects all customers, and all orders:

```sql
SELECT Customers.CustomerName, Orders.OrderID
FROM Customers
FULL OUTER JOIN Orders
ON Customers.CustomerID=Orders.CustomerID
ORDER BY Customers.CustomerName;
```

### Using the UNION Operator

The `UNION` operator is used to combine the result-set of two or more `SELECT` statements. __Notice__ that each `SELECT` statement within the `UNION` must
have the _same number of columns_. The columns must also have _similar data types_. Also, the columns in each `SELECT` statement must be _in the same order_.

Also note that the `UNION` operator selects only distinct values by default. To allow duplicate values, use the `ALL` keyword with `UNION`.

The following SQL statement selects all the __different__ cities (only distinct values) from the `Customers` and the `Suppliers` tables:

```sql
SELECT City FROM Customers
UNION
SELECT City FROM Suppliers
ORDER BY City;
```

The following SQL statement uses UNION ALL to select __all__ (duplicate values also) __German__ cities from the `Customers` and `Suppliers` tables:

```sql
SELECT City, Country FROM Customers
WHERE Country='Germany'
UNION ALL
SELECT City, Country FROM Suppliers
WHERE Country='Germany'
ORDER BY City;
```

### Using the GROUP BY Statement

The `GROUP BY` statement is used in conjunction with the aggregate functions, such as `COUNT` and `SUM`,
to group the result-set by one or more columns.

The following SQL statement counts as orders grouped by shippers:

```sql
SELECT Shippers.ShipperName, COUNT(Orders.OrderID) AS NumberOfOrders
FROM Orders
LEFT JOIN Shippers
ON Orders.ShipperID=Shippers.ShipperID
GROUP BY ShipperName;
```

We can also use the GROUP BY statement on more than one column, like this:

```sql
SELECT Shippers.ShipperName, Employees.LastName, COUNT(Orders.OrderID) AS NumberOfOrders
FROM Orders
JOIN Shippers ON Orders.ShipperID = Shippers.ShipperID
JOIN Employees ON Orders.EmployeeID = Employees.EmployeeID
GROUP BY ShipperName,LastName;
```

#### The HAVING Clause

The HAVING clause was added to SQL because the WHERE keyword could not be used with aggregate functions.

```sql
SELECT Employees.LastName, COUNT(Orders.OrderID) AS NumberOfOrders FROM Orders
INNER JOIN Employees
ON Orders.EmployeeID=Employees.EmployeeID
WHERE LastName='Davolio' OR LastName='Fuller'
GROUP BY LastName
HAVING COUNT(Orders.OrderID) > 25;
```

### Using SQL Comments

Comments can be used to explain sections of SQL statements.

Single line comments start with `--`, the content between `--` and the end of the line will be ignored (will not be executed):

```sql
SELECT * FROM Customers -- WHERE City='Berlin';
```

Multi-line comments start with `/*` and end with `*/`, the data between `/*` and `*/` will be ignored:

```sql
/* Select all the columns
 * of all the records
 * in the Customers table:
 */
SELECT * FROM Customers;
```

### Storing Query Result in other Table

#### Using the SELECT INTO Statement to Create a New Table

The `SELECT INTO` statement copies the result of a `SELECT` query and inserts it into a new table.

The following SQL statement will copy only the German customers into the new table:

```sql
SELECT *
INTO CustomersBackup2013
FROM Customers
WHERE Country='Germany';
```

When used in combination with `IN` keyword, the `SELECT INTO` statement can also creates a new table in another database.

The following statement copies the `Customers` table into a new `CustomersBackup2013` in `Backup.mdb` database:

```sql
SELECT *
INTO CustomersBackup2013 IN 'Backup.mdb'
FROM Customers;
```

#### Using the the INSERT INTO SELECT Statement

Similar to the `SELECT INTO` statement, the `INSERT INTO SELECT` statement copies data from one table and inserts it into an _existing_ table.
Columns can also be specified to ask the `INSERT INTO SELECT` statement only insert the data in designated columns of the target table.

The following statement copies only the German suppliers into `Customers`:

```sql
INSERT INTO Customers (CustomerName, Country)
SELECT SupplierName, Country FROM Suppliers
WHERE Country='Germany';
```

## Table Schema and Index Management

### Creating Database

The `CREATE DATABASE` statement is used to create a database.

The following SQL statement creates a database called `my_db`:

```sql
CREATE DATABASE my_db;
```

### Deleting Database

The `DROP DATABASE` statement is used to delete a database.

The following SQL statement deletes the `my_db` database.

```sql
DROP DATABASE my_db;
```

### Creating Table

The `CREATE TABLE` statement is used to create a table in a database. During the creation, one will specify the name of the table, columns it has, and the name, data type
and optional constrain of each column.

The following SQL statement creates a table called `Persons` that contains five columns: `PersonID`, `LastName`, `FirstName`, `Address`, and `City`.

```sql
CREATE TABLE Persons (
    PersonID int,
    LastName varchar(255),
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255)
);
```

### Deleting Table

The `DROP TABLE` statement is used to delete a table.

The following SQL statement deletes the `Persons` table:

```sql
DROP TABLE Persons;
```

### Deleting all the Records in a Table

The `TRUNCATE TABLE` statement is used to delete all the data inside a table while not deleting the table itself.

The following SQL statement deletes all the record in the `Persons` table:

```sql
TRUNCATE TABLE Persons;
```

### Modifying Table Schema

The `ALTER TABLE` statement is used to add, delete, or modify columns in an existing table.

The following statement adds a new column named `DateOfBirth` in the `Persons` table:

```sql
ALTER TABLE Persons
ADD DateOfBirth date;
```

The following statement changes the data type of the `DateOfBirth` column in the `Persons` table:

```sql
ALTER TABLE Persons
MODIFY COLUMN DateOfBirth year;
```

The following statement deletes the `DateOfBirth` column in the `Persons` table:

```sql
ALTER TABLE Persons
DROP COLUMN DateOfBirth;
```

### The SQL Constraints

SQL constraints can be added to table columns to specify rules for the data it stores.
If there is any violation between the constraint and the data action, the action is aborted by the constraint.

SQL constraints can be added to table columns during table creation or after the table is created.

In SQL, we have the following constrains:

| Name | Description |
| --- | --- |
| `NOT NULL` | Indicates that a column cannot store NULL value |
| `UNIQUE` | Ensures that each row for a column must have a unique value |
| `PRIMARY KEY` | A combination of a `NOT NULL` and `UNIQUE`. Ensures that a column (or combination of two or more columns) have a unique identity which helps to find a particular record in a table more easily and quickly |
| `FOREIGN KEY` | Ensure the referential integrity of the data in one table to match values in another table |
| `CHECK` | Ensures that the value in a column meets a specific condition |
| `DEFAULT` | Specifies a default value for a column |

#### The NOT NULL Constraint

The `NOT NULL` constraint enforces a column to NOT accept NULL values, i.e. the field must always contain a value.
This means that you cannot insert a new record, or update a record without adding a value to this field.

The following table creation statement enforces the `P_Id` column and the `LastName` column to not accept NULL values:

```sql
CREATE TABLE PersonsNotNull (
    P_Id int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255)
);
```

You can also add this constraint after the table is created using the `ALTER TABLE` statement. The following code achieves the same result:

```sql
ALTER TABLE PersonsNotNull MODIFY P_Id int NOT NULL;
ALTER TABLE PersonsNotNUll MODIFY LastName varchar(255) NOT NULL;
```

#### The UNIQUE Constraint

The `UNIQUE` constraint uniquely identifies each record in a database table. A `UNIQUE` constraint can be added on more than one columns.

The following SQL creates a `UNIQUE` constraint named `uc_PersonID` on the `P_Id` and `LastName` column when the `Persons` table is created:

```sql
CREATE TABLE Persons (
    P_Id int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255),
    CONSTRAINT uc_PersonID UNIQUE (P_Id, LastName)
);
```

The `UNIQUE` constraint can also be added after the table is created. The following statement achieves the same result:

```sql
ALTER TABLE Persons
ADD CONSTRAINT uc_PersonID UNIQUE (P_Id,LastName)
```

#### The PRIMARY KEY Constraint

The `PRIMARY KEY` constraint uniquely identifies each record in a database table.

A `PRIMARY KEY` constraint can be seen as a combination of `NOT NULL` and `UNIQUE`, but while a table can have arbitary number of
`NOT NULL` and `UNIQUE` constrains, a table can only have one `PRIMARY KEY` constraint.

The following statement creates a table called `Persons` and adds a `PRIMARY KEY` constraint called `pk_PersonID`
on column `P_Id` and `LastName`:

```sql
CREATE TABLE Persons (
    P_Id int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255),
    CONSTRAINT pk_PersonID PRIMARY KEY (P_Id,LastName)
);
```

The following statement adds a `PRIMARY KEY` constraint on column `P_Id` and `LastName` to table `Persons`:

```sql
ALTER TABLE Persons
ADD CONSTRAINT pk_PersonID PRIMARY KEY (P_Id,LastName)
```

#### The FOREIGN KEY Constraint

A `FOREIGN KEY` in one table points to a `PRIMARY KEY` in another table.

The following SQL creates a `FOREIGN KEY` on the `P_Id` column when the `Orders` table is created:

```sql
CREATE TABLE Orders (
    O_Id int NOT NULL,
    OrderNo int NOT NULL,
    P_Id int,
    PRIMARY KEY (O_Id),
    CONSTRAINT fk_PerOrders FOREIGN KEY (P_Id) REFERENCES Persons(P_Id)
);
```

You can also use the `ALTER TABLE` statement to add a `FOREIGN KEY` constraint on an existing table:

```sql
ALTER TABLE Orders
ADD CONSTRAINT fk_PerOrders
FOREIGN KEY (P_Id)
REFERENCES Persons(P_Id);
```

#### The CHECK Constraint

The CHECK constraint allows you to add rules on the values a table can contain.

The following SQL statement creates a `CHECK` contraint when the `Persons` table is created:

```sql
CREATE TABLE Persons (
    P_Id int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255),
    CONSTRAINT chk_Person CHECK (P_Id>0 AND City='Sandnes')
);
```

You can also use the `ALTER TABLE` statement to add a `CHECK` constraint on an existing table:

```sql
ALTER TABLE Persons
ADD CONSTRAINT chk_Person CHECK (P_Id>0 AND City='Sandnes')
```

#### The DEFAULT Constraint

The DEFAULT constraint is used to specify a default value for a column. The default value will be used if you insert a new record
without specifying the value of that column.

The following SQL creates a `DEFAULT` constraint on the `City` column when the `Persons` table is created:

```sql
CREATE TABLE Persons (
    P_Id int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255) DEFAULT 'Sandnes'
);
```

The `DEFAULT` constraint can also be used to insert system values, by using functions like `GETDATE()`:

```sql
CREATE TABLE Orders (
    O_Id int NOT NULL,
    OrderNo int NOT NULL,
    P_Id int,
    OrderDate date DEFAULT GETDATE()
);
```

### Creating Index

An index can be created in a table to find data more quickly and efficiently.
Updating a table with indexes takes more time than updating a table without, as the indexes also need an update
($O(1)$ to $O(log(n))$ for most cases).

The following SQL statement creates an index named `PIndex` on the `LastName` and `FirstName` column in the `Persons` table:

```sql
CREATE INDEX PIndex
ON Persons (LastName, FirstName);
```

You can also create a `UNIQUE` index by adding `UNIQUE` keyword, which is quite similar to adding a `UNIQUE` constraint for
most database systems:

```sql
CREATE UNIQUE INDEX PIndex
ON Persons (LastName, FirstName);
```

### Droping Index

The `DROP INDEX` statement is used to remove index from designated table. Unfortunately, the valid syntax of `DROP INDEX`
varies from different database systems.

For MySQL:

```sql
ALTER TABLE table_name DROP INDEX index_name;
```

### View

In SQL, a view is a virtual table based on the result-set of an SQL statement. A view always shows up-to-date data!
The database engine recreates the data, using the view's SQL statement, every time a user queries a view.
In most cases, view is used to save clients from sending complex query each time:

#### Creating a View

```sql
CREATE VIEW [Category Sales For 1997] AS
SELECT DISTINCT CategoryName,Sum(ProductSales) AS CategorySales
FROM [Product Sales for 1997]
GROUP BY CategoryName;
```

#### Updating a View

```sql
CREATE OR REPLACE VIEW [Current Product List] AS
SELECT ProductID,ProductName,Category
FROM Products
WHERE Discontinued=No;
```

#### Dropping a View

```sql
DROP VIEW view_name;
```

