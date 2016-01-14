---
layout: posts
title: Java 集合框架源码解析：Set
author: Robert Peng
category: Java
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

[Set]: http://docs.oracle.com/javase/8/docs/api/java/util/Set.html
[Iterable]: http://docs.oracle.com/javase/8/docs/api/java/lang/Iterable.html
[Collection]: http://docs.oracle.com/javase/8/docs/api/java/util/Collection.html
[AbstractCollection]: http://docs.oracle.com/javase/8/docs/api/java/util/AbstractCollection.html
[AbstractSet]: http://docs.oracle.com/javase/8/docs/api/java/util/AbstractSet.html
[HashSet]: http://docs.oracle.com/javase/8/docs/api/java/util/HashSet.html
[TreeSet]: http://docs.oracle.com/javase/8/docs/api/java/util/TreeSet.html
[EnumSet]: http://docs.oracle.com/javase/8/docs/api/java/util/EnumSet.html
[LinkedHashSet]: http://docs.oracle.com/javase/8/docs/api/java/util/LinkedHashSet.html
[CopyOnWriteArraySet]: http://docs.oracle.com/javase/8/docs/api/java/util/CopyOnWriteArraySet.html

## 概述

了解 Java 集合框架每个实现类的原理是每个 Java 程序员的必修课。本系列将按照`Set`、`List`、`Map`、`Queue`、`Deque`的顺序，以 Java
的[官方教程](http://docs.oracle.com/javase/tutorial/collections/)为指导，分接口的解析每个接口对应的实现类的原理。
本篇先从`Set`接口及其常用实现类开始，其中包括`HashSet`、`TreeSet`、 `LinkedHashSet`、 `EnumSet`和`CopyOnWriteArraySet`。

在开始前，我们需要先对这几个类之间的关系有个大致的了解。咱们直接看类图：

![](/img/JavaCollection@1.jpg)

由此，我们便基本了解了这几个类之间的层次关系了。接下来就让我们自上而下逐个解析吧。

## Iterable 接口

我们先来看看位于整个类型结构根部的 [Iterable][] 接口。其源代码如下：

<pre class="brush: java">
package java.lang;

import java.util.Iterator;
import java.util.Objects;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.function.Consumer;

/**
 * Implementing this interface allows an object to be the target of           * 实现该接口使得对象可以作为
 * the "for-each loop" statement.                                             * `for-each`语句的作用目标
 *
 * @since 1.5
 */
public interface Iterable&lt;T> {
    /**
     * Returns an iterator over elements of type {@code T}.                   * 返回遍历元素的迭代器
     */
    Iterator&lt;T> iterator();

    /**
     * Performs the given action for each element of the `Iterable`           * 将给定的操作应用于`Iterable`的每个元素，
     * until all elements have been processed or the action throws an         * 直到每个元素都被处理过或抛出错误。
     * exception.  Unless otherwise specified by the implementing class,      * 除非子类另行声明，该操作将按照元素遍历的顺序
     * actions are performed in the order of iteration                        * （如果确实存在这样一个特定的顺序）应用于每个元素
     * (if an iteration order is specified).  Exceptions thrown               * 给定操作抛出的错误将传递给方法的调用者。
     * by the action are relayed to the caller.
     *
     * @implSpec
     * The default implementation behaves as if:                              * 默认实现的行为与如下代码类似：
     * &lt;pre>
     *     for (T t : this)
     *         action.accept(t);
     * &lt;/pre>
     *
     * @throws NullPointerException if the specified action is null           * 若给定的操作为`null`，抛出`NullPointerException`
     * @since 1.8
     */
    default void forEach(Consumer&lt;? super T> action) {
        Objects.requireNonNull(action);
        for (T t : this) {
            action.accept(t);
        }
    }

    default Spliterator&lt;T> spliterator() {
        return Spliterators.spliteratorUnknownSize(iterator(), 0);
    }
}
</pre>

总结一下，`Iterable`接口声明了`iterator`、`forEach`和`spliterator`三个方法，其中`forEach`和`spliterator`方法已经给出了默认实现，
实现类只需要实现`iterator`方法即可。

## Collection 接口

接下来我们看看继承了`Iterable`的 [Collection][] 接口：

<pre class="brush: java">
package java.util;

import ...

/**
 * The root interface in the collection hierarchy.                              * 位于集合类型层级根部的接口。
 * A collection represents a group of objects, known as its elements            * 一个集合表示一组被称为它的元素的对象。
 * Some collections allow duplicate elements and others do not.                 * 有的集合允许包含重复的元素，有的不允许。
 * Some are ordered and others unordered.  The JDK does not provide             * 有的集合是有序的，有的则是无序的。
 * any <i>direct</i> implementations of this interface: it provides             * JDK 并未提供任何该接口的直接实现类：
 * implementations of more specific subinterfaces like `Set` and `List`.        * 只提供了对`Set`、`List`等更具体的子接口的
 * This interface is typically used to pass collections around and              * 实现类。大多数时候，该接口只用于传递集合
 * manipulate them where maximum generality is desired.                         * 或在需要最大概括性的场合下对集合进行操作。
 *
 * <i>Bags</i> or <i>multisets</i> (unordered collections that may contain      * 多重集（可包含重复元素的无需集合）
 * duplicate elements) should implement this interface directly.                * 应直接实现该接口。
 *
 * All general-purpose `Collection` implementation classes (which               * 所有普适的`Collection`实现类应提供两个
 * typically implement `Collection` indirectly through one of its               * “标准的”构造器：一个无参数构造器，
 * subinterfaces) should provide two "standard" constructors: a void (no        * 用于创建一个空集合；一个只包含一个`Collection`
 * arguments) constructor, which creates an empty collection, and a             * 参数的构造器，使用给定集合中的元素创建
 * constructor with a single argument of type `Collection`, which               * 一个新的集合。第二个构造器使得用户可以将
 * creates a new collection with the same elements as its argument. In          * 任意集合中的元素复制到任意类型的新集合中。
 * effect, the latter constructor allows the user to copy any collection,       * 由于接口无法声明构造器，
 * producing an equivalent collection of the desired implementation type.       * 这样的限制无法被强制执行，
 * There is no way to enforce this convention (as interfaces cannot contain     * 但 Java 类库提供的所有普适`Collection`
 * constructors) but all of the general-purpose `Collection`                    * 实现类均遵循该规则。
 * implementations in the Java platform libraries comply.
 *
 * The "destructive" methods contained in this interface, that is,
 * the methods that modify the collection on which they operate,
 * are specified to throw `UnsupportedOperationException` if
 * this collection does not support the operation. If this is the case,
 * these methods may, but are not required to, throw an
 * `UnsupportedOperationException` if the invocation would have no effect
 * on the collection. For example, invoking the `addAll(Collection)` method
 * on an unmodifiable collection may, but is not required to, throw
 * the exception if the collection to be added is empty.
 *
 * Some collection implementations have restrictions on the elements that
 * they may contain. For example, some implementations prohibit null elements,
 * and some have restrictions on the types of their elements. Attempting to
 * add an ineligible element throws an unchecked exception, typically
 * `NullPointerException` or `ClassCastException`. Attempting
 * to query the presence of an ineligible element may throw an exception,
 * or it may simply return false; some implementations will exhibit the former
 * behavior and some will exhibit the latter. More generally, attempting an
 * operation on an ineligible element whose completion would not result in
 * the insertion of an ineligible element into the collection may throw an
 * exception or it may succeed, at the option of the implementation.
 * Such exceptions are marked as "optional" in the specification for this
 * interface.
 *
 * It is up to each collection to determine its own synchronization
 * policy. In the absence of a stronger guarantee by the
 * implementation, undefined behavior may result from the invocation
 * of any method on a collection that is being mutated by another
 * thread; this includes direct invocations, passing the collection to
 * a method that might perform invocations, and using an existing
 * iterator to examine the collection.
 *
 * Many methods in Collections Framework interfaces are defined in
 * terms of the `equals` method. For example,
 * the specification for the `contains(Object)`
 * method says: "returns `true` if and only if this collection
 * contains at least one element <tt>e</tt> such that
 * <tt>(o==null ? e==null : o.equals(e))</tt>."  This specification should
 * <i>not</i> be construed to imply that invoking <tt>Collection.contains</tt>
 * with a non-null argument <tt>o</tt> will cause <tt>o.equals(e)</tt> to be
 * invoked for any element <tt>e</tt>.  Implementations are free to implement
 * optimizations whereby the <tt>equals</tt> invocation is avoided, for
 * example, by first comparing the hash codes of the two elements.  (The
 * {@link Object#hashCode()} specification guarantees that two objects with
 * unequal hash codes cannot be equal.)  More generally, implementations of
 * the various Collections Framework interfaces are free to take advantage of
 * the specified behavior of underlying {@link Object} methods wherever the
 * implementor deems it appropriate.
 *
 * <p>Some collection operations which perform recursive traversal of the
 * collection may fail with an exception for self-referential instances where
 * the collection directly or indirectly contains itself. This includes the
 * {@code clone()}, {@code equals()}, {@code hashCode()} and {@code toString()}
 * methods. Implementations may optionally handle the self-referential scenario,
 * however most current implementations do not do so.
 *
 * <p>This interface is a member of the
 * <a href="{@docRoot}/../technotes/guides/collections/index.html">
 * Java Collections Framework</a>.
 *
 * @implSpec
 * The default method implementations (inherited or otherwise) do not apply any
 * synchronization protocol.  If a {@code Collection} implementation has a
 * specific synchronization protocol, then it must override default
 * implementations to apply that protocol.
 *
 * @param &lt;E> the type of elements in this collection
 *
 * @author  Josh Bloch
 * @author  Neal Gafter
 * @see     Set
 * @see     List
 * @see     Map
 * @see     SortedSet
 * @see     SortedMap
 * @see     HashSet
 * @see     TreeSet
 * @see     ArrayList
 * @see     LinkedList
 * @see     Vector
 * @see     Collections
 * @see     Arrays
 * @see     AbstractCollection
 * @since 1.2
 */

public interface Collection&lt;E> extends Iterable&lt;E> {
    // Query Operations

    /**
     * Returns the number of elements in this collection.  If this collection
     * contains more than <tt>Integer.MAX_VALUE</tt> elements, returns
     * <tt>Integer.MAX_VALUE</tt>.
     *
     * @return the number of elements in this collection
     */
    int size();

    /**
     * Returns <tt>true</tt> if this collection contains no elements.
     *
     * @return <tt>true</tt> if this collection contains no elements
     */
    boolean isEmpty();

    /**
     * Returns <tt>true</tt> if this collection contains the specified element.
     * More formally, returns <tt>true</tt> if and only if this collection
     * contains at least one element <tt>e</tt> such that
     * <tt>(o==null&nbsp;?&nbsp;e==null&nbsp;:&nbsp;o.equals(e))</tt>.
     *
     * @param o element whose presence in this collection is to be tested
     * @return <tt>true</tt> if this collection contains the specified
     *         element
     * @throws ClassCastException if the type of the specified element
     *         is incompatible with this collection
     *         (<a href="#optional-restrictions">optional</a>)
     * @throws NullPointerException if the specified element is null and this
     *         collection does not permit null elements
     *         (<a href="#optional-restrictions">optional</a>)
     */
    boolean contains(Object o);

    /**
     * Returns an iterator over the elements in this collection.  There are no
     * guarantees concerning the order in which the elements are returned
     * (unless this collection is an instance of some class that provides a
     * guarantee).
     *
     * @return an <tt>Iterator</tt> over the elements in this collection
     */
    Iterator&lt;E> iterator();

    /**
     * Returns an array containing all of the elements in this collection.
     * If this collection makes any guarantees as to what order its elements
     * are returned by its iterator, this method must return the elements in
     * the same order.
     *
     * <p>The returned array will be "safe" in that no references to it are
     * maintained by this collection.  (In other words, this method must
     * allocate a new array even if this collection is backed by an array).
     * The caller is thus free to modify the returned array.
     *
     * <p>This method acts as bridge between array-based and collection-based
     * APIs.
     *
     * @return an array containing all of the elements in this collection
     */
    Object[] toArray();

    /**
     * Returns an array containing all of the elements in this collection;
     * the runtime type of the returned array is that of the specified array.
     * If the collection fits in the specified array, it is returned therein.
     * Otherwise, a new array is allocated with the runtime type of the
     * specified array and the size of this collection.
     *
     * <p>If this collection fits in the specified array with room to spare
     * (i.e., the array has more elements than this collection), the element
     * in the array immediately following the end of the collection is set to
     * <tt>null</tt>.  (This is useful in determining the length of this
     * collection <i>only</i> if the caller knows that this collection does
     * not contain any <tt>null</tt> elements.)
     *
     * <p>If this collection makes any guarantees as to what order its elements
     * are returned by its iterator, this method must return the elements in
     * the same order.
     *
     * <p>Like the {@link #toArray()} method, this method acts as bridge between
     * array-based and collection-based APIs.  Further, this method allows
     * precise control over the runtime type of the output array, and may,
     * under certain circumstances, be used to save allocation costs.
     *
     * <p>Suppose <tt>x</tt> is a collection known to contain only strings.
     * The following code can be used to dump the collection into a newly
     * allocated array of <tt>String</tt>:
     *
     * <pre>
     *     String[] y = x.toArray(new String[0]);</pre>
     *
     * Note that <tt>toArray(new Object[0])</tt> is identical in function to
     * <tt>toArray()</tt>.
     *
     * @param &lt;T> the runtime type of the array to contain the collection
     * @param a the array into which the elements of this collection are to be
     *        stored, if it is big enough; otherwise, a new array of the same
     *        runtime type is allocated for this purpose.
     * @return an array containing all of the elements in this collection
     * @throws ArrayStoreException if the runtime type of the specified array
     *         is not a supertype of the runtime type of every element in
     *         this collection
     * @throws NullPointerException if the specified array is null
     */
    &lt;T> T[] toArray(T[] a);

    // Modification Operations

    /**
     * Ensures that this collection contains the specified element (optional
     * operation).  Returns <tt>true</tt> if this collection changed as a
     * result of the call.  (Returns <tt>false</tt> if this collection does
     * not permit duplicates and already contains the specified element.)<p>
     *
     * Collections that support this operation may place limitations on what
     * elements may be added to this collection.  In particular, some
     * collections will refuse to add <tt>null</tt> elements, and others will
     * impose restrictions on the type of elements that may be added.
     * Collection classes should clearly specify in their documentation any
     * restrictions on what elements may be added.<p>
     *
     * If a collection refuses to add a particular element for any reason
     * other than that it already contains the element, it <i>must</i> throw
     * an exception (rather than returning <tt>false</tt>).  This preserves
     * the invariant that a collection always contains the specified element
     * after this call returns.
     *
     * @param e element whose presence in this collection is to be ensured
     * @return <tt>true</tt> if this collection changed as a result of the
     *         call
     * @throws UnsupportedOperationException if the <tt>add</tt> operation
     *         is not supported by this collection
     * @throws ClassCastException if the class of the specified element
     *         prevents it from being added to this collection
     * @throws NullPointerException if the specified element is null and this
     *         collection does not permit null elements
     * @throws IllegalArgumentException if some property of the element
     *         prevents it from being added to this collection
     * @throws IllegalStateException if the element cannot be added at this
     *         time due to insertion restrictions
     */
    boolean add(E e);

    /**
     * Removes a single instance of the specified element from this
     * collection, if it is present (optional operation).  More formally,
     * removes an element <tt>e</tt> such that
     * <tt>(o==null&nbsp;?&nbsp;e==null&nbsp;:&nbsp;o.equals(e))</tt>, if
     * this collection contains one or more such elements.  Returns
     * <tt>true</tt> if this collection contained the specified element (or
     * equivalently, if this collection changed as a result of the call).
     *
     * @param o element to be removed from this collection, if present
     * @return <tt>true</tt> if an element was removed as a result of this call
     * @throws ClassCastException if the type of the specified element
     *         is incompatible with this collection
     *         (<a href="#optional-restrictions">optional</a>)
     * @throws NullPointerException if the specified element is null and this
     *         collection does not permit null elements
     *         (<a href="#optional-restrictions">optional</a>)
     * @throws UnsupportedOperationException if the <tt>remove</tt> operation
     *         is not supported by this collection
     */
    boolean remove(Object o);


    // Bulk Operations

    /**
     * Returns <tt>true</tt> if this collection contains all of the elements
     * in the specified collection.
     *
     * @param  c collection to be checked for containment in this collection
     * @return <tt>true</tt> if this collection contains all of the elements
     *         in the specified collection
     * @throws ClassCastException if the types of one or more elements
     *         in the specified collection are incompatible with this
     *         collection
     *         (<a href="#optional-restrictions">optional</a>)
     * @throws NullPointerException if the specified collection contains one
     *         or more null elements and this collection does not permit null
     *         elements
     *         (<a href="#optional-restrictions">optional</a>),
     *         or if the specified collection is null.
     * @see    #contains(Object)
     */
    boolean containsAll(Collection&lt;?> c);

    /**
     * Adds all of the elements in the specified collection to this collection
     * (optional operation).  The behavior of this operation is undefined if
     * the specified collection is modified while the operation is in progress.
     * (This implies that the behavior of this call is undefined if the
     * specified collection is this collection, and this collection is
     * nonempty.)
     *
     * @param c collection containing elements to be added to this collection
     * @return <tt>true</tt> if this collection changed as a result of the call
     * @throws UnsupportedOperationException if the <tt>addAll</tt> operation
     *         is not supported by this collection
     * @throws ClassCastException if the class of an element of the specified
     *         collection prevents it from being added to this collection
     * @throws NullPointerException if the specified collection contains a
     *         null element and this collection does not permit null elements,
     *         or if the specified collection is null
     * @throws IllegalArgumentException if some property of an element of the
     *         specified collection prevents it from being added to this
     *         collection
     * @throws IllegalStateException if not all the elements can be added at
     *         this time due to insertion restrictions
     * @see #add(Object)
     */
    boolean addAll(Collection&lt;? extends E> c);

    /**
     * Removes all of this collection's elements that are also contained in the
     * specified collection (optional operation).  After this call returns,
     * this collection will contain no elements in common with the specified
     * collection.
     *
     * @param c collection containing elements to be removed from this collection
     * @return <tt>true</tt> if this collection changed as a result of the
     *         call
     * @throws UnsupportedOperationException if the <tt>removeAll</tt> method
     *         is not supported by this collection
     * @throws ClassCastException if the types of one or more elements
     *         in this collection are incompatible with the specified
     *         collection
     *         (<a href="#optional-restrictions">optional</a>)
     * @throws NullPointerException if this collection contains one or more
     *         null elements and the specified collection does not support
     *         null elements
     *         (<a href="#optional-restrictions">optional</a>),
     *         or if the specified collection is null
     * @see #remove(Object)
     * @see #contains(Object)
     */
    boolean removeAll(Collection&lt;?> c);

    /**
     * Removes all of the elements of this collection that satisfy the given
     * predicate.  Errors or runtime exceptions thrown during iteration or by
     * the predicate are relayed to the caller.
     *
     * @implSpec
     * The default implementation traverses all elements of the collection using
     * its {@link #iterator}.  Each matching element is removed using
     * {@link Iterator#remove()}.  If the collection's iterator does not
     * support removal then an {@code UnsupportedOperationException} will be
     * thrown on the first matching element.
     *
     * @param filter a predicate which returns {@code true} for elements to be
     *        removed
     * @return {@code true} if any elements were removed
     * @throws NullPointerException if the specified filter is null
     * @throws UnsupportedOperationException if elements cannot be removed
     *         from this collection.  Implementations may throw this exception if a
     *         matching element cannot be removed or if, in general, removal is not
     *         supported.
     * @since 1.8
     */
    default boolean removeIf(Predicate&lt;? super E> filter) {
        Objects.requireNonNull(filter);
        boolean removed = false;
        final Iterator<E> each = iterator();
        while (each.hasNext()) {
            if (filter.test(each.next())) {
                each.remove();
                removed = true;
            }
        }
        return removed;
    }

    /**
     * Retains only the elements in this collection that are contained in the
     * specified collection (optional operation).  In other words, removes from
     * this collection all of its elements that are not contained in the
     * specified collection.
     *
     * @param c collection containing elements to be retained in this collection
     * @return <tt>true</tt> if this collection changed as a result of the call
     * @throws UnsupportedOperationException if the <tt>retainAll</tt> operation
     *         is not supported by this collection
     * @throws ClassCastException if the types of one or more elements
     *         in this collection are incompatible with the specified
     *         collection
     *         (<a href="#optional-restrictions">optional</a>)
     * @throws NullPointerException if this collection contains one or more
     *         null elements and the specified collection does not permit null
     *         elements
     *         (<a href="#optional-restrictions">optional</a>),
     *         or if the specified collection is null
     * @see #remove(Object)
     * @see #contains(Object)
     */
    boolean retainAll(Collection&lt;?> c);

    /**
     * Removes all of the elements from this collection (optional operation).
     * The collection will be empty after this method returns.
     *
     * @throws UnsupportedOperationException if the <tt>clear</tt> operation
     *         is not supported by this collection
     */
    void clear();


    // Comparison and hashing

    /**
     * Compares the specified object with this collection for equality. <p>
     *
     * While the <tt>Collection</tt> interface adds no stipulations to the
     * general contract for the <tt>Object.equals</tt>, programmers who
     * implement the <tt>Collection</tt> interface "directly" (in other words,
     * create a class that is a <tt>Collection</tt> but is not a <tt>Set</tt>
     * or a <tt>List</tt>) must exercise care if they choose to override the
     * <tt>Object.equals</tt>.  It is not necessary to do so, and the simplest
     * course of action is to rely on <tt>Object</tt>'s implementation, but
     * the implementor may wish to implement a "value comparison" in place of
     * the default "reference comparison."  (The <tt>List</tt> and
     * <tt>Set</tt> interfaces mandate such value comparisons.)<p>
     *
     * The general contract for the <tt>Object.equals</tt> method states that
     * equals must be symmetric (in other words, <tt>a.equals(b)</tt> if and
     * only if <tt>b.equals(a)</tt>).  The contracts for <tt>List.equals</tt>
     * and <tt>Set.equals</tt> state that lists are only equal to other lists,
     * and sets to other sets.  Thus, a custom <tt>equals</tt> method for a
     * collection class that implements neither the <tt>List</tt> nor
     * <tt>Set</tt> interface must return <tt>false</tt> when this collection
     * is compared to any list or set.  (By the same logic, it is not possible
     * to write a class that correctly implements both the <tt>Set</tt> and
     * <tt>List</tt> interfaces.)
     *
     * @param o object to be compared for equality with this collection
     * @return <tt>true</tt> if the specified object is equal to this
     * collection
     *
     * @see Object#equals(Object)
     * @see Set#equals(Object)
     * @see List#equals(Object)
     */
    boolean equals(Object o);

    /**
     * Returns the hash code value for this collection.  While the
     * <tt>Collection</tt> interface adds no stipulations to the general
     * contract for the <tt>Object.hashCode</tt> method, programmers should
     * take note that any class that overrides the <tt>Object.equals</tt>
     * method must also override the <tt>Object.hashCode</tt> method in order
     * to satisfy the general contract for the <tt>Object.hashCode</tt> method.
     * In particular, <tt>c1.equals(c2)</tt> implies that
     * <tt>c1.hashCode()==c2.hashCode()</tt>.
     *
     * @return the hash code value for this collection
     *
     * @see Object#hashCode()
     * @see Object#equals(Object)
     */
    int hashCode();

    /**
     * Creates a {@link Spliterator} over the elements in this collection.
     *
     * Implementations should document characteristic values reported by the
     * spliterator.  Such characteristic values are not required to be reported
     * if the spliterator reports {@link Spliterator#SIZED} and this collection
     * contains no elements.
     *
     * <p>The default implementation should be overridden by subclasses that
     * can return a more efficient spliterator.  In order to
     * preserve expected laziness behavior for the {@link #stream()} and
     * {@link #parallelStream()}} methods, spliterators should either have the
     * characteristic of {@code IMMUTABLE} or {@code CONCURRENT}, or be
     * <em><a href="Spliterator.html#binding">late-binding</a></em>.
     * If none of these is practical, the overriding class should describe the
     * spliterator's documented policy of binding and structural interference,
     * and should override the {@link #stream()} and {@link #parallelStream()}
     * methods to create streams using a {@code Supplier} of the spliterator,
     * as in:
     * &lt;pre>
     *     Stream&lt;E> s = StreamSupport.stream(() -> spliterator(), spliteratorCharacteristics)
     * &lt;/pre>
     * <p>These requirements ensure that streams produced by the
     * {@link #stream()} and {@link #parallelStream()} methods will reflect the
     * contents of the collection as of initiation of the terminal stream
     * operation.
     *
     * @implSpec
     * The default implementation creates a
     * <em><a href="Spliterator.html#binding">late-binding</a></em> spliterator
     * from the collections's {@code Iterator}.  The spliterator inherits the
     * <em>fail-fast</em> properties of the collection's iterator.
     * <p>
     * The created {@code Spliterator} reports {@link Spliterator#SIZED}.
     *
     * @implNote
     * The created {@code Spliterator} additionally reports
     * {@link Spliterator#SUBSIZED}.
     *
     * <p>If a spliterator covers no elements then the reporting of additional
     * characteristic values, beyond that of {@code SIZED} and {@code SUBSIZED},
     * does not aid clients to control, specialize or simplify computation.
     * However, this does enable shared use of an immutable and empty
     * spliterator instance (see {@link Spliterators#emptySpliterator()}) for
     * empty collections, and enables clients to determine if such a spliterator
     * covers no elements.
     *
     * @return a {@code Spliterator} over the elements in this collection
     * @since 1.8
     */
    @Override
    default Spliterator&lt;E> spliterator() {
        return Spliterators.spliterator(this, 0);
    }

    /**
     * Returns a sequential {@code Stream} with this collection as its source.
     *
     * <p>This method should be overridden when the {@link #spliterator()}
     * method cannot return a spliterator that is {@code IMMUTABLE},
     * {@code CONCURRENT}, or <em>late-binding</em>. (See {@link #spliterator()}
     * for details.)
     *
     * @implSpec
     * The default implementation creates a sequential {@code Stream} from the
     * collection's {@code Spliterator}.
     *
     * @return a sequential {@code Stream} over the elements in this collection
     * @since 1.8
     */
    default Stream&lt;E> stream() {
        return StreamSupport.stream(spliterator(), false);
    }

    /**
     * Returns a possibly parallel {@code Stream} with this collection as its
     * source.  It is allowable for this method to return a sequential stream.
     *
     * <p>This method should be overridden when the {@link #spliterator()}
     * method cannot return a spliterator that is {@code IMMUTABLE},
     * {@code CONCURRENT}, or <em>late-binding</em>. (See {@link #spliterator()}
     * for details.)
     *
     * @implSpec
     * The default implementation creates a parallel {@code Stream} from the
     * collection's {@code Spliterator}.
     *
     * @return a possibly parallel {@code Stream} over the elements in this
     * collection
     * @since 1.8
     */
    default Stream&lt;E> parallelStream() {
        return StreamSupport.stream(spliterator(), true);
    }
}
</pre>

## Set 接口

接下来 [Set][] 接口固然是我们开始的地方了。我们可以直接通过阅读源代码来了解`Set`接口为我们提供的基本操作：

<pre class="brush: java">
package java.util;

/**
 * A collection that contains no duplicate elements.  More formally, sets * 一个不包含重复元素的集合。严格来讲，一个集
 * contain no pair of elements e1 and e2 such that                        * 中不存在元素对 e1 e2 使得 e1.equals(e2)，
 * e1.equals(e2), and at most one null element.  As implied by            * 且最多包含一个 null 元素。正如其名，Set 接口
 * its name, this interface models the mathematical set abstraction.      * 模拟的正是数学中的集抽象
 *
 * The <tt>Set</tt> interface places additional stipulations,             * 比起直接继承自`Collection`接口，
 * beyond those inherited from the <tt>Collection</tt> interface,         * `Set`接口对`add`、`equals`、`hashCode`方法
 * on the contracts of all constructors and on the contracts of           * 和所有构造器添加了更多的规定。
 * the <tt>add</tt>, <tt>equals</tt> and <tt>hashCode</tt> methods.
 * Declarations for other inherited methods are also included here        * 同时，为了方便，其他直接继承的方法也在此处
 * for convenience.  (The specifications accompanying these               * 重新声明了。（与这些声明相关的使用规范也被
 * declarations have been tailored to the <tt>Set</tt> interface,         * 写到了`Set`接口中，但没有添加任何新的规定）
 * but they do not contain any additional stipulations.)
 *
 * The additional stipulation on constructors is, not surprisingly,
 * that all constructors must create a set that contains no duplicate
 * elements (as defined above).
 *
 * Note: Great care must be exercised if mutable objects are used as set
 * elements.  The behavior of a set is not specified if the value
 * of an object is changed in a manner that affects <tt>equals</tt>
 * comparisons while the object is an element in the set. 
 * A special case of this prohibition is that it is not permissible
 * for a set to contain itself as an element.
 *
 * Some set implementations have restrictions on the elements that
 * they may contain.  For example, some implementations prohibit
 * null elements, and some have restrictions on the types of
 * their elements. Attempting to add an ineligible element throws
 * an unchecked exception, typically <tt>NullPointerException</tt> or
 * <tt>ClassCastException</tt>. Attempting to query the presence of
 * an ineligible element may throw an exception, or it may simply
 * return false; some implementations will exhibit the former
 * behavior and some will exhibit the latter.  More generally,
 * attempting an operation on an ineligible element whose completion
 * would not result in the insertion of an ineligible element
 * into the set may throw an exception or it may succeed,
 * at the option of the implementation.
 * Such exceptions are marked as "optional" in the specification
 * for this interface.
 *
 * This interface is a member of the Java Collections Framework.
 */
public interface Set&lt;E&gt; extends Collection&lt;E&gt; {
    // 查询操作

    /**
     * Returns the number of elements in this set (its cardinality).       * 返回集中的元素个数（它的势）。
     * If this set contains more than `Integer.MAX_VALUE` elements,        * 如果集中的元素个数超过`Integer.MAX_VALUE`，
     * returns `Integer.MAX_VALUE`.                                        * 则返回`Integer.Max_Value`
     */
    int size();

    /**
     * Returns `true` if this set contains no elements.                    * 若该集中不包含任何元素则返回`true`
     */
    boolean isEmpty();

    /**
     * Returns `true` if this set contains the specified element.          * 若该集包含给定的元素，返回`true`
     * More formally, returns `true` if and only if this set               * 形式上说，当且仅当集中包含元素`e`使得
     * contains an element `e` such that                                   * (o == null ? e == null : o.equals(e)) 时，
     * `(o == null ? e==null : o.equals(e))`.                              * 该方法返回`true`
     *
     * @throws ClassCastException if the type of the specified element     * （可选）若给定的元素类型与该集不相容，
     *         is incompatible with this set                               *         抛出`ClassCastException`
     * (&lt;a href="Collection.html#optional-restrictions">optional</a>)
     * @throws NullPointerException if the specified element is null and   * （可选）若给定的元素为`null`且该集不允许包含`null`
     *         this set does not permit null elements                      *         抛出`NullPointerException`
     * (&lt;a href="Collection.html#optional-restrictions">optional</a>)
     */
    boolean contains(Object o);

    /**
     * Returns an iterator over the elements in this set.                  * 返回一个遍历该集所有元素的迭代器。
     * The elements are returned in no particular order                    * 元素可不以特定的顺序返回，
     * (unless this set is an instance of some class                       * 除非该集所属的类提供了这样的功能。
     * that provides a guarantee).
     */
    Iterator&lt;E&gt; iterator();

    /**
     * Returns an array containing all of the elements in this set.        * 返回一个包含集中所有元素的数组。
     * If this set makes any guarantees as to what order its elements      * 如果该集保证了它的迭代器返回元素的顺序，
     * are returned by its iterator, this method must return the           * 该方法也须以同样的顺序返回元素。
     * elements in the same order.
     *
     * The returned array will be "safe" in that no references to it       * 该方法返回的数组是“安全”的，
     * are maintained by this set.  (In other words, this method must      * 因为集本身不会维持对它的引用。
     * allocate a new array even if this set is backed by an array).       * 换句话说，即使该集就是用一个数组实现的，
     * The caller is thus free to modify the returned array.               * 该方法也必须重新分配一个数组
     *                                                                     * 因此，调用者可随机修改返回的数组
     */
    Object[] toArray();

    /**
     * Returns an array containing all of the elements in this set; the    * 返回一个包含集中所有元素的数组，
     * runtime type of the returned array is that of the specified array.  * 其运行时类型与给定的数组相同。
     * If the set fits in the specified array, it is returned therein.     * 如果集中的元素可以放入给定的数组，
     * Otherwise, a new array is allocated with the runtime type of the    * 元素们将会被放入该给定的数组并返回。
     * specified array and the size of this set.                           * 否则，该方法将创建一个新的数组，
     *                                                                     * 该数组的运行时类型与给定的数组相同，
     *                                                                     * 且大小与集相同。
     *
     * If this set fits in the specified array with room to spare          * 如果集中的元素可以放入给定的数组，
     * (i.e., the array has more elements than this set), the element in   * 换句话说该数组的元素比该集多，
     * the array immediately following the end of the set is set to        * 集中的元素放入到给定的数组中后，
     * `null`.  (This is useful in determining the length of this          * 数组尾部多余的元素将被置为`null`。
     * set <i>only</i> if the caller knows that this set does not contain  * 这样的机制可让调用者方便地得知数组的真实长度，
     * any null elements.)                                                 * 如果他能确定原本的集合中不包含`null`。
     *
     * If this set makes any guarantees as to what order its elements      * 如果该集保证了它的迭代器返回元素的顺序，
     * are returned by its iterator, this method must return the           * 该方法也须以同样的顺序返回元素。
     * elements in the same order.
     *
     * Like the `toArray()` method, this method acts as bridge between     * 正如`toArray()`方法，该方法可作为基于数组的 API
     * array-based and collection-based APIs.  Further, this method allows * 和基于集合的 API 之间的桥梁。
     * precise control over the runtime type of the output array, and may, * 除此之外，该方法可以精确控制返回数组的运行时类型，
     * under certain circumstances, be used to save allocation costs.      * 在某些情况下也可用于减少创建新数组的消耗
     *
     * Suppose `x` is a set known to contain only strings.                 * 假设我们知道集`x`只包含字符串。
     * The following code can be used to dump the set                      * 如下代码可用于将该集放入到一个新创建的
     * into a newly allocated array of `String`:                           * `String`数组中：
     *
     * &lt;pre>String[] y = x.toArray(new String[0]);&lt;/pre>
     *
     * Note that `toArray(new Object[0])`                                  * 注意，语句`toArray(new Object[0])`
     * is identical in function to `toArray()`.                            * 在功能上与`toArray()`相同
     *
     * @throws ArrayStoreException if the runtime type of                  * 若给定数组的运行时类型不是集中任意元素
     *         the specified array is not a supertype of the runtime type  * 的运行时类型的父类型，
     *         of every element in this set                                * 抛出`ArrayStoreException`
     * @throws NullPointerException if the specified array is null         * 如果给定的数组为`null`，抛出`NullPointerException`
     */
    &lt;T&gt; T[] toArray(T[] a);

    // 修改操作

    /**
     * Adds the specified element to this set if it is not already present * （可选）如果集中不存在，则将给定的元素放入到
     * (optional operation).  More formally, adds the specified element    * 集中。形式上说，给定元素`e`，若集中不包含元素`e2`
     * `e` to this set if the set contains no element `e2`                 * 使得`(e == null ? e2 == null : e.equals(e2))`，
     * such that                                                           * 元素`e`将被放入集中。
     * `(e == null ? e2 == null : e.equals(e2))`.                
     * If this set already contains the element, the call leaves the set   * 如果集中已经包含这样的元素，集将不会发生改变，
     * unchanged and returns `false`.  In combination with the             * 且该方法返回`true`。结合构造器的限制，
     * restriction on constructors, this ensures that sets never contain   * 这使得一个集永远不会包含重复元素。
     * duplicate elements.
     *
     * The stipulation above does not imply that sets must accept all
     * elements; sets may refuse to add any particular element, including
     * `null`, and throw an exception, as described in the
     * specification for {@link Collection#add Collection.add}.
     * Individual set implementations should clearly document any
     * restrictions on the elements that they may contain.
     *
     * @param e element to be added to this set
     * @return `true` if this set did not already contain the specified
     *         element
     * @throws UnsupportedOperationException if the `add` operation
     *         is not supported by this set
     * @throws ClassCastException if the class of the specified element
     *         prevents it from being added to this set
     * @throws NullPointerException if the specified element is null and this
     *         set does not permit null elements
     * @throws IllegalArgumentException if some property of the specified element
     *         prevents it from being added to this set
     */
    boolean add(E e);

    /** 从集中删除给定元素 */
    boolean remove(Object o);

    // 批量操作
    boolean containsAll(Collection&lt;?&gt; c);
    boolean addAll(Collection&lt;? extends E&gt; c);
    boolean retainAll(Collection&lt;?&gt; c);
    boolean removeAll(Collection&lt;?&gt; c);
    void clear();

    // 比较与哈希
    boolean equals(Object o);
    int hashCode();

    @Override
    default Spliterator&lt;E&gt; spliterator() {
        return Spliterators.spliterator(this, Spliterator.DISTINCT);
    }
}
</pre>

并没有什么特别的函数，大部分函数的用处只要是用过`Set`的读者应该都了解。方法的具体功能可参考`Set`的
[JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/util/Set.html)。


<h2 class="jump">set类之HashSet实现类</h2>
<p>我们直接通过阅读最简单的Set实现类HashSet来加深大家对Set的理解：</p>
<pre class="brush: java">
package java.util;

import java.io.InvalidObjectException;

/**
 * This class implements the Set interface, backed by a hash table             * 该类利用了一个哈希表（实际上是个HashMap实例）来实现Set接口。
 * (actually a HashMap instance).  It makes no guarantees as to the            * 该类并不保证
 * iteration order of the set; in particular, it does not guarantee that the   * set中元素的遍历次序；尤其是，该类不保证其遍历次序
 * order will remain constant over time.  This class permits the null          * 不会随着时间而改变。该类允许null元素的存在。
 * element.
 *
 * This class offers constant time performance for the basic operations        * 该类保证基本操作在时间上的性能基本上是不变的（o(1)），
 * (add, remove, contains and size),
 * assuming the hash function disperses the elements properly among the        * 假设哈希函数可以把元素们恰当地分散在桶（buckets）里。
 * buckets.  Iterating over this set requires time proportional to the sum of                       
 * the HashSet instance's size (the number of elements) plus the               * 遍历该set的所需时间大致与HashSet实例大小和其HashMap实例容量
 * "capacity" of the backing HashMap instance (the number of                   * 的总和成正比。（o(m+n)）
 * buckets).  Thus, it's very important not to set the initial capacity too    * 因此如果遍历性能很重要的话，请不要把初始容量设置得太高
 * high (or the load factor too low) if iteration performance is important.    * （或把载入因子设置得太低）
 *
 * Note that this implementation is not synchronized.                          * 请注意，该实现类并不是线程同步的。
 * If multiple threads access a hash set concurrently, and at least one of     * 如果多个线程会同时访问该哈希集合，且存在至少一个
 * the threads modifies the set, it must be synchronized externally.           * 线程会修改它，那么在必须在外部将其声明为synchronized
 * This is typically accomplished by synchronizing on some object that         * 通常这会通过对某个封装了该集合的包装类加同步锁来使
 * naturally encapsulates the set.                                             * 其线程同步
 *
 * If no such object exists, the set should be "wrapped" using the             * 如果并不存在这样的一个包装类，集合应用Collections.synchronizedSet方法
 * {@link Collections#synchronizedSet Collections.synchronizedSet}             * 进行封装。
 * method.  This is best done at creation time, to prevent accidental          * 该操作最好进行在实例创建时，以免意外地对集合产生了未同步的访问。
 * unsynchronized access to the set:
 *   Set s = Collections.synchronizedSet(new HashSet(...));
 *
 * The iterators returned by this class's iterator method are                  * 由该类的iterator方法返回的迭代器是快速失败（fail-fast）的：
 * fail-fast: if the set is modified at any time after the iterator is         * 如果在迭代器创建后，集合通过除迭代器自己的remove方法以外的途径
 * created, in any way except through the iterator's own remove                * 发生了修改，
 * method, the Iterator throws a {@link ConcurrentModificationException}.      * Iterator便会抛出一个ConcurrentModificationException。
 * Thus, in the face of concurrent modification, the iterator fails quickly    * 因此在发生并发修改时，迭代器会快速且优雅地失败掉，而不是
 * and cleanly, rather than risking arbitrary, non-deterministic behavior at   * 冒险在未来继续进行不确定的行为。
 * an undetermined time in the future.
 *
 * Note that the fail-fast behavior of an iterator cannot be guaranteed        * 注意，迭代器的快速失败特性并非是完全保证的，
 * as it is, generally speaking, impossible to make any hard guarantees in the * 或者说，并不保证到未同步的并发修改出现时，
 * presence of unsynchronized concurrent modification.  Fail-fast iterators    * 迭代器真的会快速失败。迭代器抛出ConcurrentModificationException
 * throw ConcurrentModificationException on a best-effort basis.               * 本身只是尽力而为（best-effort）的。
 * Therefore, it would be wrong to write a program that depended on this       * 因此，请不要基于该exception的正确性来编写代码（因为它并不保证自己的正确性），
 * exception for its correctness: the fail-fast behavior of iterators          * 迭代器的快速失败特性仅应用来检查bug。
 * should be used only to detect bugs.
 *
 * This class is a member of the                                               * 该类为Java Collections Framework成员之一。
 * Java Collections Framework.
 */

public class HashSet&lt;E&gt;
    extends AbstractSet&lt;E&gt;
    implements Set&lt;E&gt;, Cloneable, java.io.Serializable
{
    static final long serialVersionUID = -5024744406713321676L;

    private transient HashMap&lt;E,Object&gt; map;
    // 可以看到，HashSet的实现就是完全基于HashMap的，因为
    // HashMap保证了它的key唯一

    // Dummy value to associate with an Object in the backing Map
    private static final Object PRESENT = new Object();
    // HashSet只会用到HashMap的key，因此用这个dummy来作为value。

    /**
     * Constructs a new, empty set; the backing HashMap instance has
     * default initial capacity (16) and load factor (0.75).
     */
    // HashMap的默认容量为16，默认载入因子为0.75 （详见HashMap源代码）
    public HashSet() {
        map = new HashMap&lt;&gt;();
    }

    /**
     * ...
     */
    public HashSet(Collection&lt;? extends E&gt; c) {
        ...
    }

    /**
     * ...
     */
    public HashSet(int initialCapacity, float loadFactor) {
        ...
    }

    /**
     * ...
     */
    public HashSet(int initialCapacity) {
        ...
    }

    /**
     * ...
     */
    HashSet(int initialCapacity, float loadFactor, boolean dummy) {
        ...
    }

    /**
     * Returns an iterator over the elements in this set.  The elements
     * are returned in no particular order.
     *
     * @return an Iterator over the elements in this set
     * @see ConcurrentModificationException
     */
    public Iterator&lt;E&gt; iterator() {
        // 该方法返回的iterator并不保证元素的遍历次序，有可能先后返回的同一个集合的两个iterator有完全不同的遍历次序
        return map.keySet().iterator();
    }

    public int size() {
        return map.size();
    }

    public boolean isEmpty() {
        return map.isEmpty();
    }

    public boolean contains(Object o) {
        return map.containsKey(o);
    }

    public boolean add(E e) {
        return map.put(e, PRESENT)==null;
    }

    public boolean remove(Object o) {
        return map.remove(o)==PRESENT;
    }

    public void clear() {
        map.clear();
    }

    /**
     * Returns a shallow copy of this &lt;tt&gt;HashSet&lt;/tt&gt; instance: the elements
     * themselves are not cloned.
     *
     * 这只是对HashSet的一个浅复制，元素本身没有被复制。
     * @return a shallow copy of this set
     */
    @SuppressWarnings("unchecked")
    public Object clone() {
        try {
            HashSet&lt;E&gt; newSet = (HashSet&lt;E&gt;) super.clone();
            newSet.map = (HashMap&lt;E, Object&gt;) map.clone();
            return newSet;
        } catch (CloneNotSupportedException e) {
            throw new InternalError(e);
        }
    }

    // 来自Serializable的writeObject方法
    private void writeObject(java.io.ObjectOutputStream s)
        throws java.io.IOException {
        // Write out any hidden serialization magic
        s.defaultWriteObject();

        // Write out HashMap capacity and load factor
        s.writeInt(map.capacity());
        s.writeFloat(map.loadFactor());

        // Write out size
        s.writeInt(map.size());

        // Write out all elements in the proper order.
        for (E e : map.keySet())
            s.writeObject(e);
    }

    // 来自Serializable的readObject方法
    private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
        // Read in any hidden serialization magic
        s.defaultReadObject();

        // Read capacity and verify non-negative.
        int capacity = s.readInt();
        if (capacity &lt; 0) {
            throw new InvalidObjectException("Illegal capacity: " +
                                             capacity);
        }

        // Read load factor and verify positive and non NaN.
        float loadFactor = s.readFloat();
        if (loadFactor &lt;= 0 || Float.isNaN(loadFactor)) {
            throw new InvalidObjectException("Illegal load factor: " +
                                             loadFactor);
        }

        // Read size and verify non-negative.
        int size = s.readInt();
        if (size &lt; 0) {
            throw new InvalidObjectException("Illegal size: " +
                                             size);
        }

        // Set the capacity according to the size and load factor ensuring that
        // the HashMap is at least 25% full but clamping to maximum capacity.
        capacity = (int) Math.min(size * Math.min(1 / loadFactor, 4.0f),
                HashMap.MAXIMUM_CAPACITY);

        // Create backing HashMap
        map = (((HashSet&lt;?&gt;)this) instanceof LinkedHashSet ?
               new LinkedHashMap&lt;E,Object&gt;(capacity, loadFactor) :
               new HashMap&lt;E,Object&gt;(capacity, loadFactor));

        // Read in all elements in the proper order.
        for (int i=0; i&lt;size; i++) {
            @SuppressWarnings("unchecked")
                E e = (E) s.readObject();
            map.put(e, PRESENT);
        }
    }

    public Spliterator&lt;E&gt; spliterator() {
        return new HashMap.KeySpliterator&lt;E,Object&gt;(map, 0, -1, 0, 0);
    }
}
</pre>

