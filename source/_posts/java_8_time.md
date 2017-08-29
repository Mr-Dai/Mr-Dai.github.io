---
title: Java8 时间 API
tags: Java
date: 2016-01-07
---

Java8 中最为人津津乐道的新改变恐怕当属函数式 API 的加入。但实际上，Java8 所加入的新功能远不止这个。本文将基于《[Java SE8 for the Really Impatient](http://t.cn/R4ZQRBh)》的第 5 章，归纳一下 Java8 加入的位于 `java.time` 包下的日期和时间 API。

<!-- more -->

## 时间点与时间间隔

在我们常说的四维空间体系中，时间轴往往作为除长宽高三轴以外的第四轴。时间轴由无穷多个时间点组成，而两个时间点之间的距离组成一个时间间隔。相较于我们常说的日期、时间，时间点本身所携带的信息是很少的，不会携带如时区等冗余的信息。作为时间轴上的一个点，我们可以将它称为绝对时间。

Java8 引入了 `Instant` 类（瞬时）来表示时间轴上的一个点。`Instant` 的构造方法是 `private` 的，我们只能通过调用它的静态工厂方法来产生一个 `Instant` 实例。其中最常用的是 `Instant.now()` 方法，返回当前的时间点。`Instant` 类也实现了 `comparesTo` 和 `equals` 方法来对比两个瞬时点。

通过调用 `Duration.between()` 方法我们便可以计算两个时间点之间的时间间隔：

```java
Instant start = Instant.now();

runAlgorithm();

Instant end = Instant.now();

Duration timeElapsed = Duration.between(start, end);
long millis = timeElapsed.toMillis();
```

`between` 方法返回一个 `Duration` 实例。`Duration` 内部以 `long` 成员来存储时间间隔信息，最小单位可去到纳秒，同时提供了如 `toMillis` 、 `toSeconds` 等方法。

`Instant` 和 `Duration` 类常用的方法包括如下：

| 方法 | 描述 |
| --- | --- |
| `plus`、`minus` | 对当前 `Instant` 或 `Duration` 增加或减少一段时间 |
| `plusNanos`、`plusMillis`、`plusSeconds`、`plusMinutes`、`plusHours`、`plusDays` | 根据指定的时间单位，对当前 `Instant` 或者 `Duration` 添加一段时间 |
| `minusNanos`、`minusMillis`、`minusSeconds`、`minusMinutes`、`minusHours`、`minusDays` | 根据指定的时间单位，对当前 `Instant` 或者 `Duration` 减少一段时间 |
| `multipliedBy`、`dividedBy`、`negated` | 返回当前 `Duration` 与指定 `long` 值相乘或相除得到的时间间隔 |
| `isZero`、`isNegative` | 检查 `Duration` 是否为 0 或负数 |

> **注意**：`Instant` 类和 `Duration` 类都是不可变的，上述方法都会返回一个新的实例。

## 本地日期

在新的时间 API 中，Java 提供了两种时间格式：不带时区信息的本地时间和带时区的时间。本地日期表示一个日期，而本地时间还包含（一天中的）时间，但它们都不包含任何有关时区的信息。例如，June 14, 1903 就是一个本地日期。由于日期不含一天中的时间，也不含时区信息，所以它无法与一个准确的瞬时点对应。相反，July 16, 1969, 09:32:00 EDT 就是一个带时区的时间，它表示了时间轴上准确的一点。但有很多计算是不需要考虑时区的，在某些情况下考虑时区甚至可能导致错误的结果。出于此原因，API 设计者们更推荐使用不带时区的时间，除非你真的需要这个时区信息。

`LocalDate` 就是一个不带时区的本地日期：它只带有年份、月份和当月的天数。你可以通过 `LocalDate` 的静态工厂方法 `now` 或 `of` 来创建一个实例：

```java
LocalDate alonzosBirthday = LocalDate.of(1903, 6, 14);
alonzosBirthday = LocalDate.of(1903, Month.JUNE, 14);
```

这里我们看到，静态工厂方法中指示月份的数字是以 1 开始的，因此 6 就代表着六月。如果你实在是太喜欢以 0 开始，无法接受这种设定，你也可以使用枚举类型 `Month` 来指定月份。

下表中列出了 `LocalDate` 对象的一些常用方法。详细的方法说明请参考 `LocalDate` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/LocalDate.html)。

