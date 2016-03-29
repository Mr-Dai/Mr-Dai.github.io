---
layout: posts_translated
title: Scala 语言规范 - 第二章：标识符、名称与作用域
author: Robert Peng
category: Scala
org_title: "Scala Specification - Chapter 2 : Identifiers, Names and Scopes"
org_url: "http://www.scala-lang.org/files/archive/spec/2.11/02-identifiers-names-and-scopes.html"
---
<script type="text/javascript" src="/js/syntaxhighlighters/shBrushScala.js"></script>

<!--
Names in Scala identify types, values, methods, and classes which are collectively called entities.
Names are introduced by local definitions and declarations, inheritance, import clauses, or package clauses which are collectively called bindings.
-->
在 Scala 中，名称（name）可被用于标识类型、值、方法和类，而这四种物体又可被统称为*实体*（entity）。
名称可以通过局部[定义与声明](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#basic-declarations-and-definitions)、[继承](http://www.scala-lang.org/files/archive/spec/2.11/05-classes-and-objects.html#class-members)、[引入语句](http://www.scala-lang.org/files/archive/spec/2.11/04-basic-declarations-and-definitions.html#import-clauses)或[包语句](http://www.scala-lang.org/files/archive/spec/2.11/09-top-level-definitions.html#packagings)来引入到程序中，这四种方法又被统称为*绑定*（binding）。

<!--
Bindings of different kinds have a precedence defined on them:

1. Definitions and declarations that are local, inherited, or made available by a package clause in the same compilation unit
   where the definition occurs have highest precedence.
2. Explicit imports have next highest precedence.
3. Wildcard imports have next highest precedence.
4. Definitions made available by a package clause not in the compilation unit where the definition occurs have lowest precedence.
-->
不同类型的绑定有着不同的优先级，由高到低依次如下：

1. 局部或继承而来的定义和声明，以及由包语句引入的处于同一个编译单元中的定义和声明；
2. 显式引入；
3. 通配引入；
4. 由包语句引入的处于不同编译单元中的定义。

<!--
There are two different name spaces, one for types and one for terms. The same name may designate a type and a term, depending on the context where the name is used.
-->
Scala 包含两种不同的命名空间，一种用于[类型](http://www.scala-lang.org/files/archive/spec/2.11/03-types.html#types)，而另一种用于[项](http://www.scala-lang.org/files/archive/spec/2.11/06-expressions.html#expressions)（term）。相同的名称可被同时用于一个类型和一个项，具体取决于该名称所处位置的上下文。

<!--
A binding has a scope in which the entity defined by a single name can be accessed using a simple name.
Scopes are nested. A binding in some inner scope shadows bindings of lower precedence in the same scope as well as bindings of the same or lower precedence in outer scopes.
-->
每个绑定都有着自己的*作用域*，而在该作用域中，被定义的实体可以通过其名称（simple name）进行访问。作用域之间是相互嵌套的。
处于内部域中的绑定会*遮蔽*同属该域的其它优先级较低的绑定以及来自外部域的有着相同或更低优先级的绑定。

<!--
A reference to an unqualified (type- or term-) identifier x is bound by the unique binding, which

- defines an entity with name x in the same namespace as the identifier, and
- shadows all other bindings that define entities with name x in that namespace.
-->
对一个非限定的（类型或项）标识符 $x$ 的引用（reference）将被唯一的绑定所绑定，而该绑定：

- 在该标识符所属的命名空间中定义了名称为 $x$ 的实体，同时
- 遮蔽了其他同样在该命名空间中定义了名为 $x$ 的实体的绑定。

<!--
It is an error if no such binding exists. If x is bound by an import clause, then the simple name x is taken to be equivalent to
the qualified name to which x is mapped by the import clause. If x is bound by a definition or declaration, then x refers to the
entity introduced by that binding. In that case, the type of x is the type of the referenced entity.
-->
如果不存在一个这样的绑定则会发生错误（译者注：编译错误）。如果 $x$ 被一个引入语句所绑定，那么名称 $x$ 将被视作等同于由该引入语句指定的对应于 $x$ 的限定名（qualified name）。
如果 $x$ 由一个定义或声明所绑定，那么 $x$ 将指代由该绑定引入的实体。在这种情况下，$x$ 的类型与被指代实体的类型相同。

<!--
A reference to a qualified (type- or term-) identifier e.x refers to the member of the type T of e which has the name x in the same namespace as the identifier.
It is an error if T is not a value type. The type of e.x is the member type of the referenced entity in T.
-->
对一个限定的（类型或项）标识符 $e.x$ 的引用指代了属于 $e$ 的类型 $T$ 在该命名空间下同被称为 $x$ 的成员。如果 $T$ 不是一个[值类型](http://www.scala-lang.org/files/archive/spec/2.11/03-types.html#value-types)则会发生错误。$e.x$ 的类型与 $T$ 中被指代实体的类型相同。

---

<!--
Assume the following two definitions of objects named X in packages P and Q.
-->
考虑以下对处于包`P`和`Q`中同被称为`X`的对象的定义：

<pre class="brush: scala">
package P {
  object X { val x = 1; val y = 2 }
}

package Q {
  object X { val x = true; val y = "" }
}
</pre>

<!--
The following program illustrates different kinds of bindings and precedences between them.
-->
以下程序展示了不同的绑定以及它们的优先级。

<pre class="brush: scala">
package P {                    // `X' 被包语句绑定
  import Console._               // `println' 被通配引入绑定
  object A {
    println("L4: " + X)          // 这里 `X' 指代 `P.X'
    object B {
      import Q._                 // `X' 被通配引入绑定
      println("L7: " + X)        // 这里 `X' 指代 `Q.X'
      import X._                 // `x' 和 `y' 被通配引入绑定
      println("L8: " + x)        // 这里 `x' 指代 `Q.X.x'
      object C {
        val x = 3                // `x' 被局部定义绑定
        println("L12: " + x)     // 这里 `x' 指代常数 `3'
        { 
          import Q.X._           // `x' 和 `y' 被通配引入绑定
//        println("L14: " + x)   // 这里的 `x' 是二义的
          import X.y             // `y' 被显式引入绑定
          println("L16: " + y)   // 这里 `y' 指代 `Q.X.y'
          { 
            val x = "abc"        // `x' 被局部定义绑定
            import P.X._         // `x' 和 `y' 被通配引入绑定
//          println("L19: " + y) // 这里的 `y' 是二义的
            println("L20: " + x) // 这里 `x' 指代字符串 "abc"
          }
        }
      }
    }
  }
}
</pre>