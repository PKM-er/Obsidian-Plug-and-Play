---
updated: 2022-04-07 11:34
---

> Obaidian 0.14.2 版本后增加了Callout功能，这个功能就是之前 Admonition (简称ad插件) 插件收编的，目前语法跟Microsoft Docs 一致。之前用ad插件设置的提示框可以一键转换成最新的语法样式。

## 1. 调用办法

如果你看到下面多彩的样式，觉得很酷，但是又讨厌去记忆那么多格式和特定字符。
本库已经继承了快捷输入
依赖【various-complements】插件
快速输入和提示如下

|       快捷指令，会有自动提示        |    对应生成的callouts 区块     |
|:----------------------------------------:|:----------:|
| co-abstract|coa|co-summary|co-tldr       | 📔摘要提示区块   |
| co-bug|cob|ad-bug                        | 🐞Bug提示区块  |
| co-caution|cod|ad-caution|co-caution     | ☠️危险提示区块   |
| co-error|coe|co-error|co-danger|ad-error | ⚡错误提示区块    |
| co-example|coex|ad-example               | 📝例子提示区块   |
| co-fail|cof|ad-fail                      | ❌失败提示区块    |
| co-info|coi|ad-info                      | ℹ️info提示区块 |
| co-note|con|ad-note                      | ⭐重点提示区块    |
| co-quote|coqo                            | ✨引用提示区块    |
| co-question|coq|ad-q                     | ❓问题提示区块    |
| co-success|cos|co-done|ad-done|ad-suc    | ✅完成提示区块    |
| co-warning|cow|ad-war                    | ⚠️警告提示区块   |
| co-tip|cot|ad-tip                        | 💡技巧提示区块   |
| co-lol|col|co-LOL                        | 😁有趣提示区块   |
| co-comment|coc                           | 建议提示区块     |
| co-reference|cor                         | 📖參考提示区块   |
| co-mulit|co-mulit|mulit-co               | 📖双列提示区块   |
| co-tri|tri-col|co-tri                    | 📖三列提示区块   |


