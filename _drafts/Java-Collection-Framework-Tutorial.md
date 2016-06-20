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
集合框架（collections framework）是一种用于表示和操控集合的统一的代码架构。所有的集合框架都包括如下几个方面：

-	<!-- 
		Interfaces: These are abstract data types that represent collections. Interfaces allow collections to be manipulated independently of the details of their representation. 
		In object-oriented languages, interfaces generally form a hierarchy.
	-->
  	**接口**（Interface）：用于表示集合的抽象数据类型。接口的存在使得使用者可以在不去了解集合的实现的情况下操控集合。
   	在面向对象语言中，接口们可形成层级架构。
   
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

#### 遍历集合

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

#### Collection 接口批量操作

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

#### Set 接口基本操作

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
使用 `for-each` 语句：

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

#### Set 接口批量操作

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
	`s1.addAdd(s2)`：将 `s1` 变为 `s1` 和 `s2` 的**并集**。（两个集的并集包含两个集的所有元素。译者注：$A \cup B = \lbrace x | x \in A \vee x \in B \rbrace$）
-	<!--
		s1.retainAll(s2) — transforms s1 into the intersection of s1 and s2. (The intersection of two sets is the set containing only the elements common to both sets.)
	-->
	`s1.retainAll(s2)`：将 `s1` 变为 `s1` 和 `s2` 的**交集**。（两个集的交集只包含同时属于两个集的元素。译者注：$A \cap B = \lbrace x | x \in A \wedge x \in B \rbrace$）
-	<!--
		s1.removeAll(s2) — transforms s1 into the (asymmetric) set difference of s1 and s2.
		(For example, the set difference of s1 minus s2 is the set containing all of the elements found in s1 but not in s2.)
	-->
	`s1.removeAll(s2)`：将 `s1` 变为 `s1` 和 `s2` 的（非对称）**差集**。（比如，`s1 - s2` 产生的差集包含那些属于 `s1` 但不属于 `s2` 的元素。译者注：$A - B = \lbrace x | x \in A \wedge x \not\in B \rbrace$）。

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

#### Set 接口数组操作

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

#### 集合操作

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

#### 基于位置访问与查找操作

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
大多数的队列都会以 FIFO（先进先出）的方式对元素进行排序。其中，优先队列（priority queue）则根据元素的值进行排序 -- 详情请查阅[对象排序](#order)一节。
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

<h3 id="map">2.6 Map 接口</h3>

<!--
	A Map is an object that maps keys to values. A map cannot contain duplicate keys: Each key can map to at most one value. It models the mathematical function abstraction. The Map interface includes methods for basic operations (such as put, get, remove, containsKey, containsValue, size, and empty), bulk operations (such as putAll and clear), and collection views (such as keySet, entrySet, and values).
-->
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/Map.html">Map</a></code> 为将键映射到值的对象。一个映射不能包含重复的键：每个键至多被映射到一个值。
它模拟的是数学上的函数的抽象。`Map` 接口包括了用于进行基本操作的方法（如 `put`、`get`、`remove`、`containsKey`、`containsValue`、`size` 和 `empty`）、
用于进行批量操作的方法（如 `putAll` 和 `clear`）以及用于产生集合视图的方法（如 `keySet`、`entrySet` 和 `values`）。

<!--
	The Java platform contains three general-purpose Map implementations: HashMap, TreeMap, and LinkedHashMap. Their behavior and performance are precisely analogous to HashSet, TreeSet, and LinkedHashSet, as described in The Set Interface section.
-->
Java 为 `Map` 提供了三个普适实现类：
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html">HashMap</a></code>、
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/TreeMap.html">TreeMap</a></code> 和
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/LinkedHashMap.html">LinkedHashMap</a></code>。
它们的行为和性能与 [Set 接口](#set)一节中讨论的 `HashSet`、`TreeSet` 和 `LinkedHashSet` 完全一致。

<!--
	The remainder of this page discusses the Map interface in detail. But first, here are some more examples of collecting to Maps using JDK 8 aggregate operations. Modeling real-world objects is a common task in object-oriented programming, so it is reasonable to think that some programs might, for example, group employees by department:
-->
本节接下来的内容将对 `Map` 节接口进行详细介绍。不过，首先我们要先看一下如下几个使用 JDK 8 提供的聚合操作将流元素收集到 `Map` 中的示例代码。
对于面向对象编程而言，模拟现实生活中的物件是十分常见的，因此我们不妨假设有一个程序需要将员工按部门进行分组：

<pre class="brush: java">
// 将员工按部门进行分组
Map&lt;Department, List&lt;Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));
</pre>

<!--
	Or compute the sum of all salaries by department:
-->
或是计算各部门的工资总和：

<pre class="brush: java">
// 计算各部门的工资总和
Map&lt;Department, Integer> totalByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment,
        Collectors.summingInt(Employee::getSalary)));
</pre>

<!--
	Or perhaps group students by passing or failing grades:
-->
或是将学生按合格和不合格进行分组：

<pre class="brush: java">
// 将学生按合格和不合格进行分组
Map&lt;Boolean, List&lt;Student>> passingFailing = students.stream()
    .collect(Collectors.partitioningBy(s -> s.getGrade()>= PASS_THRESHOLD)); 
</pre>

<!--
	You could also group people by city:
-->
你还可以将人们根据城市进行分组：

<pre class="brush: java">
// 按城市分组
Map&lt;String, List&lt;Person>> peopleByCity
         = personStream.collect(Collectors.groupingBy(Person::getCity));
</pre>

<!--
	Or even cascade two collectors to classify people by state and city:
-->
或是将两个收集器进行级联以将人们根据城市和州进行分组：

<pre class="brush: java">
// 级联收集器
Map&lt;String, Map&lt;String, List&lt;Person>>> peopleByStateAndCity =
    personStream.collect(Collectors.groupingBy(Person::getState,
    Collectors.groupingBy(Person::getCity)))
</pre>

<!--
	Again, these are but a few examples of how to use the new JDK 8 APIs. For in-depth coverage of lambda expressions and aggregate operations see the lesson entitled Aggregate Operations.
