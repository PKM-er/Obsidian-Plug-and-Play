## 1. v0.2.1

1、插件
- 插件数量：58个（6个插件默认未开启）；
- 插件更新
	- 【Buttons】更新至0.4.18
	- 【Excalidraw】更新至 1.7.25
	- 【Kanban】更新至 1.4.6
	- 【Minimal Theme Settings】更新至 6.0.5
	- 【Pane Relief】更新至 0.4.1
	- 【Quite Outline】更新至 0.3.3
	- 【Various Complements】更新至 7.2.4
- 插件修复
	- 【Various Complements】
		- 【库版本 v0.1.14 引入】修复插件不可用的问题；
		- 【库版本 v0.1.15 引入】修复自定义词典的配置错误，启动后的报错提示源自于此。
2、样式
- 修复
	- 修复：预览视图和编辑视图下，标题（Headings）下面的边框和；
	- 修复：预览视图和编辑视图下，callout 的标题背景色和背景边框；
	- 修复：编辑视图下，插入代码块embed的对齐和宽度问题；
	- 修复：预览视图下，checkbox 和无序列表样式冲突；
	- 修复：chekcbox 样式，更改为“矩形”；
	- 修复：预览视图和编辑视图下，无序列表和有序列表，缩进线（indent line）样式；
	- 修复：预览视图和编辑视图下，无序列表项目符号（marker）样式；
	- 修复：浅色和深色方案下，正文编辑器的背景底色；
3、修复
- 主题代码精简和优化了原来的格式错乱
4、遗留问题
- 【Lapel】插件目前仍然不可用，尝试解决中；

## 2. v0.1.20

1、适配 v1.0.0（Insider 0.16）
	之前引入的所有主题和CSS 的特性基本都已保留，如有报错可以反馈；
2、插件
	对插件进行粗略的兼容性测试，插件开启情况，请参见新的插件说明文档；
3、样式
- Minimal 主题同步更新到 6.x.x 版本；
- 保留了之前库中绝大多数新特性；
- 新特性
	- 增加文件目录树中，目录和文件指向（hover）时的滚动动画；
		- 这个特性和v01.16引入的，文件夹和文件名标题超长后自动截断，存在体验冲突，不喜欢同学可以二选一（注释掉对应的主题文件代码就好）；
	- tab 这个模式比之前的模板更适合多文件协同；
	- and so on；
- 样式优化
	- 优化主编辑窗口的背景色（#FFFFFE）；
	- 优化主编辑窗口，所有插入的图片默认增加黑色边框；
4、修复

P.S. 鉴于v1.0.0 发布不久，可以依据个人情况，继续使用本库的v0.1.19 版本

## 3. v0.1.19

1、插件
- 新插件引入
	- 使用【Editing Toolbar】代替 【cMenu plus】（v0.1.10引入），这两个插件都是 cumany 的作品，在此再次向各位隆重推荐。
		- 支持类似常见文本编辑工具置顶编辑工具栏；
		- 支持工具栏的子菜单模式，如heading下面可以包含（H1-H6）；
		- 支持丰富文字颜色、背景色（马克笔）表格；
		- 支持格式刷，和清除格式刷，所见即所得（WYSIWYG）的体验更好；
		- 能够和其他插件联动，添加命令（比如我增加了【Table Generator】的创建表格）
- 启动速度优化
	- 这不是一个当前版本引入的功能，而是利用 【Templater】插件实现的建议管控加载插件速度，毕竟大家可能都要加载十几甚至几十个插件，那么启动速度自然成了问题。
	- 文件位置，Template 文件夹下
		- 【FastStart-Plugins-ShortDelay】（优先加载的插件名单）
		- 【FastStart-Plugins-LongLongDelay】（次要加载的插件名单）
		- 【FastStart-Plugins-LongDelay】（最后加载的插件名单）
		- 【FastStart-GenerateListOfInstalledPlugins】
		- 【FastStart-StartupScript】（控制几个加载过程的延迟毫秒数）
	- 优点：加载名单里面只需要填写插件，对应电脑中的目录名称即可，很方便，无需去看代码或者找准代码位置；
	- 缺点：此方法强依赖 【Templater】插件，所以这个插件默认需要加载的，不能设置任何延迟逻辑
