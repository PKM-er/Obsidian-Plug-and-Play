---
banner: "https://api.dujin.org/bing/1920.php"
banner__icon:  📖
---
> [!multi-column]
>
>> [!note]+ 栏位1
>>今日 `= "[["+date(today)+"]]"` ，去年 `= "[["+(date(today) - dur(1 years))+"]]"`
>>
>
>>[!note]+ 栏位2
>>```dataviewjs
>>const defaultFormat = 'YYYY-MM-DD'; 
>>const format = app['internalPlugins']['plugins']['daily-notes']['instance']['options']['format'] || defaultFormat; dv.paragraph(`<<[[${moment(dv.current().file.name, format).subtract(1, "d").format(format)}|回顾昨天]] [[${moment(dv.current().file.name, format).add(1, "d").format(format)}||展望明天]]>>`) 
>>``` 

```dataviewjs
let ftMd = dv.pages("").file.sort(t => t.cday)[0]
let total = parseInt([new Date() - ftMd.ctime] / (60*60*24*1000))
let totalDays = "这是使用 *Obsidian* 第"+total+" 天"
dv.paragraph(
	totalDays
)

var i = [dv.pages().length,dv.pages(`"Works"`).length,dv.pages(`"Knowledge"`).length,dv.pages().file.etags.distinct().length]
dv.paragraph(`总共有 **${i[0]}** 个文件`)
dv.paragraph(`其中==工作== **${i[1]}** 篇，==知识== **${i[2]}** 篇`)

let allFile = dv.pages().file
let docNotice = "包含"
let totalTag = allFile.tags.distinct().length+" 个标签"
let totalTask = allFile.tasks.length+" 个待办。<br>"
dv.paragraph(
	docNotice+totalTag+"、"+totalTask
)
```

```dataviewjs
await dv.view("tasksCalendar", {pages: "", view: "month", firstDayOfWeek: 1, options: "style1"})
```

## 1. 最近编辑
```dataview
table WITHOUT ID file.link AS "标题",file.mtime as "上次修改时间",file.ctim AS "创建时间"
from !"10 归档" and !"1 看板"
sort file.mtime desc
limit 12
```





### 1.1. 历史统计

### 1.2. 标签
```dataviewjs
dv.paragraph(
  dv.pages("").file.tags.distinct()
  .sort(t => dv.pages(t).length , 'desc')
  .map(
  	t => {
		return `[${t}](${t})`+"("+dv.pages(t).length+")"
	}
  ).array().join(" ")
)
```


### 1.3. 月度统计

```dataview
table WITHOUT ID rows.file[0].day.year+"年"+rows.file[0].day.month+"月" as 月份,length(rows)+"篇" as 数量
group by file.day.month
````



## 2. 读书笔记

```dataviewjs
const {update,autoprop} = this.app.plugins.plugins["metaedit"].api;

const buttonMaker = (pn, pv, fpath) => {
    const btn = this.container.createEl('button', {"text": pv});
    btn.addEventListener('click', async (evt) => {
        evt.preventDefault();
		const newtext = await autoprop("当前属性")
        await update(pn, newtext, fpath);
    });
    return btn;
}


const pages = dv.pages("#Readingresponse")
    .sort(t => t.rating, 'desc')
    //.where(t => t.status != "Completed")
	.where(t => t.file.folder !="Template" )
    .map(t =>  [t.file.link,t.rating,buttonMaker('progress',t.progress??'评级',t.file.path),buttonMaker('status',t.status??'状态',t.file.path)])


dv.table(["name","progress","rating" ,"status"], pages);


```

## 3. 娱乐

### 3.1. 影音
```dataviewjs
const {update,autoprop} = this.app.plugins.plugins["metaedit"].api;

const buttonMaker = (pn, pv, fpath) => {
    const btn = this.container.createEl('button', {"text": pv});
    btn.addEventListener('click', async (evt) => {
        evt.preventDefault();
		const newtext = await autoprop("当前属性")
        await update(pn, newtext, fpath);
    });
    return btn;
}



const pages = dv.pages("#Movie")
    .sort(t => t.rating, 'desc')
    //.where(t => t.status != "Completed")
	.where(t => t.file.folder !="Template" )
    .map(t =>  ["![]("+t.cover+")" , t.file.link, t.year,t.rating,buttonMaker('progress',t.progress??'评级',t.file.path),buttonMaker('status',t.status??'状态',t.file.path) ])
  
dv.table(["cover", "name","pubulic-time","rating", "progress","status"], pages);

```

### 3.2. 图书收藏

```dataviewjs
const {update,autoprop} = this.app.plugins.plugins["metaedit"].api;

const buttonMaker = (pn, pv, fpath) => {
    const btn = this.container.createEl('button', {"text": pv});
    btn.addEventListener('click', async (evt) => {
        evt.preventDefault();
		const newtext = await autoprop("当前属性")
        await update(pn, newtext, fpath);
    });
    return btn;
}



const pages = dv.pages("#book")
    .sort(t => t.rating, 'desc')
    //.where(t => t.status != "Completed")
	.where(t => t.file.folder !="Template" )
    .map(t =>  ["![]("+t.cover+")" , t.file.link, t.publishyear,t.rating,buttonMaker('progress',t.progress??'评级',t.file.path),buttonMaker('status',t.status??'状态',t.file.path) ])


dv.table(["cover", "name", "publishyear","douban","rating","status"], pages);

```