-->
这些只是几个使用 JDK 8 的 API 的简单示例。Lambda 表达式和聚合操作将会在[聚合操作](#stream)一节中详细介绍。

#### Map 接口基本操作

<!--
	The basic operations of Map (put, get, containsKey, containsValue, size, and isEmpty) behave exactly like their counterparts in Hashtable. The following program generates a frequency table of the words found in its argument list. The frequency table maps each word to the number of times it occurs in the argument list.
-->
`Map` 接口的基本操作（`put`、`get`、`containsKey`、`containsValue`、`size` 和 `isEmpty`）和它们在 `Hashtable` 中对应的方法表现完全一致。
[下面这个程序](http://docs.oracle.com/javase/tutorial/collections/interfaces/examples/Freq.java)将会为出现在命令行参数列表中的单词生成一个频率表。
该频率表会将单词映射到其在参数列表中出现的次数。

<pre class="brush: java">
import java.util.*;

public class Freq {
    public static void main(String[] args) {
        Map&lt;String, Integer> m = new HashMap&lt;String, Integer>();

        // 初始化频率表
        for (String a : args) {
            Integer freq = m.get(a);
            m.put(a, (freq == null) ? 1 : freq + 1);
        }

        System.out.println(m.size() + " distinct words:");
        System.out.println(m);
    }
}
</pre>

<!--
	The only tricky thing about this program is the second argument of the put statement. That argument is a conditional expression that has the effect of setting the frequency to one if the word has never been seen before or one more than its current value if the word has already been seen. Try running this program with the command:
-->
这个程序唯一一个有趣的地方在于 `put` 语句的第二个参数。该参数是一个条件表达式：在之前没遇到过这个单词时它能将频率设定为 1，也能在遇到这个单词的情况下将频率增加。
尝试在命令行中运行此程序：

<pre>
java Freq if it is to be it is up to me to delegate
</pre>

程序将产生如下输出：

<pre>
8 distinct words:
{to=3, delegate=1, be=1, it=2, up=1, if=1, me=1, is=2}
</pre>

<!--
	Suppose you'd prefer to see the frequency table in alphabetical order. All you have to do is change the implementation type of the Map from HashMap to TreeMap. Making this four-character change causes the program to generate the following output from the same command line.
-->
假设你想要让频率表按字典序排序。你只需要将 `Map` 的实现类从 `HashMap` 变为 `TreeMap` 就可以了。
在改了这四个字母以后，相同的命令将是程序产生如下输出：

<pre>
8 distinct words:
{be=1, delegate=1, if=1, is=2, it=2, me=1, to=3, up=1}
</pre>

<!--
	Similarly, you could make the program print the frequency table in the order the words first appear on the command line simply by changing the implementation type of the map to LinkedHashMap. Doing so results in the following output.
-->
类似地，你还可以让程序将频率表按照单词第一次出现在命令行中的顺序进行打印，只需要将实现类改为 `LinkedHashMap` 即可。这样一来，程序将产生如下输出：

<pre>
8 distinct words:
{if=1, it=2, is=2, to=3, be=1, up=1, me=1, delegate=1}
</pre>

<!--
	This flexibility provides a potent illustration of the power of an interface-based framework.
-->
上述示例的变化弹性展示了使用基于接口的框架的好处。

<!--
	Like the Set and List interfaces, Map strengthens the requirements on the equals and hashCode methods so that two Map objects can be compared for logical equality without regard to their implementation types. Two Map instances are equal if they represent the same key-value mappings.
-->
与 `Set` 和 `List` 接口相同，`Map` 接口同样对 `equals` 方法和 `hashCode` 方法进行了改进，这样两个 `Map` 即可以被进行逻辑等价判断而不必在意它们各自的实现类型。
如果两个 `Map` 实例代表相同的键值映射，那么它们就是相等的。

<!--
	By convention, all general-purpose Map implementations provide constructors that take a Map object and initialize the new Map to contain all the key-value mappings in the specified Map. This standard Map conversion constructor is entirely analogous to the standard Collection constructor: It allows the caller to create a Map of a desired implementation type that initially contains all of the mappings in another Map, regardless of the other Map's implementation type. For example, suppose you have a Map, named m. The following one-liner creates a new HashMap initially containing all of the same key-value mappings as m.
-->
按照惯例，所有 `Map` 的普适实现类都必须实现一个接受一个 `Map` 对象的构造器，而该构造器能将给定 `Map` 中的所有键值映射放入到新创建的 `Map` 中。
这个标准 `Map` 转换构造器和 `Collection` 的标准构造器类似：它使得使用者能够创建一个拥有特定实现类型且包含另一个 `Map` 中所有映射的 `Map`。
例如，假设你有一个名为 `m` 的 `Map`。如下这一行代码将创建一个与 `m` 拥有相同映射的 `HashMap`：

<pre class="brush: java">
Map&lt;K, V> copy = new HashMap&lt;K, V>(m);
</pre>

#### Map 接口批量操作

<!--
	The clear operation does exactly what you would think it could do: It removes all the mappings from the Map. The putAll operation is the Map analogue of the Collection interface's addAll operation. In addition to its obvious use of dumping one Map into another, it has a second, more subtle use. Suppose a Map is used to represent a collection of attribute-value pairs; the putAll operation, in combination with the Map conversion constructor, provides a neat way to implement attribute map creation with default values. The following is a static factory method that demonstrates this technique.
-->
`clear` 方法的行为和你料想的完全一致：它能从 `Map` 中移除所有映射。`putAll` 方法相当于 `Map` 版本的 `Collection.addAll` 方法。
除了这个如此明显的将一个 `Map` 丢到另一个 `Map` 的方法之外，还有另外一种更巧妙的做法。假设有一个 `Map` 被来表示属性值对的集合。
`putAll` 方法加上 `Map` 的转换构造器可以很方便地创建一个带有默认属性值的属性映射。下面这个静态工厂方法便展示了这项技巧：

<pre class="brush: java">
static &lt;K, V> Map&lt;K, V> newAttributeMap(Map&lt;K, V>defaults, Map&lt;K, V> overrides) {
    Map&lt;K, V> result = new HashMap&lt;K, V>(defaults);
    result.putAll(overrides);
    return result;
}
</pre>

#### 集合视图

<!--
	The Collection view methods allow a Map to be viewed as a Collection in these three ways:
-->
`Map` 的集合视图方法允许 `Map` 以如下三种方式被视作一个 `Collection`：

- `keySet`：`Map` 中的键组成的 `Set`。
- `values`：`Map` 中的值组成的 `Collection`。这个 `Collection` 并不是一个 `Set`，因为 `Map` 中的多个键可以映射至相同的值。
- `entrySet`：`Map` 中的键值对组成的 `Set`。`Map` 接口还提供了一个叫做 `Map.Entry` 的嵌套接口，它就是这个 `Set` 的元素类型。

<!--
	The Collection views provide the only means to iterate over a Map. This example illustrates the standard idiom for iterating over the keys in a Map with a for-each construct:
-->
`Map` 的集合视图**只是**为了提供迭代 `Map` 的方法。如下示例展示了如何使用 `for-each` 语句来迭代 `Map` 中的所有键：

<pre class="brush: java">
for (KeyType key : m.keySet())
    System.out.println(key);
</pre>

<!--
	and with an iterator:
-->
而如下示例则使用了一个迭代器：

<pre class="brush: java">
// 根据键的某些属性来过滤一个 Map
for (Iterator&lt;Type> it = m.keySet().iterator(); it.hasNext(); )
    if (it.next().isBogus())
        it.remove();
</pre>

<!--
	The idiom for iterating over values is analogous. Following is the idiom for iterating over key-value pairs.
-->
迭代值的方式也是类似的。如下示例迭代了 `Map` 中的键值对：

<pre class="brush: java">
for (Map.Entry&lt;KeyType, ValType> e : m.entrySet())
    System.out.println(e.getKey() + ": " + e.getValue());
</pre>

<!--
	At first, many people worry that these idioms may be slow because the Map has to create a new Collection instance each time a Collection view operation is called. Rest easy: There's no reason that a Map cannot always return the same object each time it is asked for a given Collection view. This is precisely what all the Map implementations in java.util do.
-->
一开始，很多人都会担心这种代码写法的性能不好，因为每次 `Map` 的集合视图方法被调用时都需要创建一个新的 `Collection` 示例。
不用担心，`Map` 没有理由不能每次都返回相同的`Collection` 对象啊。而事实上，`java.util` 包中的 `Map` 实现类确实也是这么做的。

<!--
	With all three Collection views, calling an Iterator's remove operation removes the associated entry from the backing Map, assuming that the backing Map supports element removal to begin with. This is illustrated by the preceding filtering idiom.
-->
假如所使用的 `Map` 支持的话，调用集合视图的 `Iterator` 的 `remove` 方法可以从 `Map` 中移除对应的键值对。

<!--
	With the entrySet view, it is also possible to change the value associated with a key by calling a Map.Entry's setValue method during iteration (again, assuming the Map supports value modification to begin with). Note that these are the only safe ways to modify a Map during iteration; the behavior is unspecified if the underlying Map is modified in any other way while the iteration is in progress.
-->
使用 `entrySet` 视图可以通过调用 `Map.Entry` 的 `setValue` 方法在迭代的过程中更改某个映射的值（假设该 `Map` 支持这样的值修改操作）。注意这是唯一一种在迭代中安全修改 `Map` 的方式，如果在迭代中 `Map` 经过其他方式被修改可能会产生不可预知的结果。

<!--
	The Collection views support element removal in all its many forms — remove, removeAll, retainAll, and clear operations, as well as the Iterator.remove operation. (Yet again, this assumes that the backing Map supports element removal.)
-->
所有的集合视图均完整支持所有形式的元素删除操作，包括 `remove`、`removeAll`、`retainAll` 和 `clear` 方法，以及对应的 `Iterator.remove` 方法。

<!--
	The Collection views do not support element addition under any circumstances. It would make no sense for the keySet and values views, and it's unnecessary for the entrySet view, because the backing Map's put and putAll methods provide the same functionality.
-->
在任何情况下，集合视图均不支持元素添加操作。这样的操作对 `keySet` 和 `values` 视图来说毫无意义，对 `entrySet` 视图来讲也没有必要，因为 `Map` 的 `put` 和 `putAll` 已经提供了这样的功能了。

#### 集合视图的炫酷用法：映射代数

<!--
	When applied to the Collection views, bulk operations (containsAll, removeAll, and retainAll) are surprisingly potent tools. For starters, suppose you want to know whether one Map is a submap of another — that is, whether the first Map contains all the key-value mappings in the second. The following idiom does the trick.
-->
当应用在集合视图上时，如 `containsAll`、`removeAll` 和 `retainAll` 的批量操作便变得十分有用了。比如，假设你想知道一个 `Map` 是否是另一个 `Map` 的子映射，
即第一个 `Map` 是否包含第二个 `Map` 的所有键值对。如下代码就能做到这一点：

<pre class="brush: java">
if (m1.entrySet().containsAll(m2.entrySet())) {
    ...
}
</pre>

<!--
	Along similar lines, suppose you want to know whether two Map objects contain mappings for all of the same keys.
-->
又比如，假设你想知道两个 `Map` 对象是否均包含的相同键的映射：

<pre class="brush: java">
if (m1.keySet().equals(m2.keySet())) {
    ...
}
</pre>

<!--
	Suppose you have a Map that represents a collection of attribute-value pairs, and two Sets representing required attributes and permissible attributes. (The permissible attributes include the required attributes.) The following snippet determines whether the attribute map conforms to these constraints and prints a detailed error message if it doesn't.
-->
假设你有一个表示属性值对集合的 `Map`，以及两个分别用来表示必需属性和可用属性的 `Set`（可用属性包括必需属性）。
如下代码将判断给定的属性映射是否满足这些约束并在不满足时打印出详细的错误信息：

<pre class="brush: java">
static &lt;K, V> boolean validate(Map&lt;K, V> attrMap, Set&lt;K> requiredAttrs, Set&lt;K>permittedAttrs) {
    boolean valid = true;
    Set&lt;K> attrs = attrMap.keySet();

    if (!attrs.containsAll(requiredAttrs)) {
        Set&lt;K> missing = new HashSet&lt;K>(requiredAttrs);
        missing.removeAll(attrs);
        System.out.println("Missing attributes: " + missing);
        valid = false;
    }
    if (!permittedAttrs.containsAll(attrs)) {
        Set&lt;K> illegal = new HashSet&lt;K>(attrs);
        illegal.removeAll(permittedAttrs);
        System.out.println("Illegal attributes: " + illegal);
        valid = false;
    }
    return valid;
}
</pre>

<!--
	Suppose you want to know all the keys common to two Map objects.
-->
假设你想要知道两个 `Map` 对象的公有键：

<pre class="brush: java">
Set&lt;KeyType>commonKeys = new HashSet&lt;KeyType>(m1.keySet());
commonKeys.retainAll(m2.keySet());
</pre>

<!--
	A similar idiom gets you the common values.
-->
使用类似的方法也可以帮助你得出两个 `Map` 对象的公有值。

<!--
	All the idioms presented thus far have been nondestructive; that is, they don't modify the backing Map. Here are a few that do. Suppose you want to remove all of the key-value pairs that one Map has in common with another.
-->
以上所有的代码示例都是非破坏性的，也就是说，它们不会修改原有的 `Map`。下面这些就不是了。假设你想要从一个 `Map` 中移除另一个 `Map` 包含的所有键值对：

<pre class="brush: java">
m1.entrySet().removeAll(m2.entrySet());
</pre>

<!--
	Suppose you want to remove from one Map all of the keys that have mappings in another.
-->
假设你想要从一个 `Map` 中移除另一个 `Map` 包含的所有键：

<pre class="brush: java">
m1.keySet().removeAll(m2.keySet());
</pre>

<!--
	What happens when you start mixing keys and values in the same bulk operation? Suppose you have a Map, managers, that maps each employee in a company to the employee's manager. We'll be deliberately vague about the types of the key and the value objects. It doesn't matter, as long as they're the same. Now suppose you want to know who all the "individual contributors" (or nonmanagers) are. The following snippet tells you exactly what you want to know.
-->
如果你在同一个批量操作中将键与值混在一起会怎么样呢？假设你有一个叫做 `managers` 的 `Map`，它将公司中的雇员映射到他们的经理。
这里我们故意模糊键与值的类型，但实际上这并不重要，你只要知道它们是一样的就可以了（译者注：经理也是雇员）。
现在假设你想知道谁不是经理。如下代码就能做到这一点：

<pre class="brush: java">
Set&lt;Employee> individualContributors = new HashSet&lt;Employee>(managers.keySet());
individualContributors.removeAll(managers.values());
</pre>

<!--
	Suppose you want to fire all the employees who report directly to some manager, Simon.
-->
假设你想要开除一个叫做 Simon 的经理的所有直接下属：

<pre class="brush: java">
Employee simon = ... ;
managers.values().removeAll(Collections.singleton(simon));
</pre>

<!--
	Note that this idiom makes use of Collections.singleton, a static factory method that returns an immutable Set with the single, specified element.
-->
注意该示例使用了 `Collections.singleton` 方法，这是一个可以为给定的单一元素返回一个不可变的 `Set` 的静态工厂方法。

<!--
	Once you've done this, you may have a bunch of employees whose managers no longer work for the company (if any of Simon's direct-reports were themselves managers). The following code will tell you which employees have managers who no longer works for the company.
-->
之后，你可能就会发现你的一些雇员的经理已经不在公司里了（如果 Simon 的直接下属也是经理）。下列代码会告诉你哪些雇员的经理已经离开了公司：

<pre class="brush: java">
Map&lt;Employee, Employee> m = new HashMap&lt;Employee, Employee>(managers);
m.values().removeAll(managers.keySet());
Set&lt;Employee> slackers = m.keySet();
</pre>

<!--
	This example is a bit tricky. First, it makes a temporary copy of the Map, and it removes from the temporary copy all entries whose (manager) value is a key in the original Map. Remember that the original Map has an entry for each employee. Thus, the remaining entries in the temporary Map comprise all the entries from the original Map whose (manager) values are no longer employees. The keys in the temporary copy, then, represent precisely the employees that we're looking for.
-->
这个示例比较复杂。首先，它创建了原有 `Map` 的一个临时拷贝，然后从临时拷贝将值（经理）同时为原 `Map` 的键的键值对移除。注意，在原本的 `Map` 中，每个雇员都有一个键值对。
因此，临时 `Map` 中剩余的键值对为原 `Map` 中所有值（经理）已不是该公司雇员的键值对。如此一来，临时拷贝中的键正好表示我们要找的雇员。

<!--
	There are many more idioms like the ones contained in this section, but it would be impractical and tedious to list them all. Once you get the hang of it, it's not that difficult to come up with the right one when you need it.
-->
在这一节中我们给出了许多类似的示例代码，但将这些代码全部列出是不现实的。只要你能掌握这些基本的示例，在你需要的时候写出正确的代码就不是那么难了。

#### 多重映射

<!--
	A multimap is like a Map but it can map each key to multiple values. The Java Collections Framework doesn't include an interface for multimaps because they aren't used all that commonly. It's a fairly simple matter to use a Map whose values are List instances as a multimap. This technique is demonstrated in the next code example, which reads a word list containing one word per line (all lowercase) and prints out all the anagram groups that meet a size criterion. An anagram group is a bunch of words, all of which contain exactly the same letters but in a different order. The program takes two arguments on the command line: (1) the name of the dictionary file and (2) the minimum size of anagram group to print out. Anagram groups containing fewer words than the specified minimum are not printed.
-->
**多重映射**（Multimap）和 `Map` 类似，但它能将每个键映射到多个值。Java 集合框架中并不提供多重映射的相关接口，因为它们也不是那么常使用到。
一个值为 `List` 实例的 `Map` 即可被简单地视作一个多重映射。下面的代码示例就展示了这种做法。该代码示例将会读入一个每行只有一个小写单词的单词列表，
并输出所有满足一定大小条件的变形词组。一个变形词组（Anagram Group）由若干个单词组成，这些单词都包含相同的字母但各自的顺序不同。
示例程序从命令行中接受两个参数：字典文件的名称以及输出变形词组的最小大小。大小小于给定最小值的变形词组将不会被输出。

<!--
	There is a standard trick for finding anagram groups: For each word in the dictionary, alphabetize the letters in the word (that is, reorder the word's letters into alphabetical order) and put an entry into a multimap, mapping the alphabetized word to the original word. For example, the word bad causes an entry mapping abd into bad to be put into the multimap. A moment's reflection will show that all the words to which any given key maps form an anagram group. It's a simple matter to iterate over the keys in the multimap, printing out each anagram group that meets the size constraint.
-->
要找到这些变形词组实际上是有标准的做法的：对于字典中的每个单词，首先对单词中的字母按字母顺序进行排序，再将一个从排序后的单词映射到原单词的键值对放入到一个多重映射中。
例如，单词 `bad` 将会产生一个从 `abd` 映射到 `bad` 的键值对并被放入到多重映射中。稍微想一下就能知道，最后某个给定的单词所映射到的单词们即刚好能组成一个变形词组。
迭代多重映射中的键并输出符合大小约束的变形词组就不是什么难事了。

<!--
	The following program is a straightforward implementation of this technique.
-->
[下面的程序](http://docs.oracle.com/javase/tutorial/collections/interfaces/examples/Anagrams.java)直观地实现了这一功能：

<pre class="brush: java">
import java.util.*;
import java.io.*;

public class Anagrams {
    public static void main(String[] args) {
        int minGroupSize = Integer.parseInt(args[1]);

        // Read words from file and put into a simulated multimap
        Map&lt;String, List&lt;String>> m = new HashMap&lt;String, List&lt;String>>();

        try {
            Scanner s = new Scanner(new File(args[0]));
            while (s.hasNext()) {
                String word = s.next();
                String alpha = alphabetize(word);
                List&lt;String> l = m.get(alpha);
                if (l == null)
                    m.put(alpha, l=new ArrayList&lt;String>());
                l.add(word);
            }
        } catch (IOException e) {
            System.err.println(e);
            System.exit(1);
        }

        // Print all permutation groups above size threshold
        for (List&lt;String> l : m.values())
            if (l.size() >= minGroupSize)
                System.out.println(l.size() + ": " + l);
    }

    private static String alphabetize(String s) {
        char[] a = s.toCharArray();
        Arrays.sort(a);
        return new String(a);
    }
}
</pre>

<!--
	Running this program on a 173,000-word dictionary file with a minimum anagram group size of eight produces the following output.
-->
给定一个包含 `173,000` 个单词的字典文件以及输出变形词组的最小大小为 `8`，那么程序将产生如下输出：

<pre>
9: [estrin, inerts, insert, inters, niters, nitres, sinter,
     triens, trines]
8: [lapse, leaps, pales, peals, pleas, salep, sepal, spale]
8: [aspers, parses, passer, prases, repass, spares, sparse,
     spears]
10: [least, setal, slate, stale, steal, stela, taels, tales,
      teals, tesla]
8: [enters, nester, renest, rentes, resent, tenser, ternes,
     treens]
8: [arles, earls, lares, laser, lears, rales, reals, seral]
8: [earings, erasing, gainers, reagins, regains, reginas,
     searing, seringa]
8: [peris, piers, pries, prise, ripes, speir, spier, spire]
12: [apers, apres, asper, pares, parse, pears, prase, presa,
      rapes, reaps, spare, spear]
11: [alerts, alters, artels, estral, laster, ratels, salter,
      slater, staler, stelar, talers]
9: [capers, crapes, escarp, pacers, parsec, recaps, scrape,
     secpar, spacer]
9: [palest, palets, pastel, petals, plates, pleats, septal,
     staple, tepals]
9: [anestri, antsier, nastier, ratines, retains, retinas,
     retsina, stainer, stearin]
8: [ates, east, eats, etas, sate, seat, seta, teas]
8: [carets, cartes, caster, caters, crates, reacts, recast,
     traces]
</pre>

<!--
	Many of these words seem a bit bogus, but that's not the program's fault; they're in the dictionary file. Here's the dictionary file we used. It was derived from the Public Domain ENABLE benchmark reference word list.
-->
这里面有些单词看起来像是伪造的，但这并不是程序的错，它们确实存在于字典文件中。
这个就是我们使用的[字典文件](http://docs.oracle.com/javase/tutorial/collections/interfaces/examples/dictionary.txt)，
它是根据公用基准测试单词列表生成的。

---

<h3 id="order">2.7 元素排序</h3>

列表 `l` 可这样进行排序：

<pre class="brush: java">
Collections.sort(l);
</pre>

<!--
	If the List consists of String elements, it will be sorted into alphabetical order. If it consists of Date elements, it will be sorted into chronological order. How does this happen? String and Date both implement the Comparable interface. Comparable implementations provide a natural ordering for a class, which allows objects of that class to be sorted automatically. The following table summarizes some of the more important Java platform classes that implement Comparable.
-->
如果这个 `List` 包含的元素为 `String`，那么它们将会按字典序排序。如果包含的是 `Date` 元素，那么它们会按时间先后排序。为什么会这样呢？
`String` 和 `Date` 均实现了 `Comparable` 接口。`Comparable` 接口的实现类均会为该类提供一种**自然顺序**（Natural Ordering），这就使得该类的对象可以被自动排序。
下表总结了 Java 中比较重要的 `Comparable` 实现类：

<table class="table">
	<caption align="top"><b><code>Comparable</code> 实现类</b></caption>
	<tr>
		<th>类</th>
		<th>自然顺序</th>
	</tr>
	<tr>
		<td><code>Byte</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>Character</code></td>
		<td>无符号数字</td>
	</tr>
	<tr>
		<td><code>Long</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>Integer</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>Short</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>Double</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>Float</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>BigInteger</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>BigDecimal</code></td>
		<td>有符号数字</td>
	</tr>
	<tr>
		<td><code>Boolean</code></td>
		<td><code>Boolean.FALSE &lt; Boolean.TRUE</code></td>
	</tr>
	<tr>
		<td><code>File</code></td>
		<td>根据系统的字典序对路径名排序</td>
	</tr>
	<tr>
		<td><code>String</code></td>
		<td>字典序</td>
	</tr>
	<tr>
		<td><code>Date</code></td>
		<td>时间序</td>
	</tr>
	<tr>
		<td><code>CollationKey</code></td>
		<td>根据所选方言（）进行字典排序</td>
	</tr>
</table>

<!--
	If you try to sort a list, the elements of which do not implement Comparable, Collections.sort(list) will throw a ClassCastException. Similarly, Collections.sort(list, comparator) will throw a ClassCastException if you try to sort a list whose elements cannot be compared to one another using the comparator. Elements that can be compared to one another are called mutually comparable. Although elements of different types may be mutually comparable, none of the classes listed here permit interclass comparison.
-->
如果你尝试对一个元素没有实现 `Comparable` 的列表进行排序，`Collections.sort(list)` 将抛出一个 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/lang/ClassCastException.html">ClassCastException</a></code>。
同样，如果给定的比较器不能用于比较列表中的元素时，`Collections.sort(list, comparator)` 也会抛出一个 `ClassCastException`。
尽管不同类型的元素可能可以相互比较，但上面给出的这些类都不支持跨类比较。

<!--
	This is all you really need to know about the Comparable interface if you just want to sort lists of comparable elements or to create sorted collections of them. The next section will be of interest to you if you want to implement your own Comparable type.
-->
如果你只是想为 `Comparable` 元素组成的列表进行排序或者创建一个由它们组成的有序集合，那么你已经足够了解 `Comparable` 接口了。
在下一节里我们将讨论如何实现你自己的 `Comparable` 类型。

#### 实现自己的 Comparable 类型

<!--
	The Comparable interface consists of the following method.
-->

`Comparable` 接口包含如下方法：

<pre class="brush: java">
public interface Comparable&lt;T> {
    public int compareTo(T o);
}
</pre>

<!--
	The compareTo method compares the receiving object with the specified object and returns a negative integer, 0, or a positive integer depending on whether the receiving object is less than, equal to, or greater than the specified object. If the specified object cannot be compared to the receiving object, the method throws a ClassCastException.
-->
`compareTo` 方法将比较被调用的对象和参数传入的对象，并在参数传入的对象小于、等于或大于被调用的对象的时候返回负数、0 或正数。
如果被调用的对象无法与参数传入的对象相比较，方法将抛出 `ClassCastException`。

<!--
	The following class representing a person's name implements Comparable.
-->
[下面这个表示一个人的名称的类](http://docs.oracle.com/javase/tutorial/collections/interfaces/examples/Name.java)实现了 `Comparable` 接口：

<pre class="brush: java">
import java.util.*;

public class Name implements Comparable&lt;Name> {
    private final String firstName, lastName;

    public Name(String firstName, String lastName) {
        if (firstName == null || lastName == null)
            throw new NullPointerException();
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String firstName() { return firstName; }
    public String lastName()  { return lastName;  }

    public boolean equals(Object o) {
        if (!(o instanceof Name))
            return false;
        Name n = (Name) o;
        return n.firstName.equals(firstName) && n.lastName.equals(lastName);
    }

    public int hashCode() {
        return 31*firstName.hashCode() + lastName.hashCode();
    }

    public String toString() {
	return firstName + " " + lastName;
    }

    public int compareTo(Name n) {
        int lastCmp = lastName.compareTo(n.lastName);
        return (lastCmp != 0 ? lastCmp : firstName.compareTo(n.firstName));
    }
}
</pre>

<!--
	To keep the preceding example short, the class is somewhat limited: It doesn't support middle names, it demands both a first and a last name, and it is not internationalized in any way. Nonetheless, it illustrates the following important points:
-->
为保持简短，这个类还是存在一定限制的：它并不支持中名（Middle Name），只需要传入名和姓，而且也不支持任何形式的国际化。
不管怎么说，这个示例还是展示了如下几点：

- `Name` 对象是不可变的。在其他因素保持不变时，不可变类型是一个不错的选择，尤其是这些对象可能被用作 `Set` 的元素或是 `Map` 的键时。
  如果对象在这些集合中的时候被修改的话，这些集合本身的特性就会被打破。
- 构造器对传入参数执行了 `null` 值检查。这么做确保了所有的 `Name` 对象都是良构的，也确保了其他方法不会抛出 `NullPointerException`。
- 重新定义了 `hashCode` 方法。对于重新定义了 `equals` 方法的类来说这是必须的。（相等的对象应拥有相同的哈希码。）
- 若给定的对象为 `null` 或类型不符时，`equals` 方法返回 `false`，而在这种情况下 `compareTo` 方法则会抛出一个运行时异常。
  这些行为都是两个方法在各自的文档中所声明且必须遵循的。
- `toString` 方法被重新定义以将 `Name` 对象以更可读的形式输出。这是很不错的做法，尤其是对那些会被放入到集合中的对象来说。
  各种不同的集合类型的 `toString` 方法均依赖于它们的元素、键或值的 `toString` 方法。

<!--
	Since this section is about element ordering, let's talk a bit more about Name's compareTo method. It implements the standard name-ordering algorithm, where last names take precedence over first names. This is exactly what you want in a natural ordering. It would be very confusing indeed if the natural ordering were unnatural!
-->
既然这一节是有关元素顺序的，我们就来多聊聊 `Name` 的 `compareTo` 方法吧。它实现了标准的名称排序算法，先考虑姓再考虑名。
这正是你想要在自然顺序中看到的特性。如果自然顺序变得不自然的话就会显得很奇怪了。

<!--
	Take a look at how compareTo is implemented, because it's quite typical. First, you compare the most significant part of the object (in this case, the last name). Often, you can just use the natural ordering of the part's type. In this case, the part is a String and the natural (lexicographic) ordering is exactly what's called for. If the comparison results in anything other than zero, which represents equality, you're done: You just return the result. If the most significant parts are equal, you go on to compare the next most-significant parts. In this case, there are only two parts — first name and last name. If there were more parts, you'd proceed in the obvious fashion, comparing parts until you found two that weren't equal or you were comparing the least-significant parts, at which point you'd return the result of the comparison.
-->
我们来看看 `compareTo` 方法是怎么实现的。首先，你要对对象中最关键的部分进行比较（`Name` 的姓）。有时，你还可以直接使用这部分的类型的自然顺序。
在示例中，该部分的类型为 `String`，而它的自然顺序（字典序）正是我们所需要的。如果比较的结果不是表示相等的 0，那你就完事了：你可以直接返回该结果。
如果该部分是相等的，那你就需要去比较下一个部分了。在这个示例中，`Name` 类只包含两个部分：姓和名。如果你需要比较的类中有更多的域，
那你同样需要以这样的顺序一直比较下去，直到你找到不相等的域或是在比较最后一个域后返回比较的结果。

<!--
	Just to show that it all works, here's a program that builds a list of names and sorts them.
-->
如下是一个创建了一个名称列表并将其进行排序的[程序实例](http://docs.oracle.com/javase/tutorial/collections/interfaces/examples/NameSort.java)：

<pre class="brush: java">
import java.util.*;

public class NameSort {
    public static void main(String[] args) {
        Name nameArray[] = {
            new Name("John", "Smith"),
            new Name("Karl", "Ng"),
            new Name("Jeff", "Smith"),
            new Name("Tom", "Rich")
        };

        List&lt;Name> names = Arrays.asList(nameArray);
        Collections.sort(names);
        System.out.println(names);
    }
}
</pre>

运行程序将输出如下结果：

<pre>
[Karl Ng, Tom Rich, Jeff Smith, John Smith]
</pre>

<!--
	There are four restrictions on the behavior of the compareTo method, which we won't go into now because they're fairly technical and boring and are better left in the API documentation. It's really important that all classes that implement Comparable obey these restrictions, so read the documentation for Comparable if you're writing a class that implements it. Attempting to sort a list of objects that violate the restrictions has undefined behavior. Technically speaking, these restrictions ensure that the natural ordering is a total order on the objects of a class that implements it; this is necessary to ensure that sorting is well defined.
-->
实际上，`compareTo` 方法的行为存在着四项约束。这些约束更多是从技术层面上对其行为进行约束，我们不会在这里对其进行详述，我们认为将其放到 API 文档中会是更好的选择。
实现了 `Comparable` 的类型必须遵循这些约束，因此当你想要自己编写一个实现 `Comparable` 的类时，记得去阅读一下 `Comparable` 的接口。
企图对违反了这些约束的对象进行排序将产生不可预料的结果。从技术上来讲，这些约束是为了保证 `compareTo` 所提供的自然顺序关系同样也是对这些对象的**全序关系**（Total Order）。为了正确定义如何对这些对象进行排序，这么做是必须的。

#### 比较器

<!--
	What if you want to sort some objects in an order other than their natural ordering? Or what if you want to sort some objects that don't implement Comparable? To do either of these things, you'll need to provide a Comparator — an object that encapsulates an ordering. Like the Comparable interface, the Comparator interface consists of a single method.
-->
如果你不想按对象的自然顺序进行排序怎么办？或者你想要对一些没有实现 `Comparable` 的对象进行排序怎么办？
要做到这样的事，你需要提供一个 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/Comparator.html">Comparator</a></code>，一个封装了对象顺序的对象。
正如 `Comparable` 接口，`Comparator` 接口也只包含了一个方法：

<pre class="brush: java">
public interface Comparator&lt;T> {
    int compare(T o1, T o2);
}
</pre>

<!--
	The compare method compares its two arguments, returning a negative integer, 0, or a positive integer depending on whether the first argument is less than, equal to, or greater than the second. If either of the arguments has an inappropriate type for the Comparator, the compare method throws a ClassCastException.
-->
`compare` 方法接受两个参数，并在第一个参数小于、等于或大于第二个参数的时候返回负数、0 或正数。如果参数的类型不符，`compare` 方法将抛出 `ClassCastException`。

<!--
	Much of what was said about Comparable applies to Comparator as well. Writing a compare method is nearly identical to writing a compareTo method, except that the former gets both objects passed in as arguments. The compare method has to obey the same four technical restrictions as Comparable's compareTo method for the same reason — a Comparator must induce a total order on the objects it compares.
-->
之前提到的有关 `Comparable` 的事基本都适用于 `Comparator`。除了 `compare` 方法以参数的形式接受两个将要被比较的对象，
实现 `compare` 方法和实现 `compareTo` 方法基本没什么不同。`compare` 方法同样需要遵循 `Comparable` 的 `compareTo` 方法的四项约束，
原因也相同：`Comparator` 必须提供其将比较的对象的全序关系。

假设你有一个叫 `Employee` 的类如下：

<pre class="brush: java">
public class Employee implements Comparable&lt;Employee> {
    public Name name()     { ... }
    public int number()    { ... }
    public Date hireDate() { ... }
       ...
}
</pre>

<!--
	Let's assume that the natural ordering of Employee instances is Name ordering (as defined in the previous example) on employee name. Unfortunately, the boss has asked for a list of employees in order of seniority. This means we have to do some work, but not much. The following program will produce the required list.
-->
假设 `Employee` 的自然顺序即为它们的名称的 `Name` 自然顺序。不幸的是，你的上司想要一个按资历排序的员工列表。那么我们就需要多做些工作了。
如下程序将产生所需的列表：

<pre class="brush: java">
import java.util.*;
public class EmpSort {
    static final Comparator&lt;Employee> SENIORITY_ORDER = 
                                        new Comparator&lt;Employee>() {
            public int compare(Employee e1, Employee e2) {
                return e2.hireDate().compareTo(e1.hireDate());
            }
    };

    // Employee database
    static final Collection&lt;Employee> employees = ... ;

    public static void main(String[] args) {
        List&lt;Employee> e = new ArrayList&lt;Employee>(employees);
        Collections.sort(e, SENIORITY_ORDER);
        System.out.println(e);
    }
}
</pre>

<!--
	The Comparator in the program is reasonably straightforward. It relies on the natural ordering of Date applied to the values returned by the hireDate accessor method. Note that the Comparator passes the hire date of its second argument to its first rather than vice versa. The reason is that the employee who was hired most recently is the least senior; sorting in the order of hire date would put the list in reverse seniority order. Another technique people sometimes use to achieve this effect is to maintain the argument order but to negate the result of the comparison.
-->
示例程序中的 `Comparator` 应该已经相当直观了。它依赖于 `hireDate` 方法返回的 `Date` 的自然顺序。注意，`Comparator` 将第一个参数的 `Date` 传递给了第二个参数的 `Date`
而并不是反过来。这么做的原因在于，最近被雇佣的员工自然是最没有资历的，按照任职日期对员工进行排序则正好与我们想要的顺序相反了。
除此之外，人们还常常试图对比较的结果取反以达成相同的效果：

<pre class="brush: java">
// 不要这么做！！
return -r1.hireDate().compareTo(r2.hireDate());
</pre>

<!--
	You should always use the former technique in favor of the latter because the latter is not guaranteed to work. The reason for this is that the compareTo method can return any negative int if its argument is less than the object on which it is invoked. There is one negative int that remains negative when negated, strange as it may seem.
-->
你应该尽量使用之前的做法，因为后一种做法并不一定能正常工作。原因在于，当参数小于被调用的对象时，`compareTo` 方法可以返回任何负整数。
也许听起来很奇怪，但有那么一个负整数在取反后仍然为负：

<pre class="brush: java">
-Integer.MIN_VALUE == Integer.MIN_VALUE
</pre>

<!--
	The Comparator in the preceding program works fine for sorting a List, but it does have one deficiency: It cannot be used to order a sorted collection, such as TreeSet, because it generates an ordering that is not compatible with equals. This means that this Comparator equates objects that the equals method does not. In particular, any two employees who were hired on the same date will compare as equal. When you're sorting a List, this doesn't matter; but when you're using the Comparator to order a sorted collection, it's fatal. If you use this Comparator to insert multiple employees hired on the same date into a TreeSet, only the first one will be added to the set; the second will be seen as a duplicate element and will be ignored.
-->
在对 `List` 进行排序时，之前的示例程序中的 `Comparator` 将表现良好，但它仍有一点不足：
它不能用于为一个如 `TreeSet` 的有序集合提供元素顺序，因为它产生的顺序与 `equals` 不相容。
意思是说，当 `equals` 方法认为两个对象不相等时，这个 `Comparator` 认为它们相等：两个在同一天被雇佣的雇员在这个 `Comparator` 眼里是相等的。
如果你只是在为一个 `List` 进行排序，这没有什么问题，但如果你想要用这个 `Comparator` 为一个有序集合提供元素顺序，那就有大问题了。
如果你使用了该 `Comparator` 然后向 `TreeSet` 中插入多个在同一天被雇佣的雇员，那么只有第一个雇员会被成功添加，其他的雇员均会被视作重复元素而被忽略。

<!--
	To fix this problem, simply tweak the Comparator so that it produces an ordering that is compatible with equals. In other words, tweak it so that the only elements seen as equal when using compare are those that are also seen as equal when compared using equals. The way to do this is to perform a two-part comparison (as for Name), where the first part is the one we're interested in — in this case, the hire date — and the second part is an attribute that uniquely identifies the object. Here the employee number is the obvious attribute. This is the Comparator that results.
-->
要解决这个问题，我们只需要对 `Comparator` 进行修改使其产生的元素顺序能与 `equals` 方法相容就好了。也就是说，我们要对其进行修改使其认为相等的元素恰好是 `equals` 方法也认为相等的元素。我们可以在 `Comparator` 中执行两次比较，其中第一次对我们感兴趣的雇佣日期进行比较，而第二次则对唯一标识每个对象的属性进行比较。
员工号是个不错的选择。如下即为改动后的 `Comparator`：

<pre class="brush: java">
static final Comparator&lt;Employee> SENIORITY_ORDER = 
                                        new Comparator&lt;Employee>() {
    public int compare(Employee e1, Employee e2) {
        int dateCmp = e2.hireDate().compareTo(e1.hireDate());
        if (dateCmp != 0)
            return dateCmp;

        return (e1.number() &lt; e2.number() ? -1 :
               (e1.number() == e2.number() ? 0 : 1));
    }
};
</pre>

<!--
	One last note: You might be tempted to replace the final return statement in the Comparator with the simpler:
-->
最后，你可能会想要将 `Comparator` 最后的 `return` 语句变成这个样子：

<pre class="brush: java">
return e1.number() - e2.number();
</pre>

<!--
	Don't do it unless you're absolutely sure no one will ever have a negative employee number! This trick does not work in general because the signed integer type is not big enough to represent the difference of two arbitrary signed integers. If i is a large positive integer and j is a large negative integer, i - j will overflow and will return a negative integer. The resulting comparator violates one of the four technical restrictions we keep talking about (transitivity) and produces horrible, subtle bugs. This is not a purely theoretical concern; people get burned by it.
-->
千万不要这么做，除非你绝对确定没人的员工号会是负值。实际上，有符号整型数的范围并没有大到足以表示任意两个有符号整型数的差值。
如果 `i` 是一个很大的正数而 `j` 是一个很小的负数，那么 `i - j` 则有可能溢出并返回负值。这样一来，这个 `Comparator` 就违反了其中一个我们一直在说的约束了（传递性），
而且会产生出些很微妙的 bug。

---

<h3 id="sorted-set">2.8 SortedSet 接口</h3>

<!--
	A SortedSet is a Set that maintains its elements in ascending order, sorted according to the elements' natural ordering or according to a Comparator provided at SortedSet creation time. In addition to the normal Set operations, the SortedSet interface provides operations for the following:
-->
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/SortedSet.html">SortedSet</a></code> 为以升序对元素进行排列的 `Set`，
它将根据元素的自然顺序或在构建时提供的 `Comparator` 对元素进行排列。除了基本的 `Set` 操作，`SortedSet` 接口还提供了如下几个操作：

- 范围视图：允许对有序集进行任意的范围操作；
- 端点：返回有序集的第一个或最后一个元素；
- 访问 `Comparator`：返回有序集所使用的 `Comparator`。

`SortedSet` 的代码如下所示：

<pre class="brush: java">
public interface SortedSet&lt;E> extends Set&lt;E> {
    // Range-view
    SortedSet&lt;E> subSet(E fromElement, E toElement);
    SortedSet&lt;E> headSet(E toElement);
    SortedSet&lt;E> tailSet(E fromElement);

    // Endpoints
    E first();
    E last();

    // Comparator access
    Comparator&lt;? super E> comparator();
}
</pre>

#### 集操作

除了如下两点外，`SortedSet` 从 `Set` 继承而来的操作行为完全一致：

- `iterator` 方法返回的 `Iterator` 将按照有序集的顺序遍历元素；
- `toArray` 方法返回的数组将按照有序集的顺序排列元素。

<!--
	Although the interface doesn't guarantee it, the toString method of the Java platform's SortedSet implementations returns a string containing all the elements of the sorted set, in order.
-->
尽管接口本身并没有给出这样的承诺，但 Java 中所有的 `SortedSet` 实现类的 `toString` 方法返回的字符串同样会以有序集的顺序排列元素。

#### 标准构造器

<!--
	By convention, all general-purpose Collection implementations provide a standard conversion constructor that takes a Collection; SortedSet implementations are no exception. In TreeSet, this constructor creates an instance that sorts its elements according to their natural ordering. This was probably a mistake. It would have been better to check dynamically to see whether the specified collection was a SortedSet instance and, if so, to sort the new TreeSet according to the same criterion (comparator or natural ordering). Because TreeSet took the approach that it did, it also provides a constructor that takes a SortedSet and returns a new TreeSet containing the same elements sorted according to the same criterion. Note that it is the compile-time type of the argument, not its runtime type, that determines which of these two constructors is invoked (and whether the sorting criterion is preserved).
-->
按照惯例，所有的 `Collection` 普适实现类都必须提供一个接受一个 `Collection` 参数的标准转换构造器。`SortedSet` 的实现类也不例外。
`TreeSet` 的这个构造器将构造一个将元素按其自然顺序进行排列的实例。这看起来像是一个设计失误。也许，我们更应该动态地判断给定的集合是不是一个 `SortedSet`，
如果是的话则让新的 `TreeSet` 采用相同的元素排列顺序。正是由于 `TreeSet` 没有这么做，它还提供了一个接受 `SortedSet` 的构造器，
这个构造器所构建的 `TreeSet` 就会采用和给定 `SortedSet` 相同的元素排列顺序了。
注意，取决调用哪个构造器且是否保留原有排列方式的将会是参数的编译时类型，而不是其运行时类型。

<!--
	SortedSet implementations also provide, by convention, a constructor that takes a Comparator and returns an empty set sorted according to the specified Comparator. If null is passed to this constructor, it returns a set that sorts its elements according to their natural ordering.
-->
按照惯例，`SortedSet` 的实现类同样提供了一个接受一个 `Comparator` 并返回一个空的按照该给定 `Comparator` 排列元素的有序集的构造器。
如果给定的 `Comparator` 为 `null`，新的有序集将以元素的自然顺序对其进行排列。

#### 范围视图操作

<!--
	The range-view operations are somewhat analogous to those provided by the List interface, but there is one big difference. Range views of a sorted set remain valid even if the backing sorted set is modified directly. This is feasible because the endpoints of a range view of a sorted set are absolute points in the element space rather than specific elements in the backing collection, as is the case for lists. A range-view of a sorted set is really just a window onto whatever portion of the set lies in the designated part of the element space. Changes to the range-view write back to the backing sorted set and vice versa. Thus, it's okay to use range-views on sorted sets for long periods of time, unlike range-views on lists.
-->
`SortedSet` 的范围视图操作看起来和 `List` 接口的有点像，实则不然。即使是原本的有序集发生了变化，它的范围视图仍将保持可用。
这是因为，有序集范围视图的端点并不是有序集中的某个确定的元素，而是元素空间中的一个绝对点。有序集的范围视图不过是对其元素空间的某个部分所开辟的窗口。
对范围视图做出的修改同样会写入到有序集里，反之亦然。因此，与 `List` 的范围视图不同，长时间持有并使用有序集的范围视图是没有问题的。

<!--
	Sorted sets provide three range-view operations. The first, subSet, takes two endpoints, like subList. Rather than indices, the endpoints are objects and must be comparable to the elements in the sorted set, using the Set's Comparator or the natural ordering of its elements, whichever the Set uses to order itself. Like subList, the range is half open, including its low endpoint but excluding the high one.
-->
有序集提供了三个范围视图操作。`subSet` 方法如同 `subList` 方法接受两个断点。比起接受元素索引值，
`subSet` 方法接受的端点为两个可以使用有序集的 `Comparator` 或元素的自然顺序与有序集中的元素进行比较的对象。
如 `subList`，`subSet` 返回的范围是半开放的：下界端点将被包含，而上界端点则不会被包含。

<!--
	Thus, the following line of code tells you how many words between "doorbell" and "pickle", including "doorbell" but excluding "pickle", are contained in a SortedSet of strings called dictionary:
-->
因此，如下代码将告诉你在一个叫做 `dictionary` 的由字符串组成的 `SortedSet` 中有多少单词在 `doorbell` 和 `pickle` 之间，包含 `doorbell` 但不包含 `pickle`：

<pre class="brush: java">
int count = dictionary.subSet("doorbell", "pickle").size();
</pre>

<!--
	In like manner, the following one-liner removes all the elements beginning with the letter f.
-->
同样，如下代码将移除所有以 `f` 字母开头的元素：

<pre class="brush: java">
dictionary.subSet("f", "g").clear();
</pre>

<!--
	A similar trick can be used to print a table telling you how many words begin with each letter.
-->
类似的，如下代码能够打印出一个表格，告诉你以各个字母开头的单词都有哪些：

<pre class="brush: java">
for (char ch = 'a'; ch &lt;= 'z'; ) {
    String from = String.valueOf(ch++);
    String to = String.valueOf(ch);
    System.out.println(from + ": " + dictionary.subSet(from, to).size());
}
</pre>

<!--
	Suppose you want to view a closed interval, which contains both of its endpoints, instead of an open interval. If the element type allows for the calculation of the successor of a given value in the element space, merely request the subSet from lowEndpoint to successor(highEndpoint). Although it isn't entirely obvious, the successor of a string s in String's natural ordering is s + "\0" — that is, s with a null character appended.
-->
假设你想要获取一个包含两个端点的闭区间视图，而不是默认的半开区间。如果可以为元素类型都某个值计算其在元素空间上的后继值，
那么你只要计算从 `lowEndpoint` 到 `successor(highEndpoint)` 的 `subSet` 就好了。尽管也不是那么明显，但字符串 `s` 的后继值为 `s + "\0"`。

<!--
	Thus, the following one-liner tells you how many words between "doorbell" and "pickle", including doorbell and pickle, are contained in the dictionary.
-->
因此，下列代码能告诉你 `dictionary` 中有多少单词位于 `doorbell` 和 `pickle` 之间，包括 `doorbell` 和 `pickle`：

<pre class="brush: java">
count = dictionary.subSet("doorbell", "pickle\0").size();
</pre>

<!--
	A similar technique can be used to view an open interval, which contains neither endpoint. The open-interval view from lowEndpoint to highEndpoint is the half-open interval from successor(lowEndpoint) to highEndpoint. Use the following to calculate the number of words between "doorbell" and "pickle", excluding both.
-->
你也可以使用类似的方式获取一个不包含两个端点的开区间视图，你只要将半开区间从 `lowEndpoint` 到 `highEndpoint` 的参数改为
`successor(lowEndpoint)` 到 `highEndpoing` 就可以了。下列代码可以计算 `dictionary` 中有多少单词位于 `doorbell` 和 `pickle` 之间，不包括 `doorbell` 和 `pickle`：

<pre class="brush: java">
count = dictionary.subSet("doorbell\0", "pickle").size();
</pre>

<!--
	The SortedSet interface contains two more range-view operations — headSet and tailSet, both of which take a single Object argument. The former returns a view of the initial portion of the backing SortedSet, up to but not including the specified object. The latter returns a view of the final portion of the backing SortedSet, beginning with the specified object and continuing to the end of the backing SortedSet. Thus, the following code allows you to view the dictionary as two disjoint volumes (a-m and n-z).
-->
`SortedSet` 接口还包含另外两个范围视图操作：`headSet` 和 `tailSet`，两个方法都只接受一个 `Object` 参数。
前一个方法将返回给定 `SortedSet` 从开头到，但不包括，给定对象的那部分的视图。
后一个方法则返回给定 `SortedSet` 从给定对象到结尾那部分的视图。因此，下述代码可以让你将 `dictionary` 视作两个互不相交的 `volumn`（`a-m` 和 `n-z`）：

<pre class="brush: java">
SortedSet&lt;String> volume1 = dictionary.headSet("n");
SortedSet&lt;String> volume2 = dictionary.tailSet("n");
</pre>

#### 断点操作

<!--
	The SortedSet interface contains operations to return the first and last elements in the sorted set, not surprisingly called first and last. In addition to their obvious uses, last allows a workaround for a deficiency in the SortedSet interface. One thing you'd like to do with a SortedSet is to go into the interior of the Set and iterate forward or backward. It's easy enough to go forward from the interior: Just get a tailSet and iterate over it. Unfortunately, there's no easy way to go backward.
-->

<!--
	The following idiom obtains the first element that is less than a specified object o in the element space.
-->

<pre class="brush: java">
Object predecessor = ss.headSet(o).last();
</pre>

<!--
	This is a fine way to go one element backward from a point in the interior of a sorted set. It could be applied repeatedly to iterate backward, but this is very inefficient, requiring a lookup for each element returned.
-->

#### 比较器访问操作

<!--
	The SortedSet interface contains an accessor method called comparator that returns the Comparator used to sort the set, or null if the set is sorted according to the natural ordering of its elements. This method is provided so that sorted sets can be copied into new sorted sets with the same ordering. It is used by the SortedSet constructor described previously.
-->

---

<h3 id="sorted-map">2.9 SortedMap 接口</h3>

<!--
	A SortedMap is a Map that maintains its entries in ascending order, sorted according to the keys' natural ordering, or according to a Comparator provided at the time of the SortedMap creation. Natural ordering and Comparators are discussed in the Object Ordering section. The SortedMap interface provides operations for normal Map operations and for the following:
-->

<!--
	The following interface is the Map analog of SortedSet.
-->

<pre class="brush: java">
public interface SortedMap&lt;K, V> extends Map&lt;K, V>{
    Comparator&lt;? super K> comparator();
    SortedMap&lt;K, V> subMap(K fromKey, K toKey);
    SortedMap&lt;K, V> headMap(K toKey);
    SortedMap&lt;K, V> tailMap(K fromKey);
    K firstKey();
    K lastKey();
}
</pre>

#### 映射操作



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

<!--
	The Stream.reduce method is a general-purpose reduction operation. Consider the following pipeline, which calculates the sum of the male members' ages in the collection roster. It uses the Stream.sum reduction operation:
-->
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html#reduce-T-java.util.function.BinaryOperator-">Stream.reduce</a></code> 方法是一个普适的归约操作。考虑如下流水线，它计算了集合 `roster` 中所有用户的年龄总和。该流水线使用了 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/IntStream.html#sum--">Stream.sum</a></code> 归约操作：

<pre class="brush: java">
Integer totalAge = roster.stream().mapToInt(Person::getAge).sum();
</pre>

<!--
	Compare this with the following pipeline, which uses the Stream.reduce operation to calculate the same value:
-->
我们可以将其与以下流水线相对比，该流水线使用 `Stream.reduce` 操作计算相同的值：

<pre class="brush: java">
Integer totalAgeReduce =
    roster.stream().map(Person::getAge)
                   .reduce(0, (a, b) -> a + b);
</pre>

<!--
	The reduce operation in this example takes two arguments:
-->
示例中的 `reduce` 操作接受两个参数：

- `identity`：单位元（Identity Element）即是归约操作的起始值，也是当流为空时的默认结果值。在示例中，单位元为 `0`，它是年龄求和操作的起始值，也是当集合 `roster` 为空时应该返回的默认值。
- `accumulator`：累积函数（Accumulator Function）接受两个参数：归约操作的部分结果（在示例中表示为已经处理的整型数的总和）以及流中的下一个元素（在示例中表示为一个整型数）。它返回一个新的部分结果。在示例中，累积函数是一个将两个整型参数进行相加并返回结果的 Lambda 表达式 `(a, b) -> a + b`。

<!--
	The reduce operation always returns a new value. However, the accumulator function also returns a new value every time it processes an element of a stream. Suppose that you want to reduce the elements of a stream to a more complex object, such as a collection. This might hinder the performance of your application. If your reduce operation involves adding elements to a collection, then every time your accumulator function processes an element, it creates a new collection that includes the element, which is inefficient. It would be more efficient for you to update an existing collection instead. You can do this with the Stream.collect method, which the next section describes.
-->
`reduce` 操作总是会返回一个新的值。然而，累积函数在每次处理流中的一个元素后同样会返回一个新的值。假设你将要将流中的元素规约到一个更为复杂的对象中，例如一个集合，这样的话有可能会降低你的程序的性能。如果你的 `reduce` 操作需要向集合中添加元素，那么你的累积函数每次处理新的元素时都会产生一个新的包含该元素的集合，而这样是低效的。
如果你能够直接更新已有的集合那就高效得多了。你可以使用 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html#collect-java.util.function.Supplier-java.util.function.BiConsumer-java.util.function.BiConsumer-">Stream.collect</a></code> 方法来达到该目的。

#### Stream.collect 方法

<!--
	Unlike the reduce method, which always creates a new value when it processes an element, the collect method modifies, or mutates, an existing value.
-->
和 `reduce` 方法不同，与其在每次处理新的元素时都产生一个新的值，`collect` 方法将对已有的值直接进行修改。

<!--
	Consider how to find the average of values in a stream. You require two pieces of data: the total number of values and the sum of those values. However, like the reduce method and all other reduction methods, the collect method returns only one value. You can create a new data type that contains member variables that keep track of the total number of values and the sum of those values, such as the following class, Averager:
-->
考虑如何为流中的值计算平均值。要这么做，你需要两个数据：流中的元素个数以及元素的总和。然而，和 `reduce` 或其他归约方法类似，`collect` 方法也只会返回一个值。
为此，你可以创建一种新的数据类型来记录元素的个数和总和，如下 `Averager` 类所示：

<pre class="brush: java">
class Averager implements IntConsumer {
    private int total = 0;
    private int count = 0;
        
    public double average() {
        return count > 0 ? ((double) total)/count : 0;
    }
        
    public void accept(int i) { total += i; count++; }
    public void combine(Averager other) {
        total += other.total;
        count += other.count;
    }
}
</pre>

<!--
	The following pipeline uses the Averager class and the collect method to calculate the average age of all male members:
-->
如下流水线使用了 `Averager` 类和 `collect` 方法来计算所有男性用户的平均年龄：

<pre class="brush: java">
Averager averageCollect = roster.stream()
    .filter(p -> p.getGender() == Person.Sex.MALE)
    .map(Person::getAge)
    .collect(Averager::new, Averager::accept, Averager::combine);
                   
System.out.println("Average age of male members: " +
    averageCollect.average());
</pre>

<!--
	The collect operation in this example takes three arguments:
-->
示例中的 `collect` 操作接受了三个参数：

- `supplier`：工厂函数，负责创建新的实例。对 `collect` 操作而言，它被用于创建结果容器的新实例。在示例中，它被用于创建 `Averager` 类的新实例。
- `accumulator`：累积函数用于将一个流元素放入到结果容器中。在示例中，累积函数通过对 `count` 变量进行自增以及增加 `total` 变量的值的形式修改了 `Averager` 结果容器。
- `combiner`：合并函数（Combiner Function）接受两个结果容器并合并为一个合并容器。在示例中，合并函数通过对两个 `Averager` 的 `count` 变量和 `total` 变量相加来完成合并。

值得注意的是：

- 与 `reduce` 操作中的单位元不同的是，`collect` 的 `supplier` 是一个 Lambda 表达式（或方法引用），而不是一个值。
- 累积函数和合并函数不返回任何值。
- 你可以将 `collect` 操作用于并行流。详情请查阅[并行](#parallelism)一节。（如果你将 `collect` 操作用于一个并行流，那么每次合并函数产生一个新的对象时都会创建出一个新的线程。因此，你不需要担心线程同步的问题。）

<!--
	Although the JDK provides you with the average operation to calculate the average value of elements in a stream, you can use the collect operation and a custom class if you need to calculate several values from the elements of a stream.
-->
尽管 JDK 确实提供了 `average` 操作用于计算流元素的平均值，你也可以在需要为流的元素同时计算几个值时使用 `collect` 操作和一个自定义类。

<!--
	The collect operation is best suited for collections. The following example puts the names of the male members in a collection with the collect operation:
-->
`collect` 操作十分适合用于集合。以下的例子使用了 `collect` 操作来将男性用户的名称放置到了一个集合中：

<pre class="brush: java">
List&lt;String> namesOfMaleMembersCollect =
	roster.stream().filter(p -> p.getGender() == Person.Sex.MALE)
                   .map(p -> p.getName())
                   .collect(Collectors.toList());
</pre>

<!--
	This version of the collect operation takes one parameter of type Collector. This class encapsulates the functions used as arguments in the collect operation that requires three arguments (supplier, accumulator, and combiner functions).
-->
这个版本的 `collect` 操作接受一个类型为 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collector.html">Collector</a></code> 的参数。
该类封装了 `collect` 操作所需的三种参数（`supplier`、累积函数和合并函数）。

<!--
	The Collectors class contains many useful reduction operations, such as accumulating elements into collections and summarizing elements according to various criteria. These reduction operations return instances of the class Collector, so you can use them as a parameter for the collect operation.
-->
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html">Collectors</a></code> 类中包含很多有用的归约操作，
例如将元素放入到集合中或根据各种条件来对元素进行统计。这些归约操作返回的都是 `Collector` 类的实例，因此你可以将它们用作 `collect` 操作的参数。

<!--
	This example uses the Collectors.toList operation, which accumulates the stream elements into a new instance of List. As with most operations in the Collectors class, the toList operator returns an instance of Collector, not a collection.
-->
示例使用了 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#toList--">Collectors.toList</a></code> 操作，
能够将流元素放置到一个新的 `List` 实例中。和 `Collectors` 类的大多数方法相同，`toList` 方法返回的是 `Collector` 的实例，而不是一个集合。

<!--
	The following example groups members of the collection roster by gender:
-->
如下示例将集合 `roster` 中的用户根据性别进行分组：

<pre class="brush: java">
Map&lt;Person.Sex, List&lt;Person>> byGender =
    roster.stream().collect(Collectors.groupingBy(Person::getGender));
</pre>

<!--
	The groupingBy operation returns a map whose keys are the values that result from applying the lambda expression specified as its parameter (which is called a classification function). In this example, the returned map contains two keys, Person.Sex.MALE and Person.Sex.FEMALE. The keys' corresponding values are instances of List that contain the stream elements that, when processed by the classification function, correspond to the key value. For example, the value that corresponds to key Person.Sex.MALE is an instance of List that contains all male members.
-->
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#groupingBy-java.util.function.Function-">groupingBy</a></code>
操作返回的映射的键通过调用其参数给定的 Lambda 表达式所得，其又被称为分类函数（Classification Function）。在示例中，返回的映射包含两种键，`Person.Sex.MALE` 和
`Person.Sex.FEMALE`。这些键对应的值为 `List` 实例，其中包含了所有对应的流元素。例如，键 `Person.Sex.MALE` 对应的值即为一个包含所有男性用户的 `List` 实例。

<!--
	The following example retrieves the names of each member in the collection roster and groups them by gender:
-->
如下示例获取了集合 `roster` 中所有用户的名称并按性别分类：

<pre class="brush: java">
Map&lt;Person.Sex, List&lt;String>> namesByGender =
    roster.stream().collect(
            Collectors.groupingBy(
                Person::getGender,                      
                Collectors.mapping(
                    Person::getName,
                    Collectors.toList())));
</pre>

<!--
	The groupingBy operation in this example takes two parameters, a classification function and an instance of Collector. The Collector parameter is called a downstream collector. This is a collector that the Java runtime applies to the results of another collector. Consequently, this groupingBy operation enables you to apply a collect method to the List values created by the groupingBy operator. This example applies the collector mapping, which applies the mapping function Person::getName to each element of the stream. Consequently, the resulting stream consists of only the names of members. A pipeline that contains one or more downstream collectors, like this example, is called a multilevel reduction.
-->
示例中所使用的 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#groupingBy-java.util.function.Function-java.util.stream.Collector-">groupingBy</a></code> 操作接受两个参数，一个分类函数和一个 `Collector` 实例。该 `Collector` 实例被称为**下游收集器**（Downstream Collector）。
Java 运行时将将该收集器应用于另一个收集器的结果。因此，该 `groupingBy` 操作使得你可以将 `collect` 方法应用于 `groupingBy` 操作返回的 `List` 值。
示例中使用了 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#mapping-java.util.function.Function-java.util.stream.Collector-java.util.stream.Collector-">mapping</a></code> 收集器，并将映射函数 `Person::getName` 应用于每一个流元素。由此，结果流中只包含用户的名称。
像示例中这样包含一个或多个下游收集器的流水线被称为**多级归约**（Multilevel Reduction）。

<!--
	The following example retrieves the total age of members of each gender:
-->
如下示例返回每种性别的用户的年龄总和：

<pre class="brush: java">
Map&lt;Person.Sex, Integer> totalAgeByGender =
    roster.stream().collect(
            Collectors.groupingBy(
                Person::getGender,                      
                Collectors.reducing(
                    0,
                    Person::getAge,
                    Integer::sum)));
</pre>

其中 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#reducing-U-java.util.function.Function-java.util.function.BinaryOperator-">reducing</a></code> 操作接受三个参数：

- `identity`：正如 `Stream.reduce` 操作，该单位元为归约操作的起始值，也是当流为空时的默认返回值。在示例中，单位元为 `0`，其正是年龄求和操作的起始值，也是当不存在用户时的默认返回值。
- `mapper`：`reducing` 操作将会将该映射函数应用于每一个流元素。在示例中，映射函数用于获取每个用户的年龄。
- `operation`：操作函数被用于归约映射后的值。在示例中，操作函数被用于将 `Integer` 值进行相加。

<!--
	The following example retrieves the average age of members of each gender:
-->
如下示例返回每种性别的用户的平均年龄：

<pre class="brush: java">
Map&lt;Person.Sex, Double> averageAgeByGender =
    roster.stream().collect(
        Collectors.groupingBy(
            Person::getGender,                      
            Collectors.averagingInt(Person::getAge)));
</pre>

<h3 id="parallelism">3.2 并行</h3>

原文链接：[Parallelism](http://docs.oracle.com/javase/tutorial/collections/streams/parallelism.html)

<!--
	Parallel computing involves dividing a problem into subproblems, solving those problems simultaneously (in parallel, with each subproblem running in a separate thread), and then combining the results of the solutions to the subproblems. Java SE provides the fork/join framework, which enables you to more easily implement parallel computing in your applications. However, with this framework, you must specify how the problems are subdivided (partitioned). With aggregate operations, the Java runtime performs this partitioning and combining of solutions for you.
-->
并行计算的过程需要将一个问题分解为若干个子问题，并同时解决这些子问题（并发执行，每个子问题使用一个独立的线程），而后合并这些子问题的结果。
Java SE 提供了 [fork/join 框架](http://docs.oracle.com/javase/tutorial/essential/concurrency/forkjoin.html)使得你可以能容易地为自己的程序实现并发计算。
然而，即使有了这个框架，你仍然需要声明如何对问题进行分解。使用聚合操作可以使 Java 运行时为你进行问题分解和结果合并。

<!--
	One difficulty in implementing parallelism in applications that use collections is that collections are not thread-safe, which means that multiple threads cannot manipulate a collection without introducing thread interference or memory consistency errors. The Collections Framework provides synchronization wrappers, which add automatic synchronization to an arbitrary collection, making it thread-safe. However, synchronization introduces thread contention. You want to avoid thread contention because it prevents threads from running in parallel. Aggregate operations and parallel streams enable you to implement parallelism with non-thread-safe collections provided that you do not modify the collection while you are operating on it.
-->
在为应用程序实现并行使用集合时，首先会遇到的问题在于该集合有可能不是线程安全的，也就是说线程们对该集合进行操作时很可能导致[线程冲突](http://docs.oracle.com/javase/tutorial/essential/concurrency/interfere.html)或[内存一致性错误](http://docs.oracle.com/javase/tutorial/essential/concurrency/memconsist.html)。
Java 集合框架本身提供了[同步包装类](http://docs.oracle.com/javase/tutorial/collections/implementations/wrapper.html)，它们能为给定的集合自动添加上同步机制，使其变得线程安全。
然而，同步机制却会导致[线程竞争](http://docs.oracle.com/javase/tutorial/essential/concurrency/sync.html#thread_contention)。你不想自己的程序发生线程竞争现象，因为它会导致线程无法真正地并行执行。
只要你确保你在操作的过程中不会对集合进行修改，聚合操作和并行流就可以为你的非线程安全的集合实现并行。

<!--
	Note that parallelism is not automatically faster than performing operations serially, although it can be if you have enough data and processor cores. While aggregate operations enable you to more easily implement parallelism, it is still your responsibility to determine if your application is suitable for parallelism.
-->
注意，并发执行并不一定就比顺序执行操作更快，但如果你有足够多的数据和处理核心，并发执行往往能更快。尽管聚合操作可以使你更方便地实现并发，你仍需要考虑你的应用程序是否适合使用并发。

<!--
	You can find the code excerpts described in this section in the example ParallelismExamples.
-->
本节中的代码片段均可在示例
<code><a href="http://docs.oracle.com/javase/tutorial/collections/streams/examples/ParallelismExamples.java">ParallelismExamples</a></code>
中找到。

#### 并行执行流操作

<!--
	You can execute streams in serial or in parallel. When a stream executes in parallel, the Java runtime partitions the stream into multiple substreams. Aggregate operations iterate over and process these substreams in parallel and then combine the results.
-->
流操作可以被顺序或并行地执行。当你决定并行地执行流操作时，Java 运行时将会将该流分解为若干个子流。聚合操作将并行地迭代并处理这些子流，最后合并它们的结果。

<!--
	When you create a stream, it is always a serial stream unless otherwise specified. To create a parallel stream, invoke the operation Collection.parallelStream. Alternatively, invoke the operation BaseStream.parallel. For example, the following statement calculates the average age of all male members in parallel:
-->
当你创建流时，除非额外声明，否则你创建的均为顺序流。通过调用
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/Collection.html#parallelStream--">Collection.parallelStream</a></code>
方法即可创建一个并行流。除此之外，你还可以使用流操作
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/BaseStream.html#parallel--">BaseStream.parallel</a></code>。
例如，如下语句并行地计算所有男性用户的平均年龄：

<pre class="brush: java">
double average =
    roster.parallelStream()
          .filter(p -> p.getGender() == Person.Sex.MALE)
          .mapToInt(Person::getAge)
          .average()
          .getAsDouble();
</pre>

#### 并行归约

<!--
	Consider again the following example (which is described in the section Reduction) that groups members by gender. This example invokes the collect operation, which reduces the collection roster into a Map:
-->
我们再来考虑下面这个来自[归约操作](#reduction)一节的根据性别对用户进行分类的代码示例。示例代码调用了 `collect` 操作以将 `roster` 集合规约到一个 `Map` 中：

<pre class="brush: java">
Map&lt;Person.Sex, List&lt;Person>> byGender =
    roster.stream().collect(Collectors.groupingBy(Person::getGender));
</pre>

<!--
	The following is the parallel equivalent:
-->
如下代码则并行地执行相同的操作：

<pre class="brush: java">
ConcurrentMap&lt;Person.Sex, List&lt;Person>> byGender =
    roster.parallelStream().collect(Collectors.groupingByConcurrent(Person::getGender));
</pre>

这样的操作被称为**并行归约**（Concurrent Reduction）。当如下所有条件对于一个包含 `collect` 操作的流水线均为真时，Java 运行时将执行并行归约：

- 该流为并行流。
- `collector` 操作所使用的收集器参数包含特性 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collector.Characteristics.html#CONCURRENT">Collector.Characteristics.CONCURRENT</a></code>。通过调用 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collector.Characteristics.html">Collector.characteristics</a></code> 方法即可获取收集器的特性。
- 该流是无序的，或者所使用的收集器包含特性 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collector.Characteristics.html#UNORDERED">Collector.Characteristics.UNORDERED</a></code>。调用 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/BaseStream.html#unordered--">BaseStream.unordered</a></code> 方法即可确保流是无序的。

<!--
	Note: This example returns an instance of ConcurrentMap instead of Map and invokes the groupingByConcurrent operation instead of groupingBy. (See the section Concurrent Collections for more information about ConcurrentMap.) Unlike the operation groupingByConcurrent, the operation groupingBy performs poorly with parallel streams. (This is because it operates by merging two maps by key, which is computationally expensive.) Similarly, the operation Collectors.toConcurrentMap performs better with parallel streams than the operation Collectors.toMap.
-->
**注意**：示例代码返回的是
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentMap.html">ConcurrentMap</a></code>
的实例而不是 `Map` 的实例，最后调用的是
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#groupingByConcurrent-java.util.function.Function-">groupingByConcurrent</a></code>
方法而不是 `groupingBy` 方法（有关 `ConcurrentMap` 的更多信息可查阅[并发集合](http://docs.oracle.com/javase/tutorial/essential/concurrency/collections.html)一节）。
和 `groupingByConcurrent` 方法不同，`groupingBy` 方法被应用于并行流时的执行效率很低（这是因为它在执行的过程中会让两个映射基于键合并，而这个操作十分耗时）。
同样，<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#toConcurrentMap-java.util.function.Function-java.util.function.Function-">Collectors.toConcurrentMap</a></code> 在并行流中执行的效率也比 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#toMap-java.util.function.Function-java.util.function.Function-">Collectors.toMap</a></code> 更好。

#### 执行顺序

<!--
	The order in which a pipeline processes the elements of a stream depends on whether the stream is executed in serial or in parallel, the source of the stream, and intermediate operations. For example, consider the following example that prints the elements of an instance of ArrayList with the forEach operation several times:
-->
流水线处理流中元素的顺序取决于该流是顺序执行还是并发执行、流的数据来源以及中间操作。例如，考虑如下使用 `forEach` 操作打印 `ArrayList` 中的元素的示例：

<pre class="brush: java">
Integer[] intArray = {1, 2, 3, 4, 5, 6, 7, 8 };
List&lt;Integer> listOfIntegers =
    new ArrayList&lt;>(Arrays.asList(intArray));

System.out.println("listOfIntegers:");
listOfIntegers
    .stream()
    .forEach(e -> System.out.print(e + " "));
System.out.println("");

System.out.println("listOfIntegers sorted in reverse order:");
Comparator&lt;Integer> normal = Integer::compare;
Comparator&lt;Integer> reversed = normal.reversed(); 
Collections.sort(listOfIntegers, reversed);  
listOfIntegers
    .stream()
    .forEach(e -> System.out.print(e + " "));
System.out.println("");
     
System.out.println("Parallel stream");
listOfIntegers
    .parallelStream()
    .forEach(e -> System.out.print(e + " "));
System.out.println("");
    
System.out.println("Another parallel stream:");
listOfIntegers
    .parallelStream()
    .forEach(e -> System.out.print(e + " "));
System.out.println("");
     
System.out.println("With forEachOrdered:");
listOfIntegers
    .parallelStream()
    .forEachOrdered(e -> System.out.print(e + " "));
System.out.println("");
</pre>

<!--
	This example consists of five pipelines. It prints output similar to the following:
-->
示例代码包含了五个流水线。其输入与如下类似：

<pre>
listOfIntegers:
1 2 3 4 5 6 7 8
listOfIntegers sorted in reverse order:
8 7 6 5 4 3 2 1
Parallel stream:
3 4 1 6 2 5 7 8
Another parallel stream:
6 3 1 5 7 8 4 2
With forEachOrdered:
8 7 6 5 4 3 2 1
</pre>

<!--
	This example does the following:
-->
示例代码做了如下几件事：

- 第一个流水线根据元素被添加的顺序打印了列表 `listOfIntegers` 中的元素。
- 第二个流水线在列表 `listOfIntegers` 在被方法 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#sort-java.util.List-">Collections.sort</a></code> 排序后打印其所有元素。
- 第三和第四个流水线似乎在以随机的顺序打印元素。我们之前说过，在处理流的元素时，流操作使用了内部迭代机制。因此，当你并发执行流操作时，如无另外声明，Java 编译器和运行时将自行决定流元素的处理顺序以最大化地利用并行计算。
- 第五个流水线使用了 <code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html#forEachOrdered-java.util.function.Consumer-">forEachOrdered</a></code> 方法，它将根据流的数据来源给定的顺序来处理流元素，而不考虑该流是否正被并行执行。
  注意，在并行流中使用类似 `forEachOrdered` 这样的方法将使得你无法享受并发带来的好处。

#### 副作用

<!--
	A method or an expression has a side effect if, in addition to returning or producing a value, it also modifies the state of the computer. Examples include mutable reductions (operations that use the collect operation; see the section Reduction for more information) as well as invoking the System.out.println method for debugging. The JDK handles certain side effects in pipelines well. In particular, the collect method is designed to perform the most common stream operations that have side effects in a parallel-safe manner. Operations like forEach and peek are designed for side effects; a lambda expression that returns void, such as one that invokes System.out.println, can do nothing but have side effects. Even so, you should use the forEach and peek operations with care; if you use one of these operations with a parallel stream, then the Java runtime may invoke the lambda expression that you specified as its parameter concurrently from multiple threads. In addition, never pass as parameters lambda expressions that have side effects in operations such as filter and map. The following sections discuss interference and stateful lambda expressions, both of which can be sources of side effects and can return inconsistent or unpredictable results, especially in parallel streams. However, the concept of laziness is discussed first, because it has a direct effect on interference.
-->
如果一个方法或表达式除了产生或返回一个值以外还改变了计算机的状态，那么我们说它有副作用（Side Effect）。
类似的例子包括可变归约（使用 `collect` 操作的操作，详见[归约操作](#reduction)一节）或是通过调用 `System.out.println` 来进行调试。
JDK 能很好地处理流水线中的某些副作用。比如，`collect` 方法可被用于执行那些有着线程安全的副作用的流操作。
像 `forEach` 和 `peek` 这样的操作本身就是为了产生副作用；返回 `void` 的 Lambda 表达式，如调用 `System.out.println` 的 Lambda 表达式，除了产生负作用以外也什么都不会做。
即便如此，在你使用 `forEach` 和 `peek` 操作时仍要小心：如果你在并行流中使用了这些操作，Java 运行时可能从多个线程并发地调用你在参数中给定的 Lambda 表达式。
除此之外，你不应该将任何带有副作用的 Lambda 表达式作为参数传递到像 `filter` 和 `map` 这样的操作中。
在这一节中，我们将讨论冲突和有状态 Lambda 表达式。它们是副作用的主要来源，同时也可能导致不可预期或不一致的结果，尤其是用在并行流中时。
不过，我们会首先讨论懒求值的概念，因其对冲突有着直接的作用。

##### 懒求值

<!--
	All intermediate operations are lazy. An expression, method, or algorithm is lazy if its value is evaluated only when it is required. (An algorithm is eager if it is evaluated or processed immediately.) Intermediate operations are lazy because they do not start processing the contents of the stream until the terminal operation commences. Processing streams lazily enables the Java compiler and runtime to optimize how they process streams. For example, in a pipeline such as the filter-mapToInt-average example described in the section Aggregate Operations, the average operation could obtain the first several integers from the stream created by the mapToInt operation, which obtains elements from the filter operation. The average operation would repeat this process until it had obtained all required elements from the stream, and then it would calculate the average.
-->
所有中间操作都是懒求值的（lazy）。如果一个表达式、方法或算法只有在需要时才会开始计算其结果值，那么我们说它是懒求值的。中间操作是懒求值的，因为在终止操作开始前它们都不会对流的元素进行处理。懒惰地处理流元素使得 Java 编译器和运行时可以对它们处理流的方式进行优化。
例如，考虑流水线 `filter-mapToInt-average`，`average` 操作可以从 `mapToInt` 操作创建的流中获取整型数值，而 `mapToInt` 操作则从 `filter` 操作 获取元素。
`average` 操作将不断重复这个过程直到从流中获取到所需的所有元素，然后再计算平均值。

##### 冲突

流操作使用的 Lambda 表达式不应产生任何冲突。当流水线在处理流时，流的数据来源发生了修改就会产生冲突。例如，考虑如下代码。
如下代码尝试将 `List listOfStrings` 中的字符串进行拼接，但却会抛出一个 `ConcurrentModificationException`：

<pre class="brush: java">
try {
    List&lt;String> listOfStrings =
        new ArrayList&lt;>(Arrays.asList("one", "two"));
         
    // This will fail as the peek operation will attempt to add the
    // string "three" to the source after the terminal operation has
    // commenced. 
             
    String concatenatedString = listOfStrings
        .stream()
        
        // Don't do this! Interference occurs here.
        .peek(s -> listOfStrings.add("three"))
        
        .reduce((a, b) -> a + " " + b)
        .get();
                 
    System.out.println("Concatenated string: " + concatenatedString);
         
} catch (Exception e) {
    System.out.println("Exception caught: " + e.toString());
}
</pre>

<!--
	This example concatenates the strings contained in listOfStrings into an Optional<String> value with the reduce operation, which is a terminal operation. However, the pipeline here invokes the intermediate operation peek, which attempts to add a new element to listOfStrings. Remember, all intermediate operations are lazy. This means that the pipeline in this example begins execution when the operation get is invoked, and ends execution when the get operation completes. The argument of the peek operation attempts to modify the stream source during the execution of the pipeline, which causes the Java runtime to throw a ConcurrentModificationException.
-->
示例代码使用终止操作 `reduce` 将 `listOfStrings` 中的字符串进行拼接并放入到了一个 `Optional<String>` 中。
然而，这个流水线使用了中间操作 `peek`，试图向 `listOfStrings` 中添加新的元素。
之前我们提到，所有的中间操作都是懒求值的。这意味着例子中的流水线只有在 `get` 操作被调用时才开始执行，并在 `get` 操作完成时结束执行。
`peek` 操作的参数企图在流水线执行的过程中修改流的数据来源，导致 Java 运行时抛出了一个 `ConcurrentModificationException`。

##### 有状态 Lambda 表达式

<!--
	Avoid using stateful lambda expressions as parameters in stream operations. A stateful lambda expression is one whose result depends on any state that might change during the execution of a pipeline. The following example adds elements from the List listOfIntegers to a new List instance with the map intermediate operation. It does this twice, first with a serial stream and then with a parallel stream:
-->
我们不应使用任何**有状态的 Lambda 表达式**（Stateful Lambda Expression）作为流操作的参数。
如果一个 Lambda 表达式的结果取决于一个可能在流水线执行过程中发生改变的状态值，那么我们说它是有状态的。
如下示例代码通过中间操作 `map` 将列表 `listOfIntegers` 中的元素添加到一个新的 `List` 中。
这个操作分别被顺序和并行地执行了一次。

<pre class="brush: java">
List&lt;Integer> serialStorage = new ArrayList&lt;>();
     
System.out.println("Serial stream:");
listOfIntegers
    .stream()
    
    // Don't do this! It uses a stateful lambda expression.
    .map(e -> { serialStorage.add(e); return e; })
    
    .forEachOrdered(e -> System.out.print(e + " "));
System.out.println("");
     
serialStorage
    .stream()
    .forEachOrdered(e -> System.out.print(e + " "));
System.out.println("");

System.out.println("Parallel stream:");
List&lt;Integer> parallelStorage = Collections.synchronizedList(
    new ArrayList&lt;>());
listOfIntegers
    .parallelStream()
    
    // Don't do this! It uses a stateful lambda expression.
    .map(e -> { parallelStorage.add(e); return e; })
    
    .forEachOrdered(e -> System.out.print(e + " "));
System.out.println("");
     
parallelStorage
    .stream()
    .forEachOrdered(e -> System.out.print(e + " "));
System.out.println("");
</pre>

<!--
	The lambda expression e -> { parallelStorage.add(e); return e; } is a stateful lambda expression. Its result can vary every time the code is run. This example prints the following:
-->
Lambda 表达式 `e -> { parallelStorage.add(e); return e; }` 是有状态的。它的结果在每次运行时都有可能不同。示例代码输出如下：

<pre>
Serial stream:
8 7 6 5 4 3 2 1
8 7 6 5 4 3 2 1
Parallel stream:
8 7 6 5 4 3 2 1
1 3 6 2 4 5 8 7
</pre>

<!--
	The operation forEachOrdered processes elements in the order specified by the stream, regardless of whether the stream is executed in serial or parallel. However, when a stream is executed in parallel, the map operation processes elements of the stream specified by the Java runtime and compiler. Consequently, the order in which the lambda expression e -> { parallelStorage.add(e); return e; } adds elements to the List parallelStorage can vary every time the code is run. For deterministic and predictable results, ensure that lambda expression parameters in stream operations are not stateful.
-->
`forEachOrdered` 操作将根据流的顺序处理元素，其处理的顺序与流是否被并行执行无关。
然而，当流被并行执行时，`map` 操作将按照 Java 编译器和运行时给定的顺序来处理流中的元素。
因此，Lambda 表达式 `e -> { parallelStorage.add(e); return e; }` 添加元素至列表 `parallelStorage` 中的顺序在每次代码执行时都有可能不同。
如果想要获得确定且可预期的结果，我们需要确保流操作所使用的 Lambda 表达式参数是无状态的。

<!--
	Note: This example invokes the method synchronizedList so that the List parallelStorage is thread-safe. Remember that collections are not thread-safe. This means that multiple threads should not access a particular collection at the same time. Suppose that you do not invoke the method synchronizedList when creating parallelStorage:
-->
**注意**：该示例调用了
<code><a href="https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#synchronizedList-java.util.List-">synchronizedList</a></code>
方法，因此列表 `parallelStorage` 是线程安全的。我们之前说过，集合不是线程安全的，这意味着复数线程不应同时访问同一个集合。
假设你在创建 `parallelStorage` 时没有使用 `synchronizedList` 方法：

<pre class="brush: java">
List&lt;Integer> parallelStorage = new ArrayList&lt;>();
</pre>

<!--
	The example behaves erratically because multiple threads access and modify parallelStorage without a mechanism like synchronization to schedule when a particular thread may access the List instance. Consequently, the example could print output similar to the following:
-->
这样，示例代码就会开始产生不正常的结果了，因为多个线程同时尝试访问和修改 `parallelStorage`，而又没有像线程同步这样的机制来计划哪个线程应该访问这个 `List` 实例。
由此，示例代码可能会输出类似下面这样的结果：

<pre>
Parallel stream:
8 7 6 5 4 3 2 1
null 3 5 4 7 8 1 2
</pre>

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

<h4 id="general-purpose-set-implementations">4.1.1 普适 Set 接口实现类</h4>

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