<p>
综上，我们即可得出结论：HashSet的实现完全基于HashMap保证key唯一的特性，HashSet以其元素作为HashMap的键，以一个private static的dummy作为HashMap的value（因为value根本不重要）。
</p>

<h2 class="jump">set类之TreeSet实现类</h2>
<p>刚刚我们了解到，HashSet完全基于HashMap键唯一的特性来对元素去重，而HashMap的键判重和查询是基于哈希函数的，因此HashSet的add、remove、contains和size的时间复杂度为o(1)，而遍历的时间复杂度为o(m+n)</p>
<p>为了实现判重，还有一种算法是基于树的算法，对应的则为TreeSet。那么你也许会觉得，TreeSet会不会也是完全基于TreeMap的呢？呵呵，你答对了。</p>
<pre class="brush: java">
package java.util;

/**
 * A NavigableSet implementation based on a TreeMap.                        * 基于TreeMap的NavigableSet实现类
 * The elements are ordered using their Comparable natural                  * 元素是基于其Comparable顺序有序的，
 * ordering, or by a Comparator provided at set creation                    * 也可基于在集合创建时所使用的Comparator，
 * time, depending on which constructor is used.                            * 取决于你使用的构造函数。
 *
 * This implementation provides guaranteed log(n) time cost for the basic   * 该实现保证集合基本操作add、remove和contains的
 * operations (add, remove and contains).                                   * 时间复杂度为o(log(n))
 *
 * Note that the ordering maintained by a set (whether or not an explicit   * 注意，集合所维护的元素次序（无论是否由一个comparator显式提供）
 * comparator is provided) must be consistent with equals if it is to       * 都应该像是实现了Set接口那样正确地返回与equals相同的结果。
 * correctly implement the Set interface. 
 * This is so because the Set interface is defined in                       * 这么做是因为Set接口是基于equals方法定义的，
 * terms of the equals operation, but a TreeSet instance                    * 而TreeSet实例通过其compareTo或compare方法来进行元素间的比较，
 * performs all element comparisons using its compareTo (or
 * compare) method, so two elements that are deemed equal by this method    * 所以TreeSet中两个元素相等的定义应同集合元素相等的定义保持一致。
 * are, from the standpoint of the set, equal.  The behavior of a set       * 即使TreeSet的元素次序与equals函数不吻合，它的行为
 * is well-defined even if its ordering is inconsistent with equals; it     * 依然是明确定义的，只是它违反了Set接口的约束。
 * just fails to obey the general contract of the Set interface.
 *
 * This class is a member of the                                            * TreeSet是Java Collections Framework的成员之一。
 * Java Collections Framework.
 */

