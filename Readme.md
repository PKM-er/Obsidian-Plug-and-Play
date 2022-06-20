## 1. 概述
一个好的笔记软件，或者说一个好的软件。应该考虑其自身的易用性。诚然 Obsidian 是一款伟大的软件（I'm lovin it），但它还很年轻（显然现在的市场占有率16%，不是它的终点），目前可以说是一个“成以社区，败也社区”的阶段。

保持满足大部分人可用（样式、细节优化）的基础上，又能使其更加易用，更加方便，但又能聚焦书写、积累知识的精髓。成为了Obsidian 学习和使用过程中最耗费时间的事情。但是将大量的时间浪费在如何用好一个知识积累工具，显然在某种成都上是与之相悖的。

这便诞生这个即插即用库（Vault）的初衷。

## 2. 目标 

### 2.1. 原则一“专注写作和沉淀”
在接触 Obsidian 之前，我也是一个只知道 Markdown ，但是对齐语法并不了解的人，当然我也不会 JavaScript 或者 CSS。

如果你像我一样完全不懂代码，之前也不知道大名鼎鼎的 Markdown。那么请你把它想象成一个记事本。相信我你完全可以专注在 纯文本的书写上。不要浪费精力在那些大牛设计的完美启动页，进度跟踪逻辑，单纯的当作一个 All in One 的工具就好了。

这就诞生了第一个原则“专注协沉淀”，所有的插件和样式都是应该为了更好的书写和知识积累服务的，更好的区分段落，更好的区分标题，和目录管理。

### 2.2. 原则二“即插即用”
大概在2022年2月份，正式开启了切换笔记和知识管理软件的计划，先后接触了Notion、Roam，也很期待2022年下半年的 微软 Loop，目前停留在了 Obisdian 上。

不得不说，这是一个即快乐又痛苦的过程，最大的痛点就是很多插件的使用学习，虽然教程可谓“丰富”，但对于大部分入门者来说，无疑阻碍了新用户进入到这个大家庭。（学习成本很高）

这就诞生了第二个原则“即插即用”，整个项目已经调教好了包括常用的插件设置，插件需要的素材，包括我自认为可用的模板范例和日常记录模式.

### 2.3. 原则三“稳定和低耦合”
整个过程中插件的稳定性，升级都会为整个笔记和知识库的使用体验带来不同的影响。

而且样式都是由不同的人进行编码的，难免会产生不同程度的冲突。

这就诞生了第二个原则“稳定和低耦合”
- 尽可能的合并 CSS 到主要的theme 中，snippets 中的只作为个性化开关；
- 由于插件的稳定性很重要，所以项目中的插件版本，都会定期更新，而非跟随整体的社区插件版本；
- 尽可能减少插件的安装和使用，防止启动速度变慢（虽然已经有方法可以优化）；
- 防止过度依赖插件稳定或者更新，或者引入太多不必要的语法，导致markdown 本身的迁移性很差；

## 3. 详细

这里会依据“书写体验”、“文件的组织和管理”、“任务和知识沉淀”来描述这个库的使用方法

### 3.1. 概述
需要一个表格表述，插件的都有哪些？哪些插件默认启用了，哪些插件没有启用，未启用的原因？
以下文字中插件名称会使用 【】来表示；

#### 3.1.1. 插件
1、集成了常用，且较为稳定的插件能力，这插件不是面面俱到，但是可以解决原始Markdown，和 Obsidian 在书写体验上的一定问题。遵循"即开即用"
列表如下
ZH增强编辑插件：增强obsidian编辑器功能

#### 3.1.2. 样式
### 3.2. 正文书写体验

