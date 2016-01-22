---
layout: posts_forward
title: Java Reflection Tutorial
author: Oracle
org_url: "http://docs.oracle.com/javase/tutorial/reflect/index.html"
org_author: Java Tutorial
org_author_url: "http://docs.oracle.com/javase/tutorial/"
org_title: The Reflection API
---

## Introduction

### Uses of Reflection

Reflection is commonly used by programs which require the ability to examine or modify the runtime behavior of applications running in the Java virtual machine. This is a relatively advanced feature and should be used only by developers who have a strong grasp of the fundamentals of the language. With that caveat in mind, reflection is a powerful technique and can enable applications to perform operations which would otherwise be impossible.

<dl>
	<dt style="font-weight: bold">Extensibility Features</dt>
	<dd>
		An application may make use of external, user-defined classes by creating instances of extensibility objects using their fully-qualified names.
	</dd>
	<dt style="font-weight: bold">Class Browsers and Visual Development Environments</dt>
	<dd>
		A class browser needs to be able to enumerate the members of classes. Visual development environments can benefit from making use of type information available in reflection to aid the developer in writing correct code.
	</dd>
	<dt style="font-weight: bold">Debuggers and Test Tools</dt>
	<dd>
		Debuggers need to be able to examine private members on classes. Test harnesses can make use of reflection to systematically call a discoverable set APIs defined on a class, to insure a high level of code coverage in a test suite.
	</dd>
</dl>

### Drawbacks of Reflection

Reflection is powerful, but should not be used indiscriminately. If it is possible to perform an operation without using reflection, then it is preferable to avoid using it. The following concerns should be kept in mind when accessing code via reflection.

<dl>
	<dt style="font-weight: bold">Performance Overhead</dt>
	<dd>
		Because reflection involves types that are dynamically resolved, certain Java virtual machine optimizations can not be performed. Consequently, reflective operations have slower performance than their non-reflective counterparts, and should be avoided in sections of code which are called frequently in performance-sensitive applications.
	</dd>
	<dt style="font-weight: bold">Security Restrictions</dt>
	<dd>
		Reflection requires a runtime permission which may not be present when running under a security manager. This is in an important consideration for code which has to run in a restricted security context, such as in an Applet.
	</dd>
	<dt style="font-weight: bold">Exposure of Internals</dt>
	<dd>
		Since reflection allows code to perform operations that would be illegal in non-reflective code, such as accessing <code>private</code> fields and methods, the use of reflection can result in unexpected side-effects, which may render code dysfunctional and may destroy portability. Reflective code breaks abstractions and therefore may change behavior with upgrades of the platform.
	</dd>
</dl>

### Trail Lessons

This trail covers common uses of reflection for accessing and manipulating classes, fields, methods, and constructors. Each lesson contains code examples, tips, and troubleshooting information.

<dl>
	<dt><a href="#class" target="_self"><b>Classes</b></a></dt>
	<dd>
		This lesson shows the various ways to obtain a 
		<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> object and use it to examine properties of a class, including its declaration and contents.
	</dd>
	<dt><a href="#member" target="_self"><b>Members</b></a></dt>
	<dd>
		This lesson describes how to use the Reflection APIs to find the fields, methods, and constructors of a class. Examples are provided for setting and getting field values, invoking methods, and creating new instances of objects using specific constructors.
	</dd>
	<dt><a href="#special" target="_self"><b>Arrays and Enumerated Types</b></a></dt>
	<dd>
		This lesson introduces two special types of classes: arrays, which are generated at runtime, and <code>enum</code> types, which define unique named object instances. Sample code shows how to retrieve the component type for an array and how to set and get fields with array or <code>enum</code> types.
	</dd>
</dl>

<div>
	<hr />
	<strong>Note:</strong>&nbsp;<br />
	The examples in this trail are designed for experimenting with the Reflection APIs. The handling of exceptions therefore is not the same as would be used in production code. In particular, in production code it is not recommended to dump stack traces that are visible to the user.
	<hr />
