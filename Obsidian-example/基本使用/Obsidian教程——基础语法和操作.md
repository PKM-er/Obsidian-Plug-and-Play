


## 1. Markdown 语法

-   **提示1：** 本教程推荐使用 **Obsidian** 打开阅读
-   **提示2：** 下文提到的所有标识符都是 **英文状态** 的 **！**
  
### 1.1. 引用

-   **引用 的格式：**
-   **>** + 文本内容 （**不需要空格**)
-   **说明：**
-   **同个引用段落**内的换行直接敲击 **Enter** 即可
-   若需添加 **第二个独立引用段落** ，连续敲击 **两下****Enter** 即可

```text
>这是第一段引用文本的第1行 <!-- (Enter) -->
>这是第一段引用文本的第2行 <!-- (Enter) -->
<!-- (Enter) -->
>这是第二段引用文本的第1行 <!-- (Enter) -->
>这是第二段引用文本内第2行
```

### 1.2. 示范

> 这是第一段引用文本的第1行 这是第一段引用文本的第2行  
> 这是第二段引用文本的第1行 这是第二段引用文本的第2行  

  
### 1.3. 缩进&退格

**在列表和引用的书写过程中，我们需要利用 ==缩进== 与 ==退格== ，让文章肌理分明，更具层级**

-   **缩进：**
-   **Tab**
-   **Ctrl** + **[** (左中括号)  
    
-   **退格：**  
    
-   **Shift** + **Tab**
-   **Ctrl** + **]** （右中括号）


### 1.4. 有序列表的缩&退

```text
1. 第一级有序列表1 <!-- (Enter) -->
    1. 第二级有序列表1    <!-- 写文本之前，先( Tab 或 Ctrl + ] ) ；写完文本后，再(Enter) -->
    2. 第二级有序列表2 <!-- (Enter) -->
2. 第一级有序列表2    <!-- 写文本前，先 ( Shift + Tab 或 Ctrl + [ ) -->
```

-   **补充说明：**
-   有序列表的**数字序号**，即便你在源代码模式里 强行改掉 数字，它仍然会 **依照顺序** 显示

### 1.5. 示范

1.  第一级有序列表1
	1.  第二级有序列表1
	2.  第二级有序列表2
2.  第一级有序列表2

### 1.6. 无序列表的缩&退

```text
- 第一级无序列表1 <!-- (Enter) -->
    - 第二级无序列表1  <!-- 写文本前，先( Tab 或 Ctrl + ] ) ；写完后，再(Enter) -->
    - 第二级无序列表2 <!-- (Enter) -->
- 第一级无序列表2  <!-- 写文本前，先 ( Shift + Tab 或 Ctrl + [ ) -->
```

### 1.7. 示范

-   第一级无序列表1
	-   第二级无序列表1
	-   第二级无序列表2
-   第一级无序列表2

### 1.8. 引用的缩&退

-   引用的 **缩进** 和列表 **不同**
-   引用需另起一行，并额外多打一个 > 来完成 **缩进**
-   引用的 **退格** 与列表 **相同**
-   **Shift** + **Tab**
-   **Ctrl** + **]** （右中括号）

```text
>第一级引用1 <!-- (enter) -->
>>第二级引用1 <!-- 先打1个 > (这里的第一个 > 是会自动补充的，只需额外增补1个即可) ，再(enter) -->
>>第二级引用2 <!-- (enter) -->
>第一级引用2   <!-- 写文本前，先 ( Shift + Tab 或 Ctrl + [ ) -->
```

### 1.9. 示范

> 第一级引用1  
> 第二级引用1 第二级引用2  
>   
> 第一级引用2  

  

-   **补充：** 在 **Obsidian** 中，引用的退格是不太一样的
-   **Obsidian** 中，如果想让已经缩进的引用 **退回一层**

-   得使用 **`Shift`** + **`Enter`** ，配合方向键，在多个 **`>`** 之间灵活断行 并在下一行 根据需要 选择性补充 **`>`**

  

-   这个用文字比较难以描述，这里选择用2个带键位的 **Gif图** 来描述

**Gif演示1：**
 

