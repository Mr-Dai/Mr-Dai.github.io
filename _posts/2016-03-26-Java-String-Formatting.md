---
layout: post_original
title: Java String Formatting
author: Robert Peng
category: Java
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

## Introduction

Printing or producing a simple `String` message has been really trivial in Java. Most of the time, we use concatenation to create `String` instance we want:

<pre class="brush: java">
int a = 3;
String str = "Integer `a` has value `" + a + "`";
</pre>

Though modern Java compiler uses `StringBuilder` to optimize statements like these, using concatention to construct `String` has its limitations, which include:

- The pattern of the `String` is not reusable;
- The statements can be unacceptably long if we try to construct a complicated message;
- It is impossible to designate the precision of a floating point number.

Fortunately, Java SE 5.0 brought back the venerable `printf` method from the C library, which also come with the basic feature of string formatting.

## Elements of Formatting Patterns

`printf` method in Java is much like its counterpart in C. For example, the call

<pre class="brush: java">
System.out.pinrlnt("%8.2f", x);
</pre>

prints `x` with a *field width* of 8 characters and a *precision* of 2 characters.

You can supply multiple parameters to `printf`. For example:

<pre class="brush: java">
System.out.printf("Hello, %s. Next year, you'll be %d.", name, age);
</pre>

The formatting patterns is written in a `String` constant, where *format specifiers* that start with a `%` character is replaced with the corresponding argument.
A format specifier is composed of *flag* and/or *conversion character*. *Flags* are used to control the apperance of the formatted string, while the *conversion
character* that ends a format specifier indicates the type of the value to be formatted: `f` is a floating-point number, `s` a string, and `d` a decimal integer.

<table class="table">
	<caption><strong>Conversion Characters</strong></caption>
	<tr>
		<th>Conversion Character</th>
		<th>Type</th>
		<th>Example</th>
	</tr>
	<tr>
		<td><code>d</code></td>
		<td>Decimal integer</td>
		<td><code>159</code></td>
	</tr>
	<tr>
		<td><code>x</code></td>
		<td>Hexadecimal integer</td>
		<td><code>9f</code></td>
	</tr>
	<tr>
		<td><code>o</code></td>
		<td>Octal integer</td>
		<td><code>237</code></td>
	</tr>
	<tr>
		<td><code>f</code></td>
		<td>Fixed-point floating-point</td>
		<td><code>15.9</code></td>
	</tr>
	<tr>
		<td><code>e</code></td>
		<td>Exponential floating-point</td>
		<td><code>1.59e+01</code></td>
	</tr>
	<tr>
		<td><code>g</code></td>
		<td>Genral floating-point (the shorter of <code>e</code> and <code>f</code>)</td>
		<td></td>
	</tr>
	<tr>
		<td><code>a</code></td>
		<td>Hexadecimal floating-point</td>
		<td><code>0x1.fccdp3</code></td>
	</tr>
	<tr>
		<td><code>s</code></td>
		<td>String</td>
		<td><code>Hello</code></td>
	</tr>
	<tr>
		<td><code>c</code></td>
		<td>Character</td>
		<td><code>H</code></td>
	</tr>
	<tr>
		<td><code>b</code></td>
		<td><code>boolean</code></td>
		<td><code>true</code></td>
	</tr>
	<tr>
		<td><code>h</code></td>
		<td>Hash code</td>
		<td><code>42628b2</code></td>
	</tr>
	<tr>
		<td><code>%</code></td>
		<td>The percent symbol</td>
		<td></td>
	</tr>
	<tr>
		<td><code>n</code></td>
		<td>The platform-dependent line seperator</td>
		<td></td>
	</tr>
</table>

