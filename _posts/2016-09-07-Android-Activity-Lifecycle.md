---
layout: posts
title: Android Activity 生命周期
category: Android
author: Robert Peng
---

<script type="text/javascript" src="/js/syntaxhighlighters/shBrushJava.js"></script>

本文为我学习 Android Activity 生命周期时的知识总结，内容源自 Android 的[官方教程](https://developer.android.com/training/basics/activity-lifecycle/index.html)。

## 综述

下图为 Android Activity 的生命周期状态转移图：

![](https://developer.android.com/images/training/basics/basic-lifecycle.png)

其中每个 `onXXX()` 方法在 `Activity` 类中的签名都是这样的：

<pre class="brush: java">
protected void onXXX() {
	...
}
</pre>

在具体 `Activity` 中重载时记得加上 `@Override` 注解。除此之外，必须在方法体的一开始就调用对应的 `super.onXXX()`。

通常来讲，Android Activity 大多数时候只会处于以下三种状态：

- `Resumed`：此时 Activity 正处于屏幕的最前端，用户可以与其进行交互
- `Paused`：此时 Activity 已部分被其他 Activity 遮挡，但仍有部分内容显示在屏幕上，例如被一个背景半透明的对话型 Activity 遮挡。此时用户不再能和该 Activity 进行交互
- `Stopped`：此时 Activity 已完全被其他 Activity 遮挡

主要来讲，这些 `onXXX()` 回调函数在大多数情况下是不需要重载的，需要对其重载时通常只是为了如下几点：

- 确保用户在使用你的 App 时突然接到电话或者切换到另一个 App 时你的 App 不会崩溃
- 确保用户在没有直接使用该 Activity 时它不会占用某些重要的系统资源
- 确保用户突然离开了你的 App 并在之后又回来以后，你的 App 不会丢失用户进度
- 确保屏幕从竖屏切换到横屏时你的 App 不会崩溃或者丢失用户进度

## `onPause()` 与 `onResume()`

[原文地址](https://developer.android.com/training/basics/activity-lifecycle/pausing.html)

当 Activity 失去用户焦点时就会进入 `Paused` 状态。这有可能是因为其被另一个 Activity 部分遮挡，或者是因为其正运行在 Android 7.0 新引入的[分屏模式](https://developer.android.com/guide/topics/ui/multi-window.html)中，而该模式下只会有一个 App 获得用户焦点，其他所有同屏的 App 都会进入 `Paused` 状态。

在 Activity 进入 `Paused` 状态前，系统会调用其 `onPause()` 方法；当用户返回到该 Activity 时，系统就会调用其 `onResume()` 方法，Activity 也会恢复到 `Resumed` 状态。

主要来讲，`onPause()` 应该用来做如下一些事情：

- 首先检查该 Activity 是否仍可见，如果已经不可见的话则应停止如动画等占用 CPU 的操作。首先检查其可见性是因为 Android 7.0 的分屏模式下 App 可能进入 `Paused` 状态但仍然完全可见，此时其动画效果或者视频播放等就不应该停止
- 提交用户未保存的一些操作，前提是用户允许你在其离开后永久保存这些修改，如 Email 草稿
- 如果你的 Activity 使用了如广播接收器或者某些感应器之类的比较耗费电量的系统资源且确定用户已经暂时不需要时，你应该在 `onPause()` 中释放它们

总的来讲，如果用户没有允许或期望你这么做，你的 Activity 不应在 `onPause()` 保存用户的修改，同时也不应该在 `onPause()` 中做类似数据库写入等耗费 CPU 的操作，因为这会拖慢用户切换至另一个 Activity 的过程，你应该把这些重量级操作留到 `onStop()`。

每次用户使得你的 Activity 回到屏幕前端时，`onResume()` 方法都会被调用，因此你应该在该方法中重新初始化或申请那些在 `onPause()` 中被你释放的资源。

## `onStop()`、`onStart()` 和 `onDestroy()`

[原文地址](https://developer.android.com/training/basics/activity-lifecycle/stopping.html)

当 Activity 被完全遮挡时就会调用 `onStop()` 方法并进入 `Stopped` 状态。除了可能是由于用户从你的 App 切换到另一个 App 或者你的 App 打开了一个新的 Activity，也有可能是因为用户在使用的过程中突然接到了电话。总的来讲，和 `Paused` 不同，`Stopped` 状态确保 Activity 当前已经完全不可见了。

注意，在 `onStop()` 方法里，几乎所有资源都应该被释放，因为如果系统内存不足时会有可能会关闭处于 `Stopped`
状态的 Activity，甚至有可能直接杀死该 Activity 且不调用其 `onDestroy()` 方法。因此为了避免资源泄漏，在 `onStop()` 调用时你应确保你的 Activity 释放几乎所有资源。同时也正如前文所述，占用 CPU 较多的关闭操作应放到 `onStop()` 方法中执行。

`onRestart()` 方法只有 Activity 从 `Stopped` 状态恢复到 `Resumed` 状态时才会被调用，且调用后还会调用 `onStart()` 方法，因此对于 `onRestart()` 方法应该执行的事情实际上并没有很普遍使用的标准。但 `onStart()` 方法对应于 `onStop()`，其应用于恢复或重新申请那些被 `onStop()` 方法释放的资源。 

当系统正常关闭 Activity 时，Activity 的 `onDestroy()` 方法会在最后被调用，因此 `onDestroy()` 方法是你最后一次释放所有相关资源的机会。

## `onSaveInstanceState()` 与 `onRestoreInstanceState()`

[原文地址](https://developer.android.com/training/basics/activity-lifecycle/recreating.html)

有些时候，你的 Activity 有可能会被系统正常地关闭并被调用其 `onDestroy()` 方法，例如用户通过按下返回键关闭 Activity、其 `finish()` 方法被调用而被关闭。除此之外，系统在内存资源不足时也会关闭当前处于 `Stopped` 状态的 Activity；屏幕在竖屏和横屏模式间切换时处于前端的 Activity 也会被 destroy 并重新 create，这是由于此时屏幕的大小比例发生了变化，你的 Activity 可能需要载入其他资源，如另一个布局文件。

如果你的 Activity 是因后两种情况被 destroy，系统会通过一个名叫 Instance State 的 [`Bundle`](https://developer.android.com/reference/android/os/Bundle.html) 来保存当前的一些状态信息，包括布局上每一个 `View` 的信息，并在重新 create 时再次载入这些信息。

![](https://developer.android.com/images/training/basics/basic-lifecycle-savestate.png)

如果你想要保存除了 `View` 状态的其他一些信息，你需要通过重载 `onSaveInstanceState()` 方法以键值对的形式将这些信息写入到该 `Bundle` 中。

在重载的方法中记得调用 `super.onSaveInstanceState`。

在重新 create Activity 时，你可以在 `onCreate` 方法中恢复这些信息，不过需要判断传入的 `Bundle` 参数是否为 `null`，为 `null` 的话代表该 Activity 是刚刚被创建而不是之前刚被关闭并被重新创建。

你也可以在 `onRestoreInstanceState` 方法中进行恢复，此时就不需要判断传入的 `Bundle` 是否为 `null` 了，因为该方法只有在 Activity 确实是刚被 destroy 且正在重新 create 时才会被调用。记住在方法体中同样需要调用 `super.onRestorInstanceState`。

