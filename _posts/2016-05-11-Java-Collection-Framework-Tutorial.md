---
layout: posts_translated
title: Java 集合框架教程
author: Robert Peng
category: Java
org_title: "Java Collections Framework Tutorial"
org_url: "http://docs.oracle.com/javase/tutorial/collections/index.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushBash.js"></script>

[Collection]: http://docs.oracle.com/javase/8/docs/api/java/util/Collection.html

[Iterator]: http://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html

[Set]: http://docs.oracle.com/javase/8/docs/api/java/util/Set.html
[HashSet]: http://docs.oracle.com/javase/8/docs/api/java/util/HashSet.html
[TreeSet]: http://docs.oracle.com/javase/8/docs/api/java/util/TreeSet.html
[LinkedHashSet]: http://docs.oracle.com/javase/8/docs/api/java/util/LinkedHashSet.html
[EnumSet]: http://docs.oracle.com/javase/8/docs/api/java/util/EnumSet.html
[CopyOnWriteArraySet]: http://docs.oracle.com/javase/8/docs/api/java/util/CopyOnWriteArraySet.html

[List]: http://docs.oracle.com/javase/8/docs/api/java/util/List.html
[ArrayList]: http://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html
[LinkedList]: http://docs.oracle.com/javase/8/docs/api/java/util/LinkedList.html

[Map]: http://docs.oracle.com/javase/8/docs/api/java/util/Map.html

[Queue]: http://docs.oracle.com/javase/8/docs/api/java/util/Queue.html

<h2 id="introduction">1 简介</h2>

