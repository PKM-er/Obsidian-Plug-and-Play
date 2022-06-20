
今日 `= "[["+date(today)+"]]"` ，去年 `= "[["+(date(today) - dur(1 years))+"]]"`

```dataviewjs
var i = [dv.pages().length,dv.pages(`"200-笔记"`).length,dv.pages(`"700-收集文章"`).length,dv.pages().file.etags.distinct().length]
dv.paragraph(`总共有 **${i[0]}** 个文件`)
dv.paragraph(`其中==笔记== **${i[1]}** 篇，==收集文章== **${i[2]}** 篇`)
dv.paragraph(`==标签== **${i[3]}**个`) 
```

## 1. 最近编辑
```dataview
table WITHOUT ID file.link AS "标题",file.mtime as "时间"
from !"10 归档" and !"1 看板"
sort file.mtime desc
limit 5
```


> [!multi-column]
>
>> [!note]+ 保障性租赁住房
>>```dataview 
>>	task
>>	from "Works/58-房产-租房/保障性租赁住房"
>>	where !completed
>>```
>
>> [!note|right-small]+ 画像
>>```dataview 
>>	task
>>	from "Works/58-房产-租房/数据中台、标签体系/落地计划"


> [!multi-column]
>
>
>> [!note]+ 栋栋
>>```dataview 
>>	task
>>	from "3-Family/👨‍👩‍👧一家人/Family To-Do List"
>>	where !completed
>>```
>
>> [!note|right-small]+ 進行中事項
>>
>>```dataview 
>>	task
>>	from "Works/58-房产-租房/58-房产-杂务"
>>```


### 1.1. 历史统计
```dataviewjs
let ftMd = dv.pages("").file.sort(t => t.cday)[0]
let total = parseInt([new Date() - ftMd.ctime] / (60*60*24*1000))
let totalDays = "已使用 *Obsidian* "+total+" 天，"
let nofold = '!"misc/templates"'
let allFile = dv.pages(nofold).file
let totalMd = "共创建 "+
	allFile.length+" 篇文档"
let totalTag = allFile.tags.distinct().length+" 个标签"
let totalTask = allFile.tasks.length+" 个待办。 <br><br>"
dv.paragraph(
	totalDays+totalMd+"、"+totalTag+"、"+totalTask
)
```
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

1E27tVl5*3aL