</div>

<h2 id="class">Classes</h2>

<p>
	Every object is either a reference or primitive type. Reference types all inherit from 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html"><code>java.lang.Object</code></a>. Classes, enums, arrays, and interfaces are all reference types. There is a fixed set of primitive types: <code>boolean</code>, <code>byte</code>, <code>short</code>, <code>int</code>, <code>long</code>, <code>char</code>, <code>float</code>, and <code>double</code>. Examples of reference types include 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/String.html"><code>java.lang.String</code></a>, all of the wrapper classes for primitive types such as 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Double.html"><code>java.lang.Double</code></a>, the interface 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/io/Serializable.html"><code>java.io.Serializable</code></a>, and the enum 
	<a href="https://docs.oracle.com/javase/8/docs/api/javax/swing/SortOrder.html"><code>javax.swing.SortOrder</code></a>.
</p>
<p>
	For every type of object, the Java virtual machine instantiates an immutable instance of 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>java.lang.Class</code></a> which provides methods to examine the runtime properties of the object including its members and type information. 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> also provides the ability to create new classes and objects. Most importantly, it is the entry point for all of the Reflection APIs. This lesson covers the most commonly used reflection operations involving classes:
</p>

<ul>
	<li><a href="#classNew" target="_self">Retrieving Class Objects</a> describes the ways to get a 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a></li>
	<li>
		<a href="#classModifiers" target="_self">Examining Class Modifiers and Types</a> shows how to access the class declaration information
	</li>
	<li>
		<a href="#classMembers" target="_self">Discovering Class Members</a> illustrates how to list the constructors, fields, methods, and nested classes in a class
	</li>
	<li>
		<a href="#classTrouble" target="_self">Troubleshooting</a> describes common errors encountered when using 
		<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a>
	</li>
</ul>

<h3 id="classNew">Retrieving Class Objects</h3>

<p>
	The entry point for all reflection operations is 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>java.lang.Class</code></a>. With the exception of 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/ReflectPermission.html"><code>java.lang.reflect.ReflectPermission</code></a>, none of the classes in 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/package-summary.html"><code>java.lang.reflect</code></a> have public constructors. To get to these classes, it is necessary to invoke appropriate methods on 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a>. There are several ways to get a 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> depending on whether the code has access to an object, the name of class, a type, or an existing 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a>.
</p>

<h4>Object.getClass()</h4>
<p>
	If an instance of an object is available, then the simplest way to get its 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> is to invoke 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#getClass--"><code>Object.getClass()</code></a>. Of course, this only works for reference types which all inherit from 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html"><code>Object</code></a>. Some examples follow.
</p>

<pre class="brush: java">
Class c = "foo".getClass();
</pre>

<p>
	Returns the 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> for 
	<a href="https://docs.oracle.com/javase/8/docs/api/java/lang/String.html"><code>String</code></a>
</p>

<pre brush: java>
Class c = System.console().getClass();
</pre>

<p>
	here is a unique console associated with the virtual machine which is returned by the <code>static</code> method 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/System.html#console--"><code>System.console()</code></a>. The value returned by 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#getClass--"><code>getClass()</code></a> is the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponding to 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/io/Console.html"><code>java.io.Console</code></a>.</p>

<pre class="brush: java">
enum E { A, B }
Class c = A.getClass();
</pre>

<p><code>A</code> is is an instance of the enum <code>E</code>; thus 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#getClass--"><code>getClass()</code></a> returns the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponding to the enumeration type <code>E</code>.</p>

<pre class="brush: java">
byte[] bytes = new byte[1024];
Class c = bytes.getClass();
</pre>

<p>Since arrays are 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html"><code>Objects</code></a>, it is also possible to invoke 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#getClass--"><code>getClass()</code></a> on an instance of an array. The returned 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponds to an array with component type <code>byte</code>.</p>