public class TreeSet&lt;E&gt; extends AbstractSet&lt;E&gt;
    implements NavigableSet&lt;E&gt;, Cloneable, java.io.Serializable
{
    /**
     * The backing map.
     */
    private transient NavigableMap&lt;E,Object&gt; m;
    // TreeSet所基于的NaviableMap，默认为TreeMap

    // Dummy value to associate with an Object in the backing Map
    private static final Object PRESENT = new Object();

    // 自定义TreeSet所基于的NavigableMap
    TreeSet(NavigableMap&lt;E,Object&gt; m) {
        this.m = m;
    }

    // 默认基于TreeMap
    public TreeSet() {
        this(new TreeMap&lt;E,Object&gt;());
    }

    // 指定comparamtor
    public TreeSet(Comparator&lt;? super E&gt; comparator) {
        this(new TreeMap&lt;&gt;(comparator));
    }

    // 深复制拷贝构造
    public TreeSet(Collection&lt;? extends E&gt; c) {
        this();
        addAll(c);
    }
    
    // 深复制拷贝构造
    public TreeSet(SortedSet&lt;E&gt; s) {
        this(s.comparator());
        addAll(s);
    }

    // 和HashSet的iterator有同样的特性
    public Iterator&lt;E&gt; iterator() {
        return m.navigableKeySet().iterator();
    }

    // 降序
    public Iterator&lt;E&gt; descendingIterator() {
        return m.descendingKeySet().iterator();
    }
    public NavigableSet&lt;E&gt; descendingSet() {
        return new TreeSet&lt;&gt;(m.descendingMap());
    }

    public int size() {
        return m.size();
    }

    public boolean isEmpty() {
        return m.isEmpty();
    }

    public boolean contains(Object o) {
        return m.containsKey(o);
    }

    public boolean add(E e) {
        return m.put(e, PRESENT)==null;
    }

    public boolean remove(Object o) {
        return m.remove(o)==PRESENT;
    }

    public void clear() {
        m.clear();
    }

    public  boolean addAll(Collection&lt;? extends E&gt; c) {
        // Use linear-time version if applicable
        if (m.size()==0 && c.size() &gt; 0 &&
            c instanceof SortedSet &&
            m instanceof TreeMap) {
            SortedSet&lt;? extends E&gt; set = (SortedSet&lt;? extends E&gt;) c;
            TreeMap&lt;E,Object&gt; map = (TreeMap&lt;E, Object&gt;) m;
            Comparator&lt;?&gt; cc = set.comparator();
            Comparator&lt;? super E&gt; mc = map.comparator();
            if (cc==mc || (cc != null && cc.equals(mc))) {
                map.addAllForTreeSet(set, PRESENT);
                return true;
            }
        }
        return super.addAll(c);
    }

    // 子集
    public NavigableSet&lt;E&gt; subSet(E fromElement, boolean fromInclusive,
                                  E toElement,   boolean toInclusive) {
        return new TreeSet&lt;&gt;(m.subMap(fromElement, fromInclusive,
                                       toElement,   toInclusive));
    }
    public NavigableSet&lt;E&gt; headSet(E toElement, boolean inclusive) {
        return new TreeSet&lt;&gt;(m.headMap(toElement, inclusive));
    }
    public NavigableSet&lt;E&gt; tailSet(E fromElement, boolean inclusive) {
        return new TreeSet&lt;&gt;(m.tailMap(fromElement, inclusive));
    }
    public SortedSet&lt;E&gt; subSet(E fromElement, E toElement) {
        return subSet(fromElement, true, toElement, false);
    }
    public SortedSet&lt;E&gt; headSet(E toElement) {
        return headSet(toElement, false);
    }
    public SortedSet&lt;E&gt; tailSet(E fromElement) {
        return tailSet(fromElement, true);
    }

    public Comparator&lt;? super E&gt; comparator() {
        return m.comparator();
    }

    public E first() {
        return m.firstKey();
    }

    public E last() {
        return m.lastKey();
    }

    // NavigableSet API methods
    public E lower(E e) {
        return m.lowerKey(e);
    }
    public E floor(E e) {
        return m.floorKey(e);
    }
    public E ceiling(E e) {
        return m.ceilingKey(e);
    }
    public E higher(E e) {
        return m.higherKey(e);
    }

    public E pollFirst() {
        Map.Entry&lt;E,?&gt; e = m.pollFirstEntry();
        return (e == null) ? null : e.getKey();
    }
    public E pollLast() {
        Map.Entry&lt;E,?&gt; e = m.pollLastEntry();
        return (e == null) ? null : e.getKey();
    }

    // 浅复制
    @SuppressWarnings("unchecked")
    public Object clone() {
        TreeSet&lt;E&gt; clone;
        try {
            clone = (TreeSet&lt;E&gt;) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new InternalError(e);
        }

        clone.m = new TreeMap&lt;&gt;(m);
        return clone;
    }

    // 来自Serializable的两个方法
    private void writeObject(java.io.ObjectOutputStream s)
        throws java.io.IOException {
        // Write out any hidden stuff
        s.defaultWriteObject();

        // Write out Comparator
        s.writeObject(m.comparator());

        // Write out size
        s.writeInt(m.size());

        // Write out all elements in the proper order.
        for (E e : m.keySet())
            s.writeObject(e);
    }
    private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
        // Read in any hidden stuff
        s.defaultReadObject();

        // Read in Comparator
        @SuppressWarnings("unchecked")
            Comparator&lt;? super E&gt; c = (Comparator&lt;? super E&gt;) s.readObject();

        // Create backing TreeMap
        TreeMap&lt;E,Object&gt; tm = new TreeMap&lt;&gt;(c);
        m = tm;

        // Read in size
        int size = s.readInt();

        tm.readTreeSet(size, s, PRESENT);
    }
}
</pre>

