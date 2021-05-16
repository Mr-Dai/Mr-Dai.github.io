---
title: Java String Formatting
category: Java
tags: Java
date: 2016-03-26
toc: true
---

Printing or producing a simple `String` message has been really trivial in Java. Most of the time, we use concatenation to create `String` instance we want:

```java
int a = 3;
String str = "Integer `a` has value `" + a + "`";
```

Though modern Java compiler uses `StringBuilder` to optimize statements like these, using concatention to construct `String` has its limitations, which include:

- The pattern of the `String` is not reusable;
- The statements can be unacceptably long if we try to construct a complicated message;
- It is impossible to designate the precision of a floating point number.

Fortunately, Java SE 5.0 brought back the venerable `printf` method from the C library, which also come with the basic feature of string formatting.

<!-- more -->

## Elements of Formatting Patterns

`printf` method in Java is much like its counterpart in C. For example, the call

```java
System.out.pinrlnt("%8.2f", x);
```

prints `x` with a *field width* of 8 characters and a *precision* of 2 characters.

You can supply multiple parameters to `printf`. For example:

```java
System.out.printf("Hello, %s. Next year, you'll be %d.", name, age);
```

The formatting patterns is written in a `String` constant, where *format specifiers* that start with a `%` character is replaced with the corresponding argument. A format specifier is composed of *flag* and/or *conversion character*. *Flags* are used to control the apperance of the formatted string, while the *conversion character* that ends a format specifier indicates the type of the value to be formatted: `f` is a floating-point number, `s` a string, and `d` a decimal integer.

| Conversion Character | Type | Example |
| --- | --- | --- |
| `d` | Decimal integer | `159` |
| `x` | Hexadecimal integer | `9f` | 
| `o` | Octal integer | `237` | 
| `f` | Fixed-point floating-point | `15.9` | 
| `e` | Exponential floating-point | `1.59e+01` | 
| `g` | Genral floating-point (the shorter of `e` and `f`) | | 
| `a` | Hexadecimal floating-point | `0x1.fccdp3` | 
| `s` | String | `Hello` | 
| `c` | Character | `H` | 
| `b` | `boolean` | `true` | 
| `h` | Hash code | `42628b2` | 
| `%` | The percent symbol | | 
| `n` | The platform-dependent line seperator |  |

| Flag | Purpose | Example |
| `+` | Prints sign for positive and negative numbers. | `+3333.33` | 
| space | Adds a space before positive numbers. | `| 3333.33|` | 
| `0` | Adds leading zeroes. | `003333.33` |
| `-` | Left-justifies field. | `|3333.33 |` | 
| `(` | Encloses negative numbers in parentheses. | `(3333.33)` | 
| `,` | Adds group separators. | `3,333.33` | 
| `#` (for `f` format) | Always includes a decimal point. | `3,333.` | 
| `#` (for `x` or `o` format) | Adds `0x` or `0` prefix. | `0xcafe` | 
| `$` | Specifies the index of the argument to be formatted; for example,<br>`%1$d %1$x` prints the first argument in deximal and hexadecimal. | `159 9F` | 
| `<` | Formats the same value as the previous secification; for example,<br>`%d %<x` prints the same number in decimal and hexadecimal. | `159 9F` | 
	
You can use the static `String.format` method to create a formatted string without printing it:

```java
String message = String.format("Hello, %s. Next year, you'll be %d.", name, age);
```

Conversion characters for `Date` formatting are also available, which start with `t`:

```java
System.out.printf("%tc", new Date());
// Mon Fex 09 18:05:19 PST 2004
```

| Conversion Character | Type | Example |
| --- | --- | --- |
| `c` | Complete date and time | `Mon Feb 09 18:05:19 PST 2004` | 
| `F` | ISO 8601 date | `2004-02-09` | 
| `D` | U.S. formatted date (month/day/year) | `02/09/2004` | 
| `T` | 24-hour time | `18:05:19` | 
| `r` | 12-hour time | `06:05:19 pm` | 
| `R` | 24-hour time, no seconds | `18:05` | 
| `Y` | Four-digit year (with leading zeroes) | `2004` | 
| `y` | Last two digits of the year (with leading zeroes) | `04` | 
| `C` | First two digits of the year (with leading zeroes) | `20` | 
| `B` | Full month name | `February` | 
| `b` or `h` | Abbreviated month name | `Feb` | 
| `m` | Two-digit month (with leading zeroes) | `02` | 
| `d` | Two-digit day (with leading zeroes) | `09` | 
| `e` | Two-digit day (without leading zeroes) | `9` | 
| `A` | Full weekday name | `Monday` | 
| `a` | Abbreviated weekday name | `Mon` | 
| `j` | Three-digit day of year (with leading zeroes), between `001` and `366` | `069` | 
| `H` | Two-digit hour (with leading zeroes), between `00` and `23` | `18` | 
| `k` | Two-digit hour (without leading zeroes), between `0` and `23` | `18` | 
| `I` | Two-digit hour (with leading zeroes), between `01` and `12` | `06` | 
| `l` | Two-digit hour (without leading zeroes), between `1` and `12` | `6` | 
| `M` | Two-digit minutes (with leading zeroes) | `05` | 
| `S` | Two-digit seconds (with leading zeroes) | `19` | 
| `L` | Three-digit milliseconds (with leading zeroes) | `047` |
| `N` | Nine-digit nanoseconds (with leading zeroes) | `047000000` | 
| `P` | Uppercase morning or afternoon marker | `PM` | 
| `p` | Lowercase morning or afternoon marker | `pm` | 
| `z` | RFC 822 numeric offset from GMT | `-0800` | 
| `Z` | Time zone | `PST` | 
| `s` | Seconds since `1970-01-01 00:00:00 GMT` | `1078884319` | 
| `Q` | Milliseconds since `1970-01-01 00:00:00 GMT` | `1078884319047` | 

As you can see in the preceding table, some of the formates yield only a part of a given date -- for example, just the day or just the month.
It would be a bit silly if you had to supply the day multiple times for format each part. For that reason, a format string can indicate
the *index* of the argument to be formatted. The index must immediately follow the `%`, and it must be terminated by a `$`. For example:

```java
System.out.println("%1$s %2$tB %2$te, %2$tY", "Due date:", new Date());
// Due date: February 9, 2004
```

Alternatively, you can use the `<` flag. It indicates that the same argument as in the preceding format specification should be used again.
That is, the statement

```java
System.out.println("%s %tB %<te, %<tY", "Due date:", new Date());
```

yields the same output as the preceding statement.