| 方法 | 描述 |
| --- | --- |
| `now`、`of` | 静态工厂方法，可以根据当前时间或指定的年月日来创建一个 `LocalDate` 对象 |
| `plusDays`、`plusWeeks`、`plusMonths`、`plusYears` | 返回在当前 `LocalDate` 的基础上加上几天、几周、几个月或者几年后的新的 `LocalDate` 对象，原有的 `LocalDate` 对象保持不变 |
| `minusDays`、`minusWeeks`、`minusMonths`、`minusYears` | 返回在当前 `LocalDate` 的基础上减去几天、几周、几个月或者几年后的新的 `LocalDate` 对象，原有的 `LocalDate` 对象保持不变 |
| `plus`、`minus` | 返回在当前 `LocalDate` 的基础上加上或减去一个 `Duration` 或者 `Period` 的新的 `LocalDate` 对象，原有的 `LocalDate` 对象保持不变 |
| `withDayOfMonth`、`withDayOfYear`、`withMonth`、`withYear` | 返回一个月份天数、年份天数、月份、年份修改为指定的值的新的 `LocalDate` 对象，原有的 `LocalDate` 对象保持不变 |
| `getDayOfMonth` | 获取月份天数（在 $[1,31]$ 之间） |
| `getDayOfYear` | 获取年份天数（在 $[1,366]$ 之间）|
| `getDayOfWeek` | 获取星期几（返回一个 `DayOfWeek` 枚举值）|
| `getMonth`、`getMonthValue` | 获取月份，返回一个 `Month` 枚举的值，或者是 $[1,12]$ 之间的一个数字 |
| `getYear` | 获取年份，在 $[-999999999,999999999]$ 之间 | 
| `until` | 获取两个日期之间的 `Period` 对象，或者以指定 `ChronoUnits` 为单位的数值 | 
| `isBefore`、`isAfter` | 比较两个 `LocalDate` | 
| `isLeapYear` | 是否为闰年 | 

> **注意**：`LocalDate` 类是不可变的，上述方法都会返回一个新的实例。

在上一节中我们提到，两个瞬时点 `Instant` 之间的是一个持续时间 `Duration`。对于本地时间，对应的对象就是时段 `Period`，它表示一段逝去的年月日。

## 本地时间

`LocalTime` 代表一天中的某个时间，例如下午 3 点 30 分。同样，你可以通过 `LocalTime` 的静态工厂方法 `now` 和 `of` 来创建一个实例。

```java
LocalTime rightNow = LocalTime.now();
LocalTime bedtime= LocalTime.of(22, 30)
```

下表中列出了 `LocalTime` 对象的一些常用方法。详细的方法说明请参考 `LocalTime` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/LocalTime.html)。

| 方法 | 描述 |
| --- | --- |
| `now`、`of` | 静态工厂方法，可以根据当前时间或指定的时分秒来创建一个 `LocalTime` 对象 | 
| `plusHours`、`plusMinutes`、`plusSeconds`、`plusNanos` | 返回在当前 `LocalTime` 的基础上加上几小时、几分钟、几秒或者几纳秒后的新的 `LocalTime` 对象，原有的 `LocalTime` 对象保持不变 | 
| `minusHours`、`minusMinutes`、`minusSeconds`、`minusNanos` | 返回在当前 `LocalTime` 的基础上减去几小时、几分钟、几秒或者几纳秒后的新的 `LocalTime` 对象，原有的 `LocalTime` 对象保持不变 | 
| `plus`、`minus` | 返回在当前 `LocalTime` 的基础上加上或减去一个 `Duration` 的新的 `LocalTime` 对象，原有的 `LocalTime` 对象保持不变 |
| `withHour`、`withMinute`、`withSecond`、`withNano` | 返回一个小时数、分钟数、秒数、纳秒数修改为指定的值的新的 `LocalTime` 对象，原有的 `LocalTime` 对象保持不变 | 
| `getHour`、`getMinute`、`getSecond`、`getNano` | 返回该 `LocalTime` 的小时、分钟、秒钟及纳秒值 | 
| `isBefore` 、 `isAfter` | 比较两个 `LocalTime` | 

>  **注意**：`LocalTime` 类是不可变的，上述方法都会返回一个新的实例。

`LocalDateTime` 类则可看作是 `LocalDate` 和 `LocalTime` 的结合。它用于存储本地时区中的某个时间点，包含当前的年月日等日期信息，同时也包含了时钟、分钟、秒钟等时间信息。同样，`LocalDateTime` 也是不可变的。

