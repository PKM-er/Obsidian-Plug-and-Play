---
banner: "![[sergei-eisensteins-120th-birthday-5380775741489152-2xagif.gif]]"
---
---
cssclass: cards
usage: 对dataview表格渲染成卡片视图
banner: "![[MovieList_image_1.gif]]"
obsidianUIMode: preview
banner_x: 0.5
banner_y: 0.5
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



const pages = dv.pages("#Movie")
    .sort(t => t.rating, 'desc')
    //.where(t => t.status != "Completed")
	.where(t => t.file.folder !="Template" )
    .map(t =>  ["![]("+t.cover+")" , t.file.link, t.year,t.rating,buttonMaker('progress',t.progress??'评级',t.file.path),buttonMaker('status',t.status??'状态',t.file.path) ])


dv.table(["cover", "name", "year", "rating", "progress","status"], pages);

```