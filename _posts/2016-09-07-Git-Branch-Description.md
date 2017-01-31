---
title: Git 分支描述
categories: sticker
---

Git 分支的名称恐怕不足以详细地描述该分支的作用，此时我们就可以考虑为分支添加描述。

使用如下命令可为当前分支修改描述：

<pre class="brush: bash">
git branch --edit-description
</pre>

而后使用如下命令查看指定分支的描述：

<pre class="brush: bash">
git config branch.&lt;branch_name>.description
</pre>
