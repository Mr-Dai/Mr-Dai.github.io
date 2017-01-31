---
layout: post_translated
title: Scala 语言规范 - 第三章：类型
author: Robert Peng
category: Scala
org_title: "Scala Specification - Chapter 3 : Types"
org_url: "http://www.scala-lang.org/files/archive/spec/2.11/03-types.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushScala.js"></script>

译者注：该章可结合《快学Scala》第十八章进行阅读。最好在先看过《快学Scala》后再来看这一章。

<pre>
Type              ::=  FunctionArgTypes ‘=>’ Type
                    |  InfixType [ExistentialClause]
FunctionArgTypes  ::=  InfixType
                    |  ‘(’ [ ParamType {‘,’ ParamType } ] ‘)’
ExistentialClause ::=  ‘forSome’ ‘{’ ExistentialDcl
                           {semi ExistentialDcl} ‘}’
ExistentialDcl    ::=  ‘type’ TypeDcl
                    |  ‘val’ ValDcl
InfixType         ::=  CompoundType {id [nl] CompoundType}
CompoundType      ::=  AnnotType {‘with’ AnnotType} [Refinement]
                    |  Refinement
AnnotType         ::=  SimpleType {Annotation}
SimpleType        ::=  SimpleType TypeArgs
                    |  SimpleType ‘#’ id
                    |  StableId
                    |  Path ‘.’ ‘type’
                    |  ‘(’ Types ‘)’
TypeArgs          ::=  ‘[’ Types ‘]’
Types             ::=  Type {‘,’ Type}
</pre>

<!--
We distinguish between first-order types and type constructors, which take type parameters and yield types.
A subset of first-order types called value types represents sets of (first-class) values. Value types are either concrete or abstract.
-->
这里，我们需要区分一下一阶类型（first-order type）和接收类型参数并产生类型的类型构造器（type constructor）。
一种被称为**值类型**（value type）的一阶类型用于表示（一级）值的集合。值类型可以是**具体**（concrete）或是**抽象**（abstract）的。

