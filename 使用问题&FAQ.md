## 1. 样式
### 1.1. 无序列表
- Obsidian 原生的无序列表（ul）无论层级多寡，都使用单一的圆点（●） 做为前缀（marker），多层级下辨识度不高，所以提供自定义模式。
- 路径：theme settings > minmal > 无序列表前缀（填写前缀符号，需要将符号放入''内才可生效）；
默认配置如下：（git上或者没有集成此插件，可能无法看到下面效果）
- 第一级（圆点）【circle inside】
	- 第二级（空心圆）【circle】
		- 第三级（方块）【suqre inside】
			- 第四级（空心方框）【suqre】
				- 第五级（菱形）【diamond】
- 实现方式： #CSS
### 1.2. 调整导行窗格布局时间发生错乱
- 操作：在 Minimal theme settings 中 打开如下开关
	Text labels for primary navigation
	Navigation in left sidebar uses text labels(see documentation for localization support)
- 现象：导航栏布局产生变化

![](素材库/使用问题&FAQ_image_1.png)
- 解决：本库已经进行了修改；
- 版本：**库版本v0.2.8**
- 修复方式： #CSS #JavaScript
## 2. 插件使用中遇到的问题
### 2.1. Bookonte插件文件列表文件类型标签前置
- 原因：这是booknote 现在版本渲染顺序导致的，原作者是如此设计的。
- 解决：本库已经进行了修改；
- 版本：**库版本v0.2.8**
- 修复方式： #CSS #JavaScript
### 2.2. 表格中的内链点击不响应点击（或点击后没有跳转）
- 如果是 【dataview】插件 生成的表格正常，而其他正文类表格异常，那么可能是 **【table enhancer】** 插件导致。在原作者没有修复前，你可以使用 **ctrl键** +鼠标，调起页面预览并在页面预览上点击 🔗 按钮；
### 2.3. 无法渲染 callouts 和 >[]
- 【table-extended】
	中Expermental: Exttended Native Table Syntax
	和豆瓣书籍摘要模板冲突，会导致无法渲染bookinfo这样的标注文字（callouts）的语法格式("> []")，在阅读模式（markdown-reading-view）下展示异常。
- **如果你遇到此问题，可参照上面；**	

### 2.4. 添加头图（banner）后，文档上多了很多空白
- 原因：【Banners】插件
- 现象： banners插件停止维护更新已经很久了
	- 对于 Obsidian 新引入的 独立窗口（pop window）
	- 以及其他经常组合的插件（metatable）等支持不是很友好。
- 解决：本库已经进行了修改；
- 版本：**库版本v0.1.8-v0.2.7**
- 修复方式： #CSS #JavaScript

### 2.5. 希望文件历史对比更细致
推荐：【Version History Diff (for Sync and File Recovery Core plugins and Git】
- 🎖️功能：图形化界面更优化，相比 Obsidian 原生；
- 依赖：Obsidian 核心插件中的【历史快照】，如果未开启，则此插件无效；

### 2.6. 需要快速检查自己那些文本没有关联到自己的库中文章
推荐：【Sidekick】【本库已经继承】
- 🎖️功能：
	- 基于文本针对现在库（vault）中文件名，tag等进行匹配，通过高亮方式给出串联的建议；很适合你在做自己的类似 wiki 或者笔记串联；
	- 支持中文，支持数字和日期的联想；
	- 该功能和 var comp 插件，和obsidian 自带的提示（suggest）近似，更适合对历史文件进行批量处理的场景下；
- 🙁遗憾：
	- 不支持自定义开关不同类型的建议，比如数字、文字是否分别控制；
	- 与【Dynamic Highlights】插件的时钟配置冲突
	- 不支持高亮提示样式的自定义