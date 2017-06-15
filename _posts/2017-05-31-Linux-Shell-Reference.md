---
layout: post_original
title: Linux Shell Reference
category: Linux
author: Robert Peng
---

This post should act as a quick one-page Linux Shell reference for me, and hopefully for you.
This post will be continuously updated as my knowledge about Linux Shell grows.

This reference assumes you have some basic knowledge about Linux and Linux command line.
If you don't, go check out [this tutorial](http://linuxcommand.org/lc3_learning_the_shell.php).

This reference consists of 3 parts, being:

1. Linux Shell scripting
2. Some commonly-used heavy-weight Linux commands, e.g. `curl`, `sed`, `awk`, `grep`
3. Other comoonly-used light-weight Linux commands

Let's begin.

## Part I: Shell Scripting # part-i

This part contains basic syntax of Shell script and some helpful snippets which should be usable on most
POSIX shell interpreter, but preferred alternatives for some specific shell, e.g. Bash, will also be mentioned.

### 1.1 Basic Usage # shell-basic

As shell interpreter interpret a script file, it actually read and execute the commands specified in the file
line by line, with consideration of other control flow statements. In this way, the basic component of a shell
script is really intuitive if you know how shell command line works.

This is a simple "Hello, world" example:

```sh
#!/bin/sh
# My first script

echo 'Hello, world!'
```

[](#she-bang)The 1st line of the file is a special *she-bang comment*, prefixed by a `#!`.
It tells the shell which interpreter program should be used to execute this script file.
In this example, it is `/bin/sh`. Other program can be used if you want to use interpreter other than
the shell to execute the file, for example `#!/bin/env python` can be used for an executable Python file. 

[](#comment)The 2nd line is a normal *line comment*, prefixed by a `#`. Line comment is the only form of
comment supported by shell, i.e. designated syntax for block comment does not exist. Comments
are ignored by shell interpreter and normally used for human reader.

Other than comments, a shell script consists of commands, which tells the interpreter what to do next.
These commands are the same as those you use in command line. If you don't know what commands you can use
or how to use, go check out the Part II and III of this reference or use the `man` command to find out.

### 1.2 Handling Standard Input and Output # stdin-stdout

Standard input and output is a commonly used if the script needs to interact with the user.

As you can see from the previous example, standard output can be handled by `echo` command, while
standard input can be read using `read` command:

```sh
echo -n "Enter some text > "
read text
echo "You entered: $text"
```

The `read` command accepts a variable name. After that, it scans the standard input and store the data in the
variable with that name. You can use `$` notation to read the value of variable at the following code.

For more sophisicated usage, check out the `help echo` and `help read` commands.

### 1.3 Handling Command Line Arguments # arguments

Besides standard input and output, command line arguments can also be specified when user execute your script,
which is commonly used for configuration.

In your script, you can:

- use variable `$#` to access the number of specified arguments
- use `$1` up to `$9` to access each argument individually, and
- use `$@` to access all of them as an array.

`$0` is another special argument you can use: it stores the *absolute path* of the executing program/script,
but it is not contained in `$@`.

### 1.4 Functions # functions

Like in other programming languages, you can define functions in shell script to help reduce code redundancy.

Shell functions can be defined in 2 ways:

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

Both ways are the same, use whatever you prefer.

Functions can be invoked in the same way as we invoke other commands. You can use the same `$1` up to `$9`,
`$@` and `$#` in functions to access the given arguments.

### 1.5 Exit Status # exit-status

In the case where your script failed to execute due to some misconfiguration, you may want to inform the user
about what error has occurred. In addition to `echo`ing error message to the standard error output, you
can also terminate the program with a non-zero exit status to inform such error programmatically using the
`exit` command:

```sh
PROGNAME=$(basename $0)

error_exit() {
    echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
    exit 1
}

echo "Example of error with line number and message"
error_exit "$LINENO: An error has occurred."
```

Function can use `return` command to terminate its own execution with a designated return value instead
of terminating the whole script.

You can always use the special variable `$?` to access the exit status of the last executed command or
the return value of the last executed function.

Check out `help exit` and `help exit` to learn more.

### 1.6 Control Flow Statements # control-flow

Other than those commands you can used in command line, control flow statements can also be leveraged for
more sophisicated behavior. Control flow statements supported by shell are much like those you can see in other
programming languages, including `if`, `case`, `for`, `while` and `until`.

#### 1.6.1 If # if

The `if` statement allows you to execute designated part of the script only if certain condition is satisfied:

```sh
if [ "$#" -e 0 ]; then
    echo "Received nothing"
elif [ "$#" -e 1 ]; then
    echo "Received one argument: $1"
else
    echo "Received arguments: $@"
fi
```

You can use any command as condition, and the condition is considered satisfied if the exit status of the
command is zero. Check out `help if` to learn more.

Normally, we use shorthand like `[ "$#" -e 1 ]` to execute the `test` command to achieve numerical comparisons and
specify other Linux-common conditions, like if the given path points to a file or directory, and the given shorthand is
equlvalent to `test "$#" -e 1`. Check out `help test` to learn more condition operators you can use other than `-e`.

[](#double-bracket)On some supported shells (Bash, Zsh, Ksh), you can use doubly-bracketed condition like
`[[ a != b ]]`. Such usage is not specified by POSIX and is only supported by some shells. It offers
less surprise comparing to the vanilla `test` command as it won't expand the given arguments before
evaluation, but such advantage comes in the expense of portability. Use at your own risk.
Check out `help [[` and [this page](http://mywiki.wooledge.org/BashFAQ/031) to learn more.

You can use `&&` and `||` to combine the results of multiple `test` invocations. These operators support the
short-circuit behavior commonly seen in other programming languages, which can be utilzed to make some
simple condition test more consise. For example, statement `[ 2 -gt 1 ] && echo 'ok'` is equavalent to the
following snippet:

```sh
if [ 2 -gt 1 ]; then
    echo 'ok'
fi
```

Other than brackets, braces can also be used to specify condition. Check
[this page](https://unix.stackexchange.com/questions/306111/confused-about-operators-vs-vs-vs) to learn more.

#### 1.6.2 Case # case

The `case` statement is similar to the `switch` statement in other programming languages. It tests the
given string with one or more *glob patterns* and then execute the corresponding commands if the given
string satisfied the pattern. A simple `case` statement looks like the following:

```sh
case $character in
    [[:lower:]] | [[:upper:]] ) echo "You typed the letter $character";;
    [0-9] )                     echo "You typed the digit $character";;
    * )                         echo "You did not type a letter or a digit"
esac
```

Note that a right brace (`)`) is required to seperate the pattern and the commands, and double semicolons is
required at the end of each `case` clause expect for the last one.

#### 1.6.3 While # while

The `while` statement can be used to execute given commands in loops as long as the given condition is satisfied:

```sh
number=0
while [ "$number" -lt 10 ]; do
    echo "Number = $number"
    number=$((number + 1))
done
```

#### 1.6.4 Until # until

The `until` statement is similar to the `while` statement, except it terminates the loop until the given condition
is satisfied:

```sh
number=0
until [ "$number" -ge 10 ]; do
    echo "Number = $number"
    number=$((number + 1))
done
```

#### 1.6.5 For # for

The `for` statement can be used to iterate an array:

```sh
for argument in "$@"; do
    echo "Received $argument"
done
```