- 插件精简
	- 【cMenu plus】被精简；
- 插件更新
	- 【DataView】更新至 0.5.47；
	- 【Table Generator】更新至 1.3.1；
	- 【Table Enhancer】更新至 0.2.2；
	- 【Enhanced editing】更新至 0.5.5；
2、样式
- 样式优化
	- 针对table 进行标题栏的样式优化，增加下边框做区分；
	- 针对table 中指向时间，做了行浮起颜色的优化；
	- 针对 【Editing Toolbar】
		- 优化工具icon指向（hover）的样式
		- 插件在独立窗口模式下的子菜单高度问题
		- 插件设置菜单的指向样式
3、修复
- 修复0.1.18因为修复样式问题导致的主题代码冗余；
- 修复【metatable】【banner】以及独立窗口模式之间的高度兼容问题；

P.S. 鉴于v0.16 仍然未发布，本库依然会围绕 0.15 的版本进行，相信正式版释放后，还有大量适配工作需要进行

## 4. v0.1.18

1、插件
- 新插件引入
	- 使用 【Table Enhancer】、【Table Generator】插件，代替了原来的 table 相关插件，进而引入了新特性。
		- 直接在预览模式下进行单元格编辑不用模式切换；
		- 支持动态行列增删按钮；
		- 支持可视化的表格大小创建；
- 插件版本更新
	- 【Attachment Name Formatting】插件更新至 1.4.5
	- 【Buttons】插件更新至 0.4.17
	- 【Excalidraw】插件更新至 1.7.23
	- 【Kanban】插件更新至 1.4.5
	- 【Metatable】  插件更新至 0.14.2
	- 【Obsidian Math+】插件更新至 0.4.2
	- 【Pandoc Plugin】 插件更新至 0.4.1
	- 【Pane Relief】插件更新至 0.4.0
	- 【Quick Explore】 插件更新至 0.2.2
	- 【Task】插件更新至 1.15.1
	- 【Templater】插件更新至 1.14.3
- 插件精简
	- 【supercharged-links-obsidian】精简删除
2、样式优化
- 插件
	- 【task progress bar】的样式优化正式和插件自身更新解耦；
	- 【task progress bar】进度条长度优化；
	- 【pane-relief】优化历史计数器样式；
	- 【cMenu plus】优化符合主题的颜色指向hover样式；
- 常规样式
	- 优化文件目录树markdown文件之外的文件类型，显示文件类型前缀；
	- 优化设置菜单，左侧导行item 的左边框染色；
	- 优化文件目录树的展开收起箭头位置；
	- 优化文件目录树，文件获得焦点的效果；
	- 优化文件目录树，目录获得hover后的效果；
	- 左侧Ribbon 区，收起展开按钮位置；
	- 左侧Ribbon 区，设置工具按钮的位；
3、修复
- 样式修复
	- 修复之前 0.1.16 引入的 在 正文标题【headings】优化间距后，导致【Lapel】插件的快捷调整大纲按钮位置失效；
	- 修复之前 0.1.17 引入的 优化 窗体文件标题栏【titlebar】边框线，引入的界面错位；
	- 修复之前 0.1.17 引入的 文件标题栏【view header】边框线，引入的界面错位；

P.S. 鉴于v0.16 仍然未发布，本库依然会围绕 0.15 的版本进行，相信正式版释放后，还有大量适配工作需要进行

## 5. v0.1.17
1、New shinying things
原有的无序列表（ul）无论多少层级都在使用单纯 圆点 做为前缀（marker），多层级下辨识度不高。
现在替换如下
- 第一级（圆点）【circle inside】
	- 第二级（空心圆）【circle 】
		- 第三级（方块）【suqre inside】
			- 第四级（空心方框）【suqre】
				- 第五级（菱形）【diamond】