详细的方法说明请参考 `LocalDateTime` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/LocalDateTime.html)。

## 带时区的时间

Java8 的时间 API 当然也加入了对时区的支持。分别对应着 `LocalDate`、`LocalTime` 和 `LocalDateTime`，带时区的时间类为 `ZonedDate`、`ZonedTime`、`ZonedDateTime`。

Java 中的时区信息来自于 IANA（Internet Assigned Numbers Authority）的数据库，其中每个时区都有着对应的 ID，例如 `America/New_York` 或者 `Europe/Berlin`。调用 `ZoneId.getAvailableIds` 方法即可获取所有可用的时区信息。

你还可以使用 `ZoneId.of(id)` 方法，用指定的时区 ID 来获取对应的 `ZoneId` 对象。通过调用 `local.atZone(zoneId)` 方法，你可以将一个 `LocalDateTime` 转换成一个 `ZonedDateTime` 对象，或者通过调用静态方法 `ZonedDateTime.of` 来创建一个对象。

`ZonedDateTime` 的许多方法都与 `LocalDateTime` 一致。下表中列出了 `ZonedDateTime` 特有的常用方法，详细的方法说明请参考 `ZonedDateTime` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/ZonedDateTime.html)。

| 方法 | 描述 |
| --- | --- |
| `now`、`of`、`ofInstant` | 根据当前时间或指定的年月日时分秒、纳秒和 `ZoneId`，或者一个 `Instant` 和一个 `ZoneId` 来创建一个 `ZonedDateTime` 对象 |
| `withZoneSameInstant`、`withZoneSameLocal` | 返回时区失去中的一个新的 `ZonedDateTime` 对象，它表示相同的瞬时点或本地时间 | 
| `getOffset` | 获得与 UTC 之间的时差，返回一个 `ZoneOffset` 对象 | 
| `toLocalDate`、`toLocalTime`、`toInstant` | 返回对应的本地日期、本地时间或瞬时点 | 

除此之外，Java8 还提供了一个 `OffsetDateTime` 类，用来表示带有（与 UTC 相比的）偏移量的时间。这个类专门用于一些不需要时区规则的业务场景，比如某些网络协议。对于人类可读的时间，`ZonedDateTime` 是更好的选择。

详情请查阅 `OffsetDateTime` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/OffsetDateTime.html)。

## 日期校正器

有些时候，我们可以能需要得到类似“每月的第一个星期二”这样的日期。Java8 提供了 `TemporalAdjuster` 接口，用以实现自定义的日期校正逻辑。通过将创建好的 `TemporalAdjuster` 传递给日期时间类的 `with` 方法便可在原有日期时间对象的基础上产生出一个符合要求的日期时间。例如，你可以通过如下代码来计算下一个星期二：

```java
TemporalAdjuster NEXT_TUESDAY = (Temporal temporal) -> {
    int dowValue = DayOfWeek.TUESDAY.getValue();
    int calDow = temporal.get(ChronoField.DAY_OF_WEEK);
    if (calDow == dowValue) {
        return temporal;
    }
    int daysDiff = calDow - dowValue;
    return temporal.plus(daysDiff >= 0 ? 7 - daysDiff : -daysDiff, DAYS);
};

LocalDate nextTuesDay = today.with(NEXT_TUESDAY);
```

此处利用 Lambda 表达式快速实现了一个匿名的 `TemporalAdjuster` 对象。注意 Lambda 表达式的参数类型为 `Temporal`，某些 `LocalDate` 或者 `LocalDateTime` 之类的类特有的方法将不可用，在使用前必须进行强制转换。你可以通过 `ofDateAdjuster` 方法和一个 `UnaryOperator<LocalDate>` 来避免强制转换：

```java
TermporalAdjuster NEXT_WORKDAY = TemporalAdjusters.ofDateAdjuster((LocalDate w) -> {
	LocalDate result;
	DayOfWeek dow = w.getDayOfWeek();
	if (dow == DayOfWeek.FRIDAY)
		result = w.plusDays(3);
	else if (dow == DayOfWeek.SATURDAY)
		result = w.plusDays(2);
	else
		result = w.plusDays(1);

    return result;
});
```

上述代码中使用的 `ofDateAdjuster` 方法来自类 `TemporalAdjusters`。实际上这个类通过静态方法提供了大量的常用 `TemporalAdjuster` 实现。比如，我们也可以通过如下代码来计算下一个星期二：

