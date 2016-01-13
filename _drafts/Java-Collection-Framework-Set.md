---
layout: posts
title: Java 集合框架源码解析：Set
author: Robert Peng
category: Java
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

## 概述

了解 Java 集合框架每个实现类的原理是每个 Java 程序员的必修课。本系列将按照`Set`、`List`、`Map`、`Queue`、`Deque`的顺序，以 Java
的[官方教程](http://docs.oracle.com/javase/tutorial/collections/)为指导，分接口的解析每个接口对应的实现类的原理。
本篇先从`Set`接口及其常用实现类开始。

## Set 接口

`Set`接口固然是我们开始的地方了。我们开始了解`Set`接口为我们提供的操作：

<pre class="brush: java">
package java.util;

/**
 * A collection that contains no duplicate elements.  More formally, sets       * 一个不包含重复元素的集合。严格来讲，set
 * contain no pair of elements e1 and e2 such that                              * 中不存在元素对e1 e2使得e1.equals(e2)，
 * e1.equals(e2), and at most one null element.  As implied by                  * 且最多包含一个null元素。正如其名，Set接口
 * its name, this interface models the mathematical set abstraction.            * 模拟的正是数学中的set抽象
 */

public interface Set&lt;E&gt; extends Collection&lt;E&gt; {

    /** 返回集中元素的个数 */
    int size();

    /** 返回集是否为空 */
    boolean isEmpty();

    /** 返回集是否包含给定的对象 */
    boolean contains(Object o);

    /** 返回可用于迭代整个集的迭代器 */
    Iterator&lt;E&gt; iterator();
    Object[] toArray();
    &lt;T&gt; T[] toArray(T[] a);

    // 修改操作
    boolean add(E e);
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