<p>综上：Set开发者们很懒</p>

<h2 class="jump">set类之EnumSet实现类</h2>
<p>实际上，EnumSet和EnumMap的Enum并不对应于查找方法中的枚举查找，而是对应于Java的enum枚举类型。</p>
<p>在这里，我并不打算贴EnumSet和EnumMap的源代码。它们的源代码并无太大的意义。它们的存在仅用于为以enum为元素的集合和以enum为键的map提供更高性能的实现。</p>
<p>我们将枚举类型放入普通的HashSet中，很可能我们会为这些enum附上对应的int值再放入HashSet，这样每个枚举常量就需要占4个字节。这里以EnumSet的简单子类（EnumSet是一个虚类）RegularEnumSet为例，其add方法源代码如下：</p>
<pre class="brush: java">
public boolean add(E e) {
  typeCheck(e);

  long oldElements = elements;
  elements |= (1L &lt;&lt; ((Enum)e).ordinal());
  return elements != oldElements;
}
</pre>
<p>从上述代码可以看出，RegularEnumSet维护一个长度为64的位向量，每一位的0或1代表着对应位置的enum常量（其ordinal值由其声明为enum类型时在声明语句中的序号所决定，由0开始数起）是否已加入到EnumSet中。由此，EnumSet对枚举类判重总共只需要8个字节，而基于int的HashSet只要放入两个以上的枚举类就超过了这个大小了，更不用提HashSet的插入效率肯定远远比不上EnumSet的位运算。</p>
<p>因此，EnumSet和EnumMap本身的算法并不特别，它们提供为key为枚举类型的map或内容为枚举类型的set提供高效的实现，当应用场景吻合时应尽量使用EnumMap和EnumSet。</p>