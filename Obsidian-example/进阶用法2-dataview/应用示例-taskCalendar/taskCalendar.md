# Obsidian-Tasks-Calendar
#### 0.1.1. 概述
这不是一个插件，而是基于 【Obsidian Tasks】 和 【dataview】的一个应用示例
![Mockup](https://user-images.githubusercontent.com/59178587/200115332-382ecaed-845a-479b-a363-fa9c136b3342.png)

## 1. 背景
所有Obsidian 和 【Task】插件收到用户们的喜爱。【Task】插件非常棒，可以帮助大家组织工作和任务。然而，仅仅根据某些标准列出任务有时会有一点“寡淡”。为了快速直观地了解工作日/工作周/工作月的总览情况，日历视图是理想的。

老实说，我并不聪明，（译者注：不是我加的，原作者原话）无法为Obsidian编写自己的插件，但我知道一些Javascript，所以我编写了这个Dataview片段。我希望为许多人提供一个很好的任务插件插件，并希望有一天能集成到任务插件中。但我相信有更好的程序员，他们可以让我的代码变得更好，这对专业人士来说可能很可怕。

## 2. Setup
1.  安装 【Dataview】 插件，从社区插件市场
2.  创建一个 "tasksCalendar"文件夹 或者你自己定义的文件夹，黏贴 "view.js" 和 "view.css" 到该文件夹下。
（译者注：本示例库中的路径：Template > tasksCalendar）

<img width="259" alt="Bildschirm­foto 2022-10-30 um 10 00 03" src="https://user-images.githubusercontent.com/59178587/198870629-392cb4fe-654a-421c-b8fb-d4b66def329b.png">

3.  在你的笔记中写入下面的 dataviewjs 片段:

    ````
    ```dataviewjs
    await dv.view("tasksCalendar", {pages: "", view: "month", firstDayOfWeek: 1, options: "style1"})
    ```
    ````
    
  如果将主文件（js/css）粘贴到另一个其他名称的文件夹中，请替换第一个引号之间（“tasksCalendar”）的名称。
 
 4. 有4个不同的变量可以将路径/位置设置为“页面”，将日历视图样式设置为“视图”，将一周的第一天（0或1）设置为“firstDayOfWeek”（每周起始的日子），将一些样式类设置为“选项”

---
## 3. 所需要的参数

### 3.1. pages（译者注：水平有限下面内容不做翻译，而且有点dataview 基础的同学也不难看懂）

For help and instruction take a look here [Dataview Help](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvpagessource)

```
pages: ""
```
Get all tasks from all notes in obsidian.

```
pages: '"Task Management/Work"'
```
Set a custom folder to get tasks from.

The dv.pages command is the same and works exactly the same like in dataview-plugin.

```
pages: "dv.pages().file.tasks.where(t => t.tags.includes('#Pierre'))"
pages: "dv.pages().file.tasks.where(t=>!t.checked && t.header.subpath != 'Log')"
```
It is also possible to define complex queries. These must start with `dv.pages` and output tasks as a result.
    

### 3.2. view:
```
view: "month"
view: "week"
```
With the view parameter you can set the default selected calendar
  

### 3.3. firstDayOfWeek:
```
firstDayOfWeek: 1
firstDayOfWeek: 0
```
Set monday (1) or sunday (0) as first day of week

---
## 4. Optional parameters

### 4.1. dailyNoteFolder:
```
dailyNoteFolder: ""
dailyNoteFolder: "MyCustomFolder"
dailyNoteFolder: "Inbox/Daily Notes/Work"
```
This parameter must only be specified if this is to be used. Here you can define a custom folder path for the daily notes if they should not be saved in the default folder for new files. Of course, folder structures with several levels can also be defined here. This paramter 

### 4.2. startPosition:
```
startPosition: ""
startPosition: "2024-06-01"
```
This parameter can be used to set a date to give focus an month or week view (set with `view:` parameter). On month calendar every date between the first and the last day of the month will be shown the right month. On the week calendar all dates between the first day and the last day of that week will be shown the right week. The input format must look like this `YYYY-MM-DD`.

### 4.3. globalTaskFilter:
```
globalTaskFilter: ""
globalTaskFilter: "#task"
```
This parameter must only be specified if this is to be used. Set a global task filter to hide from task text/description inside tasks-calendar.

---
## 5. Options parameter

```
options: "noIcons"
```
Hide Task plugin Icons in front of each task

```
options: "noProcess"
```
The tasks with a start-date and a due-date are not displayed on all days between them

```
options: "noDailyNote"
```
Hide daily notes inside calendar

```
options: "noCellNameEvent"
```
Disable pointer events on cell names to prevent unintentional execution

```
options: "mini"
```
Set smaller text on tasks, cell names and grid heads. Reduces the calendar width and height to a more compact format.
On mobile devices, the font size is automatically reduced because the limited screen size.

```
options: "noWeekNr"
```
Hide the week number in front of each wrapper/row/week inside the month calendar

```
options: "noFilename"
```
Hides the task header line with the note file name

```
options: "lineClamp1"
options: "lineClamp2"
options: "lineClamp3"
options: "noLineClamp"
```
Set a line clamp from 1-3 inside your displayed tasks. By default 1 line is set. Alternative you can disable line clamp and show full task description text.

```
options: "noLayer"
```
The back layer of the grid with the month or week information can be hidden with this.


---

### 5.1. Style options

```
options: "style1"
```
There are different style options (style1, style2, ...) to change the look of the weekly calendar view

![Styles_Preview](https://user-images.githubusercontent.com/59178587/201508941-35f50ebf-bc94-40fd-a523-f07f7c9d9c07.png)

---

## 6. Note color & icon
In each note file you can define custom "color" and "icon" to show up in the calendar. To do so, you only need to add the following metadata to the first line of your note. By default the note-color is used for the dimmed background and as text-color. If you would like to give your tasks a completely different color then the note-color itself, then use the textColor meta.

```
---
color: "#bf5af2"
textColor: "#000000"
icon: "❤️"
---
```
    
The color should be hex in quotation marks to work properly. This color is set for text and as semi-transparent background. The icon itself is placed in front of each task to help identify where this task comes from.

---

## 7. Filter
On the upper left corner of each calendar-view is a filter-icon to show or hide all done and cancelled tasks. The default-filter is set by options. If you have `filter` inside your options parameter, the filter is enabled by default.

---

## 8. How It Works
This snippet fetch all tasks with a date like due, start, scheduled, done. Tasks with a start and a due date are presented on all days from start to end (due). This way you can show up periods on you calendar like a holiday. This default handling can be disabled in `options` inside the dataviewjs code line by adding `noProcess`.

<img width="1115" alt="Bildschirm­foto 2022-10-30 um 10 23 43" src="https://user-images.githubusercontent.com/59178587/198871481-bd9d4b89-ff99-435c-8c30-625f27f1a4f7.png">

Hovering a task let popup a small info about the note and task (note-title: task-description). In the upper left corner is the calendar switcher, which can be used to switch between two different calendar views (month/week). Under `view` in the dataviewjs code line the default calendar view is set. When switching between the views, the calendar remains in the previous month. By clicking on the calendar header, you can return to today (the current month or week) at any time. The arrow keys in the upper right corner can be used to scroll backwards and forwards through the months/weeks. The filter in the upper right corner allows you to hide all finished tasks in the calendar. The filter itself can be switched on by default with `noDone` in the `options` within the dataviewjs code line.

<img width="1116" alt="Bildschirm­foto 2022-10-30 um 10 19 22" src="https://user-images.githubusercontent.com/59178587/198871327-7eb684f4-04ee-4155-83be-7016889b2fee.png">

After a task is completed the start- and scheduled dates are no longer needed and will be hidden. The task is now only displayed on the final completion date.
