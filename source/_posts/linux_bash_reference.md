---
title: Linux Bash 参考指南
category: Linux
tags:
 - Linux
 - Bash
date: 2017-12-17
---

我写这篇文章主要是用来作为我的 Linux Bash 工具书的，希望这篇文章对你也能起到同样的效果。随着我学习到更多有关 Linux Bash 的知识，我会不断地更新这篇文章。

<!-- more -->

本文的内容假设你对 Linux 和 Linux 命令行有基本的了解。如果你没有的话，你可以去看看[这篇教程](http://linuxcommand.org/lc3_learning_the_shell.php)。

本文的内容分为三个主要部分：

1. Linux Shell 脚本编程
2. Linux Bash 内置命令
3. 常见的轻量级 Linux 命令工具

让我们开始吧

## 第一部分：脚本编程

在这一部分中，我会介绍 Linux Shell 脚本编程的基本语法，并在其中穿插一些对日常工作有所帮助的代码示例。这些代码示例能在大部分 POSIX Shell 解释器上运行，但如果这些代码对于某些如 Bash 的特殊 Shell 解释器有更好的写法的话，文中也会一并给出。

### 1.1 基本使用

在 Shell 解释器执行脚本文件时，它实际上会考虑脚本文件中给出的控制流语句，并一行一行地从脚本文件中读入命令并执行。如此，如果你知道怎么使用 Shell 命令行的话，一个 Shell 脚本文件的基本组成对你来说实际上是很直观的。

如下是一段简单的 Hello World 示例：

```sh
#!/bin/sh
# My first script

echo 'Hello, world!'
```

[](#she-bang)上述脚本文件的第一行被称为 <b><abbr title="# 号和 ! 号的英文发音组合">She-Bang</abbr> 注释</b>，以 `#!` 开头。这行注释能告诉 Shell 该用哪个解释器程序来解释这个脚本文件。在上面的示例中，我们使用了 `/bin/sh` 来解释这个文件。如果你想要用除了 Shell 以外的解释器来执行文件的话，你也可以在这行注释中指定别的解释器程序，例如 `#!/bin/env python` 可以用来执行 Python 文件。

[](#comment)第二行则是一般的**行注释**，以 `#` 开头。行注释是 Shell 支持的唯一一种注释形式，也就是说 Shell 不支持块注释。Shell 解释器在运行时会忽略注释，注释里的内容通常都是写给其他人类读者的。

除了注释，一个 Shell 脚本文件由若干个命令组成，正是这些命令告诉解释器接下来该做什么。在 Shell 脚本文件中使用的命令和你平常在命令行中使用的命令完全一致。如果你不知道你可以使用哪些命令以及如何使用这些命令，你可以去看看本文的后面几个部分的内容，或者直接使用 `man` 命令来查看相关文档。

### 1.2 标准输入和标准输出

标准输入和标准输出是你的脚本与用户进行交互的主要方式。

正如你在上面的示例中看到的那样，`echo` 命令可以用来产生标准输出，而从标准输入中读取内容则可以通过 `read` 命令完成：

```sh
echo -n "Enter some text > "
read text
echo "You entered: $text"
```

`read` 命令接受一个变量名作为参数。在运行时，它会扫描标准输入中的内容并将其保存到指定名称的变量中。你可以在后续的代码中使用 `$` 记号读取该变量的值。

有关 `echo` 和 `read` 命令更多高级的用法，详见 `help echo` 和 `help read`。

### 1.3 命令行参数

除了标准输入和标准输出以外，用户还可以在运行你的脚本文件时指定命令行参数，而命令行参数通常会被用于进行简单的配置。

在你的脚本代码中，你可以：

- 使用变量 `$#` 获取用户给定命令行参数的数量
- 使用从 `$1` 到 `$9` 逐个获取用户给定的命令行参数，或者
- 使用 `$@` 变量将用户输入的所有命令行参数读取为一个数组

值得一提的是，你还可以使用一个特殊的 `$0` 参数，它包含了正在运行的脚本文件在系统中的**绝对路径**，而且它的值不会被包含在 `$@` 变量中。

### 1.4 函数

就像其他编程语言一样，你还可以在 Shell 脚本中定义函数以减少代码冗余。

Shell 函数有两种定义方式：

```sh
function print {
    echo "Received $@"
}

another_print() {
    echo "Received $@"
}

print Hello
another_print hello
```

两种方式的效果完全一致。

调用函数的方式和你调用其他的命令的方式完全一致。在函数中你同样可以使用 `$1` 到 `$9` 、 `$@` 、 `$#` 等变量获取函数调用时给定的参数。

### 1.5 退出状态码

有时，你的脚本文件可能会因为一些原因而不能成功执行，这时你可能会想要告诉你的用户具体发生了什么错误。除了通过 `echo` 命令将错误信息打印到错误输出以外，你还可以使用 `exit` 指令来以非零的退出状态码结束你的脚本：

```sh
PROGNAME=$(basename $0)

error_exit() {
    echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
    exit 1
}

echo "Example of error with line number and message"
error_exit "$LINENO: An error has occurred."
```

函数则可以通过使用 `return` 命令来返回指定的值并结束自身的运行，而不至于结束整个脚本。

你在任何使用都可以通过访问变量 `$?` 来获取上一个指定的命令的退出状态码或上一个指定的函数的返回值。

请通过查阅 `help exit` 和 `help return` 来了解更多有关内容。

### 1.6 控制流语句

除了那些你能在命令行中使用的命令以外，你还可以在脚本中使用控制流语句来实现更加复杂的功能。Shell 所支持的控制流语句和你在其他编程语言中用的很相似，包括 `if` 、 `case` 、 `for` 、 `while` 和 `until`。

#### 1.6.1 If

`if` 语句可以让你的脚本文件只在满足某个指定条件时才执行某段代码：

```sh
if [ "$#" -e 0 ]; then
    echo "Received nothing"
elif [ "$#" -e 1 ]; then
    echo "Received one argument: $1"
else
    echo "Received arguments: $@"
fi
```

你可以使用任意命令作为 `if` 的条件，如果命令的退出码为零那么 `if` 就会认为条件满足。请查阅 `help if` 了解更多有关内容。

通常，我们会使用类似 `[ "$#" -e 1 ]` 这样的简写方式来使用 `test` 命令，声明数值比较或是其他在 Linux 中常见的条件，例如指定路径指向的是一个文件或是一个目录。该简写等价于 `test "$#" -e 1`。请查阅 `help test` 来了解除 `-e` 以外的条件运算。

> 在某些 Shell 上（包括 Bash、Zsh 和 Ksh），你还可以以双中括号的形式声明条件，如 `[[ a != b ]]`。这种写法并非由 POSIX 标准给出，且只被一部分 Shell 支持。这样的写法比起原生的 `test` 命令更加安全，原因在于它不会在执行前对给定的参数进行展开，但这样的写法无疑会导致你的脚本的可移植性下降。请查阅 `help [[` 和[这篇文章](http://mywiki.wooledge.org/BashFAQ/031)了解更多有关内容。

你还可以使用 `&&` 和 `||` 来对多个 `test` 命令的结果进行组合。这些运算符同样支持在其他编程语言中常见的短路功能，而这样的功能可以被用来将某些简单的条件检查语句变得更加简短。例如，`[ 2 -gt 1 ] && echo 'ok'` 等价于如下代码片段：

```sh
if [ 2 -gt 1 ]; then
    echo 'ok'
fi
```

除了中括号以外，大括号也可以被用来声明条件语句。请查阅[这篇文章](https://unix.stackexchange.com/questions/306111/confused-about-operators-vs-vs-vs)了解更多有关内容。

#### 1.6.2 Case

`case` 语句的功能和其他编程语言中的 `switch` 语句大致相同。它会用给定的字符串与若干个 **Glob 模式**进行匹配，并在满足匹配时执行对应的命令。一个简单的 `case` 语句示例如下：

```sh
case $character in
    [[:lower:]] | [[:upper:]] ) echo "You typed the letter $character";;
    [0-9] )                     echo "You typed the digit $character";;
    * )                         echo "You did not type a letter or a digit"
esac
```

值得注意的是，我们需要使用一个右括号（`)`）来分隔 Glob 模式和对应的命令，并在除了最后一个分支以外的其他每以个 `case` 分支的最后一个命令的末尾加上两个分号（`;;`）。

#### 1.6.3 While

`while` 语句可以被用来循环执行指定的命令，直到给定的条件不满足：

```sh
number=0
while [ "$number" -lt 10 ]; do
    echo "Number = $number"
    number=$((number + 1))
done
```

#### 1.6.4 Until

`until` 语句的作用和 `while` 语句十分相似，但它会在给定的条件满足时结束循环：

```sh
number=0
until [ "$number" -ge 10 ]; do
    echo "Number = $number"
    number=$((number + 1))
done
```

#### 1.6.5 For

`for` 语句可以用来遍历给定的数组：

```sh
for argument in "$@"; do
    echo "Received $argument"
done
```

## 第二部分：Bash Shell 内置命令

本部分将主要描述 Bash Shell 各个内置命令（Built-in Command）的作用及用法。要初步了解这些命令，我们可以首先使用 `help` 命令来查看 Bash Shell 支持的所有内置命令和简单的文档。

### dirs、pushd、popd

Bash 提供了一套以栈/链表管理你曾经进入的路径的方式，方便你在不同的路径间跳转，相关的管理命令包括 `dirs`、`pushd`、`popd`。

首先，Bash 使用了链表来实现这个先入先出的栈行为，而 `dirs` 命令能把该链表的内容完整地打印出来：

```
$ help dirs
dirs: dirs [-clpv] [+N] [-N]
    Display directory stack.

    Display the list of currently remembered directories.  Directories
    find their way onto the list with the `pushd' command; you can get
    back up through the list with the `popd' command.

    Options:
      -c        clear the directory stack by deleting all of the elements
      -l        do not print tilde-prefixed versions of directories relative
        to your home directory
      -p        print the directory stack with one entry per line
      -v        print the directory stack with one entry per line prefixed
        with its position in the stack

    Arguments:
      +N        Displays the Nth entry counting from the left of the list shown by
        dirs when invoked without options, starting with zero.

      -N        Displays the Nth entry counting from the right of the list shown by
        dirs when invoked without options, starting with zero.

    Exit Status:
    Returns success unless an invalid option is supplied or an error occurs.
```

简单来讲，用户在使用 `dirs` 查看链表内容的同时，可以通过 `-p`、`-v` 选项调整 `dirs` 的输出样式，通过 `+N`、`-N` 参数指定 `dirs` 只输出链表某部分的内容，甚至使用 `-c` 选项清空链表。

值得注意的是，`dirs -c` 以及后面会提到的 `popd` 命令并不能真正地清空链表内容：当链表内容变为空后，Bash 会自动将当前目录放入到链表中，成为链表中仅有的元素。

`dirs` 的帮助信息中也提到，用户可使用 `pushd` 和 `popd` 管理链表中的元素。首先先来看 `pushd`：

```
$ help pushd
pushd: pushd [-n] [+N | -N | dir]
    Add directories to stack.

    Adds a directory to the top of the directory stack, or rotates
    the stack, making the new top of the stack the current working
    directory.  With no arguments, exchanges the top two directories.

    Options:
      -n        Suppresses the normal change of directory when adding
        directories to the stack, so only the stack is manipulated.

    Arguments:
      +N        Rotates the stack so that the Nth directory (counting
        from the left of the list shown by `dirs', starting with
        zero) is at the top.

      -N        Rotates the stack so that the Nth directory (counting
        from the right of the list shown by `dirs', starting with
        zero) is at the top.

      dir       Adds DIR to the directory stack at the top, making it the
        new current working directory.

    The `dirs' builtin displays the directory stack.

    Exit Status:
    Returns success unless an invalid argument is supplied or the directory
    change fails.
```

简单来讲，`pushd` 会对链表进行一定的操作，然后将当前目录改为目前位于链表左端（栈顶部）的目录。根据用户给定参数的不同，`pushd` 有三种运行模式：

1. 用户未给定参数，那么 `pushd` 交换链表最左侧的两个元素
2. 用户给定了一个路径，那么 `pushd` 将该路径放入到链表最左侧
3. 用户给定 `+N` 或 `-N`，实际上意味着用户指定了链表中的某一个元素（`N` 为从 `0` 开始的索引值；`+N` 意味着从左端数起，`-N` 则从右端数起），然后 `pushd` 会对链表进行旋转（最右端的元素离开链表，再将其放入到链表的左端），直到用户指定的元素到达链表最左侧 

用户可以通过 `-n` 选项让 `pushd` 在对链表进行操作后不改变当前目录。

最后再来看看 `popd`

```
$ help popd
popd: popd [-n] [+N | -N]
    Remove directories from stack.

    Removes entries from the directory stack.  With no arguments, removes
    the top directory from the stack, and changes to the new top directory.

    Options:
      -n        Suppresses the normal change of directory when removing
        directories from the stack, so only the stack is manipulated.

    Arguments:
      +N        Removes the Nth entry counting from the left of the list
        shown by `dirs', starting with zero.  For example: `popd +0'
        removes the first directory, `popd +1' the second.

      -N        Removes the Nth entry counting from the right of the list
        shown by `dirs', starting with zero.  For example: `popd -0'
        removes the last directory, `popd -1' the next to last.

    The `dirs' builtin displays the directory stack.

    Exit Status:
    Returns success unless an invalid argument is supplied or the directory
    change fails.
```

类似，`popd` 会根据用户指定的参数对链表中的元素进行删除，然后把当前目录改为链表最左侧的元素。根据用户指定参数的不同，`popd` 也有三种运行模式：

1. 若用户没有指定参数，那么 `popd` 移除链表最左侧的元素
2. 若用户指定参数 `+N`，那么 `popd` 移除链表最左侧的第 `N+1` 个元素
3. 若用户指定参数 `-N`，那么 `popd` 移除链表最右侧的第 `N+1` 个元素

同样，`popd` 也支持 `-n` 参数，使得其在对链表完成操作后不改变当前目录。

### exec

我们先来看 `help exec` 给出的信息：

```
exec: exec [-cl] [-a name] [command [arguments ...]] [redirection ...]
    Replace the shell with the given command.

    Execute COMMAND, replacing this shell with the specified program.
    ARGUMENTS become the arguments to COMMAND.  If COMMAND is not specified,
    any redirections take effect in the current shell.

    Options:
      -a name   pass NAME as the zeroth argument to COMMAND
      -c                execute COMMAND with an empty environment
      -l                place a dash in the zeroth argument to COMMAND

    If the command cannot be executed, a non-interactive shell exits, unless
    the shell option `execfail' is set.

    Exit Status:
    Returns success unless COMMAND is not found or a redirection error occurs.
```

文档中实际上给出了颇为完整的信息：`exec` 命令可以直接将当前进程运行的 Shell 程序替换为由给定命令指定的程序，新的程序则可以访问当前 Shell 已经设定好的环境变量。该命令仅提供了 `-a` 、 `-c` 、 `-l` 三个选项，其中 `-a` 和 `-l` 选项均用于对指定程序的 `$0` 参数进行改动，而 `-c` 选项则可以屏蔽所有环境变量，让指定程序在一个干净的环境中运行。

除此以外，`exec` 命令还允许你在不指定具体命令的情况下指定重定向，这种情况下重定向操作将直接作用于当前 Shell。很多时候，你可以在你的脚本文件中使用 `exec 1> out 2>&1` 命令，这样该脚本文件后续的输出就会被导向到指定的文件中。

> **警告**：尝试在当前 Shell 中使用 `exec` 对标准输出进行重定向时一定要小心，这有可能导致很多程序无法正常运行。建议在执行前先使用如 `exec 3>&1` 命令将标准输出保存到其他文件描述符中，以便后续恢复。

### set

我们先来看看 `help set` 给出的信息：

```
set: set [-abefhkmnptuvxBCHP] [-o option-name] [--] [arg ...]         
    Set or unset values of shell options and positional parameters.   
                                                                      
    Change the value of shell attributes and positional parameters, or
    display the names and values of shell variables.

    Options:
      ...

    Using + rather than - causes these flags to be turned off.  The
    flags can also be used upon invocation of the shell.  The current
    set of flags may be found in $-.  The remaining n ARGs are positional
    parameters and are assigned, in order, to $1, $2, .. $n.  If no
    ARGs are given, all shell variables are printed.

    Exit Status:
    Returns success unless an invalid option is given.
```

此处仅截取了完整 `help` 信息首位两段的内容。可见，`set` 命令可以修改当前 Shell 程序的启动选项和位置参数。我们可以通过 `$-` 变量访问当前 Shell 的启动选项，同样也可以通过 `$1` 等变量访问当前位置参数。

`set` 命令允许我们配置的这些选项多数都能用于开关 Shell 的某些功能，比如我们常用的 `-x` 能够在命令执行时将命令打印到标准输出，`-v` 则会回显输入的文本。在选项打开后我们还可以使用对应的 `+` 写法取消这些选项，例如用 `set +x` 取消 `set -x` 的效果。这些开关选项同样可以作为 Shell 的启动选项进行配置，例如我们可以将脚本文件的 She-Bang 注释写为 `#!/bin/sh -x` 来达到同样的效果。

我们回忆一下 `set` 命令的标准格式：

```
set [-abefhkmnptuvxBCHP] [-o option-name] [--] [arg ...]
```

可见 `set` 支持很多的选项，其中包括一个特殊的 `-o` 选项、 `--` 以及剩下的参数。接下来我会先简单说说除 `-o` 外每一个选项的作用：

| 选项名 | 作用 |
| --- | --- |
| `a` | 创建和修改变量时会同样将其 `export` 为环境变量 |
| `b` | 在任务终止时立刻打印通知 |
| `e` | Shell 在其中一个命令返回非零退出状态码时立刻退出。用于脚本文件时能让你的脚本在其中一个命令发生错误时立刻结束执行 |
| `f` | 关闭 Glob 模式展开 |
| `h` | 在查找到命令后记住它们所在的位置 |
| `k` | 所有以复制形式指定的参数都将作为命令的环境变量，而不仅仅是位于命令前面的那些 |
| `m` | 开启作业管理功能 |
| `n` | 读取命令但不执行。适用于对脚本文件进行语法检查。对交互式 Shell 不起作用 |
| `p` | 该选项会在当前用户 ID 与实际用户 ID 不同时被开启，开启后会不再处理 $ENV 文件，也不会导入 Shell 函数。关闭该选项会使得当前用户 ID 和组 ID 被设置为实际用户 ID 和组 ID |
| `t` | 在读取并执行一个命令后退出 Shell |
| `u` | 将尝试读取未设定的变量的行为视为错误。在当前 Shell 设定该选项可能导致 Tab 键命令自动补全功能发生错误 |
| `v` | 在读取到一行 Shell 输入时将其重新打印到标准输出。作用于 Shell 脚本时，解释器会把读入的每一行命令打印到标准输出 |
| `x` | 在运行命令前将命令和其参数打印到标准输出。Shell 在执行命令前可能会考虑 `alias` 并对你输入的文本进行展开，启动该选项后所打印的命令将是 Shell 在完成上述预处理后实际执行的命令 |
| `B` | 启动 Shell 的大括号展开功能 |
| `C` | 禁止使用输出重定向覆写已存在的文件 |
| `E` | Shell 函数将继承 ERR 陷入 |
| `H` | 开启 `!` 式的历史命令展开功能。该选项在互动式 Shell 下默认开启 |
| `P` | 启动后不会在执行命令时解析符号链接 |
| `T` | Shell 函数会继承 DEBUG 陷入 |

除了这些选项以外，我们还可以通过 `-o` 选项来指定选项。实际上，上述选项一一对应着 `-o` 所支持的选项，`-o` 所支持的多数选项可被视为上述选项的全称。我们通过 `-o <name>` 来开启对应名称的选项，并通过 `+o <name>` 关闭。支持的选项名称包括如下：

| 选项名称 | 作用 |
| --- | --- |
| `allexport` | 等同于 `-a` |
| `braceexpand` | 等同于 `-B` |
| `emacs` | 使用 Emacs 风格的行编辑命令行接口 |
| `errexit` | 等同于 `-e` |
| `errtrace` | 等同于 `-E` |
| `functrace` | 等同于 `-T` |
| `hashall` | 等同于 `-h` |
| `histexpand` | 等同于 `-H` |
| `history` | 启动历史命令功能 |
| `ignoreeof` | 当前 Shell 在读取到 EOF 后不会退出 |
| `interactive-comments` | 允许在互动式命令中输入注释 |
| `keyword` | 等同于 `-k` |
| `monitor` | 等同于 `-m` |
| `noclobber` | 等同于 `-C` |
| `noexec` | 等同于 `-n` |
| `noglob` | 等同于 `-f` |
| `nolog` | 无作用 |
| `notify` | 等同于 `-b` |
| `nounset` | 等同于 `-u` |
| `onecmd` | 等同于 `-t` |
| `physical` | 等同于 `-P` |
| `pipefail` | 管道中最后一个返回非零退出状态码的命令的退出状态码将作为该管道命令的返回值，若所有命令的退出状态码都为零则返回零 |
| `posix` | 改变 Bash 与 POSIX 标准不同的行为以严格遵循 POSIX 标准 |
| `privileged` | 等同于 `-p` |
| `verbose` | 等同于 `-v` |
| `vi` | 使用 Vi 风格的行编辑命令行接口 |
| `xtrace` | 等同于 `-x` |

除了上述选项，`set` 命令还允许在选项后接上 `--` 或 `-` 以及其余参数作为 Shell 的当前位置参数，其中：

- 使用 `--` 时，若后续未给出参数，则当前位置参数会被清空
- 使用 `-` 时，`-x` 和 `-v` 选项会被关闭

## 第三部分：小型命令行工具

### free

`free` 命令可用于查看系统当前的内存使用情况。典型的 `free` 输出如下：

```bash
$ free
              total        used        free      shared  buff/cache   available
Mem:        8312948     5037412     3039060       17720      236476     3134680
Swap:      25165824       58460    25107364
```

通过 `man free` 可以查看 `free` 的详细介绍。首先：

```
NAME
       free - Display amount of free and used memory in the system

SYNOPSIS
       free [options]

DESCRIPTION
       free  displays  the  total amount of free and used physical and swap memory in the system, as well as the buffers and caches
       used by the kernel. The information is gathered by parsing /proc/meminfo. ...
```

这里提到，`free` 输出的结果主要是通过解析 `/proc/meminfo` 文件的内容得出的。而后介绍了 `free` 输出各行的含义：

```
DESCRIPTION
       ... The displayed columns are:

       total  Total installed memory (MemTotal and SwapTotal in /proc/meminfo)

       used   Used memory (calculated as total - free - buffers - cache)

       free   Unused memory (MemFree and SwapFree in /proc/meminfo)

       shared Memory used (mostly) by tmpfs (Shmem in /proc/meminfo, available on kernels 2.6.32, displayed as zero if  not  available)

       buffers
              Memory used by kernel buffers (Buffers in /proc/meminfo)

       cache  Memory used by the page cache and slabs (Cached and Slab in /proc/meminfo)

       buff/cache
              Sum of buffers and cache

       available
              Estimation  of how much memory is available for starting new applications, without swapping. Unlike the data provided
              by the cache or free fields, this field takes into account page cache and also that not all reclaimable memory  slabs
              will  be  reclaimed  due to items being in use (MemAvailable in /proc/meminfo, available on kernels 3.14, emulated on
              kernels 2.6.27+, otherwise the same as free)
```

后续便是各个参数的介绍。首先是可以调整显示数字单位的参数：

```
OPTIONS
       -b, --bytes
              Display the amount of memory in bytes.

       -k, --kilo
              Display the amount of memory in kilobytes.  This is the default.

       -m, --mega
              Display the amount of memory in megabytes.

       -g, --giga
              Display the amount of memory in gigabytes.

       --tera Display the amount of memory in terabytes.

       -h, --human
              Show all output fields automatically scaled to shortest three digit unit and display the  units  of  print
              out.  Following units are used.

                B = bytes
                K = kilos
                M = megas
                G = gigas
                T = teras

              If unit is missing, and you have petabyte of RAM or swap, the number is in terabytes and columns might not
              be aligned with header.
```

使用的效果大致如下：

```bash
$ free -h
              total        used        free      shared  buff/cache   available
Mem:           7.9G        4.7G        3.0G         17M        230M        3.1G
Swap:           24G         59M         23G
```

除外，还有 `--si` 参数可以让 `free` 输出的单位按照 1000 进制进行计算而不是 1024 进制：

```
       --si   Use power of 1000 not 1024.
```

```bash
$ free -h --si
              total        used        free      shared  buff/cache   available
Mem:           8.3G        4.9G        3.2G         17M        236M        3.3G
Swap:           25G         61M         25G
```

接下来是可拆分显示 `buff`、`cache` 数值的 `-w` 参数：

```
       -w, --wide
              Switch to the wide mode. The wide mode produces lines longer than 80 characters. In this mode buffers  and
              cache are reported in two separate columns.
```

```bash
$ free -wh
              total        used        free      shared     buffers       cache   available
Mem:           7.9G        4.8G        2.9G         17M         33M        197M        3.0G
Swap:           24G         59M         23G
```

还有可以显示额外行信息的 `-l`、`-t` 参数：

```
       -l, --lohi
              Show detailed low and high memory statistics.
       -t, --total
              Display a line showing the column totals.
```

```bash
$ free -hlt
              total        used        free      shared  buff/cache   available
Mem:           7.9G        4.8G        2.9G         17M        230M        3.0G
Low:           7.9G        5.0G        2.9G
High:            0B          0B          0B
Swap:           24G         59M         23G
Total:          31G        4.9G         26G
```

最后，`free` 指令还允许用户指定按周期进行持续汇报。用户可通过 `-s` 和 `-c` 参数调整 `free` 汇报的周期时长和汇报次数：

```
       -s, --seconds seconds
              Continuously  display  the result delay seconds apart.  You may actually specify any floating point number
              for delay, usleep(3) is used for microsecond resolution delay times.
       -c, --count count
              Display the result count times.  Requires the -s option.
```


### rename

相较于 `mv`、`rename` 可用于对文件进行批量重命名。我们通过 `man rename` 可以查看 `rename` 的简单描述：

```
NAME
       rename - renames multiple files

SYNOPSIS
       rename [ -v ] [ -n ] [ -f ] perlexpr [ files ]

OPTIONS
       -v, --verbose
               Verbose: print names of files successfully renamed.

       -n, --no-act
               No Action: show what files would have been renamed.

       -f, --force
               Force: overwrite existing files.
```

由此可见，`rename` 命令接收两类位置参数：第一个位置参数为 Perl 正则表达式，用于表达文件名变换规则；第二个参数为若干个文件名，在 Bash Shell 下我们可以利用 Blob 表达式的展开来方便地指定我们需要重命名的文件。

支持的选项主要包括如下三个：

- `-v`、`--verbose`：打印成功重命名的文件名称
- `-n`、`--no-act`：不执行重命名操作，只打印会被重命名的文件
- `-f`、`--force`：重命名时覆盖已存在的文件

总体而言是很好理解的三个选项。这个命令唯一的疑点就在于 Perl 表达式的语法了。

在[这个页面](https://www.computerhope.com/unix/rename.htm)中有对 `rename` 可用的 Perl 正则表达式语法有简单的介绍。

简单而言，Perl 正则表达式主要用于进行字符串替换，具体的组成如下：

```
<s|y>/<match_expr>/<sub_expr>/[g][i]
```

其中第一个匹配表达式用于匹配给定字符串中的某个部分，而第二个转换表达式则表示如何转换匹配到的子字符串。两个表达式都支持各种常见的正则表达式元素，同时加入了一些简单的语法来更好地完成替换动作。

Perl 正则表达式包含替换（Substitution）和转译（Translation）两种执行模式，分别对应首字母 `s` 和 `y`。除此以外，通过结尾的修饰符 `g` 和 `i` 也可以选择全局匹配（正则表达式默认只匹配第一个匹配的子字符串）和大小写不敏感匹配。