2、插件
	更新插件
		【Emoji Toolbar】 更新版本
		【Kanban】更新版本
		【Omnisearch】更新版本
		【Task Progress Bar】更新版本
		【Style Settings】更新版本
3、样式优化
	优化设置菜单中按钮指向后的颜色；
	优化设置菜单中内容设置项的分割线；
	工具图标的hover样式；
	文件目录中文件和文件夹的不同缩进样式优化；
	文件目录导航中文件夹支持导行超出后截断显示；
	文件名下方的边框线优化；
P.S. 鉴于v0.16 仍然未发布，本库依然会围绕 0.15 的版本进行，相信正式版释放后，还有大量适配工作需要进行

## 6. v0.1.16
- 插件精简
	- 删除 【folder note】 插件从专注笔记角度讲，这个插件的管理意义不如 使用dataview 生成的页面，自定义程度更高，有需要的同学可以参考库中的示例。
	- 删除【get info】插件，实际上有很多插件和obsidian 本身功能可以代替。
	- 删除 【Linter】插件；
	- 删除【markdown-table-editor】插件；
	- 删除【supercharged links】插件；
- 插件新增
	- 【obsidian reminder】为task 和 todo 增加时间提醒，尤其是 Window 平台用户，可以通过打开 notification 开关获得本地系统通知；
	- 【custom frames】可以将常用工具，不再以iframe 方式插入页面，而是使用独立的窗口工具
- 代码整合
	- metaedit 和banners 的相关改动代码，现在已经移入到了主题文件中，正式和插件更新解耦。
- 修复样式
	-  修复dataview Cards 视图下，图片和grid 错位问题
- 新样式：
	- 主要是为了适配PC，界面更加素雅，icon更大，圆角弧度进一步减小；以下这些并没有完全整合到 【theme setting】这样插件中，大家见谅
		- 部分整合 设置（settings）菜单 的样式控制
		- 部分整合 编辑视图和正文控制 的样式控制
		- 部分整合 titlebar 的样式控制
		- 部分整合 左侧导行栏Ribbon 的样式控制
		-  部分整合 导航栏 的样式控制
P.S. 鉴于v0.16 仍然未发布，本库依然会围绕 0.15 的版本进行，相信正式版释放后，还有大量适配工作需要进行

## 7. 0.1.15
- 样式优化
	-   优化目录树的文件夹样式
	-   优化目录树的展开收起箭头
	-   左侧导航栏，顶部导行样式调整
	-   为目录树添加点击文件后条目颜色后缀，和控制点击后的颜色

## 8. v0.1.14
- 代码整合
	- metaedit 和banners 的相关改动代码，现在已经移入到了主题文件中，正式和插件更新解耦。
- 修复样式
	-  修复dataview Cards 视图下，图片和grid 错位问题
- 新样式：
	- 给bookinfo 模式的表格增加指向（hover）的动画
	- dataview Cards 视图下，增加指向（hover）的动画
	- 优化tooltip的样式

## 9. v0.1.13
- 修复在没有 banner icon下metatable 的布局（页面的相对高度）异常
	- banner 插件在不添加 banner icon 的情况下，会和 metatable 插件的高度冲突。之前解决方案是的页面都添加了 banner icon。现在不需要了
## 10. v0.1.12
-   修复Demo 示例变化  
    因为 dataview插件升级到 5.3及以上版本后，导致的语法变化

## 11. v0.1.11

在0.1.10 的基础上修复了部分Demo 示例错误

## 12. v0.1.10
1.  更新 cmenu 到 cmenu plus 感谢 cuman 大大的优质代码

-   插件版本更新
-   插件支持彩色icon（标题和彩色文字，和背景色）
-   修复在某种情况，following模式和置顶（TOP）模式，下不同宽度的适配问题

2.  修复部分情况下，dataview table 在Cards 视图下的一场