<pre class="brush: java">
import java.util.HashSet;
import java.util.Set;

Set&lt;String&gt; s = new HashSet&lt;String&gt;();
Class c = s.getClass();
</pre>

<p>In this case, 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/util/Set.html"><code>java.util.Set</code></a> is an interface to an object of type 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/util/HashSet.html"><code>java.util.HashSet</code></a>. The value returned by 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html#getClass--"><code>getClass()</code></a> is the class corresponding to 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/util/HashSet.html"><code>java.util.HashSet</code></a>.</p>
<h2>The .class Syntax</h2>
<p>If the type is available but there is no instance then it is possible to obtain a 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> by appending <code>&quot;.class&quot;</code> to the name of the type. This is also the easiest way to obtain the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> for a primitive type.</p>

<pre class="brush: java">
boolean b;
Class c = b.getClass();   // compile-time error

Class c = boolean.class;  // correct
</pre>

<p>Note that the statement <code>boolean.getClass()</code> would produce a compile-time error because a <code>boolean</code> is a primitive type and cannot be dereferenced. The <code>.class</code> syntax returns the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponding to the type <code>boolean</code>.</p>
<pre class="brush: java">
Class c = java.io.PrintStream.class;
</pre>

<p>The variable <code>c</code> will be the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponding to the type 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/io/PrintStream.html"><code>java.io.PrintStream</code></a>.</p>

<pre class="brush: java">
Class c = int[][][].class;
</pre>

<p>
	The <code>.class</code> syntax may be used to retrieve a 
	<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponding to a multi-dimensional array of a given type.
</p>

<h4>Class.forName()</h4>

<p>If the fully-qualified name of a class is available, it is possible to get the corresponding 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> using the static method 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html#forName-java.lang.String-"><code>Class.forName()</code></a>. This cannot be used for primitive types. The syntax for names of array classes is described by 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html#getName--"><code>Class.getName()</code></a>. This syntax is applicable to references and primitive types.</p>
<div class="codeblock"><pre>
Class c = Class.forName("com.duke.MyLocaleServiceProvider");
</pre></div>
<p>This statement will create a class from the given fully-qualified name.</p>
<div class="codeblock"><pre>
Class cDoubleArray = Class.forName("[D");

