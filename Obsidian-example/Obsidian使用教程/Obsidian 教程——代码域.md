## 1. 代码域

  

### 1.1. 行内代码

-   **行内代码 的格式：**
-   输入两个 **`** 反引号 ，在中间写代码内容
-   **补充：**
-   行内代码不一定非得写代码，也可以作为**`着重标记`**，突出显示内容
-   行内代码中，源代码界面和渲染界面是完全一致的，标识符会失效
-   **所谓行内代码：** 只要你的屏幕足够宽，它就不会换行

```text
`这是一段行内代码`

`<table border="1" cellspacing="0" width="500" height="500">`

`print("Hello, World!")`

`这是一行突出显示的文本内容`
```

### 1.2. 示范

`<table border="1" cellspacing="0" width="500" height="500">`

  

`print("Hello, World!")`

  

`这是一行突出显示的文本内容`

  

### 1.3. 代码块

-   **代码块 的格式：**
-   在首行和末行各加 **三个****`** 反引号

-   **` ``` `** + 语言种类 代码内容 **` ``` `**

  

-   在首行和末行各加 **三个****~** 波浪号

-   **`~~~`** + 语言种类 代码内容 **`~~~`**

-   **补充：**
-   在代码块也不一定要写代码，可以写**一段**突出的文本内容，语言类型可以填写 **txt** 或者 **干脆不写**
-   代码块中，源代码界面和渲染界面是完全一致的，标识符会失效
-   在 **Typora编辑器** ，用键盘按键脱离代码块区域，需输入： **Ctrl + Enter**

````text
```语言种类
代码内容
代码内容
代码内容
```

下面是HTML代码块

```html
<table border="1">
    <tr>
        <td>row 1, cell 1</td>
        <td>row 1, cell 2</td>
    </tr>
    <tr>
        <td>row 2, cell 1</td>
        <td>row 2, cell 2</td>
    </tr>
</table>
```

下面是CSS代码块

```css
.box {
    width: 600px;
    height: 400px;
    margin: 100px auto;
    background-image: linear-gradient(black 33.3%,red 33.3%, red 66.6%, yellow 66.6%, yellow);
}   
```

下面是JavaScript代码块

```js
    // 定义一个30个整数的数组，按顺序分别赋予从2开始的偶数；然后按顺序每五个数求出一个平均值，放在另一个数组中并输出。试编程
    let arr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60]
    let newarr = [];
    for (let i = 0, count = 0, sum = 0, len = arr.length; i < len; i++) {
        sum += arr.shift();
        count++;
        if (count % 5 === 0) {
            newarr.push(sum / 5);
            sum =  0;
        }
    }
    console.log(newarr);

    let arr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60]
    let newarr = [];
    for (let i = 0, len = arr.length; i < len / 5; i++) {
        let subarr = arr.splice(0, 5)
        for (let j = 0, sum = 0; j < subarr.length; j++) {
            sum += subarr[j];
        }
        newarr.push(sum / 5);
    }
    console.log(newarr);
```


下面是Python代码块

```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-

i = 2
while(i < 100):
   j = 2
   while(j <= (i/j)):
      if not(i%j): break
      j = j + 1
   if (j > i/j) : print i, " 是素数"
   i = i + 1

print "Good bye!"
```

下面是一块突出显示的文本

```txt
这是一段
突出显示的
文本内容
```
````

### 1.4. 示范

`html <table border="1"> <tr> <td>row 1, cell 1</td> <td>row 1, cell 2</td> </tr> <tr> <td>row 2, cell 1</td> <td>row 2, cell 2</td> </tr> </table>`

```css
.box {
    width: 600px;
    height: 400px;
    margin: 100px auto;
    background-image: linear-gradient(black 33.3%, red 33.3%, red 66.6%, yellow 66.6%, yellow);
}
// 定义一个30个整数的数组，按顺序分别赋予从2开始的偶数；然后按顺序每五个数求出一个平均值，放在另一个数组中并输出。试编程
let arr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60]
let newarr = [];
for (let i = 0, count = 0, sum = 0, len = arr.length; i < len; i++) {
    sum += arr.shift();
    count++;
    if (count % 5 === 0) {
        newarr.push(sum / 5);
        sum =  0;
    }
}
console.log(newarr);

let arr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60]
let newarr = [];
for (let i = 0, len = arr.length; i < len / 5; i++) {
    let subarr = arr.splice(0, 5)
    for (let j = 0, sum = 0; j < subarr.length; j++) {
        sum += subarr[j];
    }
    newarr.push(sum / 5);
}
console.log(newarr);
#!/usr/bin/python
# -*- coding: UTF-8 -*-

i = 2
while(i < 100):
   j = 2
   while(j <= (i/j)):
      if not(i%j): break
      j = j + 1
   if (j > i/j) : print i, " 是素数"
   i = i + 1

print "Good bye!"
这是一段
突出显示的
文本内容
```

  

### 1.5. 代码块的嵌套

  

**格式：**

-   使用**4**个 `` ` `` 包裹 **3**个 `` ` ``

### 1.6. 示范

`````text
````txt
```js
// 3. 输出 100以内(不包括100) 所有偶数的和
// 这类求和问题的核心 ： 利用循环  (总和 = 旧数的和 + 新数)

let sum = 0;

for (let i = 1, sum = 0; i < 100; i++) {
 if (i % 2 == 0) {
 // 筛选偶数
 sum += i; // sum = sum + i // 累加偶数并赋值给sum
 // sum为(旧的，已经进入循环的数)的和，i 为新进入循环的数。当加到(最后一个新数i)时，sum就是最后的 总和
 }
}

console.log(sum); // 打印总和
```
````
`````

  

如果要再套一层，就在最外层 加 **5**个 `` ` `` ，以此类推……

  

### 1.7. 如何在行内代码里显示反引号

首尾各用 两个反引号`` ` ``+ `空格` 包裹

**格式：**

```text
``+空格+带`的内容+空格+``  <!-- 不要忘记前后的两个空格 -->

`` 这是一段能显示`反引号`的行内代码 ``
```

**效果：**

``这是一段能显示`反引号`的行内代码``