原文链接：[Introduction to Collections](http://docs.oracle.com/javase/tutorial/collections/intro/index.html)


<!--
    A collection — sometimes called a container — is simply an object that groups multiple elements into a single unit.
    Collections are used to store, retrieve, manipulate, and communicate aggregate data.
    Typically, they represent data items that form a natural group, such as a poker hand (a collection of cards), a mail folder (a collection of letters),
    or a telephone directory (a mapping of names to phone numbers).
    If you have used the Java programming language — or just about any other programming language — you are already familiar with collections.
-->
集合（collection），有时又被叫做容器（container），用于将多个元素容纳到一个整体之中。集合用于存储、获取、修改以及聚合数据。
大多数时候，它们用于表示可被组合在一起的数据单位，例如一副手牌（扑克牌的集合）、一个信箱（信的集合）或者是一个电话簿（姓名到电话号码的映射）。
如果你有使用过 Java 或者其它编程语言，你应该已经很熟悉集合了。

<h3 id="what-is-a-collections-framework">1.1 集合框架是什么？</h3>


<!--
    A collections framework is a unified architecture for representing and manipulating collections. All collections frameworks contain the following:
-->
集合框架（collections framework）是一种用于表示和操控集合的统一的代码结构。所有的集合框架都包括如下几个方面：

-	<!-- 
		Interfaces: These are abstract data types that represent collections. Interfaces allow collections to be manipulated independently of the details of their representation. 
		In object-oriented languages, interfaces generally form a hierarchy.
	-->
  	**接口**（Interface）：用于表示集合的抽象数据类型。接口的存在使得使用者可以在不去了解集合的实现的情况下操控集合。
   	在面向对象语言中，接口们可相互结合，形成类型结构。
   
-	<!--
		Implementations: These are the concrete implementations of the collection interfaces. In essence, they are reusable data structures.
	-->
	**实现**（Implementation）：集合接口的实现。本质上，它们都是可复用的数据结构。

-	<!--
		Algorithms: These are the methods that perform useful computations, such as searching and sorting, on objects that implement collection interfaces.
		The algorithms are said to be polymorphic: that is, the same method can be used on many different implementations of the appropriate collection interface.
		In essence, algorithms are reusable functionality.
	-->
	**算法**（Algorithm）：对实现集合接口的对象进行计算的方法，比如查找和排序。算法通常被认为是多态（polymorphic）的：意思是说，同样的方法可以被用于某个集合接口的不同实现。
	本质上，算法是可复用的功能逻辑。

<!--
	Apart from the Java Collections Framework, the best-known examples of collections frameworks are the C++ Standard Template Library (STL) and Smalltalk's collection hierarchy.
	Historically, collections frameworks have been quite complex, which gave them a reputation for having a steep learning curve.
	We believe that the Java Collections Framework breaks with this tradition, as you will learn for yourself in this chapter.
-->
除了 Java 的集合框架，最著名的集合框架当属 C++ 的标准模板库（STL）和 Smalltalk 的集合层级（collection hirarchy）了。
从历史上看，集合框架们多半都十分复杂，使得大众们普遍认为集合框架有着相当陡峭的学习曲线。
我相信随着你的深入学习，你就会知道 Java 集合框架是如何打破这项“传统”的。

<h3 id="benefits-of-the-java-collections-framework">1.2 使用 Java 集合框架的好处</h3>

<!--
    The Java Collections Framework provides the following benefits:
-->
使用 Java 集合框架能为你带来如下几点好处：

-	<!--
		Reduces programming effort: By providing useful data structures and algorithms, the Collections Framework frees you to concentrate on the important parts of your program rather than on the low-level "plumbing" required to make it work.
		By facilitating interoperability among unrelated APIs, the Java Collections Framework frees you from writing adapter objects or conversion code to connect APIs.
	-->
	**减少需要编写的代码**：Java 集合框架提供了大量有用的数据结构和算法，使得你可以更加专注于实现你的程序中其他更重要的部分，而不需要为了让你的程序运行起来而去烦心那些底层的东西。
	Java 集合框架不断地在增进不相关的 API 之间的互操性，使得你不需要为了连接这些 API 而去编写适配或者转换的代码。

-	<!--
		Increases program speed and quality: This Collections Framework provides high-performance, high-quality implementations of useful data structures and algorithms.
		The various implementations of each interface are interchangeable, so programs can be easily tuned by switching collection implementations.
		Because you're freed from the drudgery of writing your own data structures, you'll have more time to devote to improving programs' quality and performance.
	-->
	**提高编码速度和质量**：Java 集合框架提供了大量有用数据结构和算法的高效高质量实现。每个接口的实现类是可以随意更换的，这使得你可以通过调整你所使用的接口实现类来配置你的程序。
	由于你不再需要烦心如何编写你自己的数据结构，你可以花更多时间来提高你的程序的性能和质量。

-	<!--
		Allows interoperability among unrelated APIs: The collection interfaces are the vernacular by which APIs pass collections back and forth.
		If my network administration API furnishes a collection of node names and if your GUI toolkit expects a collection of column headings,
		our APIs will interoperate seamlessly, even though they were written independently.
	-->
	**使不相关的 API 的相互操作成为可能**：集合接口是 API 之间相互传递集合所使用的方言（vernacular）。如果我的网络管理 API 可以提供一个结点名称的集合，而你的 GUI
	工具栏想要一个列标题的集合，我们的 API 完全可以无缝地相互操作，即使它们的实现是相互独立的。

-	<!--
		Reduces effort to learn and to use new APIs: Many APIs naturally take collections on input and furnish them as output.
		In the past, each such API had a small sub-API devoted to manipulating its collections. There was little consistency among these ad hoc collections sub-APIs,
		so you had to learn each one from scratch, and it was easy to make mistakes when using them. With the advent of standard collection interfaces, the problem went away.
	-->
	**减少学习新 API 的麻烦**：很多 API 都会把集合作为它们的输入或者输出。在以前，每个这样的 API 都需要另在创建一个小的子 API 以供使用者操控它们的集合。
	这些集合子 API 之间很难保持一致性，因此你每次都需要重新学习一个新的 API，而且这样做很容易使你误用它们。随着标准集合接口的出现，这样的问题彻底消失了。

-	<!--
		Reduces effort to design new APIs: This is the flip side of the previous advantage. Designers and implementers don't have to reinvent the wheel each time
		they create an API that relies on collections; instead, they can use standard collection interfaces.
	-->
	**减少了设计新 API 的麻烦**：这个更像是上一个好处的另外一面。设计者和实现者们不再需要在他们每次创建一个依赖集合的 API 时都重新发明轮子：
	现在，他们直接使用标准的集合接口就可以了。

-	<!--
		Fosters software reuse: New data structures that conform to the standard collection interfaces are by nature reusable.
		The same goes for new algorithms that operate on objects that implement these interfaces.
	-->
	**提高了软件的可复用性**：符合标准集合接口的新数据结构自然都是可复用的，同样用于操作这些对象的算法也是可复用的。

---

<h2 class="jump" id="interfaces">2 接口</h2>

原文链接：[Interfaces](http://docs.oracle.com/javase/tutorial/collections/interfaces/index.html)

<!--
	The core collection interfaces encapsulate different types of collections, which are shown in the figure below.
	These interfaces allow collections to be manipulated independently of the details of their representation.
	Core collection interfaces are the foundation of the Java Collections Framework.
	As you can see in the following figure, the core collection interfaces form a hierarchy.
-->
核心的集合接口们封装了各种类型的集合。这些接口使得用户可以在不清楚实现的情况下对集合进行操作。它们共同组成了 Java 集合框架的根基。
正如下图所示，这些接口相互之间存在着一定的层次关系。

<p class="center"><img src="http://docs.oracle.com/javase/tutorial/figures/collections/colls-coreInterfaces.gif" /></p>

<!--
	A Set is a special kind of Collection, a SortedSet is a special kind of Set, and so forth.
	Note also that the hierarchy consists of two distinct trees — a Map is not a true Collection.
-->
`Set` 是一种特殊的 `Collection`，而 `SortedSet` 是一种特殊的 `Set`，依此类推。注意这个类型层次由两个相互独立的部分组成：
`Map` 并不是 `Collection`。


<!--
	Note that all the core collection interfaces are generic. For example, this is the declaration of the Collection interface.
-->
注意，所有的这些核心接口都是泛型的。例如，`Collection` 接口的声明是这样的：

<pre class="brush: java">
public interface Collection&lt;E&gt;...
</pre>

<!--
	The <E> syntax tells you that the interface is generic. When you declare a Collection instance you can and should specify the type of object contained in the collection.
	Specifying the type allows the compiler to verify (at compile-time) that the type of object you put into the collection is correct, thus reducing errors at runtime.
	For information on generic types, see the Generics (Updated) lesson.
-->
从 `<E>` 即可看出，这个接口是泛型的。当你声明一个 `Collection` 实例时你应该给出这个集合元素的类型。给出集合元素的类型使得编译器可以（在编译时）
验证你放入集合中的对象类型是否正确，从而减少运行时错误的发生。有关泛型的更多信息，你可以看看[这个](http://docs.oracle.com/javase/tutorial/java/generics/index.html)教程。


<!--
	When you understand how to use these interfaces, you will know most of what there is to know about the Java Collections Framework.
	This chapter discusses general guidelines for effective use of the interfaces, including when to use which interface.
	You'll also learn programming idioms for each interface to help you get the most out of it.
-->
等你学会了如何使用这些接口，你就掌握了 Java 集合框架的大部分知识了。在这一章中，我们将会讨论有效使用这些接口的基本准则，包括在什么时候使用什么接口，
并在这个过程中学会每个接口的常用语法。


<!--
	To keep the number of core collection interfaces manageable, the Java platform doesn't provide separate interfaces for each variant of each collection type.
	(Such variants might include immutable, fixed-size, and append-only.) Instead, the modification operations in each interface are designated optional
	— a given implementation may elect not to support all operations. If an unsupported operation is invoked, a collection throws an UnsupportedOperationException.
	Implementations are responsible for documenting which of the optional operations they support.
	All of the Java platform's general-purpose implementations support all of the optional operations.
-->
为了使得核心集合接口的数量不至于失控，Java 并不会为每种集合类型的变种提供独立的接口（变种包括不可变集合、定长集合、不可删减集合等）。
相对的，每个接口中的修改操作实际上都是可选的 —— 某个实现类完全可以不去支持所有操作。如果一个不支持的操作被调用，集合将抛出一个
`UnsupportedOperationException`。每个实现类都应该给出详细的文档，说明它们支持哪些操作。Java 所提供的的所有普适的实现类都支持所有的操作。


<!--
	The following list describes the core collection interfaces:
-->
下面的列表简要描述了每个核心集合接口：

-	<!--
		Collection — the root of the collection hierarchy. A collection represents a group of objects known as its elements.
		The Collection interface is the least common denominator that all collections implement and is used to pass collections around and to manipulate them when maximum generality is desired.
		Some types of collections allow duplicate elements, and others do not. Some are ordered and others are unordered.
		The Java platform doesn't provide any direct implementations of this interface but provides implementations of more specific subinterfaces, such as Set and List.
		Also see The Collection Interface section.
	-->
	`Collection`（集合）：集合层级的根类型。一个集合表示一组被称为它的元素的对象。
	`Collection` 接口是所有集合都实现的最不常见的记号，只有在用户传递和操控集合需要最大的概括性时才会使用。
	有些集合允许包含重复的元素，有些则不允许。有些集合是有序的，有些则是无序的。
	Java 并不提供任何直接实现这个接口的类，但提供了对其更为精确的子接口，如 `Set` 和 `List`，的实现类。
	详见 <a href="#collection" target="_self">Collection 接口</a>一节。

-	<!--
		Set — a collection that cannot contain duplicate elements. This interface models the mathematical set abstraction and is used to represent sets,
		such as the cards comprising a poker hand, the courses making up a student's schedule, or the processes running on a machine. See also The Set Interface section.
	-->
	`Set`（集）：不能包含重复元素的集合。这个接口代表着数学上的集抽象，并被用于代表各种各样的集，比如一副手牌、学生的课程、一台机器上的进程。
	详见 <a href="#set" target="_self">Set 接口</a>一节。

-	<!--
		List — an ordered collection (sometimes called a sequence). Lists can contain duplicate elements.
		The user of a List generally has precise control over where in the list each element is inserted and can access elements by their integer index (position).
		If you've used Vector, you're familiar with the general flavor of List. Also see The List Interface section.
	-->
	`List`（表）：有序的集合，有时又被叫做序列（sequence）。`List` 可以包含重复的元素。
	使用 `List` 的人可以清楚地知道插入表中的每个元素的位置，并可以通过它们的整型索引（位置值）直接访问它们。
	如果你有使用过 `Vector`，那你应该就已经很熟悉 `List` 的基本使用了。
	详见 <a href="#list" target="_self">List 接口</a>一节。

-	<!--
		Queue — a collection used to hold multiple elements prior to processing.
		Besides basic Collection operations, a Queue provides additional insertion, extraction, and inspection operations.
	-->
	`Queue`（队列）：用于在处理前保存元素的集合。比起基本的 `Collection` 操作，`Queue` 提供了更多的插入、取出和查询操作。
		
	<!--
		Queues typically, but do not necessarily, order elements in a FIFO (first-in, first-out) manner.
		Among the exceptions are priority queues, which order elements according to a supplied comparator or the elements' natural ordering.
		Whatever the ordering used, the head of the queue is the element that would be removed by a call to remove or poll.
		In a FIFO queue, all new elements are inserted at the tail of the queue. Other kinds of queues may use different placement rules.
		Every Queue implementation must specify its ordering properties. Also see The Queue Interface section.
	-->
	`Queue`，尽管并不一定，在多数情况下以 FIFO （先入先出）的形式组织元素。其中的特例包括了权重队列（priority queue），它根据元素的自然排序或给定的比较器来组织元素。
	不管使用的是什么排序方式，在调用队列的 `remove` 或 `poll` 操作时返回的都是位于队列头部的元素。
	在一个先入先出队列中，所有新元素都会被插入到队列的尾部。其他类型的队列可能会使用不一样的插入方式。每个 `Queue` 实现类都必须说明自己对元素的排序方式。
	详见 <a href="#queue" target="_self">Queue 接口</a>一节。
		
-	<!--
		Deque — a collection used to hold multiple elements prior to processing. Besides basic Collection operations, a Deque provides additional insertion, extraction, and inspection operations.
	-->
	`Deque`（双向队列）：用于在处理前保存元素的集合。比起基本的 `Collection` 操作，`Deque` 提供了更多的插入、取出和查询操作。

	<!--
		Deques can be used both as FIFO (first-in, first-out) and LIFO (last-in, first-out). In a deque all new elements can be inserted, retrieved and removed at both ends.
		Also see The Deque Interface section.
	-->
	双向队列可被用作 FIFO（先入先出）或 LIFO（后入先出）队列。元素可以从双向队列的两端插入、取出或移除。
	详见 <a href="#deque" target="_self">Deque 接口</a>一节。
		
-	<!--
		Map — an object that maps keys to values. A Map cannot contain duplicate keys; each key can map to at most one value.
		If you've used Hashtable, you're already familiar with the basics of Map. Also see The Map Interface section.
	-->
	`Map`（映射）：将键映射到值的对象。一个 `Map` 不能包含重复的键，每个键都至多映射到一个值。
	如果你有用过 `Hashtable`，那你应该就已经很熟悉 `Map` 的基本使用了。详见 <a href="#map" target="_self">Map 接口</a>一节。

<!--
	The last two core collection interfaces are merely sorted versions of Set and Map:
-->
最后两个核心集合接口则是 `Set` 和 `Map` 的有序版本：

-	<!--
		SortedSet — a Set that maintains its elements in ascending order. Several additional operations are provided to take advantage of the ordering.
		Sorted sets are used for naturally ordered sets, such as word lists and membership rolls. Also see The SortedSet Interface section.
	-->
	`SortedSet`（有序集）：以升序维持元素顺序的集合。基于其有序的特性，该接口在 `Set` 的基础上提供了额外的操作。
	有序集被用于表示自然有序的集，比如单词表和成员名册。详见 <a href="#sortedset" target="_self">SortedSet 接口</a>一节。

-	<!--
		SortedMap — a Map that maintains its mappings in ascending key order. This is the Map analog of SortedSet.
		Sorted maps are used for naturally ordered collections of key/value pairs, such as dictionaries and telephone directories. Also see The SortedMap Interface section.
	-->
	`SortedMap`（有序映射）：以升序维持键的顺序的映射，相当于 `Map` 版的 `SortedSet`。有序映射用于表示自然有序的键值对，比如字典和电话簿。
	详见 <a href="#sortedmap" target="_self">SortedMap 接口</a>一节。

<!--
	To understand how the sorted interfaces maintain the order of their elements, see the Object Ordering section.
-->
要想了解有序的接口如何维持元素的顺序，详见[对象排序](#object-ordering)一节。

<h3 cid="collection">2.1 Collection 接口</h3>

原文链接：[The Collection Interface](http://docs.oracle.com/javase/tutorial/collections/interfaces/collection.html)

<!--
	A Collection represents a group of objects known as its elements. The Collection interface is used to pass around collections of objects where maximum generality is desired.
	For example, by convention all general-purpose collection implementations have a constructor that takes a Collection argument.
	This constructor, known as a conversion constructor, initializes the new collection to contain all of the elements in the specified collection, whatever the given collection's subinterface or implementation type.
	In other words, it allows you to convert the collection's type.
-->
一个 [Collection][] 用于表示一组被称之为它的元素的对象。
`Collection` 接口主要用于对象集合的传递，它可以提供最大的概括性。比如，从惯例上讲所有普适的集合实现都应该包含一个以一个 `Collection` 为参数的构造器。
这个构造器，或称为转换构造器，使用给定集合中的所有元素来初始化新的集合，这个过程不考虑给定集合所属的子接口或者它的具体实现。
也就是说，它允许你转换集合的类型。

<!--
	Suppose, for example, that you have a Collection<String> c, which may be a List, a Set, or another kind of Collection.
	This idiom creates a new ArrayList (an implementation of the List interface), initially containing all the elements in c.
-->
比如，假设你有一个 `Collectio<String> c`，它可能是一个 `List`、一个 `Set` 或者是任何其他 `Collection`。
下面的代码即可创建一个新的 `ArrayList`（`List` 接口的一个实现类），其中包含 `c` 的所有元素：

<pre class="brush: java">
List&lt;String&gt; list = new ArrayList&lt;String&gt;(c);
</pre>

<!--
	Or — if you are using JDK 7 or later — you can use the diamond operator:
-->
或者，如果你使用的是 JDK7 或者更新的版本，你可以使用菱形运算符：

<pre class="brush: java">
List&lt;String&gt; list = new ArrayList&lt;&gt;(c);
</pre>

<!--
	The Collection interface contains methods that perform basic operations, such as int size(), boolean isEmpty(),
	boolean contains(Object element), boolean add(E element), boolean remove(Object element), and Iterator<E> iterator().
-->
`Collection` 接口包含了可用于执行基本操作的方法，比如 `int size()`、`boolean isEmpty()`、
`boolean contains(Object element)`、`boolean add(E element)`、`boolean remove(Object element)`
和 `Iterator<E> iterator()`。

<!--
	It also contains methods that operate on entire collections, such as boolean containsAll(Collection<&#63;> c),
	boolean addAll(Collection<&#63; extends E> c), boolean removeAll(Collection<&#63;> c), boolean retainAll(Collection<&#63;> c), and void clear().
-->
同时它也包含了可用于操作整个集合的方法，比如 `boolean containsAll(Collection<?> c)`、`boolean addAll(Collection<? extends E> c)`、
`boolean removeAll(Collection<?> c)`、`boolean retainAll(Collection<?> c)` 和 `void clear()`。

<!--
	Additional methods for array operations (such as Object[] toArray() and <T> T[] toArray(T[] a) exist as well.
-->
`Collection` 还包含了供数组操作的方法，如 `Object[] toArray()` 和 `<T> T[] toArray(T[] a)`。

<!--
	In JDK 8 and later, the Collection interface also exposes methods Stream<E> stream() and Stream<E> parallelStream(),
	for obtaining sequential or parallel streams from the underlying collection.
	(See the lesson entitled Aggregate Operations for more information about using streams.)
-->
如果你使用的是 JDK8 或者更新的版本，`Collection` 接口还提供了 `Stream <E> stream()` 和 `Stream<E> parallelStream()` 方法，
用于获取集合实现类的顺序或并行流。详见[聚合操作](#stream)一章。


<!--
	The Collection interface does about what you'd expect given that a Collection represents a group of objects.
	It has methods that tell you how many elements are in the collection (size, isEmpty), methods that check whether a given object is in the collection (contains),
	methods that add and remove an element from the collection (add, remove), and methods that provide an iterator over the collection (iterator).
-->
`Collection` 接口提供了所有你能期望的一个对象集合所能提供的功能。它有可以告诉你它包含多少个元素的方法（`size`、`isEmpty`）、
检查某个给定对象是否包含在集合中的方法（`contains`）、从集合中增加或删除的方法（`add`、`remove`）还有提供集合迭代器的方法（`iterator`）。


<!--
	The add method is defined generally enough so that it makes sense for collections that allow duplicates as well as those that don't.
	It guarantees that the Collection will contain the specified element after the call completes, and returns true if the Collection changes as a result of the call.
	Similarly, the remove method is designed to remove a single instance of the specified element from the Collection, assuming that it contains the element to start with,
	and to return true if the Collection was modified as a result.
-->
`Collection` 的 `add` 方法定义得十分普适，使得它对于是否支持重复元素的集合都十分合情合理。它保证 `Collection` 在方法执行完毕后必然包含给定的元素，
并在 `Collection` 因此次操作发生改变时返回 `true`。同样，`remove` 方法用于从 `Collection` 中移除一个给定的元素实例，
在执行前便假设集合中存在该元素，并在 `Collection `因此次操作发生改变时返回 `true`。

<h4 id="traversing-collections">2.1.1 遍历集合</h4>

<!--
	There are three ways to traverse collections: (1) using aggregate operations (2) with the for-each construct and (3) by using Iterators.
-->
总体而言，遍历集合有三种方法：使用聚合运算、使用 `for-each` 语句、使用 `Iterator`。

##### 聚合运算

<!--
	In JDK 8 and later, the preferred method of iterating over a collection is to obtain a stream and perform aggregate operations on it.
	Aggregate operations are often used in conjunction with lambda expressions to make programming more expressive, using less lines of code.
	The following code sequentially iterates through a collection of shapes and prints out the red objects:
-->
在 JDK8 及更新的版本中，遍历一个集合最好的方式是获取一个流（stream）并对其使用聚合操作。聚合操作通常与 Lambda 表达式相结合，让你可以在更短的代码中表达更多的功能。
下述代码遍历了一个几何体的集合并输出其中是红色的几何体的名字：

<pre class="brush: java">
myShapesCollection.stream()
    .filter(e -> e.getColor() == Color.RED)
    .forEach(e -> System.out.println(e.getName()));
</pre>

<!--
	Likewise, you could easily request a parallel stream, which might make sense if the collection is large enough and your computer has enough cores:
-->
同样，你也可以很方便地获取一个并行流，如果你的集合足够大、计算机核心足够多，使用它可能会是更好的选择：

<pre class="brush: java">
myShapesCollection.parallelStream()
	.filter(e -> e.getColor() == Color.RED)
	.forEach(e -> System.out.println(e.getName()));
</pre>

<!--
	There are many different ways to collect data with this API. For example, you might want to convert the elements of a Collection to String objects,
	then join them, separated by commas:
-->
这套 API 有很多不同的方式来让你收集数据。比如，你可能想要把一个`Collection`中的元素转换为`String`对象并把它们连接起来，以逗号分隔：

<pre class="brush: java">
 String joined = elements.stream()
    .map(Object::toString)
    .collect(Collectors.joining(", "));
</pre>

<!--
	Or perhaps sum the salaries of all employees:
-->
或者把员工们的薪水加起来求个总和：

<pre class="brush: java">
int total = employees.stream()
	.collect(Collectors.summingInt(Employee::getSalary)));
</pre>

<!--
	These are but a few examples of what you can do with streams and aggregate operations. For more information and examples, see the lesson entitled Aggregate Operations.
-->
上述只是一小部分流和聚合操作的例子，详见[聚合操作](#stream)一章。

<!--
	The Collections framework has always provided a number of so-called "bulk operations" as part of its API. These include methods that operate on entire collections,
	such as containsAll, addAll, removeAll, etc. Do not confuse those methods with the aggregate operations that were introduced in JDK 8.
	The key difference between the new aggregate operations and the existing bulk operations (containsAll, addAll, etc.) is that the old versions are all mutative,
	meaning that they all modify the underlying collection. In contrast, the new aggregate operations do not modify the underlying collection.
	When using the new aggregate operations and lambda expressions, you must take care to avoid mutation so as not to introduce problems in the future,
	should your code be run later from a parallel stream.
-->
Java 集合框架一直都将“批量操作”（bulk operation）API 作为其一部分。这些 API 包括那些可与对整个集合进行操作的方法，比如 `containsAll`、`addAll`、
`removeAll` 等。希望你不至于把它们和 JDK8 新引入的聚合操作弄混了。关键在于旧的批量操作方法（`containsAll`、`addAll`等）都是变化的（mutative），
它们会使得被作用的集合发生变化，而新的聚合操作不会修改被作用的集合。在使用新的聚合操作和 Lambda 表达式时，你应该注意不要引起集合本身的变化，
否则当你的代码在未来被用于处理并行流时可能会产生新的问题。

##### for-each 语句

<!--
	The for-each construct allows you to concisely traverse a collection or array using a for loop — see The for Statement.
	The following code uses the for-each construct to print out each element of a collection on a separate line.
-->
`for-each` 语句可以让你使用一个简洁的 `for` 循环来遍历集合或数组，详见<a href="http://docs.oracle.com/javase/tutorial/java/nutsandbolts/for.html"> for 语句</a>一章。
下述代码使用 `for-each` 语句来将一个集合中的每个元素输出到了独立的行中：

<pre class="brush: java">
for (Object o : collection)
    System.out.println(o);
</pre>

##### 迭代器

<!--
	An Iterator is an object that enables you to traverse through a collection and to remove elements from the collection selectively, if desired.
	You get an Iterator for a collection by calling its iterator method. The following is the Iterator interface.
-->
一个 [Iterator][]（迭代器）可以让你遍历或是删除集合中的元素。
通过调用集合的 `iterator` 方法即可获取它的 `Iterator` 对象。下述代码即为 `Iterator` 接口：

<pre class="brush: java">
public interface Iterator&lt;E&gt; {
    boolean hasNext();
    E next();
    void remove(); // 可选
}
</pre>

<!--
	The hasNext method returns true if the iteration has more elements, and the next method returns the next element in the iteration.
	The remove method removes the last element that was returned by next from the underlying Collection.
	The remove method may be called only once per call to next and throws an exception if this rule is violated.
-->
当此次迭代还有剩余的元素时，`hasNext` 方法返回 `true`，且 `next` 方法将返回此次迭代的下一个元素。
`remove` 方法将从底层的 `Collection` 中移除 `next` 方法上一次返回的元素。
在每次调用 `next` 方法后只能调用一次 `remove` 方法，否则 `Iterator` 将抛出一个错误。


<!--
	Note that Iterator.remove is the only safe way to modify a collection during iteration; the behavior is unspecified if the underlying collection is modified
	in any other way while the iteration is in progress.
-->
注意，`Iterator.remove` 方法是在迭代时修改集合的唯一安全的方法，在迭代时通过任何其他方式修改底层的集合将会产生不可知的结果。



<!--
	Use Iterator instead of the for-each construct when you need to:
-->
在你要做下面的事情的时候，你需要使用 `Iterator` 而不是 `for-each` 语句：

-	<!--
		Remove the current element. The for-each construct hides the iterator, so you cannot call remove. Therefore, the for-each construct is not usable for filtering.
	-->
	移除当前元素。`for-each` 语句隐藏了它所使用的迭代器，所以你无法调用 `remove` 方法。因此 `for-each` 语句无法被用于过滤元素（filtering）。

-	<!--
		Iterate over multiple collections in parallel.
	-->
	并行地迭代多个集合。

<!--
	The following method shows you how to use an Iterator to filter an arbitrary Collection — that is, traverse the collection removing specific elements.
-->
下述代码展示了如何使用 `Iterator` 来过滤任意 `Collection` 的元素，即遍历该集合并把特定的元素移除。

<pre class="brush: java">
static void filter(Collection&lt;?&gt; c) {
    for (Iterator&lt;?&gt; it = c.iterator(); it.hasNext(); )
        if (!cond(it.next()))
            it.remove();
}
</pre>

<!--
	This simple piece of code is polymorphic, which means that it works for any Collection regardless of implementation.
	This example demonstrates how easy it is to write a polymorphic algorithm using the Java Collections Framework.
-->
这一小段代码是多态的，它可以被用于任何 `Collection` 而不必考虑具体的实现。
这段代码同样展示了使用 Java 集合框架编写多态的算法是多么方便。

<h3 id="collection-interface-bulk-operations">2.1.2 Collection 接口批量操作</h3>

<!--
	Bulk operations perform an operation on an entire Collection. You could implement these shorthand operations using the basic operations,
	though in most cases such implementations would be less efficient. The following are the bulk operations:
-->
批量操作用于对整个集合进行操作。你可以用基本的集合操作来实现这些用于速记的批量操作，尽管在大多数情况下这样的实现都是低效的。
下述方法均是批量操作：

-	<!--
		containsAll — returns true if the target Collection contains all of the elements in the specified Collection.
	-->
	`containsAll`：如果被调用的 `Collection` 包含给定 `Collection` 中的所有元素则返回 `true`。

-	<!--
		addAll — adds all of the elements in the specified Collection to the target Collection.
	-->
	`addAll`：将给定 `Collection` 中的所有元素放入到被调用的 `Collection` 中。

-	<!--
		removeAll — removes from the target Collection all of its elements that are also contained in the specified Collection.
	-->
	`removeAll`：从被调用的 `Collection` 中移除所有同样属于给定 `Collection` 的元素。

-	<!--
		retainAll — removes from the target Collection all its elements that are not also contained in the specified Collection.
		That is, it retains only those elements in the target Collection that are also contained in the specified Collection.
	-->
	`retainAll`：从被调用的 `Collection` 中移除所有不属于给定 `Collection` 的元素。
	也即是说，该方法执行完毕后，被调用的 `Collection` 只会保留那些同样属于给定 `Collection` 的元素。

-	<!--
		clear — removes all elements from the Collection.
	-->
	`clear`：从 `Collection` 中移除所有元素。

<!--
	The addAll, removeAll, and retainAll methods all return true if the target Collection was modified in the process of executing the operation.
-->
其中，`addAll`、`removeAll`、`retainAll` 方法均在被调用 `Collection` 发生改变时返回 `true`。

<!--
	As a simple example of the power of bulk operations, consider the following idiom to remove all instances of a specified element, e, from a Collection, c.
-->
为了展示批量操作的威力，我们不妨考虑下述常用写法，用以从 `Collection c` 中移除所有元素 `e` 的实例：

<pre class="brush: java">
c.removeAll(Collections.singleton(e));
</pre>

<!--
	More specifically, suppose you want to remove all of the null elements from a Collection.
-->
或者，考虑你想要从一个 `Collection` 中移除所有 `null` 元素：

<pre class="brush: java">
c.removeAll(Collections.singleton(null));
</pre>

<!--
	This idiom uses Collections.singleton, which is a static factory method that returns an immutable Set containing only the specified element.
-->
上述写法中使用了静态工厂方法 `Collections.singleton`，它返回一个只包含给定元素的不可变 `Set`。

<h3 id="collection-interface-array-operations">2.1.3 Collection 接口数组操作</h3>

<!--
	The toArray methods are provided as a bridge between collections and older APIs that expect arrays on input.
	The array operations allow the contents of a Collection to be translated into an array. The simple form with no arguments creates a new array of Object. 
	The more complex form allows the caller to provide an array or to choose the runtime type of the output array.
-->
`Collection` 的 `toArray` 方法是集合和使用数组作为输入的旧 API 之间的桥梁。数组操作使得一个 `Collection` 的内容物可以被转化为一个数组。
无参数的 `toArray` 方法将返回一个 `Object` 数组。而另一个更复杂的 `toArray` 方法允许调用者提供一个数组并选择结果数组的运行时类型。


<!--
	For example, suppose that c is a Collection. The following snippet dumps the contents of c into a newly allocated array of Object
	whose length is identical to the number of elements in c.
-->
比如，我们假设 `c` 是一个 `Collection`。下述代码会将 `c` 的所有内容物放入到一个新创建的 `Object` 数组中，
数组的长度和 `c` 中的元素数量相同。

<pre class="brush: java">
Object[] a = c.toArray();
</pre>

<!--
	Suppose that c is known to contain only strings (perhaps because c is of type Collection<String>).
	The following snippet dumps the contents of c into a newly allocated array of String whose length is identical to the number of elements in c.
-->
假设我们知道 `c` 中只包含字符串（也许是因为 `c` 的类型是 `Collection<String>`）。
下述代码会将 `c` 的所有内容物放入到一个新创建的 `String` 数组中，数组的长度和 `c` 中的元素数量相同。

<pre class="brush: java">
Object[] a = c.toArray(new String[0]);
</pre>

<h3 id="set">2.2 Set 接口</h3>

原文链接：[The Set Interface](http://docs.oracle.com/javase/tutorial/collections/interfaces/set.html)

<!--
	A Set is a Collection that cannot contain duplicate elements. It models the mathematical set abstraction.
	The Set interface contains only methods inherited from Collection and adds the restriction that duplicate elements are prohibited.
	Set also adds a stronger contract on the behavior of the equals and hashCode operations, allowing Set instances to be compared meaningfully
	even if their implementation types differ. Two Set instances are equal if they contain the same elements.
-->
[Set][] 是一种不包含重复元素的 `Collection`，它模拟的是数学上的集的抽象。
`Set` 接口只包含了继承自 `Collection` 的方法和对重复元素的限制。`Set` 接口还对 `equals` 和 `hashCode` 操作的行为进行了更严格定义，
使得即使是不同实现的 `Set` 实例也能进行有意义的比较。两个 `Set` 实例包含相同的元素，那么我们说它们是相等的（equal）。

<!--
	The Java platform contains three general-purpose Set implementations: HashSet, TreeSet, and LinkedHashSet.
	HashSet, which stores its elements in a hash table, is the best-performing implementation; however it makes no guarantees concerning the order of iteration.
	TreeSet, which stores its elements in a red-black tree, orders its elements based on their values; it is substantially slower than HashSet.
	LinkedHashSet, which is implemented as a hash table with a linked list running through it, orders its elements based on the order in which they were inserted into the set (insertion-order).
	LinkedHashSet spares its clients from the unspecified, generally chaotic ordering provided by HashSet at a cost that is only slightly higher.
-->
Java 提供了三种普适的 `Set` 实现：`HashSet`、`TreeSet`和`LinkedHashSet`。
[HashSet][] 作为最高效的 `Set` 实现，将元素存储在一张哈希表中。然而在遍历其元素时，它无法给出确定的元素遍历顺序。
[TreeSet][] 则通过将元素存储在一棵红黑树中，使得元素之间基于其值有序。但在性能上，`TreeSet` 比 `HashSet` 慢得多。
[LinkedHashSet][] 则是被实现为一张特殊的哈希表，该表维护着一个联系所有元素的链表，
而该链表维持着元素们插入的顺序。`LinkedHashSet` 使得用户不再需要面对 `HashSet` 那种不确定的遍历顺序，而且它只比 `HashSet` 慢一点。


<!--
	Here's a simple but useful Set idiom. Suppose you have a Collection, c, and you want to create another Collection containing the same elements
	but with all duplicates eliminated. The following one-liner does the trick.
-->
下述代码即为 `Set` 的其中一种常用语法。假设你有一个 `Collection c`，你想要创建一个新的 `Collection` 包含 `c` 中的所有元素，但移除所有重复的元素：

<pre class="brush: java">
Collection&lt;Type&gt; noDups = new HashSet&lt;Type&gt;(c);
</pre>

<!--
	It works by creating a Set (which, by definition, cannot contain duplicates), initially containing all the elements in c.
	It uses the standard conversion constructor described in the The Collection Interface section.
-->
上述代码创建了一个包含 `c` 中所有元素的 `Set`（在定义上不包含重复的元素）。
上述代码还使用了我们在 <a href="#collection" target="_self">Collection 接口</a>一节中提到的转换构造器。

<!--
	Or, if using JDK 8 or later, you could easily collect into a Set using aggregate operations:
-->
或者，如果你使用的是 JDK8 或更新的版本，你还可以轻易地使用聚合操作把元素收集到一个 `Set` 中：

<pre class="brush: java">
c.stream().collect(Collectors.toSet());
</pre>

<!--
	Here's a slightly longer example that accumulates a Collection of names into a TreeSet:
-->
下面的例子把一个 `Collection` 里的名称放入到了一个 `TreeSet` 中：

<pre class="brush: java">
Set&lt;String&gt; set = people.stream()
	.map(Person::getName)
	.collect(Collectors.toCollection(TreeSet::new));
</pre>

<!--
	And the following is a minor variant of the first idiom that preserves the order of the original collection while removing duplicate elements:
-->
下面则是第一个例子的小变形，保留了元素在原本的集合中的顺序并移除了重复的元素：

<pre class="brush: java">
Collection&lt;Type&gt; noDups = new LinkedHashSet&lt;Type&gtl;(c);
</pre>

<!--
	The following is a generic method that encapsulates the preceding idiom, returning a Set of the same generic type as the one passed.
-->
下面的泛型方法是对上面的例子的封装，它返回一个和传入 `Collection` 有着相同泛型参数的 `Set`。

<pre class="brush: java">
public static &lt;E&gt; Set&lt;E&gt; removeDups(Collection&lt;E&gt; c) {
    return new LinkedHashSet&lt;E&gt;(c);
}
</pre>

<h4 id="set-interface-basic-operations">2.2.1 Set 接口基本操作</h4>

<!--
	The size operation returns the number of elements in the Set (its cardinality). The isEmpty method does exactly what you think it would.
	The add method adds the specified element to the Set if it is not already present and returns a boolean indicating whether the element was added.
	Similarly, the remove method removes the specified element from the Set if it is present and returns a boolean indicating whether the element was present.
	The iterator method returns an Iterator over the Set.
-->
`size` 方法返回 `Set` 中元素的个数，即集的势（cardinality）。`isEmpty` 方法做的事情和你能猜到的它应该做的事完全一样（译者注：返回当前集是否为空）。
`add` 方法将给定的元素放入到 `Set` 中，并返回一个指示是否真的有放入该元素的布尔值。
类似地，`remove` 方法将给定的元素从 `Set` 中移除，并返回一个指示是否真的有移除该元素的布尔值。
`iterator` 方法返回一个迭代整个 `Set` 的 `Iterator`。

<!--
	The following program prints out all distinct words in its argument list. Two versions of this program are provided.
	The first uses JDK 8 aggregate operations. The second uses the for-each construct.
-->
下面的<a href="http://docs.oracle.com/javase/tutorial/collections/interfaces/examples/FindDups.java">程序</a>将会打印出参数列表中每个不同的单词。
这里我们提供了两种不同的实现，其中第一种使用了 JDK8 的聚合操作，而第二种使用了 `for-each` 语句。

<!--
	Using JDK 8 Aggregate Operations:
-->
使用 JDK8 聚合操作：

<pre class="brush: java">
import java.util.*;
import java.util.stream.*;

public class FindDups {
    public static void main(String[] args) {
        Set&lt;String&gt; distinctWords = Arrays.asList(args)
        										.stream()
												.collect(Collectors.toSet()); 
        System.out.println(distinctWords.size() + " distinct words: " + distinctWords);
    }
}
</pre>

<!--
	Using the for-each Construct:
-->
使用`for-each`结构：

<pre class="brush: java">
import java.util.*;

public class FindDups {
    public static void main(String[] args) {
        Set&lt;String&gt; s = new HashSet&lt;String&gt;();
        for (String a : args)
        	s.add(a);
        System.out.println(s.size() + " distinct words: " + s);
    }
}
</pre>

<!--
	Now run either version of the program.
-->
现在我们运行上述任意一个版本的程序：

<pre class="brush: bash">
java FindDups i came i saw i left
</pre>

<!--
	The following output is produced:
-->
程序将给出以下输出：

<pre>
4 distinct words: [left, came, saw, i]
</pre>

<!--
	Note that the code always refers to the Collection by its interface type (Set) rather than by its implementation type.
	This is a strongly recommended programming practice because it gives you the flexibility to change implementations merely by changing the constructor.
	If either of the variables used to store a collection or the parameters used to pass it around are declared to be of the Collection's implementation type
	rather than its interface type, all such variables and parameters must be changed in order to change its implementation type.
-->
注意，上述代码所使用的对 `Collection` 对象的引用的类型都是其所属的接口类型（`Set`）而不是其具体的实现类型。
这是一种很好的编程风格，这样做的话当你需要改变集合的具体实现时，你只需要改一下你调用的构造器就可以了。
如果用于保存一个集合的变量或者是一个代表传入方法的集合的参数的类型被设定为了具体的 `Collection` 实现类型而不是其所属的接口类型，
当你需要修改具体的实现类时，所有的这些变量和参数的类型都需要一起改变。

<!--
	Furthermore, there's no guarantee that the resulting program will work. If the program uses any nonstandard operations present in the original implementation type
	but not in the new one, the program will fail. Referring to collections only by their interface prevents you from using any nonstandard operations.
-->
除此之外，这么做并不保证你写出来的程序就一定能正常工作。如果你的程序使用了某些实现类型提供而接口类型并没有提供的非标准操作，你的程序将无法运行。
只使用接口类型来引用集合也可以防止你使用任何非标准的操作。

<!--
	The implementation type of the Set in the preceding example is HashSet, which makes no guarantees as to the order of the elements in the Set.
	If you want the program to print the word list in alphabetical order, merely change the Set's implementation type from HashSet to TreeSet.
	Making this trivial one-line change causes the command line in the previous example to generate the following output.
-->
上述代码中所使用的 `Set` 的实现类是 `HashSet`，而 `HashSet` 并不会保证集中元素的迭代顺序。
如果你想要程序按字典序输出这些单词，你只需要把 `Set` 实现类从 `HashSet` 改成 `TreeSet` 就可以了。
在你进行了这项修改后，上述案例中的命令行将产生如下输出：

<pre class="brush: bash">
java FindDups i came i saw i left
</pre>

<pre>
4 distinct words: [came, i, left, saw]
</pre>

<h4 id="set-interface-bulk-operations">2.2.2 Set 接口批量操作</h4>

<!--
	Bulk operations are particularly well suited to Sets; when applied, they perform standard set-algebraic operations.
	Suppose s1 and s2 are sets. Here's what bulk operations do:
-->
实际上，批量操作特别适合 `Set`：当调用时，它们执行的是标准的集合代数运算。
我们假设有集 `s1` 和 `s2` 。下述列表描述了批量操作们的行为：

-	<!--
		s1.containsAll(s2) — returns true if s2 is a subset of s1. (s2 is a subset of s1 if set s1 contains all of the elements in s2.)
	-->
	`s1.containsAll(s2)`：当 `s2` 是 `s1` 的**子集**时返回 `true`。（若集 `s1` 包含 `s2` 的所有元素，我们说 `s2` 是 `s1` 的一个子集。译者注：$A \subseteq B = \forall x : x \in A \to x \in B$）
-	<!--
		s1.addAll(s2) — transforms s1 into the union of s1 and s2. (The union of two sets is the set containing all of the elements contained in either set.)
	-->
	`s1.addAdd(s2)`：将 `s1` 变为 `s1` 和 `s2` 的**并集**。（两个集的并集包含两个集的所有元素。译者注：$A \cup B = \{x : x \in A \vee x \in B\}$）
-	<!--
		s1.retainAll(s2) — transforms s1 into the intersection of s1 and s2. (The intersection of two sets is the set containing only the elements common to both sets.)
	-->
	`s1.retainAll(s2)`：将 `s1` 变为 `s1` 和 `s2` 的**交集**。（两个集的交集只包含同时属于两个集的元素。译者注：$A \cap B = \{x : x \in A \wedge x \in B\}$）
-	<!--
		s1.removeAll(s2) — transforms s1 into the (asymmetric) set difference of s1 and s2.
		(For example, the set difference of s1 minus s2 is the set containing all of the elements found in s1 but not in s2.)
	-->
	`s1.removeAll(s2)`：将 `s1` 变为 `s1` 和 `s2` 的（非对称）**差集**。（比如，`s1 - s2` 产生的差集包含那些属于 `s1` 但不属于 `s2` 的元素。译者注：$A - B = \{x : x \in A \wedge x \not\in B\}$）。

<!--
	To calculate the union, intersection, or set difference of two sets nondestructively (without modifying either set),
	the caller must copy one set before calling the appropriate bulk operation. The following are the resulting idioms.
-->
如果想在不修改两个集的情况下计算它们的并集、交集或差集，调用者需要在调用相应的批量操作之前先对其中一个集进行复制。
下述代码给出了这样做的常用写法：

<pre class="brush: java">
Set&lt;Type&gt; union = new HashSet&lt;Type&gt;(s1);
union.addAll(s2);

Set&lt;Type&gt; intersection = new HashSet&lt;Type&gt;(s1);
intersection.retainAll(s2);

Set&lt;Type&gt; difference = new HashSet&lt;Type&gt;(s1);
difference.removeAll(s2);
</pre>

<!--
	The implementation type of the result Set in the preceding idioms is HashSet, which is, as already mentioned,
	the best all-around Set implementation in the Java platform. However, any general-purpose Set implementation could be substituted.
-->
上面的代码中所使用的 `Set` 实现类是 `HashSet`，而正如之前所提，它是 Java 提供的最好的普适 `Set` 实现类。
不过，将其替换为任何普适的 `Set` 实现类都是可以的。

<!--
	Let's revisit the FindDups program. Suppose you want to know which words in the argument list occur only once and which occur more than once,
	but you do not want any duplicates printed out repeatedly. This effect can be achieved by generating two sets — one containing every word in the argument list
	and the other containing only the duplicates. The words that occur only once are the set difference of these two sets, which we know how to compute.
	Here's how the resulting program looks.
-->
我们重新考虑刚才的 `FindDups` 程序。假设现在你想要知道参数列表中哪些单词只出现了一次，而哪些单词出现的次数又超过一次，但你也不想让这些重复的单词被重复输出。
我们可以通过创建两个集来完成这样的功能，一个保存参数列表中的所有单词，而另一个则保存那些重复过的单词。这样一来，只出现过一次的单词将组成这两个集的差集，
而我们也知道该怎么计算两个集的差集了。如此一来，这个程序应该会变成<a href="http://docs.oracle.com/javase/tutorial/collections/interfaces/examples/FindDups2.java">这个样子</a>：

<pre class="brush: java">
import java.util.*;

public class FindDups2 {
    public static void main(String[] args) {
        Set&lt;String&gt; uniques = new HashSet&lt;String&gt;();
        Set&lt;String&gt; dups    = new HashSet&lt;String&gt;();

        for (String a : args)
            if (!uniques.add(a))
                dups.add(a);

        // Destructive set-difference
        uniques.removeAll(dups);

        System.out.println("Unique words:    " + uniques);
        System.out.println("Duplicate words: " + dups);
    }
}
</pre>

<!--
	When run with the same argument list used earlier (i came i saw i left), the program yields the following output.
-->
我们继续使用之前的参数列表（`i came i saw i left`），这次程序的输出应该会是这个样子：

<pre>
Unique words:    [left, saw, came]
Duplicate words: [i]
</pre>

<!--
	A less common set-algebraic operation is the symmetric set difference — the set of elements contained in either of two specified sets but not in both.
	The following code calculates the symmetric set difference of two sets nondestructively.
-->
还有一个不那么常用的集合代数运算 —— 对称差集，只存在于其中一个集合的元素的集合。（译者注：$A \bigtriangleup B = \{ x : (x \in A) \oplus (x \in B) \}$）
下述代码可以在不修改两个集的情况下计算两个集的对称差集：

<pre class="brush: java">
Set&lt;Type&gt; symmetricDiff = new HashSet&lt;Type&gt;(s1);
symmetricDiff.addAll(s2);
Set&lt;Type&gt; tmp = new HashSet&lt;Type&gt;(s1);
tmp.retainAll(s2);
symmetricDiff.removeAll(tmp);
</pre>

<h4 id="set-interface-array-operations">2.2.3 Set 接口数组操作</h4>

<!--
	The array operations don't do anything special for Sets beyond what they do for any other Collection.
	These operations are described in The Collection Interface section.
-->
比起 `Collection`，`Set` 提供的数组操作并无任何特别之处。
关于这些操作的详细描述可以参考 <a href="#collection-interface-array-operations" target="_self">Collection 接口</a>一节。

<h3 id="list">2.3 List 接口</h3>

原文链接：[The List Interface](http://docs.oracle.com/javase/tutorial/collections/interfaces/list.html)

<!--
	A List is an ordered Collection (sometimes called a sequence). Lists may contain duplicate elements. In addition to the operations inherited from Collection, the List interface includes operations for the following:
-->
[List][]（表）是一种有序的 `Collection`，有时又被称为**序列**（sequence） 。表可以包含重复的元素。除了继承自 `Collection` 的操作，`List` 接口还包含以下操作：

-	<!--
		Positional access — manipulates elements based on their numerical position in the list. This includes methods such as get, set, add, addAll, and remove.
	-->
	**基于位置的访问**：基于元素的在表中的枚举位置对元素进行操作。这样的方法包括 `get`、`set`、`addAll` 和 `remove`。
-	<!--
		Search — searches for a specified object in the list and returns its numerical position. Search methods include indexOf and lastIndexOf.
	-->
	**查找**：在表中查找某个给定的元素并返回其枚举位置。查找方法包括 `indexOf` 和 `lastIndexOf`。
-	<!--
		Iteration — extends Iterator semantics to take advantage of the list's sequential nature. The listIterator methods provide this behavior.
	-->
	**迭代**：`List` 扩展了 `Iterator` 的定义以利用列表有序的本质。`listIterator` 方法提供了这样的功能。
-	<!--
		Range-view — The sublist method performs arbitrary range operations on the list.
	-->
	**范围视图**：`sublist` 方法可对列表进行任意的范围操作。

<!--
	The Java platform contains two general-purpose List implementations. ArrayList, which is usually the better-performing implementation, and LinkedList which offers better performance under certain circumstances.
-->
Java 提供了两种普适的`List`实现类：[ArrayList][] 在多数情况下有着更好的性能，而 [LinkedList][] 则在少数特定情况下取胜。

<h4 id="list-collection-operations">2.3.1 集合操作</h4>

<!--
	The operations inherited from Collection all do about what you'd expect them to do, assuming you're already familiar with them. If you're not familiar with them from Collection, now would be a good time to read The Collection Interface section. The remove operation always removes the first occurrence of the specified element from the list. The add and addAll operations always append the new element(s) to the end of the list. Thus, the following idiom concatenates one list to another.
-->
`List` 接口继承自 `Collection` 的操作的行为和你所设想的完全一样，如果你已经很熟悉它们的话。如果你确实不熟悉这些来自 `Collection` 的方法，
我们建议你现在去看一下 <a href="#collection">Collection 接口</a>一节。`remove` 方法会把表中第一次出现的给定元素移除，
而 `add` 和 `addAll` 方法则会把新的元素放到表的末端。因此，如下代码可将一个表拼接到另一个表的尾部：

<pre class="brush: java">
list1.addAll(list2);
</pre>

<!--
	Here's a nondestructive form of this idiom, which produces a third List consisting of the second list appended to the first.
-->
如下代码则非破坏性地创建出了一个新的 `List`，由原有的两个 `List` 首尾拼接而成：

<pre class="brush: java">
List&lt;Type> list3 = new ArrayList&lt;Type>(list1);
list3.addAll(list2);
</pre>

<!--
	Note that the idiom, in its nondestructive form, takes advantage of ArrayList's standard conversion constructor.
-->
注意，上述代码中使用了 `ArrayList` 提供的标准转换构造器。

<!--
	And here's an example (JDK 8 and later) that aggregates some names into a List:
-->
对于 JDK8 或更新的版本，可以使用如下代码将人的姓名收集到一个 `List` 中：

<pre class="brush: java">
List&lt;String> list = people.stream()
	.map(Person::getName)
	.collect(Collectors.toList());
</pre>

<!--
	Like the Set interface, List strengthens the requirements on the equals and hashCode methods so that two List objects can be compared for logical equality without regard to their implementation classes. Two List objects are equal if they contain the same elements in the same order.
-->
正如 `Set` 接口，`List` 也加强了对 `equals` 和 `hashCode` 方法的定义，以在不考虑实现类的情况下两个 `List` 对象能够相互比较。
如果两个 `List` 对象以相同的顺序包含相同的元素，我们说它们是相等（equal）的。

<h4 id="positional-access-and-search-operations">2.3.2 基于位置访问与查找操作</h4>

<!--
	The basic positional access operations are get, set, add and remove. (The set and remove operations return the old value that is being overwritten or removed.) Other operations (indexOf and lastIndexOf) return the first or last index of the specified element in the list.
-->
基本的基于位置访问的操作包括 `get`、`set`、`add` 和 `remove`，其中 `set` 和 `remove` 操作将返回被覆盖或移除的旧元素。
`indexOf` 和 `lastIndexOf` 操作则分别返回给定元素在表中第一次和最后一次出现的位置。

<!--
	The addAll operation inserts all the elements of the specified Collection starting at the specified position. The elements are inserted in the order they are returned by the specified Collection's iterator. This call is the positional access analog of Collection's addAll operation.
-->
`addAll` 操作在给定的位置插入给定 `Collection` 的所有元素。这些元素将按照给定 `Collection` 的迭代器返回的顺序被插入。
该方法在 `Collection` 的 `addAll` 基础上加入了基于位置访问的特性。

<!--
	Here's a little method to swap two indexed values in a List.
-->
如下示例互换了 `List` 中两个元素的位置：

<pre class="brush: java">
public static &lt;E> void swap(List&lt;E> a, int i, int j) {
    E tmp = a.get(i);
    a.set(i, a.get(j));
    a.set(j, tmp);
}
</pre>

---

<h3 id="queue">2.4 Queue 接口</h3>

原文链接：[The Queue Interface](http://docs.oracle.com/javase/tutorial/collections/interfaces/queue.html)

<!--
	A Queue is a collection for holding elements prior to processing. Besides basic Collection operations, queues provide additional insertion, removal, and inspection operations. The Queue interface follows.
-->
[Queue][]（队列）是一种用于在进行处理前暂存元素的集合。除了最基本的 `Collection` 操作，队列还提供了额外的增、删、查操作。`Queue` 接口如下所示：

<pre class="brush: java">
public interface Queue&lt;E> extends Collection&lt;E> {
    E element();
    boolean offer(E e);
    E peek();
    E poll();
    E remove();
}
</pre>

<!--
	Each Queue method exists in two forms: (1) one throws an exception if the operation fails, and (2) the other returns a special value if the operation fails (either null or false, depending on the operation). The regular structure of the interface is illustrated in the following table.
-->
每种 `Queue` 方法均存在两种不同的形式：一种在操作失败时抛出错误，而另一种则通过返回特定的值来提示操作失败（可能返回 `null` 或 `false`）。
下表展示了该接口的基本结构：

<table class="table">
	<caption align="top"><b><code>Queue</code> 接口结构</b></caption>
	<tr>
		<th>操作类型</th>
		<th>抛出错误</th>
		<th>返回特殊值</th>
	</tr>
	<tr>
		<td>插入元素</td>
		<td><code>add(e)</code></td>
		<td><code>offer(e)</code></td>
	</tr>
	<tr>
		<td>删除元素</td>
		<td><code>remove()</code></td>
		<td><code>poll()</code></td>
	</tr>
	<tr>
		<td>查看元素</td>
		<td><code>element()</code></td>
		<td><code>peek()</code></td>
	</tr>
</table>

<!--
	Queues typically, but not necessarily, order elements in a FIFO (first-in-first-out) manner. Among the exceptions are priority queues, which order elements according to their values — see the Object Ordering section for details). Whatever ordering is used, the head of the queue is the element that would be removed by a call to remove or poll. In a FIFO queue, all new elements are inserted at the tail of the queue. Other kinds of queues may use different placement rules. Every Queue implementation must specify its ordering properties.
-->
大多数的队列都会以 FIFO（先进先出）的方式对元素进行排序。其中，优先队列（priority queue）则根据元素的值进行排序 -- 详情请查阅[对象排序](#object-ordering)一节。
无论队列使用的是何种排序方式，对 `remove` 或 `poll` 方法的调用均会移除位于队列首位的元素。对于 FIFO 队列而言，所有的新元素都会被添加到队列的尾部，
但其他队列可能选择不同的插入方式。每个 `Queue` 实现类都必须声明其排序元素的方式。

<!--
	It is possible for a Queue implementation to restrict the number of elements that it holds; such queues are known as bounded. Some Queue implementations in java.util.concurrent are bounded, but the implementations in java.util are not.
-->
某些 `Queue` 实现类有可能限制其元素的个数，这样的队列是**有界**的（bounded）。某些在 `java.util.concurrent` 包中的 `Queue` 实现类就是有界的，但 `java.util` 包中的实现类均不是有界的。

<!--
	The add method, which Queue inherits from Collection, inserts an element unless it would violate the queue's capacity restrictions, in which case it throws IllegalStateException. The offer method, which is intended solely for use on bounded queues, differs from add only in that it indicates failure to insert an element by returning false.
-->
由 `Collection` 接口继承而来的 `add` 方法会尝试往队列中添加元素，并在因队列容量限制而无法添加元素时抛出 `IllegalStateException`。`offer` 方法通常只会被用于有界队列，
而它在添加失败时只会返回 `false`。

<!--
	The remove and poll methods both remove and return the head of the queue. Exactly which element gets removed is a function of the queue's ordering policy. The remove and poll methods differ in their behavior only when the queue is empty. Under these circumstances, remove throws NoSuchElementException, while poll returns null.
-->
`remove` 和 `poll` 方法均能移除并返回位于队列首位的元素。移除的具体会是哪个元素取决于队列的排序策略。只有当队列为空时，`remove` 和 `poll` 方法的行为才会产生差异：
此时 `remove` 方法将抛出 `NoSuchElementException`，而 `poll` 方法则返回 `null`。

<!--
	The element and peek methods return, but do not remove, the head of the queue. They differ from one another in precisely the same fashion as remove and poll: If the queue is empty, element throws NoSuchElementException, while peek returns null.
-->
`element` 和 `peek` 方法能返回位于队列首位的元素但不会移除它。与 `remove` 和 `poll` 方法类似，当队列为空时，`element` 方法将抛出 `NoSuchElementException`，而 `peek` 方法则返回 `null`。

<!--
	Queue implementations generally do not allow insertion of null elements. The LinkedList implementation, which was retrofitted to implement Queue, is an exception. For historical reasons, it permits null elements, but you should refrain from taking advantage of this, because null is used as a special return value by the poll and peek methods.
-->
`Queue` 的实现类大多不允许插入 `null` 元素。`LinkedList` 曾被改写以实现 `Queue` 接口，但出于某些历史原因，它可以被放入 `null` 元素。不过你不应该依赖于 `LinkedList` 的这项特性，因为 `null` 被用作 `poll` 和 `peek` 方法的特殊返回值。

<!--
	Queue implementations generally do not define element-based versions of the equals and hashCode methods but instead inherit the identity-based versions from Object.
-->
`Queue` 的实现类大多并未实现基于具体元素内容的 `equals` 和 `hashCode` 方法，而是直接使用了继承自 `Object` 的版本。

<!--
	The Queue interface does not define the blocking queue methods, which are common in concurrent programming. These methods, which wait for elements to appear or for space to become available, are defined in the interface java.util.concurrent.BlockingQueue, which extends Queue.
-->
`Queue` 接口并未定义阻塞队列的相关方法，而这些方法在并发编程中是比较常见的。这些会使得程序阻塞以等待新的元素出现或是队列出现新的空间的方法定义在了
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/BlockingQueue.html">java.util.concurrent.BlockingQueue</a></code>
接口中，而该接口扩展了 `Queue` 接口。

<!--
	In the following example program, a queue is used to implement a countdown timer. The queue is preloaded with all the integer values from a number specified on the command line to zero, in descending order. Then, the values are removed from the queue and printed at one-second intervals. The program is artificial in that it would be more natural to do the same thing without using a queue, but it illustrates the use of a queue to store elements prior to subsequent processing.
-->
下面的示例程序使用了队列来实现一个倒数计时器。程序首先会由命令行参数给定一个整数，然后以降序将该整数到 `0` 之间的所有整数添加到队列中。而后，每隔一秒钟，程序都会从队列中获取一个值并打印输出。
尽管该程序显得十分做作，因为即使不使用队列我们也能实现这样的功能，但该程序也示范了如何在对元素进行后续处理前先使用队列来存放元素。

<pre class="brush: java">
import java.util.*;

public class Countdown {
    public static void main(String[] args) throws InterruptedException {
        int time = Integer.parseInt(args[0]);
        Queue&lt;Integer> queue = new LinkedList&lt;Integer>();

        for (int i = time; i >= 0; i--)
            queue.add(i);

        while (!queue.isEmpty()) {
            System.out.println(queue.remove());
            Thread.sleep(1000);
        }
    }
}
</pre>

<!--
	In the following example, a priority queue is used to sort a collection of elements. Again this program is artificial in that there is no reason to use it in favor of the sort method provided in Collections, but it illustrates the behavior of priority queues.
-->
下面的例子则使用了一个优先队列来对一个元素集合进行排序。这个程序依然十分做作，因为我们已经有了 `Collections` 类提供的 `sort` 方法，没有理由还使用这种方式来对元素进行排序，
但它也展示了优先队列的基本行为表现。

<pre class="brush: java">
static &lt;E> List&lt;E> heapSort(Collection&lt;E> c) {
    Queue&lt;E> queue = new PriorityQueue&lt;E>(c);
    List&lt;E> result = new ArrayList&lt;E>();

    while (!queue.isEmpty())
        result.add(queue.remove());

    return result;
}
</pre>

---

<h3 id="deque">2.5 Deque 接口</h3>

原文链接：[The Deque Interface](http://docs.oracle.com/javase/tutorial/collections/interfaces/deque.html)

<!--
Usually pronounced as deck, a deque is a double-ended-queue. A double-ended-queue is a linear collection of elements that supports the insertion and removal of elements at both end points. The Deque interface is a richer abstract data type than both Stack and Queue because it implements both stacks and queues at the same time. The Deque interface, defines methods to access the elements at both ends of the Deque instance. Methods are provided to insert, remove, and examine the elements. Predefined classes like ArrayDeque and LinkedList implement the Deque interface.
-->
Deque（通常念作 “deck”）即为双端队列（double-ended-queue）。双端队列为元素的线性集合，它支持对首部和尾部元素的添加与删除操作。
`Deque` 接口是比 `Stack` 和 `Queue` 接口更为丰富的抽象数据类型，因为它同时实现了栈与队列的功能。
`Deque` 接口定义了对位于 `Deque` 实例首部和尾部的元素进行访问的方法，这些方法使得用户可以对这些元素进行插入、删除或是读取。
实现了 `Deque` 接口的类包括了 `ArrayDeque` 和 `LinkedList`。

<!--
Note that the Deque interface can be used both as last-in-first-out stacks and first-in-first-out queues. The methods given in the Deque interface are divided into three parts:
-->
值得注意的是，`Deque` 接口可以被同时用作后入先出栈或是先入先出队列。`Deque` 接口定义的方法可以分为以下三种类型。

#### 插入

<!--
	The addfirst and offerFirst methods insert elements at the beginning of the Deque instance. The methods addLast and offerLast insert elements at the end of the Deque instance. When the capacity of the Deque instance is restricted, the preferred methods are offerFirst and offerLast because addFirst might fail to throw an exception if it is full.
-->
`addFirst` 和 `offerFirst` 方法可将元素添加至 `Deque` 实例的首部。`addLast` 和 `offerLast` 方法可将元素添加至 `Deque` 实例的尾部。
如果 `Deque` 实例对自身的容量有所限制，则我们更应该使用 `offerFirst` 和 `offerLast` 方法，因为 `addFirst` 方法有可能在 `Deque` 已满时不抛出错误。

#### 删除

<!--
	The removeFirst and pollFirst methods remove elements from the beginning of the Deque instance. The removeLast and pollLast methods remove elements from the end. The methods pollFirst and pollLast return null if the Deque is empty whereas the methods removeFirst and removeLast throw an exception if the Deque instance is empty.
-->
`removeFirst` 和 `pollFirst` 方法可移除位于 `Deque` 实例首部的元素。`removeLast` 和 `pollLast` 方法可移除位于 `Deque` 实例尾部的元素。当 `Deque` 为空时，`pollFirst` 和 `pollLast` 方法将返回 `null`，而 `removeFirst` 和 `removeLast` 方法将抛出错误。

#### 读取

<!--
	The methods getFirst and peekFirst retrieve the first element of the Deque instance. These methods dont remove the value from the Deque instance. Similarly, the methods getLast and peekLast retrieve the last element. The methods getFirst and getLast throw an exception if the deque instance is empty whereas the methods peekFirst and peekLast return NULL.
-->
`getFirst` 和 `peekFirst` 方法可获取位于 `Deque` 实例首部的元素。这些方法不会将元素从 `Deque` 中移除。
同样，`getLast` 和 `peekLast` 方法可以获取位于 `Deque` 尾部的元素。
当 `Deque` 为空时，`getFirst` 和 `getLast` 方法将抛出错误，而 `peekFirst` 和 `peekLast` 方法将返回 `null`。

<!--
	The 12 methods for insertion, removal and retieval of Deque elements are summarized in the following table:
-->
下表总结了 `Deque` 提供的用于对元素进行插入、删除和读取的 12 个方法：

<table class="table">
	<caption align="top"><b><code>Deque</code> 方法</b></caption>
	<tr>
		<th>操作类型</th>
		<th>首部元素</th>
		<th>尾部元素</th>
	</tr>
	<tr>
		<td>插入元素</td>
		<td>
			<code>addFirst(e)</code><br>
			<code>offerFirst(e)</code>
		</td>
		<td>
			<code>addLast(e)</code><br>
			<code>offerLast(e)</code>
		</td>
	</tr>
	<tr>
		<td>删除元素</td>
		<td>
			<code>removeFirst()</code><br>
			<code>pollFirst()</code>
		</td>
		<td>
			<code>removeLast()</code><br>
			<code>pollLast()</code>
		</td>
	</tr>
	<tr>
		<td>读取元素</td>
		<td>
			<code>getFirst()</code><br>
			<code>peekFirst</code>
		</td>
		<td>
			<code>getLast()</code><br>
			<code>peekLast()</code>
		</td>
	</tr>
</table>

<!--
	In addition to these basic methods to insert, remove and examine a Deque instance, the Deque interface also has some more predefined methods. One of these is removeFirstOccurence, this method removes the first occurence of the specified element if it exists in the Deque instance. If the element does not exist then the Deque instance remains unchanged. Another similar method is removeLastOccurence; this method removes the last occurence of the specified element in the Deque instance. The return type of these methods is boolean, and they return true if the element exists in the Deque instance.
-->
除了这些对 `Deque` 进行插入、删除和读取的基本方法，`Deque` 方法还提供了其他的一些方法。
其中包括了 `removeFirstOccurence` 方法，可将给定元素从 `Deque` 中第一次出现的地方移除。如果 `Deque` 不包含该元素则 `Deque` 保持不变。
类似的方法还包括 `removeLastOccurence` 方法，可将给定元素从 `Deque` 中最后一次出现的地方移除。
这两个方法的返回类型为 `boolean`，它们会在 `Deque` 包含该给定元素时返回 `true`。

---

<h2 id="stream">3 聚合操作</h2>

原文链接：[Aggregate Operations](http://docs.oracle.com/javase/tutorial/collections/streams/index.html)

<!--
	Note: To better understand the concepts in this section, review the sections Lambda Expressions and Method References.
-->
**注意**：为方便理解本节所描述的概念，请先阅读 [Lambda 表达式](http://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html)一节和[方法引用](http://docs.oracle.com/javase/tutorial/java/javaOO/methodreferences.html)一节。

<!--
	For what do you use collections? You don't simply store objects in a collection and leave them there. In most cases, you use collections to retrieve items stored in them.
-->
那么，为何你要使用集合呢？你不可能只是为了用集合来存放对象然后就把它们丢在那。大多数时候，你使用集合是为了获取它们之中的元素。

<!--
	Consider again the scenario described in the section Lambda Expressions. Suppose that you are creating a social networking application. You want to create a feature that enables an administrator to perform any kind of action, such as sending a message, on members of the social networking application that satisfy certain criteria.
-->
我们再来考虑一下在 [Lambda 表达式](http://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html)一节中所描述的那个场景。假设你在创建一个网络社交应用。
你想要添加一个新的功能，使得管理员可以对你的网络社交应用中某些满足给定条件的用户进行一些操作，比如发送信息。

<!--
	As before, suppose that members of this social networking application are represented by the following Person class:
-->
和往常一样，假设这个网络社交应用的用户由如下 `Person` 类表示：

<pre class="brush: java">
public class Person {

    public enum Sex {
        MALE, FEMALE
    }

    String name;
    LocalDate birthday;
    Sex gender;
    String emailAddress;
    
    // ...

    public int getAge() {
        // ...
    }

    public String getName() {
        // ...
    }
}
</pre>

<!--
	The following example prints the name of all members contained in the collection roster with a for-each loop:
-->
如下代码使用了一个 `for-each` 循环来打印集合 `roster` 中所有用户的名称：

<pre class="brush: java">
for (Person p : roster) {
    System.out.println(p.getName());
}
</pre>

<!--
	The following example prints all members contained in the collection roster but with the aggregate operation forEach:
-->
而如下代码使用了聚合操作 `forEach` 来打印集合 `roster` 中所有用户的名称：

<pre class="brush: java">
roster.stream().forEach(e -> System.out.println(e.getName()));
</pre>

<!--
	Although, in this example, the version that uses aggregate operations is longer than the one that uses a for-each loop, you will see that versions that use bulk-data operations will be more concise for more complex tasks.
-->
尽管在这个示例中，使用聚合操作的代码反而比使用 `for-each` 循环的代码要长，但接下来你会看到，使用批量数据操作可以用更简洁的代码完成较复杂的任务。

<!--
	Find the code excerpts described in this section in the example BulkDataOperationsExamples.
-->
本章中的代码示例均可在示例程序
<code><a href="http://docs.oracle.com/javase/tutorial/collections/streams/examples/BulkDataOperationsExamples.java">BulkDataOperationsExamples</a></code>
中找到。

#### 流水线与流

**流水线**（pipeline）即为由聚合操作组成的有序序列。如下示例使用了一个包含聚合操作 `filter` 和 `forEach` 的流水线来打印集合 `roster` 中所有男性用户的名称：

<pre class="brush: java">
roster.stream().filter(e -> e.getGender() == Person.Sex.MALE)
               .forEach(e -> System.out.println(e.getName()));
</pre>

我们可以和下面这个使用 `for-each` 循环来打印集合 `roster` 中所有男性用户名称的例子对比一下：

<pre class="brush: java">
for (Person p : roster) {
    if (p.getGender() == Person.Sex.MALE) {
        System.out.println(p.getName());
    }
}
</pre>

一个流水线包含如下几个组成部分：

- 数据来源：数据的来源可能是一个集合、数组、工厂函数或是一个 I/O Channel。在这个例子中，数据的来源为 `roster`。
- 若干个**中间操作**（intermediate operation）。如 `filter` 的中间操作将产生一个新的流。
  **流**（stream）是由元素组成的序列。和集合不同的是，它并不是用于存储元素的数据结构，它只用于保存那些从源头经过了流水线的数据。示例中通过调用 `roster` 和 `stream` 方法创建了一个流。
  `filter` 操作则返回一个包含满足给定条件的元素的流。在示例中，给定的条件为 Lambda 表达式 `e -> e.getGender() == Person.Sex.MALE`，当对象 `e` 的 `gender` 域有值 `Person.Sex.MALE` 时它返回 `true`。因此，示例中的 `filter` 操作返回了一个包含集合 `roster` 中所有男性用户的流。
- 一个**终止操作**（terminal operation）。一个如 `forEach` 的终止操作将产生一个不是流的结果，如一个基本类型的值、一个集合，或如 `forEach` 不返回任何值。
  在示例中，`forEach` 操作的参数为 Lambda 表达式 `e -> System.out.println(e.getName())`，它调用了对象 `e` 的 `getName` 方法。（Java 的运行时和编译器可以推断对象 `e` 的类型为 `Person`）。

<!--
	The following example calculates the average age of all male members contained in the collection roster with a pipeline that consists of the aggregate operations filter, mapToInt, and average:
-->
如下示例使用了一个包含聚合操作 `filter`、`mapToInt` 和 `average` 的流水线类统计集合 `roster` 中所有男性用户的平均年龄：

<pre class="brush: java">
double average =
    roster.stream().filter(p -> p.getGender() == Person.Sex.MALE)
                   .mapToInt(Person::getAge)
                   .average().getAsDouble();
</pre>

<!--
	The mapToInt operation returns a new stream of type IntStream (which is a stream that contains only integer values). The operation applies the function specified in its parameter to each element in a particular stream. In this example, the function is Person::getAge, which is a method reference that returns the age of the member. (Alternatively, you could use the lambda expression e -> e.getAge().) Consequently, the mapToInt operation in this example returns a stream that contains the ages of all male members in the collection roster.
-->
`mapToInt` 操作返回一个类型为 `IntStream` 的新流（这种流中只包含整型值）。该操作将参数给定的函数应用于特定流中的每一个元素。在示例中，该函数为 `Person::getAge`，
一个返回用户年龄的方法引用（你还可以使用 Lambda 表达式 `e -> e.getAge()` 作为代替）。因此，示例中的 `mapToInt` 操作返回了一个包含集合 `roster` 中所有男性用户的年龄的流。

<!--
	The average operation calculates the average value of the elements contained in a stream of type IntStream. It returns an object of type OptionalDouble. If the stream contains no elements, then the average operation returns an empty instance of OptionalDouble, and invoking the method getAsDouble throws a NoSuchElementException. The JDK contains many terminal operations such as average that return one value by combining the contents of a stream. These operations are called reduction operations; see the section Reduction for more information.
-->
`average` 操作可以计算 `IntStream` 中所有元素的平均值。它返回一个类型为 `OptionalDouble` 的对象。如果流中不包含任何元素，那么 `average` 操作将返回一个 `OptionalDouble` 类型的空实例，调用其 `getAsDouble` 方法将抛出 `NoSuchElementException`。JDK 中还包含了很多像 `average` 这样通过组合流中所有元素来返回一个值的终止操作。这些操作被称为**归约操作**。详情请查阅[归约操作](#reduction)一节。

#### 聚合操作与迭代器之间的差异

像 `forEach` 这样的聚合操作看起来有点像迭代器，但实际上它们有如下几点不同：

- **聚合操作使用内部迭代**（internal iteration）：聚合操作并不包含像 `next` 这样的方法来引导它们处理集合的下一个元素。你的程序会使用**内部委托**（internal delegation）机制来确定其迭代**哪个**集合，但将由 JDK 来决定**如何**迭代该集合。使用**外部迭代**（external iteration）的话，你的程序可以决定迭代哪个集合以及如何迭代该集合。然而，外部迭代只能按顺序地迭代集合中的元素。内部迭代则没有这样的限制。它能更好地利用并行计算，将一个问题分成若干个更小的子问题并并行地处理这些子问题，最终将子问题的结果合并为最终的结果。详情请查阅[并行](#parallelism)一节。
- **它们用于处理流中的元素**：聚合操作用于处理流中的元素，而不是直接处理集合中的元素。聚合操作也因此被称为**流操作**（stream operation）。
- **它们支持以参数的形式给定的自定义的行为**：你可以为大多数聚合操作以参数的形式给定一个 [Lambda 表达式](http://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html)，这使得你可以自定义特定聚合操作的行为。

<h3 id="reduction">3.1 归约操作</h3>

原文链接：[Reduction](http://docs.oracle.com/javase/tutorial/collections/streams/reduction.html)

<!--
	The section Aggregate Operations describes the following pipeline of operations, which calculates the average age of all male members in the collection roster:
-->
之前我们给出了如下统计集合 `roster` 中所有男性用户的平均年龄的例子：

<pre class="brush: java">
double average =
    roster.stream().filter(p -> p.getGender() == Person.Sex.MALE)
                   .mapToInt(Person::getAge)
                   .average().getAsDouble();
</pre>

<!--
	The JDK contains many terminal operations (such as average, sum, min, max, and count) that return one value by combining the contents of a stream. These operations are called reduction operations. The JDK also contains reduction operations that return a collection instead of a single value. Many reduction operations perform a specific task, such as finding the average of values or grouping elements into categories. However, the JDK provides you with the general-purpose reduction operations reduce and collect, which this section describes in detail.
-->
JDK 中包含了很多可以将流中的元素组合为一个值的终止操作，如 `average`、`sum`、`min`、`max` 和 `count`。这些操作又被称为**归约操作**（reduction operations）。
JDK 中还包含了返回一个集合而不是一个单一值的归约操作。很多归约操作都被用于执行比较具体的任务，例如计算平均值或是对元素进行分类。
除此之外，JDK 还提供了 `reduce` 和 `collection` 这样的普适聚合操作。我们将在接下来的内容中对其进行详述。

<!--
	You can find the code excerpts described in this section in the example ReductionExamples.
-->
本节中的代码示例均可在示例程序
<code><a href="http://docs.oracle.com/javase/tutorial/collections/streams/examples/ReductionExamples.java">ReductionExamples</a></code>
中找到。

#### Stream.reduce 方法



<h3 id="parallelism">3.2 并行</h3>

原文链接：<a href="http://docs.oracle.com/javase/tutorial/collections/streams/parallelism.html">Parallelism</a>

---

<h2 id="implementations">4 实现</h2>

原文链接：[Implementations](http://docs.oracle.com/javase/tutorial/collections/implementations/index.html)

<!--
	Implementations are the data objects used to store collections, which implement the interfaces described in the Interfaces section.
	This lesson describes the following kinds of implementations:
-->
实现类是用于存储集合的数据对象，它们实现了在<a href="#interfaces" target="_self">接口</a>一章中阐述的接口类。本章将讲述如下几种实现类：

-	<!--
		General-purpose implementations are the most commonly used implementations, designed for everyday use.
		They are summarized in the table titled General-purpose-implementations.
	-->
	**普适实现类**（General-purpose implementation）：最常用的实现类，被设计用于多数的简单场景。
-	<!--
		Special-purpose implementations are designed for use in special situations and display nonstandard performance characteristics, usage restrictions, or behavior.
	-->
	**特殊实现类**（Special-purpose implementation）：被设计用于某些特殊的场景，带有非标准的性能特征、使用限制或行为。
-	<!--
		Concurrent implementations are designed to support high concurrency, typically at the expense of single-threaded performance.
		These implementations are part of the java.util.concurrent package.
	-->
	**并发实现类**（Concurrent implementation）：被设计用于高并发场景，通常会牺牲其在单线程下的性能表现。这些实现类是`java.util.concurrent`包的一部分。
-	<!--
		Wrapper implementations are used in combination with other types of implementations, often the general-purpose ones, to provide added or restricted functionality.
	-->
	**包装实现类**（Wrapper implementation）：用于与其他类型的实现类，尤其是普适实现类，相结合，以增加某些功能或限制某些功能的使用。
-	<!--
		Convenience implementations are mini-implementations, typically made available via static factory methods,
		that provide convenient, efficient alternatives to general-purpose implementations for special collections (for example, singleton sets).
	-->
	**便捷实现类**（Convenience implementation）：轻量级实现类，通常通过静态工厂方法来获取实例，可以在某些特殊的情况下作为普适实现类的高性能便捷替代品，比如单例集（singleton set）。
-	<!--
		Abstract implementations are skeletal implementations that facilitate the construction of custom implementations —
		described later in the Custom Collection Implementations section. An advanced topic, it's not particularly difficult, but relatively few people will need to do it.
	-->
	**抽象实现类**（Abstract implementation）：为创建自定义实现类提供便利的骨架实现类，将在<a href="#custom-implementations" target="_self">自定义集合实现类</a>一章的后半部分进行讲解。
	
<!--
	The general-purpose implementations are summarized in the following table.
-->
下表归纳了 Java 集合框架提供的所有普适实现类：

<table class="table">
	<caption><strong>普适实现类</strong></caption>
	<tr>
		<th>接口</th>
		<th>哈希表</th>
		<th>变长数组</th>
		<th>树</th>
		<th>链表</th>
		<th>哈希表 + 链表</th>
	</tr>
	<tr>
		<td><code>Set</code></td>
		<td><code>HashSet</code></td>
		<td>&nbsp;</td>
		<td><code>TreeSet</code></td>
		<td>&nbsp;</td>
		<td><code>LinkedHashSet</code></td>
	</tr>
	<tr>
		<td><code>List</code></td>
		<td>&nbsp;</td>
		<td><code>ArrayList</code></td>
		<td>&nbsp;</td>
		<td><code>LinkedList</code></td>
		<td>&nbsp;</td>
	</tr>
	<tr>
		<td><code>Queue</code></td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
	</tr>
	<tr>
		<td><code>Deque</code></td>
		<td>&nbsp;</td>
		<td><code>ArrayDeque</code></td>
		<td>&nbsp;</td>
		<td><code>LinkedList</code></td>
		<td>&nbsp;</td>
	</tr>
	<tr>
		<td><code>Map</code></td>
		<td><code>HashMap</code></td>
		<td>&nbsp;</td>
		<td><code>TreeMap</code></td>
		<td>&nbsp;</td>
		<td><code>LinkedHashMap</code></td>
	</tr>
</table>

<!--
	As you can see from the table, the Java Collections Framework provides several general-purpose implementations of the Set, List, and Map interfaces.
	In each case, one implementation — HashSet, ArrayList, and HashMap — is clearly the one to use for most applications, all other things being equal.
	Note that the SortedSet and the SortedMap interfaces do not have rows in the table. Each of those interfaces has one implementation (TreeSet and TreeMap)
	and is listed in the Set and the Map rows. There are two general-purpose Queue implementations — LinkedList, which is also a List implementation, and PriorityQueue,
	which is omitted from the table. These two implementations provide very different semantics: LinkedList provides FIFO semantics,
	while PriorityQueue orders its elements according to their values.
-->
正如你所见，Java 集合框架为 `Set`、`List`、`Map` 接口分别提供了多个普适实现类。对于这三个接口，`HashSet`、`ArrayList`
、`HashMap` 显然是它们各自最常用的实现类，而其他实现类则互相之间差不了多少。注意，表中并未列出 `SortedSet` 和 `SortedMap` 接口。
这两个接口都各自有着一个实现类，分别是 `TreeSet` 和 `TreeMap`，而且都已经在表中给出。实际上，`Queue` 接口还有两个普适实现类：`LinkedList`，
同时也是 `List` 的实现类；`PriorityQueue`，但并未在表中给出。这两个实现类有着截然不同的行为：`LinkedList` 为先入先出表，
而 `PriorityQueue` 则根据元素的值对元素进行排序。

<!--
	Each of the general-purpose implementations provides all optional operations contained in its interface. All permit null elements, keys, and values.
	None are synchronized (thread-safe). All have fail-fast iterators, which detect illegal concurrent modification during iteration and fail quickly
	and cleanly rather than risking arbitrary, nondeterministic behavior at an undetermined time in the future. All are Serializable and all support a public clone method.
-->
所有这些普适实现类都提供了其所属接口中的所有可选操作。它们都支持 `null` 元素或键/值。它们都不是同步（线程安全）的。
它们所使用的都是快速失败迭代器（fail-fast iterator），这种迭代器会在迭代的过程中检测底层集合是否有发生变动，并在侦测到变动时快速利落地抛出错误，
以不至于在未来的某个时刻产生出某些不可预期的行为。它们都实现了 `Serializable` 接口并提供了 `public` 的 `clone` 方法。

<!--
	The fact that these implementations are unsynchronized represents a break with the past: The legacy collections Vector and Hashtable are synchronized.
	The present approach was taken because collections are frequently used when the synchronization is of no benefit.
	Such uses include single-threaded use, read-only use, and use as part of a larger data object that does its own synchronization.
	In general, it is good API design practice not to make users pay for a feature they don't use.
	Furthermore, unnecessary synchronization can result in deadlock under certain circumstances.
-->
这些实现类不同步的特性可能和过去的一些设定出现断层：遗留的集合实现类 `Vector` 和 `Hashtable` 是同步的。
现在我们将这些实现类设计为不同步，是因为在很多使用场景下集合的同步并不能带来什么好处，比如单线程使用、只读使用、或者是将其作为一个更大的数据结构的一部分进行使用，
而这个数据结构自己也会处理同步问题。综合来看，使用户不至于为了自己用不上的功能埋单是更好的 API 设计理念。况且，多余的同步机制还可能在某些情况下导致死锁的出现。

<!--
	If you need thread-safe collections, the synchronization wrappers, described in the Wrapper Implementations section,
	allow any collection to be transformed into a synchronized collection. Thus, synchronization is optional for general-purpose implementations,
	whereas it is mandatory for legacy implementations. Moreover, the java.util.concurrent package provides concurrent implementations of the BlockingQueue interface,
	which extends Queue, and of the ConcurrentMap interface, which extends Map. These implementations offer much higher concurrency than mere synchronized implementations.
-->
如果你确实需要线程安全的集合，我们将在<a href="#wrapper-implementation">包装实现类</a>一节中讲述的同步包装类是不错的选择，它们可以将任何集合转化为一个同步的集合。
因此，对于普适实现类来说，线程同步是可选的功能，但对于那些遗留的实现类来说却是不可选的。除此之外，`java.util.concurrent` 包中提供了很多的并发实现类，
它们有的实现了继承 `Queue` 的 `BlockingQueue` 接口，有的则实现了继承 `Map` 的 `ConcurrentMap` 接口。
这些实现类比起简单的同步实现类拥有更高的并发性能。

<!--
	As a rule, you should be thinking about the interfaces, not the implementations. That is why there are no programming examples in this section.
	For the most part, the choice of implementation affects only performance. The preferred style, as mentioned in the Interfaces section,
	is to choose an implementation when a Collection is created and to immediately assign the new collection to a variable of the corresponding interface type
	(or to pass the collection to a method expecting an argument of the interface type). In this way, the program does not become dependent on any added methods
	in a given implementation, leaving the programmer free to change implementations anytime that it is warranted by performance concerns or behavioral details.
-->
有一条原则是需要你谨记的：你考虑的应该是接口，而不是具体的实现类。这也是为何在这章中不会有任何代码示例。在大多数时候，选择使用哪种实现类只会影响程序的性能表现。
正如在<a href="interfaces" target="_self">接口</a>一节中所提的那样，更好的做法是在创建 `Collection` 示例时选择具体的实现类，然后立刻把它赋予类型为其所属接口类的变量，
或者立刻把它传入到一个以其所属接口为参数的方法中。这样一来，你的程序便不会依赖于任何由具体实现类提供的特殊方法，
开发者在性能遇到瓶颈或者某些行为细节不符合预期的时候也可以很方便地更改所使用的实现类。

<!--
	The sections that follow briefly discuss the implementations. The performance of the implementations is described using words such as constant-time,
	log, linear, n log(n), and quadratic to refer to the asymptotic upper-bound on the time complexity of performing the operation.
	All this is quite a mouthful, and it doesn't matter much if you don't know what it means. If you're interested in knowing more, refer to any good algorithms textbook.
	One thing to keep in mind is that this sort of performance metric has its limitations. Sometimes, the nominally slower implementation may be faster.
	When in doubt, measure the performance!
-->
接下来的几节中我们会简单的讨论一下这些实现类。
我们会用诸如“常数时间”、“对数时间”、“线性时间”、“n log(n)”、“平方时间”等名词来描述实现类的性能，它们指代的是具体执行某个操作时时间复杂度的上界。
这些东西要细说起来还是有得说的，不过就算你不是很懂它们的意思也不是很有关系。
如果你想要更加深入地了解它们，不妨查阅一些算法教科书。不过，要记住，这种衡量性能的方式有着它的局限，有些时候那些“名义上”更慢的实现类反而可能更快。
当你犹豫不决的时候，测量一下它们的性能吧！

<h3 id="set-implementations">4.1 Set 实现</h3>

原文链接：<a href="http://docs.oracle.com/javase/tutorial/collections/implementations/set.html">Set Implementations</a>

`Set` 接口的实现类可以被分为普适实现类和特殊实现类。

<h4 class="jump" id="general-purpose-set-implementations">4.1.1 普适 Set 接口实现类</h4>

<!--
	There are three general-purpose Set implementations — HashSet, TreeSet, and LinkedHashSet. Which of these three to use is generally straightforward.
	HashSet is much faster than TreeSet (constant-time versus log-time for most operations) but offers no ordering guarantees.
	If you need to use the operations in the SortedSet interface, or if value-ordered iteration is required, use TreeSet; otherwise, use HashSet.
	It's a fair bet that you'll end up using HashSet most of the time.
-->
[Set][] 接口的普适实现类有三种：[HashSet][]、[TreeSet][] 和 [LinkedHashSet][]。
这三个实现类如何选择还是挺直观的。`HashSet` 比 `TreeSet` 快得多（`HashSet` 的大多数操作是常数时间的，而 `TreeSet` 的大多数操作是对数时间的），
但不能为元素提供一个确定的迭代顺序。如果你需要使用 `SortedSet` 接口中的方法，或者你希望在迭代时元素能基于其值有序，请使用 `TreeSet` ；否则，使用 `HashSet`。
我猜你在绝大多数情况下都会使用 `HashSet`。

<!--
	LinkedHashSet is in some sense intermediate between HashSet and TreeSet. Implemented as a hash table with a linked list running through it,
	it provides insertion-ordered iteration (least recently inserted to most recently) and runs nearly as fast as HashSet.
	The LinkedHashSet implementation spares its clients from the unspecified, generally chaotic ordering provided by HashSet
	without incurring the increased cost associated with TreeSet.
-->
从某种角度上讲，`LinkedHashSet` 处于 `HashSet` 和 `TreeSet` 之间。它被实现为一张特殊的哈希表，由一个链表按照元素的插入顺序贯穿整张哈希表。
由此，它能在被迭代时按照元素的插入顺序返回元素（从最早插入的元素到最近插入的元素），而且它的性能几乎和 `HashSet` 一样快。
`LinkedHashSet `一方面使得用户不至于面对 `HashSet` 那种不确定的元素迭代顺序，另一方面又不会带来 `TreeSet` 那样的性能下降。

<!--
	One thing worth keeping in mind about HashSet is that iteration is linear in the sum of the number of entries and the number of buckets (the capacity).
	Thus, choosing an initial capacity that's too high can waste both space and time. On the other hand, choosing an initial capacity that's too low wastes time
	by copying the data structure each time it's forced to increase its capacity. If you don't specify an initial capacity, the default is 16. In the past,
	there was some advantage to choosing a prime number as the initial capacity. This is no longer true. Internally, the capacity is always rounded up to a power of two.
	The initial capacity is specified by using the int constructor. The following line of code allocates a HashSet whose initial capacity is 64.
-->
有关 `HashSet`，值得一提是，它的迭代性能同时与元素数量和桶的数量（或容量（capacity））呈线性关系。因此，如果你的初始容量设定过高，有可能会对空间和时间同时造成浪费。
另一方面，如果初始容量设定过低则容易浪费时间，因为每次需要强制提高容量时都需要对元素进行复制。如果你没有指定初始容量，默认的初始容量为 `16`。
在以前，将初始容量设定为质数会更好，但现在已经不适用了。在内部实现里，容量会被向上取整到 `2` 的幂。
你可以通过 `HashSet` 的整型构造器来指定初始容量。下述代码创建了一个初始容量为 `64` 的 `HashSet`：

<pre class="brush: java">
Set&lt;String&gt; s = new HashSet&lt;String&gt;(64);
</pre>

<!--
	The HashSet class has one other tuning parameter called the load factor. If you care a lot about the space consumption of your HashSet,
	read the HashSet documentation for more information. Otherwise, just accept the default; it's almost always the right thing to do.
-->
`HashSet` 还有另外一个配置参数：加载因子（load factor）。如果你很在意你的 `HashSet` 所占用的空间，你可以查阅一下 `HashSet` 的
[JavaDoc][HashSet]。不然的话，直接使用默认的加载因子吧，不会有错的。

<!--
	If you accept the default load factor but want to specify an initial capacity, pick a number that's about twice the size to which you expect the set to grow.
	If your guess is way off, you may waste a bit of space, time, or both, but it's unlikely to be a big problem.
-->
如果你想要使用默认的加载因子但想要自己给定一个初始容量，你可以估算一下你的集的元素数量大概会扩展到多少，并将其设定为这个数字的两倍。
如果你估算的数值和实际的数值天差地别，你可能会浪费一些空间，或者一些时间，或者两者都有，但这倒算不上是什么大问题。

<!--
	LinkedHashSet has the same tuning parameters as HashSet, but iteration time is not affected by capacity. TreeSet has no tuning parameters.
-->
`LinkedHashSet` 有着和 `HashSet` 相同的配置参数，但它的容量不会影响它的迭代效率。`TreeSet` 没有任何配置参数。

<h4 id="special-purpose-set-implementations">4.1.2 特殊 Set 接口实现类</h4>

<!--
	There are two special-purpose Set implementations — EnumSet and CopyOnWriteArraySet.
-->
`Set`接口的特殊实现类有两种：[EnumSet][] 和 [CopyOnWriteArraySet][]。

<!--
	EnumSet is a high-performance Set implementation for enum types. All of the members of an enum set must be of the same enum type.
	Internally, it is represented by a bit-vector, typically a single long. Enum sets support iteration over ranges of enum types.
	For example, given the enum declaration for the days of the week, you can iterate over the weekdays. The EnumSet class provides a static factory that makes it easy.
-->
`EnumSet`（枚举集）是一种十分高效的用于存储枚举类型的 `Set` 实现类。一个 `EnumSet` 对象的所有元素必须属于同一个枚举类型。
在内部实现上，`EnumSet` 被表示为一个位向量（bit-vector），或者说一个 `long` 变量。`EnumSet` 支持基于枚举对象范围的遍历。
比如，给定一个星期几的枚举类型，你可以只遍历工作日。`EnumSet` 提供的一个静态工厂方法使得这么做十分方便：

<pre class="brush: java">
for (Day d : EnumSet.range(Day.MONDAY, Day.FRIDAY))
        System.out.println(d);
</pre>

<!--
	Enum sets also provide a rich, typesafe replacement for traditional bit flags.
-->
除此之外，`EnumSet` 还可以作为传统位标识（bit flag）的类型安全的有效替代：

<pre class="brush: java">
EnumSet.of(Style.BOLD, Style.ITALIC)
</pre>

<!--
	CopyOnWriteArraySet is a Set implementation backed up by a copy-on-write array. All mutative operations, such as add, set, and remove,
	are implemented by making a new copy of the array; no locking is ever required. Even iteration may safely proceed concurrently with element insertion and deletion.
	Unlike most Set implementations, the add, remove, and contains methods require time proportional to the size of the set.
	This implementation is only appropriate for sets that are rarely modified but frequently iterated.
	It is well suited to maintaining event-handler lists that must prevent duplicates.
-->
`CopyOnWriteArraySet` 内部由一个复制写入数组（copy-on-write array）实现。所有的变化操作，如 `add`、`set`、`remove`，
都会创建一个新的数组拷贝，因此它不需要任何加锁机制。即使它正在被遍历的时候，你也可以安全地插入或删除元素。
和其他 `Set` 实现类不同的是，`add`、`remove`和`contains` 方法需要的时间和集的大小呈正比。
这个实现类只适用于那些很少被修改但需要频繁遍历的集，比如需要避免重复元素的事件处理器列表。
