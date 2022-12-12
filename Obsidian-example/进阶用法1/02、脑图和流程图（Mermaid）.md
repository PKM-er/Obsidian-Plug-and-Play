是的你不需要安装任何插件，就可以在Obsidian 画图，天然支撑了 Mermaid 语法；
当然你喜欢也可以使用其他 脑图插件；
基于本库的思想，我更简易“专业的事情交给专业软件”让OB引用对应文件即可；
## 1. Mermaid 语法
### 1.1. 基本形状

```mermaid
graph
    id1[方形]
    id2(圆边矩形)
    id3([体育场形])
    id4[[子程序形]]
    id5[(圆柱形)]
    id6((圆形))
```

```mermaid

graph
	id1{菱形}
	id2{{六角形}}
	id3[/平行四边形/]
	id4[\反向平行四边形\]
	id5[/梯形\]
	id6[\反向梯形/]
```
### 1.2. 连线样式
-   实线箭头：分为无文本箭头和有文本箭头，有文本箭头有2种书写格式
```mermaid
graph LR
a-->b--文本1-->c-->|文本2|d
```
-   粗实线箭头：分为无文本箭头和有文本箭头
```mermaid
graph LR
a==>b==文本==>c
```
-   虚线箭头：分为无文本箭头和有文本箭头
```mermaid
graph LR
a-.->b-.文本.->c
```
-   无箭头线：即以上三种连线去掉箭头后的形式
```mermaid
graph LR
a---b
b--文本1!---c
c---|文本2|d
d===e
e==文本3===f
f-.-g
g-.文本.-h
```

- 其他连线：需要将`graph`关键字改为`flowchart`，除了新增加的连线形式外，上面三种线的渲染效果也会不同
```mermaid
flowchart LR
    A o--o B
    B <--> C
    C x--x D
    
    旧连线 --文本--> 也会不同
```

### 1.3. mermaid 纵向

> [!multi-column]
>
>> [!note]+ 普通流程（带流程提示）
>>
>>```mermaid
>>graph TD
>>A[Christmas] -->|Get money| B(Go shopping)
>>B --> C{Let me think}
>>C -->|One| D[Laptop]
>>C -->|Two| E[iPhone]
>>C -->|Three| F[fa:fa-car Car]
>>```
>
>>[!warning]+ 带判断
>>
>>```mermaid
>>flowchart TB
>>c1-->a2
>>subgraph one
>>a1-->a2
>>end
>>subgraph two
>>b1-->b2
>>end
>>subgraph three
>>c1-->c2
>>end
>>one --> two
>>three --> two
>>two --> c2
>>```
>


### 1.4. mermaid 横向（LR）
```mermaid
graph LR
emperor((朱八八))-.子.->朱五四-.子.->朱四九-.子.->朱百六


朱雄英--长子-->朱标--长子-->emperor
emperor2((朱允炆))--次子-->朱标
朱樉--次子-->emperor
朱棡--三子-->emperor
emperor3((朱棣))--四子-->emperor
emperor4((朱高炽))--长子-->emperor3
```

```mermaid
graph LR  
    A[Square Rect] -- Link text --> B((Circle))  
    A --> C(Round Rect)  
    B --> D{Rhombus}  
    C --> D
```

### 1.5. mermaid timeline
```mermaid
journey

    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 3: Me
```




### 1.6. mermaid 时序图
```mermaid
sequenceDiagram
客户->>银行柜台: 我要存钱

银行柜台->>后台: 改一下这个账户数字哦

后台->>银行柜台: 账户的数字改完了，明天起息

银行柜台->>客户: 好了，给你回单 ，下一位
```

```mermaid
sequenceDiagram  
    loop Daily query  
        Alice->>Bob: Hello Bob, how are you?  
        alt is sick  
            Bob->>Alice: Not so good :(  
        else is well  
            Bob->>Alice: Feeling fresh like a daisy  
        end  
  
        opt Extra response  
            Bob->>Alice: Thanks for asking  
        end  
    end
```
**源码：**

````text
```mermaid
sequenceDiagram
    %% 自动编号
    autonumber
    %% 定义参与者并取别名，aliases：别名
        participant A as Aly
        participant B as Bob
        participant C as CofCai
        %% 便签说明
        Note left of A: 只复习了一部分
        Note right of B: 没复习
        Note over A,B: are contacting

        A->>B: 明天是要考试吗？
        B-->>A: 好像是的！

        %% 显示并行发生的动作，parallel：平行
        %% par [action1]
        rect rgb(0, 25, 155)
            par askA
                C -->> A:你复习好了吗？
            and askB
                C -->> B:你复习好了吗？
            and self
                C ->>C:我还没准备复习......
            end
        end

        %% 背景高亮，提供一个有颜色的背景矩形
        rect rgb(25, 55, 0)
            loop 自问/Every min
            %% <br/>可以换行
            C ->> C:我什么时候<br/>开始复习呢？
            end
        end

        %% 可选择路径
        rect rgb(153, 83, 60)
            alt is good
                A ->> C:复习了一点
            else is common
                B ->> C:我也是
            end
            %% 没有else时可以提供默认的opt
            opt Extra response
                C ->> C:你们怎么不回答我
            end
        endsequenceDiagram
    %% 自动编号
    autonumber
    %% 定义参与者并取别名，aliases：别名
        participant A as Aly
        participant B as Bob
        participant C as CofCai
        %% 便签说明
        Note left of A: 只复习了一部分
        Note right of B: 没复习
        Note over A,B: are contacting

        A->>B: 明天是要考试吗？
        B-->>A: 好像是的！

        %% 显示并行发生的动作，parallel：平行
        %% par [action1]
        rect rgb(0, 25, 155)
            par askA
                C -->> A:你复习好了吗？
            and askB
                C -->> B:你复习好了吗？
            and self
                C ->>C:我还没准备复习......
            end
        end

        %% 背景高亮，提供一个有颜色的背景矩形
        rect rgb(25, 55, 0)
            loop 自问/Every min
            %% <br/>可以换行
            C ->> C:我什么时候<br/>开始复习呢？
            end
        end

        %% 可选择路径
        rect rgb(153, 83, 60)
            alt is good
                A ->> C:复习了一点
            else is common
                B ->> C:我也是
            end
            %% 没有else时可以提供默认的opt
            opt Extra response
                C ->> C:你们怎么不回答我
            end
        end
```
````