```java
LocalDate nextTuesDay = LocalDate.now().with(
  TemporalAdjusters.nextOrSame(DayOfWeek.TUESDAY)
);
```

下表中列出了 `TemporalAdjusters` 的一些常用方法。详细的方法说明请参考 `TemporalAdjusters` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/temporal/TemporalAdjusters.html)。

| 方法 | 描述 |
| --- | --- |
| `previous(dayOfWeek)`、`next(dayOfWeek)` | 返回被校正日期之后或之前最近的指定星期几 | 
| `previoursOrSame(dayOfWeek)`、`nextOrSame(dayOfWeek)` | 返回从被校正日期开始，之前或之后的指定星期几。如果被校正日期已吻合条件，被校正的日期实例将被直接返回 | 
| `dayOfWeekInMonth(n, dayOfWeek)` | 返回该月中指定的第几个星期几 | 
| `firstInMonth(dayOfWeek)`、`lastInMonth(dayOfWeek)` | 返回该月第一个或最后一个星期几 | 
| `firstDayOfMonth()`、`firstDayOfNextMonth()`、`firstDayOfNextYear()`、`lastDayOfMonth()`、`lastDayOfPreviousMonth()`、`lastDayOfYear()` | 返回方法名所描述的日期 | 

## 格式化和解析

除了日期校正，日期与字符串之间的相互转换也是十分常见的操作。对于原有的 `java.util.Date` 等类，我们使用 `java.text.DateFormat` 来对日期进行格式化和解析。对于 Java8 新引入的日期时间类，我们使用 `java.time.format.DateTimeFormatter` 类。

`DateTimeFormatter` 类提供了三种格式化方法来打印日期时间：

- 预定义的标准格式
- 语言环境相关的格式
- 自定义的格式

下表中列出了所有预定义的 `DateTimeFormatter`。详细说明可参考 `DateTimeFormatter` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html#predefined)。

| 格式 | 示例 |
| --- | --- |
| `BASIC_ISO_DATE` | `20111203` | 
| `ISO_LOCAL_DATE`<br/>`ISO_LOCAL_TIME`<br/>`ISO_LOCAL_DATE_TIME` | `2011-12-03`<br/>`10:15:30`<br/>`2011-12-03T10:15:30` | 
| `ISO_OFFSET_DATE`<br/>`ISO_OFFSET_TIME`<br/>`ISO_OFFSET_DATE_TIME` | `2011-12-03+01:00`<br/>`10:15:30+01:00`<br/>`2011-12-03T10:15:30+01:00` | 
| `ISO_ZONED_DATE_TIME` | `2011-12-03T10:15:30+01:00[Europe/Paris]` | 
| `ISO_INSTANT` | `2011-12-03T10:15:30Z` | 
| `ISO_ORDINAL_DATE` | `2012-337` | 
| `ISO_WEEK_DATE` | `2012-W48-6` | 
| `ISO_DATE`<br />`ISO_TIME`<br />`ISO_DATE_TIME` | `2011-12-03+01:00`; `2011-12-03`<br />`10:15:30+01:00`; `10:15:30`<br />`2011-12-03T10:15:30+01:00[Europe/Paris]` | 
| `RFC_1123_DATE_TIME` | `Tue, 3 Jun 2008 11:05:30 GMT` | 

通过调用 `DateTimeFormatter` 类的 `format` 方法即可对日期进行格式化：

```java
String formatted = DateTimeFormatter.ISO_DATE_TIME.format(apollolllaunch);
  // 1969-07-16T09:32:00-0500[America/New_York]
```

标准格式主要用于机器可读的时间戳。为了产生人类可读的日期和时间，你需要使用语言环境相关的格式。下表中列出了 Java8 提供的 4 种风格：

| 风格 | 日期 | 时间 |
| --- | --- | --- |
| `SHORT` | `7/16/69` | `9:32 AM` | 
| `MEDIUM` | `Jul 16, 1969` | `9:32:00 AM` | 
| `LONG` | `July 16, 1969` | `9:32:00 AM EDT` | 
| `FULL` | `Wednesday, July 16, 1969` | `9:32:00 AM EDT` | 

你可以通过静态方法 `ofLocalizedDate` 、 `ofLocalizedTime` 和 `ofLocalizedDateTime` 来创建这些格式：

```java
DateTimeFormatter formatter =
    DateTimeFormatter.ofLocalizedDateTime(FormatStyle.LONG);

String formatted = formatter.format(apollolllaunch);
    // July 16, 1969 9:32:00 AM EDT
```