#### 3.2.1. 文字样式
- 增强文本编辑时的体验
	- 通过【cmenu】增加了文本编辑菜单的跟随模式，这个模式近似拟可以获得Notion，Word那样的跟随鼠标浮动菜单的体验。（@cumany 对这个插件的改版，另外推荐@ cumany的 [Blue-topaz-examples (github.com)](https://github.com/cumany/Blue-topaz-examples/tree/main/.obsidian) 也是一个非常不错的 Obsidian 即插即用库。）
		- 在 cumany 的基础上，增加文字颜色 以及 马克笔效果 的icon和配置（默认配置了红蓝两色，额外支持橙色、黄色、绿色）；
		- 在 cumany 的基础上，对浮动文字快捷工具栏做了展示位置的修改，尽可能更加跟随鼠标；
		- 增加CMENU插件的浮窗模式
		- 增加对应增加H1-H6的标题菜单选项，需要【增强编辑】插件支持
		- 增加彩色字号，和对应的彩色菜单
		- 增加彩色马克笔样式，和对应的彩色菜单
	- 通过【增强编辑（Enhanced-editing）】插件可以和【cmenu】联动使用，大大增强了可以编辑文本内容格式。（感谢@蚕子，也是 Obsidian 中文圈的大佬了）
		- 细节修改：这里将【增强编辑（Enhanced-editing）】转换背景，使用的"<span/>"，替换成了"<mark/>"，个人感觉mark的样式远比背景色更方便。【补充图片】
- 快速切换标题的等级：【Lapel】
- 脚注增强，增强学术论文，引用脚注的体验。【Better footnote】插件

#### 3.2.2. 输入自动提示辅助

码字其实本身是一件体力活儿，自动拼写提示和完成，会大大节省和提高我们的输入效率。

1.【various-complements】
- 利用自定义字典或者本文档的文本在当前文件中补充文本。 
	- 这里已经继承了一些，我认为比较好用的词典，在Knowledge\Obisdian-learning\var complete 目录下；
	- 其中包括英文和中文常用的词语；
	- 其中包括动物、财经、汽车、成语、地名、食物、IT、法律、历史名人、医药、诗词。当然你可以根据你的喜欢在这个插件中找到设置自行扩充；
- 利用自定义字典，可以达到一些快速输入复杂命令的目标，方便我们减少记忆 markdown 语法
	- 比如输入 “co-” 即会提示callouts 相关的所有自定义好的语法格式，不用在中文输入的时候考虑各切换。
	- 比如输入 "co-tri"、"co-mulit"，可以快速设置多列模式；
2.分词
- 【Word Splitting for Simplified Chinese in Edit Mode】：提供更好的对中文分词的支持；

#### 3.2.3. 目录增强

1、动态目录
这里使用了【Number Headlings】 代替 更多人推荐的  【Dynamic Table of Contents】。
- 为什么要兼容文档内的目录，而不是使用 Obsidian 的大纲侧边栏？主要是为了照顾小尺寸屏幕下，宝贵的屏幕宽度。
- 【Dynamic Table of Contents】无法在实时预览模式下进行渲染，而【Number Headlings】可以。如果你习惯侧面栏的 大纲功能的话，大可不必关心此点。
- 优势：通过【Number Headlings】可以自动为你的标题进行编号
- 缺点：因为利用【Number Headlings】实现了动态目录功能，所以会减少一层目录的使用，即你只能使用【H2】-【H6】

2、目录管理增强
【Quiet Outline】，支持多级目录导行，搜索定位，展开、收起。
![|350](Readme%20image%201.png)
#### 3.2.4. 图片和附件的管理
增强 Obsidian 对插入图片的文件管理和整理能力。

- 自动将复制到文档的图片，保存在与文档同目录的素材库中。【Local images】

- 让文章和插入的图片具有统一的名称，便于后续挪动时候管理。【consistent attachments and links】插件，

- 让文章和插入的图片具有统一的名称，便于后续挪动时候管理。在你放入图片的时候，自动被命名为和你的文档名一致，按照你插入的顺序自动编号。【attachment name formatting】

- 对文章中的图片可以进行旋转缩放，按照插入顺序浏览。【image toolkit】

#### 3.2.5. 分栏样式
- 改善 Obsidian 和 Markdown 流式语法展示的特点，方便需要并行展示多栏目任务。支持笔记的任意复数栏目样式，通过加载多行分列语法 MCL Multi Column.css，如果不需要可以在 “Obsidian -> 设置 -> 外观” 中关闭。
- 这里没有使用很多人推荐的【 multi-column-markdown 】是基于如下考虑：
	- 【 multi-column-markdown 】的语法在源码模式下更复杂，不容易记忆；
	- 【 multi-column-markdown 】的语法完全依赖于插件，而不是CSS 和 markdown 这种近似原生的模式。
	- 此外这个插件还赋予了 callouts 居左或居右对齐的能力，以及不同大小的能力；

#### 3.2.6. callouts
没有使用 【Admonition】插件，反而使用了原生的callouts语法。也符合降低耦合的逻辑。这样大家不用担心插件过多引入的各种问题。

#### 3.2.7. 日期和数字
- 支持自然描述方式插入时间，比如@Today 对应就是插入今天【natural language dates】。实际使用中我没有开启，感觉对我个人的习惯影响不大。
- 支持将日期和时间强化展示样式【 dynamic highlights 】
	- 17:00-19:00 参加生日会
	- 购物买 Gucci 包包给老婆 2021-05-27



#### 3.2.8. 表格

- 【Notion like tables】 这个插件过早的引入到这个库中，实在是因为Notion的表格体（database）体验太优秀了。期望大家

- 【sorttable】可以赋予表格排序的功能；

#### 3.2.9. 标签

- 标签能够依据书写逻辑，进行层级管理展示，基于【tag wrangler】插件

#### 3.2.10. 头图

- 像 Notion 一样为你的每篇文章都可以自定义不同的头图，还有 icon。整个图片可以是来自网络的也可以是来自本地的，【 Banners 】插件。这里做了修改用来应对【Minimal 主题】和 【Banners】更新后导致的 头图高度异常问题。
- 【缺图示】

#### 3.2.11. 更多特殊语法的支持

- 数学公式：如果你有相关论文或者工作的需求，可以打开【 Math plus 】

- 乐谱：如果你有相关论文或者工作的需求，可以打开【 music code blocks】

#### 3.2.12. 标签（tags）
【 tag-word-cloud 】生成一个带有标签嵌套的属性结构，方便你以标签形式进行管理
#### 3.2.13. 进阶管理

- 【Meta Edit】
- 【MetaTable】为每个文档的前面 【frontmatter】区域增加可视化的表格视图，优化你的浏览体验。修改了

- 指定某个文件的阅读模式，比如只读模式，通过【obsidian-view-mode-by-frontmatter】，特别适用于固定积累的知识。

- 像浏览器一样前进后退，或者直接跳转到某个浏览过的文档【pane relief】
### 3.3. 文件的组织和管理

#### 3.3.1. 最近使用的文件
- 直接查看最近使用编辑过的文件，【recent-files-obsidian】

#### 3.3.2. 文件数量管理

- 【File explorer note count】管理文件夹和文件对应的文件数量
- 【Folder Note】为每一个文件夹添加一个markdown文件，该文件默认用卡片视图，来展示该文件夹下所有的笔记；
- 【补充图例】
#### 3.3.3. 目录的快捷管理

- 文档路径显示和快速目录层级切换，通过【quick-explorer】实现，可以类似 windows 的 localbars 进行快速定位和切换目录层级，从而达到切换文档的目的。
- 文件目录折叠 针对左侧的目录树进行快速的折叠。如果不需要 “Obsidian -> 第三方插件 ” 中找到 【collapse all】 进行关闭


#### 3.3.4. 文件历史版本管理
- 支持管理文档的不同版本历史，甚至比对当前版本和之前版本的差异点【obsidian-version-history-diff】
【补充图片】
### 3.4. All in One

#### 3.4.1. 读书笔记沉淀
通过 【BookNote】插件，你可以直接引入多个PDF、MOB的文件目录，做为附件的电子书管理，所有在电子书上做的记录都可以进入到对应文件中，相当于笔记，笔记也反向关联电子书，点击笔记可以回看书中的具体位置。
![|1000](Readme%20image%202.png)
#### 3.4.2. 图书和电影的收集

基于 JS 和 【Buttons】插件执行宏命令，现在你可以通过命令，快速收藏你喜欢的电影和图书从豆瓣到你的库（Vault）

【obsidian-rich-links】
- 修复了大陆网络下请求 ifarmely 频繁报错；
- 优化，增强了针对豆瓣的书籍、电影的收藏时的显示评分；
- 修复了 【Minimal 主题】 和 改插件样式冲突的问题； 


#### 3.4.3. 直接进行搜索
直接在 Obsidian 内完成对某个关键词的搜索，【search-on-internet】



胆汁酸

image toolkit:图片查看增强 [[图片浏览增强（Image Toolkit插件介绍） by 软通达]]

Active note to window title：在状态栏显示标题


Remember cursor position：记住鼠标位置（长文浏览优化）

Kanban：看板功能 [[看板插件（Kanba插件介绍）by 软通达]]

Style Settings：主题修改 [[简易自定义OB主题（Style settings插件介绍） by 软通达]]




excalidraw：无限画布功能 [[Obsidian 插件之 Excalidraw by Bon]]



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

dynamic table of contents：TOC生效

Search on Internet：

### 3.5. plugin:obsidian-banners
1、优化CSS的可读性，之前压缩的完全没有可读性，毕竟我不是研发，没办法看那么习惯

2、banner的宽度无法自适应页面的宽度变化
--banner-height

### 3.6. plugin：table-extended
1、plugin：table-extended
Expermental: Exttended Native Table Syntax
和豆瓣书籍摘要模板冲突，会导致无法渲染bookinfo这样的标注文字（callouts）的语法格式("> []")，在阅读模式（markdown-reading-view）下展示异常。


### 3.7. plugin：强制某些页面可以使用阅读模式展示
这里会列举所有的细节



### 3.8. 样式：
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
@蚕子
@Cuman
@LillianWho
@成雙酱
@嘴上云
@Klaas
@Thinkbond
@Rainbell129(AKA Lavi)
@awyugan
@GeoffreyOuO (WooYoo）