**渲染：**

```mermaid
sequenceDiagram
    %% 自动编号
    autonumber
    %% 定义参与者并取别名，aliases：别名
        participant A as Aly
        participant B as Bob
        participant C as CofCai
        %% 便签说明
        Note left of A: 只复习了一部分
        Note right of B: 没复习
        Note over A,B: are contacting

        A->>B: 明天是要考试吗？
        B-->>A: 好像是的！

        %% 显示并行发生的动作，parallel：平行
        %% par [action1]
        rect rgb(0, 25, 155)
            par askA
                C -->> A:你复习好了吗？
            and askB
                C -->> B:你复习好了吗？
            and self
                C ->>C:我还没准备复习......
            end
        end

        %% 背景高亮，提供一个有颜色的背景矩形
        rect rgb(25, 55, 0)
            loop 自问/Every min
            %% <br/>可以换行
            C ->> C:我什么时候<br/>开始复习呢？
            end
        end

        %% 可选择路径
        rect rgb(153, 83, 60)
            alt is good
                A ->> C:复习了一点
            else is common
                B ->> C:我也是
            end
            %% 没有else时可以提供默认的opt
            opt Extra response
                C ->> C:你们怎么不回答我
            end
        end
```

  

### 1.7. 流程图

  

**源码1：**

````text
```mermaid
graph TB
    %% s=start  e=end  f=fork  n=normal

    s([开始])-->f1{{if条件}};

    %% 分支点2
    f1--true-->n1[if语句块]-->e([结束]);
    f1--false-->f2{{else if条件}};

    %% 分支点1
    f2--true-->n2[else if语句块]-->e;
    f2--false-->n3[else语句块]-->e;
```
````

**渲染1：**

```mermaid
graph TB
    %% s=start  e=end  f=fork  n=normal

    s([开始])-->f1{{if条件}};

    %% 分支点1
    f1--true-->n1[if语句块]-->e([结束]);
    f1--false-->f2{{else if条件}};

    %% 分支点2 
    f2--true-->n2[else if语句块]-->e;
    f2--false-->n3[else语句块]-->e;
```

  

**源码2：**

````text
```mermaid
graph LR
    %% s=start  e=end  f= fork n=normal 

    %% 虚线
    s[朱百六]-.->|子|n1[朱四九]-.->|子|n2[朱五四]-.->|子|f1_帝((朱八八))

    %% 分支点 朱八八
    f1_帝-->|长子|f2[朱标]
    f1_帝-->|次子|n3[朱樉]
    f1_帝-->|三子|n4[朱棢]
    f1_帝-->|四子|n5_帝((朱棣))

    %% 分支点 朱标
    f2-->|长子|e1[朱雄英]
    f2-->|次子|e2_帝((朱允炆))

    n5_帝-->|长子|e3[朱高炽]
```
````

**渲染2：**

```mermaid
graph LR
    %% s=start  e=end  f= fork n=normal 

    %% 虚线
    s[朱百六]-.->|子|n1[朱四九]-.->|子|n2[朱五四]-.->|子|f1_帝((朱八八))

    %% 分支点 朱八八
    f1_帝-->|长子|f2[朱标]
    f1_帝-->|次子|n3[朱樉]
    f1_帝-->|三子|n4[朱棢]
    f1_帝-->|四子|n5_帝((朱棣))

    %% 分支点 朱标
    f2-->|长子|e1[朱雄英]
    f2-->|次子|e2_帝((朱允炆))

    n5_帝-->|长子|e3[朱高炽]
```

  

### 1.8. 饼图

  

**源码：**

````text
```mermaid
pie
    title 为什么总是宅在家里？
    "喜欢宅" : 45
    "天气太热" : 70
    "穷" : 500
    "关你屁事" : 95
```
````

**渲染：**

```mermaid
pie
    title 为什么总是宅在家里？
    "喜欢宅" : 45
    "天气太热" : 70
    "穷" : 500
    "关你屁事" : 95
```


### 1.9. 甘特图 

**源码：**

````text
```mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d
```
````

**渲染：**

```mermaid
gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d
```

### 1.10. 类图

**源码：**

````text
```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }
```
````

**渲染：**

```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }
```