Class cStringArray = Class.forName("[[Ljava.lang.String;");
</pre></div>
<p>The variable <code>cDoubleArray</code> will contain the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponding to an array of primitive type <code>double</code> (i.e. the same as <code>double[].class</code>). The <code>cStringArray</code> variable will contain the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> corresponding to a two-dimensional array of 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/String.html"><code>String</code></a> (i.e. identical to <code>String[][].class</code>).</p>
<h2>TYPE Field for Primitive Type Wrappers</h2>
<p>The <code>.class</code> syntax is a more convenient and the preferred way to obtain the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> for a primitive type; however there is another way to acquire the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a>. Each of the primitive types and <code>void</code> has a wrapper class in 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/package-summary.html"><code>java.lang</code></a> that is used for boxing of primitive types to reference types. Each wrapper class contains a field named <code>TYPE</code> which is equal to the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> for the primitive type being wrapped.</p>
<div class="codeblock"><pre>
Class c = Double.TYPE;
</pre></div>
<p>There is a class 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Double.html"><code>java.lang.Double</code></a> which is used to wrap the primitive type <code>double</code> whenever an 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Object.html"><code>Object</code></a> is required. The value of 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Double.html#TYPE"><code>Double.TYPE</code></a> is identical to that of <code>double.class</code>.</p>
<div class="codeblock"><pre>
Class c = Void.TYPE;
</pre></div>
<p>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Void.html#TYPE"><code>Void.TYPE</code></a> is identical to <code>void.class</code>.</p>
<h2>Methods that Return Classes</h2>
<p>There are several Reflection APIs which return classes but these may only be accessed if a 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> has already been obtained either directly or indirectly.</p>
<dl>
<dt>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html#getSuperclass--"><code>Class.getSuperclass()</code></a></dt>
<dd>Returns the super class for the given class.
<div class="codeblock"><pre>
Class c = javax.swing.JButton.class.getSuperclass();
</pre></div>
The super class of 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/javax/swing/JButton.html"><code>javax.swing.JButton</code></a> is 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/javax/swing/AbstractButton.html"><code>javax.swing.AbstractButton</code></a>.</dd>
</dl>
<dl>
<dt>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html#getClasses--"><code>Class.getClasses()</code></a></dt>
<dd>Returns all the public classes, interfaces, and enums that are members of the class including inherited members.
<div class="codeblock"><pre>
Class&lt;?&gt;[] c = Character.class.getClasses();
</pre></div>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Character.html"><code>Character</code></a> contains two member classes 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Character.Subset.html"><code>Character.Subset</code></a> and 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Character.UnicodeBlock.html"><code>Character.UnicodeBlock</code></a>.</dd>
</dl>
<dl>
<dt>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html#getDeclaredClasses--"><code>Class.getDeclaredClasses()</code></a></dt>
<dd>Returns all of the classes interfaces, and enums that are explicitly declared in this class.
<div class="codeblock"><pre>
Class&lt;?&gt;[] c = Character.class.getDeclaredClasses();
</pre></div>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Character.html"><code>Character</code></a> contains two public member classes 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Character.Subset.html"><code>Character.Subset</code></a> and 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Character.UnicodeBlock.html"><code>Character.UnicodeBlock</code></a> and one private class <code>Character.CharacterCache</code>.</dd>
</dl>
<dl>
<dt> 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html#getDeclaringClass--"><code>Class.getDeclaringClass()</code></a><br/> 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Field.html#getDeclaringClass--"><code>java.lang.reflect.Field.getDeclaringClass()</code></a><br/>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Method.html#getDeclaringClass--"><code>java.lang.reflect.Method.getDeclaringClass()</code></a><br/>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Constructor.html#getDeclaringClass--"><code>java.lang.reflect.Constructor.getDeclaringClass()</code></a></dt>
<dd>Returns the 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html"><code>Class</code></a> in which these members were declared. 
<a class="OutsideLink" target="_blank" href="https://docs.oracle.com/javase/specs/jls/se7/html/jls-15.html#jls-15.9.5">Anonymous Class Declarations</a> will not have a declaring class but will have an enclosing class.
<div class="codeblock"><pre>
import java.lang.reflect.Field;

Field f = System.class.getField("out");
Class c = f.getDeclaringClass();
</pre></div>
The field 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/System.html#out"><code>out</code></a> is declared in 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/System.html"><code>System</code></a>.
<div class="codeblock"><pre>
public class MyClass {
    static Object o = new Object() {
        public void m() {} 
    };
    static Class&lt;c&gt; = o.getClass().getEnclosingClass();
}
</pre></div>
The declaring class of the anonymous class defined by <code>o</code> is <code>null</code>.</dd>
</dl>
<dl>
<dt>
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html#getEnclosingClass--"><code>Class.getEnclosingClass()</code></a></dt>
<dd>Returns the immediately enclosing class of the class.
<div class="codeblock"><pre>
Class c = Thread.State.class().getEnclosingClass();
</pre></div>
The enclosing class of the enum 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.State.html"><code>Thread.State</code></a> is 
<a class="APILink" target="_blank" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html"><code>Thread</code></a>.
<div class="codeblock"><pre>
public class MyClass {
    static Object o = new Object() { 
        public void m() {} 
    };
    static Class&lt;c&gt; = o.getClass().getEnclosingClass();
}
</pre></div>
The anonymous class defined by <code>o</code> is enclosed by <code>MyClass</code>.</dd>
</dl>
