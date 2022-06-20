# 目录^TOC

- [[#目录^TOC|目录]]
	- [[#1. 概述|1. 概述]]
	- [[#2. 目标|2. 目标]]
		- [[#2.1. 原则一“专注写作和沉淀”|2.1. 原则一“专注写作和沉淀”]]
		- [[#2.2. 原则二“即插即用”|2.2. 原则二“即插即用”]]
		- [[#2.2. 原则三“稳定和低耦合”|2.2. 原则三“稳定和低耦合”]]
	- [[#3. 详细|3. 详细]]
		- [[#3.1. 使用案例|3.1. 使用案例]]
		- [[#3.2. task跟踪|3.2. task跟踪]]
		- [[#特性|特性]]
			- [[#并排列的引入|并排列的引入]]
			- [[#支撑|支撑]]
		- [[#文件的组织和管理|文件的组织和管理]]
			- [[#floder note|floder note]]
			- [[#外部知识串联|外部知识串联]]
			- [[#BOOKNOTE 插件|BOOKNOTE 插件]]
		- [[#3.3. 主页|3.3. 主页]]
		- [[#3.4. 插件|3.4. 插件]]
		- [[#3.5.1. plugin:obsidian-banners|3.5.1. plugin:obsidian-banners]]
		- [[#3.5.2. plugin：table-extended|3.5.2. plugin：table-extended]]
		- [[#3.5. plugin：强制某些页面可以使用阅读模式展示|3.5. plugin：强制某些页面可以使用阅读模式展示]]
	- [[#obsidianUIMode: source|obsidianUIMode: source]]
	- [[#obsidianUIMode: preview|obsidianUIMode: preview]]
## 1. 概述
一个好的笔记软件，或者说一个好的软件。应该考虑其自身的易用性。诚然 Obsidian 是一款伟大的软件（I'm lovin it），但他还很年轻（显然现在的市场占有率16%），目前可以说是一个“成以社区插件，败也社区插件”。

在满足大部分人可用（样式、细节优化）的基础上，又能使其更加易用，更加方便，但又不丧失精炼和关注书写积累知识的精髓。成为了Obsidian 学习和使用过程中最耗费时间的事情。但是将大量的时间浪费在如何用好一个知识积累工具，显然在某种成都上是与之相悖的。

这便诞生这个即插即用库（vault）的设计

## 2. 目标 
### 2.1. 原则一“专注写作和沉淀”
在接触 Obsidian 之前，我仅仅听说过 Markdown 的大名，但是对其语法并不了解的人，当然我也不会 JavaScript 或者 CSS。

如果你像我一样完全不懂代码，之前也不知道大名鼎鼎的 Markdown。那么请你把它想象成一个记事本。相信我你完全可以专注在 纯文本的书写上。不要浪费精力在那些大牛设计的完美启动页，进度跟踪逻辑，单纯的当作一个 All in One 的工具就好了。

这就诞生了第一个原则“专注协沉淀”，所有的插件和样式都是应该为了更好的书写和知识积累服务的，更好的区分段落，更好的区分标题，和目录管理。

Principle #1 "Focus on writing and legacy"
Before Obsidian, I had only heard of Markdown, but I didn't know much about its syntax, and I certainly didn't know JavaScript or CSS.

If you're like me and you don't know anything about coding, and you didn't know about Markdown before。Trust me,think of it as a notepad. you cloud focus on writing pure text. Don't waste your energy on the perfect launch page, progress tracking logic, just think of it as an "All in One" tool.

This gives birth to the first principle of "focus on collaboration", all plug-ins and styles should be for better writing and knowledge accumulation services, better differentiation of paragraphs, better differentiation of headings, and directory management.

### 2.2. 原则二“即插即用”
大概在2022年2月份正式开启了自己切换笔记和知识管理软件的计划，先后接触了Notion、Roam，也很期待今年下半年的 微软 Loop，目前最终停留在了 Obisdian 上。

这个过程中最大的痛点，就是很多插件的使用学习，虽然教程可谓“丰富”，但对于大部分入门者来说，无疑阻碍了新用户进入到这个大家庭。（学习成本很高）

这就诞生了第二个原则“即插即用”，整个项目已经调教好了包括常用的插件设置，插件需要的素材，包括我自认为可用的模板范例和日常记录模式

### 2.2. 原则三“稳定和低耦合”
整个过程中插件的稳定性，升级都会为整个笔记和知识库的使用体验带来不同的影响。

而且样式都是由不同的人进行编码的，难免会产生不同程度的冲突。

这就诞生了第二个原则“稳定和低耦合”
	尽可能的合并CSS 到主要的theme 中，snippets 中的只作为个性化开关；
	由于插件的稳定性很重要，所以项目中的插件版本，都会定期更新，而非跟随整体的社区插件版本；
	尽可能减少插件的安装和使用，防止启动速度变慢。（虽然已经）

## 3. 详细
### 3.1. 使用案例
### 3.2. task跟踪
### 特性

#### 并排列的引入
改善 Obsidian 和 Markdown 流式语法展示的特点，方便需要并行展示多栏目任务
支持笔记的多栏目样式，通过加载多行分列语法MCL Multi Column.css，如果不需要可以在 “Obsidian -> 设置 -> 外观” 中关闭。

#### 支撑
支持将数字和时间

### 文件的组织和管理
#### floder note
管理文件夹和文件对应的数量

#### 外部知识串联

#### BOOKNOTE 插件

### 3.3. 主页
### 3.4. 插件
1、集成了常用，且较为稳定的插件能力，这插件不是面面俱到，但是可以解决原始Markdown，和obsidian在书写体验上的一定问题。遵循"即开即用"
列表如下
ZH增强编辑插件：增强obsidian编辑器功能

image toolkit:图片查看增强 [[图片浏览增强（Image Toolkit插件介绍） by 软通达]]

Active note to window title：在状态栏显示标题

Outliner：大纲插件

Recent Files：最近文档

Remember cursor position：记住鼠标位置（长文浏览优化）

Kanban：看板功能 [[看板插件（Kanba插件介绍）by 软通达]]

Style Settings：主题修改 [[简易自定义OB主题（Style settings插件介绍） by 软通达]]

Word Splitting for Simplified Chinese in Edit Mode：中文分词，但现在好像失效了

ZH增强编辑：多种编辑增强

excalidraw：无限画布功能 [[Obsidian 插件之 Excalidraw by Bon]]

tag wrangler：标签增强

better footnote： 悬浮显示脚注

footnote： 迅速插入脚注

Auto pair chinese symbol：中文符号自动成对

Advanced tables和Table extended：表格增强

Workspaces Plus：工作区增强，切换和管理工作区

Find and replace in selection：局部替换（而非全局）

cMenu: 方便输入markdown

Get info：提供简单的卡片信息

Vault Statistics:提供库的信息

其他人有提议但没加入：

show whitespace：显示空格

local images：批量下载全库或本页面的网络图片至attachment

Admonition：

dynamic table of contents：Toc生效

Search on Internet：

### 3.5.1. plugin:obsidian-banners
1、优化CSS的可读性，之前压缩的完全没有可读性，毕竟我不是研发，没办法看那么习惯

2、banner的宽度无法自适应页面的宽度变化
--banner-height

### 3.5.2. plugin：table-extended
1、plugin：table-extended
Expermental: Exttended Native Table Syntax
和豆瓣书籍摘要模板冲突，会导致无法渲染bookinfo这样的标注文字（callouts）的语法格式("> []")，在阅读模式（markdown-reading-view）下展示异常。


### 3.5. plugin：强制某些页面可以使用阅读模式展示
这里会列举所有的细节

---
obsidianUIMode: source
---
... and this will force the note to open in "source" (edit) mode.

Similar, ... add below snippet to your note ...

---
obsidianUIMode: preview
---


样式：
1、整体基于Minimal 主题为原型；
原因：这个主题支持较为全面，且样式更简约，符合整个"保持纯粹的"的理念

2、集成了蓝色托帕石，一些比较不错的设计适合Obsidian v0.14.12
2、feature：启动动画功能，现在你可以选择任意的图片，或者动图来个性化启动了。
原因：毕竟随着插件越来越多，等待启动越来越难
loading-animation

3、feature：Dataview Cards，主要用于生成基于dataview查询的图片墙样式，你可以将你的书籍、电影都放到这里面，而且不需要单独的维护他。

4、feature：编辑代码块按钮调整，原版不是很好点击，所以修改了一个样式版本

5、feature：增加callouts语法，段落自动缩进写法。以下表达都是可以的
    > [!note|indent]
    > [!note indent]

6、feature：增加callouts语法，支持三种对齐方式。语法如下：
    > [!note|left] 、> [!note|center] 、> [!note|right]
	语法格式如下，以下两种方式均可：
	> [!note|right]
    > [!note right]

7、feature：增加callouts语法，支持自定义百分比宽度，每5%一个区间。以下表达都是可以的
	> [!note|30%]
	> [!note 30%]

8、feature：增加callouts语法，新类型[bookinfo]，用于生成豆瓣读书信息的页面，当然也可以用在别的地方

9、feature：增加图片的位置属性，支持自定义图片的对齐方式。包含对齐，方式和环绕效果

10、feature：强化了浮窗模式的样式，让浮窗模式的标题和浮层看着更明显



致谢 Credits：
@Cuman
@LillianWho
@成雙酱
@嘴上云
@Klaas
@Thinkbond
@Rainbell129(AKA Lavi)
@awyugan
@GeoffreyOuO (WooYoo~~~)*/

