### 0.1. 编辑模式

标题`.cm-header-x`代表第x级标题。

```css
.cm-header-1 {
  font-size: 2em;
}
.cm-header-2 {
  font-size: 1.6em;
}
.cm-header-3 {
  font-size: 1.37em;
}
.cm-header-4 {
  font-size: 1.25em;
}
.cm-header-5,
.cm-header-6 {
  font-size: 1.12em;
}
```

引用文本`cm-quote`

```css
.cm-quote {
    color: red;
}
```

列表`HyperMD-list-line`，其中第x级标题为`cm-list-x`

```css
.cm-list-1 {
    color: red;
}
```

具体分别指定有序列表和无序列表使用`.cm-formatting-list-ul`和`.cm-formatting-list-ol`

```css
.cm-formatting-list-ul + span {
    color: red;
}
.cm-formatting-list-ol + span {
    color: blue;
}
```

链接`cm-link`

```css
.cm-s-obsidian span.cm-link, .cm-s-obsidian span.cm-hmd-internal-link {
    color: red;
}
```

斜体`cm-em`加粗`cm-strong`

```css
.cm-em, .cm-strong {
    color: red;
}
```

### 0.2. 预览模式

标题`.markdown-preview-view hx`代表第x级标题。

```css
.markdown-preview-section h1 {
    color: blue !important;
}
```

引用文本`.markdown-preview-view blockquote`

```css
.markdown-preview-view blockquote {
    color: red;
}
```

列表`HyperMD-list-line`，其中第x级标题为`cm-list-x`

```css
.cm-list-1 {
    color: red;
}
```

具体分别指定有序列表和无序列表使用`ul`和`ol`

```css
ul {
    color: red;
}
ol {
    color: blue;
}
```

链接`cm-link`

```css
a:link {
    color: red;
}
a:hover {
    color: blue;
}
a:visited {
    color: green;
}
```

斜体`em`加粗`strong`

```css
em,strong{
    color: red;
}
```

## 1. 各种自定义样式详解

-   字体
-   字号
-   颜色
-   背景颜色
-   缩进
-   行距
-   页面宽度

### 1.1. 字体

字体分为本地字体和网络字体。**注意：一般字体都需要收费，自己个人免费用没事，一旦涉及商业用途需要收费。** 将网络上的字体下载并安装后，直接使用字体的名字即可，可同时设置多个字体，系统从最左边开始使用，找不到该字体会顺延至下一个字体。

```css
body{
    font-family: '宋体','黑体';
}
```

也可以根据网址引用网络字体

```css
@font-face {
    font-family: 'Hanalei Fill';
    font-style: normal;
    font-weight: 400;
    src: url(https://fonts.gstatic.font.im/s/hanaleifill/v11/fC1mPYtObGbfyQznIaQzPQi8UAjF.ttf) format('truetype');
  }
body{
    font-family: 'Hanalei Fill';
}
```

### 1.2. 字号

字号有很多种单位：px像素，pt磅和em相对字体大小

```css
.cm-header-1 {
  font-size: 2em;
}
.cm-header-2 {
  font-size: 18px;
}
.cm-header-3 {
  font-size: 20pt;
}
```

### 1.3. 颜色

找到你想修改的那部分元素，修改它的color属性值。

```css
.markdown-preview-section {
    color: blue ;
}
```

### 1.4. 背景颜色

背景颜色同理，

```css
.markdown-preview-view {
    background-color: blue;
}
```

或者修改color相关的变量

```css
.theme-dark {
    --background-primary: #566352;
    --background-primary-alt: #1a1a1a;
    --background-secondary: #161616;
    --background-secondary-alt: #000000;
    --background-modifier-border: #333;
    --background-modifier-form-field: rgba(0, 0, 0, 0.3);
    --background-modifier-form-field-highlighted: rgba(0, 0, 0, 0.22);
    --background-modifier-box-shadow: rgba(0, 0, 0, 0.3);
    --background-modifier-success: #197300;
    --background-modifier-error: #3d0000;
    --background-modifier-error-rgb: 61, 0, 0;
    --background-modifier-error-hover: #470000;
    --background-modifier-cover: rgba(0, 0, 0, 0.8);
}
```

### 1.5. 首行缩进

修改text-indent属性即可。 编辑模式

```css
pre.CodeMirror-line:not(.HyperMD-header){
    text-indent: 2em;
}
```

预览模式

```css
.markdown-preview-section p{
    text-indent: 2em;
}
```

### 1.6. 行距

修改line-height属性即可

```css
pre.CodeMirror-line:not(.HyperMD-header){
    line-height: 2em;
}
```

### 1.7. 页面宽度

分别修改编辑模式和预览模式的max-width属性。obsidian默认是700px

```css
.markdown-source-view.is-readable-line-width .CodeMirror {
    max-width: 1000px;
}
.markdown-preview-view.is-readable-line-width .markdown-preview-sizer{
    max-width: 1000px;
}
```

### 1.8. tag

预览模式的比较好修改，编辑模式不太好修改。