## 2. 视频教程
[告别单调的Obsidian，Ob的版面也可以丰富起来！ (bilibili.com)](https://www.bilibili.com/video/BV1G5411U7m8/)

## 3. 目前支持的样式列表
## 4. 官方示例
### 4.1. 提示框类型
> [!note]
> Here's a callout block.
> It supports **markdown** and [[Internal link|wikilinks]].

> [!abstract]

>[!todo]

> [!info]

> [!tip]

> [!success]

> [!question]

> [!warning]

> [!failure]

> [!danger]

> [!bug]

> [!example]

> [!quote]


除了info 类型还支持以下类型
-   note
-   abstract, summary, tldr
-   info, todo
-   tip, hint, important
-   success, check, done
-   question, help, faq
-   warning, caution, attention
-   failure, fail, missing
-   danger, error
-   bug
-   example
-   quote, cite
### 4.2. 提示框的各种用法

1. 可以没有内容直接显示标题
> [!TIP] Callouts can have custom titles, which also supports **markdown**!

2. 折叠提示框
> [!FAQ]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden until it is expanded.

3. 自定义提示框
可以通过css设置my-callout-type 的样式
```css
.callout[data-callout="my-callout-type"] {
    --callout-color: 0, 0, 0;
    --callout-icon: icon-id;
    --callout-icon: '<svg>...custom svg...</svg>';
}
```

### 4.3. 

> [!error|right-small] 浮動到右側
>
> 小視窗，靠右

扩充Callouts的语法，在Callout 类型后上 Pipe，再輸入下列设定：

>[!tip]+ 语法
> 
> [!Callout类型|left/right-small/medium/large] </br>
>[!blank-container|left/right-small/medium/large]


## 5. 主题自定义示例
通过添加callout类型，实现各类样式控制。下面以Blue Topaz主题内置的callout样式举例说明，目前支持的callout样式有：

| Callout类型           | 解释                            | 使用                                    |
| --------------------- | ------------------------------- | --------------------------------------- |
| cloze                  | 字体模糊效果                    | >[!cloze]                               |
| kanban                | 伪看板 无序列表并列             | >[!kanban]                              |
| hibox                 | 自动隐藏框                      | >[!hibox]                               |
| bookinfo              | 图书卡片(图片表格左右分布)      | >[!bookinfo]                            |
| xx%                   | callout宽度xx代表10-100的数值   | >[!30%]                                 |
| right\|left\|center   | callout布局位置                 | >[!right] <br>>[!left]<br>>[!center]    |
| indent                | 全文自动缩进2字符               | >[!indent]                              |
| blank                 | callout 全透明块                | >[!blank]                               |
| timeline                      |            时间线样式                     |    [[tiimeline callout效果]]                                     |

**注意 以上类型都可以互相组合使用，具体看下面例子**

### 5.1. 模糊字体
>[!cloze]
>隐藏文本


### 5.2. 信息卡 infobox

> [!Infobox right 45%] ## 关羽
>![[Pasted image 20220331161219.png|circle]]
> 
| 本名     | 关羽                          |
|:-------- |:--------------------------------------------- |
| 别名     | 关云长、关公、汉寿亭侯、武圣                 |
| 昵称     | 二爷                                                                 |
| 国籍     | 中国                                       |
| 出生     | 约160年                                |
| 逝世     | 220年（约60岁）               |
| 职业     | 将领                              |
| 活跃年代 | 东汉末年                       |
| 相关人士 | 大哥：刘备<div>三弟：张飞<br></div><div>子女：关平、关银屏<br></div> |

> [!tip indent] 三国人物--关羽
> 关羽早年因杀人逃离家乡，奔向涿郡，在此处结识刘备与张飞，三人相谈甚欢，恩若兄弟。
> 建安五年（200年）刘备投奔袁绍，关羽被曹操捉拿后担任偏将军，在万军之中斩杀颜良，立下了大功。不过之后关羽离开曹操阵营投奔刘备，曹操并未挽留，而是认为“彼各为其主”，放他离开了。
> 之后关羽跟随刘备投奔刘表，刘表去世后刘备在南逃过程中派遣关羽带领数百艘船前往江陵，并在被曹操追杀后成功与之汇合，一同前往夏口。在刘备平定益州后关羽总督荆州诸事，并在之后进行了刮骨疗毒的壮举。
> 建安二十四年（219年）刘备自封为汉中王，赐关羽前将军之职，之后在樊城之战中一举斩落庞德，威震华夏。但之后由于孙权反水偷袭以及部下倒戈东吴，关羽军队溃散，败走麦城，被孙权部将抓获，同年十二月在临沮被斩杀。
> 之后孙权将关羽的头颅送给曹操，曹操以诸侯之礼下葬于洛阳，孙权则将身躯下葬于当阳。后被蜀后主刘禅追谥为壮缪侯。
> 

### 5.3. 图书信息卡片 bookinfo

> [!bookinfo]+ 《从零开始的女性主义》
> ![bookcover|200](https://img2.doubanio.com/view/subject/l/public/s33984963.jpg)
>
| 属性     | 内容                                           |
|:-------|:---------------------------------------------|
|  ISBN  |  9787559652317                              |
|  作者    |   '[日]上野千鹤子/[日]田房永子'                           |
|  出版社   |  北京联合出版公司                           |
|  来源    |  [从零开始的女性主义](https://book.douban.com/subject/35523099/)  |
|  评分    |   8.7                             |
|  页码    |  192                         |

### 5.4. 自定义宽度 位置 
> 目前支持的位置属性有 right，center，left
支持的宽度属性 10%-100% 比如10% 15% 20% 等
它们可以组合使用，支持下面两种写法
```html
 > [!note|30%]
 > [!note 30%]
```

> [!note|right 35% indent ]+ TextBox
> With the development of Chinese economy, the world is watching us. More and more foreigners have sensed the great potential market and come to China to seek for cooperation. Chinese film market had been ignored before, but now more Hollywood directors show their willingness to work with Chinese actors, so as to catch more Chinese audiences and increase the box office.   

> [!tips right 35% ]+ Title
>  Indeed, Chinese box office is increasing every year, even surpasses the foreign’s, which makes the foreign directors pay so much attention to Chinese audiences. It also shows that China has influnced the world and it plays more and more important role in the world economy. There is no doubt that more cooperations will happen during foreign enterprises and Chinese business. 

With the development of Chinese economy, the world is watching us. More and more foreigners have sensed the great potential market and come to China to seek for cooperation. Chinese film market had been ignored before, but now more Hollywood directors show their willingness to work with Chinese actors, so as to catch more Chinese audiences and increase the box office.  
 Indeed, Chinese box office is increasing every year, even surpasses the foreign’s, which makes the foreign directors pay so much attention to Chinese audiences. It also shows that China has influnced the world and it plays more and more important role in the world economy. There is no doubt that more cooperations will happen during foreign enterprises and Chinese business.
 With the development of Chinese economy, the world is watching us. More and more foreigners have sensed the great potential market and come to China to seek for cooperation. Chinese film market had been ignored before, but now more Hollywood directors show their willingness to work with Chinese actors, so as to catch more Chinese audiences and increase the box office.  

### 5.5. 首行缩进2字符 indent 
> 支持下面两种写法
```html
 > [!note|indent]
 > [!note indent]
```

> [!NOTE indent] Title
> In China, millions of high school students will take part in the very important exam on June, it is the turning point of their lives, because the exam will decide what kind of university they will enter. Most people believe that it even decides their fates. While it is just the beginning of their new lives.
在中国,数以百万计的高中学生会在6月参加重要的考试,这是他们生活的转折点,因为考试将决定他们将进入什么样的大学。大多数人认为,这甚至决定他们的命运。然而这只是他们的新生活的开端。
When high school students finish their study, it is time to think about what kind of major they need to choose. This is a very important question, choosing a major needs to consider many factors. The first is about interest. Studying with passion can make a student happy and love what the major. The second is about foreground. The major always decide the future job, so students need to think about the prospect.
当高中学生完成他们的学业,是时候考虑需要选择什么样的专业。这是一个非常重要的问题,选择专业需要考虑很多因素。第一个是关于兴趣。有激情的学习可以让学生感受到快乐和爱。第二个是关于前景。专业总会决定未来的工作,所以学生需要思考前景。