![800](https://pic1.zhimg.com/v2-c26fca8583b95d2911e505ac6caf48e8_b.gif)

-   **效果1：**

>111
>>222
>>>333
>   
> >>444  
>   
> >555  

**Gif演示2：**  

![800](https://pic3.zhimg.com/v2-0502fe54191ee7c107623dfe2d20ff76_b.gif)

-   **效果2：**

> 111  
> 222  
> 333  
>   
> 444  
> 555  
>   
> 666  
>   
> 777  

  

### 1.10. 有序&无序&引用 连续套娃

-   **有序列表**、**无序列表**、**引用** 三者之间，可以相互嵌套
-   **核心键** ： **Shift** + **Enter****&****Enter****&****Shift** + **Tab** ( 或 **Ctrl** + **[** )
-   **Shift** + **Enter** 在切换格式的嵌套中，是 自带一层 **缩进** 效果的

```text
1. 第一级 有序列表1 <!-- (Shift + Enter) --> 
    - 第二级 无序列表1 <!-- (Shift + Enter) -->
        >第三级 引用1  <!-- (Enter) -->
            - 第四级 无序列表2 <!-- (Shift + Enter) -->
                1. 第五级 有序列表2 <!-- (Enter) -->
            - 第四级 无序列表3   <!-- 写文本前，先( Shift + Tab 或 Ctrl + [ ) ；写完后再 (Enter) -->
        >第三级 引用2  <!-- 写文本前，先( Shift + Tab 或 Ctrl + [ ) ；写完后再 (Enter × 2) -->
    - 第二级 无序列表4  <!-- 写文本前，先( Shift + Tab 或 Ctrl + [ ) -->
2. 第一级 有序列表3  <!-- 写文本前，先( Shift + Tab 或 Ctrl + [ ) -->
```

### 1.11. 示范

1.  第一级 有序列表1  
    
	1.  第二级 无序列表1  
		    第三级 引用1  
    

-   第四级 无序列表2
-   第五级 有序列表2
-   第四级 无序列表3

第三级 引用2  
  

1.  第二级 无序列表4  
    
2.  第一级 有序列表3  
    

### 1.12. Obsidian 的一些缩退问题

-   **Obsidian** 在列表首行使用缩进的时候，后续的列表会出现一些问题

-   `Tab` 和 `Shift + tab` 会无法 缩进 退格

-   可以使用 `Ctrl + ]` 与 `Ctrl + [` 来解决问题

```text
- - 这是第一段就被缩进的列表
    - 这是第二段被再次缩进的列表  <!-- 这里需按两次 Ctrl + ] ,Tab键是无效的 -->
  - 这是第三段列表  <!-- Ctrl + [ -->
```

-   这是第一段就被缩进的列表 - 这是第二段被再次缩进的列表
-   这是第三段列表

  

## 2. 网页链接与图像
### 2.1. 网页链接

-   **网页链接的 格式：**
-   **[** + 显示文本内容 + **]** + **(** + 链接地址 + **空格** + **"** + 提示信息文本 + **"** + **)**
-   **说明：**
-   显示文本内容，是在渲染界面实际 **可见** 的文本，用以 **说明** 链接
-   提示信息文本，需鼠标悬停于 **显示文本内容** 方可触发，用于增加额外提示信息

-   注意 **`"提示信息文本"`** 是**可选项**，一般不会填  
    
-   一般来讲，需按住 **Ctrl** + **`鼠标左键点击`** 才可跳转链接，不过也有 **直接鼠标点击** 就能跳转的

```text
[显示文本内容](链接地址 "提示信息文本")

[百度一下，你就知道](http://www.baidu.com "按住Ctrl点击跳转百度")
```

**示范：**

[百度一下，你就知道](https://link.zhihu.com/?target=http%3A//www.baidu.com/)

### 2.2. 5.1.1链接的加粗

-   **格式有两种：**

1.  把一对 ** 加在 ==显示文本内容==的首尾

-   **格式1：**`[**显示文本内容**](链接地址)`
-   **效果：****[百度一下，你就知道](https://link.zhihu.com/?target=http%3A//www.baidu.com/)**

1.  把一对 ** 加在 链接格式==整体== 的首尾

-   **格式2：**`**[显示文本内容](链接地址)**`
-   **效果：** **[百度一下，你就知道](https://link.zhihu.com/?target=http%3A//www.baidu.com/)**

### 2.3. 图像

-   **图像格式：**
-   图像格式，就是在网页链接前面加个 **!** (英文格式的)，**`!`** 代表 **可见**
-   图片的提示信息，和网页链接一样，写在 **`" "`** 内
-   **`[ ]`** 方括号里的文字信息在 **Markdown** 没啥实质的作用，只是方便在源代码模式下，知道这个图片是什么，在渲染界面是不会显示的。有点类似于HTML **img标签** 里的 **alt属性**。

```text
![文字信息](图片链接 "提示文本信息")  

![湘湖1](https://z3.ax1x.com/2021/08/06/fuNkXq.jpg "湘湖一角")
```

-   **补充：**  
    
-   图像链接可以是**本地**的，也可以是**在线**的  
    

-   本地图像直接 **`Ctrl + C`** 黏贴，**`Ctrl + V`** 复制 就可以
-   在线图像推荐使用 [图床](https://link.zhihu.com/?target=https%3A//imgtu.com/)

  

-   调整图像的大小需要使用 HTML 和 CSS，在 **Typora编辑器** 中右键可以直接缩放图片 本质是转成了HTML的格式，最后会有一个 `style="zoom: %;"` ，这里数值可以自己修改
-   如果有使用 **Obsidian** 的朋友，在线图片链接是通用的。不过，因为 **Obsidian** 是双向链笔记 它的**本地图片**格式不太一样

-   **`![[图片名]]`**
-   **Obsidian** 中的图片是以**双链**的格式引用在目标笔记中，用 **!** 使它可见
-   **Obsidian**的图片设置大小是用 **|** 分隔，后面写宽度数值，单位是px。 设定好宽度，高度会自动**等比例调整**

-   `![[图片名|宽度数值]]` - 若想自主调整图片宽高，则用： - `![[图片名|宽度数值x高度数值]]` - #提示 这里的 `x` 是 英文字母**x**

-   如果是**在线图床**，需要调整图片大小：

-   `![图床|宽度数值](链接地址)`

### 2.4. 示范

![800](https://pic1.zhimg.com/v2-f2a92bda6fc21152e4ec4e5c80b174bc_b.jpg)

  

  



  


  

## 3. 任务列表（待办）

-   **任务列表 的格式：**
-   **-** + **空格** +**`[ ]`** +**空格** + 任务列表内容 ( 中括号`[ ]` 里面必须有个空格)
-   给待办任务列表打 **`√`** ，变成 **已办**

1.  在渲染界面，直接鼠标左键点击框框
2.  在源代码界面，在中括号内输入 **英文字母x**
3.  部分编辑器，在 中括号内 输入**任意字符**都可以打 **`√`** ( 例如 **Obsidian** )

-   **补充：**
-   大部分 MD编辑器 支持输入第一个任务列表后，按下 **Enter** 进入下一行会 **自动补全待办格式**
-   在**Obsidian**中，连续输入**两次**`Ctrl + Enter` ，即可生成一个待办列表  
    

-   再输入一次 `Ctrl + Enter` ，会在待办列表 打 `**√**`

  

-   **格式：**  
    

```text
- [ ] 待办任务列表1
- [ ] 待办任务列表2
- [x] 已办任务列表1    <!-- 英文字母X -->
- [x] 已办任务列表2
```

### 3.1. 示范

- [ ] 待办任务列表1
- [ ] 待办任务列表2
- [x] 已办任务列表1
- [x] 已办任务列表2
- [>] hold任务列表1
- [?] 疑问任务列表1
- [!] 惊醒任务列表1


-   在 **Obsidian** 中，可以利用 **Ctrl** + **Enter** ，快速生成任务列表

1.  **`-`** + **空格** + **Ctrl** + **Enter** +待办文本内容
2.  待办文本内容 + **Ctrl** + **Enter****×2** ( 输入文本后，连续2次 `Ctrl + enter` )


-   **任务列表也是可以缩进+退格的，操作跟 无序、有序列表一样**

  

## 4. 注释

**Markdown** 的 **注释** 和 **HMTL** 一样，注释的内容在 **渲染界面** **不可见** （部分编辑器可见)

-   **注释 的格式：**
-   `<!-- 这里是注释的内容 -->`

-   注释可以是单行，也可以是多行

  

-   如果有在使用 **Obsidian** 的，它的注释格式是不一样的

-   **`%%这是Obsidian的注释内容%%`**

```text
<!-- 这里是一行注释 -->

<!--
这里是
一段
假装有
很多行的
注释
-->

%%这是一行Obsidian里的注释%%

%%
这里是
一段
假装有
很多行的
Obsidian里的
注释
%%
```

### 4.1. 示范 (只有切换至 编辑模式 才能看到喔)

%%这是一行Obsidian里的注释%%

%% 这里是 一段 假装有 很多行的 Obsidian里的 注释 %%

  
## 5. 变量

  

### 5.1. 网页链接变量

-   **网页链接变量 的格式：**
-   首先输入

-   **`[显示文本内容]`** + **`[变量名]`**
-   变量名可以自己取，没啥限制，任意字符都可以

  

-   在文档任意一个区域，输入：

-   **`[变量名]`** + **:** + **空格** + 链接地址 （这个**空格** 不打也没事)

```text
[百度一下，你就知道][度娘]
[知乎-有问题，就会有答案][知乎]

<!-- 这里是变量区域 -->
[度娘]: http://www.baidu.com 
[知乎]: https://www.zhihu.com
```

### 5.2. 示范

[百度一下，你就知道](https://link.zhihu.com/?target=http%3A//www.baidu.com/)

[知乎-有问题，就会有答案](https://www.zhihu.com/)

  

### 5.3. 脚注

-   **脚注 的格式：**
-   在需要脚注的地方，输入：

-   **`[^脚注代号]`** ( 脚注代号会直接显示在渲染界面 )
-   脚注代号可以随便命名，不过推荐使用 **数字序号**

  

-   在其他区域，输入：

-   **`[^脚注代号]`** + **:** + **空格** + 脚注内容 （这个 **空格** 不打也没事)

```text
鲁迅原名是什么[^1] ，浙江哪里人[^2]

<!-- 这里是变量区域 -->
[^1]: 周树人
[^2]: 绍兴人
```

### 5.4. 示范

鲁迅原名是什么[^1](https://zhuanlan.zhihu.com/%E5%91%A8%E6%A0%91%E4%BA%BA)，浙江哪里人[^2](https://zhuanlan.zhihu.com/%E7%BB%8D%E5%85%B4%E4%BA%BA)

  

## 6. 拓展文本格式标记

-   **Markdown** 想实现更多的文本显示效果，只能依赖HTML标记实现
-   个人**不是很推荐**在 MD 中使用 HTML，不过一些简单的标记还是可以 **轻度使用** 的

  
### 6.1. 键盘文本

-   **键盘文本的 格式：**
-   **`<kbd>键盘文本</kbd>`**
-   **`<kbd>Ctrl</kbd> + <kbd>X</kbd>`**  
    
-   **效果：**  
    
-   **键盘文本**
-   **Ctrl** + **X** ( 剪切 )  
    
-   **说明：**  
    
-   键盘文本也不一定非得是键盘按键，也可以作为**着重文本**突出显示  
    

-   **效果：** 这也算一种着重文本的方式

### 6.2. 加粗键盘文本

-   **加粗**键盘文本的格式有**两种**：  
    

-   `<kbd>**键盘文本**</kbd>`
-   `**<kbd>ctrl + x</kbd>**`

  

-   **效果：**  
    

1.  **键盘文本**
2.  **ctrl + x**
  

## 7. 拓展文本显示效果

-   拓展显示效果既不是原生 **Markdown语法** 支持的，也非 HTML标记，而是部分编辑器 提供的 **额外标识符**，属于拓展语法，旨在为 **Markdown使用者** 提供更多样式选择
-   不同编辑器，支持不一样，这里以 **Typora编辑器** 为例

  

### 7.1. 文本高亮

-   **文本高亮 的格式：**
-   **`==这里是一段高亮文本==`**
-   **效果：**
-   ==这里是一段高亮文本==

  

### 7.2. 上标

-   用一对 **^** 包裹 (**Shift+ 6**)
-   **格式：****`x^2^`**
-   **效果：** x^2^
-   **Obsidian** 没效果的，可以用后面会讲的 **Latex**
-   或者，也可以使用 **HTML标记**

-   `<sup>这里是上标内容</sup>`
-   `X<sup>2</sup>`

  

-   **效果：**

-   **X2**

  

### 7.3. 下标

-   用一对 **~** 包裹 (**Shift + `**)
-   **格式：****`H~2~O`**
-   **效果：** H~2~O
-   **Obsidian** 没效果的，可以用后面会讲的 **Latex**
-   或者，也可以使用 **HTML标记**

-   `<sub>这里是下标内容</sub>`
-   `H<sub>2</sub>O`

  

-   **效果：**

-   **H2O**

  

### 7.4. Emoji 符号

用一对 : 包裹，里面是 **Emoji** 符号的 **语义化文本** ( **Typora编辑器** 中，输入 `:` 就会带提示器 )

-   **示例：**

-   `:smile:``:sweat:``:cat:``:woman_cartwheeling:`

  

-   **效果：**

-   :smile: :sweat: :cat: :woman_cartwheeling:

  

-   **补充：**

-   不支持上述方式的 MD编辑器或笔记软件，直接用 **输入法** 输入也是可以的
-   **Windows系统** 用户 **win + .** 就可以输入 Emoji 了
-   **Obsidian** 用户可以安装**第三方插件**来支持 **Emoji** 的输入，推荐两个

1.  ==Emoji Shortcodes==
2.  ==Emoji Toolbar==

  

## 8. 转义字符

-   在 **Markdown** 中，我们 通过 **标识符** 改变 **文本显示效果**
-   现在我们希望它不作为标识符，而是 **作为字符本身呈现出来** （不具备改变文本显示效果的功能，只是一个**普通字符**)
-   首先我们可以用前面介绍的 **代码域** ，因为代码模式的显示效果就是源代码**完全一致**的
-   还有一种方法，可以利用转义字符，在这些标识符 **前面** 加上 **反斜线****\** ( 反斜线要紧贴在标识符前面，**不能** 有 **空格** )

-   **原理：**
-   **`\`** 的作用是让标识符 **转义** 变为一个**普通字符**，完成这个效果后，反斜线会**自动隐藏**
-   隐藏后的反斜线仅在**源代码**界面**可见**，在**渲染**界面**不可见**
-   反斜线只**争对标识符**起作用，其他字符添加 **`\`**，**`\`** 不会自动隐藏
-   **补充：**
-   如果想给已经被加在标识符前面，会自动隐藏的 **`\`** 显示出来，可以在反斜线前面再加一个 **\** ，用它**自己来转义自己**

-   **示例：****`这里紧跟在标识符前面的反斜线\\*会被转义成普通字符显示出来，不会自动隐藏，且这段文件会是斜体*`**
-   **效果：** 这里紧跟在标识符前面的 反斜线\_会被转义成普通字符显示出来，不会自动隐藏，且这段文件会是斜体_

  

### 8.1. 例1 以普通字符显示星号

-   如何让被一对或多对 **`*`** 号 包裹的文本内容，能够正常显示 **`*`** ，且文本不改变格式

-   `\*这段文本被一对星号包裹，但不会倾斜\*`
-   **效果：** *这段文本被1对星号包裹，但不会倾斜*
-   `\*\*这段文本被2对星号包裹，但不会加粗\*\*`
-   **效果：** **这段文本被2对星号包裹，但不会加粗**
-   `\*\*\*这段文本被3对星号包裹，但它既不倾斜也不加粗\*\*\*`
-   **效果：** ***这段文本被3对星号包裹，但它既不倾斜也不加粗***

  

### 8.2. 例2 表格内 单元格中的竖杠

-   在表格中，使用 **|** 作为单元格的内容，但**不会**被识别为**表格的结构**，不会增加额外的单元格

```text
|表头1|表头2|
|-|-|
|这里的文本被\|分隔|这里的文本也被\|分隔|
```

-   **效果：**

| 表头1 | 表头2 | |:------------------:|:--------------------:| | 这里的文本被\|分隔 | 这里的文本也被\|分隔 |

  

## 9. 补充 该技巧可用于 **Obsidian** 表格内 双链的文本修饰

**文本修饰：**

在 双链`[[ ]]`内 以 `|` 引导的内容 - **格式：** `[[链接的内容|文本修饰]]` - **说明：** 文本修饰是渲染界面实际显示的文本，便于更好地融入语境

**表格内的格式：**

在 `|` 前面加上 `\` - `[[表格内的链接内容\|文本修饰]]`

**示例：**

```text
|                  表头1                  |                        表头2                        |
|:---------------------------------------:|:---------------------------------------------------:|
| [[#例2 表格内 单元格中的竖杠\|单元格中的竖杠]] | [[#例3 不会变成代码的反引号\|不会变成代码的反引号]] |
```

**效果：**

| 表头1 | 表头2 | |:---------------------------------------:|:---------------------------------------------------:| | [[#例2 表格内 单元格中的竖杠\|单元格中的竖杠]] | [[#例3 不会变成代码的反引号\|不会变成代码的反引号]] |

  

### 9.1. 例3 不会变成代码的反引号

使用 转义符号`\` 让 反引号`` ` `` 变成普通字符，不再具有[[#7 1 行内代码|行内代码]]的标识符功能

**格式：**

`` \`这段被反引号包裹的内容不会变成行内代码\` ``

**效果：**

`这段被反引号包裹的内容不会变成行内代码`

  

### 9.2. 例4 链接中的中括号

在 **网页链接** 的 **显示文本内容** 中，使用 **中括号** **`[ ]`**

-   在显示文本内容中，在其中一个中括号前面，加上**转义符号** 反斜杠 **\**
-   **格式：****`[链接里的 \[中括号\] 能被正常显示](https://www.runoob.com)`**
-   **效果：**[链接里的 [中括号] 能被正常显示](https://link.zhihu.com/?target=https%3A//www.runoob.com/)

  

### 9.3. 例5 不是列表的连接符(横杠)

-   引用一段话，一般会在换行之后，加上 **`- 出处`**
-   因为 **-** 是标识符，会变成一个无序列表

**如下所示：**

> The Web, the Tree, and the String. 写作之难，在于把网状的思考，用树状结构，体现在线性展开的语句里。 - 史蒂芬·平克  

-   **解决方法：**
-   在 **-** 前面加上 转义符号 **\**

```md

> The Web, the Tree, and the String. 写作之难，在于把网状的思考，用树状结构，体现在线性展开的语句里。 - 史蒂芬·平克 ```  

-   **效果：**

> The Web, the Tree, and the String. 写作之难，在于把网状的思考，用树状结构，体现在线性展开的语句里。 - 史蒂芬·平克  

  

### 例6 不是标题的 \

让 `#` 不被识别为标题标识符

**格式：**

`\# 这里的内容不会被识别为标题`

**效果：**

# 这里的内容不会被识别为标题

  

### 例7 不会注释的 \%

在 **Obsidian** 中 注释是前后各两个 `%` 号

使用 转义符号`\`，让 `%%` 作为普通字符显示出来，不具备注释的功能

-   **格式：**`\%\%这里的内容可以被显示喔\%\%`
-   **效果：** \%\%这里的内容可以被显示喔\%\%

  

### 例8 木有链接的双链

**Obsidian** 的双向链格式是2个方括号 `[[ ]]` (双方)，使用 转义符号`\`，让 `[` `]` 不再具有 双链功能

**格式：**

`\[\[这段文本被双方包裹，但不是一个双向链\]\]`

**效果：**

[[这段文本被双方包裹，但不是一个双向链]]

  

### 例9 页链接里 显示文本内的 中括号

使用转义符号`\`，让`中括号`可以作为`显示文本` 在[[#5 1 网页链接|网页链接]]中显示出来

**格式：**

```text
[\[这是一个带中括号的网页链接显示文本，点击会跳转至百度\]](https://www.baidu.com/)
```

**效果：**

[[这是一个带中括号的网页链接显示文本，点击会跳转至百度]](https://link.zhihu.com/?target=https%3A//www.baidu.com/)

  

### 9.4. 特殊情况 文本修饰的中括号

文本修饰的 中括号`[ ]` **不需要**使用 转义符号`\`

**示范：**

`[[#例8 木有链接的双链|[这是一个带中括号的文本修饰]]]`

**效果：**

[[#例8 木有链接的双链|[这是一个带中括号的文本修饰]]]

  

## 10. 空格&换行&强制删除

  

### 10.1. 空格

-   在一些编辑器或者支持MD的笔记软件里，无论你打多少个**空格**，它只会显示单个 **空格** 的距离
-   可以使用 HTML中 **空格** 的 **字符实体** —— **`&nbsp;`**
-   若要添加 **多个** 空格，就输入多个 —— **`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`**
-   **格式：**
-   **`这里有&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6个空格分隔`**
-   **效果：**
-   这里有 6个空格分隔

  

### 10.2. 换行

**场景1：** - 在一些编辑器或者支持MD的笔记软件里，无论你打多少个 **回车**，它只会显示单个 **回车** 的空行间距 - 可以使用之前表格里提到的 **`<br>`** 标签，在 **单独一行** 中使用，增加额外的空行间距 - 如果要增加 **多个**，就输入 **多个** —— **`<br><br><br><br><br>`** - #注意 当单独一行使用 `<br>` 标签的时候，如果前后有标题标识符或者列表标识符，确保 **br元素** 前后两行都是空白行

**格式：**

```text
这里是第一段文本

<br><br><br><br><br>     <!-- 这里插入了5个空行间距 -->

这里是第二段文本
```

**效果：**

这里是第一段文本

  

这里是第二段文本

  

**场景2：** - 在列表中也可以插入换行符

```text
- 这是一段无序列表
  <br>     <!-- 插入一个空行间距，需单独一行，上下不用预留空格 -->
  这是同一段无序列表中，空一行距离显示的内容
- 这是第二段无序列表
```

**效果：** - 这里是第一段无序列表  
这里是同一段无序列表中，空一行距离显示的内容 - 这里是第二段无序列表

  

-   **补充：**
-   有一些MD编辑器或笔记软件，严格遵循MD的换行规则，你敲一个回车是没法换行的，必须在 **行末** 敲 **2个空格**，再按回车键

-   **格式：**
-   这里是一段想换行的文本空格 空格 Enter 这是换行后的文本

  

### 10.3. 强制删除

-   很多编辑器都有英文标点自动补全功能，自动生成一对，光标落在中间 只想删除前面1个，却会把 **一整对** 都删掉
-   在多个列表的嵌套中，也许会遇到一些 **无法被删除** 的 **列表标识符**
-   **解决方法：** 使用 **`Shift`** + **`Backspace`** 即可强制删除

-   **Bcakspace** ( 退格键 )

  

## 11. 嵌入

-   嵌入都是依赖 **HTML标签** 实现的，嵌入的都是**在线**链接格式

-   如果是本地的，**Obsidian** 中音频是有自带的可录制的录音机插件的，其他的 **音频、视频** 直接复制黏贴就可以了，也可以直接拖拽到OB的笔记界面

-   其他的媒体文件在 **Obsidian** 也和图片一样，以**双链**的格式引用在目标笔记中，使用 **!** 使它可见

  

### 11.1. 嵌入音频

-   **格式：**
-   **`<audio controls="controls" preload="none" src="音频链接地址"></audio>`**  
    
-   **示例：**  
    

```html
<audio controls="controls" preload="none" src="https://www.ldoceonline.com/media/english/exaProns/p008-001803372.mp3?version=1.2.37"></audio>
```

-   **效果：**

  

  

### 11.2. 嵌入视频

-   **格式：**

```html
<video width="600" height="420" controls>
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.ogg" type="video/ogg">
  <source src="movie.webm" type="video/webm">  
</video>
```

-   **说明：**
-   width ( 宽度 ) height ( 高度 ) ，可以自己设置，直接输入数字即可，单位默认是 px(像素) 也可以使用 **百分比****`width=100%`** 代表水平撑满整个窗口 **`height=50%`** 代表垂直撑满半个窗口
-   **Video标签** 支持的视频格式 ：MP4 ogg webm

  

### 11.3. 嵌入页面

-   **格式：****`<iframe width=600 height=400 src="页面链接地址" scrolling="auto" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`**

`html <iframe width=600 height=400 src="https://www.runoob.com/html/html-tutorial.html" scrolling="auto" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>`

-   **效果：**

  

-   **iframe标签** 除了嵌入页面，也可以嵌入**在线视频**，主流的视频网站都会提供**嵌入代码**
-   具体可以看这个 [iframe视频嵌入教程](https://link.zhihu.com/?target=https%3A//www.wolai.com/wolai/go85vJpt3wDwrid7DfCZcE)
-   **B站** 的视频，得在 **`//`** 前面补充 **`http:`**
-   不是所有的 编辑器和笔记软件 都支持这个  
    
-   **示例：**  
    

```html
<iframe width=600 height=400 src="http://player.bilibili.com/player.html?aid=20190823&bvid=BV1yW411s7og&cid=32964980&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

-   宽高设置和前面的 **video** 一样

  

-   **效果：**

  



  


  

## 12. 标签 (Tag)

-   标签是 **Obsidian** 特有的一个功能，标签可以通过点击唤起快速搜索 (搜索包含该标签的所有笔记)

**格式：** - **#** + **标签名** - `#标签名`

### 12.1. 关于空格

-   在一段正文文本的后面添加 Tag， **#** 的**前面** 需要有个空格

-   **空格** + **#** + 标签名

  

-   # 与 标签名 **之间**，**不能**有空格，否则就变成 一级标题 了

  

-   标签名的**内部**，**不允许**使用空格，若想区分标签中的词语，可使用以下**三种**方法：

1.  驼峰式大小写： `#BlueTopaz`
2.  下划线： `#blue_topaz`
3.  连字符： `#blue-topaz`

  

### 12.2. 关于数字

-   标签内允许使用数字，但不能完全由数字组成

-   `#1984` ❌
-   `#1984Date` ⭕
-   `#da_1984_te` ⭕
-   `#date-1984` ⭕

  

### 12.3. 标签的嵌套

在标签名内，使用 `/` 斜杠 可以实现标签的嵌套

**格式：** - `#主标签/子标签1` - `#主标签/子标签2` - `#主标签/子标签3`

嵌套标签可以像普通标签一样通过点击来唤起搜索，嵌套标签允许你选择搜索的层次。**例如：** - 搜索 `#主标签` ，即可找到包含任意一个子标签的所有笔记 - 返回的结果会是上述的三个例子 - 当你在一个主分类下设置了多个子分类，想找到这个主分类包含的所有内容时，该功能会很实用

  

### 12.4. 能被使用的符号

综上所述，标签内能被使用的符号共有三种

1.  `_` 下划线
2.  `-` 连字符
3.  `/` 斜杠

  

### 12.5. 如何让 # 不被识别

可以使用前面提到的转义符号 `\` 反斜杠，与上述的 转义标题 类似

**格式：**

`\#这里的内容不会被识别为标签`

**效果：**

#这里的内容不会被识别为标签

  

## 13. 避免标识符的滥用

即使在 **Markdown** 中，也要尽量**避免**标识符的滥用

比如我的这篇教程，就存在一定程度的滥用 - 其实是因为我这篇是教学性质的，不太一样，有些不能避免 - **(好吧，我就是在甩锅)**

标识符的本质是突出显示，代表**重点** - 一篇笔记里的某段文本，使用**各式各样的**的标识符，会造成**重点不清晰**

有**三种**标识，**慎用**！  
1. 词中对**单个汉字**的标识 1. 卧==虎==藏==龙== 2. 短语中对**单个英语单词**的标识 1. get a ==bang== out of 3. 标识符的**多层嵌套** 1. **我感觉快要==原地`起飞`==了**

**原因：** - 词义的割裂 - 视觉的混乱 - 不利于搜索 - `卧==虎==藏==龙==` - 搜 `卧虎` -- 搜不到 - 搜 `藏龙` -- 搜不到