P.S. 鉴于Obsidian V0.16 是一个交代版本的更新，所以目前所有的分支还都是基于V0.1.5。等到0.16 稳定后才会释放出来
## 13. v0.1.9

修复之前一些错误配置，和之前一些datajson 文件忘记同步的问题
## 14. v0.1.8
1. 修复
	- 修复插件【various-complements】中 data.json 中配置自定义词典的错误，之前历史版本中该配置指向了错误的相对路径
2. 新增插件 quick latex
	- 为了经常使用 latex 的同学
3. 精简插件
	- 删除markmind 插件，对于pdf文档来说，使用了booknote插件进行代替。之前的版本中已经集成【bookonte】插件
	
## 15. V0.1.7
1. 精简插件
	- 因为 v0.15.6 后支持了新窗口特性，所以 【hover editor】显得在多窗口和小屏幕下有些冗余了，故移除；
	- 偏小众诉求【obsidian-code-block-enhancer】
1. 更新插件
	- 【obsidian-collapse-all-plugin】更新插件目录结构
	- 更新插件 【obsidian-task-progress-bar】 至 1.5.1
2. 兼容性：无
3. 样式优化
	- 增加 checkbox 的复选框大小（--checkbox-size），减少和折叠块之间的误触
	- 【obsidian-task-progress-bar】
		- 增加 进度条的边框（border），优化任务进度的展示样式；
		- 优化进度条宽度（width），优化任务进度的展示样式；
5. 启动速度
	- 优化启动加载插件的顺序
6. 模板
	- 更新 tp-book-callout 
	- 更新 tp-movie-douban
	- 更新 moviefromdouban.js
		- 更新了，增加了关于国家和内容的抓取兼容性
7. 新特性
	- 暂无 TBA

## 16. v0.1.6
1.  目录结构修改

-   感谢 [@oldwinter](https://github.com/oldwinter) 的反馈，之前有一个目录命名的疏漏

2.  插件版本更新

-   更新插件 【obsidian-task-progress-bar】 至 1.5.0
-   更新插件 【various-complements】 至 7.0.6
-   更新插件 【tag-wrangler】 至 0.5.3
-   更新插件 【quick-explorer】 至 0.1.32
-   更新插件 【pane-relief】 至 0.2.1
-   更新插件 【recent-files-obsidian】 至 1.3.3
-   更新插件 【obsidian-tasks-plugin】 至 1.9.0
-   更新插件 【dataview】 至0.5.41
-   更新插件 【number-headings-obsidian】 至1.9.0
-   更新插件 【obsidian-quiet-outline】 至0.3.2
-   更新插件 【oz-image-plugin】 至 2.1.3

## 17. v0.1.5
修复：  
-因为更新15.0后，引入新特性，在新窗口下，【banners】插件的显示异常  
优化：  
-精简插件 【better-word-count】  
-精简插件 【cm-show-whitespace-obsidian】

## 18. v0.1.4
1.  Dataview 更新至5.3.8
-   修复：dataview升级后，dataviewjs 查询引发的按钮（buttonmaker）样式错乱  
    2.Lapel：
-   增加标题等级选择块的样式

3.  引入：下列插件

-   dbfolder：建立文件夹中类似Notion的管理目录，不需要可删除，目前未和任何其他功能和示例联动
-   obsidian-diagrams-net：旨在增强快速画图，和不习惯 Excalidraw 的同学；不需要可删除，目前未和任何其他功能和示例联动
-   obsidian-task-progress-bar：为你任务列表、bullet list 添加进度条；目前效能和稳定性较差，持续观察。

4.  样式

-   增强：编辑视图下列表连接线颜色和位置
-   增强：编辑代码块按钮调整

## 19. V0.1.2
闪亮的新东西：  
- 增加了纵向排版文字的callouts 能力

优化：
-   优化区块编辑按钮样

## 20. v0.1.1

修复:读书笔记实例中笔记摘抄的不显示图片问题


## 21. v0.1.0

v0.1.0Beta 试用版本