```text
.tag:not(.token) {
 background-color: var(--text-accent);
 border: none;
 color: white;
 font-size: 11px;
 padding: 1px 8px;
 text-align: center;
 text-decoration: none;
 display: inline-block;
 margin: 0px 0px;
 cursor: pointer;
 border-radius: 14px;
}
```

# obsidian-snippets

This is a collection of random snippets I've made. Hopefully it will grow over time.

# [](https://github.com/deathau/obsidian-snippets#table-of-contents)Table of Contents

-   [Notation Colour Blocks](https://github.com/deathau/obsidian-snippets#notation-colour-blocks)
-   [Realistic Highlights](https://github.com/deathau/obsidian-snippets#realistic-highlights)
-   [Inline Block Embeds](https://github.com/deathau/obsidian-snippets#inline-block-embeds)
-   [Clutter-Free Headings](https://github.com/deathau/obsidian-snippets#clutter-free-headings)
-   [Clutter-Free Formatting](https://github.com/deathau/obsidian-snippets#clutter-free-formatting)
-   [Checkboxes](https://github.com/deathau/obsidian-snippets#checkboxes)

---

## 1. [](https://github.com/deathau/obsidian-snippets#notation-colour-blocks)Notation Colour Blocks

[https://github.com/deathau/obsidian-snippets/blob/main/notation-colour-blocks.css](https://github.com/deathau/obsidian-snippets/blob/main/notation-colour-blocks.css)

A bunch of different coloured blocks, inspired by the block colours offered by Notion.

[![](https://github.com/deathau/obsidian-snippets/raw/main/images/notation-colour-blocks-1.png)](https://github.com/deathau/obsidian-snippets/blob/main/images/notation-colour-blocks-1.png) [![](https://github.com/deathau/obsidian-snippets/raw/main/images/notation-colour-blocks-2.png)](https://github.com/deathau/obsidian-snippets/blob/main/images/notation-colour-blocks-2.png) [![](https://github.com/deathau/obsidian-snippets/raw/main/images/notation-colour-blocks-3.png)](https://github.com/deathau/obsidian-snippets/blob/main/images/notation-colour-blocks-3.png) [![](https://github.com/deathau/obsidian-snippets/raw/main/images/notation-colour-blocks-4.png)](https://github.com/deathau/obsidian-snippets/blob/main/images/notation-colour-blocks-4.png)

---

## 2. [](https://github.com/deathau/obsidian-snippets#realistic-highlights)Realistic Highlights

[https://github.com/deathau/obsidian-snippets/blob/main/realistic-highlight.css](https://github.com/deathau/obsidian-snippets/blob/main/realistic-highlight.css)

A fancy-looking highlight that looks like it was made with a highlighter pen

[![](https://github.com/deathau/obsidian-snippets/raw/main/images/realistic-highlights.png)](https://github.com/deathau/obsidian-snippets/blob/main/images/realistic-highlights.png)

---

## 3. [](https://github.com/deathau/obsidian-snippets#inline-block-embeds)Inline Block Embeds

[https://github.com/deathau/obsidian-snippets/blob/main/inline-block-embeds.css](https://github.com/deathau/obsidian-snippets/blob/main/inline-block-embeds.css)

Inline-ish block embeds, which I mostly use for adding some block-embedded tasks to the end of a task list

[![](https://github.com/deathau/obsidian-snippets/raw/main/images/inline-block-embeds.png)](https://github.com/deathau/obsidian-snippets/blob/main/images/inline-block-embeds.png)

---

## 4. [](https://github.com/deathau/obsidian-snippets#clutter-free-headings)Clutter-Free Headings

[https://github.com/deathau/obsidian-snippets/blob/main/clutter-free-headings.css](https://github.com/deathau/obsidian-snippets/blob/main/clutter-free-headings.css)

WYSIWYG-ish headings which line up headings, show the formatting markers when editing and replace them with a muted "H1", "H2" etc when not the active line

[![](https://github.com/deathau/obsidian-snippets/raw/main/images/clutter-free-headings.gif)](https://github.com/deathau/obsidian-snippets/blob/main/images/clutter-free-headings.gif)

---

## 5. [](https://github.com/deathau/obsidian-snippets#clutter-free-formatting)Clutter-Free Formatting

[https://github.com/deathau/obsidian-snippets/blob/main/clutter-free-formatting.css](https://github.com/deathau/obsidian-snippets/blob/main/clutter-free-formatting.css)

Formatting which is reduced and hides when not on the active line. It still leaves the space though, so as to prevent weirdness with cursor movement and selections.

[![](https://github.com/deathau/obsidian-snippets/raw/main/images/clutter-free-formatting.gif)](https://github.com/deathau/obsidian-snippets/blob/main/images/clutter-free-formatting.gif)

---

## 6. [](https://github.com/deathau/obsidian-snippets#checkboxes)Checkboxes

[https://github.com/deathau/obsidian-snippets/blob/main/checkbox.css](https://github.com/deathau/obsidian-snippets/blob/main/checkbox.css)

Checkboxes with different statuses (requires Obsidian 0.12.0+)

[![](https://github.com/deathau/obsidian-snippets/raw/main/images/checkboxes.png)](https://github.com/deathau/obsidian-snippets/blob/main/images/checkboxes.png)