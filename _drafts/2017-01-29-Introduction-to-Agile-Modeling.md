---
layout: post_original
title: 敏捷建模 - 入门简介
category: SoftwareProcess
author: Robert Peng
---

<h4 id="statement">声明</h4>

本文是对 [Agile Modeling](http://www.agilemodeling.com/) 网站的翻译和顺序整理，旨在为中文读者提供更好的阅读体验。
文章中的绝大部分内容均为我个人对原文进行翻译所得，并非个人原创，文中的“我”应指代[《Agile Modeling: Effective Practices for eXtreme Programming and the Unified Process》](https://www.amazon.com/Agile-Modeling-Effective-Practices-Programming/dp/0471202827/ref=sr_1_1?s=books&ie=UTF8&qid=1485676233&sr=1-1&keywords=Agile+Modeling)一书的作者，[Scott Ambler](http://www.ambysoft.com/scottAmbler.html)。本文部分翻译参考了由张嘉路、朱鹏、程宾所共同翻译的[《敏捷建模：极限编程和统一过程的有效实践》](http://baike.baidu.com/link?url=-VuKPi42JB4bBZA-5hwBYzggeBpF0I-A0jibvxa4IeeWSVUHKEEo65WI21p9bcAQ_1wxhIvnHgenrU_ccwCxD_-mIO-bVf2-QOJihK-Cz2HBr9dRN44K5tINTITRC6vZ6l9zy29vD5ziYg09PUU-dKt3zxrMqaIX6in9NwsvlSbmXBWrF6UOrLz5rywXBBvHwKU0QoVcdutWlCUyCUkb8WPt5VKMcJSywH6DZKrGB6iBlS1xmXYxUwbFZKXXeHtF4P4msb8lLXujJmuLniuKI1U_rViLUAC0bBm-LffJwdxpm7sZ8UhNCgKMO-GXziPT)一书。在此对该书译者的辛勤工作表示由衷的感谢。

<h2 id="introduction">1. 敏捷建模概述</h2>

原文出处：[An Introduction to Agile Modeling](http://www.agilemodeling.com/essays/introductionToAM.htm)

<!--
    Agile Modeling (AM) is a practice-based methodology for effective modeling and documentation of software-based systems. Simply put, Agile Modeling (AM) is a collection
    of values, principles, and practices for modeling software that can be applied on a software development project in an effective and light-weight manner. As you see in
    Figure 1 AM is meant to be tailored into other, full-fledged methodologies such as XP or RUP, enabling you to develop a software process which truly meets your needs.
    In fact, this tailoring work has already been done for you in the form of the Disciplined Agile Delivery (DAD) process framework.
-->
敏捷建模（Agile Modeling, AM）是用于对基于软件的系统进行有效建模和文档编写的一套基于具体实践的方法。简单来讲，敏捷建模由对软件进行建模的一系列价值观（value）、原则（principle）和实践（practice）
所组成，可便捷有效地应用于软件开发项目。正如图 1 所示，敏捷建模理应与其他成熟的开发方法，如[极限编程](http://agilemodeling.com/essays/agileModelingXP.htm)、
[合理统一过程](http://agilemodeling.com/essays/agileModelingRUP.htm)等相结合，以使你能开发出一套能真正满足你的需求的软件开发流程。实际上，
这项工作已经以遵循[规范敏捷交付](http://www.disciplinedagiledelivery.com/)（Disciplined Agile Delivery, DAD）流程框架的方式为你预先完成了。

![](http://agilemodeling.com/images/amScope.gif)

<!--
    The values of AM, adopting and extending those of eXtreme Programming v1, are communication, simplicity, feedback, courage, and humility. The keys to modeling success
    are to have effective communication between all project stakeholders, to strive to develop the simplest solution possible that meets all of your needs, to obtain feedback
    regarding your efforts often and early, to have the courage to make and stick to your decisions, and to have the humility to admit that you may not know everything, that
    others have value to add to your project efforts.
-->
扩展自第一版[极限编程](http://www.extremeprogramming.org/)（eXtreme Programming），敏捷建模的价值观在于[沟通](#communication)、[简便](#simplicity)、[反馈](#feedback)、
[勇气](#courage)与[谦逊](#humility)。进行成功建模的关键在于在所有项目关系人之间进行有效沟通，努力寻找能满足你所有需求的最简单的解决方案，更快更多地获取关于你的工作的反馈，
拥有足够的勇气做出并坚持你自己的决定，以及足够谦逊以认识到你可能并不清楚所有事情，而其他人也能为你的项目增添价值。

<!--
    AM is based on a collection of principles, such as the importance of assuming simplicity when you are modeling and embracing change as you are working because requirements
    will change over time. You should recognize that incremental change of your system over time enables agility and that you should strive to obtain rapid feedback on your
    work to ensure that it accurately reflects the needs of your project stakeholders. You should model with a purpose, if you don't know why you are working on something or
    you don't know what the audience of the model/document actually requires then you shouldn't be working on it. Furthermore, you need multiple models in your intellectual
    toolkit to be effective. A critical concept is that models are not necessarily documents, a realization that enables you travel light by discarding most of your models
    once they have fulfilled their purpose. Agile modelers believe that content is more important than representation, that there are many ways you can model the same concept
    yet still get it right. To be an effective modeler you need to recognize that open and honest communication is often the best policy to follow to ensure effective teamwork.
    Finally, a focus on quality work is important because nobody likes to produce sloppy work and that local adaptation of AM to meet the exact needs of your environment is
    important.
-->
敏捷建模以一系列原则为基础，例如在你建模的时候主张简单以及在你工作持续进行的同时拥抱变化，考虑到需求随时都有可能变化。你需要意识到对你的系统进行增性修改可使开发变得敏捷，
而且你还应该努力快速地获得对你的工作的反馈以确保其能准确地满足你的项目关系人的需求。你应该带着确切目的来进行建模：如果你还不知道你做某件事是为了什么，或者你还不了解某个模型或文档的具体读者需要什么，
你就不应该继续进行这项工作。除此之外，你需要学会运用各种不同种类的模型来进行有效的工作，关键在于要认识到模型并不一定等于文档，同时学会在模型达成其所有目的后便将其弃用以让你能轻装上路。
敏捷建模者认为内容比表现形式更重要，即你可以用许多不同的方式来对相同的概念进行正确的建模。要成为一个有效的建模者，你应该认识到要进行有效的团队合作，实行开诚的交流往往是最好的策略。
最后，团队应以进行高质量工作为重点，因为没人喜欢马虎的工作，同时应对敏捷建模进行一定的修改以适应你的开发环境的具体需要。

<!--
    To model in an agile manner you will apply AM's practices as appropriate. Fundamental practices include creating several models in parallel, applying the right artifact(s)
    for the situation, and iterating to another artifact to continue moving forward at a steady pace. Modeling in small increments, and not attempting to create the magical
    "all encompassing model" from your ivory tower, is also fundamental to your success as an agile modeler. Because models are only abstract representations of software,
    abstractions that may not be accurate, you should strive to prove it with code to show that your ideas actually work in practice and not just in theory Active stakeholder
    participation is critical to the success of your modeling efforts because your project stakeholders know what they want and can provide you with the feedback that you require.
    The principle of assume simplicity is a supported by the practices of creating simple content by focusing only on the aspects that you need to model and not attempting to
    creating a highly detailed model, depicting models simply via use of simple notations, and using the simplest tools to create your models. You travel light by single sourcing
    information, discarding temporary models and updating models only when it hurts. Communication is enabled by displaying models publicly, either on a wall or internal web site,
    through collective ownership of your project artifacts, through applying modeling standards, and by modeling with others. Your development efforts are greatly enhanced when
    you apply patterns gently. Because you often need to integrate with other systems, including legacy databases as well as web-based services, you will find that you need to
    formalize contract models with the owners of those systems. Read this article for a better understanding of how AM's practices fit together.
-->

<!--
I would argue that AM is an agile approach to modeling, that at its core AM is simply a collection of practices that reflect the principles and values shared by many experienced
software developers. With an Agile Model Driven Development (AMDD) (see Figure 2) approach you typically do just enough high-level modeling at the beginning of a project to
understand the scope and potential architecture of the system, and then during development iterations you do modeling as part of your iteration planning activities and then
take a just in time (JIT) model storming approach where you model for several minutes as a precursor to several hours of coding.
-->
我认为敏捷建模是一种进行建模的敏捷方法，其本质不过是一系列反映了由许多有经验的软件开发者所认同的原则与价值观的实践。在采用敏捷模型驱动开发（Agile Model Driven Development，AMDD，见图 2）时，
你通常会在项目开始时进行相对高层次的建模以对系统所包括的范围以及可能的架构有所认识，而后在迭代的过程中将建模作为你对此次迭代的计划工作的一部分，然后再采用适时模型风暴方法来花上几分钟时间进行建模，
指导你接下来几小时的代码编写工作。

![](http://agilemodeling.com/images/AMDD.gif)

<!--
    Another way to look at Agile Modeling is as a collection of best practices, as you see in Figure 3.
-->
你还可以将敏捷建模视作一系列的最佳实践，如图 3 所示：

![](http://agilemodeling.com/images/bestPractices.jpg)

<!--
    My experience is that these practices can be applied to most software development projects, you don't have to be working on an project following an agile software process
    (such as XP) to take advantage of the approaches described by AM, although one of AM's goals is to explain how to model when following the XP approach. A project team
    doesn't need to apply all of the practices, principles, and values of AM to benefit from it -- I have always been a firm believer that you should tailor your software
    process to reflect the unique needs of your environment -- although it is my opinion that like XP you are much more likely to succeed if you do adopt all of AM.
-->
从我的经验来看，这些实现方法可被用于大多数软件开发项目，即使你的项目并没有遵循任何敏捷开发流程（如极限编程）也可以应用这些由敏捷建模所描述的方法，
尽管敏捷建模的其中一个目的就是解释在采用极限编程时如何进行建模。项目团队并不需要采用敏捷建模的所有实践、原则或价值观：
我向来认为你们应当修改出你们自己的软件开发流程以反映你们的开发环境的独特需求，尽管我也认为，正如极限编程那般，完整地采用敏捷建模更容易让你们顺利完成工作。

<h2 id="values">2. 敏捷建模的价值观</h2>

原文出处：[The Values of Agile Modeling](http://www.agilemodeling.com/values.htm)

<!--
    In the first edition of Extreme Programming Explained Kent Beck described four values of XP -- communication, simplicity, feedback and courage -- which I adopted for AM.
    At the time I felt that there was something missing, and decided to add a fifth one, humility. Then, in the second edition of Extreme Programming Explained Kent added a
    fifth value, respect. Respect and humility are two sides of the same coin, in my opinion.
-->
在第一版的[《Extreme Programming Explained》](https://www.amazon.com/exec/obidos/ASIN/0321278658/ambysoftinc)一书中，Kent Beck 提到了极限编程的四个价值观：沟通、简便、反馈和勇气，
而我则将其用作了敏捷建模的价值观。在当时我感到好像还缺了一点东西，于是就加入了第五个价值观 —— 谦逊。在那之后，在第二版的《Extreme Programming Explained》中，Kent 加入了第五个价值观 ——
尊重。我个人认为，尊重和谦逊是大致相同的。

<!--
    The five values of Agile Modeling (AM) are:
-->
敏捷建模的五个价值观如下：

<ul>
    <!--
        Communication. Models promote communication between your team and your project stakeholders as well as between developers on your team.
    -->
    <li id="communication">
    <b>沟通（Communication）</b>：模型将促进你的团队与项目关系人以及你的团队开发者之间的沟通
    </li>
    <!--
        Simplicity. It’s important that developers understand that models are critical for simplifying both software and the software process — it’s much easier to explore an
        idea, and improve upon it as your understanding increases, by drawing a diagram or two instead of writing tens or even hundreds of lines of code.
    -->
    <li id="simplicity">
    <b>简便（Simplicity）</b>：开发者应认识到模型可以简化软件以及软件开发流程 —— 与其直接写上百行代码，画上一两张图并在此基础之上探索你们各自的想法，并在你们的认知逐渐完善的过程中对其进行改进可要简单得多。
    </li>
    <!--
        Feedback. Kent Beck says it best in Extreme Programming Explained: “Optimism is an occupational hazard of programming, feedback is the treatment.” By communicating
        your ideas through diagrams, you quickly gain feedback, enabling you to act on that advice.
    -->
    <li id="feedback">
    <b>反馈（Feedback）</b>：Kent Beck 在《Extreme Programming Explained》一书中说得很好：“乐观主义是编程的职业病，而反馈则是最好的良药。” 通过使用示意图与其他人沟通你的想法，你可以更快地获得他人的反馈，
    并使你能依此做出改进。
    </li>
    <!--
        Courage. Courage is important because you need to make important decisions and be able to change direction by either discarding or refactoring your work when some of
        your decisions prove inadequate.
    -->
    <li id="courage">
    <b>勇气（Courage）</b>：勇气是十分重要的，因为你需要做出关键的决定，并在你的决定被证实不准确时通过重构或完全丢弃你现有的工作成果来改变方向。
    </li>
    <!--
        Humility. The best developers have the humility to recognize that they don't know everything, that their fellow developers, their customers, and in fact all project
        stakeholders also have their own areas of expertise and have value to add to a project. An effective approach is to assume that everyone involved with your project
        has equal value and therefore should be treated with respect. Huet Landry suggests the concept of "Other Esteem", instead of "Self Esteem", where you treat the opinions
        of others as if they have more value than yours. With this approach your first reaction to another's idea will be most positive.
    -->
    <li id="humility">
    <b>谦逊（Humility）</b>：最优秀的开发者拥有足够的谦逊以认识到他们不是什么事情都懂，知道他们的同僚开发者、他们的客户以及所有项目关系人都有着他们自己的专长领域且能为项目增添价值。
    一种有效的做法是认为所有参与你的项目的人都有着相同的价值，因此也应当对其保持尊重。Huet Landry 提倡“他尊”的概念，你应当认为他人的观点比你自己的观点有更高的价值，而不是“自尊”。
    如此一来你对他人想法的第一反应在大多数时候都会是积极的。
    </li>
</ul>

<h2 id="principles">3. 敏捷建模的原则</h2>

原文出处：[The Principles of Agile Modeling](http://www.agilemodeling.com/principles.htm)

<!--
    Agile Modeling (AM) defines a collection of core and supplementary principles that when applied on a software development project set the stage for a collection of
    modeling practices. Some of the principles have been adopted from eXtreme Programming (XP) and are well documented in Extreme Programming Explained, which in turn
    adopted them from common software engineering techniques. For the most part the principles are presented with a focus on their implications to modeling efforts and
    as a result material adopted from XP may be presented in a different light.
-->
敏捷建模定义了一系列的核心原则和补充原则，当它们被应用于软件开发项目时可为后续应用其他建模实践打好基础。其中的一些原则源自于极限编程且在《Extreme Programming Explained》一书中有着很好的定义，
而该书则是从通用的软件工程技术中汲取出这些原则的。下文对于这些原则的表述多数侧重于其对建模工作的影响，因此可能会从新的角度来诠释那些源于极限编程的方方面面。

<!--
    The AM principles are organized into two lists, core principles which you must adopt to be able to claim that you're truly taking an Agile Model Driven Development
    (AMDD) approach and supplementary principles which you should consider tailoring into your software process to meet the exact needs of your environment. In January
    2005 I added a third list, deprecated principles which I've decided to remove in the second release of the AMDD methodology in order to simplify it.
-->
敏捷建模原则被分为两类：在应用了以后你才能说你真的在使用敏捷模型驱动开发方法的[__核心原则__](#core-principles)以及那些你应当考虑引入到你的软件开发流程中以满足你的开发环境的确切需求的[__补充原则__](#supplementary-principles)。
在 2005 年的 1 月份，我新增了第三个分类，即[过时原则](#deprecated-principles)：我决定将这些原则从第二版的敏捷模型驱动开发方法中移除以进行简化。

<h3 id="core-principles">3.1. 核心原则</h3>

<dl>
    <!--
        Model With A Purpose. Many developers worry about whether their artifacts -- such as models, source code, or documents -- are detailed enough or if they are too
        detailed, or similarly if they are sufficiently accurate. What they're not doing is stepping back and asking why they're creating the artifact in the first place
        and who they are creating it for. With respect to modeling, perhaps you need to understand an aspect of your software better, perhaps you need to communicate your
        approach to senior management to justify your project, or perhaps you need to create documentation that describes your system to the people who will be operating
        and/or maintaining/evolving it over time. If you cannot identify why and for whom you are creating a model then why are you bothering to work on it all? Your first
        step is to identify a valid purpose for creating a model and the audience for that model, then based on that purpose and audience develop it to the point where it
        is both sufficiently accurate and sufficiently detailed. Once a model has fulfilled its goals you're finished with it for now and should move on to something else,
        such as writing some code to show that the model works. This principle also applies to a change to an existing model: if you are making a change, perhaps applying
        a known pattern, then you should have a valid reason to make that change (perhaps to support a new requirement or to refactor your work to something cleaner).
        An important implication of this principle is that you need to know your audience, even when that audience is yourself. For example, if you are creating a model
        for maintenance developers, what do they really need? Do they need a 500 page comprehensive document or would a 10 page overview of how everything works be
        sufficient? Don't know? Go talk to them and find out.
    -->
    <dt id="model-with-a-purpose">有目的地建模（Model with a Purpose）</dt>
    <dd>
        对于自己的软件制品，如模型、源代码、文档，很多开发者不是担心它们是否不够详细，就是担心它们是否过于详细，或担心它们是否不够准确，但他们从未想过回头想想，一开始他们为什么要创造这些制品。
        对于模型来说，你建立这个模型或许是为了让你自己更好地理解你的软件的某个方面，或许你想要以此来和高层管理者交流你的方法以证明项目是可行的，或许你是想要创建一个能描述你的系统的文档，
        让其他人在将来能够操作、维护、改进你的系统。如果连为什么建模和为谁建模都不清楚，为什么还要在这个模型上劳心费力呢？首先，你应该确定创建这个新模型的目的以及该模型的受众，
        然后基于目的和受众来完善模型到其刚好足够准确且足够详细。在这个模型达成这些目标后，你的建模工作就完成了，你也应该把精力转移到其他事情上去了，比如编写一些代码来证明这个模型是正确的。
        这项原则同样适用于对已有模型的修改：如果你想要对模型进行修改，例如应用某种大家都知道的模式，那么你也应当有做出这种修改的合理理由（也许是为了满足一项新的需求，或者是为了将你的模型重构得更加简洁）。
        这项原则的一个关键在于你需要知道你的受众是谁，即使你的受众就是你自己。例如，如果你是要为维护人员创建模型，那么他们需要什么？他们需要的会是一个 500 页纸的详细文档，
        还是说一个大致描述了系统运转原理的 10 页纸概述就够了呢？搞不清楚的话，就去和他们聊聊，找出答案吧。
    </dd>
    <!--
        Maximize Stakeholder ROI. Your project stakeholders are investing resources -- time, money, facilities, and so on -- to have software developed that meets their needs.
        Stakeholders deserve to invest their resources the best way possible and not to have resources frittered away by your team. Furthermore, they deserve to have the final
        say in how those resources are invested or not invested. If it was your resources, would you want it any other way? Note: In AM v1 this was originally called "Maximize
        Stakeholder Investment". Over time we realized that this term wasn't right because it sounded like we were saying you needed to maximize the amount of money spent,
        which wasn't the message.
    -->
    <dt id="maximize-stakeholder-roi">最大化项目关系人的投资回报率（Maximize Stakeholder ROI）</dt>
    <dd>
        项目关系人为了让你能开发出满足他们需求的软件投入了时间、金钱、设备等资源。他们理应可以以最好的方式来投资他们的资源，而不是被你的团队浪费掉。除此之外，
        他们也理应拥有就是否投入以及如何投入这些资源的最终决定权。假设这些是你的资源，你难道不想这样吗？值得注意的是，在第一版的敏捷建模中，这项原则实际上被称为“最大化项目关系人的投资”（Maximize
        Stakeholder Investment）。随着时间的推移，我们意识到这种说法并不准确，因为它听起来像是在说你们应该花更多的钱，尽管我们并不是那个意思。
    </dd>
    <!--
        Travel Light. Every artifact that you create, and then decide to keep, will need to be maintained over time. If you decide to keep seven models, then whenever a change
        occurs (a new/updated requirement, a new approach is taken by your team, a new technology is adopted, ...) you will need to consider the impact of that change on all
        seven models and then act accordingly. If you decide to keep only three models then you clearly have less work to perform to support the same change, making you more
        agile because you are traveling lighter. Similarly, the more complex/detailed your models are, the more likely it is that any given change will be harder to accomplish
        (the individual model is "heavier" and is therefore more of a burden to maintain). Every time you decide to keep a model you trade-off agility for the convenience of
        having that information available to your team in an abstract manner (hence potentially enhancing communication within your team as well as with project stakeholders).
        Never underestimate the seriousness of this trade-off. Someone trekking across the desert will benefit from a map, a hat, good boots, and a canteen of water they likely
        won't make it if they burden themselves with hundreds of gallons of water, a pack full of every piece of survival gear imaginable, and a collection of books about the
        desert. Similarly, a development team that decides to develop and maintain a detailed requirements document, a detailed collection of analysis models, a detailed
        collection of architectural models, and a detailed collection of design models will quickly discover they are spending the majority of their time updating documents
        instead of writing source code.
    -->
    <dt id="travel-light">轻装出行（Travel Light）</dt>
    <dd>
        每一个由你创建且决定保留的制品都需要维护。假设你决定保留 7 个模型，那么每次出现变化时（例如有新的需求，或者需求被修改，或者你的团队打算采用新的方法或技术），
        你需要去考虑这个变化对所有 7 个模型各自的影响并分别作出反应。如果你你决定只保留 3 个模型那么很显然在发生同样的变化时你需要做的事情会更少，这也就使得你的开发更加敏捷，
        因为你更加轻装地出行了。类似地，模型越复杂、越详细，你要实现某种变化就更难了，因为每个模型都变得更加笨重，维护起来也就更难了。
        每一次你决定保留一个新的模型实际上都是在牺牲开发敏捷性以让某些抽象的信息能为你的团队所用（同时可能还可以增强团队内部以及与项目关系人的交流）。千万不要低估这种权衡交易的严重性。
        一幅地图、一个帽子、一双好鞋和一壶水对于打算步行穿越沙漠的人来说十分有用，但假如他们带上好几百升的水、一整大包的所以可以想到的野外生存装备以及一大摞有关沙漠的书，恐怕他们就很难穿过沙漠了。
        类似地，如果一个开发团队决定开发并维护一份详细的需求文档、一堆详细的分析模型、架构模型以及设计模型，那么他们很快就会发现他们把大多数时间花在了更新文档上而不是编写代码上。
    </dd>
    <!--
        Multiple Models. You potentially need to use multiple models to develop software because each model describes a single aspect of your software. “What models are
        potentially required to build modern-day business applications?” Considering the complexity of modern day software, you need to have a wide range of techniques in your
        intellectual modeling toolkit to be effective (see Modeling Artifacts for AM for a start at a list and Agile Models Distilled for detailed descriptions). An important
        point is that you don't need to develop all of these models for any given system, but that depending on the exact nature of the software you are developing you will
        require at least a subset of the models. Different systems, different subsets. Just like every fixit job at home doesn't require you to use every tool available to you
        in your toolbox, over time the variety of jobs you perform will require you to use each tool at some point. Just like you use some tools more than others, you will use
        some types of models more than others. For more details regarding the wide range of modeling artifacts available to you, far more than those of the UML as I show in the
        essay Be Realistic About the UML.
    -->
    <dt id="multiple-models">多种模型（Multiple Models）</dt>
    <dd>
        你在开发软件的过程中可能会需要使用多种模型，因为一种模型只能描述你的软件的一个方面。“开发一个现代的商业应用程序可能需要什么样的模型呢？”考虑到现代软件的复杂程度，
        你的建模知识工具箱中恐怕需要有大量不同的技术才能是你的工作变得有效（详见 <a href="http://agilemodeling.com/essays/modelingTechniques.htm">Modeling Artifacts for AM</a>
        与 <a href="http://agilemodeling.com/artifacts/index.htm">Agile Models Distilled</a>）。值得注意的是，在开发某个给定的系统时，你不需要为之构建所有种类的模型，
        不过尽管取决于该软件的本质，你仍会需要这些模型的某个子集，而不同的系统会需要不同的子集。正如家里的维修工作那样，一次维修通常不会需要你用上你的工具箱中的每一个工具，
        但随着时间的推移，你做过的维修工作的多样性开始增加，你也就渐渐需要用上工具箱中的每个工具里。同样，正如你在维修时会更多地使用某些工具那样，某些模型也会更多地被你所使用。
    </dd>
    <!--
        Rapid Feedback. The time between an action and the feedback on that action is critical. By working with other people on a model, particularly when you are working with
        a shared modeling technology (such as a whiteboard, CRC cards, or essential modeling materials such as sticky notes) you are obtaining near-instant feedback on your
        ideas. Working closely with your customer, to understand the requirements, to analyze those requirements, or to develop a user interface that meets their needs,
        provides opportunities for rapid feedback.
    -->
    <dt id="rapid-feedback">快速反馈（Rapid Feedback）</dt>
    <dd>
        从采取行动到行动反馈之间的时间差长短是十分重要的。通过与其他人一起开发模型，尤其是在你们使用相同的建模技术（如白板、CRC 卡片，或是像即时贴之类的基本建模材料）的时候，
        你的想法几乎可以立刻得到反馈。和你的客户紧密合作能使你获得快速反馈，无论你是去了解他们的需求、分析他们的需求，或是开发满足他们需求的用户界面。
    </dd>
    <!--
        Assume Simplicity. As you develop you should assume that the simplest solution is the best solution. Don't overbuild your software, or in the case of AM don't depict
        additional features in your models that you don't need today. Have the courage that you don't need to over-model your system today, that you can model based on your
        existing requirements today and refactor your system in the future when your requirements evolve. Keep your models as simple as possible.
    -->
    <dt id="assume-simplicity">主张简单（Assume Simplicity）</dt>
    <dd>
        在开发工作中，你应当假定最简单的解决方案就是最好的解决方案。不要对你的软件进行过度构建，或者拿建模来说，如果你现在不需要某项额外功能，那就不要在模型中描述它。你要有足够的勇气，
        相信你不需要现在就对你的系统进行过度建模，而应该只针对现存的需求进行建模，日后需求发生变化时再对你的系统进行重构。尽可能让你的模型保持简单。
    </dd>
    <!--
        Embrace Change. Requirements evolve over time. People's understanding of the requirements change over time. Project stakeholders can change as your project moves
        forward, new people are added and existing ones can leave. Project stakeholders can change their viewpoints as well, potentially changing the goals and success
        criteria for your effort. The implication is that your project's environment changes as your efforts progress, and that as a result your approach to development
        must reflect this reality.
    -->
    <dt id="embrace-change">包容变化（Embrace Change）</dt>
    <dd>
        需求随时都会变化，人们对需求的理解也随时会变化。随着项目的推进，项目关系人可能发生变化：新的项目关系人可能加入，原有的项目关系人可能离去。项目关系人的观点也可能会发生变化，
        可能还会导致你努力的目标和成功的标准发生变化。也就是说，随着工作的推进，你的项目的环境会发生变化，因此你的开发方法也必须顺应这个事实。
    </dd>
    <!--
        Incremental Change. An important concept to understand with respect to modeling is that you don't need to get it right the first time, in fact, it is very unlikely
        that you could do so even if you tried. Furthermore, you do not need to capture every single detail in your models, you just need to get it good enough at the time.
        Instead of futilely trying to develop an all encompassing model at the start, you instead can put a stake in the ground by developing a small model, or perhaps a
        high-level model, and evolve it over time (or simply discard it when you no longer need it) in an incremental manner.
    -->
    <dt id="incremental-change">增性修改（Incremental Change）</dt>
    <dd>
        对建模来说，你需要认识到你不需要在一开始就完全做对 —— 实际上，即使你想这么做，你也很可能做不到。此外，你的模型也不需要覆盖每一个细节，你只要适时地把模型开发到刚刚足够好就可以了。
        比起在一开始就无谓地开发出包含所有细节的模型，你可以只开发一个相对小的模型，或是一个相对高层的模型，并在未来以增性的方式慢慢对其进行改进，或是在你不再需要它的时候直接将其丢弃。
    </dd>
    <!--
        Quality Work. Nobody likes sloppy work. The people doing the work don't like it because it's something they can't be proud of, the people coming along later to
        refactor the work (for whatever reason) don't like it because it's harder to understand and to update, and the end users won't like the work because it's likely
        fragile and/or doesn't meet their expectations.
    -->
    <dt id="quality-work">重视高质量工作（Quality Work）</dt>
    <dd>
        没人喜欢马马虎虎的工作。这在做这个工作的人不会喜欢，因为他们不会为此感到自豪；后续加入的出于某些原因要对其进行重构的人不会喜欢，因为它更难被理解和修改；最终用户也不会喜欢，
        因为它容易出错，或是没能符合他们的预期。
    </dd>
    <!--
        Working Software Is Your Primary Goal. The goal of software development is to produce high-quality working software that meets the needs of your project stakeholders
        in an effective manner. The primary goal is not to produce extraneous documentation, extraneous management artifacts, or even models. Any activity that does not
        directly contribute to this goal should be questioned and avoided if it cannot be justified in this light.
    -->
    <dt id="working-software-is-your-primary-goal">构建可正确运行的软件是你的首要目标（Working Software is Your Primary Goal）</dt>
    <dd>
        我们的首要目标不是要生产出大量的文档、管理用制品或模型。用有效的方法生产出满足项目关系人所有需求的可以正确运行的高质量软件才是软件开发的目标。
        任何不能直接地有助于这一目标的活动都应受到质疑，且在无法给出合理解释时直接被取消。
    </dd>
    <!--
        Enabling The Next Effort Is Your Secondary Goal. Your project can still be considered a failure even when your team delivers a working system to your users – part of
        fulfilling the needs of your project stakeholders is to ensure that your system robust enough so that it can be extended over time. As Alistair Cockburn likes to say,
        when you are playing the software development game your secondary goal is to setup to play the next game. Your next effort may be the development of the next major
        release of your system or it may simply be the operations and support of the current version you are building. To enable it you will not only want to develop quality
        software but also create just enough documentation and supporting materials so that the people playing the next game can be effective. Factors that you need to consider
        include whether members of your existing team will be involved with the next effort, the nature of the next effort itself, and the importance of the next effort to your
        organization. In short, when you are working on your system you need to keep an eye on the future.
    -->
    <dt id="enabling-the-next-effort-is-your-secondary-goal">支持后续工作是你的第二目标（Enabling the Next Effort is Your Secondary Goal）</dt>
    <dd>
        即使你的团队最终把一个可以正常运行的系统放到了用户的面前，你的项目也有可能是失败的，因为项目关系人在另一方面也需要你确保你的系统足够健壮使其能在未来得以扩展。
        正如 Alistair Cockburn 喜欢说的那样，当你开始玩软件开发这场游戏的时候，你的第二目标就是要准备好进入下一场游戏。你的后续工作也许是要开发系统的下一次重要更新，
        也可能是为你现在正在构建的当前版本进行运营与相关支持。为了使你能完成这些后续工作，你不仅仅需要开发出一个高质量软件，还要创建出足够多的文档和相关材料来让玩下一场游戏的人可以有效地开展工作。
        你需要考虑的因素包括你现在团队中的某些人是否会负责后续的工作、后续工作的本质以及该工作对你的组织的重要性。总而言之，在你开发系统的时候，你还需要着眼于未来。
    </dd>
</dl>

<h3 id="supplementary-principles">3.2. 补充原则</h3>

<dl>
    <!--
        Content Is More Important Than Representation. Any given model could have several ways to represent it. For example, a UI specification could be created using Post-It
        notes on a large sheet of paper (an essential or low-fidelity prototype), as a sketch on paper or a whiteboard, as a "traditional" prototype built using a prototyping
        tool or programming language, or as a formal document including both a visual representation as well as a textual description of the UI. An interesting implication is
        that a model does not need to be a document. Even a complex set of diagrams created using a CASE tool may not become part of a document, instead they are used as inputs
        into other artifacts, very likely source code, but never formalized as official documentation. The point is that you take advantage of the benefits of modeling without
        incurring the costs of creating and maintaining documentation.
    -->
    <dt id="content-is-more-important-than-representation">内容比形式更重要（Content is More Important Than Representation）</dt>
    <dd>
        任何模型都可以有多种不同的表现方式。比如，要创建一个用户界面规格说明，可以在一大张纸上贴一些即时贴（形成一个基本或低精度的原型），可以在纸上或白板上画个草图，
        可以是使用原型工具或编程语言创建“传统”的原型，也可以创建出一个包括用户界面的图形表示和文字描述的正式文档。实际上，模型并不一定是一个文档。
        即使是用 CASE 工具创建的复杂的示意图也有可能不会成为文档的一部分，而是用作其他制品（极有可能是源代码）的输入，但永远不会被正式化为官方文档。
        问题的关键在于你应当利用建模的好处而又不会为创建和维护文档花费资源。
    </dd>
    <!--
        Open And Honest Communication. People need to be free, and to perceive that they are free, to offer suggestions. This includes ideas pertaining to one or more models,
        perhaps someone has a new way to approach a portion of the design or has a new insight regarding a requirement; the delivery of bad news such as being behind schedule;
        or simply the current status of their work. Open and honest communication enables people to make better decisions because the quality of the information that they are
        basing them on is more accurate.
    -->
    <dt id="open-and-honest-communication">开放和诚实的交流（Open and Honest Communication）</dt>
    <dd>
        人们需要在自由且知道自己在自由的环境下才能提出建议。这些建议包括与一个或多个模型有关的想法，例如也许某人对解决设计的某些问题有了新的想法，或是他对某项需求有了新的认识，
        也许是他想要告诉你类似进度落后之类的坏消息，也可能他只是想汇报一下当前的工作进度。开放和诚实的交流使得人们能做出更好的决策，因为他们在得出这些决策时使用的是更为准确的信息。
    </dd>
</dl>

<h3 id="deprecated-principles">3.3. 过时原则</h3>

<!--
    To simplify AM, I chose to remove several principles in January of 2005. Although these are still valid ideas which are not going away, but they just won't be considered
    "first order principles" anymore. I found over the years that as I training and mentored people in AMDD that I didn't need to discuss them very much for people to
    understand the approach. The principles which I removed are:
-->
为了简化敏捷建模，在 2005 年的 1 月份我移除了部分原则。尽管这些原则仍然是有用的，但它们不应再被认为是“首要原则”。在这些年我训练和指导其他人使用敏捷模型驱动开发时，
我发现我不需要和他们太多地提及这些原则，人们也能很好地理解这种开发方法。以下便是我移除了的原则：

<table class="table">
    <tr>
        <th>原则</th><th>描述</th><th>移除原因</th>
    </tr>
    <tr>
        <td>每个人都能向别人学习<br>（Everyone Can Learn From Everyone Else）</td>
        <td>
            <!--
                You can never truly master something, there is always opportunity to learn more and to extend your knowledge. Take the opportunity to work with and learn from
                others, to try new ways of doing things, to reflect on what seems to work and what doesn't. Technologies change rapidly, existing technologies such as Java
                evolve at a blinding pace and new technologies such as C# and .NET are introduced regularly. Existing development techniques evolve at a slower pace but they
                still evolve -- As an industry we've understood the fundamentals of testing for quite awhile although we are constantly improving our understanding through
                research and practice. The point to be made is that we work in an industry where change is the norm, where you must take every opportunity to learn new ways
                of doing things through training, education, mentoring, reading, and working with each other.
            -->
            你永远不可能完全掌握某样技术，你总是可以学到更多东西并扩展你的知识面。把握与他人合作并相互学习的机会，尝试解决问题的新途径，思考那些行得通和行不通的方法。技术与时俱进，像 Java
            这样现有的技术正以炫目的步伐向前迈进，而像 C# 和 .NET 这样的新技术也在不断地出现。尽管速度较慢，但现有的技术仍在不断进步。我想说的是，在我们所处的行业中，变化是常态，
            因此你需要把握每一个机会来参加培训、获得教育、获得辅导、多去阅读并与他人合作来学习解决问题的新方法。
        </td>
        <td>
            <!--
                This is a great idea, one that seems to be followed by the vast majority of agilists, but it's very general and therefore does not need to be a principle of
                a specific modeling methodology.
            -->
            这是一种很不错的观点，绝大部分敏捷开发者似乎都遵循着这项原则，但它实在过于普适了，因此不需要作为某个特定建模方法的原则。
        </td>
    </tr>
    <tr>
        <td>了解你的模型<br>（Know Your Models）</td>
        <td>
            <!--
                Because you have multiple models that you can apply you need to know their strengths and weaknesses to be effective in their use.
            -->
            正是因为你可以用上多种不同的模型，因此你需要了解它们的长处和短处以有效地使用它们。
        </td>
        <td>
            <!--
                Knowing what you're doing is always a good idea, but did it really need to be an explicit principle? Likely not.
            -->
            理解你在做的事当然是好的，但我们真的需要指明其作为一个原则吗？似乎不需要。
        </td>
    </tr>
    <tr>
        <td>了解你的工具<br>（Know Your Tools）</td>
        <td>
            <!--
                Software, such as diagramming tools or modeling tools, have a variety of features. If you are going to use a modeling tool then you should understand its
                features, knowing when and when not to use them.
            -->
            像作图工具和建模工具这样的软件有很多功能。如果你需要使用建模工具，你就应该了解它们的功能并知道什么时候应该和什么时候不应该使用它们。
        </td>
        <td>
            <!--
                Same issue as knowing your models.
            -->
            同上。
        </td>
    </tr>
    <tr>
        <td>适应实际情况<br>（Local Adaptation）</td>
        <td>
            <!--
                Your approach to software development must reflect your environment, including the nature of your organization, the nature of your project stakeholders, and the
                nature of your project itself. Issues that could be affected include: the modeling techniques that you apply (perhaps your users insist on concrete user
                interfaces instead of initial sketches or essential prototypes); the tools that you use (perhaps there isn't a budget for a digital camera, or you already have
                licenses for an existing CASE tool); and the software process that you follow (your organization insists on XP, or RUP, or their own process). You will adapt
                your approach at both the project level as well as the individual level. For example, some developers use one set of tools over another, some focus on coding
                with very little modeling whereas others prefer to invest a little more time modeling.
            -->
            你的软件开发方法必须反映你的真实环境，包括你的组织、你的项目关系人以及你的项目的本质。可能受到影响的事情包括：你所使用的建模技术（也许你的用户坚持想要一份具体的用户界面设计而不是只是一份草图和基本原型）、
            你所使用的工具（或许你们没有足够的资金来购买一台数码摄像机，或许你们在此之前已经购买了一套 CASE 工具）以及你们所遵循的软件开发流程（你的组织坚持使用极限编程、合理统一流程或是他们自己独创的流程）。
            你需要在项目层面以及个人层面上对你的方法作出调整。例如，某些开发者会更喜欢喜欢某些工具而不是另一些，某些开发者不喜欢在编写代码前进行过多的建模，而其他开发者又可能愿意在建模上花上更多时间。
        </td>
        <td>
            <!--
                I'm a firm believer that you should tailor a software process to meet your exact needs. However, that doesn't mean that this idea needs to be part of AM,
                instead it needs to be part of your overall software process improvement (SPI) strategy.
            -->
            我一向认为你应当对标准的软件开发流程做出修改以满足你的具体需要，但这并不意味着这应该作为敏捷建模的一部分 —— 实际上你应当将其作为你的软件开发流程改进策略的一部分。
        </td>
    </tr>
    <tr>
        <td>相信直觉<br>（Work With People's Instincts）</td>
        <td>
            <!--
                When someone feels that something isn't going to work, that a few things are inconsistent with one another, or that something doesn't "smell right" then there
                is a good chance that that is actually the case. As you gain experience developing software your instincts become sharper, and what your instincts are telling
                you subconsciously can often be an important input into your modeling efforts. If your instincts tell you that a requirement doesn't make sense or it isn't
                complete investigate it with your users. If your instincts tell you that a portion of your architecture isn't going to meet your needs build a quick technical
                end-to-end prototype to test out your theory. If your instincts tell you that design alternative A is better than design alternative B, and there is no
                compelling reason to choose either one of them, then go with alternative A for now. It's important to understand that the value of courage tells you that should
                assume you can remedy the situation at some point in the future if you discover your instincts were wrong.
            -->
            如果有人觉得某个方法行不通，或者某些东西与其他东西不一致，或者只是单纯地觉得某个东西“不太对”，那么他很有可能是对的。随着你不断积累软件开发的经验，你的直觉也变得越来越敏锐，
            因此你的直觉在潜意识中告诉你的东西在很多时候都可以作为你建模工作的重要输入。如果你的直觉告诉你某个需求不合理或者不够完整，你就当该和你们的用户就其进行完整的调查；
            如果你的直觉告诉你现有架构中的某一部分并不能满足你的需求，那就快速地构建一个端对端技术原型来证明你的理论；如果你的直觉告诉你设计 A 比设计 B 更好，
            但并没有很好的理由选择它们中的任何一个，那就先试着用设计 A 吧。有关勇气价值观的重要一点就在于，你应当相信在未来你发现你的直觉错了的时候，你仍可以做出补救。
        </td>
        <td>
            <!--
                Same issue as everyone can learn from everyone else.
            -->
            同上。
        </td>
    </tr>
</table>

<h2 id="practices">4. 敏捷建模的实践</h2>

原文出处：[The Practices of Agile Modeling](http://www.agilemodeling.com/practices.htm)

<!--
    Agile Modeling (AM) defines a collection of core and supplementary practices, based on the principles of AM. Some of the practices have been adopted from extreme Programming
    (XP) and are well documented in Extreme Programming Explained. As with AM's Principles, the practices are presented with a focus on modeling efforts so material adopted from
    XP may be presented in a different light.
-->
敏捷建模定义了一系列基于其原则的核心实践和补充实践。其中的一些原则源自于极限编程且在《Extreme Programming Explained》一书中有着很好的定义， 而该书则是从通用的软件工程技术中汲取出这些原则的。
正如敏捷建模的原则那般，下文对于这些实践的表述多数侧重于其对建模工作的影响，因此可能会从新的角度来诠释那些源于极限编程的方方面面。

<!--
    The AM practices are organized into two lists, core practices which you must adopt to be able to claim that you're truly taking an Agile Model Driven Development (AMDD)
    approach and supplementary practices which you should consider tailoring into your software process to meet the exact needs of your environment. There are also some really
    good ideas which you should consider adopting but which aren't part of AMDD. In January 2005 I added a third list, deprecated practices which I've decided to remove in the
    second release of the AMDD methodology in order to simplify it.
-->
敏捷建模实践被分为两类：在应用了以后你才能说你真的在使用敏捷模型驱动开发方法的[__核心实践__](#core-practices)，
以及那些你应当考虑引入到你的软件开发流程中以满足你的开发环境的确切需求的[__补充实践__](#supplementary-practices)。
 在 2005 年的 1 月份，我新增了第三个分类，即[过时实践](#deprecated-practices)：我决定将这些实践从第二版的敏捷模型驱动开发方法中移除以进行简化。

<h3 id="core-practices">4.1. 核心实践</h3>


