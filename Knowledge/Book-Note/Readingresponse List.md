---
usage: 对dataview表格渲染成卡片视图
banner: "https://tse1-mm.cn.bing.net/th/id/R-C.fa7eae112074f1a685b3c0820c8940d7?rik=5znVCzTbqoDyQw&riu=http%3a%2f%2fwww.aaronhowdle.com%2fwp-content%2fuploads%2f2018%2f02%2fbook-page-turning-animation.gif&ehk=%2bL3Fo5MSSS%2bPkDeTmMDFdWOgtuTh8omW%2bwYsO4SX%2bNM%3d&risl=&pid=ImgRaw&r=0"
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


const pages = dv.pages("#Readingresponse")
    .sort(t => t.rating, 'desc')
    //.where(t => t.status != "Completed")
	.where(t => t.file.folder !="Template" )
    .map(t =>  [t.file.link,t.rating,buttonMaker('progress',t.progress??'评级',t.file.path),buttonMaker('status',t.status??'状态',t.file.path)])


dv.table(["name","progress","rating" ,"status"], pages);


```