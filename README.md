## 1. Overview
A good note-taking software, or a good software. Its own ease of use should be considered. Admittedly Obsidian is a great piece of software (I'm lovin it), but he is still very young (obviously 16% of the market share now), and can be said to be a "community plug-in, a community plug-in".

On the basis of satisfying the most people available (style, detail optimization), it can make it more easy to use and more convenient, but it does not lose the essence of refining and focusing on writing to accumulate knowledge. It became the most time-consuming thing in Obsidian's learning and use process. But wasting a lot of time on how to make good use of a knowledge accumulation tool is obviously contrary to some kind of Chengdu.

This gave birth to the entire project

## 2. Purpose 

### 2.1. Principle 1 "Focus on Writing and Legacy"
Before I came into contact with Obsidian, I was a person who only knew markdown, but didn't know the alignment syntax, and of course I didn't know JavaScript or CSS.

If you don't understand code at all like me, you didn't know the famous markdown before. Then please think of it as a notepad. Believe me, you can focus on writing plain text. Don't waste energy on the perfect startup page designed by those big bulls, progress tracking logic, just as an All in One tool.

This gave birth to the first principle, "Focus on Co-Precipitation", all plugins and styles should serve better writing and knowledge accumulation, better distinguish paragraphs, better distinguish headings, and table of contents management.

### 2.2. Principle 2 "Plug and play"
Probably in February 2022, I officially started my plan to switch notes and knowledge management software, and I have contacted Notion, Roam, and I am looking forward to microsoft loop in the second half of this year. But for now it ends up on Obisdian.

The biggest pain point in this process is the use of many plug-ins to learn, although the tutorial can be described as "rich", but for most of the small white, this undoubtedly hinders new users from entering this big family. (High cost of learning)

This gave birth to the second principle, "plug and play", and the whole project has been tweaked to include commonly used plug-in settings, the material required by plug-ins, including template examples and daily recording modes that I think are usable

## 3. Details
### 3.1. Use cases
### 3.2. task tracking

### 3.3. home page
### 3.4. Plugins
1, inherited the commonly used, and relatively stable plug-in capabilities, this plug-in is not comprehensive, but can solve the original markdown, and obsidian in the writing experience of certain problems. Follow the "out-of-the-box"
The list is as follows

### 3.5. style
All the details will be listed here
#### 3.5.1. plugin:obsidian-banners
1, optimize the readability of CSS, before the compression of completely no readability, after all, I am not research and development, there is no way to see so accustomed

2. The width of the banner cannot adapt to the change of the width of the page
--banner-height

#### 3.5.2. conflict
1、plugin：table-extended
Expermental: Exttended Native Table Syntax
Conflicts with the Douban book summary template will result in the syntax format ("> []) of callouts such as bookinfo cannot be rendered, and abnormal in markdown-reading-view mode.


Style:
1. The overall theme is based on the Minimal theme as the prototype;
Why: This theme is more comprehensively supported and the style is more minimalist, in line with the whole concept of "keeping it pure"

2, integrated blue topaz, some of the more good design suitable for Obsidian v0.14.12
2, feature: start the animation function, now you can choose any picture, or GIF to personalize the start.
Why: After all, as there are more and more plugins, it's getting harder and harder to wait for launch
loading-animation

3, feature: Dataview Cards, mainly used to generate a picture wall style based on dataview query, you can put your books, movies are put here, and do not need to maintain him separately.

4, feature: edit code block button adjustment, the original version is not very good to click, so modified a style version

5. Feature: Add callouts syntax, paragraphs are automatically indented. The following expressions are all acceptable
    > [!note|indent]
    > [!note indent]

6. feature: Add callouts syntax, support three alignment methods. The syntax is as follows:
    > [!note|left] 、> [!note|center] 、> [!note|right]
	The syntax format is as follows, and the following two methods are available:
	> [!note|right]
    > [!note right]

7. Feature: Add callouts syntax, support custom percentage width, step by 5%. The following expressions are all acceptable
	> [!note|30%]
	> [!note 30%]

8, feature: add callouts syntax, a new type [bookinfo], used to generate Douban reading information page, of course, can also be used elsewhere

9. feature: Increase the position attribute of the picture, and support the alignment of the custom picture. Contains alignment, mode, and wrapping effects

10. feature: Strengthened the style of floating window mode, so that the title and floating layer of floating window mode look more obvious
