---
banner: "![[BookList_image_1.gif]]"
cssclass: cards
usage: 对dataview表格渲染成卡片视图
obsidianUIMode: preview
banner_x: 0.5
banner_y: 0.5
updated: 2022-03-15 14:19
---

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
    .map(t =>  ["![]("+t.cover+")" ,"<progress value=" + t.pageprogress + " max=" +t.pagecount+" class='hot'>", t.file.link,t.author,t.rating,buttonMaker('progress',t.progress??'评级',t.file.path),buttonMaker('status',t.status??'状态',t.file.path)])


dv.table(["cover","阅读状态", "name", "author","publishyear","rating", "progress","status"], pages);


```