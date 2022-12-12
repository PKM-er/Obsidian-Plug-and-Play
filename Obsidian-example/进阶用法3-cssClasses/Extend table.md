
> Extend basic table in Obsidian with MultiMarkdown table syntax - GitHub - aidenlx/table-extended: Ext......

Extend basic table in Obsidian with MultiMarkdown table syntax.

[![][img-0]

*   [Table Extended](#table-extended)
    *   [Intro](#intro)
    *   [Known issue](#known-issue)
    *   [How to use](#how-to-use)
        *   [Expermental: Extended Native Syntax](#expermental-extended-native-syntax)
        *   [Multiline](#multiline)
        *   [Multiline Header](#multiline-header)
        *   [Headerless](#headerless)
    *   [Compatibility](#compatibility)
    *   [Installation](#installation)
        *   [From Obsidian](#from-obsidian)
        *   [From GitHub](#from-github)
    *   [Behind the scene](#behind-the-scene)

[](#intro)Intro
---------------

Obsidian's [built-in table syntax](https://help.obsidian.md/How+to/Format+your+notes#tables) can only define the basics for tables. When users try to apply complex tables with `colspan` or multiple headers, their only option is to fall back to raw HTML, which is difficult to read and edit.

This plugin brings [MultiMarkdown table syntax](https://fletcher.github.io/MultiMarkdown-6/syntax/tables.html) to Obsidian, which provides the following features with internal links and embeds intact:

*   [Cell spans over columns](#colspan)
*   [Cell spans over rows](#rowspan)
*   [Block-level elements](#multiline) such as lists, codes...
*   [Multiple table headers](#multiline-header)
*   Table caption
*   [Omitted table header](#headerless)

[](#known-issue)Known issue
---------------------------

*   This plugin is not yet compatible with [Advanced Tables](https://github.com/tgrosinger/advanced-tables-obsidian), as its auto-formatting would break the mmd6 table syntax.
    *   Related issue: [advanced-tables-obsidian #59](https://github.com/tgrosinger/advanced-tables-obsidian/issues/59#issuecomment-812886995)
*   table with `-tx-` may sometimes ignore escape characters, for example, `\|` fails to escape `|` in table, only `\\|` works
*   extended native syntax may not work sometimes, with console output: `failed to get Markdown text, escaping...`

[](#how-to-use)How to use
-------------------------

The latest version use a new syntax to indicate extended tables in favor of fenced `tx` code blocks, which allow better support for backlinks and forward links, which use a leading `-tx-` before table:

PS: For expermental extended native syntax support which eliminate the need for `-tx-` prefix, check [here](#expermental-extended-native-syntax)

```
-tx-
|             |          Grouping           || 
First Header  | Second Header | Third Header | 
 ------------ | :-----------: | -----------: | 
Content       |          *Long Cell*        || 
Content       |   **Cell**    |         Cell | 
New section   |     More      |         Data | 
And more      | With an escaped '\|'       || 
[Prototype table]


```

would be render as:

Prototype table

<table><thead><tr><th></th><th colspan="2">Grouping</th></tr><tr><th>First Header</th><th>Second Header</th><th>Third Header</th></tr></thead><tbody><tr><td>Content</td><td colspan="2"><em>Long Cell</em></td></tr><tr><td>Content</td><td><strong>Cell</strong></td><td>Cell</td></tr></tbody><tbody><tr><td>New section</td><td>More</td><td>Data</td></tr><tr><td>And more</td><td colspan="2">With an escaped '|'</td></tr></tbody></table>

For more detailed guide, check [markdown-it-multimd-table README](https://github.com/RedBug312/markdown-it-multimd-table/blob/master/README.md#usage) and [MultiMarkdown User's Guide](https://fletcher.github.io/MultiMarkdown-6/syntax/tables.html)

### [](#expermental-extended-native-syntax)Expermental: Extended Native Syntax

Note: the following features are not supported:

*   [Multiple table headers](#multiline-header)
*   Table caption
*   [Omitted table header](#headerless)

Extended syntax is allowed in Obsidian's regular tables when option is enabled is the setting tab:

The following table:

```
First Header  | Second Header | Third Header |
 ------------ | :-----------: | -----------: |
Content       |          *Long Cell*        ||
Content       |   **Cell**    |         Cell |
New section   |     More      |         Data |
And more      | With an escaped '\|'       ||

```

would be render as:

<table><thead><tr><th>First Header</th><th>Second Header</th><th>Third Header</th></tr></thead><tbody><tr><td>Content</td><td colspan="2"><em>Long Cell</em></td></tr><tr><td>Content</td><td><strong>Cell</strong></td><td>Cell</td></tr></tbody><tbody><tr><td>New section</td><td>More</td><td>Data</td></tr><tr><td>And more</td><td colspan="2">With an escaped '|'</td></tr></tbody></table>

### [](#multiline)Multiline

Backslash at end merges with line content below.

```
|   Markdown   | Rendered HTML |
|--------------|---------------|
|    *Italic*  | *Italic*      | \
|              |               |
|    - Item 1  | - Item 1      | \
|    - Item 2  | - Item 2      |
|    ```python | ```python       \
|    .1 + .2   | .1 + .2         \
|    ```       | ```           |

```

This is parsed below:

<table><thead><tr><th>Markdown</th><th>Rendered HTML</th></tr></thead><tbody><tr><td><pre>*Italic*

</pre></td><td><p dir="auto"><em>Italic</em></p></td></tr><tr><td><pre>- Item 1
- Item 2
</pre></td><td><ul dir="auto"><li>Item 1</li><li>Item 2</li></ul></td></tr><tr><td><pre>```python
.1 + .2
```
</pre></td><td><pre>.1 + .2

</pre></td></tr></tbody></table>

### [](#rowspan)Rowspan

`^^` indicates cells being merged above.  

```
Stage | Direct Products | ATP Yields
----: | --------------: | ---------:
Glycolysis | 2 ATP ||
^^ | 2 NADH | 3--5 ATP |
Pyruvaye oxidation | 2 NADH | 5 ATP |
Citric acid cycle | 2 ATP ||
^^ | 6 NADH | 15 ATP |
^^ | 2 FADH2 | 3 ATP |
**30--32** ATP |||

```

This is parsed below:

<table><thead><tr><th>Stage</th><th>Direct Products</th><th>ATP Yields</th></tr></thead><tbody><tr><td rowspan="2">Glycolysis</td><td colspan="2">2 ATP</td></tr><tr><td>2 NADH</td><td>3–5 ATP</td></tr><tr><td>Pyruvaye oxidation</td><td>2 NADH</td><td>5 ATP</td></tr><tr><td rowspan="3">Citric acid cycle</td><td colspan="2">2 ATP</td></tr><tr><td>6 NADH</td><td>15 ATP</td></tr><tr><td>2 FADH2</td><td>3 ATP</td></tr><tr><td colspan="3"><strong>30–32</strong> ATP</td></tr></tbody></table>

### [](#multiline-header)Multiline Header

```
|             |          Grouping           ||
First Header  | Second Header | Third Header |
 ------------ | :-----------: | -----------: |
Content       |          *Long Cell*        ||


```

rendered as:

<table><thead><tr><th></th><th colspan="2">Grouping</th></tr><tr><th>First Header</th><th>Second Header</th><th>Third Header</th></tr></thead><tbody><tr><td>Content</td><td colspan="2"><em>Long Cell</em></td></tr></tbody></table>

### [](#headerless)Headerless

Table header can be eliminated.

```
|--|--|--|--|--|--|--|--|
|♜|  |♝|♛|♚|♝|♞|♜|
|  |♟|♟|♟|  |♟|♟|♟|
|♟|  |♞|  |  |  |  |  |
|  |♗|  |  |♟|  |  |  |
|  |  |  |  |♙|  |  |  |
|  |  |  |  |  |♘|  |  |
|♙|♙|♙|♙|  |♙|♙|♙|
|♖|♘|♗|♕|♔|  |  |♖|

```

This is parsed below:

<table><tbody><tr><td>♜</td><td></td><td>♝</td><td>♛</td><td>♚</td><td>♝</td><td>♞</td><td>♜</td></tr><tr><td></td><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td><td></td><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td></tr><tr><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td><td></td><td>♞</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td>♗</td><td></td><td></td><td><g-emoji alias="chess_pawn" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/265f.png">♟</g-emoji></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td>♙</td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td>♘</td><td></td><td></td></tr><tr><td>♙</td><td>♙</td><td>♙</td><td>♙</td><td></td><td>♙</td><td>♙</td><td>♙</td></tr><tr><td>♖</td><td>♘</td><td>♗</td><td>♕</td><td>♔</td><td></td><td></td><td>♖</td></tr></tbody></table>

[](#compatibility)Compatibility
-------------------------------

The required API feature is only available for Obsidian v0.12.0+.

[](#installation)Installation
-----------------------------

### [](#from-obsidian)From Obsidian

1.  Open `Settings` > `Third-party plugin`
2.  Make sure Safe mode is **off**
3.  Click `Browse community plugins`
4.  Search for this plugin
5.  Click `Install`
6.  Once installed, close the community plugins window and the patch is ready to use.

### [](#from-github)From GitHub

1.  Download the Latest Release from the Releases section of the GitHub Repository
2.  Put files to your vault's plugins folder: `<vault>/.obsidian/plugins/table-extended`
3.  Reload Obsidian
4.  If prompted about Safe Mode, you can disable safe mode and enable the plugin. Otherwise, head to Settings, third-party plugins, make sure safe mode is off and enable the plugin from there.

> Note: The `.obsidian` folder may be hidden. On macOS, you should be able to press `Command+Shift+Dot` to show the folder in Finder.

[](#behind-the-scene)Behind the scene
-------------------------------------

Due to the restriction of the current Obsidian API, the built-in markdown parser is not configurable. Instead, This plugin includes an standalone Markdown parser [markdown-it](https://markdown-it.github.io/) with plugin[markdown-it-multimd-table](https://github.com/RedBug312/markdown-it-multimd-table), and table sections and the texts inside code block with language tag `tx` are passed to `markdown-it`. The internal links and embeds, however, are extracted and passed to Obsidian, so the core features of obsidian remain intact.

Noted that the plugin may behave differently from the official MultiMarkdown compiler and Obsidian's parser, Please pose an issue if there are unexpected results for sensible inputs.

[img-0]:data:application/xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPEVycm9yPjxDb2RlPkFjY2Vzc0RlbmllZDwvQ29kZT48TWVzc2FnZT5BY2Nlc3MgRGVuaWVkPC9NZXNzYWdlPjxSZXF1ZXN0SWQ+NjJGRjMxMTNRWlNCN01BRDwvUmVxdWVzdElkPjxIb3N0SWQ+aWNRWmpPZUhlS3pPNmVSTDBCQTB6eWZxNUE1cVJIREs2VXUveWNkR3hWSVNwMTkzU3lLSFRUOFYyQi9EbzNJTzZWTDlKbkZGbSs4PTwvSG9zdElkPjwvRXJyb3I+