<!--
Every concrete value type can be represented as a class type, i.e. a type designator that refers to a class or a trait 1,
or as a compound type representing an intersection of types, possibly with a refinement that further constrains the types of its members.
-->
每个具体的值类型都可被表示为一个类类型（class type），也即是一个指代[类或特质](http://www.scala-lang.org/files/archive/spec/2.11/05-classes-and-objects.html#class-definitions)<sup id="fnref1"><a href="#fn1" rel="footnote">1</a></sup>的[类型标识](#type-designators)，
或者一个表示类型交集的[复合类型](#compound-types)，它还可能附带着一个可进一步约束其成员的类型的[校正](#compund-types)。

<!--
Abstract value types are introduced by type parameters and abstract type bindings. Parentheses in types can be used for grouping.
-->
抽象值类型将由[类型参数](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#type-parameters)或[抽象类型绑定](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#type-declarations-and-type-aliases)引入。可以使用括号对类型进行分组。

<!--
Non-value types capture properties of identifiers that are not values. For example, a type constructor does not directly specify a type of values.
However, when a type constructor is applied to the correct type arguments, it yields a first-order type, which may be a value type.
-->
[非值类型](#non-value-types)可用于捕捉非值标识符的共有特性。比如，[类型构造器](#type-constructors)并不直接表示某个值的类型。然而，
如果将类型构造器应用在正确的类型参数上时，它便会产生一个一阶类型，甚至有可能是一个值类型。

<!--
Non-value types are expressed indirectly in Scala. E.g., a method type is described by writing down a method signature, which in itself is not a real type,
although it gives rise to a corresponding method type. Type constructors are another example, as one can write type Swap[m[_, _], a,b] = m[b, a], but there
is no syntax to write the corresponding anonymous type function directly.
-->
非值类型不会被直接地表示在 Scala 中。例如，[方法类型](#method-types)被直接表达为其对应的方法签名。方法签名本身并不是类型，但它却被用于表示对应的方法类型。
类型构造器则是另一个例子：我们可以写下语句 `type Swap[m[_, _], a, b] = m[b, a]`，但能直接写出其对应的匿名类型函数的语法却并不存在。

<h2 id="paths">3.1 路径</h2>
<pre>
Path            ::=  StableId
                  |  [id ‘.’] this
StableId        ::=  id
                  |  Path ‘.’ id
                  |  [id ‘.’] ‘super’ [ClassQualifier] ‘.’ id
ClassQualifier  ::= ‘[’ id ‘]’
</pre>

<!--
Paths are not types themselves, but they can be a part of named types and in that function form a central role in Scala's type system.
-->
路径本身并不是类型，但它们可以作为具名类型（named type）的一部分，并在 Scala 的类型系统中担当核心角色。

<!--
A path is one of the following.

- The empty path ε (which cannot be written explicitly in user programs).
- C.this, where C references a class. The path this is taken as a shorthand for C.this where C is the name of the class directly enclosing the reference.
- p.x where p is a path and x is a stable member of p. Stable members are packages or members introduced by object definitions or
  by value definitions of non-volatile types.
- C.super.x or C.super[M].x where C references a class and x references a stable member of the super class or designated parent
  class M of C. The prefix super is taken as a shorthand for C.super where C is the name of the class directly enclosing the reference.
-->
路径可有如下几种形式：

- 空路径 $\epsilon$ 。这样的路径无法被显式地编写在用户的程序中。
- $C$`.this`，其中 $C$ 指代一个类。路径 `this` 可被视为 $C$`.this` 的缩写，其中 $C$ 指代直接包含该引用的类。
- $p.x$，其中 $p$ 是一个路径而 $x$ 是 $p$ 的一个稳定成员（stable member）。稳定成员包括包（package）和由对象定义或[非不稳定类型](#volatile-types)的值定义引入的成员。
- $C$`.super.`$x$ 或 $C$`.super[`$M$`].`$x$ ，其中 $C$ 指代一个类，$x$ 指代 $C$ 的直接父类或指定父类 $M$ 的一个稳定成员。前缀 `super` 可被视为 $C$`.super` 的缩写，
  其中 $C$ 指代直接包含该引用的类。

<!--
A stable identifier is a path which ends in an identifier.
-->
**稳定标识符**（stable identifier）则是以一个标识符结尾的路径。

<h2 id="value-types">3.2 值类型</h2>

<!--
Every value in Scala has a type which is of one of the following forms.
-->
Scala 中的每一个值都有其所属的类型，而这些类型包含如下几种形式。

<h3 id="singleton-types">3.2.1 单例类型</h3>

<pre>
SimpleType  ::=  Path ‘.’ ‘type’
</pre>

<!--
A singleton type is of the form p.type, where p is a path pointing to a value expected to conform to scala.AnyRef.
The type denotes the set of values consisting of null and the value denoted by p.
-->
单例类型有形式 $p$`.type`，其中 $p$ 为指向某个值的路径，而该值的类型应[匹配于](#conformance)（conform to）`scala.AnyRef`。该类型所代表的值的集合包含了 `null` 和 $p$ 代表的值。

<!--
A stable type is either a singleton type or a type which is declared to be a subtype of trait scala.Singleton.
-->
一个**稳定类型**（stable type）可为一个单例类型或是一个声明为特质 `scala.Singleton` 的子类型的类型。

<h3 id="type-projection">3.2.2 类型投影</h3>

<pre>
SimpleType  ::=  SimpleType ‘#’ id
</pre>

<!--
A type projection T#x references the type member named x of type T.
-->
类型投影（type projection）$T$#$x$ 指代类型 $T$ 中一个名为 $x$ 的类型成员。

<h3 id="type-designators">3.2.3 类型标识</h3>

<pre>
SimpleType  ::=  StableId
</pre>

<!--
A type designator refers to a named value type. It can be simple or qualified. All such type designators are shorthands for type projections.
-->
类型标识指代一个具名值类型（named value type），它可以是简单的（simple，非限定）或者是限定的（qualified）。所有这样的类型标识都是类型投影的简写。

<!--
Specifically, the unqualified type name t where t is bound in some class, object, or package C is taken as a shorthand for C.this.type#t.
If t is not bound in a class, object, or package, then t is taken as a shorthand for ε.type#t.
-->
具体来讲，被绑定在某个类、对象或者包 $C$ 中的非限定类型名 $t$ 会被视为 $C$`.this.type#`$t$ 的缩写。如果 $t$ 并未被绑定在某个类、对象或包中，
$t$ 将会被视为 $\epsilon$`.type#`$t$ 的缩写。

<!--
A qualified type designator has the form p.t where p is a path and t is a type name. Such a type designator is equivalent to the type projection p.type#t.
-->
一个限定类型标识有形式 $p.t$，其中 $p$ 是一个[路径](#paths)，而 $t$ 是一个类型名。这样的一个类型标识等价于类型投影 $p$`.type#`$t$。

---

<!--
Some type designators and their expansions are listed below. We assume a local type parameter t, a value maintable
with a type member Node and the standard class scala.Int,
-->
下表列出了部分类型标识和它们的展开式（expansion），假设有局部类型参数 $t$，值 `maintable` 及其类型成员 `Node`，以及一个标准类 `scala.Int`。

<table class="table">
  <tr>
    <th>类型标识</th>
    <th>展开式</th>
  </tr>
  <tr>
    <td><code>t</code></td>
    <td><code>ε.type#t</code></td>
  </tr>
  <tr>
    <td><code>Int</code></td>
    <td><code>scala.type#Int</code></td>
  </tr>
  <tr>
    <td><code>scala.Int</code></td>
    <td><code>scala.type#Int</code></td>
  </tr>
  <tr>
    <td><code>data.maintable.Node</code></td>
    <td><code>data.maintable.type#Node</code></td>
  </tr>
</table>

<h3 id="parameterized-types">3.2.4 含参类型</h3>

<pre>
SimpleType      ::=  SimpleType TypeArgs
TypeArgs        ::=  ‘[’ Types ‘]’
</pre>

<!--
A parameterized type T[T1,…,Tn] consists of a type designator T and type parameters T1,…,Tn where n≥1.
T must refer to a type constructor which takes n type parameters a1,…,an.
-->
含参类型（parameterized type）$T[T_1,\ldots,T_n]$ 包含一个类型标识 $T$ 以及类型参数（type parameter） $T_1,\ldots,T_n$，其中 $n \geq 1$。
$T$ 必须指代一个可接收 $n$ 个类型参数 $a_1,\ldots,a_n$ 的类型构造器。

<!--
Say the type parameters have lower bounds L1,…,Ln and upper bounds U1,…,Un. The parameterized type is well-formed
if each actual type parameter conforms to its bounds, i.e. σLi<:Ti<:σUi where σ is the substitution [a1:=T1,…,an:=Tn].
-->
我们假设这些类型参数有下界 $L_1,\ldots,L_n$ 和上界 $U_1,\ldots,U_n$。如果每一个类型实参都位于该上下界内，即对于替换 $\sigma = [a_1 := T_1,\ldots,a_n := T_n]$
有 $\sigma L_i <: T_i <: \sigma U_i$，那么我们说这个含参类型是良构的（well-formed）。

---

<!--
Given the partial type definitions:
-->
给定部分类型定义：

<pre class="brush: scala">
class TreeMap[A &lt;: Comparable[A], B] { ... }
class List[A] { ... }
class I extends Comparable[I] { ... }

class F[M[_], X] { ... }
class S[K &lt;: String] { ... }
class G[M[ Z &lt;: I ], I] { ... }
</pre>

<!--
the following parameterized types are well formed:
-->
那么下列含参类型是良构的：

<pre class="brush: scala">
TreeMap[I, String]
List[I]
List[List[Boolean]]

F[List, Int]
G[S, String]
</pre>

<!--
Given the above type definitions, the following types are ill-formed:
-->
而下列含参类型则不是良构的：

<pre class="brush: scala">
TreeMap[I]            // 不合法：类型参数数量不吻合
TreeMap[List[I], Int] // 不合法：类型参数不处于声明的上下界之内

F[Int, Boolean]       // 不合法：`Int`不是类型构造器
F[TreeMap, Int]       // 不合法：`TreeMap`需要两个类型参数，
                      //   而`F`的第一个参数预期为只接收一个参数的类型构造器
G[S, Int]             // 不合法：`S`要求其类型参数必须与`String`匹配
                      //   而`G`的第一个参数预期为只接收一个参数且该参数与`Int`匹配的类型构造器
</pre>

<h3 id="tuple-types">3.2.5 元组类型</h3>
<pre>
SimpleType    ::=   ‘(’ Types ‘)’
</pre>

<!--
A tuple type (T1,…,Tn) is an alias for the class scala.Tuple[T1, … , Tn], where n≥2.
-->
元组类型（tuple type）$(T_1,\ldots,T_n)$ 实为类 `scala.Tuple`$n[T_1,\ldots,T_n]$ 的别名（alias），其中 $n \geq 2$。

<!--
Tuple classes are case classes whose fields can be accessed using selectors _1 , … , _n. Their functionality is abstracted
in a corresponding Product trait. The n-ary tuple class and product trait are defined at least as follows in the standard
Scala library (they might also add other methods and implement other traits).
-->
元组类属于用例类（case class），它们的域（field）可以用选择器（selector）`_1`, …, `_n` 进行访问。每个元组类的功能尤其对应的 `Product` 特质提供抽象定义。
标准 Scala 库中的 $n$ 元元组类及其 `Product` 特质的定义大致如下：

<pre class="brush: scala">
case class Tuple_n[+T1, ..., +Tn](_1: T1, ..., _n: Tn)
extends Product_n[T1, ..., Tn]

trait Product_n[+T1, ..., +Tn] {
  override def productArity = n
  def _1: T1
  ...
  def _n: Tn
}
</pre>

<h3 id="annotated-types">3.2.6 注解类型</h3>

<pre>
AnnotType  ::=  SimpleType {Annotation}
</pre>

<!--
An annotated type T a1,…,an attaches annotations a1,…,an to the type T.
-->
注解类型（annotated type） $T$ $a_1,\ldots,a_n$ 将[注解](http://www.scala-lang.org/files/archive/spec/2.11/11-annotations.html#user-defined-annotations) $a_1,\ldots,a_n$ 添加到了类型 $T$ 上。

---

<!--
The following type adds the @suspendable annotation to the type String:
-->
如下类型将注解 `@suspendable` 添加到了类型 `String`上：

<pre class="brush: scala">
String @suspendable
</pre>

<h3 id="compound-types">3.2.7 复合类型</h3>

<pre>
CompoundType    ::=  AnnotType {‘with’ AnnotType} [Refinement]
                  |  Refinement
Refinement      ::=  [nl] ‘{’ RefineStat {semi RefineStat} ‘}’
RefineStat      ::=  Dcl
                  |  ‘type’ TypeDef
                  |
</pre>

<!--
A compound type T1 with … with Tn{R} represents objects with members as given in the component types T1,…,Tn and the refinement {R}.
A refinement {R} contains declarations and type definitions. If a declaration or definition overrides a declaration or definition in
one of the component types T1,…,Tn, the usual rules for overriding apply; otherwise the declaration or definition is said to be “structural” 2.
-->
复合类型（compound type） $T_1$ `with` $\ldots$ `with` $T_n\lbrace R\rbrace$ 代表了所有包含由组件类型（component type）$T_1,\ldots,T_n$ 和校正（refinement）$\lbrace R\rbrace$ 给出的成员的对象。
校正 $\lbrace R\rbrace$ 可以包含声明和类型定义。如果它的某个声明或定义覆写了组件类型 $T_1,\ldots,T_n$ 中的某个声明或定义，
那么这里将会使用惯常的[重载](http://www.scala-lang.org/files/archive/spec/2.11/05-classes-and-objects.html#overriding)规则来处理这种情况；
否则，我们就说该声明或定义是“结构的”<sup id="fnref2"><a href="#fn2" rel="footnote">2</a></sup>（structural）。

<!--
Within a method declaration in a structural refinement, the type of any value parameter may only refer to type parameters or abstract types
that are contained inside the refinement. That is, it must refer either to a type parameter of the method itself, or to a type definition within
the refinement. This restriction does not apply to the method's result type.
-->
对于结构校正中的方法声明，所有参数的类型只能为包含在该校正中的类型参数或抽象类型。也就是说，它只能指代方法本身的某个类型参数或者该校正内的某个类型定义。
这项约束并不适用于方法的返回类型。

<!--
If no refinement is given, the empty refinement is implicitly added, i.e. T1 with … with Tn is a shorthand for T1 with … with Tn{}.
-->
如果未给出任何校正，空校正将会被隐式地添加，即 $T_1$ `with` $\ldots$ `with` $T_n$ 为 $T_1$ `with` $\ldots$ `with` $T_n\lbrace\rbrace$ 的缩写。

<!--
A compound type may also consist of just a refinement {R} with no preceding component types. Such a type is equivalent to AnyRef {R}.
-->
复合类型还可以只包含一个校正 $\lbrace R\rbrace$ 而不包含任何组件类型。这样的复合类型等价于 `AnyRef` $\lbrace R\rbrace$。

---

<!--
The following example shows how to declare and use a method which a parameter type that contains a refinement with structural declarations.
-->
下面的例子展示了如何在一个方法中声明某个参数类型带有一个包含结构声明的校正并使用该方法。

<pre class="brush: scala">
case class Bird (val name: String) extends Object {
        def fly(height: Int) = …
…
}
case class Plane (val callsign: String) extends Object {
        def fly(height: Int) = …
…
}
def takeoff(
            runway: Int,
      r: { val callsign: String; def fly(height: Int) }) = {
  tower.print(r.callsign + " requests take-off on runway " + runway)
  tower.read(r.callsign + " is clear for take-off")
  r.fly(1000)
}
val bird = new Bird("Polly the parrot"){ val callsign = name }
val a380 = new Plane("TZ-987")
takeoff(42, bird)
takeoff(89, a380)
</pre>

<!--
Although Bird and Plane do not share any parent class other than Object, the parameter r of method takeoff is defined
using a refinement with structural declarations to accept any object that declares a value callsign and a fly method.
-->
尽管 `Bird` 和 `Plane` 除 `Object` 外再无任何公共父类，方法 `takeoff` 的参数 `r` 使用了一个带有结构声明的校正以接收任何带有值 `callsign` 和方法 `method` 的对象。

<h3 id="infix-types">3.2.8 中缀类型</h3>

<pre>
InfixType     ::=  CompoundType {id [nl] CompoundType}
</pre>

<!--
An infix type T1 op T2 consists of an infix operator op which gets applied to two type operands T1 and T2.
The type is equivalent to the type application op[T1,T2]. The infix operator op may be an arbitrary identifier.
-->
中缀类型（infix type）$T_1$ `op` $T_2$ 包含一个中缀运算符 `op`，而该运算符可用于两个类型算子 $T_1$ 和 $T_2$。
该类型等价于类型 `op[`$T_1, T_2$`]`，其中中缀运算符 `op` 可为任意标识符。

<!--
All type infix operators have the same precedence; parentheses have to be used for grouping. The associativity of a type operator
is determined as for term operators: type operators ending in a colon ‘:’ are right-associative; all other operators are left-associative.
-->
所有的类型中缀运算符有着相同的优先级，可以使用括号来确定它们的先后顺序。类型运算符的[结合性](http://www.scala-lang.org/files/archive/spec/2.11/06-expressions.html#prefix,-infix,-and-postfix-operations)定义与项运算符（term operator）是相同的：如果类型运算符以冒号 ‘:’ 结尾，那么它就是右结合的；否则，它就是左结合的。

<!--
In a sequence of consecutive type infix operations t0opt1op2…opntn, all operators op1,…,opn must have the same associativity.
If they are all left-associative, the sequence is interpreted as (…(t0op1t1)op2…)opntn, otherwise it is interpreted as t0op1(t1op2(…opntn)…).
-->
对于类型中缀运算序列 $t_0\,\mathit{op_1}\,t_1\,\mathit{op_2}\,\ldots\,\mathit{op_n}\,t_n$，所有运算符 $op_1,\ldots,op_n$ 必须有相同的结合性。
如果它们都是左结合的，那么该序列将被解释为 $(\ldots (t_0\,\mathit{op_1}\,t_1)\,\mathit{op_2} \ldots)\,\mathit{op_n}\,t_n$；否则它将被解释为
$t_0\,\mathit{op_1}\,(t_1\,\mathit{op_2}\,( \ldots \mathit{op_n}\,t_n) \ldots)$。

<h3 id="function-types">3.2.9 函数类型</h3>
<pre>
Type              ::=  FunctionArgs ‘=>’ Type
FunctionArgs      ::=  InfixType
                    |  ‘(’ [ ParamType {‘,’ ParamType } ] ‘)’
</pre>

<!--
The type (T1,…,Tn)⇒U represents the set of function values that take arguments of types T1,…,Tn and yield results of type U.
In the case of exactly one argument type T⇒U is a shorthand for (T)⇒U. An argument type of the form ⇒T represents a call-by-name parameter of type T.
-->
类型 $(T_1,\ldots,T_n)\Rightarrow U$ 代表所有接受类型为 $T_1,\ldots,T_n$ 的参数并产生类型为 $U$ 的结果的函数值的集合。
当函数只接受一个参数时，类型 $T\Rightarrow U$ 即为 $(T)\Rightarrow U$ 的缩写。形如 $\Rightarrow T$ 的参数类型代表一个类型为 $T$ 的[传名调用参数](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#by-name-parameters)（call-by-name parameter）。

<!--
Function types associate to the right, e.g. S⇒T⇒U is the same as S⇒(T⇒U).
-->
函数类型是右结合的，即 $S\Rightarrow T\Rightarrow U$ 与 $S\Rightarrow (T\Rightarrow U)$ 相同。

<!--
Function types are shorthands for class types that define apply functions. Specifically, the n-ary function type (T1,…,Tn)⇒U is
a shorthand for the class type Functionn[T1 , … , Tn, U]. Such class types are defined in the Scala library for n between 0 and 9 as follows.
-->
所有函数类型都是定义了`apply`函数的类的类型缩写。具体来说，$n$ 元函数类型 $(T_1,\ldots,T_n)\Rightarrow U$ 是类型 `Function`$_n[T_1,\ldots,T_n, U]$ 的缩写。
Scala 库为 $n \in [0,9]$ 均定义了对应的函数类，形如下：

<pre class="brush: scala">
package scala
trait Function_n[-T1 , … , -Tn, +R] {
  def apply(x1: T1 , … , xn: Tn): R
  override def toString = "&lt;function>"
}
</pre>

<!--
Hence, function types are covariant in their result type and contravariant in their argument types.
-->
因此，函数的类型和它们的返回类型是[协变](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#variance-annotations)的（covariant），和它们的参数类型则是逆变的（contravariant）。

<h3 id="existential-types">3.2.10 存在类型</h3>

<pre>
Type               ::= InfixType ExistentialClauses
ExistentialClauses ::= ‘forSome’ ‘{’ ExistentialDcl
                       {semi ExistentialDcl} ‘}’
ExistentialDcl     ::= ‘type’ TypeDcl
                    |  ‘val’ ValDcl
</pre>

存在类型（existential type）形如$T$ `forSome` $\lbrace Q\rbrace$，其中 $Q$ 是一个[类型声明](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#type-declarations-and-type-aliases)序列。

<!--
Let t1[tps1]>:L1<:U1,…,tn[tpsn]>:Ln<:Un be the types declared in Q (any of the type parameter sections [ tpsi ] might be missing).
The scope of each type ti includes the type T and the existential clause Q. The type variables ti are said to be bound in the type T forSome { Q }.
Type variables which occur in a type T but which are not bound in T are said to be free in T.
-->
假设 $Q$ 中定义了类型 $t_1[\mathit{tps}_1] >: L_1 <: U_1 , \ldots , t_n[\mathit{tps}_n] >: L_n <: U_n$（对于部分 $t_i$，类型参数 $[\mathit{tps}_i]$ 有可能不存在）。
每个类型 $t_i$ 的作用域均包含了类型 $T$ 和存在语句 $Q$。我们说类型变量 $t_i$ 被绑定在了类型 $T$ `forSome` $\lbrace Q\rbrace$ 中。
如果某个类型变量出现在了类型 $T$ 中但并未在 $T$ 中被绑定，那么我们说它在 $T$ 中是**自由**的（free）。

<!--
A type instance of T forSome { Q } is a type σT where σ is a substitution over t1,…,tn such that, for each i, σLi<:σti<:σUi.
The set of values denoted by the existential type T forSome {Q} is the union of the set of values of all its type instances.
-->
对于存在类型 $T$ `forSome` $\lbrace Q\rbrace$，假设有在 $t_1,\ldots,t_n$ 上的替换 $\sigma$，对于任意的 $i$ 有 $\sigma L_i <: \sigma t_i <: \sigma U_i$，那么类型 $\sigma T$ 则为 $T$ `forSome` $\lbrace Q\rbrace$ 的一个**类型实例**（type instance）。

<!--
A skolemization of T forSome { Q } is a type instance σT, where σ is the substitution [t′1/t1,…,t′n/tn] and each t′i is a
fresh abstract type with lower bound σLi and upper bound σUi.
-->
对于存在类型 $T$ `forSome` $\lbrace Q\rbrace$，假设有替换 $\sigma = [t_1'/t_1 , \ldots , t_n'/t_n]$，且每个 $t_i'$ 都是有着下界 $\sigma L_i$ 和上界 $\sigma U_i$ 的抽象类型，那么类型 $\sigma T$ 则为 $T$ `forSome` $\lbrace Q\rbrace$ 的一个**斯科伦化**（skolemization）。

#### 化简法则

<!--
Existential types obey the following four equivalences:
-->
存在类型之间存在着如下四种等价关系：

<!--
1. Multiple for-clauses in an existential type can be merged. E.g., T forSome { Q } forSome { Q′ } is equivalent to T forSome { Q ; Q′}.
2. Unused quantifications can be dropped. E.g., T forSome { Q ; Q′} where none of the types defined in Q′ are referred to by T or Q, is equivalent to T forSome {Q}.
3. An empty quantification can be dropped. E.g., T forSome { } is equivalent to T.
4. An existential type T forSome { Q } where Q contains a clause type t[tps]>:L<:U is equivalent to the type T′ forSome { Q } where
   T′ results from T by replacing every covariant occurrence of t in T by U and by replacing every contravariant occurrence of t in T by L.
--> 
1. 一个存在类型中的多个 `forSome` 语句可以被合并：例如，$T$ `forSome` $\lbrace Q\rbrace$ `forSome` $\lbrace Q'\rbrace$ 等价于 $T$ `forSome` $\lbrace Q ; Q'\rbrace\$。
2. 多余的限定词（quantification）可以被移除：例如，有 $T$ `forSome` $\lbrace Q ; Q'\rbrace\$，如果 $T$ 和 $Q$ 均未指向任何定义在 $Q'$ 中的类型，
   那么该存在类型等价于 $T$ `forSome` $\lbrace Q\rbrace\$。
3. 空白的限定词可以被移除：例如，$T$ `forSome` $\lbrace \rbrace\$ 等价于 $T$。
4. 给定存在类型 $T$ `forSome` $\lbrace Q\rbrace\$，其中 $Q$ 包含语句 `type` $t$`[`$tps$`] >: L <: U`，则该存在类型等价于 $T'$ `forSome` $\lbrace Q\rbrace\$，
   其中 $T'$ 通过将 $T$ 中每次 $t$ 的[协变引用](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#variance-annotations)替换为 $U$ 并把每次 $t$ 的逆变引用替换为 $L$ 得出。

#### 基于值的存在限定词

<!--
As a syntactic convenience, the bindings clause in an existential type may also contain value declarations val x: T.
An existential type T forSome { Q; val x: S;Q′ } is treated as a shorthand for the type T′ forSome { Q; type t <: S with Singleton; Q′ },
where t is a fresh type name and T′ results from T by replacing every occurrence of x.type with t.
-->
为了提供语法上的便利，存在类型中的绑定语句还可以包含值声明语句 `val` $x:\, T$。在这种情况下，存在类型 $T$ `forSome` $\lbrace\, Q;$ `val` $x: S;\,Q'\,\rbrace$ 将被视为
$T'$ `forSome` $\lbrace\, Q;$ `type` $t$ `<:` $S$ `with Singleton`$;\,Q'\,\rbrace$ 的缩写，其中 $t$ 是一个全新的类型名，而 $T'$ 由将 $T$ 中每一处 $x$`.type` 出现的地方替换为 $t$ 得出。

#### 用于存在类型的占位符语法

<pre>
WildcardType   ::=  ‘_’ TypeBounds
</pre>

<!--
Scala supports a placeholder syntax for existential types. A wildcard type is of the form _>:L<:U. Both bound clauses may be omitted.
If a lower bound clause >:L is missing, >:scala.Nothing is assumed. If an upper bound clause <:U is missing, <:scala.Any is assumed.
A wildcard type is a shorthand for an existentially quantified type variable, where the existential quantification is implicit.
-->
Scala 支持用于表示存在类型的占位符语法。**通配类型**（wildcard type）有形式 `_ >:` $L$ `<:` $U$。其中，上下界定义语句均可被省略。
如果下界定义语句 `>:` $L$ 被省略，那么将会隐式使用 `>: scala.Nothing`。如果上界定义语句 `<:` $U$ 被省略，那么将会隐式使用 `<: scala.Any`。
通配类型给可以被视作一个被存在限定的类型变量（existentially quantified type variable），而其存在限定词则隐式给出。

<!--
A wildcard type must appear as type argument of a parameterized type. Let T=p.c[targs,T,targs′] be a parameterized type where
targs,targs′ may be empty and T is a wildcard type _>:L<:U. Then T is equivalent to the existential type
-->
通配类型只可被用于含参类型的类型参数。假设有含参类型 $T=p.c$`[`$targs,T,targs'$`]`，其中 $targs,targs'$ 均可为空，且 $T$ 为通配类型 `_ >:` $L$ `<:` $U$。
那么 $T$ 等价于存在类型

<pre class="brush: scala">
p.c[targs,t,targs'] forSome { type t >: L &lt;: U }
</pre>

<!--
where t is some fresh type variable. Wildcard types may also appear as parts of infix types, function types, or tuple types.
Their expansion is then the expansion in the equivalent parameterized type.
-->
其中 $t$ 是新添加的类型变量。通配类型可同样作为[中缀类型](#infix-types)、[函数类型](#function-types)和[元组类型](#tuple-types)的组成部分。
如此一来，它们的展开式即为其等价的含参类型的展开式。

---

<!--
Assume the class definitions
-->
假设有类定义

<pre class="brush: scala">
class Ref[T]
abstract class Outer { type T }
</pre>

如下是一些存在类型的示例：

<pre class="brush: scala">
Ref[T] forSome { type T &lt;: java.lang.Number }
Ref[x.T] forSome { val x: Outer }
Ref[x_type # T] forSome { type x_type &lt;: Outer with Singleton }
</pre>

上述示例中的最后两个存在类型是等价的，而第一个示例类型与如下通配语法又是等价的：

<pre class="brush: scala">
Ref[_ &lt;: java.lang.Number]
</pre>

---

类型 `List[List[_]]` 等价于存在类型

<pre class="brush: scala">
List[List[t] forSome { type t }] .
</pre>

---

假设有协变类型：

<pre class="brush: scala">
class List[+T]
</pre>

类型

<pre class="brush: scala">
List[T] forSome { type T &lt;: java.lang.Number }
</pre>

（使用上面提到的第四条简化法则后）等价于：

<pre class="brush: scala">
List[java.lang.Number] forSome { type T &lt;: java.lang.Number }
</pre>

而该类型（使用上面提到的第二、三条简化法则后）又等价于 `List[java.lang.Number]`。

<h2 id="non-value-types">3.3 非值类型</h2>

<!--
The types explained in the following do not denote sets of values, nor do they appear explicitly in programs.
They are introduced in this report as the internal types of defined identifiers.
-->
在接下来的内容中即将介绍的类型不代表任何值的集合，也不会显式地出现在用户的程序中。此文档仅将其视为标识符的内部类型进行介绍。

<h3 id="method-types">3.3.1 方法类型</h3>

<!--
A method type is denoted internally as (Ps)U, where (Ps) is a sequence of parameter names and types (p1:T1,…,pn:Tn) for some n≥0 and U is a (value or method) type. 
This type represents named methods that take arguments named p1,…,pn of types T1,…,Tn and that return a result of type U.
-->
方法类型（method type）在内部被表示为 $(Ps)U$，其中 $(Ps)$ 是由方法参数名称和类型组成的序列 $(p_1:T_1,\ldots,p_n:T_n)$，其中 $n \geq 0$，而 $U$ 则为一个（值或方法）类型。
这样的一个方法类型代表一个接受名为 $p_1,\ldots,p_n$ 且类型为 $T_1,\ldots,T_n$ 并返回类型为 $U$ 的结果的具名方法（named method）。

<!--
Method types associate to the right: (Ps1)(Ps2)U is treated as (Ps1)((Ps2)U).
-->
方法类型是右结合的：$(Ps1)(Ps2)U$ 将被视为 $(Ps1)((Ps2)U)$。

<!--
A special case are types of methods without any parameters. They are written here => T.
Parameterless methods name expressions that are re-evaluated each time the parameterless method name is referenced.
-->
其中一个特例为无参方法的类型，它们被写作 `=> T`。无参方法所包含的表达式在每次该方法的名称被引用时都会被重新估值。

<!--
Method types do not exist as types of values. If a method name is used as a value, its type is implicitly converted to a corresponding function type.
-->
方法类型不会作为值的类型。如果一个方法名被用作一个值，那么它的类型会被[隐式地转换](http://www.scala-lang.org/files/archive/spec/2.11/06-expressions.html#implicit-conversions)为对应的函数类型。

---

声明

<pre class="brush: scala">
def a: Int
def b (x: Int): Boolean
def c (x: Int) (y: String, z: String): String
</pre>

将产生如下类型：

<pre class="brush: scala">
a: => Int
b: (Int) Boolean
c: (Int) (String, String) String
</pre>

<h3 id="polymorphic-method-types">3.3.2 多态方法类型</h3>

<!--
A polymorphic method type is denoted internally as [tps]T where [tps] is a type parameter section [a1 >: L1 <: U1,…,an >: Ln <: Un]
for some n≥0 and T is a (value or method) type. This type represents named methods that take type arguments S1,…,Sn which conform to
the lower bounds L1,…,Ln and the upper bounds U1,…,Un and that yield results of type T.
-->
多态方法类型（polymorphic method type）在内部被表示为 $[tps]T$，其中 $[tps]$ 为类型参数语句 $[a_1$ `>:` $L_1$ `<:` $U_1,\ldots,a_n$ `>:` $L_n$ `<:` $U_n]$，
$n \geq 0$，而 $T$ 是一个（值或方法）类型。该类型代表接受[匹配](#parameterized-types)下界 $L_1,\ldots,L_n$ 与上界 $U_1,\ldots,U_n$ 的类型参数
$S_1,\ldots,S_n$ 并产生类型为 $T$ 的结果的方法。

---

声明

<pre class="brush: scala">
def empty[A]: List[A]
def union[A &lt;: Comparable[A]] (x: Set[A], xs: Set[A]): Set[A]
</pre>

将产生如下类型：

<pre class="brush: scala">
empty : [A >: Nothing &lt;: Any] List[A]
union : [A >: Nothing &lt;: Comparable[A]] (x: Set[A], xs: Set[A]) Set[A]
</pre>

<h3 id="type-constructors">3.3.3 类型构造器</h3>

<!--
A type constructor is represented internally much like a polymorphic method type. [± a1 >: L1 <: U1,…,±an >: Ln <: Un] T represents a type
that is expected by a type constructor parameter or an abstract type constructor binding with the corresponding type parameter clause.
-->
类型构造器在 Scala 内部的表示形式和多态方法类型十分相似。$[\pm a_1$ `>:` $L_1$ `<:` $U_1,\ldots,\pm a_n$ `>:` $L_n$ `<:` $U_n]\, T$
可能代表着某个[类型构造器参数](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#type-parameters)或者有着对应的类型参数语句的[抽象类型构造器绑定](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#type-declarations-and-type-aliases)的类型。

---

考虑如下来自 `Iterable[+X]` 类的代码片段：

<pre class="brush: scala">
trait Iterable[+X] {
  def flatMap[newType[+X] &lt;: Iterable[X], S](f: X => newType[S]): newType[S]
}
</pre>

从概念上讲，类型构造器 `Iterable` 将匿名类型 `[+X]` 命名为了 `Iterable[X]`，而后者可能将会被传入到 `flagMap` 的类型构造器参数 `newType` 之中。

<h2 id="base-types-and-member-definitions">3.4 基类型与成员定义</h2>

<!--
Types of class members depend on the way the members are referenced. Central here are three notions, namely:
-->
类成员的类型取决于该成员会被任何引用。这里的核心为如下三种概念：

1. 由类型 $T$ 的基类型组成的集合。
2. 某个前缀类型 $S$ 所见的类 $C$ 中的类型 $T$。
3. 由类型 $T$ 的成员绑定组成的集合。

这三种概念可如下定义：

1. 一个类型的**基类型**（base type）组成的集合是一个类类型的集合，由如下规则给出：
   - 有父类 $T_1,\ldots,T_n$ 的类 $C$ 的基类型包括 $C$ 本身以及复合类型 $T_1$ `with` $\ldots$ `with` $T_n\,\lbrace R\rbrace$ 的基类型。
   - 类型别名的基类型即为其原类型的基类型。
   - 抽象类型的基类型即为其上界的基类型。
   - 含参类型 $C[T_1,\ldots,T_n]$ 的基类型即为类型 $C$ 的基类型，其中每一处 $C$ 的类型参数 $a_i$ 均被替换为对应的参数类型 $T_i$。
   - 单例类型 $p$`.type` 的基类型即为 $p$ 的类型的基类型。
   - 复合类型 $T_1$ `with` $\ldots$ `with` $T_n\,\lbrace R\rbrace$ 的基类型即为所有 $T_i$ 的基类的**归约并集**（reduced union）。也就是说：
     假设所有 $T_i$ 的基类型的并集为多重集 $\mathscr{S}$。如果多重集 $\mathscr{S}$ 包含同一个类的多个类型实例，如 $[S^i]$`#`$C[T^i_1 , \ldots , T^i_n]\,(i \in I)$，
     那么将在这些实例中挑选出一个可以匹配其他所有实例的实例，并移除其他所有实例。如此一来，如果存在这么一个归约并集的话，该集合将会是一个类类型的集合，
     其中不同的类型是不同的类的实例。
   - 类型选择（type selection）$S$#$T$ 的基类型如下定义。如果 $T$ 是一个类型别名或者抽象类型，这里将会使用上述的规则；否则的话，
     $T$ 必须为一个定义在某个类 $B$ 中的（可能带参数的）类类型，那么 $S$#$T$ 的基类型即为前缀类型 $S$ 所见的 $B$ 中的类型 $T$ 的基类型。
   - 存在类型 $T$ `forSome` $\lbrace\, Q\,\rbrace$ 的基类型包含所有 $S$ `forSome` $\lbrace\, Q\,\rbrace$，其中 $S$ 属于 $T$ 的基类型。
2. 概念 “**某个前缀类型 $S$ 所见的类 $C$ 中的类型 $T$**”（type $T$ in class $C$ seen from some prefix type $S$）当且仅当类 $C$ 的类型实例属于前缀类型 $S$
   的基类型时才有意义。假设该类型实例为 $S'$#$C[T_1,\ldots,T_n]$，那么该概念可由如下规则给出：
   - 如果 $S = \epsilon$`.type`，那么 $S$ 所见的 $C$ 中的 $T$ 即为 $T$ 本身；
   - 否则，如果 $S$ 是存在类型 $S'$ `forSome {` $Q$ `}`，且 $S'$ 所见的 $C$ 中的 $T$ 为 $T'$，那么 $S$ 所见的 $C$ 中的 $S$ 为 $T'$ `forSome {` $Q$ `}`；
   - 否则，如果 $T$ 是某个类 $D$ 的第 $i$ 个类型参数，那么
     * 如果 $S$ 有基类型 $D[U_1,\ldots,U_n]$，其中有类型参数 $[U_1,\ldots,U_n]$，那么 $S$ 所见的 $C$ 中的 $T$ 即为 $U_i$；
     * 否则，如果 $C$ 定义在类 $C'$ 之中，那么 $S$ 所见的 $C$ 中的 $T$ 与 $S'$ 所见的 $C'$ 中的 $T$ 相同；
     * 否则，如果 $C$ 并未定义在其他类中，那么 $S$ 所见的 $C$ 中的 $T$ 即为 $T$ 本身。
   - 如果上述规则均不适用于类型 $T$，那么就将以上描述的所有规则应用到它所有类型组件（type component）上。
   如果 $T$ 是一个可能含参的类类型，其中 $T$ 的类被定义在类 $D$ 之中，而 $S$ 又是某个类型前缀，那么我们将“$S$ 所见的 $D$ 中的 $T$”简写为“$S$ 所见的 $T$”。
3. 类型 $T$ 的**成员绑定**（member binding）包括
   1. 所有满足如下条件的绑定 $d$：在 $T$ 的基类型中存在某个类 $C$ 的类型实例，且 $C$ 中存在某个声明或定义 $d'$ 使得将 $d'$ 中每个类型 $T'$ 都替换为
      $T$ 所见的 $C$ 中的 $T'$ 即可将 $d'$ 转换为 $d$。
   2. 所有该类型的[校正](#compound-types)的绑定，如果有这么一个校正的话。

类型投影 $S$#$T$ 的**定义**（definition）为 $S$ 中的类型 $T$ 的成员绑定 $d_T$。我们也说 $S$#$T$ 由 $d_T$ **定义**（defined）。

<h2 id="relations-between-types">3.5 类型间的关系</h2>

我们定义类型之间的下述关系：

<table class="table">
  <tr>
    <th>名称</th>
    <th>符号表示</th>
    <th>含义</th>
  </tr>
  <tr>
    <td>等价（Equivalence）</td>
    <td>$T \equiv U$</td>
    <td>在任意语境下，$T$ 和 $U$ 可相互替换</td>
  </tr>
  <tr>
    <td>匹配（Conformance）</td>
    <td>$T &lt;: U$</td>
    <td>类型 $T$ 匹配于类型 $U$（$T$ 是 $U$ 的子类型）</td>
  </tr>
  <tr>
    <td>弱匹配（Weak Conformance）</td>
    <td>$T &lt;:_w U$</td>
    <td>将匹配规则扩充应用于基本代数类型</td>
  </tr>
  <tr>
    <td>相容（Compatibility）</td>
    <td></td>
    <td>类型 $T$ 在转换后匹配于类型 $U$</td>
  </tr>
</table>

<h3 id="equivalence">3.5.1 等价</h3>

<!--
Equivalence (≡)(≡) between types is the smallest congruence 3 such that the following holds:
-->
类型间的等价关系 $(\equiv)$ 为满足如下规则的最小同余关系<sup id="fnref3"><a href="#fn3" rel="footnote">3</a></sup>（congruence）。

- 如果 $t$ 由类型重命名语句 `type` $t$ `=` $T$ 定义，那么 $t$ 等价于 $T$；
- 如果路径 $p$ 有单例类型 $q$`.type`，那么 $p$`.type` $\equiv\, q$`.type`。
- 如果 $O$ 由某个对象定义语句所定义，且 $q$ 是以 $O$ 结尾的只包含包和对象选择器的路径，那么 $O$`.this.type` $\equiv\, p$`.type`。
- 对于两个[复合类型](#compound-types)，如果它们的类型组件是一一等价的，且按照相同的顺序出现，而且它们的校正也是等价的，那么它们就是等价的。
  如果两个校正绑定了相同的名称，而且它们定义的实体所拥有的修饰符、类型和上下界均是等价的，那么它们就是等价的。
- 当如下规则全部满足时，两个[方法类型](#method-types)是等价的：
  * 它们都是隐式的，或者都不是隐式的<sup id="fnref4"><a href="#fn4" rel="footnote">4</a></sup>；
  * 它们有着等价的结果类型；
  * 它们有着相同数量的参数，且
  * 相对应的参数有着等价的类型。注意，参数的名称并不会影响方法类型的等价性。
- 对于两个[多态方法类型](#polymorphic-method-types)，如果它们有着相同数量的类型参数，且，
  在将其中一个多态方法类型的类型参数以另一个多态方法类型的类型参数的名称重新命名后，它们的结果类型以及相对的类型参数的上下界等价时，
  那么它们是等价的。
- 对于两个[存在类型](#existential-types)，如果它们有着相同数量的限定词，且，
  在将其中一个存在类型的限定词以另一个存在类型的限定词的名称重新命名后，它们的限定类型以及相对的限定词的上下界等价时，
  那么它们是等价的。
- 对于两个[类型构造器](#type-constructors)，如果它们有着相同数量的类型参数，且，
  在将其中一个多态方法类型的类型参数以另一个多态方法类型的类型参数的名称重新命名后，它们的协变性（variance）以及相对的类型参数的上下界等价时，
  那么它们是等价的。

<h3 id="conformance">3.5.2 匹配</h3>

类型间的匹配关系 $(<:)$ 为满足下列条件的最小传递关系：

 - 匹配关系包含等价关系：如果 $T \equiv U$ 那么 $T <: U$；
 - 对于任意值类型 $T$，`scala.Nothing <:` $T$ `<: scala.Any`。
 - 对于（有着任意数量的类型参数的）任意类型构造器 $T$，`scala.Nothing <:` $T$ `<: scala.Any`。
 - 对于任意满足 $T$ `<: scala.AnyRef` 的类类型 $T$，有 `scala.Null <:` $T$。
 - 类型变量或抽象类型 $t$ 匹配于其上界，而其下界匹配于 $t$ 本身。
 - 类类型或含参类型匹配于它们的基类型。
 - 单例类型 $p$`.type` 匹配于路径 $p$ 的类型。
 - 单例类型 $p$`.type` 匹配于类型 `scala.Singleton`。
 - 若 $T$ 匹配于 $U$，类型投影 $T$#$t$ 匹配于 $U$#$t$。
 - 若对于任意的 $i \in 1,\ldots ,n$，含参类型 $T[T_1,\ldots ,T_n]$ 与 $T[U_1,\ldots ,U_n]$ 满足以下条件，那么 $T[T_1,\ldots ,T_n]$ 匹配于 $T[U_1,\ldots ,U_n]$。
   1. 如果 $T$ 的第 $i$ 个类型参数被声明为协变的，那么 $T_i <: U_i$；
   2. 如果 $T$ 的第 $i$ 个类型参数被声明为逆变的，那么 $U_i <: T_i$；
   3. 如果 $T$ 的第 $i$ 个类型参数既不是协变也不是逆变的，那么 $U_i \equiv T_i$。
 - 复合类型 $T_i$ `with` $\ldots$ `with` $T_n$ `{` $R$ `}` 匹配于其所有的组件类型 $T_i$。
 - 对于存在类型 $T$ `forSome {` $Q$ `}`，如果它的[斯科伦化](#existential-types)匹配于类型 $U$，那么它本身也匹配于 $U$。
 - 如果类型 $T$ 匹配于存在类型 $U$ `forSome {` $Q$ `}` 的一个[类型实例](#existential-types)，那么 $T$ 匹配于 $U$ `forSome {` $Q$ `}`。
 - 如果对于任意的 $i \in 1,\ldots ,n$ 有 $T_i \equiv T'_i$ 且 $U$ 匹配于 $U'$，那么方法类型 $(p_1\, :\, T_1,\ldots,p_n\, :\, T_n)U$ 匹配于
   $(p'_1\, :\, T'_1,\ldots,p'_n\, :\, T'_n)U'$。
 - 假设 $L'_1 <: a_1 <: U'_1,\ldots ,L'_n <: a_n <: U'_n$，如果 $T <: T'$ 且对于任意的 $i \in 1,\ldots ,n$ 有 $L_i <: L'_i$ 和 $U'_i <: U_i$，
   那么多态类型 $[a_1 >: L_1 <: U_1,\ldots a_n >: L_n &lt;: U_n]T$ 匹配于多态类型 $[a_1 >: L'_1 <: U'_1,\ldots a_n >: L'_n <: U'_n]T'$。
 - 类型构造器 $T$ 与 $T'$ 之间的匹配关系遵循类似的原则。我们不妨将 用它们的类型参数语句 `[`$a_1,\ldots ,a_n$`]` 和 `[`$a'_1,\ldots ,a'_n$`]` 特化 $T$ 和
   $T'$，其中 $a_i$ 或 $a'_i$ 都可能包含协变标记（variance annotation）、高阶类型参数语句以及上下界。如果任意对于 $T'$ 合法的类型参数序列 `[`$t_1,\ldots t_n$`]`
   均对于 $T$ 合法且 $T$`[`$t_1,\ldots ,t_n$`]`$<:\, T'$`[`$t_1,\ldots ,t_n$`]`，那么 $T$ 匹配于 $T'$。注意，这意味着：
   * $a_i$ 的上下界需要比 $a'_i$ 声明的上下界更弱（weak）；
   * $a_i$ 的协变性（variance）必须与 $a'_i$ 保持一致，即它们必须同为协变，或同为逆变，或同时既不是协变也不是逆变；
   * 这些限制条件同样需要递归地套用在 $a_i$ 和 $a'_i$ 对应的高阶类型参数语句上。

如果满足下述条件其中之一，那么我们说类 $C$ 中的某个复合类型的某个声明或定义**包含**（subsume）类 $C'$ 中某个复合类型中的同名的声明或定义：

 - 给定 $T <: T'$，类型 $T$ 中定义了名称 $x$ 的一个值声明或定义包含类型 $T'$ 中一个同样定义了 $x$ 的值声明或定义；
 - 给定 $T <: T'$，类型 $T$ 中定义了名称 $x$ 的一个方法声明或定义包含类型 $T'$ 中一个同样定义了 $x$ 的方法声明或定义；
 - 如果 $T \equiv T'$，类型别名 `type` $t$`[`$T_1,\ldots ,T_n$`] =` $T$ 包含 `type` $t$`[`$T_1,\ldots ,T_n$`] =` $T'$；
 - 如果 $L' <: L$ 且 $U <: U'$，那么类型声明 `type` $t$`[`$T_1,\ldots ,T_n >: L <: U$ 包含 `type` $t$`[`$T_1,\ldots ,T_n >: L' <: U'$；
 - 如果 $L <: t <: U$，绑定了名称 $t$ 的类型或类定义包含了抽象类型定义 `type` $t$`[`$T_1,\ldots ,T_n$`] >:` $L$ `<:` $U$。

#### 最低上界与最高下界

$(<:)$ 关系构成了类型间的预序关系（pre-order），也就是说，它是传递（transitive）且自反的（reflexive）。由此，
我们就可以利用这个概念来为某个类型的集合确定**最低上界**（least upper bound）和**最高下界**（greatest lower bound）了。
对于任意给定的类型集合，最低上界和最高下界并不总是存在。比如，考虑以下类定义：

<pre class="brush: scala">
class A[+T] {}
class B extends A[B]
class C extends A[C]
</pre>

那么类型 `B` 和 `C` 的上界的降序序列即为 `A[Any], A[A[Any]], A[A[A[Any]]], ...`。最小上界将会是该序列的无穷极限，而该极限无法表示为 Scala 类型。
由于类似这样的情况在大多数时候都是无法被直接检测到的，因此对于某个使用了某些超出编译器预设限制<sup id="fnref5"><a href="#fn5" rel="footnote">5</a></sup>的最低上界或者最高下界作为类型的项，Scala
编译器可以选择拒绝编译它。

最低上界和最高下界也有可能不是唯一的。例如，`A with B` 和 `B with A` 同样是 `A` 和 `B` 的最高下界。如果存在多个最高下界或最低上界，
Scala 编译器可以任选其一。

<h3 id="weak-conformance">3.5.3 弱匹配</h3>

在某些情况下，Scala 会使用一种更加普适的匹配关系。如果 $S <: T$ 或 $S$ 和 $T$ 均为基本数字类型且在下述顺序中 $S$ 在 $T$ 之前，
那么我们说类型 $S$ **弱匹配**于（weakly conform to）类型 $T$，写作 $S <:_w T$。

<blockquote>
  <b>Byte</b>  $&lt;:_w$ <b>Short</b><br>
  <b>Short</b> $&lt;:_w$ <b>Int</b><br>
  <b>Char</b>  $&lt;:_w$ <b>Int</b><br>
  <b>Int</b>   $&lt;:_w$ <b>Long</b><br>
  <b>Long</b>  $&lt;:_w$ <b>Float</b><br>
  <b>Float</b> $&lt;:_w$ <b>Double</b>
</blockquote>

**弱最低上界**（weak least upper bound）即为考虑弱匹配时的最低上界。

<h3 id="compatibility">3.5.4 相容</h3>

如果类型 $T$（或其对应的函数类型）在进行 [$\eta -$展开](http://www.scala-lang.org/files/archive/spec/2.11/06-expressions.html#eta-expansion)后[弱匹配](#weak-conformance)于类型 $U$，那么我们说类型 $T$ 和类型 $U$ 是**相容**的（compatible）。如果 $T$ 是一个方法类型，那么它将会被转换为对应的函数类型。如果它们之间并不形成弱匹配关系，
如下备选方案将会被依次检查：

 - [视图](http://www.scala-lang.org/files/archive/spec/2.11/07-implicits.html#views)：存在从 $T$ 到 $U$ 的隐式视图（implicit view）；
 - 移除传名调用修饰符：如果 $U$ 有形式 $=> U'$（且 $T$ 没有），有 $T <:_w U'$；
 - SAM 转换：如果 $T$ 对应于某个函数类型，且 $U$ 声明了唯一一个对应于函数类型 $U'$ 的抽象方法，有 $T <:_w U'$。

---

#### 由 SAM 转换确定的函数相容性

给定定义

<pre class="brush: scala">
def foo(x: Int => String): Unit
def foo(x: ToString): Unit

trait ToString { def convert(x: Int): String }
</pre>

`foo((x: Int) => x.toString)`将会被[解析](http://www.scala-lang.org/files/archive/spec/2.11/06-expressions.html#overloading-resolution)为其更为精确的初次重载：

- `Int => String` 与 `ToString` 相容 -- 如果某个地方期望一个类型为 `ToString` 的值，你可以传入一个从 `Int` 到 `String` 的函数字面量，
  而它将会被 SAM 地转换为其对应的函数；
- `ToString` 与 `Int => String` 不相容 -- 如果某个地方期望一个从 `Int` 到 `String` 的函数，你不能传入 `ToString`。

<h2 id="volatile-types">3.6 不稳定类型</h2>

<!--
Type volatility approximates the possibility that a type parameter or abstract type instance of a type does not have any non-null values.
A value member of a volatile type cannot appear in a path.
-->
类型的不稳定性概括了某个类型参数或者抽象类型实例不包含任何非空值的可能性（Type volatility approximates the possibility that a type parameter or abstract type instance of a type does not have any non-null values）。一个有着不稳定类型的值成员不能出现在[路径](#paths)中。

如果一个类型属于下面即将介绍的四种类别之一，那么我们说它是**不稳定**的（volatile）。

当下述条件满足时，我们说复合类型 $T_1$ `with` $\ldots$ `with` $T_n$ `{` $R$ `}` 是不稳定的：

1. $T_2,\ldots ,T_n$ 其中之一是类型参数或者抽象类型，或
2. $T_1$ 为抽象类型且校正 $R$ 或者有着 $j \gt 1$ 的类型 $T_j$ 为复合类型提供了一个抽象成员，或
3. $T_1,\ldots ,T_n$ 其中之一是单例类型。

这里，如果类型 $S$ 包含一个同样是类型 $T$ 的成员的抽象成员，那么我们说类型 $S$ 为类型 $T$ 提供了一个抽象成员。
如果校正 $R$ 包含一个同为类型 $T$ 的成员的抽象声明，那么我们说校正 $R$ 为 $T$ 提供了一个抽象成员。

对于一个类型标识，如果它是某个不稳定类型的类型别名，或者它指向一个以不稳定类型作为其上界的类型参数或抽象类型，那么它是不稳定的。

如果路径 $p$ 是不稳定的，那么单例类型 $p$`.type`也是不稳定的。

如果类型 $T$ 是不稳定的，那么存在类型 $T$ `forSome {` $Q$ `}` 也是不稳定的。

<h2 id="type-erasure">3.7 类型擦除</h2>

如果一个类型包含类型参数或类型变量，那么我们说它是**泛型**的（generic）。**类型擦除** （type erasure）即为从（可能是泛型的）类型到非泛型类型的转换。
我们将类型 $T$ 擦除后的结果写作 $\|T\|$，那么类型擦除的转换规则定义如下：

 - 类型别名的擦除结果与其原类型擦除结果相同；
 - 抽象类型的擦出结果与其上界的擦除结果相同；
 - 含参类型 `scala.Array[`$T_1$`]` 的擦除结果为 `scala.Array[`$\|T_1\|$`]`；
 - 其他所有的含参类型 $T$`[`$T_1,\ldots T_n$`]` 的擦除结果均为 $\|T\|$；
 - 单例类型 $p$`.type` 的擦除结果与类型 $p$ 的擦除结果相同；
 - 类型投影 $T$#$x$ 的擦除结果为 $\|T\|$#$x$；
 - 复合类型 $T_1$ `with` $\ldots$ `with` $T_n$ `{` $R$ `}` 的擦除结果与 $T_1,\ldots ,T_n$ 的交集支配元素的擦除结果相同；
 - 存在类型 $T$ `forSome {` $Q$ `}` 的擦除结果为 $\|T\|$。

类型列表 $T_1,\ldots ,T_n$ 的**交集支配元素**（intersection dominator）可由如下方式计算得出。假设 $T_{i_1} , \ldots , T_{i_m}$ 为不为其他任何类型 $T_j$ 的父类型的类型
$T_i$ 组成的子序列。如果该序列包含一个指代一个类而非特质的类型标识 $T_c$，那么交集支配元素即为该 $T_c$；否则，交集支配元素为该子序列的第一个元素 $T_{i_1}$。

<div class="footnotes">
  <hr>
  <ol>
    <li id="fn1">
      <!--
        We assume that objects and packages also implicitly define a class (of the same name as the object or package, but inaccessible to user programs).
      -->
      我们假设对象和包同样隐式地定义了一个类（该类与该包或对象有着相同的名称，但无法被用户程序所访问）。
      <a href="#fnref1" rev="footnote">↩</a>
    </li>
    <li id="fn2">
      <!--
      A reference to a structurally defined member (method call or access to a value or variable) may generate binary code that is significantly slower than an equivalent code to a non-structural member.
      -->
      对一个结构定义的成员的引用（方法调用或读取某个值或变量）所产生的的二进制代码的执行效率可能会远慢于对非结构化成员的等效访问代码。
      <a href="#fnref2" rev="footnote">↩</a>
    </li>
    <li id="fn3">
      <!--
        A congruence is an equivalence relation which is closed under formation of contexts.
      -->
      同余关系即为在上下文结构下封闭（closed）的等价关系。
      <a href="#fnref3" rev="footnote">↩</a>
    </li>
    <li id="fn4">
      <!--
      A method type is implicit if the parameter section that defines it starts with the implicit keyword.
      -->
      若一个方法的实现的参数部分以关键词 `implicit` 开头，那么这个方法的方法类型就是隐式的。
      <a href="#fnref4" rev="footnote">↩</a>
    </li>
    <li id="fn5">
      <!--
        The current Scala compiler limits the nesting level of parameterization in such bounds to be at most two deeper than
        the maximum nesting level of the operand types
      -->
      现用的 Scala 编译器限制了这样的上下界的类型参数嵌套层数只能在比算子类型的最大嵌套层数多两层以内。
      <a href="#fnref5" rev="footnote">↩</a>
    </li>
  </ol>
</div>