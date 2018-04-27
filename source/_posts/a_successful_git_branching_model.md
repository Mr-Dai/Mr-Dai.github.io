---
title: 有效的 Git 分支模式
date: 2015-09-28
category: Git
tags:
 - Git
 - 团队协作
---

本文译自 [Vincent Driessen](http://nvie.com/about/) 的[《A Successful Git Branch Model》](http://nvie.com/posts/a-successful-git-branching-model/)，转载时请注明原文链接。

在这篇文章中我将为大家介绍我这一年以来在工作项目和个人项目上都有在使用的开发模式，而事实也证明该模式十分有效可行。实际上，我很久以前就打算要写这篇文章了，但直到现在我才终于抽出时间来把它写完。在这篇文章中，我会详细地讲述项目的分支策略和发布版本管理，但我并不会讲述任何项目的有关细节。

<!-- more -->

![](/img/git-model@1.png)

这一切都要从我们以 [Git](http://git-scm.com) 作为项目的版本管理工具开始说起。

## 为什么要用 Git ？

如果你想了解 Git 对比于如 SVN 等中央式源代码管理系统有怎么样的优势和劣势的话，你在[网上](http://whygitisbetterthanx.com/")稍微[浏览](http://git.or.cz/gitwiki/GitSvnComparsion)一下便能找到答案。这么久以来，两党之间可谓是战火不断。作为一个开发者，我本人更倾向于 Git。我认为 Git 极大地改变了开发者对分支与合并的认知。在我的印象里，用 CVS 或是 SVN 进行分支或合并着实是有些吓人（当心合并冲突，他们会咬你的 :D），而且这样的操作也很少会进行。

但对于使用 Git 的人来说，这样的操作却是相当的方便快捷，这样的操作也早已成为他们的家常便饭。举个例子，在 CVS/Subversion 的相关[书籍](http://svnbook.red-bean.com)中，分支与合并一直到书的后半部分才作为高级功能首次出现，而大部分的[书](http://pragprog.com/titles/tsgit/pragmatic-version-control-using-git">Git</a><a href="http://book.git-scm.com)[籍](http://github.com/progit/progit)早在第三章便将其作为基本功能进行介绍。

正是由于它们的简便性，我们不再需要惧怕分支和合并。版本控制工具本来就应该更好地支持分支与合并。

好了，我们还是谈谈开发模型吧。接下来我要介绍的模型实际上不过是一些简单的操作，但若您的开发团队中的每一个开发人员都能严格遵循这些操作要求的话，您的软件开发过程将从此变得有条不紊。

## 分布而又集中

这个分支模型会使用一个中央的 Repo，尽管 Git 作为一个 DVCS（译注：分布式版本控制系统），从技术层面上来讲并不存在什么“中央的 Repo ”。接下来我会以 `origin` 来指代这个 Repo，相信所有 Git 使用者对这个名字应该也是相当熟悉了。

开发人员会从 `origin` 上<kbd>pull</kbd>或者是<kbd>push</kbd>，但除了这种集中式的 push 和 pull 以外，开发人员还可以相互之间组成一些功能开发小分队，从他的其他小伙伴那 pull 一些代码改动过来。比如说，如果有那么几个开发者需要一起开发一个新功能，那么使用 Git 的这种分布式关系则可以有效避免过早地将改动 push 到 `origin` 上。在下面的示例图中，我们就看到了分别由 Alice 和 Bob、Alice 和 David 以及 Clair 和 David 组成的三个小分队。

![](/img/git-model@2.png)

但，从技术上来讲的话，这仅仅意味着 Alice 在自己的机器上定义了一个叫做 bob 的 Git Remote，它指向 Bob 机器上的 Repo。反之亦然。

## 主分支

![](/img/git-model@3.png)

这个开发模型的核心部分实际上更多的是受到了其他已有模型的启发。中央 Repo 包含着两个将永久存在的主分支：

- `master`
- `develop`

大家应该相当熟悉 `origin` 上的 `master` 分支了。平行于 `master` 分支的另一条分支被称为 `develop`。

我们将 `origin/master` 视为主分支，因此位于它的 `HEAD` 的源代码在任何时候都应是可作为产品发布的代码。

位于 `origin/develop` 的 `HEAD` 的代码应包含所有最新提交的准备在以后的版本中发布的代码改动。有些人也把它称为“集成分支”。将它用于“每夜构建”（译注：nightly build。有的项目每次构建需要耗费大量的计算机资源，如果让项目在每天深夜的时候自动构建则能够有效节省这些资源）是个不错的选择。

当 `develop` 分支的代码逐渐趋于稳定，准备好发布的时候，所有的改动都应被合并到 `master` 分支上，并标注（tag）上发布的版本号。我们迟点再讲解这个具体应该怎么做。

因此，每次改动被合并到 `master` 分支上都**必须**意味着一次新版本的发布。在这一点上我们必须十分严格。如果能做到的话，理论上来讲我们可以写一个脚本，在每次 `master` 分支出现新的提交时自动地将 `master` 分支上的代码构建并发布到生产服务器上。

## 其他分支

除了 `master` 和 `develop` 这两个主分支，我的开发模式中还会使用很多其他不同的分支，分别用来帮助不同开发小组之间的平行开发、简化新功能开发的跟进、准备新的版本发布和进行生产系统的快速修复。和主分支不同，这些分支的生命周期是有限的，它们最终都会被删除。

包括如下几种分支：

- 功能分支（feature branch）
- 发布分支（release branch）
- 修复分支（hotfix branch）

这几个分支都有着自己各自的用处，同时也需要严格遵循一些规则，比如它们可以来自哪些分支，它们又能合并到哪些分支。接下来我便会对它们分别进行介绍。

### 功能分支

![](/img/git-model@4.png)

<dl>
  <dt>可分离自：</dt>
  <dd><code>develop</code></dd>
  <dt>可合并至：</dt>
  <dd><code>develop</code></dd>
  <dt>分支命名规范：</dt>
  <dd>除以下命名外均可：<code>master</code>、<code>develop</code>、<code>release-*</code>、<code>hotfix-*</code></dd>
</dl>

功能分支用于为产品未来的版本开发新的功能。在开发新的功能时，具体会在哪个版本中发布该功能多半是不可知的。功能分支的本质在于它仅仅用于开发新的功能，最终它将被合并到 `develop` 分支以在新版本中发布该功能，或是在新功能前景不佳时被直接删除。

功能分支在大多数情况下不应存放在 `origin` 上，而应存放在开发者本地的 Repo 中。

#### 创建功能分支

当需要开发一项新功能时，从 `develop` 分支创建一个新的分支：

```bash
$ git checkout -b myfeature develop
# Switched to a new branch "myfeature"
```

#### 将新功能发布到 develop 分支

开发完毕的功能分支应被合并到 `develop` 分支以将新功能发布到新的版本中：

```bash
$ git checkout develop
# Switched to branch 'develop'
$ git merge --no-ff myfeature
# Updating ea1b82a..05e9557
# (Summary of changes)
$ git branch -d myfeature
# Deleted branch myfeature (was 05e9557).
$ git push origin develop
```

`--no-ff` 标识位使得 Git 即使在能够使用 fast-forward 完成合并操作的情况下也会在 `develop` 分支上创建唯一一个 commit 记录。如此一来，我们便能把出现在功能分支上的多次提交合并为 `develop` 分支上的一次提交，同时也不至于完全抹杀功能分支曾经存在的事实。看下图：

![](/img/git-model@5.png)

在右边的例子中，`--no-ff` 标识位未被使用，Git 的 fast-forward 功能使得功能分支上的所有 commit 记录被直接复制到了 `develop` 分支上。如此一来，你只能慢慢地阅读每个提交记录的日志才能分辨出哪些提交是用来实现这个新功能的了。同时，由于添加的新功能的相关改动分布在了多个 commit 记录中，回退新添加的功能也变得十分困难。

没错，使用 `--no-ff` 合并分支确实会多产生一点提交记录，但换来的好处却是不容忽视的。

不幸的是，暂时来讲我还不知道怎样使得<kbd>git merge</kbd>的 fast-forward 功能默认关闭。它本该如此。

### 发布分支

<dl>
  <dt>可分离自：</dt>
  <dd><code>develop</code></dd>
  <dt>可合并至：</dt>
  <dd><code>develop</code> 和 <code>master</code></dd>
  <dt>分支命名规范：</dt>
  <dd><code>release-*</code></dd>
</dl>

发布分支用于进行产品新版本发布的准备工作。它们可以用来对新的版本修改一些小 bug，或者是准备包括版本号、构建日期之类的新版本元数据。这类的小改动不应存留在 `develop` 分支上，使用发布分支来完成这些琐事便能确保 `develop` 分支的整洁。

我们只应在 `develop` 分支几乎快要准备好可以发布新版本时才创建发布分支，在这个时候所有应在该版本中发布的新功能都应已被合并到 `develop` 分支上了。不过，计划在以后的版本中发布的新功能倒可以允许暂时未被合并到 `develop` 分支上，它们完全可以在发布分支被创建后再合并上去。

当且仅当在创建了发布分支以后，我们才应该将版本号赋予即将发布的版本，决不能过早。直到这个时候，`develop` 分支将包含所有应在“即将到来的新版本”中发布的改动，但仍然不清楚该版本最终会是 0.3 还是 1.0。版本号只能在发布分支的一开始才能够根据项目的版本号递增规则赋予给即将发布的版本。

#### 创建发布分支

发布分支应创建自 `develop` 分支。举个例子，当前已发布的最新的版本为 1.1.5，而且我们即将发布一个大的新版本。新版本的所有改动已经被合并到了 `develop` 分支上，我们也想好了将其作为 1.2 版本发布。那么，我们就从 `develop` 分支创建一个发布分支，并以新的版本号命名该分支：

```bash
$ git checkout -b release-1.2 develop
# Switched to a new branch "release-1.2"
$ ./bump-version.sh 1.2
# Files modified successfully, version bumped to 1.2.
$ git commit -a -m "Bumped version number to 1.2"
# [release-1.2 74d9424] Bumped version number to 1.2
# 1 files changed, 1 insertions(+), 1 deletions(-)
```

在创建了新的发布分支并切换到该分支以后，我们将版本号增加到了 1.2。这里我使用了一个 `bump-version.sh` 脚本，它会直接修改项目中的某些文件以写入新的版本号。当然你也可以手工完成这个操作，重点在于在这里**某些**文件会发生变化。然后，我们提交这次改动，新的版本号便被写入到了即将发布的版本中。

发布分支并不需要这个时候就被删除，它完全可以一直保留直到新的版本被顺利地发布到生产环境中。在它存活的这段时间里，我们还可以利用它来修复新版本的一些小 bug，而不是将这些修复改动直接提交到 `develop` 分支上。往这个分支上添加新功能是决不允许的。新的功能只能够合并到 `develop` 分支上以等待下一次的新版本发布。

#### 结束发布分支

当发布分支完全准备好发布新版本时，我们需要进行以下操作。首先，将发布分支合并到 `master` 分支上（`master` 分支上的每次提交都<b>必然</b>意味着一次新版本的发布）。然后，合并后在 `master` 上所产生的提交记录必须被正确地标注（tag）以便以后能够便捷地引用到该历史版本。最后，发布分支上的所有改动需要被重新合并到 `develop` 分支，以确保以后的新版本中都能包含出现在发布分支中的 bug 修复。在 Git 里，前两步应该这样做：

```bash
$ git checkout master
# Switched to branch 'master'
$ git merge --no-ff release-1.2
# Merge made by recursive.
# (Summary of changes)
$ git tag -a 1.2
```

如此一来，新版本便被顺利发布，同时也被正确地标注（tag）以便以后引用。

> **注**：你可能还会想使用 `-s` 或 `-u <key>` 来加密你的标注信息。

然后，我们还需要把发布分支上的改动合并到 `develop` 分支上：

```bash
$ git checkout develop
Switched to branch 'develop'
$ git merge --no-ff release-1.2
Merge made by recursive.
(Summary of changes)
```

现在，我们的发布工作就全部做完了，也可以顺利删除发布分支了：

```bash
$ git branch -d release-1.2
# Deleted branch release-1.2 (was ff452fe).
```

### 修复分支

![](/img/git-model@6.png)

<dl>
  <dt>可分离自：</dt>
  <dd><code>master</code></dd>
  <dt>可合并至：</dt>
  <dd><code>develop</code> and <code>master</code></dd>
  <dt>分支命名规范：</dt>
  <dd><code>hotfix-*</code></dd>
</dl>

修复分支和发布分支很相似，它们都是用来进行一次新版本发布的准备工作，但修复分支所对应的版本却是未曾预料到的。只有在某个版本的生产环境发生了很严重的错误需要马上进行修复时，修复分支便会直接通过该版本号对应的标注（tag）从 `master` 分支上创建出来。

这么做的关键在于我们在修复分支上修复 bug 时，其他开发人员仍然能够在 `develop` 分支上开发新的功能。

#### 创建修复分支

修复分支创建自 `master` 分支。还是举个例子，我们的生产环境的版本号为 1.2，而且发生了一个很严重的 bug 需要马上修复，但目前提交到 `develop` 分支上的改动尚未准备好新一次发布。这时我们就可以创建一个修复分支来修复这个 bug 了：

```bash
$ git checkout -b hotfix-1.2.1 master
# Switched to a new branch "hotfix-1.2.1"
$ ./bump-version.sh 1.2.1
# Files modified successfully, version bumped to 1.2.1.
$ git commit -a -m "Bumped version number to 1.2.1"
# [hotfix-1.2.1 41e61bb] Bumped version number to 1.2.1
# 1 files changed, 1 insertions(+), 1 deletions(-)
```

不要忘了在创建分支后改变版本号！
然后，修复 bug 并提交：

```bash
$ git commit -m "Fixed severe production problem"
# [hotfix-1.2.1 abbe5d6] Fixed severe production problem
# 5 files changed, 32 insertions(+), 17 deletions(-)
```

**结束修复分支**

修复完成后，我们需要将修复改动合并到 `master` 分支，但同时也要合并到 `develop` 分支以确保未来的版本中也包含了这些修复改动。这一步的操作和发布分支很相似。

首先，更新 `master` 分支并进行标注（tag）

```bash
$ git checkout master
# Switched to branch 'master'
$ git merge --no-ff hotfix-1.2.1
# Merge made by recursive.
# (Summary of changes)
$ git tag -a 1.2.1
```

**注**：你可能还会想使用 `-s` 或 `-u <key>` 来加密你的标注信息。然后，还要把改动合并到 `develop` 分支上：

```bash
$ git checkout develop
# Switched to branch 'develop'
$ git merge --no-ff hotfix-1.2.1
# Merge made by recursive.
# (Summary of changes)
```

这条规则有一个例外：<strong>如果这个时候存在一个发布分支，修复分支的改动应被合并到该发布分支而不是 `develop` 分支</strong>。如此一来，发布分支完成并被合并到 `develop` 分支上时，这些修复改动也会被合并到 `develop` 分支上。如果 `develop` 分支需要马上添加这些修复改动而又等不及发布分支完成时，你也可以直接把修复分支合并到 `develop` 分支。

最终，我们删除该分支：

```bash
$ git branch -d hotfix-1.2.1
# Deleted branch hotfix-1.2.1 (was abbe5d6).
```

## 总结

尽管这个分支模式中并没有出现什么特别创新的东西，但文章开头出现的那幅总览图对我们的项目开发确实带来了莫大的好处，
我们的开发人员也因此能够快速地在分支和发布操作上达成共识。

如果你需要的话，[这里](http://nvie.com/files/Git-branching-model.pdf)有那张图的高清无码 PDF 版。把它打印下来并挂到你公司的墙上吧！
<strong>Update:</strong> And for anyone who requested it: here ’ s the
[gitflow-model.src.key](http://github.com/downloads/nvie/gitflow/Git-branching-model-src.key.zip) of the main diagram image (Apple Keynote).