<table class="table">
	<caption><strong>Flags</strong></caption>
	<tr>
		<th>Flag</th>
		<th>Purpose</th>
		<th>Example</th>
	</tr>
	<tr>
		<td><code>+</code></td>
		<td>Prints sign for positive and negative numbers.</td>
		<td><code>+3333.33</code></td>
	</tr>
	<tr>
		<td>space</td>
		<td>Adds a space before positive numbers.</td>
		<td><code>| 3333.33|</code></td>
	</tr>
	<tr>
		<td><code>0</code></td>
		<td>Adds leading zeroes.</td>
		<td><code>003333.33</code></td>
	</tr>
	<tr>
		<td><code>-</code></td>
		<td>Left-justifies field.</td>
		<td><code>|3333.33 |</code></td>
	</tr>
	<tr>
		<td><code>(</code></td>
		<td>Encloses negative numbers in parentheses.</td>
		<td><code>(3333.33)</code></td>
	</tr>
	<tr>
		<td><code>,</code></td>
		<td>Adds group separators.</td>
		<td><code>3,333.33</code></td>
	</tr>
	<tr>
		<td><code>#</code> (for <code>f</code> format)</td>
		<td>Always includes a decimal point.</td>
		<td><code>3,333.</code></td>
	</tr>
	<tr>
		<td><code>#</code> (for <code>x</code> or <code>o</code> format)</td>
		<td>Adds <code>0x</code> or <code>0</code> prefix.</td>
		<td><code>0xcafe</code></td>
	</tr>
	<tr>
		<td><code>$</code></td>
		<td>
			Specifies the index of the argument to be formatted; for example,<br>
			<code>%1$d %1$x</code> prints the first argument in deximal and hexadecimal.
		</td>
		<td><code>159 9F</code></td>
	</tr>
	<tr>
		<td><code>&lt;</code></td>
		<td>
			Formats the same value as the previous secification; for example,<br>
			<code>%d %&lt;x</code> prints the same number in decimal and hexadecimal.
		</td>
		<td><code>159 9F</code></td>
	</tr>
</table>

You can use the static `String.format` method to create a formatted string without printing it:

<pre class="brush: java">
String message = String.format("Hello, %s. Next year, you'll be %d.", name, age);
</pre>

Conversion characters for `Date` formatting are also available, which start with `t`:

<pre class="brush: java">
System.out.printf("%tc", new Date());
// Mon Fex 09 18:05:19 PST 2004
</pre>

<table class="table">
	<caption><strong>Date and Time Conversion Characters</strong></caption>
	<tr>
		<th>Conversion Character</th>
		<th>Type</th>
		<th>Example</th>
	</tr>
	<tr>
		<td><code>c</code></td>
		<td>Complete date and time</td>
		<td><code>Mon Feb 09 18:05:19 PST 2004</code></td>
	</tr>
	<tr>
		<td><code>F</code></td>
		<td>ISO 8601 date</td>
		<td><code>2004-02-09</code></td>
	</tr>
	<tr>
		<td><code>D</code></td>
		<td>U.S. formatted date (month/day/year)</td>
		<td><code>02/09/2004</code></td>
	</tr>
	<tr>
		<td><code>T</code></td>
		<td>24-hour time</td>
		<td><code>18:05:19</code></td>
	</tr>
	<tr>
		<td><code>r</code></td>
		<td>12-hour time</td>
		<td><code>06:05:19 pm</code></td>
	</tr>
	<tr>
		<td><code>R</code></td>
		<td>24-hour time, no seconds</td>
		<td><code>18:05</code></td>
	</tr>
	<tr>
		<td><code>Y</code></td>
		<td>Four-digit year (with leading zeroes)</td>
		<td><code>2004</code></td>
	</tr>
	<tr>
		<td><code>y</code></td>
		<td>Last two digits of the year (with leading zeroes)</td>
		<td><code>04</code></td>
	</tr>
	<tr>
		<td><code>C</code></td>
		<td>First two digits of the year (with leading zeroes)</td>
		<td><code>20</code></td>
	</tr>
	<tr>
		<td><code>B</code></td>
		<td>Full month name</td>
		<td><code>February</code></td>
	</tr>
	<tr>
		<td><code>b</code> or <code>h</code></td>
		<td>Abbreviated month name</td>
		<td><code>Feb</code></td>
	</tr>
	<tr>
		<td><code>m</code></td>
		<td>Two-digit month (with leading zeroes)</td>
		<td><code>02</code></td>
	</tr>
	<tr>
		<td><code>d</code></td>
		<td>Two-digit day (with leading zeroes)</td>
		<td><code>09</code></td>
	</tr>
	<tr>
		<td><code>e</code></td>
		<td>Two-digit day (without leading zeroes)</td>
		<td><code>9</code></td>
	</tr>
	<tr>
		<td><code>A</code></td>
		<td>Full weekday name</td>
		<td><code>Monday</code></td>
	</tr>
	<tr>
		<td><code>a</code></td>
		<td>Abbreviated weekday name</td>
		<td><code>Mon</code></td>
	</tr>
	<tr>
		<td><code>j</code></td>
		<td>Three-digit day of year (with leading zeroes), between <code>001</code> and <code>366</code></td>
		<td><code>069</code></td>
	</tr>
	<tr>
		<td><code>H</code></td>
		<td>Two-digit hour (with leading zeroes), between <code>00</code> and <code>23</code></td>
		<td><code>18</code></td>
	</tr>
	<tr>
		<td><code>k</code></td>
		<td>Two-digit hour (without leading zeroes), between <code>0</code> and <code>23</code></td>
		<td><code>18</code></td>
	</tr>
	<tr>
		<td><code>I</code></td>
		<td>Two-digit hour (with leading zeroes), between <code>01</code> and <code>12</code></td>
		<td><code>06</code></td>
	</tr>
	<tr>
		<td><code>l</code></td>
		<td>Two-digit hour (without leading zeroes), between <code>1</code> and <code>12</code></td>
		<td><code>6</code></td>
	</tr>
	<tr>
		<td><code>M</code></td>
		<td>Two-digit minutes (with leading zeroes)</td>
		<td><code>05</code></td>
	</tr>
	<tr>
		<td><code>S</code></td>
		<td>Two-digit seconds (with leading zeroes)</td>
		<td><code>19</code></td>
	</tr>
	<tr>
		<td><code>L</code></td>
		<td>Three-digit milliseconds (with leading zeroes)</td>
		<td><code>047</code></td>
	</tr>
	<tr>
		<td><code>N</code></td>
		<td>Nine-digit nanoseconds (with leading zeroes)</td>
		<td><code>047000000</code></td>
	</tr>
	<tr>
		<td><code>P</code></td>
		<td>Uppercase morning or afternoon marker</td>
		<td><code>PM</code></td>
	</tr>
	<tr>
		<td><code>p</code></td>
		<td>Lowercase morning or afternoon marker</td>
		<td><code>pm</code></td>
	</tr>
	<tr>
		<td><code>z</code></td>
		<td>RFC 822 numeric offset from GMT</td>
		<td><code>-0800</code></td>
	</tr>
	<tr>
		<td><code>Z</code></td>
		<td>Time zone</td>
		<td><code>PST</code></td>
	</tr>
	<tr>
		<td><code>s</code></td>
		<td>Seconds since <code>1970-01-01 00:00:00 GMT</code></td>
		<td><code>1078884319</code></td>
	</tr>
	<tr>
		<td><code>Q</code></td>
		<td>Milliseconds since <code>1970-01-01 00:00:00 GMT</code></td>
		<td><code>1078884319047</code></td>
	</tr>
</table>

As you can see in the preceding table, some of the formates yield only a part of a given date -- for example, just the day or just the month.
It would be a bit silly if you had to supply the day multiple times for format each part. For that reason, a format string can indicate
the *index* of the argument to be formatted. The index must immediately follow the `%`, and it must be terminated by a `$`. For example:

<pre class="brush: java">
System.out.println("%1$s %2$tB %2$te, %2$tY", "Due date:", new Date());
// Due date: February 9, 2004
</pre>

Alternatively, you can use the `<` flag. It indicates that the same argument as in the preceding format specification should be used again.
That is, the statement

<pre class="brush: java">
System.out.println("%s %tB %&lt;te, %&lt;tY", "Due date:", new Date());
</pre>

yields the same output as the preceding statement.