这些方法使用的都是默认的语言环境。通过使用 `withLocale` 方法可以更改为其他语言环境：

```java
String formatted = formatter.withLocale(Locale.FRENCH).format(apollolllaunch);
    // 16 juillet 1969 09:32:00 EDT
```
你可以通过调用 `formatter.toFormat()` 方法来获取一个等效的 `java.util.DateFormat` 对象。

最后，你可以通过指定的模式来自定义日期的格式。例如：

```java
formatter = DateTimeFormatter.ofPattern("E yyyy-MM-dd HH:mm");
```

其中不同的符号对应着不同的含义。下表中列出了不同符号的具体含义和实例，详情可查阅 `DateTimeFormatter` 的 [JavaDoc](http://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html#patterns)。

| 含义 | 符号 | 示例 |
| --- | --- | --- |
| 纪元 | `G`<br/>`GGGG`<br /> `GGGGG` | `AD`<br />`Anno Domini`<br />`A` |
| 年份 | `yy`<br />`yyyy` | `69`<br />`1969` | 
| 月份 | `M`<br />`MM`<br />`MMM`<br />`MMMM`<br />`MMMMM`<br /> | `7`<br />`07`<br />`Jul`<br />`July`<br />`J` | 
| 日份 | `d`<br />`dd` | `6`<br />`06` | 
| 星期几 | `e`<br />`E`<br />`EEEE`<br />`EEEEE` | `3`<br />`Wed`<br />`Wednesday`<br />`W` | 
| 24 小时制时钟（$[0,23]$） | `H`<br />`HH` | `9`<br />`09` | 
| 12 小时制时钟（$[0,11]$） | `K`<br />`KK` | `9`<br />`09` | 
| AM/PM | `a` | `AM` | 
| 分钟 | `mm` | `02` | 
| 秒钟 | `ss` | `00` | 
| 时区 ID | `VV` | `America/New_York` | 
| 时区名称 | `z`<br />`zzzz`<br /> | `EDT`<br />`Eastern Daylight Time` | 
| 时差 | `x`<br />`xx`<br />`xxx`<br />`XXX` | `-04`<br />`-0400`<br />`-04:00`<br />`-Z4:ZZ` | 
| 本地化的时差 | `O`<br />`OOOO` | `GMT-4`<br />`GMT-04:00` | 

要从一个字符串中解析出日期时间，可以使用静态方法 `parse` 的各个重载方法。例如：

```java
LocalDate churchsBirthday = LocalDate.parse("1903-06-14");
ZonedDateTime apollolllaunch =
    ZonedDateTime.parse("1969-07-16 03:32:00-0400",
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssxx"));
```

## 与遗留代码互操作

尽管使用全新的 API 可以获得更好的开发体验，但兼容遗留代码总是不可避免的。因此，熟知新的日期时间类和旧的日期时间类之间的转换方法也是我们必须学习的。

总体来讲，转换规则可以归纳为下表：

| 类 | To 遗留类 | From 遗留类 |
| --- | --- | --- |
| `java.time.Instant`<br />`java.util.Date` | `Date.from(instant)` | `date.toInstant()` | 
| `java.time.Instant`<br />`java.sql.Timestamp` | `Timestamp.from(instant)` | `timestamp.toInstant()` | 
| `java.time.Instant`<br />`java.nio.file.attribute.FileTime` | `FileTime.from(instant)` | `fileTime.toInstant()` | 
| `java.time.ZonedDateTime`<br />`java.util.GregorianCalendar` | `GregorianCalendar.from(zonedDateTime)` | `cal.toZonedDateTime()` | 
| `java.time.LocalDate`<br />`java.sql.Time` | `Date.valueOf(localDate)` | `date.toLocalDate()` | 
| `java.time.LocalTime`<br />`java.sql.Time` | `Date.valueOf(localDate)` | `date.toLocalTime()` | 
| `java.time.LocalDateTime`<br />`java.sql.Timestamp` | `Timestamp.valueOf(localDateTime)` | `timestamp.toLocalDateTime()` | 
| `java.time.ZoneId`<br />`java.util.TimeZone` | `Timezone.getTimeZone(id)` | `timeZone.toZoneId()` | 
| `java.time.format.DateTimeFormatter`<br />`java.text.DateFormat` | `formatter.toFormat()` | 无 | 
