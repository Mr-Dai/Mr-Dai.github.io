---
title: 解决 Windows10 笔记本关上后仍会掉电的问题
tags: Windows
date: 2017-05-06
---

一开始我只是想在谷歌上搜索一下，为啥我的 Win10 笔记本在盖上盖子以后放入背包中，每次拿出来之后电量都会有所下降，结果就一下子看到了很多很神奇的东西，包括 Win10 的几种节能状态，以及如何设置关闭盖子的行为。且听我一一道来。

<!-- more -->

## Win10 节能状态

总的来讲，自 Win7 到 Win8 到 Win10 以来，Windows 实际上一共有 3 种不同的节能状态，可参考该[链接](http://www.thewindowsclub.com/difference-between-sleep-hybrid-sleep-and-hibernation-in-windows-7)。链接中的文章很好地介绍了这 3 种状态，这里我就复制过来顺便简单翻译一下。

> **Sleep** is a power-saving state that allows a computer to quickly resume full-power operation (typically within several seconds) when you want to start working again.
>
> Putting your computer into the sleep state is like pausing a DVD player; the computer immediately stops what it ’ s doing and is ready to start again when you want to resume working.

**睡眠**（Sleep）可以让计算机在你想要开始工作时迅速（通常在几秒钟内）恢复至全速运行状态。让你的计算机进入睡眠模式就像在 DVD 播放机上按下暂停按钮一样 —— 计算机会立刻停止它的当前任务并且随时准备好在你回来工作时再次启动。

> **Hibernation** is a power-saving state designed primarily for laptops.
>
> While sleep puts your work and settings in memory and draws a small amount of power, hibernation puts your open documents and programs on your hard disk and then turns off your computer. Of all the power-saving states in Windows, hibernation uses the least amount of power. On a laptop, use hibernation when you know that you won ’ t use your laptop for an extended period and won ’ t have an opportunity to charge the battery during that time.

**休眠**（Hibernation）是一种主要为笔记本电脑设计的节能状态。睡眠实际上会把你当前的工作内容和设置放入到内存中，并且需要少量的电力来维持这些数据，而相比之下休眠则会把这些数据放入到磁盘中然后完全关闭你的计算机。在 Windows 中，休眠实际上是所需电力最少的节能状态。如果你使用的是笔记本电脑，那么如果你在一段较长的时间内都不会再使用你的电脑且这段时间也无法给它充电的话，你应该让它进入休眠状态。

> **Hybrid sleep** is designed primarily for desktop computers. Hybrid sleep is a combination of sleep and hibernate; it puts any open documents and programs in memory and on your hard disk and then puts your computer into a low-power state so that you can quickly resume your work. That way, if a power failure occurs, Windows can restore your work from your hard disk. When hybrid sleep is turned on, putting your computer into sleep automatically puts your computer into hybrid sleep. *Hybrid sleep is typically turned on by default on desktop computers and off by default on laptops*.

**混合睡眠**（Hybrid Sleep）是一种主要为桌面电脑（台式机）设计的节能状态。混合睡眠实际上是睡眠与休眠的结合：它会把当前的工作内容继续保持在内存中，同时也把这些数据复制到磁盘中，然后再让你的计算机进入低耗能状态，如此一来你的计算机便可以快速地恢复当前状态，同时及时发生电力故障，Windows 仍然可以从磁盘中恢复当前的数据。在混合睡眠设置开启时，你令计算机进入睡眠模式时会让计算机自动进入混合睡眠模式。混合睡眠在桌面电脑上是默认开启的，而在笔记本电脑上则是默认关闭的。

## 设置 Win10 关闭盖子行为

“关闭盖子” 这个词听着有点怪，而部分 Win10 用户实际上也应该在电源选项中见过这个名字：

![](/img/win10@1.png)

实际上这个翻译也是挺奇怪的，而该选项的英文实际上是 “ Choose what closing the lid does ”，也就是配置电脑在盖上时应该做什么。

进入该页面，可看到设置如下：

![](/img/win10@2.png)

这里可以选择在接通与未接通电源两种情况下，按下电源按钮和关闭盖子时计算机应该采取的行为。选项包括 “不采取任何操作”、“睡眠”、“休眠”、“关机”，在了解过 “睡眠” 和 “休眠” 的差异后，我想这四个选项的含义就不难理解了。我们只要将**关闭盖子时**的行为设置为**休眠**即可。

实际上，“关闭盖子时”的设置默认为“睡眠”，而该模式仍需要一定的电力维持内存中的数据，而且睡眠状态下的笔记本极易被唤醒（被鼠标、键盘、定时事件等唤醒），因此这也就是为何大多数 Win10 笔记本经常在盖子关上时自行启动了。可见这并不是一个 Bug，而只是单纯的设置不当。

不过值得注意的是，休眠后的计算机无法在短时间内恢复。进入睡眠模式的计算机在恢复时往往能在瞬间进入登录界面，而进入休眠模式的计算机由于需要从磁盘中读取数据，往往需要经历一段和开机相当的时间。当然，如果你的计算机使用的是 SSD，这个不足则微乎其微。

从上一节中对睡眠和休眠的描述来看，你可以在确定自己比较长时间内不会使用计算机时才选择让计算机进入休眠，如果离开的时间较短则可以选择让其进入睡眠。因此，可以在上述设置中选择在按下电源按钮时让计算机进入睡眠状态，这样如果你只是要短时间离开计算机（上厕所、倒杯水等），就可以考虑按下电源按钮进入睡眠，而不是直接盖上计算机。

除此之外，在使用休眠模式时要尤其小心：休眠模式在恢复时需要把磁盘上的数据重新读入到内存，考虑到 Win10 的高兼容性，实际上这个过程很容易发生错误导致部分软件无法恢复到原本的状态继续运行，因此恢复时很容易导致部分驱动程序崩溃，令计算机发生所谓的“蓝屏”现象。休眠模式的不稳定实际上自 Win7 以来便一直存在，Win10 也无法幸免，有较小几率仍会“蓝屏”，但相比 Win7 已有很大的改善。我想，这算是我们选择了 Win10 相比于 Mac OS 高得多的兼容性后所必须承受的代价吧。
