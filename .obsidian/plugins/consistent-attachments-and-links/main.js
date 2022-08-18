'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const DEFAULT_SETTINGS = {
    moveAttachmentsWithNote: true,
    deleteAttachmentsWithNote: true,
    updateLinks: true,
    deleteEmptyFolders: true,
    deleteExistFilesWhenMoveNote: true,
    changeNoteBacklinksAlt: false,
    ignoreFolders: [".git/", ".obsidian/"],
    ignoreFiles: ["consistant-report.md"],
    attachmentsSubfolder: "",
    consistentReportFile: "consistant-report.md",
    useBuiltInObsidianLinkCaching: false,
};
class SettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Consistent attachments and links - Settings' });
        new obsidian.Setting(containerEl)
            .setName('Move attachments with note')
            .setDesc('When a note moves, move with it any attachments that are in the same folder and subfolders.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.moveAttachmentsWithNote = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.moveAttachmentsWithNote));
        new obsidian.Setting(containerEl)
            .setName('Delete unused attachments with note')
            .setDesc('When the note is deleted, delete all attachments that are no longer used in other notes.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.deleteAttachmentsWithNote = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.deleteAttachmentsWithNote));
        new obsidian.Setting(containerEl)
            .setName('Update links')
            .setDesc('Update links to attachments and other notes when moving notes or attachments.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.updateLinks = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.updateLinks));
        new obsidian.Setting(containerEl)
            .setName('Delete empty folders')
            .setDesc('Delete empty folders after moving notes with attachments.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.deleteEmptyFolders = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.deleteEmptyFolders));
        new obsidian.Setting(containerEl)
            .setName('Delete duplicate attachments while note moving')
            .setDesc('Delete attachment when moving a note if there is a file with the same name in the new folder. If disabled, file will be renamed and moved.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.deleteExistFilesWhenMoveNote = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.deleteExistFilesWhenMoveNote));
        new obsidian.Setting(containerEl)
            .setName('Change backlink text when renaming a note')
            .setDesc('When the note is renamed, the links to it are updated. If this option is enabled, the text of links to this note will also be changed.')
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.changeNoteBacklinksAlt = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.changeNoteBacklinksAlt));
        new obsidian.Setting(containerEl)
            .setName("Ignore folders")
            .setDesc("List of folders to ignore. Each folder on a new line.")
            .addTextArea(cb => cb
            .setPlaceholder("Example: .git, .obsidian")
            .setValue(this.plugin.settings.ignoreFolders.join("\n"))
            .onChange((value) => {
            let paths = value.trim().split("\n").map(value => this.getNormalizedPath(value) + "/");
            this.plugin.settings.ignoreFolders = paths;
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("Ignore files")
            .setDesc("List of files to ignore. Each file on a new line.")
            .addTextArea(cb => cb
            .setPlaceholder("Example: consistant-report.md")
            .setValue(this.plugin.settings.ignoreFiles.join("\n"))
            .onChange((value) => {
            let paths = value.trim().split("\n").map(value => this.getNormalizedPath(value));
            this.plugin.settings.ignoreFiles = paths;
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("Attachments subfolder")
            .setDesc("Collect attachments in this subfolder of the note folder (when using the \"Collect all attachments\" hotkey). Leave empty to collect attachments to the note folder without subfolders. You can use ${filename} as a placeholder for current note name")
            .addText(cb => cb
            .setPlaceholder("Example: _attachments")
            .setValue(this.plugin.settings.attachmentsSubfolder)
            .onChange((value) => {
            this.plugin.settings.attachmentsSubfolder = value;
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("Consistant report file name")
            .setDesc("")
            .addText(cb => cb
            .setPlaceholder("Example: consistant-report.md")
            .setValue(this.plugin.settings.consistentReportFile)
            .onChange((value) => {
            this.plugin.settings.consistentReportFile = value;
            this.plugin.saveSettings();
        }));
        new obsidian.Setting(containerEl)
            .setName("EXPERIMENTAL: Use built-in Obsidian link caching to process moved notes")
            .setDesc("Turn it off if plugin misbehaves")
            .addToggle(cb => cb.onChange(value => {
            this.plugin.settings.useBuiltInObsidianLinkCaching = value;
            this.plugin.saveSettings();
        }).setValue(this.plugin.settings.useBuiltInObsidianLinkCaching));
    }
    getNormalizedPath(path) {
        return path.length == 0 ? path : obsidian.normalizePath(path);
    }
}

class Utils {
    static delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, ms));
        });
    }
    static normalizePathForFile(path) {
        path = path.replace(/\\/gi, "/"); //replace \ to /
        path = path.replace(/%20/gi, " "); //replace %20 to space
        return path;
    }
    static normalizePathForLink(path) {
        path = path.replace(/\\/gi, "/"); //replace \ to /
        path = path.replace(/ /gi, "%20"); //replace space to %20
        return path;
    }
    static normalizeLinkSection(section) {
        section = decodeURI(section);
        return section;
    }
}

class path {
    static join(...parts) {
        if (arguments.length === 0)
            return '.';
        var joined;
        for (var i = 0; i < arguments.length; ++i) {
            var arg = arguments[i];
            if (arg.length > 0) {
                if (joined === undefined)
                    joined = arg;
                else
                    joined += '/' + arg;
            }
        }
        if (joined === undefined)
            return '.';
        return this.posixNormalize(joined);
    }
    static dirname(path) {
        if (path.length === 0)
            return '.';
        var code = path.charCodeAt(0);
        var hasRoot = code === 47 /*/*/;
        var end = -1;
        var matchedSlash = true;
        for (var i = path.length - 1; i >= 1; --i) {
            code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
                if (!matchedSlash) {
                    end = i;
                    break;
                }
            }
            else {
                // We saw the first non-path separator
                matchedSlash = false;
            }
        }
        if (end === -1)
            return hasRoot ? '/' : '.';
        if (hasRoot && end === 1)
            return '//';
        return path.slice(0, end);
    }
    static basename(path, ext) {
        if (ext !== undefined && typeof ext !== 'string')
            throw new TypeError('"ext" argument must be a string');
        var start = 0;
        var end = -1;
        var matchedSlash = true;
        var i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext.length === path.length && ext === path)
                return '';
            var extIdx = ext.length - 1;
            var firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= 0; --i) {
                var code = path.charCodeAt(i);
                if (code === 47 /*/*/) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        // We saw the first non-path separator, remember this index in case
                        // we need it if the extension ends up not matching
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        // Try to match the explicit extension
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                // We matched the extension, so mark this as the end of our path
                                // component
                                end = i;
                            }
                        }
                        else {
                            // Extension does not match, so our result is the entire path
                            // component
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end)
                end = firstNonSlashEnd;
            else if (end === -1)
                end = path.length;
            return path.slice(start, end);
        }
        else {
            for (i = path.length - 1; i >= 0; --i) {
                if (path.charCodeAt(i) === 47 /*/*/) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // path component
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1)
                return '';
            return path.slice(start, end);
        }
    }
    static extname(path) {
        var startDot = -1;
        var startPart = 0;
        var end = -1;
        var matchedSlash = true;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        var preDotState = 0;
        for (var i = path.length - 1; i >= 0; --i) {
            var code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46 /*.*/) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            return '';
        }
        return path.slice(startDot, end);
    }
    static parse(path) {
        var ret = { root: '', dir: '', base: '', ext: '', name: '' };
        if (path.length === 0)
            return ret;
        var code = path.charCodeAt(0);
        var isAbsolute = code === 47 /*/*/;
        var start;
        if (isAbsolute) {
            ret.root = '/';
            start = 1;
        }
        else {
            start = 0;
        }
        var startDot = -1;
        var startPart = 0;
        var end = -1;
        var matchedSlash = true;
        var i = path.length - 1;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        var preDotState = 0;
        // Get non-dir info
        for (; i >= start; --i) {
            code = path.charCodeAt(i);
            if (code === 47 /*/*/) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46 /*.*/) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1)
                    startDot = i;
                else if (preDotState !== 1)
                    preDotState = 1;
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 || end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
            if (end !== -1) {
                if (startPart === 0 && isAbsolute)
                    ret.base = ret.name = path.slice(1, end);
                else
                    ret.base = ret.name = path.slice(startPart, end);
            }
        }
        else {
            if (startPart === 0 && isAbsolute) {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            }
            else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }
        if (startPart > 0)
            ret.dir = path.slice(0, startPart - 1);
        else if (isAbsolute)
            ret.dir = '/';
        return ret;
    }
    static posixNormalize(path) {
        if (path.length === 0)
            return '.';
        var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
        var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;
        // Normalize the path
        path = this.normalizeStringPosix(path, !isAbsolute);
        if (path.length === 0 && !isAbsolute)
            path = '.';
        if (path.length > 0 && trailingSeparator)
            path += '/';
        if (isAbsolute)
            return '/' + path;
        return path;
    }
    static normalizeStringPosix(path, allowAboveRoot) {
        var res = '';
        var lastSegmentLength = 0;
        var lastSlash = -1;
        var dots = 0;
        var code;
        for (var i = 0; i <= path.length; ++i) {
            if (i < path.length)
                code = path.charCodeAt(i);
            else if (code === 47 /*/*/)
                break;
            else
                code = 47 /*/*/;
            if (code === 47 /*/*/) {
                if (lastSlash === i - 1 || dots === 1) ;
                else if (lastSlash !== i - 1 && dots === 2) {
                    if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
                        if (res.length > 2) {
                            var lastSlashIndex = res.lastIndexOf('/');
                            if (lastSlashIndex !== res.length - 1) {
                                if (lastSlashIndex === -1) {
                                    res = '';
                                    lastSegmentLength = 0;
                                }
                                else {
                                    res = res.slice(0, lastSlashIndex);
                                    lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
                                }
                                lastSlash = i;
                                dots = 0;
                                continue;
                            }
                        }
                        else if (res.length === 2 || res.length === 1) {
                            res = '';
                            lastSegmentLength = 0;
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    if (allowAboveRoot) {
                        if (res.length > 0)
                            res += '/..';
                        else
                            res = '..';
                        lastSegmentLength = 2;
                    }
                }
                else {
                    if (res.length > 0)
                        res += '/' + path.slice(lastSlash + 1, i);
                    else
                        res = path.slice(lastSlash + 1, i);
                    lastSegmentLength = i - lastSlash - 1;
                }
                lastSlash = i;
                dots = 0;
            }
            else if (code === 46 /*.*/ && dots !== -1) {
                ++dots;
            }
            else {
                dots = -1;
            }
        }
        return res;
    }
    static posixResolve(...args) {
        var resolvedPath = '';
        var resolvedAbsolute = false;
        var cwd;
        for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path;
            if (i >= 0)
                path = args[i];
            else {
                if (cwd === undefined)
                    cwd = process.cwd();
                path = cwd;
            }
            // Skip empty entries
            if (path.length === 0) {
                continue;
            }
            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        // Normalize the path
        resolvedPath = this.normalizeStringPosix(resolvedPath, !resolvedAbsolute);
        if (resolvedAbsolute) {
            if (resolvedPath.length > 0)
                return '/' + resolvedPath;
            else
                return '/';
        }
        else if (resolvedPath.length > 0) {
            return resolvedPath;
        }
        else {
            return '.';
        }
    }
    static relative(from, to) {
        if (from === to)
            return '';
        from = this.posixResolve(from);
        to = this.posixResolve(to);
        if (from === to)
            return '';
        // Trim any leading backslashes
        var fromStart = 1;
        for (; fromStart < from.length; ++fromStart) {
            if (from.charCodeAt(fromStart) !== 47 /*/*/)
                break;
        }
        var fromEnd = from.length;
        var fromLen = fromEnd - fromStart;
        // Trim any leading backslashes
        var toStart = 1;
        for (; toStart < to.length; ++toStart) {
            if (to.charCodeAt(toStart) !== 47 /*/*/)
                break;
        }
        var toEnd = to.length;
        var toLen = toEnd - toStart;
        // Compare paths to find the longest common path from root
        var length = fromLen < toLen ? fromLen : toLen;
        var lastCommonSep = -1;
        var i = 0;
        for (; i <= length; ++i) {
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === 47 /*/*/) {
                        // We get here if `from` is the exact base path for `to`.
                        // For example: from='/foo/bar'; to='/foo/bar/baz'
                        return to.slice(toStart + i + 1);
                    }
                    else if (i === 0) {
                        // We get here if `from` is the root
                        // For example: from='/'; to='/foo'
                        return to.slice(toStart + i);
                    }
                }
                else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
                        // We get here if `to` is the exact base path for `from`.
                        // For example: from='/foo/bar/baz'; to='/foo/bar'
                        lastCommonSep = i;
                    }
                    else if (i === 0) {
                        // We get here if `to` is the root.
                        // For example: from='/foo'; to='/'
                        lastCommonSep = 0;
                    }
                }
                break;
            }
            var fromCode = from.charCodeAt(fromStart + i);
            var toCode = to.charCodeAt(toStart + i);
            if (fromCode !== toCode)
                break;
            else if (fromCode === 47 /*/*/)
                lastCommonSep = i;
        }
        var out = '';
        // Generate the relative path based on the path difference between `to`
        // and `from`
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
                if (out.length === 0)
                    out += '..';
                else
                    out += '/..';
            }
        }
        // Lastly, append the rest of the destination (`to`) path that comes after
        // the common path parts
        if (out.length > 0)
            return out + to.slice(toStart + lastCommonSep);
        else {
            toStart += lastCommonSep;
            if (to.charCodeAt(toStart) === 47 /*/*/)
                ++toStart;
            return to.slice(toStart);
        }
    }
}

//simple regex
// const markdownLinkOrEmbedRegexSimple = /\[(.*?)\]\((.*?)\)/gim
// const markdownLinkRegexSimple = /(?<!\!)\[(.*?)\]\((.*?)\)/gim;
// const markdownEmbedRegexSimple = /\!\[(.*?)\]\((.*?)\)/gim
// const wikiLinkOrEmbedRegexSimple = /\[\[(.*?)\]\]/gim
// const wikiLinkRegexSimple = /(?<!\!)\[\[(.*?)\]\]/gim;
// const wikiEmbedRegexSimple = /\!\[\[(.*?)\]\]/gim
//with escaping \ characters
const markdownLinkOrEmbedRegexG = /(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/gim;
const markdownLinkRegexG = /(?<!\!)(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)(?:#(.*?))?\)/gim;
const markdownEmbedRegexG = /(?<!\\)\!\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/gim;
const wikiLinkOrEmbedRegexG = /(?<!\\)\[\[(.*?)(?<!\\)\]\]/gim;
const wikiLinkRegexG = /(?<!\!)(?<!\\)\[\[(.*?)(?<!\\)\]\]/gim;
const wikiEmbedRegexG = /(?<!\\)\!\[\[(.*?)(?<!\\)\]\]/gim;
const markdownLinkOrEmbedRegex = /(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/im;
const markdownLinkRegex = /(?<!\!)(?<!\\)\[(.*?)(?<!\\)\]\((.*?)(?<!\\)\)/im;
class LinksHandler {
    constructor(app, consoleLogPrefix = "", ignoreFolders = [], ignoreFiles = []) {
        this.app = app;
        this.consoleLogPrefix = consoleLogPrefix;
        this.ignoreFolders = ignoreFolders;
        this.ignoreFiles = ignoreFiles;
    }
    isPathIgnored(path) {
        if (path.startsWith("./"))
            path = path.substring(2);
        for (let folder of this.ignoreFolders) {
            if (path.startsWith(folder)) {
                return true;
            }
        }
        for (let file of this.ignoreFiles) {
            if (path == file) {
                return true;
            }
        }
    }
    checkIsCorrectMarkdownEmbed(text) {
        let elements = text.match(markdownEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectMarkdownLink(text) {
        let elements = text.match(markdownLinkRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectMarkdownEmbedOrLink(text) {
        let elements = text.match(markdownLinkOrEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectWikiEmbed(text) {
        let elements = text.match(wikiEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectWikiLink(text) {
        let elements = text.match(wikiLinkRegexG);
        return (elements != null && elements.length > 0);
    }
    checkIsCorrectWikiEmbedOrLink(text) {
        let elements = text.match(wikiLinkOrEmbedRegexG);
        return (elements != null && elements.length > 0);
    }
    getFileByLink(link, owningNotePath) {
        let li = this.splitLinkToPathAndSection(link);
        let fullPath = this.getFullPathForLink(li.link, owningNotePath);
        let file = this.getFileByPath(fullPath);
        return file;
    }
    getFileByPath(path) {
        path = Utils.normalizePathForFile(path);
        let files = this.app.vault.getFiles();
        let file = files.find(file => Utils.normalizePathForFile(file.path) === path);
        return file;
    }
    getFullPathForLink(link, owningNotePath) {
        link = this.splitLinkToPathAndSection(link).link;
        link = Utils.normalizePathForFile(link);
        owningNotePath = Utils.normalizePathForFile(owningNotePath);
        let parentFolder = owningNotePath.substring(0, owningNotePath.lastIndexOf("/"));
        let fullPath = path.join(parentFolder, link);
        fullPath = Utils.normalizePathForFile(fullPath);
        return fullPath;
    }
    getAllCachedLinksToFile(filePath) {
        var _a;
        let allLinks = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (note.path == filePath)
                    continue;
                //!!! this can return undefined if note was just updated
                let links = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.links;
                if (links) {
                    for (let link of links) {
                        let linkFullPath = this.getFullPathForLink(link.link, note.path);
                        if (linkFullPath == filePath) {
                            if (!allLinks[note.path])
                                allLinks[note.path] = [];
                            allLinks[note.path].push(link);
                        }
                    }
                }
            }
        }
        return allLinks;
    }
    getAllCachedEmbedsToFile(filePath) {
        var _a;
        let allEmbeds = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (note.path == filePath)
                    continue;
                //!!! this can return undefined if note was just updated
                let embeds = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.embeds;
                if (embeds) {
                    for (let embed of embeds) {
                        let linkFullPath = this.getFullPathForLink(embed.link, note.path);
                        if (linkFullPath == filePath) {
                            if (!allEmbeds[note.path])
                                allEmbeds[note.path] = [];
                            allEmbeds[note.path].push(embed);
                        }
                    }
                }
            }
        }
        return allEmbeds;
    }
    getAllBadLinks() {
        var _a;
        let allLinks = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (this.isPathIgnored(note.path))
                    continue;
                //!!! this can return undefined if note was just updated
                let links = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.links;
                if (links) {
                    for (let link of links) {
                        if (link.link.startsWith("#")) //internal section link
                            continue;
                        if (this.checkIsCorrectWikiLink(link.original))
                            continue;
                        let file = this.getFileByLink(link.link, note.path);
                        if (!file) {
                            if (!allLinks[note.path])
                                allLinks[note.path] = [];
                            allLinks[note.path].push(link);
                        }
                    }
                }
            }
        }
        return allLinks;
    }
    getAllBadEmbeds() {
        var _a;
        let allEmbeds = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (this.isPathIgnored(note.path))
                    continue;
                //!!! this can return undefined if note was just updated
                let embeds = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.embeds;
                if (embeds) {
                    for (let embed of embeds) {
                        if (this.checkIsCorrectWikiEmbed(embed.original))
                            continue;
                        let file = this.getFileByLink(embed.link, note.path);
                        if (!file) {
                            if (!allEmbeds[note.path])
                                allEmbeds[note.path] = [];
                            allEmbeds[note.path].push(embed);
                        }
                    }
                }
            }
        }
        return allEmbeds;
    }
    getAllGoodLinks() {
        var _a;
        let allLinks = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (this.isPathIgnored(note.path))
                    continue;
                //!!! this can return undefined if note was just updated
                let links = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.links;
                if (links) {
                    for (let link of links) {
                        if (link.link.startsWith("#")) //internal section link
                            continue;
                        if (this.checkIsCorrectWikiLink(link.original))
                            continue;
                        let file = this.getFileByLink(link.link, note.path);
                        if (file) {
                            if (!allLinks[note.path])
                                allLinks[note.path] = [];
                            allLinks[note.path].push(link);
                        }
                    }
                }
            }
        }
        return allLinks;
    }
    getAllBadSectionLinks() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let allLinks = {};
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    //!!! this can return undefined if note was just updated
                    let links = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.links;
                    if (links) {
                        for (let link of links) {
                            if (this.checkIsCorrectWikiLink(link.original))
                                continue;
                            let li = this.splitLinkToPathAndSection(link.link);
                            if (!li.hasSection)
                                continue;
                            let file = this.getFileByLink(link.link, note.path);
                            if (file) {
                                if (file.extension === "pdf" && li.section.startsWith("page=")) {
                                    continue;
                                }
                                let text = yield this.app.vault.read(file);
                                let section = Utils.normalizeLinkSection(li.section);
                                if (section.startsWith("^")) //skip ^ links
                                    continue;
                                let regex = /[ !@$%^&*()-=_+\\/;'\[\]\"\|\?.\,\<\>\`\~\{\}]/gim;
                                text = text.replace(regex, '');
                                section = section.replace(regex, '');
                                if (!text.contains("#" + section)) {
                                    if (!allLinks[note.path])
                                        allLinks[note.path] = [];
                                    allLinks[note.path].push(link);
                                }
                            }
                        }
                    }
                }
            }
            return allLinks;
        });
    }
    getAllGoodEmbeds() {
        var _a;
        let allEmbeds = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (this.isPathIgnored(note.path))
                    continue;
                //!!! this can return undefined if note was just updated
                let embeds = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.embeds;
                if (embeds) {
                    for (let embed of embeds) {
                        if (this.checkIsCorrectWikiEmbed(embed.original))
                            continue;
                        let file = this.getFileByLink(embed.link, note.path);
                        if (file) {
                            if (!allEmbeds[note.path])
                                allEmbeds[note.path] = [];
                            allEmbeds[note.path].push(embed);
                        }
                    }
                }
            }
        }
        return allEmbeds;
    }
    getAllWikiLinks() {
        var _a;
        let allLinks = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (this.isPathIgnored(note.path))
                    continue;
                //!!! this can return undefined if note was just updated
                let links = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.links;
                if (links) {
                    for (let link of links) {
                        if (!this.checkIsCorrectWikiLink(link.original))
                            continue;
                        if (!allLinks[note.path])
                            allLinks[note.path] = [];
                        allLinks[note.path].push(link);
                    }
                }
            }
        }
        return allLinks;
    }
    getAllWikiEmbeds() {
        var _a;
        let allEmbeds = {};
        let notes = this.app.vault.getMarkdownFiles();
        if (notes) {
            for (let note of notes) {
                if (this.isPathIgnored(note.path))
                    continue;
                //!!! this can return undefined if note was just updated
                let embeds = (_a = this.app.metadataCache.getCache(note.path)) === null || _a === void 0 ? void 0 : _a.embeds;
                if (embeds) {
                    for (let embed of embeds) {
                        if (!this.checkIsCorrectWikiEmbed(embed.original))
                            continue;
                        if (!allEmbeds[note.path])
                            allEmbeds[note.path] = [];
                        allEmbeds[note.path].push(embed);
                    }
                }
            }
        }
        return allEmbeds;
    }
    updateLinksToRenamedFile(oldNotePath, newNotePath, changelinksAlt = false, useBuiltInObsidianLinkCaching = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(oldNotePath) || this.isPathIgnored(newNotePath))
                return;
            let notes = useBuiltInObsidianLinkCaching ? this.getCachedNotesThatHaveLinkToFile(oldNotePath) : yield this.getNotesThatHaveLinkToFile(oldNotePath);
            let links = [{ oldPath: oldNotePath, newPath: newNotePath }];
            if (notes) {
                for (let note of notes) {
                    yield this.updateChangedPathsInNote(note, links, changelinksAlt);
                }
            }
        });
    }
    updateChangedPathInNote(notePath, oldLink, newLink, changelinksAlt = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let changes = [{ oldPath: oldLink, newPath: newLink }];
            return yield this.updateChangedPathsInNote(notePath, changes, changelinksAlt);
        });
    }
    updateChangedPathsInNote(notePath, changedLinks, changelinksAlt = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let file = this.getFileByPath(notePath);
            if (!file) {
                console.error(this.consoleLogPrefix + "cant update links in note, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(file);
            let dirty = false;
            let elements = text.match(markdownLinkOrEmbedRegexG);
            if (elements != null && elements.length > 0) {
                for (let el of elements) {
                    let alt = el.match(markdownLinkOrEmbedRegex)[1];
                    let link = el.match(markdownLinkOrEmbedRegex)[2];
                    let li = this.splitLinkToPathAndSection(link);
                    if (li.hasSection) // for links with sections like [](note.md#section)
                        link = li.link;
                    let fullLink = this.getFullPathForLink(link, notePath);
                    for (let changedLink of changedLinks) {
                        if (fullLink == changedLink.oldPath) {
                            let newRelLink = path.relative(notePath, changedLink.newPath);
                            newRelLink = Utils.normalizePathForLink(newRelLink);
                            if (newRelLink.startsWith("../")) {
                                newRelLink = newRelLink.substring(3);
                            }
                            if (changelinksAlt && newRelLink.endsWith(".md")) {
                                //rename only if old alt == old note name
                                if (alt === path.basename(changedLink.oldPath, path.extname(changedLink.oldPath))) {
                                    let ext = path.extname(newRelLink);
                                    let baseName = path.basename(newRelLink, ext);
                                    alt = Utils.normalizePathForFile(baseName);
                                }
                            }
                            if (li.hasSection)
                                text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + '#' + li.section + ')');
                            else
                                text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + ')');
                            dirty = true;
                            console.log(this.consoleLogPrefix + "link updated in cached note [note, old link, new link]: \n   "
                                + file.path + "\n   " + link + "\n   " + newRelLink);
                        }
                    }
                }
            }
            if (dirty)
                yield this.app.vault.modify(file, text);
        });
    }
    updateInternalLinksInMovedNote(oldNotePath, newNotePath, attachmentsAlreadyMoved) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(oldNotePath) || this.isPathIgnored(newNotePath))
                return;
            let file = this.getFileByPath(newNotePath);
            if (!file) {
                console.error(this.consoleLogPrefix + "cant update internal links, file not found: " + newNotePath);
                return;
            }
            let text = yield this.app.vault.read(file);
            let dirty = false;
            let elements = text.match(markdownLinkOrEmbedRegexG);
            if (elements != null && elements.length > 0) {
                for (let el of elements) {
                    let alt = el.match(markdownLinkOrEmbedRegex)[1];
                    let link = el.match(markdownLinkOrEmbedRegex)[2];
                    let li = this.splitLinkToPathAndSection(link);
                    if (link.startsWith("#")) //internal section link
                        continue;
                    if (li.hasSection) // for links with sections like [](note.md#section)
                        link = li.link;
                    //startsWith("../") - for not skipping files that not in the note dir
                    if (attachmentsAlreadyMoved && !link.endsWith(".md") && !link.startsWith("../"))
                        continue;
                    let file = this.getFileByLink(link, oldNotePath);
                    if (!file) {
                        file = this.getFileByLink(link, newNotePath);
                        if (!file) {
                            console.error(this.consoleLogPrefix + newNotePath + " has bad link (file does not exist): " + link);
                            continue;
                        }
                    }
                    let newRelLink = path.relative(newNotePath, file.path);
                    newRelLink = Utils.normalizePathForLink(newRelLink);
                    if (newRelLink.startsWith("../")) {
                        newRelLink = newRelLink.substring(3);
                    }
                    if (li.hasSection)
                        text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + '#' + li.section + ')');
                    else
                        text = text.replace(el, '[' + alt + ']' + '(' + newRelLink + ')');
                    dirty = true;
                    console.log(this.consoleLogPrefix + "link updated in moved note [note, old link, new link]: \n   "
                        + file.path + "\n   " + link + "   \n" + newRelLink);
                }
            }
            if (dirty)
                yield this.app.vault.modify(file, text);
        });
    }
    getCachedNotesThatHaveLinkToFile(filePath) {
        var _a, _b;
        let notes = [];
        let allNotes = this.app.vault.getMarkdownFiles();
        if (allNotes) {
            for (let note of allNotes) {
                if (this.isPathIgnored(note.path))
                    continue;
                let notePath = note.path;
                if (note.path == filePath)
                    continue;
                //!!! this can return undefined if note was just updated
                let embeds = (_a = this.app.metadataCache.getCache(notePath)) === null || _a === void 0 ? void 0 : _a.embeds;
                if (embeds) {
                    for (let embed of embeds) {
                        let linkPath = this.getFullPathForLink(embed.link, note.path);
                        if (linkPath == filePath) {
                            if (!notes.contains(notePath))
                                notes.push(notePath);
                        }
                    }
                }
                //!!! this can return undefined if note was just updated
                let links = (_b = this.app.metadataCache.getCache(notePath)) === null || _b === void 0 ? void 0 : _b.links;
                if (links) {
                    for (let link of links) {
                        let linkPath = this.getFullPathForLink(link.link, note.path);
                        if (linkPath == filePath) {
                            if (!notes.contains(notePath))
                                notes.push(notePath);
                        }
                    }
                }
            }
        }
        return notes;
    }
    getNotesThatHaveLinkToFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let notes = [];
            let allNotes = this.app.vault.getMarkdownFiles();
            if (allNotes) {
                for (let note of allNotes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let notePath = note.path;
                    if (notePath == filePath)
                        continue;
                    let links = yield this.getLinksFromNote(notePath);
                    for (let link of links) {
                        let li = this.splitLinkToPathAndSection(link.link);
                        let linkFullPath = this.getFullPathForLink(li.link, notePath);
                        if (linkFullPath == filePath) {
                            if (!notes.contains(notePath))
                                notes.push(notePath);
                        }
                    }
                }
            }
            return notes;
        });
    }
    splitLinkToPathAndSection(link) {
        let res = {
            hasSection: false,
            link: link,
            section: ""
        };
        if (!link.contains('#'))
            return res;
        let linkBeforeHash = link.match(/(.*?)#(.*?)$/)[1];
        let section = link.match(/(.*?)#(.*?)$/)[2];
        let isMarkdownSection = section != "" && linkBeforeHash.endsWith(".md"); // for links with sections like [](note.md#section)
        let isPdfPageSection = section.startsWith("page=") && linkBeforeHash.endsWith(".pdf"); // for links with sections like [](note.pdf#page=42)
        if (isMarkdownSection || isPdfPageSection) {
            res = {
                hasSection: true,
                link: linkBeforeHash,
                section: section
            };
        }
        return res;
    }
    getFilePathWithRenamedBaseName(filePath, newBaseName) {
        return Utils.normalizePathForFile(path.join(path.dirname(filePath), newBaseName + path.extname(filePath)));
    }
    getLinksFromNote(notePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = this.getFileByPath(notePath);
            if (!file) {
                console.error(this.consoleLogPrefix + "cant get embeds, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(file);
            let links = [];
            let elements = text.match(markdownLinkOrEmbedRegexG);
            if (elements != null && elements.length > 0) {
                for (let el of elements) {
                    let alt = el.match(markdownLinkOrEmbedRegex)[1];
                    let link = el.match(markdownLinkOrEmbedRegex)[2];
                    let emb = {
                        link: link,
                        displayText: alt,
                        original: el,
                        position: {
                            start: {
                                col: 0,
                                line: 0,
                                offset: 0
                            },
                            end: {
                                col: 0,
                                line: 0,
                                offset: 0
                            }
                        }
                    };
                    links.push(emb);
                }
            }
            return links;
        });
    }
    convertAllNoteEmbedsPathsToRelative(notePath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let changedEmbeds = [];
            let embeds = (_a = this.app.metadataCache.getCache(notePath)) === null || _a === void 0 ? void 0 : _a.embeds;
            if (embeds) {
                for (let embed of embeds) {
                    let isMarkdownEmbed = this.checkIsCorrectMarkdownEmbed(embed.original);
                    let isWikiEmbed = this.checkIsCorrectWikiEmbed(embed.original);
                    if (isMarkdownEmbed || isWikiEmbed) {
                        let file = this.getFileByLink(embed.link, notePath);
                        if (file)
                            continue;
                        file = this.app.metadataCache.getFirstLinkpathDest(embed.link, notePath);
                        if (file) {
                            let newRelLink = path.relative(notePath, file.path);
                            newRelLink = isMarkdownEmbed ? Utils.normalizePathForLink(newRelLink) : Utils.normalizePathForFile(newRelLink);
                            if (newRelLink.startsWith("../")) {
                                newRelLink = newRelLink.substring(3);
                            }
                            changedEmbeds.push({ old: embed, newLink: newRelLink });
                        }
                        else {
                            console.error(this.consoleLogPrefix + notePath + " has bad embed (file does not exist): " + embed.link);
                        }
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad embed (format of link is not markdown or wikilink): " + embed.original);
                    }
                }
            }
            yield this.updateChangedEmbedInNote(notePath, changedEmbeds);
            return changedEmbeds;
        });
    }
    convertAllNoteLinksPathsToRelative(notePath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let changedLinks = [];
            let links = (_a = this.app.metadataCache.getCache(notePath)) === null || _a === void 0 ? void 0 : _a.links;
            if (links) {
                for (let link of links) {
                    let isMarkdownLink = this.checkIsCorrectMarkdownLink(link.original);
                    let isWikiLink = this.checkIsCorrectWikiLink(link.original);
                    if (isMarkdownLink || isWikiLink) {
                        if (link.link.startsWith("#")) //internal section link
                            continue;
                        let file = this.getFileByLink(link.link, notePath);
                        if (file)
                            continue;
                        //!!! link.displayText is always "" - OBSIDIAN BUG?, so get display text manualy
                        if (isMarkdownLink) {
                            let elements = link.original.match(markdownLinkRegex);
                            if (elements)
                                link.displayText = elements[1];
                        }
                        file = this.app.metadataCache.getFirstLinkpathDest(link.link, notePath);
                        if (file) {
                            let newRelLink = path.relative(notePath, file.path);
                            newRelLink = isMarkdownLink ? Utils.normalizePathForLink(newRelLink) : Utils.normalizePathForFile(newRelLink);
                            if (newRelLink.startsWith("../")) {
                                newRelLink = newRelLink.substring(3);
                            }
                            changedLinks.push({ old: link, newLink: newRelLink });
                        }
                        else {
                            console.error(this.consoleLogPrefix + notePath + " has bad link (file does not exist): " + link.link);
                        }
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad link (format of link is not markdown or wikilink): " + link.original);
                    }
                }
            }
            yield this.updateChangedLinkInNote(notePath, changedLinks);
            return changedLinks;
        });
    }
    updateChangedEmbedInNote(notePath, changedEmbeds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let noteFile = this.getFileByPath(notePath);
            if (!noteFile) {
                console.error(this.consoleLogPrefix + "cant update embeds in note, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(noteFile);
            let dirty = false;
            if (changedEmbeds && changedEmbeds.length > 0) {
                for (let embed of changedEmbeds) {
                    if (embed.old.link == embed.newLink)
                        continue;
                    if (this.checkIsCorrectMarkdownEmbed(embed.old.original)) {
                        text = text.replace(embed.old.original, '![' + embed.old.displayText + ']' + '(' + embed.newLink + ')');
                    }
                    else if (this.checkIsCorrectWikiEmbed(embed.old.original)) {
                        text = text.replace(embed.old.original, '![[' + embed.newLink + ']]');
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad embed (format of link is not maekdown or wikilink): " + embed.old.original);
                        continue;
                    }
                    console.log(this.consoleLogPrefix + "embed updated in note [note, old link, new link]: \n   "
                        + noteFile.path + "\n   " + embed.old.link + "\n   " + embed.newLink);
                    dirty = true;
                }
            }
            if (dirty)
                yield this.app.vault.modify(noteFile, text);
        });
    }
    updateChangedLinkInNote(notePath, chandedLinks) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let noteFile = this.getFileByPath(notePath);
            if (!noteFile) {
                console.error(this.consoleLogPrefix + "cant update links in note, file not found: " + notePath);
                return;
            }
            let text = yield this.app.vault.read(noteFile);
            let dirty = false;
            if (chandedLinks && chandedLinks.length > 0) {
                for (let link of chandedLinks) {
                    if (link.old.link == link.newLink)
                        continue;
                    if (this.checkIsCorrectMarkdownLink(link.old.original)) {
                        text = text.replace(link.old.original, '[' + link.old.displayText + ']' + '(' + link.newLink + ')');
                    }
                    else if (this.checkIsCorrectWikiLink(link.old.original)) {
                        text = text.replace(link.old.original, '[[' + link.newLink + ']]');
                    }
                    else {
                        console.error(this.consoleLogPrefix + notePath + " has bad link (format of link is not maekdown or wikilink): " + link.old.original);
                        continue;
                    }
                    console.log(this.consoleLogPrefix + "cached link updated in note [note, old link, new link]: \n   "
                        + noteFile.path + "\n   " + link.old.link + "\n   " + link.newLink);
                    dirty = true;
                }
            }
            if (dirty)
                yield this.app.vault.modify(noteFile, text);
        });
    }
    replaceAllNoteWikilinksWithMarkdownLinks(notePath) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let res = {
                links: [],
                embeds: [],
            };
            let noteFile = this.getFileByPath(notePath);
            if (!noteFile) {
                console.error(this.consoleLogPrefix + "cant update wikilinks in note, file not found: " + notePath);
                return;
            }
            let links = (_a = this.app.metadataCache.getCache(notePath)) === null || _a === void 0 ? void 0 : _a.links;
            let embeds = (_b = this.app.metadataCache.getCache(notePath)) === null || _b === void 0 ? void 0 : _b.embeds;
            let text = yield this.app.vault.read(noteFile);
            let dirty = false;
            if (embeds) { //embeds must go first!
                for (let embed of embeds) {
                    if (this.checkIsCorrectWikiEmbed(embed.original)) {
                        let newPath = Utils.normalizePathForLink(embed.link);
                        let newLink = '![' + ']' + '(' + newPath + ')';
                        text = text.replace(embed.original, newLink);
                        console.log(this.consoleLogPrefix + "wikilink (embed) replaced in note [note, old link, new link]: \n   "
                            + noteFile.path + "\n   " + embed.original + "\n   " + newLink);
                        res.embeds.push({ old: embed, newLink: newLink });
                        dirty = true;
                    }
                }
            }
            if (links) {
                for (let link of links) {
                    if (this.checkIsCorrectWikiLink(link.original)) {
                        let newPath = Utils.normalizePathForLink(link.link);
                        let file = this.app.metadataCache.getFirstLinkpathDest(link.link, notePath);
                        if (file && file.extension == "md" && !newPath.endsWith(".md"))
                            newPath = newPath + ".md";
                        let newLink = '[' + link.displayText + ']' + '(' + newPath + ')';
                        text = text.replace(link.original, newLink);
                        console.log(this.consoleLogPrefix + "wikilink replaced in note [note, old link, new link]: \n   "
                            + noteFile.path + "\n   " + link.original + "\n   " + newLink);
                        res.links.push({ old: link, newLink: newLink });
                        dirty = true;
                    }
                }
            }
            if (dirty)
                yield this.app.vault.modify(noteFile, text);
            return res;
        });
    }
}

class FilesHandler {
    constructor(app, lh, consoleLogPrefix = "", ignoreFolders = [], ignoreFiles = []) {
        this.app = app;
        this.lh = lh;
        this.consoleLogPrefix = consoleLogPrefix;
        this.ignoreFolders = ignoreFolders;
        this.ignoreFiles = ignoreFiles;
    }
    isPathIgnored(path) {
        if (path.startsWith("./"))
            path = path.substring(2);
        for (let folder of this.ignoreFolders) {
            if (path.startsWith(folder)) {
                return true;
            }
        }
        for (let file of this.ignoreFiles) {
            if (path == file) {
                return true;
            }
        }
    }
    createFolderForAttachmentFromLink(link, owningNotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let newFullPath = this.lh.getFullPathForLink(link, owningNotePath);
            return yield this.createFolderForAttachmentFromPath(newFullPath);
        });
    }
    createFolderForAttachmentFromPath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let newParentFolder = filePath.substring(0, filePath.lastIndexOf("/"));
            try {
                //todo check filder exist
                yield this.app.vault.createFolder(newParentFolder);
            }
            catch (_a) { }
        });
    }
    generateFileCopyName(originalName) {
        let ext = path.extname(originalName);
        let baseName = path.basename(originalName, ext);
        let dir = path.dirname(originalName);
        for (let i = 1; i < 100000; i++) {
            let newName = dir + "/" + baseName + " " + i + ext;
            let existFile = this.lh.getFileByPath(newName);
            if (!existFile)
                return newName;
        }
        return "";
    }
    moveCachedNoteAttachments(oldNotePath, newNotePath, deleteExistFiles, attachmentsSubfolder) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(oldNotePath) || this.isPathIgnored(newNotePath))
                return;
            //try to get embeds for old or new path (metadataCache can be updated or not)		
            //!!! this can return undefined if note was just updated
            let embeds = (_a = this.app.metadataCache.getCache(newNotePath)) === null || _a === void 0 ? void 0 : _a.embeds;
            if (!embeds)
                embeds = (_b = this.app.metadataCache.getCache(oldNotePath)) === null || _b === void 0 ? void 0 : _b.embeds;
            if (!embeds)
                return;
            let result = {
                movedAttachments: [],
                renamedFiles: []
            };
            for (let embed of embeds) {
                let link = embed.link;
                let oldLinkPath = this.lh.getFullPathForLink(link, oldNotePath);
                if (result.movedAttachments.findIndex(x => x.oldPath == oldLinkPath) != -1)
                    continue; //already moved
                let file = this.lh.getFileByLink(link, oldNotePath);
                if (!file) {
                    file = this.lh.getFileByLink(link, newNotePath);
                    if (!file) {
                        console.error(this.consoleLogPrefix + oldNotePath + " has bad embed (file does not exist): " + link);
                        continue;
                    }
                }
                //if attachment not in the note folder, skip it
                // = "." means that note was at root path, so do not skip it
                if (path.dirname(oldNotePath) != "." && !path.dirname(oldLinkPath).startsWith(path.dirname(oldNotePath)))
                    continue;
                let newLinkPath = this.lh.getFullPathForLink(link, newNotePath);
                if (attachmentsSubfolder.contains("${filename}")) {
                    let oldLinkPathBySetting = this.getNewAttachmentPath(file.path, oldNotePath, attachmentsSubfolder);
                    if (oldLinkPath == oldLinkPathBySetting) {
                        newLinkPath = this.getNewAttachmentPath(file.path, newNotePath, attachmentsSubfolder);
                    }
                }
                if (newLinkPath == file.path)
                    continue; //nothing to change
                let res = yield this.moveAttachment(file, newLinkPath, [oldNotePath, newNotePath], deleteExistFiles);
                result.movedAttachments = result.movedAttachments.concat(res.movedAttachments);
                result.renamedFiles = result.renamedFiles.concat(res.renamedFiles);
            }
            return result;
        });
    }
    getNewAttachmentPath(oldAttachmentPath, notePath, subfolderName) {
        let resolvedSubFolderName = subfolderName.replace(/\${filename}/g, path.basename(notePath, ".md"));
        let newPath = (resolvedSubFolderName == "") ? path.dirname(notePath) : path.join(path.dirname(notePath), resolvedSubFolderName);
        newPath = Utils.normalizePathForFile(path.join(newPath, path.basename(oldAttachmentPath)));
        return newPath;
    }
    collectAttachmentsForCachedNote(notePath, subfolderName, deleteExistFiles) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            let result = {
                movedAttachments: [],
                renamedFiles: []
            };
            //!!! this can return undefined if note was just updated
            let embeds = (_a = this.app.metadataCache.getCache(notePath)) === null || _a === void 0 ? void 0 : _a.embeds;
            if (embeds) {
                for (let embed of embeds) {
                    let link = embed.link;
                    let fillPathLink = this.lh.getFullPathForLink(link, notePath);
                    if (result.movedAttachments.findIndex(x => x.oldPath == fillPathLink) != -1)
                        continue; //already moved	
                    let file = this.lh.getFileByLink(link, notePath);
                    if (!file) {
                        console.error(this.consoleLogPrefix + notePath + " has bad embed (file does not exist): " + link);
                        continue;
                    }
                    let newPath = this.getNewAttachmentPath(file.path, notePath, subfolderName);
                    if (newPath == file.path) //nothing to move
                        continue;
                    let res = yield this.moveAttachment(file, newPath, [notePath], deleteExistFiles);
                    result.movedAttachments = result.movedAttachments.concat(res.movedAttachments);
                    result.renamedFiles = result.renamedFiles.concat(res.renamedFiles);
                }
            }
            //!!! this can return undefined if note was just updated
            let links = (_b = this.app.metadataCache.getCache(notePath)) === null || _b === void 0 ? void 0 : _b.links;
            if (links) {
                for (let l of links) {
                    let link = this.lh.splitLinkToPathAndSection(l.link).link;
                    if (link.startsWith("#")) //internal section link
                        continue;
                    if (link.endsWith(".md"))
                        continue;
                    let fillPathLink = this.lh.getFullPathForLink(link, notePath);
                    if (result.movedAttachments.findIndex(x => x.oldPath == fillPathLink) != -1)
                        continue; //already moved	
                    let file = this.lh.getFileByLink(link, notePath);
                    if (!file) {
                        console.error(this.consoleLogPrefix + notePath + " has bad link (file does not exist): " + link);
                        continue;
                    }
                    let newPath = this.getNewAttachmentPath(file.path, notePath, subfolderName);
                    if (newPath == file.path) //nothing to move
                        continue;
                    let res = yield this.moveAttachment(file, newPath, [notePath], deleteExistFiles);
                    result.movedAttachments = result.movedAttachments.concat(res.movedAttachments);
                    result.renamedFiles = result.renamedFiles.concat(res.renamedFiles);
                }
            }
            return result;
        });
    }
    moveAttachment(file, newLinkPath, parentNotePaths, deleteExistFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(file.path))
                return;
            if (file.path == newLinkPath) {
                console.warn(this.consoleLogPrefix + "Cant move file. Source and destination path the same.");
                return;
            }
            let result = {
                movedAttachments: [],
                renamedFiles: []
            };
            yield this.createFolderForAttachmentFromPath(newLinkPath);
            let linkedNotes = this.lh.getCachedNotesThatHaveLinkToFile(file.path);
            if (parentNotePaths) {
                for (let notePath of parentNotePaths) {
                    linkedNotes.remove(notePath);
                }
            }
            //if no other file has link to this file - try to move file
            //if file already exist at new location - delete or move with new name
            if (linkedNotes.length == 0) {
                let existFile = this.lh.getFileByPath(newLinkPath);
                if (!existFile) {
                    //move
                    console.log(this.consoleLogPrefix + "move file [from, to]: \n   " + file.path + "\n   " + newLinkPath);
                    result.movedAttachments.push({ oldPath: file.path, newPath: newLinkPath });
                    yield this.app.vault.rename(file, newLinkPath);
                }
                else {
                    if (deleteExistFiles) {
                        //delete
                        console.log(this.consoleLogPrefix + "delete file: \n   " + file.path);
                        result.movedAttachments.push({ oldPath: file.path, newPath: newLinkPath });
                        yield this.app.vault.trash(file, true);
                    }
                    else {
                        //move with new name
                        let newFileCopyName = this.generateFileCopyName(newLinkPath);
                        console.log(this.consoleLogPrefix + "copy file with new name [from, to]: \n   " + file.path + "\n   " + newFileCopyName);
                        result.movedAttachments.push({ oldPath: file.path, newPath: newFileCopyName });
                        yield this.app.vault.rename(file, newFileCopyName);
                        result.renamedFiles.push({ oldPath: newLinkPath, newPath: newFileCopyName });
                    }
                }
            }
            //if some other file has link to this file - try to copy file
            //if file already exist at new location - copy file with new name or do nothing
            else {
                let existFile = this.lh.getFileByPath(newLinkPath);
                if (!existFile) {
                    //copy
                    console.log(this.consoleLogPrefix + "copy file [from, to]: \n   " + file.path + "\n   " + newLinkPath);
                    result.movedAttachments.push({ oldPath: file.path, newPath: newLinkPath });
                    yield this.app.vault.copy(file, newLinkPath);
                }
                else {
                    if (deleteExistFiles) ;
                    else {
                        //copy with new name
                        let newFileCopyName = this.generateFileCopyName(newLinkPath);
                        console.log(this.consoleLogPrefix + "copy file with new name [from, to]: \n   " + file.path + "\n   " + newFileCopyName);
                        result.movedAttachments.push({ oldPath: file.path, newPath: newFileCopyName });
                        yield this.app.vault.copy(file, newFileCopyName);
                        result.renamedFiles.push({ oldPath: newLinkPath, newPath: newFileCopyName });
                    }
                }
            }
            return result;
        });
    }
    deleteEmptyFolders(dirName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(dirName))
                return;
            if (dirName.startsWith("./"))
                dirName = dirName.substring(2);
            let list = yield this.app.vault.adapter.list(dirName);
            for (let folder of list.folders) {
                yield this.deleteEmptyFolders(folder);
            }
            list = yield this.app.vault.adapter.list(dirName);
            if (list.files.length == 0 && list.folders.length == 0) {
                console.log(this.consoleLogPrefix + "delete empty folder: \n   " + dirName);
                if (yield this.app.vault.adapter.exists(dirName))
                    yield this.app.vault.adapter.rmdir(dirName, false);
            }
        });
    }
    deleteUnusedAttachmentsForCachedNote(notePath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(notePath))
                return;
            //!!! this can return undefined if note was just updated
            let embeds = (_a = this.app.metadataCache.getCache(notePath)) === null || _a === void 0 ? void 0 : _a.embeds;
            if (embeds) {
                for (let embed of embeds) {
                    let link = embed.link;
                    let fullPath = this.lh.getFullPathForLink(link, notePath);
                    let linkedNotes = this.lh.getCachedNotesThatHaveLinkToFile(fullPath);
                    if (linkedNotes.length == 0) {
                        let file = this.lh.getFileByLink(link, notePath);
                        if (file) {
                            try {
                                yield this.app.vault.trash(file, true);
                            }
                            catch (_b) { }
                        }
                    }
                }
            }
        });
    }
}

class ConsistentAttachmentsAndLinks extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.recentlyRenamedFiles = [];
        this.currentlyRenamingFiles = [];
        this.renamingIsActive = false;
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new SettingTab(this.app, this));
            this.registerEvent(this.app.vault.on('delete', (file) => this.handleDeletedFile(file)));
            this.registerEvent(this.app.vault.on('rename', (file, oldPath) => this.handleRenamedFile(file, oldPath)));
            this.addCommand({
                id: 'collect-all-attachments',
                name: 'Collect all attachments',
                callback: () => this.collectAllAttachments()
            });
            this.addCommand({
                id: 'collect-attachments-current-note',
                name: 'Collect attachments in current note',
                editorCallback: (editor, view) => this.collectAttachmentsCurrentNote(editor, view)
            });
            this.addCommand({
                id: 'delete-empty-folders',
                name: 'Delete empty folders',
                callback: () => this.deleteEmptyFolders()
            });
            this.addCommand({
                id: 'convert-all-link-paths-to-relative',
                name: 'Convert all link paths to relative',
                callback: () => this.convertAllLinkPathsToRelative()
            });
            this.addCommand({
                id: 'convert-all-embed-paths-to-relative',
                name: 'Convert all embed paths to relative',
                callback: () => this.convertAllEmbedsPathsToRelative()
            });
            this.addCommand({
                id: 'replace-all-wikilinks-with-markdown-links',
                name: 'Replace all wikilinks with markdown links',
                callback: () => this.replaceAllWikilinksWithMarkdownLinks()
            });
            this.addCommand({
                id: 'reorganize-vault',
                name: 'Reorganize vault',
                callback: () => this.reorganizeVault()
            });
            this.addCommand({
                id: 'check-consistent',
                name: 'Check vault consistent',
                callback: () => this.checkConsistent()
            });
            this.lh = new LinksHandler(this.app, "Consistent attachments and links: ", this.settings.ignoreFolders, this.settings.ignoreFiles);
            this.fh = new FilesHandler(this.app, this.lh, "Consistent attachments and links: ", this.settings.ignoreFolders, this.settings.ignoreFiles);
        });
    }
    isPathIgnored(path) {
        if (path.startsWith("./"))
            path = path.substring(2);
        for (let folder of this.settings.ignoreFolders) {
            if (path.startsWith(folder)) {
                return true;
            }
        }
        for (let file of this.settings.ignoreFiles) {
            if (path == file) {
                return true;
            }
        }
    }
    handleDeletedFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(file.path))
                return;
            let fileExt = file.path.substring(file.path.lastIndexOf("."));
            if (fileExt == ".md") {
                if (this.settings.deleteAttachmentsWithNote) {
                    yield this.fh.deleteUnusedAttachmentsForCachedNote(file.path);
                }
                //delete child folders (do not delete parent)
                if (this.settings.deleteEmptyFolders) {
                    if (yield this.app.vault.adapter.exists(path.dirname(file.path))) {
                        let list = yield this.app.vault.adapter.list(path.dirname(file.path));
                        for (let folder of list.folders) {
                            yield this.fh.deleteEmptyFolders(folder);
                        }
                    }
                }
            }
        });
    }
    handleRenamedFile(file, oldPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.recentlyRenamedFiles.push({ oldPath: oldPath, newPath: file.path });
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => { this.HandleRecentlyRenamedFiles(); }, 3000);
        });
    }
    HandleRecentlyRenamedFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.recentlyRenamedFiles || this.recentlyRenamedFiles.length == 0) //nothing to rename
                return;
            if (this.renamingIsActive) //already started
                return;
            this.renamingIsActive = true;
            this.currentlyRenamingFiles = this.recentlyRenamedFiles; //clear array for pushing new files async
            this.recentlyRenamedFiles = [];
            new obsidian.Notice("Fixing consistent for " + this.currentlyRenamingFiles.length + " renamed files" + "...");
            console.log("Consistent attachments and links:\nFixing consistent for " + this.currentlyRenamingFiles.length + " renamed files" + "...");
            try {
                for (let file of this.currentlyRenamingFiles) {
                    if (this.isPathIgnored(file.newPath) || this.isPathIgnored(file.oldPath))
                        return;
                    // await Utils.delay(10); //waiting for update vault
                    let result;
                    let fileExt = file.oldPath.substring(file.oldPath.lastIndexOf("."));
                    if (fileExt == ".md") {
                        // await Utils.delay(500);//waiting for update metadataCache
                        if ((path.dirname(file.oldPath) != path.dirname(file.newPath)) || (this.settings.attachmentsSubfolder.contains("${filename}"))) {
                            if (this.settings.moveAttachmentsWithNote) {
                                result = yield this.fh.moveCachedNoteAttachments(file.oldPath, file.newPath, this.settings.deleteExistFilesWhenMoveNote, this.settings.attachmentsSubfolder);
                                if (this.settings.updateLinks && result) {
                                    let changedFiles = result.renamedFiles.concat(result.movedAttachments);
                                    if (changedFiles.length > 0) {
                                        yield this.lh.updateChangedPathsInNote(file.newPath, changedFiles);
                                    }
                                }
                            }
                            if (this.settings.updateLinks) {
                                yield this.lh.updateInternalLinksInMovedNote(file.oldPath, file.newPath, this.settings.moveAttachmentsWithNote);
                            }
                            //delete child folders (do not delete parent)
                            if (this.settings.deleteEmptyFolders) {
                                if (yield this.app.vault.adapter.exists(path.dirname(file.oldPath))) {
                                    let list = yield this.app.vault.adapter.list(path.dirname(file.oldPath));
                                    for (let folder of list.folders) {
                                        yield this.fh.deleteEmptyFolders(folder);
                                    }
                                }
                            }
                        }
                    }
                    let updateAlts = this.settings.changeNoteBacklinksAlt && fileExt == ".md";
                    if (this.settings.updateLinks) {
                        yield this.lh.updateLinksToRenamedFile(file.oldPath, file.newPath, updateAlts, this.settings.useBuiltInObsidianLinkCaching);
                    }
                    if (result && result.movedAttachments && result.movedAttachments.length > 0) {
                        new obsidian.Notice("Moved " + result.movedAttachments.length + " attachment" + (result.movedAttachments.length > 1 ? "s" : ""));
                    }
                }
            }
            catch (e) {
                console.error("Consistent attachments and links: \n" + e);
            }
            new obsidian.Notice("Fixing consistent complete");
            console.log("Consistent attachments and links:\nFixing consistent complete");
            this.renamingIsActive = false;
            if (this.recentlyRenamedFiles && this.recentlyRenamedFiles.length > 0) {
                clearTimeout(this.timerId);
                this.timerId = setTimeout(() => { this.HandleRecentlyRenamedFiles(); }, 500);
            }
        });
    }
    collectAttachmentsCurrentNote(editor, view) {
        return __awaiter(this, void 0, void 0, function* () {
            let note = view.file;
            if (this.isPathIgnored(note.path)) {
                new obsidian.Notice("Note path is ignored");
                return;
            }
            let result = yield this.fh.collectAttachmentsForCachedNote(note.path, this.settings.attachmentsSubfolder, this.settings.deleteExistFilesWhenMoveNote);
            if (result && result.movedAttachments && result.movedAttachments.length > 0) {
                yield this.lh.updateChangedPathsInNote(note.path, result.movedAttachments);
            }
            if (result.movedAttachments.length == 0)
                new obsidian.Notice("No files found that need to be moved");
            else
                new obsidian.Notice("Moved " + result.movedAttachments.length + " attachment" + (result.movedAttachments.length > 1 ? "s" : ""));
        });
    }
    collectAllAttachments() {
        return __awaiter(this, void 0, void 0, function* () {
            let movedAttachmentsCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.fh.collectAttachmentsForCachedNote(note.path, this.settings.attachmentsSubfolder, this.settings.deleteExistFilesWhenMoveNote);
                    if (result && result.movedAttachments && result.movedAttachments.length > 0) {
                        yield this.lh.updateChangedPathsInNote(note.path, result.movedAttachments);
                        movedAttachmentsCount += result.movedAttachments.length;
                        processedNotesCount++;
                    }
                }
            }
            if (movedAttachmentsCount == 0)
                new obsidian.Notice("No files found that need to be moved");
            else
                new obsidian.Notice("Moved " + movedAttachmentsCount + " attachment" + (movedAttachmentsCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    convertAllEmbedsPathsToRelative() {
        return __awaiter(this, void 0, void 0, function* () {
            let changedEmbedCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.lh.convertAllNoteEmbedsPathsToRelative(note.path);
                    if (result && result.length > 0) {
                        changedEmbedCount += result.length;
                        processedNotesCount++;
                    }
                }
            }
            if (changedEmbedCount == 0)
                new obsidian.Notice("No embeds found that need to be converted");
            else
                new obsidian.Notice("Converted " + changedEmbedCount + " embed" + (changedEmbedCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    convertAllLinkPathsToRelative() {
        return __awaiter(this, void 0, void 0, function* () {
            let changedLinksCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.lh.convertAllNoteLinksPathsToRelative(note.path);
                    if (result && result.length > 0) {
                        changedLinksCount += result.length;
                        processedNotesCount++;
                    }
                }
            }
            if (changedLinksCount == 0)
                new obsidian.Notice("No links found that need to be converted");
            else
                new obsidian.Notice("Converted " + changedLinksCount + " link" + (changedLinksCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    replaceAllWikilinksWithMarkdownLinks() {
        return __awaiter(this, void 0, void 0, function* () {
            let changedLinksCount = 0;
            let processedNotesCount = 0;
            let notes = this.app.vault.getMarkdownFiles();
            if (notes) {
                for (let note of notes) {
                    if (this.isPathIgnored(note.path))
                        continue;
                    let result = yield this.lh.replaceAllNoteWikilinksWithMarkdownLinks(note.path);
                    if (result && (result.links.length > 0 || result.embeds.length > 0)) {
                        changedLinksCount += result.links.length;
                        changedLinksCount += result.embeds.length;
                        processedNotesCount++;
                    }
                }
            }
            if (changedLinksCount == 0)
                new obsidian.Notice("No wikilinks found that need to be replaced");
            else
                new obsidian.Notice("Replaced " + changedLinksCount + " wikilink" + (changedLinksCount > 1 ? "s" : "")
                    + " from " + processedNotesCount + " note" + (processedNotesCount > 1 ? "s" : ""));
        });
    }
    deleteEmptyFolders() {
        this.fh.deleteEmptyFolders("/");
    }
    checkConsistent() {
        return __awaiter(this, void 0, void 0, function* () {
            let badLinks = this.lh.getAllBadLinks();
            let badSectionLinks = yield this.lh.getAllBadSectionLinks();
            let badEmbeds = this.lh.getAllBadEmbeds();
            let wikiLinks = this.lh.getAllWikiLinks();
            let wikiEmbeds = this.lh.getAllWikiEmbeds();
            let text = "";
            let badLinksCount = Object.keys(badLinks).length;
            let badEmbedsCount = Object.keys(badEmbeds).length;
            let badSectionLinksCount = Object.keys(badSectionLinks).length;
            let wikiLinksCount = Object.keys(wikiLinks).length;
            let wikiEmbedsCount = Object.keys(wikiEmbeds).length;
            if (badLinksCount > 0) {
                text += "# Bad links (" + badLinksCount + " files)\n";
                for (let note in badLinks) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of badLinks[note]) {
                        text += "- (line " + link.position.start.line + "): `" + link.link + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "# Bad links \n";
                text += "No problems found\n\n";
            }
            if (badSectionLinksCount > 0) {
                text += "\n\n# Bad note link sections (" + badSectionLinksCount + " files)\n";
                for (let note in badSectionLinks) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of badSectionLinks[note]) {
                        let li = this.lh.splitLinkToPathAndSection(link.link);
                        let section = Utils.normalizeLinkSection(li.section);
                        text += "- (line " + link.position.start.line + "): `" + li.link + "#" + section + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "\n\n# Bad note link sections\n";
                text += "No problems found\n\n";
            }
            if (badEmbedsCount > 0) {
                text += "\n\n# Bad embeds (" + badEmbedsCount + " files)\n";
                for (let note in badEmbeds) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of badEmbeds[note]) {
                        text += "- (line " + link.position.start.line + "): `" + link.link + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "\n\n# Bad embeds \n";
                text += "No problems found\n\n";
            }
            if (wikiLinksCount > 0) {
                text += "# Wiki links (" + wikiLinksCount + " files)\n";
                for (let note in wikiLinks) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of wikiLinks[note]) {
                        text += "- (line " + link.position.start.line + "): `" + link.original + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "# Wiki links \n";
                text += "No problems found\n\n";
            }
            if (wikiEmbedsCount > 0) {
                text += "\n\n# Wiki embeds (" + wikiEmbedsCount + " files)\n";
                for (let note in wikiEmbeds) {
                    text += "[" + note + "](" + Utils.normalizePathForLink(note) + "): " + "\n";
                    for (let link of wikiEmbeds[note]) {
                        text += "- (line " + link.position.start.line + "): `" + link.original + "`\n";
                    }
                    text += "\n\n";
                }
            }
            else {
                text += "\n\n# Wiki embeds \n";
                text += "No problems found\n\n";
            }
            let notePath = this.settings.consistentReportFile;
            yield this.app.vault.adapter.write(notePath, text);
            let fileOpened = false;
            this.app.workspace.iterateAllLeaves(leaf => {
                if (leaf.getDisplayText() != "" && notePath.startsWith(leaf.getDisplayText())) {
                    fileOpened = true;
                }
            });
            if (!fileOpened)
                this.app.workspace.openLinkText(notePath, "/", false);
        });
    }
    reorganizeVault() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.replaceAllWikilinksWithMarkdownLinks();
            yield this.convertAllEmbedsPathsToRelative();
            yield this.convertAllLinkPathsToRelative();
            //- Rename all attachments (using Unique attachments, optional)
            yield this.collectAllAttachments();
            yield this.deleteEmptyFolders();
            new obsidian.Notice("Reorganization of the vault completed");
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
            this.lh = new LinksHandler(this.app, "Consistent attachments and links: ", this.settings.ignoreFolders, this.settings.ignoreFiles);
            this.fh = new FilesHandler(this.app, this.lh, "Consistent attachments and links: ", this.settings.ignoreFolders, this.settings.ignoreFiles);
        });
    }
}

module.exports = ConsistentAttachmentsAndLinks;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy91dGlscy50cyIsInNyYy9wYXRoLnRzIiwic3JjL2xpbmtzLWhhbmRsZXIudHMiLCJzcmMvZmlsZXMtaGFuZGxlci50cyIsInNyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2NyZWF0ZUJpbmRpbmcgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xyXG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcclxuICAgICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRJbihzdGF0ZSwgcmVjZWl2ZXIpIHtcclxuICAgIGlmIChyZWNlaXZlciA9PT0gbnVsbCB8fCAodHlwZW9mIHJlY2VpdmVyICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWNlaXZlciAhPT0gXCJmdW5jdGlvblwiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgJ2luJyBvcGVyYXRvciBvbiBub24tb2JqZWN0XCIpO1xyXG4gICAgcmV0dXJuIHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgPT09IHN0YXRlIDogc3RhdGUuaGFzKHJlY2VpdmVyKTtcclxufVxyXG4iLCJpbXBvcnQgeyBBcHAsIG5vcm1hbGl6ZVBhdGgsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgQ29uc2lzdGVudEF0dGFjaG1lbnRzQW5kTGlua3MgZnJvbSAnLi9tYWluJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGx1Z2luU2V0dGluZ3Mge1xyXG4gICAgbW92ZUF0dGFjaG1lbnRzV2l0aE5vdGU6IGJvb2xlYW47XHJcbiAgICBkZWxldGVBdHRhY2htZW50c1dpdGhOb3RlOiBib29sZWFuO1xyXG4gICAgdXBkYXRlTGlua3M6IGJvb2xlYW47XHJcbiAgICBkZWxldGVFbXB0eUZvbGRlcnM6IGJvb2xlYW47XHJcbiAgICBkZWxldGVFeGlzdEZpbGVzV2hlbk1vdmVOb3RlOiBib29sZWFuO1xyXG4gICAgY2hhbmdlTm90ZUJhY2tsaW5rc0FsdDogYm9vbGVhbjtcclxuICAgIGlnbm9yZUZvbGRlcnM6IHN0cmluZ1tdO1xyXG4gICAgaWdub3JlRmlsZXM6IHN0cmluZ1tdO1xyXG4gICAgYXR0YWNobWVudHNTdWJmb2xkZXI6IHN0cmluZztcclxuICAgIGNvbnNpc3RlbnRSZXBvcnRGaWxlOiBzdHJpbmc7XHJcbiAgICB1c2VCdWlsdEluT2JzaWRpYW5MaW5rQ2FjaGluZzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFBsdWdpblNldHRpbmdzID0ge1xyXG4gICAgbW92ZUF0dGFjaG1lbnRzV2l0aE5vdGU6IHRydWUsXHJcbiAgICBkZWxldGVBdHRhY2htZW50c1dpdGhOb3RlOiB0cnVlLFxyXG4gICAgdXBkYXRlTGlua3M6IHRydWUsXHJcbiAgICBkZWxldGVFbXB0eUZvbGRlcnM6IHRydWUsXHJcbiAgICBkZWxldGVFeGlzdEZpbGVzV2hlbk1vdmVOb3RlOiB0cnVlLFxyXG4gICAgY2hhbmdlTm90ZUJhY2tsaW5rc0FsdDogZmFsc2UsXHJcbiAgICBpZ25vcmVGb2xkZXJzOiBbXCIuZ2l0L1wiLCBcIi5vYnNpZGlhbi9cIl0sXHJcbiAgICBpZ25vcmVGaWxlczogW1wiY29uc2lzdGFudC1yZXBvcnQubWRcIl0sXHJcbiAgICBhdHRhY2htZW50c1N1YmZvbGRlcjogXCJcIixcclxuICAgIGNvbnNpc3RlbnRSZXBvcnRGaWxlOiBcImNvbnNpc3RhbnQtcmVwb3J0Lm1kXCIsXHJcbiAgICB1c2VCdWlsdEluT2JzaWRpYW5MaW5rQ2FjaGluZzogZmFsc2UsXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgICBwbHVnaW46IENvbnNpc3RlbnRBdHRhY2htZW50c0FuZExpbmtzO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IENvbnNpc3RlbnRBdHRhY2htZW50c0FuZExpbmtzKSB7XHJcbiAgICAgICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xyXG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0NvbnNpc3RlbnQgYXR0YWNobWVudHMgYW5kIGxpbmtzIC0gU2V0dGluZ3MnIH0pO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdNb3ZlIGF0dGFjaG1lbnRzIHdpdGggbm90ZScpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKCdXaGVuIGEgbm90ZSBtb3ZlcywgbW92ZSB3aXRoIGl0IGFueSBhdHRhY2htZW50cyB0aGF0IGFyZSBpbiB0aGUgc2FtZSBmb2xkZXIgYW5kIHN1YmZvbGRlcnMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5tb3ZlQXR0YWNobWVudHNXaXRoTm90ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5tb3ZlQXR0YWNobWVudHNXaXRoTm90ZSkpO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdEZWxldGUgdW51c2VkIGF0dGFjaG1lbnRzIHdpdGggbm90ZScpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKCdXaGVuIHRoZSBub3RlIGlzIGRlbGV0ZWQsIGRlbGV0ZSBhbGwgYXR0YWNobWVudHMgdGhhdCBhcmUgbm8gbG9uZ2VyIHVzZWQgaW4gb3RoZXIgbm90ZXMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWxldGVBdHRhY2htZW50c1dpdGhOb3RlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlbGV0ZUF0dGFjaG1lbnRzV2l0aE5vdGUpKTtcclxuXHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZSgnVXBkYXRlIGxpbmtzJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1VwZGF0ZSBsaW5rcyB0byBhdHRhY2htZW50cyBhbmQgb3RoZXIgbm90ZXMgd2hlbiBtb3Zpbmcgbm90ZXMgb3IgYXR0YWNobWVudHMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy51cGRhdGVMaW5rcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy51cGRhdGVMaW5rcykpO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0RlbGV0ZSBlbXB0eSBmb2xkZXJzJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0RlbGV0ZSBlbXB0eSBmb2xkZXJzIGFmdGVyIG1vdmluZyBub3RlcyB3aXRoIGF0dGFjaG1lbnRzLicpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsZXRlRW1wdHlGb2xkZXJzID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlbGV0ZUVtcHR5Rm9sZGVycykpO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdEZWxldGUgZHVwbGljYXRlIGF0dGFjaG1lbnRzIHdoaWxlIG5vdGUgbW92aW5nJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0RlbGV0ZSBhdHRhY2htZW50IHdoZW4gbW92aW5nIGEgbm90ZSBpZiB0aGVyZSBpcyBhIGZpbGUgd2l0aCB0aGUgc2FtZSBuYW1lIGluIHRoZSBuZXcgZm9sZGVyLiBJZiBkaXNhYmxlZCwgZmlsZSB3aWxsIGJlIHJlbmFtZWQgYW5kIG1vdmVkLicpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWxldGVFeGlzdEZpbGVzV2hlbk1vdmVOb3RlKSk7XHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0NoYW5nZSBiYWNrbGluayB0ZXh0IHdoZW4gcmVuYW1pbmcgYSBub3RlJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1doZW4gdGhlIG5vdGUgaXMgcmVuYW1lZCwgdGhlIGxpbmtzIHRvIGl0IGFyZSB1cGRhdGVkLiBJZiB0aGlzIG9wdGlvbiBpcyBlbmFibGVkLCB0aGUgdGV4dCBvZiBsaW5rcyB0byB0aGlzIG5vdGUgd2lsbCBhbHNvIGJlIGNoYW5nZWQuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jaGFuZ2VOb3RlQmFja2xpbmtzQWx0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNoYW5nZU5vdGVCYWNrbGlua3NBbHQpKTtcclxuXHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJJZ25vcmUgZm9sZGVyc1wiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIkxpc3Qgb2YgZm9sZGVycyB0byBpZ25vcmUuIEVhY2ggZm9sZGVyIG9uIGEgbmV3IGxpbmUuXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYShjYiA9PiBjYlxyXG4gICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRXhhbXBsZTogLmdpdCwgLm9ic2lkaWFuXCIpXHJcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlRm9sZGVycy5qb2luKFwiXFxuXCIpKVxyXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXRocyA9IHZhbHVlLnRyaW0oKS5zcGxpdChcIlxcblwiKS5tYXAodmFsdWUgPT4gdGhpcy5nZXROb3JtYWxpemVkUGF0aCh2YWx1ZSkgKyBcIi9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlRm9sZGVycyA9IHBhdGhzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJJZ25vcmUgZmlsZXNcIilcclxuICAgICAgICAgICAgLnNldERlc2MoXCJMaXN0IG9mIGZpbGVzIHRvIGlnbm9yZS4gRWFjaCBmaWxlIG9uIGEgbmV3IGxpbmUuXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYShjYiA9PiBjYlxyXG4gICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRXhhbXBsZTogY29uc2lzdGFudC1yZXBvcnQubWRcIilcclxuICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5pZ25vcmVGaWxlcy5qb2luKFwiXFxuXCIpKVxyXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXRocyA9IHZhbHVlLnRyaW0oKS5zcGxpdChcIlxcblwiKS5tYXAodmFsdWUgPT4gdGhpcy5nZXROb3JtYWxpemVkUGF0aCh2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZUZpbGVzID0gcGF0aHM7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIkF0dGFjaG1lbnRzIHN1YmZvbGRlclwiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIkNvbGxlY3QgYXR0YWNobWVudHMgaW4gdGhpcyBzdWJmb2xkZXIgb2YgdGhlIG5vdGUgZm9sZGVyICh3aGVuIHVzaW5nIHRoZSBcXFwiQ29sbGVjdCBhbGwgYXR0YWNobWVudHNcXFwiIGhvdGtleSkuIExlYXZlIGVtcHR5IHRvIGNvbGxlY3QgYXR0YWNobWVudHMgdG8gdGhlIG5vdGUgZm9sZGVyIHdpdGhvdXQgc3ViZm9sZGVycy4gWW91IGNhbiB1c2UgJHtmaWxlbmFtZX0gYXMgYSBwbGFjZWhvbGRlciBmb3IgY3VycmVudCBub3RlIG5hbWVcIilcclxuICAgICAgICAgICAgLmFkZFRleHQoY2IgPT4gY2JcclxuICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4YW1wbGU6IF9hdHRhY2htZW50c1wiKVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF0dGFjaG1lbnRzU3ViZm9sZGVyKVxyXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF0dGFjaG1lbnRzU3ViZm9sZGVyID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJDb25zaXN0YW50IHJlcG9ydCBmaWxlIG5hbWVcIilcclxuICAgICAgICAgICAgLnNldERlc2MoXCJcIilcclxuICAgICAgICAgICAgLmFkZFRleHQoY2IgPT4gY2JcclxuICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4YW1wbGU6IGNvbnNpc3RhbnQtcmVwb3J0Lm1kXCIpXHJcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uc2lzdGVudFJlcG9ydEZpbGUpXHJcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uc2lzdGVudFJlcG9ydEZpbGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIkVYUEVSSU1FTlRBTDogVXNlIGJ1aWx0LWluIE9ic2lkaWFuIGxpbmsgY2FjaGluZyB0byBwcm9jZXNzIG1vdmVkIG5vdGVzXCIpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKFwiVHVybiBpdCBvZmYgaWYgcGx1Z2luIG1pc2JlaGF2ZXNcIilcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy51c2VCdWlsdEluT2JzaWRpYW5MaW5rQ2FjaGluZyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy51c2VCdWlsdEluT2JzaWRpYW5MaW5rQ2FjaGluZykpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE5vcm1hbGl6ZWRQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGgubGVuZ3RoID09IDAgPyBwYXRoIDogbm9ybWFsaXplUGF0aChwYXRoKTtcclxuICAgIH1cclxufSIsImV4cG9ydCBjbGFzcyBVdGlscyB7XHJcblxyXG5cdHN0YXRpYyBhc3luYyBkZWxheShtczogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XHJcblx0fVxyXG5cclxuXHJcblx0c3RhdGljIG5vcm1hbGl6ZVBhdGhGb3JGaWxlKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKC9cXFxcL2dpLCBcIi9cIik7IC8vcmVwbGFjZSBcXCB0byAvXHJcblx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKC8lMjAvZ2ksIFwiIFwiKTsgLy9yZXBsYWNlICUyMCB0byBzcGFjZVxyXG5cdFx0cmV0dXJuIHBhdGg7XHJcblx0fVxyXG5cclxuXHJcblx0c3RhdGljIG5vcm1hbGl6ZVBhdGhGb3JMaW5rKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKC9cXFxcL2dpLCBcIi9cIik7IC8vcmVwbGFjZSBcXCB0byAvXHJcblx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKC8gL2dpLCBcIiUyMFwiKTsgLy9yZXBsYWNlIHNwYWNlIHRvICUyMFxyXG5cdFx0cmV0dXJuIHBhdGg7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbm9ybWFsaXplTGlua1NlY3Rpb24oc2VjdGlvbjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHNlY3Rpb24gPSBkZWNvZGVVUkkoc2VjdGlvbik7XHJcblx0XHRyZXR1cm4gc2VjdGlvbjtcclxuXHR9XHJcbn0iLCJleHBvcnQgY2xhc3MgcGF0aCB7XHJcbiAgICBzdGF0aWMgam9pbiguLi5wYXJ0czogc3RyaW5nW10pIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuICcuJztcclxuICAgICAgICB2YXIgam9pbmVkO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGlmIChhcmcubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIGpvaW5lZCA9IGFyZztcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBqb2luZWQgKz0gJy8nICsgYXJnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgcmV0dXJuICcuJztcclxuICAgICAgICByZXR1cm4gdGhpcy5wb3NpeE5vcm1hbGl6ZShqb2luZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBkaXJuYW1lKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcclxuICAgICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcclxuICAgICAgICB2YXIgaGFzUm9vdCA9IGNvZGUgPT09IDQ3IC8qLyovO1xyXG4gICAgICAgIHZhciBlbmQgPSAtMTtcclxuICAgICAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xyXG4gICAgICAgICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHJldHVybiBoYXNSb290ID8gJy8nIDogJy4nO1xyXG4gICAgICAgIGlmIChoYXNSb290ICYmIGVuZCA9PT0gMSkgcmV0dXJuICcvLyc7XHJcbiAgICAgICAgcmV0dXJuIHBhdGguc2xpY2UoMCwgZW5kKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYmFzZW5hbWUocGF0aDogc3RyaW5nLCBleHQ/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGV4dCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZXh0XCIgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZycpO1xyXG5cclxuICAgICAgICB2YXIgc3RhcnQgPSAwO1xyXG4gICAgICAgIHZhciBlbmQgPSAtMTtcclxuICAgICAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgaWYgKGV4dCAhPT0gdW5kZWZpbmVkICYmIGV4dC5sZW5ndGggPiAwICYmIGV4dC5sZW5ndGggPD0gcGF0aC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKGV4dC5sZW5ndGggPT09IHBhdGgubGVuZ3RoICYmIGV4dCA9PT0gcGF0aCkgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICB2YXIgZXh0SWR4ID0gZXh0Lmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIHZhciBmaXJzdE5vblNsYXNoRW5kID0gLTE7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdE5vblNsYXNoRW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgcmVtZW1iZXIgdGhpcyBpbmRleCBpbiBjYXNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgaXQgaWYgdGhlIGV4dGVuc2lvbiBlbmRzIHVwIG5vdCBtYXRjaGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROb25TbGFzaEVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXh0SWR4ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIHRoZSBleHBsaWNpdCBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IGV4dC5jaGFyQ29kZUF0KGV4dElkeCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLWV4dElkeCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIHRoZSBleHRlbnNpb24sIHNvIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91ciBwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dGVuc2lvbiBkb2VzIG5vdCBtYXRjaCwgc28gb3VyIHJlc3VsdCBpcyB0aGUgZW50aXJlIHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0SWR4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc3RhcnQgPT09IGVuZCkgZW5kID0gZmlyc3ROb25TbGFzaEVuZDsgZWxzZSBpZiAoZW5kID09PSAtMSkgZW5kID0gcGF0aC5sZW5ndGg7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcGF0aCBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHJldHVybiAnJztcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBleHRuYW1lKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIHZhciBzdGFydERvdCA9IC0xO1xyXG4gICAgICAgIHZhciBzdGFydFBhcnQgPSAwO1xyXG4gICAgICAgIHZhciBlbmQgPSAtMTtcclxuICAgICAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXHJcbiAgICAgICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcclxuICAgICAgICB2YXIgcHJlRG90U3RhdGUgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxyXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RG90ID0gaTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKVxyXG4gICAgICAgICAgICAgICAgICAgIHByZURvdFN0YXRlID0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgYW5kIG5vbi1wYXRoIHNlcGFyYXRvciBiZWZvcmUgb3VyIGRvdCwgc28gd2Ugc2hvdWxkXHJcbiAgICAgICAgICAgICAgICAvLyBoYXZlIGEgZ29vZCBjaGFuY2UgYXQgaGF2aW5nIGEgbm9uLWVtcHR5IGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8XHJcbiAgICAgICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XHJcbiAgICAgICAgICAgIHByZURvdFN0YXRlID09PSAwIHx8XHJcbiAgICAgICAgICAgIC8vIFRoZSAocmlnaHQtbW9zdCkgdHJpbW1lZCBwYXRoIGNvbXBvbmVudCBpcyBleGFjdGx5ICcuLidcclxuICAgICAgICAgICAgcHJlRG90U3RhdGUgPT09IDEgJiYgc3RhcnREb3QgPT09IGVuZCAtIDEgJiYgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIHN0YXRpYyBwYXJzZShwYXRoOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgdmFyIHJldCA9IHsgcm9vdDogJycsIGRpcjogJycsIGJhc2U6ICcnLCBleHQ6ICcnLCBuYW1lOiAnJyB9O1xyXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJldDtcclxuICAgICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcclxuICAgICAgICB2YXIgaXNBYnNvbHV0ZSA9IGNvZGUgPT09IDQ3IC8qLyovO1xyXG4gICAgICAgIHZhciBzdGFydDtcclxuICAgICAgICBpZiAoaXNBYnNvbHV0ZSkge1xyXG4gICAgICAgICAgICByZXQucm9vdCA9ICcvJztcclxuICAgICAgICAgICAgc3RhcnQgPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXJ0RG90ID0gLTE7XHJcbiAgICAgICAgdmFyIHN0YXJ0UGFydCA9IDA7XHJcbiAgICAgICAgdmFyIGVuZCA9IC0xO1xyXG4gICAgICAgIHZhciBtYXRjaGVkU2xhc2ggPSB0cnVlO1xyXG4gICAgICAgIHZhciBpID0gcGF0aC5sZW5ndGggLSAxO1xyXG5cclxuICAgICAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXHJcbiAgICAgICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcclxuICAgICAgICB2YXIgcHJlRG90U3RhdGUgPSAwO1xyXG5cclxuICAgICAgICAvLyBHZXQgbm9uLWRpciBpbmZvXHJcbiAgICAgICAgZm9yICg7IGkgPj0gc3RhcnQ7IC0taSkge1xyXG4gICAgICAgICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxyXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSA0NiAvKi4qLykge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSBzdGFydERvdCA9IGk7IGVsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKSBwcmVEb3RTdGF0ZSA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxyXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIHByZURvdFN0YXRlID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxyXG4gICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxyXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxyXG4gICAgICAgICAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXHJcbiAgICAgICAgICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XHJcbiAgICAgICAgICAgIGlmIChlbmQgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnRQYXJ0ID09PSAwICYmIGlzQWJzb2x1dGUpIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKDEsIGVuZCk7IGVsc2UgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgc3RhcnREb3QpO1xyXG4gICAgICAgICAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKDEsIGVuZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBzdGFydERvdCk7XHJcbiAgICAgICAgICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldC5leHQgPSBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHN0YXJ0UGFydCA+IDApIHJldC5kaXIgPSBwYXRoLnNsaWNlKDAsIHN0YXJ0UGFydCAtIDEpOyBlbHNlIGlmIChpc0Fic29sdXRlKSByZXQuZGlyID0gJy8nO1xyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgIHN0YXRpYyBwb3NpeE5vcm1hbGl6ZShwYXRoOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xyXG5cclxuICAgICAgICB2YXIgaXNBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XHJcbiAgICAgICAgdmFyIHRyYWlsaW5nU2VwYXJhdG9yID0gcGF0aC5jaGFyQ29kZUF0KHBhdGgubGVuZ3RoIC0gMSkgPT09IDQ3IC8qLyovO1xyXG5cclxuICAgICAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcclxuICAgICAgICBwYXRoID0gdGhpcy5ub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCAhaXNBYnNvbHV0ZSk7XHJcblxyXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCAmJiAhaXNBYnNvbHV0ZSkgcGF0aCA9ICcuJztcclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPiAwICYmIHRyYWlsaW5nU2VwYXJhdG9yKSBwYXRoICs9ICcvJztcclxuXHJcbiAgICAgICAgaWYgKGlzQWJzb2x1dGUpIHJldHVybiAnLycgKyBwYXRoO1xyXG4gICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoOiBzdHJpbmcsIGFsbG93QWJvdmVSb290OiBib29sZWFuKSB7XHJcbiAgICAgICAgdmFyIHJlcyA9ICcnO1xyXG4gICAgICAgIHZhciBsYXN0U2VnbWVudExlbmd0aCA9IDA7XHJcbiAgICAgICAgdmFyIGxhc3RTbGFzaCA9IC0xO1xyXG4gICAgICAgIHZhciBkb3RzID0gMDtcclxuICAgICAgICB2YXIgY29kZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBwYXRoLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChpIDwgcGF0aC5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChjb2RlID09PSA0NyAvKi8qLylcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb2RlID0gNDcgLyovKi87XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxhc3RTbGFzaCA9PT0gaSAtIDEgfHwgZG90cyA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PT1BcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGFzdFNsYXNoICE9PSBpIC0gMSAmJiBkb3RzID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPCAyIHx8IGxhc3RTZWdtZW50TGVuZ3RoICE9PSAyIHx8IHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAxKSAhPT0gNDYgLyouKi8gfHwgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDIpICE9PSA0NiAvKi4qLykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZignLycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ICE9PSByZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgbGFzdFNsYXNoSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IHJlcy5sZW5ndGggLSAxIC0gcmVzLmxhc3RJbmRleE9mKCcvJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90cyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzLmxlbmd0aCA9PT0gMiB8fCByZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3RzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgKz0gJy8uLic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9ICcuLic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzICs9ICcvJyArIHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gaSAtIGxhc3RTbGFzaCAtIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xyXG4gICAgICAgICAgICAgICAgZG90cyA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gNDYgLyouKi8gJiYgZG90cyAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICsrZG90cztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRvdHMgPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBwb3NpeFJlc29sdmUoLi4uYXJnczogc3RyaW5nW10pIHtcclxuICAgICAgICB2YXIgcmVzb2x2ZWRQYXRoID0gJyc7XHJcbiAgICAgICAgdmFyIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcclxuICAgICAgICB2YXIgY3dkO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gYXJncy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHBhdGg7XHJcbiAgICAgICAgICAgIGlmIChpID49IDApXHJcbiAgICAgICAgICAgICAgICBwYXRoID0gYXJnc1tpXTtcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3dkID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcclxuICAgICAgICAgICAgICAgIHBhdGggPSBjd2Q7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICAvLyBTa2lwIGVtcHR5IGVudHJpZXNcclxuICAgICAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcclxuICAgICAgICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XHJcbiAgICAgICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXHJcblxyXG4gICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxyXG4gICAgICAgIHJlc29sdmVkUGF0aCA9IHRoaXMubm9ybWFsaXplU3RyaW5nUG9zaXgocmVzb2x2ZWRQYXRoLCAhcmVzb2x2ZWRBYnNvbHV0ZSk7XHJcblxyXG4gICAgICAgIGlmIChyZXNvbHZlZEFic29sdXRlKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgIHJldHVybiAnLycgKyByZXNvbHZlZFBhdGg7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiAnLyc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnLic7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyByZWxhdGl2ZShmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGZyb20gPSB0aGlzLnBvc2l4UmVzb2x2ZShmcm9tKTtcclxuICAgICAgICB0byA9IHRoaXMucG9zaXhSZXNvbHZlKHRvKTtcclxuXHJcbiAgICAgICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcclxuICAgICAgICB2YXIgZnJvbVN0YXJ0ID0gMTtcclxuICAgICAgICBmb3IgKDsgZnJvbVN0YXJ0IDwgZnJvbS5sZW5ndGg7ICsrZnJvbVN0YXJ0KSB7XHJcbiAgICAgICAgICAgIGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0KSAhPT0gNDcgLyovKi8pXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZyb21FbmQgPSBmcm9tLmxlbmd0aDtcclxuICAgICAgICB2YXIgZnJvbUxlbiA9IGZyb21FbmQgLSBmcm9tU3RhcnQ7XHJcblxyXG4gICAgICAgIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcclxuICAgICAgICB2YXIgdG9TdGFydCA9IDE7XHJcbiAgICAgICAgZm9yICg7IHRvU3RhcnQgPCB0by5sZW5ndGg7ICsrdG9TdGFydCkge1xyXG4gICAgICAgICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSAhPT0gNDcgLyovKi8pXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRvRW5kID0gdG8ubGVuZ3RoO1xyXG4gICAgICAgIHZhciB0b0xlbiA9IHRvRW5kIC0gdG9TdGFydDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBwYXRocyB0byBmaW5kIHRoZSBsb25nZXN0IGNvbW1vbiBwYXRoIGZyb20gcm9vdFxyXG4gICAgICAgIHZhciBsZW5ndGggPSBmcm9tTGVuIDwgdG9MZW4gPyBmcm9tTGVuIDogdG9MZW47XHJcbiAgICAgICAgdmFyIGxhc3RDb21tb25TZXAgPSAtMTtcclxuICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgZm9yICg7IGkgPD0gbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKGkgPT09IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRvTGVuID4gbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYHRvYC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyJzsgdG89Jy9mb28vYmFyL2JheidcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgcm9vdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nLyc7IHRvPScvZm9vJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZnJvbUxlbiA+IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSkgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYGZyb21gLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXIvYmF6JzsgdG89Jy9mb28vYmFyJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgcm9vdC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28nOyB0bz0nLydcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGZyb21Db2RlID0gZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpO1xyXG4gICAgICAgICAgICB2YXIgdG9Db2RlID0gdG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSk7XHJcbiAgICAgICAgICAgIGlmIChmcm9tQ29kZSAhPT0gdG9Db2RlKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGZyb21Db2RlID09PSA0NyAvKi8qLylcclxuICAgICAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG91dCA9ICcnO1xyXG4gICAgICAgIC8vIEdlbmVyYXRlIHRoZSByZWxhdGl2ZSBwYXRoIGJhc2VkIG9uIHRoZSBwYXRoIGRpZmZlcmVuY2UgYmV0d2VlbiBgdG9gXHJcbiAgICAgICAgLy8gYW5kIGBmcm9tYFxyXG4gICAgICAgIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gZnJvbUVuZCB8fCBmcm9tLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gJy4uJztcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBvdXQgKz0gJy8uLic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIExhc3RseSwgYXBwZW5kIHRoZSByZXN0IG9mIHRoZSBkZXN0aW5hdGlvbiAoYHRvYCkgcGF0aCB0aGF0IGNvbWVzIGFmdGVyXHJcbiAgICAgICAgLy8gdGhlIGNvbW1vbiBwYXRoIHBhcnRzXHJcbiAgICAgICAgaWYgKG91dC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICByZXR1cm4gb3V0ICsgdG8uc2xpY2UodG9TdGFydCArIGxhc3RDb21tb25TZXApO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0b1N0YXJ0ICs9IGxhc3RDb21tb25TZXA7XHJcbiAgICAgICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpID09PSA0NyAvKi8qLylcclxuICAgICAgICAgICAgICAgICsrdG9TdGFydDtcclxuICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEFwcCwgVEFic3RyYWN0RmlsZSwgVEZpbGUsIEVtYmVkQ2FjaGUsIExpbmtDYWNoZSwgUG9zIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBwYXRoIH0gZnJvbSAnLi9wYXRoJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUGF0aENoYW5nZUluZm8ge1xyXG5cdG9sZFBhdGg6IHN0cmluZyxcclxuXHRuZXdQYXRoOiBzdHJpbmcsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW1iZWRDaGFuZ2VJbmZvIHtcclxuXHRvbGQ6IEVtYmVkQ2FjaGUsXHJcblx0bmV3TGluazogc3RyaW5nLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIExpbmtDaGFuZ2VJbmZvIHtcclxuXHRvbGQ6IExpbmtDYWNoZSxcclxuXHRuZXdMaW5rOiBzdHJpbmcsXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlua3NBbmRFbWJlZHNDaGFuZ2VkSW5mbyB7XHJcblx0ZW1iZWRzOiBFbWJlZENoYW5nZUluZm9bXVxyXG5cdGxpbmtzOiBMaW5rQ2hhbmdlSW5mb1tdXHJcbn1cclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIExpbmtTZWN0aW9uSW5mbyB7XHJcblx0aGFzU2VjdGlvbjogYm9vbGVhblxyXG5cdGxpbms6IHN0cmluZ1xyXG5cdHNlY3Rpb246IHN0cmluZ1xyXG59XHJcblxyXG5cclxuLy9zaW1wbGUgcmVnZXhcclxuLy8gY29uc3QgbWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4U2ltcGxlID0gL1xcWyguKj8pXFxdXFwoKC4qPylcXCkvZ2ltXHJcbi8vIGNvbnN0IG1hcmtkb3duTGlua1JlZ2V4U2ltcGxlID0gLyg/PCFcXCEpXFxbKC4qPylcXF1cXCgoLio/KVxcKS9naW07XHJcbi8vIGNvbnN0IG1hcmtkb3duRW1iZWRSZWdleFNpbXBsZSA9IC9cXCFcXFsoLio/KVxcXVxcKCguKj8pXFwpL2dpbVxyXG5cclxuLy8gY29uc3Qgd2lraUxpbmtPckVtYmVkUmVnZXhTaW1wbGUgPSAvXFxbXFxbKC4qPylcXF1cXF0vZ2ltXHJcbi8vIGNvbnN0IHdpa2lMaW5rUmVnZXhTaW1wbGUgPSAvKD88IVxcISlcXFtcXFsoLio/KVxcXVxcXS9naW07XHJcbi8vIGNvbnN0IHdpa2lFbWJlZFJlZ2V4U2ltcGxlID0gL1xcIVxcW1xcWyguKj8pXFxdXFxdL2dpbVxyXG5cclxuLy93aXRoIGVzY2FwaW5nIFxcIGNoYXJhY3RlcnNcclxuY29uc3QgbWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4RyA9IC8oPzwhXFxcXClcXFsoLio/KSg/PCFcXFxcKVxcXVxcKCguKj8pKD88IVxcXFwpXFwpL2dpbVxyXG5jb25zdCBtYXJrZG93bkxpbmtSZWdleEcgPSAvKD88IVxcISkoPzwhXFxcXClcXFsoLio/KSg/PCFcXFxcKVxcXVxcKCguKj8pKD88IVxcXFwpKD86IyguKj8pKT9cXCkvZ2ltO1xyXG5jb25zdCBtYXJrZG93bkVtYmVkUmVnZXhHID0gLyg/PCFcXFxcKVxcIVxcWyguKj8pKD88IVxcXFwpXFxdXFwoKC4qPykoPzwhXFxcXClcXCkvZ2ltXHJcblxyXG5jb25zdCB3aWtpTGlua09yRW1iZWRSZWdleEcgPSAvKD88IVxcXFwpXFxbXFxbKC4qPykoPzwhXFxcXClcXF1cXF0vZ2ltXHJcbmNvbnN0IHdpa2lMaW5rUmVnZXhHID0gLyg/PCFcXCEpKD88IVxcXFwpXFxbXFxbKC4qPykoPzwhXFxcXClcXF1cXF0vZ2ltO1xyXG5jb25zdCB3aWtpRW1iZWRSZWdleEcgPSAvKD88IVxcXFwpXFwhXFxbXFxbKC4qPykoPzwhXFxcXClcXF1cXF0vZ2ltXHJcblxyXG5jb25zdCBtYXJrZG93bkxpbmtPckVtYmVkUmVnZXggPSAvKD88IVxcXFwpXFxbKC4qPykoPzwhXFxcXClcXF1cXCgoLio/KSg/PCFcXFxcKVxcKS9pbVxyXG5jb25zdCBtYXJrZG93bkxpbmtSZWdleCA9IC8oPzwhXFwhKSg/PCFcXFxcKVxcWyguKj8pKD88IVxcXFwpXFxdXFwoKC4qPykoPzwhXFxcXClcXCkvaW07XHJcbmNvbnN0IG1hcmtkb3duRW1iZWRSZWdleCA9IC8oPzwhXFxcXClcXCFcXFsoLio/KSg/PCFcXFxcKVxcXVxcKCguKj8pKD88IVxcXFwpXFwpL2ltXHJcblxyXG5jb25zdCB3aWtpTGlua09yRW1iZWRSZWdleCA9IC8oPzwhXFxcXClcXFtcXFsoLio/KSg/PCFcXFxcKVxcXVxcXS9pbVxyXG5jb25zdCB3aWtpTGlua1JlZ2V4ID0gLyg/PCFcXCEpKD88IVxcXFwpXFxbXFxbKC4qPykoPzwhXFxcXClcXF1cXF0vaW07XHJcbmNvbnN0IHdpa2lFbWJlZFJlZ2V4ID0gLyg/PCFcXFxcKVxcIVxcW1xcWyguKj8pKD88IVxcXFwpXFxdXFxdL2ltXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIExpbmtzSGFuZGxlciB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cHJpdmF0ZSBhcHA6IEFwcCxcclxuXHRcdHByaXZhdGUgY29uc29sZUxvZ1ByZWZpeDogc3RyaW5nID0gXCJcIixcclxuXHRcdHByaXZhdGUgaWdub3JlRm9sZGVyczogc3RyaW5nW10gPSBbXSxcclxuXHRcdHByaXZhdGUgaWdub3JlRmlsZXM6IHN0cmluZ1tdID0gW10sXHJcblx0KSB7IH1cclxuXHJcblx0aXNQYXRoSWdub3JlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoXCIuL1wiKSlcclxuXHRcdFx0cGF0aCA9IHBhdGguc3Vic3RyaW5nKDIpO1xyXG5cclxuXHRcdGZvciAobGV0IGZvbGRlciBvZiB0aGlzLmlnbm9yZUZvbGRlcnMpIHtcclxuXHRcdFx0aWYgKHBhdGguc3RhcnRzV2l0aChmb2xkZXIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGxldCBmaWxlIG9mIHRoaXMuaWdub3JlRmlsZXMpIHtcclxuXHRcdFx0aWYgKHBhdGggPT0gZmlsZSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjaGVja0lzQ29ycmVjdE1hcmtkb3duRW1iZWQodGV4dDogc3RyaW5nKSB7XHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKG1hcmtkb3duRW1iZWRSZWdleEcpO1xyXG5cdFx0cmV0dXJuIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApXHJcblx0fVxyXG5cclxuXHRjaGVja0lzQ29ycmVjdE1hcmtkb3duTGluayh0ZXh0OiBzdHJpbmcpIHtcclxuXHRcdGxldCBlbGVtZW50cyA9IHRleHQubWF0Y2gobWFya2Rvd25MaW5rUmVnZXhHKTtcclxuXHRcdHJldHVybiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKVxyXG5cdH1cclxuXHJcblx0Y2hlY2tJc0NvcnJlY3RNYXJrZG93bkVtYmVkT3JMaW5rKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXhHKTtcclxuXHRcdHJldHVybiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKVxyXG5cdH1cclxuXHJcblx0Y2hlY2tJc0NvcnJlY3RXaWtpRW1iZWQodGV4dDogc3RyaW5nKSB7XHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKHdpa2lFbWJlZFJlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cdGNoZWNrSXNDb3JyZWN0V2lraUxpbmsodGV4dDogc3RyaW5nKSB7XHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKHdpa2lMaW5rUmVnZXhHKTtcclxuXHRcdHJldHVybiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKVxyXG5cdH1cclxuXHJcblx0Y2hlY2tJc0NvcnJlY3RXaWtpRW1iZWRPckxpbmsodGV4dDogc3RyaW5nKSB7XHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKHdpa2lMaW5rT3JFbWJlZFJlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cclxuXHRnZXRGaWxlQnlMaW5rKGxpbms6IHN0cmluZywgb3duaW5nTm90ZVBhdGg6IHN0cmluZyk6IFRGaWxlIHtcclxuXHRcdGxldCBsaSA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rKTtcclxuXHRcdGxldCBmdWxsUGF0aCA9IHRoaXMuZ2V0RnVsbFBhdGhGb3JMaW5rKGxpLmxpbmssIG93bmluZ05vdGVQYXRoKTtcclxuXHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlQYXRoKGZ1bGxQYXRoKTtcclxuXHRcdHJldHVybiBmaWxlO1xyXG5cdH1cclxuXHJcblxyXG5cdGdldEZpbGVCeVBhdGgocGF0aDogc3RyaW5nKTogVEZpbGUge1xyXG5cdFx0cGF0aCA9IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKHBhdGgpO1xyXG5cdFx0bGV0IGZpbGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0RmlsZXMoKTtcclxuXHRcdGxldCBmaWxlID0gZmlsZXMuZmluZChmaWxlID0+IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKGZpbGUucGF0aCkgPT09IHBhdGgpO1xyXG5cdFx0cmV0dXJuIGZpbGU7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0RnVsbFBhdGhGb3JMaW5rKGxpbms6IHN0cmluZywgb3duaW5nTm90ZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRsaW5rID0gdGhpcy5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbmspLmxpbms7XHJcblx0XHRsaW5rID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUobGluayk7XHJcblx0XHRvd25pbmdOb3RlUGF0aCA9IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKG93bmluZ05vdGVQYXRoKTtcclxuXHJcblx0XHRsZXQgcGFyZW50Rm9sZGVyID0gb3duaW5nTm90ZVBhdGguc3Vic3RyaW5nKDAsIG93bmluZ05vdGVQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XHJcblx0XHRsZXQgZnVsbFBhdGggPSBwYXRoLmpvaW4ocGFyZW50Rm9sZGVyLCBsaW5rKTtcclxuXHJcblx0XHRmdWxsUGF0aCA9IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKGZ1bGxQYXRoKTtcclxuXHRcdHJldHVybiBmdWxsUGF0aDtcclxuXHR9XHJcblxyXG5cclxuXHRnZXRBbGxDYWNoZWRMaW5rc1RvRmlsZShmaWxlUGF0aDogc3RyaW5nKTogeyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9IHtcclxuXHRcdGxldCBhbGxMaW5rczogeyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAobm90ZS5wYXRoID09IGZpbGVQYXRoKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlLnBhdGgpPy5saW5rcztcclxuXHJcblx0XHRcdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBsaW5rRnVsbFBhdGggPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rRnVsbFBhdGggPT0gZmlsZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWFsbExpbmtzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXS5wdXNoKGxpbmspO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbExpbmtzO1xyXG5cdH1cclxuXHJcblxyXG5cdGdldEFsbENhY2hlZEVtYmVkc1RvRmlsZShmaWxlUGF0aDogc3RyaW5nKTogeyBbbm90ZVBhdGg6IHN0cmluZ106IEVtYmVkQ2FjaGVbXTsgfSB7XHJcblx0XHRsZXQgYWxsRW1iZWRzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAobm90ZS5wYXRoID09IGZpbGVQYXRoKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGVtYmVkcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8uZW1iZWRzO1xyXG5cclxuXHRcdFx0XHRpZiAoZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRcdFx0bGV0IGxpbmtGdWxsUGF0aCA9IHRoaXMuZ2V0RnVsbFBhdGhGb3JMaW5rKGVtYmVkLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rRnVsbFBhdGggPT0gZmlsZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWFsbEVtYmVkc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdFx0YWxsRW1iZWRzW25vdGUucGF0aF0gPSBbXTtcclxuXHRcdFx0XHRcdFx0XHRhbGxFbWJlZHNbbm90ZS5wYXRoXS5wdXNoKGVtYmVkKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxFbWJlZHM7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdGdldEFsbEJhZExpbmtzKCk6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfSB7XHJcblx0XHRsZXQgYWxsTGlua3M6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfSA9IHt9O1xyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlLnBhdGgpPy5saW5rcztcclxuXHJcblx0XHRcdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rLmxpbmsuc3RhcnRzV2l0aChcIiNcIikpIC8vaW50ZXJuYWwgc2VjdGlvbiBsaW5rXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lMaW5rKGxpbmsub3JpZ2luYWwpKVxyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluay5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWFsbExpbmtzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXS5wdXNoKGxpbmspO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbExpbmtzO1xyXG5cdH1cclxuXHJcblx0Z2V0QWxsQmFkRW1iZWRzKCk6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0ge1xyXG5cdFx0bGV0IGFsbEVtYmVkczogeyBbbm90ZVBhdGg6IHN0cmluZ106IEVtYmVkQ2FjaGVbXTsgfSA9IHt9O1xyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGVtYmVkcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8uZW1iZWRzO1xyXG5cclxuXHRcdFx0XHRpZiAoZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpRW1iZWQoZW1iZWQub3JpZ2luYWwpKVxyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsoZW1iZWQubGluaywgbm90ZS5wYXRoKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFhbGxFbWJlZHNbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdFx0YWxsRW1iZWRzW25vdGUucGF0aF0ucHVzaChlbWJlZCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYWxsRW1iZWRzO1xyXG5cdH1cclxuXHJcblxyXG5cdGdldEFsbEdvb2RMaW5rcygpOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0ge1xyXG5cdFx0bGV0IGFsbExpbmtzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8ubGlua3M7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRpZiAobGluay5saW5rLnN0YXJ0c1dpdGgoXCIjXCIpKSAvL2ludGVybmFsIHNlY3Rpb24gbGlua1xyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGxpbmsubGluaywgbm90ZS5wYXRoKTtcclxuXHRcdFx0XHRcdFx0aWYgKGZpbGUpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIWFsbExpbmtzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXS5wdXNoKGxpbmspO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbExpbmtzO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgZ2V0QWxsQmFkU2VjdGlvbkxpbmtzKCk6IFByb21pc2U8eyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9PiB7XHJcblx0XHRsZXQgYWxsTGlua3M6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfSA9IHt9O1xyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlLnBhdGgpPy5saW5rcztcclxuXHRcdFx0XHRpZiAobGlua3MpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBsaSA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rLmxpbmspO1xyXG5cdFx0XHRcdFx0XHRpZiAoIWxpLmhhc1NlY3Rpb24pXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhsaW5rLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChmaWxlKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGZpbGUuZXh0ZW5zaW9uID09PSBcInBkZlwiICYmIGxpLnNlY3Rpb24uc3RhcnRzV2l0aChcInBhZ2U9XCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdFx0XHRcdFx0XHRsZXQgc2VjdGlvbiA9IFV0aWxzLm5vcm1hbGl6ZUxpbmtTZWN0aW9uKGxpLnNlY3Rpb24pO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VjdGlvbi5zdGFydHNXaXRoKFwiXlwiKSkgLy9za2lwIF4gbGlua3NcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgcmVnZXggPSAvWyAhQCQlXiYqKCktPV8rXFxcXC87J1xcW1xcXVxcXCJcXHxcXD8uXFwsXFw8XFw+XFxgXFx+XFx7XFx9XS9naW07XHJcblx0XHRcdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgJycpO1xyXG5cdFx0XHRcdFx0XHRcdHNlY3Rpb24gPSBzZWN0aW9uLnJlcGxhY2UocmVnZXgsICcnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCF0ZXh0LmNvbnRhaW5zKFwiI1wiICsgc2VjdGlvbikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICghYWxsTGlua3Nbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXS5wdXNoKGxpbmspO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxMaW5rcztcclxuXHR9XHJcblxyXG5cdGdldEFsbEdvb2RFbWJlZHMoKTogeyBbbm90ZVBhdGg6IHN0cmluZ106IEVtYmVkQ2FjaGVbXTsgfSB7XHJcblx0XHRsZXQgYWxsRW1iZWRzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdFx0XHRsZXQgZW1iZWRzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlLnBhdGgpPy5lbWJlZHM7XHJcblxyXG5cdFx0XHRcdGlmIChlbWJlZHMpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhlbWJlZC5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghYWxsRW1iZWRzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxFbWJlZHNbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdLnB1c2goZW1iZWQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbEVtYmVkcztcclxuXHR9XHJcblxyXG5cdGdldEFsbFdpa2lMaW5rcygpOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0ge1xyXG5cdFx0bGV0IGFsbExpbmtzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8ubGlua3M7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghYWxsTGlua3Nbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0ucHVzaChsaW5rKTtcclxuXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbExpbmtzO1xyXG5cdH1cclxuXHJcblx0Z2V0QWxsV2lraUVtYmVkcygpOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9IHtcclxuXHRcdGxldCBhbGxFbWJlZHM6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGUucGF0aCk/LmVtYmVkcztcclxuXHJcblx0XHRcdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWFsbEVtYmVkc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdLnB1c2goZW1iZWQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxFbWJlZHM7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlTGlua3NUb1JlbmFtZWRGaWxlKG9sZE5vdGVQYXRoOiBzdHJpbmcsIG5ld05vdGVQYXRoOiBzdHJpbmcsIGNoYW5nZWxpbmtzQWx0ID0gZmFsc2UsIHVzZUJ1aWx0SW5PYnNpZGlhbkxpbmtDYWNoaW5nID0gZmFsc2UpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQob2xkTm90ZVBhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChuZXdOb3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgbm90ZXMgPSB1c2VCdWlsdEluT2JzaWRpYW5MaW5rQ2FjaGluZyA/IHRoaXMuZ2V0Q2FjaGVkTm90ZXNUaGF0SGF2ZUxpbmtUb0ZpbGUob2xkTm90ZVBhdGgpIDogYXdhaXQgdGhpcy5nZXROb3Rlc1RoYXRIYXZlTGlua1RvRmlsZShvbGROb3RlUGF0aCk7XHJcblx0XHRsZXQgbGlua3M6IFBhdGhDaGFuZ2VJbmZvW10gPSBbeyBvbGRQYXRoOiBvbGROb3RlUGF0aCwgbmV3UGF0aDogbmV3Tm90ZVBhdGggfV07XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZUNoYW5nZWRQYXRoc0luTm90ZShub3RlLCBsaW5rcywgY2hhbmdlbGlua3NBbHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZFBhdGhJbk5vdGUobm90ZVBhdGg6IHN0cmluZywgb2xkTGluazogc3RyaW5nLCBuZXdMaW5rOiBzdHJpbmcsIGNoYW5nZWxpbmtzQWx0ID0gZmFsc2UpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGNoYW5nZXM6IFBhdGhDaGFuZ2VJbmZvW10gPSBbeyBvbGRQYXRoOiBvbGRMaW5rLCBuZXdQYXRoOiBuZXdMaW5rIH1dO1xyXG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGVQYXRoLCBjaGFuZ2VzLCBjaGFuZ2VsaW5rc0FsdCk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGVQYXRoOiBzdHJpbmcsIGNoYW5nZWRMaW5rczogUGF0aENoYW5nZUluZm9bXSwgY2hhbmdlbGlua3NBbHQgPSBmYWxzZSkge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhbnQgdXBkYXRlIGxpbmtzIGluIG5vdGUsIGZpbGUgbm90IGZvdW5kOiBcIiArIG5vdGVQYXRoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdGxldCBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdGxldCBlbGVtZW50cyA9IHRleHQubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4Ryk7XHJcblx0XHRpZiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAobGV0IGVsIG9mIGVsZW1lbnRzKSB7XHJcblx0XHRcdFx0bGV0IGFsdCA9IGVsLm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleClbMV07XHJcblx0XHRcdFx0bGV0IGxpbmsgPSBlbC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXgpWzJdO1xyXG5cdFx0XHRcdGxldCBsaSA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rKTtcclxuXHJcblx0XHRcdFx0aWYgKGxpLmhhc1NlY3Rpb24pICAvLyBmb3IgbGlua3Mgd2l0aCBzZWN0aW9ucyBsaWtlIFtdKG5vdGUubWQjc2VjdGlvbilcclxuXHRcdFx0XHRcdGxpbmsgPSBsaS5saW5rO1xyXG5cclxuXHRcdFx0XHRsZXQgZnVsbExpbmsgPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBub3RlUGF0aCk7XHJcblxyXG5cdFx0XHRcdGZvciAobGV0IGNoYW5nZWRMaW5rIG9mIGNoYW5nZWRMaW5rcykge1xyXG5cdFx0XHRcdFx0aWYgKGZ1bGxMaW5rID09IGNoYW5nZWRMaW5rLm9sZFBhdGgpIHtcclxuXHRcdFx0XHRcdFx0bGV0IG5ld1JlbExpbms6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUobm90ZVBhdGgsIGNoYW5nZWRMaW5rLm5ld1BhdGgpO1xyXG5cdFx0XHRcdFx0XHRuZXdSZWxMaW5rID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobmV3UmVsTGluayk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAobmV3UmVsTGluay5zdGFydHNXaXRoKFwiLi4vXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3UmVsTGluayA9IG5ld1JlbExpbmsuc3Vic3RyaW5nKDMpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoY2hhbmdlbGlua3NBbHQgJiYgbmV3UmVsTGluay5lbmRzV2l0aChcIi5tZFwiKSkge1xyXG5cdFx0XHRcdFx0XHRcdC8vcmVuYW1lIG9ubHkgaWYgb2xkIGFsdCA9PSBvbGQgbm90ZSBuYW1lXHJcblx0XHRcdFx0XHRcdFx0aWYgKGFsdCA9PT0gcGF0aC5iYXNlbmFtZShjaGFuZ2VkTGluay5vbGRQYXRoLCBwYXRoLmV4dG5hbWUoY2hhbmdlZExpbmsub2xkUGF0aCkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgZXh0ID0gcGF0aC5leHRuYW1lKG5ld1JlbExpbmspO1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGJhc2VOYW1lID0gcGF0aC5iYXNlbmFtZShuZXdSZWxMaW5rLCBleHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0YWx0ID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUoYmFzZU5hbWUpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKGxpLmhhc1NlY3Rpb24pXHJcblx0XHRcdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbCwgJ1snICsgYWx0ICsgJ10nICsgJygnICsgbmV3UmVsTGluayArICcjJyArIGxpLnNlY3Rpb24gKyAnKScpO1xyXG5cdFx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbCwgJ1snICsgYWx0ICsgJ10nICsgJygnICsgbmV3UmVsTGluayArICcpJyk7XHJcblxyXG5cdFx0XHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImxpbmsgdXBkYXRlZCBpbiBjYWNoZWQgbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdFx0XHQrIGZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBsaW5rICsgXCJcXG4gICBcIiArIG5ld1JlbExpbmspXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRpcnR5KVxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdGV4dCk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlSW50ZXJuYWxMaW5rc0luTW92ZWROb3RlKG9sZE5vdGVQYXRoOiBzdHJpbmcsIG5ld05vdGVQYXRoOiBzdHJpbmcsIGF0dGFjaG1lbnRzQWxyZWFkeU1vdmVkOiBib29sZWFuKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG9sZE5vdGVQYXRoKSB8fCB0aGlzLmlzUGF0aElnbm9yZWQobmV3Tm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeVBhdGgobmV3Tm90ZVBhdGgpO1xyXG5cdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYW50IHVwZGF0ZSBpbnRlcm5hbCBsaW5rcywgZmlsZSBub3QgZm91bmQ6IFwiICsgbmV3Tm90ZVBhdGgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xyXG5cdFx0bGV0IGRpcnR5ID0gZmFsc2U7XHJcblxyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXhHKTtcclxuXHRcdGlmIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgZWwgb2YgZWxlbWVudHMpIHtcclxuXHRcdFx0XHRsZXQgYWx0ID0gZWwubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4KVsxXTtcclxuXHRcdFx0XHRsZXQgbGluayA9IGVsLm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleClbMl07XHJcblx0XHRcdFx0bGV0IGxpID0gdGhpcy5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbmspO1xyXG5cclxuXHRcdFx0XHRpZiAobGluay5zdGFydHNXaXRoKFwiI1wiKSkgLy9pbnRlcm5hbCBzZWN0aW9uIGxpbmtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRpZiAobGkuaGFzU2VjdGlvbikgIC8vIGZvciBsaW5rcyB3aXRoIHNlY3Rpb25zIGxpa2UgW10obm90ZS5tZCNzZWN0aW9uKVxyXG5cdFx0XHRcdFx0bGluayA9IGxpLmxpbms7XHJcblxyXG5cclxuXHRcdFx0XHQvL3N0YXJ0c1dpdGgoXCIuLi9cIikgLSBmb3Igbm90IHNraXBwaW5nIGZpbGVzIHRoYXQgbm90IGluIHRoZSBub3RlIGRpclxyXG5cdFx0XHRcdGlmIChhdHRhY2htZW50c0FscmVhZHlNb3ZlZCAmJiAhbGluay5lbmRzV2l0aChcIi5tZFwiKSAmJiAhbGluay5zdGFydHNXaXRoKFwiLi4vXCIpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGxpbmssIG9sZE5vdGVQYXRoKTtcclxuXHRcdFx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0XHRcdGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluaywgbmV3Tm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbmV3Tm90ZVBhdGggKyBcIiBoYXMgYmFkIGxpbmsgKGZpbGUgZG9lcyBub3QgZXhpc3QpOiBcIiArIGxpbmspO1xyXG5cdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0XHRsZXQgbmV3UmVsTGluazogc3RyaW5nID0gcGF0aC5yZWxhdGl2ZShuZXdOb3RlUGF0aCwgZmlsZS5wYXRoKTtcclxuXHRcdFx0XHRuZXdSZWxMaW5rID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobmV3UmVsTGluayk7XHJcblxyXG5cdFx0XHRcdGlmIChuZXdSZWxMaW5rLnN0YXJ0c1dpdGgoXCIuLi9cIikpIHtcclxuXHRcdFx0XHRcdG5ld1JlbExpbmsgPSBuZXdSZWxMaW5rLnN1YnN0cmluZygzKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChsaS5oYXNTZWN0aW9uKVxyXG5cdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbCwgJ1snICsgYWx0ICsgJ10nICsgJygnICsgbmV3UmVsTGluayArICcjJyArIGxpLnNlY3Rpb24gKyAnKScpO1xyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoZWwsICdbJyArIGFsdCArICddJyArICcoJyArIG5ld1JlbExpbmsgKyAnKScpO1xyXG5cclxuXHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblxyXG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwibGluayB1cGRhdGVkIGluIG1vdmVkIG5vdGUgW25vdGUsIG9sZCBsaW5rLCBuZXcgbGlua106IFxcbiAgIFwiXHJcblx0XHRcdFx0XHQrIGZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBsaW5rICsgXCIgICBcXG5cIiArIG5ld1JlbExpbmspO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRpcnR5KVxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdGV4dCk7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0Q2FjaGVkTm90ZXNUaGF0SGF2ZUxpbmtUb0ZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuXHRcdGxldCBub3Rlczogc3RyaW5nW10gPSBbXTtcclxuXHRcdGxldCBhbGxOb3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAoYWxsTm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBhbGxOb3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgbm90ZVBhdGggPSBub3RlLnBhdGg7XHJcblx0XHRcdFx0aWYgKG5vdGUucGF0aCA9PSBmaWxlUGF0aClcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGVQYXRoKT8uZW1iZWRzO1xyXG5cdFx0XHRcdGlmIChlbWJlZHMpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRcdFx0XHRsZXQgbGlua1BhdGggPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhlbWJlZC5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAobGlua1BhdGggPT0gZmlsZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIW5vdGVzLmNvbnRhaW5zKG5vdGVQYXRoKSlcclxuXHRcdFx0XHRcdFx0XHRcdG5vdGVzLnB1c2gobm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZVBhdGgpPy5saW5rcztcclxuXHRcdFx0XHRpZiAobGlua3MpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcclxuXHRcdFx0XHRcdFx0bGV0IGxpbmtQYXRoID0gdGhpcy5nZXRGdWxsUGF0aEZvckxpbmsobGluay5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAobGlua1BhdGggPT0gZmlsZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIW5vdGVzLmNvbnRhaW5zKG5vdGVQYXRoKSlcclxuXHRcdFx0XHRcdFx0XHRcdG5vdGVzLnB1c2gobm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5vdGVzO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGdldE5vdGVzVGhhdEhhdmVMaW5rVG9GaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcblx0XHRsZXQgbm90ZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRsZXQgYWxsTm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKGFsbE5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2YgYWxsTm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IG5vdGVQYXRoID0gbm90ZS5wYXRoO1xyXG5cdFx0XHRcdGlmIChub3RlUGF0aCA9PSBmaWxlUGF0aClcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgbGlua3MgPSBhd2FpdCB0aGlzLmdldExpbmtzRnJvbU5vdGUobm90ZVBhdGgpO1xyXG5cdFx0XHRcdGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcclxuXHRcdFx0XHRcdGxldCBsaSA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rLmxpbmspO1xyXG5cdFx0XHRcdFx0bGV0IGxpbmtGdWxsUGF0aCA9IHRoaXMuZ2V0RnVsbFBhdGhGb3JMaW5rKGxpLmxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmIChsaW5rRnVsbFBhdGggPT0gZmlsZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0aWYgKCFub3Rlcy5jb250YWlucyhub3RlUGF0aCkpXHJcblx0XHRcdFx0XHRcdFx0bm90ZXMucHVzaChub3RlUGF0aCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5vdGVzO1xyXG5cdH1cclxuXHJcblx0c3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rOiBzdHJpbmcpOiBMaW5rU2VjdGlvbkluZm8ge1xyXG5cdFx0bGV0IHJlczogTGlua1NlY3Rpb25JbmZvID0ge1xyXG5cdFx0XHRoYXNTZWN0aW9uOiBmYWxzZSxcclxuXHRcdFx0bGluazogbGluayxcclxuXHRcdFx0c2VjdGlvbjogXCJcIlxyXG5cdFx0fVxyXG5cclxuXHRcdGlmICghbGluay5jb250YWlucygnIycpKVxyXG5cdFx0XHRyZXR1cm4gcmVzO1xyXG5cclxuXHJcblx0XHRsZXQgbGlua0JlZm9yZUhhc2ggPSBsaW5rLm1hdGNoKC8oLio/KSMoLio/KSQvKVsxXTtcclxuXHRcdGxldCBzZWN0aW9uID0gbGluay5tYXRjaCgvKC4qPykjKC4qPykkLylbMl07XHJcblxyXG5cdFx0bGV0IGlzTWFya2Rvd25TZWN0aW9uID0gc2VjdGlvbiAhPSBcIlwiICYmIGxpbmtCZWZvcmVIYXNoLmVuZHNXaXRoKFwiLm1kXCIpOyAvLyBmb3IgbGlua3Mgd2l0aCBzZWN0aW9ucyBsaWtlIFtdKG5vdGUubWQjc2VjdGlvbilcclxuXHRcdGxldCBpc1BkZlBhZ2VTZWN0aW9uID0gc2VjdGlvbi5zdGFydHNXaXRoKFwicGFnZT1cIikgJiYgbGlua0JlZm9yZUhhc2guZW5kc1dpdGgoXCIucGRmXCIpOyAvLyBmb3IgbGlua3Mgd2l0aCBzZWN0aW9ucyBsaWtlIFtdKG5vdGUucGRmI3BhZ2U9NDIpXHJcblxyXG5cdFx0aWYgKGlzTWFya2Rvd25TZWN0aW9uIHx8IGlzUGRmUGFnZVNlY3Rpb24pIHtcclxuXHRcdFx0cmVzID0ge1xyXG5cdFx0XHRcdGhhc1NlY3Rpb246IHRydWUsXHJcblx0XHRcdFx0bGluazogbGlua0JlZm9yZUhhc2gsXHJcblx0XHRcdFx0c2VjdGlvbjogc2VjdGlvblxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcblxyXG5cclxuXHRnZXRGaWxlUGF0aFdpdGhSZW5hbWVkQmFzZU5hbWUoZmlsZVBhdGg6IHN0cmluZywgbmV3QmFzZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUocGF0aC5qb2luKHBhdGguZGlybmFtZShmaWxlUGF0aCksIG5ld0Jhc2VOYW1lICsgcGF0aC5leHRuYW1lKGZpbGVQYXRoKSkpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGdldExpbmtzRnJvbU5vdGUobm90ZVBhdGg6IHN0cmluZyk6IFByb21pc2U8TGlua0NhY2hlW10+IHtcclxuXHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlQYXRoKG5vdGVQYXRoKTtcclxuXHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiY2FudCBnZXQgZW1iZWRzLCBmaWxlIG5vdCBmb3VuZDogXCIgKyBub3RlUGF0aCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgdGV4dCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XHJcblxyXG5cdFx0bGV0IGxpbmtzOiBMaW5rQ2FjaGVbXSA9IFtdO1xyXG5cclxuXHRcdGxldCBlbGVtZW50cyA9IHRleHQubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4Ryk7XHJcblx0XHRpZiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAobGV0IGVsIG9mIGVsZW1lbnRzKSB7XHJcblx0XHRcdFx0bGV0IGFsdCA9IGVsLm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleClbMV07XHJcblx0XHRcdFx0bGV0IGxpbmsgPSBlbC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXgpWzJdO1xyXG5cclxuXHRcdFx0XHRsZXQgZW1iOiBMaW5rQ2FjaGUgPSB7XHJcblx0XHRcdFx0XHRsaW5rOiBsaW5rLFxyXG5cdFx0XHRcdFx0ZGlzcGxheVRleHQ6IGFsdCxcclxuXHRcdFx0XHRcdG9yaWdpbmFsOiBlbCxcclxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XHJcblx0XHRcdFx0XHRcdHN0YXJ0OiB7XHJcblx0XHRcdFx0XHRcdFx0Y29sOiAwLC8vdG9kb1xyXG5cdFx0XHRcdFx0XHRcdGxpbmU6IDAsXHJcblx0XHRcdFx0XHRcdFx0b2Zmc2V0OiAwXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdGVuZDoge1xyXG5cdFx0XHRcdFx0XHRcdGNvbDogMCwvL3RvZG9cclxuXHRcdFx0XHRcdFx0XHRsaW5lOiAwLFxyXG5cdFx0XHRcdFx0XHRcdG9mZnNldDogMFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0bGlua3MucHVzaChlbWIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbGlua3M7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cclxuXHRhc3luYyBjb252ZXJ0QWxsTm90ZUVtYmVkc1BhdGhzVG9SZWxhdGl2ZShub3RlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxFbWJlZENoYW5nZUluZm9bXT4ge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgY2hhbmdlZEVtYmVkczogRW1iZWRDaGFuZ2VJbmZvW10gPSBbXTtcclxuXHJcblx0XHRsZXQgZW1iZWRzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlUGF0aCk/LmVtYmVkcztcclxuXHJcblx0XHRpZiAoZW1iZWRzKSB7XHJcblx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRcdGxldCBpc01hcmtkb3duRW1iZWQgPSB0aGlzLmNoZWNrSXNDb3JyZWN0TWFya2Rvd25FbWJlZChlbWJlZC5vcmlnaW5hbCk7XHJcblx0XHRcdFx0bGV0IGlzV2lraUVtYmVkID0gdGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vcmlnaW5hbCk7XHJcblx0XHRcdFx0aWYgKGlzTWFya2Rvd25FbWJlZCB8fCBpc1dpa2lFbWJlZCkge1xyXG5cdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsoZW1iZWQubGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKGZpbGUpXHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdGZpbGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpcnN0TGlua3BhdGhEZXN0KGVtYmVkLmxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmIChmaWxlKSB7XHJcblx0XHRcdFx0XHRcdGxldCBuZXdSZWxMaW5rOiBzdHJpbmcgPSBwYXRoLnJlbGF0aXZlKG5vdGVQYXRoLCBmaWxlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRuZXdSZWxMaW5rID0gaXNNYXJrZG93bkVtYmVkID8gVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobmV3UmVsTGluaykgOiBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShuZXdSZWxMaW5rKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChuZXdSZWxMaW5rLnN0YXJ0c1dpdGgoXCIuLi9cIikpIHtcclxuXHRcdFx0XHRcdFx0XHRuZXdSZWxMaW5rID0gbmV3UmVsTGluay5zdWJzdHJpbmcoMyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGNoYW5nZWRFbWJlZHMucHVzaCh7IG9sZDogZW1iZWQsIG5ld0xpbms6IG5ld1JlbExpbmsgfSlcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGVtYmVkIChmaWxlIGRvZXMgbm90IGV4aXN0KTogXCIgKyBlbWJlZC5saW5rKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgZW1iZWQgKGZvcm1hdCBvZiBsaW5rIGlzIG5vdCBtYXJrZG93biBvciB3aWtpbGluayk6IFwiICsgZW1iZWQub3JpZ2luYWwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGF3YWl0IHRoaXMudXBkYXRlQ2hhbmdlZEVtYmVkSW5Ob3RlKG5vdGVQYXRoLCBjaGFuZ2VkRW1iZWRzKTtcclxuXHRcdHJldHVybiBjaGFuZ2VkRW1iZWRzO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGNvbnZlcnRBbGxOb3RlTGlua3NQYXRoc1RvUmVsYXRpdmUobm90ZVBhdGg6IHN0cmluZyk6IFByb21pc2U8TGlua0NoYW5nZUluZm9bXT4ge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgY2hhbmdlZExpbmtzOiBMaW5rQ2hhbmdlSW5mb1tdID0gW107XHJcblxyXG5cdFx0bGV0IGxpbmtzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlUGF0aCk/LmxpbmtzO1xyXG5cclxuXHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0bGV0IGlzTWFya2Rvd25MaW5rID0gdGhpcy5jaGVja0lzQ29ycmVjdE1hcmtkb3duTGluayhsaW5rLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRsZXQgaXNXaWtpTGluayA9IHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRpZiAoaXNNYXJrZG93bkxpbmsgfHwgaXNXaWtpTGluaykge1xyXG5cdFx0XHRcdFx0aWYgKGxpbmsubGluay5zdGFydHNXaXRoKFwiI1wiKSkgLy9pbnRlcm5hbCBzZWN0aW9uIGxpbmtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluay5saW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRpZiAoZmlsZSlcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0Ly8hISEgbGluay5kaXNwbGF5VGV4dCBpcyBhbHdheXMgXCJcIiAtIE9CU0lESUFOIEJVRz8sIHNvIGdldCBkaXNwbGF5IHRleHQgbWFudWFseVxyXG5cdFx0XHRcdFx0aWYgKGlzTWFya2Rvd25MaW5rKSB7XHJcblx0XHRcdFx0XHRcdGxldCBlbGVtZW50cyA9IGxpbmsub3JpZ2luYWwubWF0Y2gobWFya2Rvd25MaW5rUmVnZXgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZWxlbWVudHMpXHJcblx0XHRcdFx0XHRcdFx0bGluay5kaXNwbGF5VGV4dCA9IGVsZW1lbnRzWzFdO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGZpbGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpcnN0TGlua3BhdGhEZXN0KGxpbmsubGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKGZpbGUpIHtcclxuXHRcdFx0XHRcdFx0bGV0IG5ld1JlbExpbms6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUobm90ZVBhdGgsIGZpbGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdG5ld1JlbExpbmsgPSBpc01hcmtkb3duTGluayA/IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5ld1JlbExpbmspIDogVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUobmV3UmVsTGluayk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAobmV3UmVsTGluay5zdGFydHNXaXRoKFwiLi4vXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3UmVsTGluayA9IG5ld1JlbExpbmsuc3Vic3RyaW5nKDMpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjaGFuZ2VkTGlua3MucHVzaCh7IG9sZDogbGluaywgbmV3TGluazogbmV3UmVsTGluayB9KVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgbGluayAoZmlsZSBkb2VzIG5vdCBleGlzdCk6IFwiICsgbGluay5saW5rKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgbGluayAoZm9ybWF0IG9mIGxpbmsgaXMgbm90IG1hcmtkb3duIG9yIHdpa2lsaW5rKTogXCIgKyBsaW5rLm9yaWdpbmFsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRhd2FpdCB0aGlzLnVwZGF0ZUNoYW5nZWRMaW5rSW5Ob3RlKG5vdGVQYXRoLCBjaGFuZ2VkTGlua3MpO1xyXG5cdFx0cmV0dXJuIGNoYW5nZWRMaW5rcztcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyB1cGRhdGVDaGFuZ2VkRW1iZWRJbk5vdGUobm90ZVBhdGg6IHN0cmluZywgY2hhbmdlZEVtYmVkczogRW1iZWRDaGFuZ2VJbmZvW10pIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IG5vdGVGaWxlID0gdGhpcy5nZXRGaWxlQnlQYXRoKG5vdGVQYXRoKTtcclxuXHRcdGlmICghbm90ZUZpbGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhbnQgdXBkYXRlIGVtYmVkcyBpbiBub3RlLCBmaWxlIG5vdCBmb3VuZDogXCIgKyBub3RlUGF0aCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgdGV4dCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQobm90ZUZpbGUpO1xyXG5cdFx0bGV0IGRpcnR5ID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKGNoYW5nZWRFbWJlZHMgJiYgY2hhbmdlZEVtYmVkcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGNoYW5nZWRFbWJlZHMpIHtcclxuXHRcdFx0XHRpZiAoZW1iZWQub2xkLmxpbmsgPT0gZW1iZWQubmV3TGluaylcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdE1hcmtkb3duRW1iZWQoZW1iZWQub2xkLm9yaWdpbmFsKSkge1xyXG5cdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbWJlZC5vbGQub3JpZ2luYWwsICchWycgKyBlbWJlZC5vbGQuZGlzcGxheVRleHQgKyAnXScgKyAnKCcgKyBlbWJlZC5uZXdMaW5rICsgJyknKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpRW1iZWQoZW1iZWQub2xkLm9yaWdpbmFsKSkge1xyXG5cdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbWJlZC5vbGQub3JpZ2luYWwsICchW1snICsgZW1iZWQubmV3TGluayArICddXScpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIG5vdGVQYXRoICsgXCIgaGFzIGJhZCBlbWJlZCAoZm9ybWF0IG9mIGxpbmsgaXMgbm90IG1hZWtkb3duIG9yIHdpa2lsaW5rKTogXCIgKyBlbWJlZC5vbGQub3JpZ2luYWwpO1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImVtYmVkIHVwZGF0ZWQgaW4gbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdCsgbm90ZUZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBlbWJlZC5vbGQubGluayArIFwiXFxuICAgXCIgKyBlbWJlZC5uZXdMaW5rKVxyXG5cclxuXHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGlydHkpXHJcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShub3RlRmlsZSwgdGV4dCk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZExpbmtJbk5vdGUobm90ZVBhdGg6IHN0cmluZywgY2hhbmRlZExpbmtzOiBMaW5rQ2hhbmdlSW5mb1tdKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCBub3RlRmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIW5vdGVGaWxlKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYW50IHVwZGF0ZSBsaW5rcyBpbiBub3RlLCBmaWxlIG5vdCBmb3VuZDogXCIgKyBub3RlUGF0aCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgdGV4dCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQobm90ZUZpbGUpO1xyXG5cdFx0bGV0IGRpcnR5ID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKGNoYW5kZWRMaW5rcyAmJiBjaGFuZGVkTGlua3MubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRmb3IgKGxldCBsaW5rIG9mIGNoYW5kZWRMaW5rcykge1xyXG5cdFx0XHRcdGlmIChsaW5rLm9sZC5saW5rID09IGxpbmsubmV3TGluaylcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdE1hcmtkb3duTGluayhsaW5rLm9sZC5vcmlnaW5hbCkpIHtcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UobGluay5vbGQub3JpZ2luYWwsICdbJyArIGxpbmsub2xkLmRpc3BsYXlUZXh0ICsgJ10nICsgJygnICsgbGluay5uZXdMaW5rICsgJyknKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9sZC5vcmlnaW5hbCkpIHtcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UobGluay5vbGQub3JpZ2luYWwsICdbWycgKyBsaW5rLm5ld0xpbmsgKyAnXV0nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgbGluayAoZm9ybWF0IG9mIGxpbmsgaXMgbm90IG1hZWtkb3duIG9yIHdpa2lsaW5rKTogXCIgKyBsaW5rLm9sZC5vcmlnaW5hbCk7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiY2FjaGVkIGxpbmsgdXBkYXRlZCBpbiBub3RlIFtub3RlLCBvbGQgbGluaywgbmV3IGxpbmtdOiBcXG4gICBcIlxyXG5cdFx0XHRcdFx0KyBub3RlRmlsZS5wYXRoICsgXCJcXG4gICBcIiArIGxpbmsub2xkLmxpbmsgKyBcIlxcbiAgIFwiICsgbGluay5uZXdMaW5rKVxyXG5cclxuXHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGlydHkpXHJcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShub3RlRmlsZSwgdGV4dCk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgcmVwbGFjZUFsbE5vdGVXaWtpbGlua3NXaXRoTWFya2Rvd25MaW5rcyhub3RlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxMaW5rc0FuZEVtYmVkc0NoYW5nZWRJbmZvPiB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCByZXM6IExpbmtzQW5kRW1iZWRzQ2hhbmdlZEluZm8gPSB7XHJcblx0XHRcdGxpbmtzOiBbXSxcclxuXHRcdFx0ZW1iZWRzOiBbXSxcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgbm90ZUZpbGUgPSB0aGlzLmdldEZpbGVCeVBhdGgobm90ZVBhdGgpO1xyXG5cdFx0aWYgKCFub3RlRmlsZSkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiY2FudCB1cGRhdGUgd2lraWxpbmtzIGluIG5vdGUsIGZpbGUgbm90IGZvdW5kOiBcIiArIG5vdGVQYXRoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZVBhdGgpPy5saW5rcztcclxuXHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGVQYXRoKT8uZW1iZWRzO1xyXG5cdFx0bGV0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKG5vdGVGaWxlKTtcclxuXHRcdGxldCBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdGlmIChlbWJlZHMpIHsgLy9lbWJlZHMgbXVzdCBnbyBmaXJzdCFcclxuXHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpRW1iZWQoZW1iZWQub3JpZ2luYWwpKSB7XHJcblxyXG5cdFx0XHRcdFx0bGV0IG5ld1BhdGggPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhlbWJlZC5saW5rKVxyXG5cdFx0XHRcdFx0bGV0IG5ld0xpbmsgPSAnIVsnICsgJ10nICsgJygnICsgbmV3UGF0aCArICcpJ1xyXG5cdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbWJlZC5vcmlnaW5hbCwgbmV3TGluayk7XHJcblxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJ3aWtpbGluayAoZW1iZWQpIHJlcGxhY2VkIGluIG5vdGUgW25vdGUsIG9sZCBsaW5rLCBuZXcgbGlua106IFxcbiAgIFwiXHJcblx0XHRcdFx0XHRcdCsgbm90ZUZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBlbWJlZC5vcmlnaW5hbCArIFwiXFxuICAgXCIgKyBuZXdMaW5rKVxyXG5cclxuXHRcdFx0XHRcdHJlcy5lbWJlZHMucHVzaCh7IG9sZDogZW1iZWQsIG5ld0xpbms6IG5ld0xpbmsgfSlcclxuXHJcblx0XHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lMaW5rKGxpbmsub3JpZ2luYWwpKSB7XHJcblx0XHRcdFx0XHRsZXQgbmV3UGF0aCA9IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKGxpbmsubGluaylcclxuXHJcblx0XHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Rmlyc3RMaW5rcGF0aERlc3QobGluay5saW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRpZiAoZmlsZSAmJiBmaWxlLmV4dGVuc2lvbiA9PSBcIm1kXCIgJiYgIW5ld1BhdGguZW5kc1dpdGgoXCIubWRcIikpXHJcblx0XHRcdFx0XHRcdG5ld1BhdGggPSBuZXdQYXRoICsgXCIubWRcIjtcclxuXHJcblx0XHRcdFx0XHRsZXQgbmV3TGluayA9ICdbJyArIGxpbmsuZGlzcGxheVRleHQgKyAnXScgKyAnKCcgKyBuZXdQYXRoICsgJyknXHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGxpbmsub3JpZ2luYWwsIG5ld0xpbmspO1xyXG5cclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwid2lraWxpbmsgcmVwbGFjZWQgaW4gbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdFx0KyBub3RlRmlsZS5wYXRoICsgXCJcXG4gICBcIiArIGxpbmsub3JpZ2luYWwgKyBcIlxcbiAgIFwiICsgbmV3TGluaylcclxuXHJcblx0XHRcdFx0XHRyZXMubGlua3MucHVzaCh7IG9sZDogbGluaywgbmV3TGluazogbmV3TGluayB9KVxyXG5cclxuXHRcdFx0XHRcdGRpcnR5ID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGlydHkpXHJcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShub3RlRmlsZSwgdGV4dCk7XHJcblxyXG5cdFx0cmV0dXJuIHJlcztcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBBcHAsIFRBYnN0cmFjdEZpbGUsIFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgeyBMaW5rc0hhbmRsZXIsIFBhdGhDaGFuZ2VJbmZvIH0gZnJvbSAnLi9saW5rcy1oYW5kbGVyJztcclxuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgcGF0aCB9IGZyb20gJy4vcGF0aCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE1vdmVkQXR0YWNobWVudFJlc3VsdCB7XHJcblx0bW92ZWRBdHRhY2htZW50czogUGF0aENoYW5nZUluZm9bXVxyXG5cdHJlbmFtZWRGaWxlczogUGF0aENoYW5nZUluZm9bXSxcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVzSGFuZGxlciB7XHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHRwcml2YXRlIGFwcDogQXBwLFxyXG5cdFx0cHJpdmF0ZSBsaDogTGlua3NIYW5kbGVyLFxyXG5cdFx0cHJpdmF0ZSBjb25zb2xlTG9nUHJlZml4OiBzdHJpbmcgPSBcIlwiLFxyXG5cdFx0cHJpdmF0ZSBpZ25vcmVGb2xkZXJzOiBzdHJpbmdbXSA9IFtdLFxyXG5cdFx0cHJpdmF0ZSBpZ25vcmVGaWxlczogc3RyaW5nW10gPSBbXSxcclxuXHQpIHsgfVxyXG5cclxuXHRpc1BhdGhJZ25vcmVkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHBhdGguc3RhcnRzV2l0aChcIi4vXCIpKVxyXG5cdFx0XHRwYXRoID0gcGF0aC5zdWJzdHJpbmcoMik7XHJcblxyXG5cdFx0Zm9yIChsZXQgZm9sZGVyIG9mIHRoaXMuaWdub3JlRm9sZGVycykge1xyXG5cdFx0XHRpZiAocGF0aC5zdGFydHNXaXRoKGZvbGRlcikpIHtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAobGV0IGZpbGUgb2YgdGhpcy5pZ25vcmVGaWxlcykge1xyXG5cdFx0XHRpZiAocGF0aCA9PSBmaWxlKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGNyZWF0ZUZvbGRlckZvckF0dGFjaG1lbnRGcm9tTGluayhsaW5rOiBzdHJpbmcsIG93bmluZ05vdGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdGxldCBuZXdGdWxsUGF0aCA9IHRoaXMubGguZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG93bmluZ05vdGVQYXRoKTtcclxuXHRcdHJldHVybiBhd2FpdCB0aGlzLmNyZWF0ZUZvbGRlckZvckF0dGFjaG1lbnRGcm9tUGF0aChuZXdGdWxsUGF0aCk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBjcmVhdGVGb2xkZXJGb3JBdHRhY2htZW50RnJvbVBhdGgoZmlsZVBhdGg6IHN0cmluZykge1xyXG5cdFx0bGV0IG5ld1BhcmVudEZvbGRlciA9IGZpbGVQYXRoLnN1YnN0cmluZygwLCBmaWxlUGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0Ly90b2RvIGNoZWNrIGZpbGRlciBleGlzdFxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGVGb2xkZXIobmV3UGFyZW50Rm9sZGVyKVxyXG5cdFx0fSBjYXRjaCB7IH1cclxuXHR9XHJcblxyXG5cdGdlbmVyYXRlRmlsZUNvcHlOYW1lKG9yaWdpbmFsTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGxldCBleHQgPSBwYXRoLmV4dG5hbWUob3JpZ2luYWxOYW1lKTtcclxuXHRcdGxldCBiYXNlTmFtZSA9IHBhdGguYmFzZW5hbWUob3JpZ2luYWxOYW1lLCBleHQpO1xyXG5cdFx0bGV0IGRpciA9IHBhdGguZGlybmFtZShvcmlnaW5hbE5hbWUpO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCAxMDAwMDA7IGkrKykge1xyXG5cdFx0XHRsZXQgbmV3TmFtZSA9IGRpciArIFwiL1wiICsgYmFzZU5hbWUgKyBcIiBcIiArIGkgKyBleHQ7XHJcblx0XHRcdGxldCBleGlzdEZpbGUgPSB0aGlzLmxoLmdldEZpbGVCeVBhdGgobmV3TmFtZSk7XHJcblx0XHRcdGlmICghZXhpc3RGaWxlKVxyXG5cdFx0XHRcdHJldHVybiBuZXdOYW1lO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIFwiXCI7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdGFzeW5jIG1vdmVDYWNoZWROb3RlQXR0YWNobWVudHMob2xkTm90ZVBhdGg6IHN0cmluZywgbmV3Tm90ZVBhdGg6IHN0cmluZyxcclxuXHRcdGRlbGV0ZUV4aXN0RmlsZXM6IGJvb2xlYW4sIGF0dGFjaG1lbnRzU3ViZm9sZGVyOiBzdHJpbmcpOiBQcm9taXNlPE1vdmVkQXR0YWNobWVudFJlc3VsdD4ge1xyXG5cclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQob2xkTm90ZVBhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChuZXdOb3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHQvL3RyeSB0byBnZXQgZW1iZWRzIGZvciBvbGQgb3IgbmV3IHBhdGggKG1ldGFkYXRhQ2FjaGUgY2FuIGJlIHVwZGF0ZWQgb3Igbm90KVx0XHRcclxuXHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRsZXQgZW1iZWRzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShuZXdOb3RlUGF0aCk/LmVtYmVkcztcclxuXHRcdGlmICghZW1iZWRzKVxyXG5cdFx0XHRlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG9sZE5vdGVQYXRoKT8uZW1iZWRzO1xyXG5cclxuXHRcdGlmICghZW1iZWRzKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IHJlc3VsdDogTW92ZWRBdHRhY2htZW50UmVzdWx0ID0ge1xyXG5cdFx0XHRtb3ZlZEF0dGFjaG1lbnRzOiBbXSxcclxuXHRcdFx0cmVuYW1lZEZpbGVzOiBbXVxyXG5cdFx0fTtcclxuXHJcblx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0bGV0IGxpbmsgPSBlbWJlZC5saW5rO1xyXG5cdFx0XHRsZXQgb2xkTGlua1BhdGggPSB0aGlzLmxoLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBvbGROb3RlUGF0aCk7XHJcblxyXG5cdFx0XHRpZiAocmVzdWx0Lm1vdmVkQXR0YWNobWVudHMuZmluZEluZGV4KHggPT4geC5vbGRQYXRoID09IG9sZExpbmtQYXRoKSAhPSAtMSlcclxuXHRcdFx0XHRjb250aW51ZTsvL2FscmVhZHkgbW92ZWRcclxuXHJcblx0XHRcdGxldCBmaWxlID0gdGhpcy5saC5nZXRGaWxlQnlMaW5rKGxpbmssIG9sZE5vdGVQYXRoKTtcclxuXHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0ZmlsZSA9IHRoaXMubGguZ2V0RmlsZUJ5TGluayhsaW5rLCBuZXdOb3RlUGF0aCk7XHJcblx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIG9sZE5vdGVQYXRoICsgXCIgaGFzIGJhZCBlbWJlZCAoZmlsZSBkb2VzIG5vdCBleGlzdCk6IFwiICsgbGluayk7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vaWYgYXR0YWNobWVudCBub3QgaW4gdGhlIG5vdGUgZm9sZGVyLCBza2lwIGl0XHJcblx0XHRcdC8vID0gXCIuXCIgbWVhbnMgdGhhdCBub3RlIHdhcyBhdCByb290IHBhdGgsIHNvIGRvIG5vdCBza2lwIGl0XHJcblx0XHRcdGlmIChwYXRoLmRpcm5hbWUob2xkTm90ZVBhdGgpICE9IFwiLlwiICYmICFwYXRoLmRpcm5hbWUob2xkTGlua1BhdGgpLnN0YXJ0c1dpdGgocGF0aC5kaXJuYW1lKG9sZE5vdGVQYXRoKSkpXHJcblx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRsZXQgbmV3TGlua1BhdGggPSB0aGlzLmxoLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBuZXdOb3RlUGF0aCk7XHJcblxyXG5cdFx0XHRpZiAoYXR0YWNobWVudHNTdWJmb2xkZXIuY29udGFpbnMoXCIke2ZpbGVuYW1lfVwiKSkge1xyXG5cdFx0XHRcdGxldCBvbGRMaW5rUGF0aEJ5U2V0dGluZyA9IHRoaXMuZ2V0TmV3QXR0YWNobWVudFBhdGgoZmlsZS5wYXRoLCBvbGROb3RlUGF0aCwgYXR0YWNobWVudHNTdWJmb2xkZXIpO1xyXG5cdFx0XHRcdGlmIChvbGRMaW5rUGF0aCA9PSBvbGRMaW5rUGF0aEJ5U2V0dGluZykge1xyXG5cdFx0XHRcdFx0bmV3TGlua1BhdGggPSB0aGlzLmdldE5ld0F0dGFjaG1lbnRQYXRoKGZpbGUucGF0aCwgbmV3Tm90ZVBhdGgsIGF0dGFjaG1lbnRzU3ViZm9sZGVyKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChuZXdMaW5rUGF0aCA9PSBmaWxlLnBhdGgpXHJcblx0XHRcdFx0Y29udGludWU7IC8vbm90aGluZyB0byBjaGFuZ2VcclxuXHJcblxyXG5cdFx0XHRsZXQgcmVzID0gYXdhaXQgdGhpcy5tb3ZlQXR0YWNobWVudChmaWxlLCBuZXdMaW5rUGF0aCwgW29sZE5vdGVQYXRoLCBuZXdOb3RlUGF0aF0sIGRlbGV0ZUV4aXN0RmlsZXMpO1xyXG5cdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cyA9IHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmNvbmNhdChyZXMubW92ZWRBdHRhY2htZW50cyk7XHJcblx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMgPSByZXN1bHQucmVuYW1lZEZpbGVzLmNvbmNhdChyZXMucmVuYW1lZEZpbGVzKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdGdldE5ld0F0dGFjaG1lbnRQYXRoKG9sZEF0dGFjaG1lbnRQYXRoOiBzdHJpbmcsIG5vdGVQYXRoOiBzdHJpbmcsIHN1YmZvbGRlck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRsZXQgcmVzb2x2ZWRTdWJGb2xkZXJOYW1lID0gc3ViZm9sZGVyTmFtZS5yZXBsYWNlKC9cXCR7ZmlsZW5hbWV9L2csIHBhdGguYmFzZW5hbWUobm90ZVBhdGgsIFwiLm1kXCIpKTtcclxuXHRcdGxldCBuZXdQYXRoID0gKHJlc29sdmVkU3ViRm9sZGVyTmFtZSA9PSBcIlwiKSA/IHBhdGguZGlybmFtZShub3RlUGF0aCkgOiBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKG5vdGVQYXRoKSwgcmVzb2x2ZWRTdWJGb2xkZXJOYW1lKTtcclxuXHRcdG5ld1BhdGggPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShwYXRoLmpvaW4obmV3UGF0aCwgcGF0aC5iYXNlbmFtZShvbGRBdHRhY2htZW50UGF0aCkpKTtcclxuXHRcdHJldHVybiBuZXdQYXRoO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGNvbGxlY3RBdHRhY2htZW50c0ZvckNhY2hlZE5vdGUobm90ZVBhdGg6IHN0cmluZywgc3ViZm9sZGVyTmFtZTogc3RyaW5nLFxyXG5cdFx0ZGVsZXRlRXhpc3RGaWxlczogYm9vbGVhbik6IFByb21pc2U8TW92ZWRBdHRhY2htZW50UmVzdWx0PiB7XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgcmVzdWx0OiBNb3ZlZEF0dGFjaG1lbnRSZXN1bHQgPSB7XHJcblx0XHRcdG1vdmVkQXR0YWNobWVudHM6IFtdLFxyXG5cdFx0XHRyZW5hbWVkRmlsZXM6IFtdXHJcblx0XHR9O1xyXG5cclxuXHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRsZXQgZW1iZWRzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlUGF0aCk/LmVtYmVkcztcclxuXHRcdGlmIChlbWJlZHMpIHtcclxuXHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0bGV0IGxpbmsgPSBlbWJlZC5saW5rO1xyXG5cclxuXHRcdFx0XHRsZXQgZmlsbFBhdGhMaW5rID0gdGhpcy5saC5nZXRGdWxsUGF0aEZvckxpbmsobGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdGlmIChyZXN1bHQubW92ZWRBdHRhY2htZW50cy5maW5kSW5kZXgoeCA9PiB4Lm9sZFBhdGggPT0gZmlsbFBhdGhMaW5rKSAhPSAtMSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlOy8vYWxyZWFkeSBtb3ZlZFx0XHJcblxyXG5cdFx0XHRcdGxldCBmaWxlID0gdGhpcy5saC5nZXRGaWxlQnlMaW5rKGxpbmssIG5vdGVQYXRoKVxyXG5cdFx0XHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgZW1iZWQgKGZpbGUgZG9lcyBub3QgZXhpc3QpOiBcIiArIGxpbmspO1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcclxuXHJcblx0XHRcdFx0bGV0IG5ld1BhdGggPSB0aGlzLmdldE5ld0F0dGFjaG1lbnRQYXRoKGZpbGUucGF0aCwgbm90ZVBhdGgsIHN1YmZvbGRlck5hbWUpO1xyXG5cclxuXHJcblx0XHRcdFx0aWYgKG5ld1BhdGggPT0gZmlsZS5wYXRoKS8vbm90aGluZyB0byBtb3ZlXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IHJlcyA9IGF3YWl0IHRoaXMubW92ZUF0dGFjaG1lbnQoZmlsZSwgbmV3UGF0aCwgW25vdGVQYXRoXSwgZGVsZXRlRXhpc3RGaWxlcyk7XHJcblxyXG5cdFx0XHRcdHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzID0gcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMuY29uY2F0KHJlcy5tb3ZlZEF0dGFjaG1lbnRzKTtcclxuXHRcdFx0XHRyZXN1bHQucmVuYW1lZEZpbGVzID0gcmVzdWx0LnJlbmFtZWRGaWxlcy5jb25jYXQocmVzLnJlbmFtZWRGaWxlcyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0bGV0IGxpbmtzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlUGF0aCk/LmxpbmtzO1xyXG5cdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdGZvciAobGV0IGwgb2YgbGlua3MpIHtcclxuXHRcdFx0XHRsZXQgbGluayA9IHRoaXMubGguc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsLmxpbmspLmxpbms7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rLnN0YXJ0c1dpdGgoXCIjXCIpKSAvL2ludGVybmFsIHNlY3Rpb24gbGlua1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rLmVuZHNXaXRoKFwiLm1kXCIpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCBmaWxsUGF0aExpbmsgPSB0aGlzLmxoLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0aWYgKHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmZpbmRJbmRleCh4ID0+IHgub2xkUGF0aCA9PSBmaWxsUGF0aExpbmspICE9IC0xKVxyXG5cdFx0XHRcdFx0Y29udGludWU7Ly9hbHJlYWR5IG1vdmVkXHRcclxuXHJcblx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmxoLmdldEZpbGVCeUxpbmsobGluaywgbm90ZVBhdGgpXHJcblx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIG5vdGVQYXRoICsgXCIgaGFzIGJhZCBsaW5rIChmaWxlIGRvZXMgbm90IGV4aXN0KTogXCIgKyBsaW5rKTtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0bGV0IG5ld1BhdGggPSB0aGlzLmdldE5ld0F0dGFjaG1lbnRQYXRoKGZpbGUucGF0aCwgbm90ZVBhdGgsIHN1YmZvbGRlck5hbWUpO1xyXG5cclxuXHRcdFx0XHRpZiAobmV3UGF0aCA9PSBmaWxlLnBhdGgpLy9ub3RoaW5nIHRvIG1vdmVcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzID0gYXdhaXQgdGhpcy5tb3ZlQXR0YWNobWVudChmaWxlLCBuZXdQYXRoLCBbbm90ZVBhdGhdLCBkZWxldGVFeGlzdEZpbGVzKTtcclxuXHJcblx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMgPSByZXN1bHQubW92ZWRBdHRhY2htZW50cy5jb25jYXQocmVzLm1vdmVkQXR0YWNobWVudHMpO1xyXG5cdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMgPSByZXN1bHQucmVuYW1lZEZpbGVzLmNvbmNhdChyZXMucmVuYW1lZEZpbGVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgbW92ZUF0dGFjaG1lbnQoZmlsZTogVEZpbGUsIG5ld0xpbmtQYXRoOiBzdHJpbmcsIHBhcmVudE5vdGVQYXRoczogc3RyaW5nW10sIGRlbGV0ZUV4aXN0RmlsZXM6IGJvb2xlYW4pOiBQcm9taXNlPE1vdmVkQXR0YWNobWVudFJlc3VsdD4ge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLnBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cclxuXHRcdGlmIChmaWxlLnBhdGggPT0gbmV3TGlua1BhdGgpIHtcclxuXHRcdFx0Y29uc29sZS53YXJuKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiQ2FudCBtb3ZlIGZpbGUuIFNvdXJjZSBhbmQgZGVzdGluYXRpb24gcGF0aCB0aGUgc2FtZS5cIilcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdCA9IHtcclxuXHRcdFx0bW92ZWRBdHRhY2htZW50czogW10sXHJcblx0XHRcdHJlbmFtZWRGaWxlczogW11cclxuXHRcdH07XHJcblxyXG5cdFx0YXdhaXQgdGhpcy5jcmVhdGVGb2xkZXJGb3JBdHRhY2htZW50RnJvbVBhdGgobmV3TGlua1BhdGgpO1xyXG5cclxuXHRcdGxldCBsaW5rZWROb3RlcyA9IHRoaXMubGguZ2V0Q2FjaGVkTm90ZXNUaGF0SGF2ZUxpbmtUb0ZpbGUoZmlsZS5wYXRoKTtcclxuXHRcdGlmIChwYXJlbnROb3RlUGF0aHMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZVBhdGggb2YgcGFyZW50Tm90ZVBhdGhzKSB7XHJcblx0XHRcdFx0bGlua2VkTm90ZXMucmVtb3ZlKG5vdGVQYXRoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vaWYgbm8gb3RoZXIgZmlsZSBoYXMgbGluayB0byB0aGlzIGZpbGUgLSB0cnkgdG8gbW92ZSBmaWxlXHJcblx0XHQvL2lmIGZpbGUgYWxyZWFkeSBleGlzdCBhdCBuZXcgbG9jYXRpb24gLSBkZWxldGUgb3IgbW92ZSB3aXRoIG5ldyBuYW1lXHJcblx0XHRpZiAobGlua2VkTm90ZXMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0bGV0IGV4aXN0RmlsZSA9IHRoaXMubGguZ2V0RmlsZUJ5UGF0aChuZXdMaW5rUGF0aCk7XHJcblx0XHRcdGlmICghZXhpc3RGaWxlKSB7XHJcblx0XHRcdFx0Ly9tb3ZlXHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJtb3ZlIGZpbGUgW2Zyb20sIHRvXTogXFxuICAgXCIgKyBmaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgbmV3TGlua1BhdGgpXHJcblx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMucHVzaCh7IG9sZFBhdGg6IGZpbGUucGF0aCwgbmV3UGF0aDogbmV3TGlua1BhdGggfSlcclxuXHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3TGlua1BhdGgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmIChkZWxldGVFeGlzdEZpbGVzKSB7XHJcblx0XHRcdFx0XHQvL2RlbGV0ZVxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJkZWxldGUgZmlsZTogXFxuICAgXCIgKyBmaWxlLnBhdGgpXHJcblx0XHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogZmlsZS5wYXRoLCBuZXdQYXRoOiBuZXdMaW5rUGF0aCB9KVxyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQudHJhc2goZmlsZSwgdHJ1ZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vbW92ZSB3aXRoIG5ldyBuYW1lXHJcblx0XHRcdFx0XHRsZXQgbmV3RmlsZUNvcHlOYW1lID0gdGhpcy5nZW5lcmF0ZUZpbGVDb3B5TmFtZShuZXdMaW5rUGF0aClcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiY29weSBmaWxlIHdpdGggbmV3IG5hbWUgW2Zyb20sIHRvXTogXFxuICAgXCIgKyBmaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgbmV3RmlsZUNvcHlOYW1lKVxyXG5cdFx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMucHVzaCh7IG9sZFBhdGg6IGZpbGUucGF0aCwgbmV3UGF0aDogbmV3RmlsZUNvcHlOYW1lIH0pXHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3RmlsZUNvcHlOYW1lKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMucHVzaCh7IG9sZFBhdGg6IG5ld0xpbmtQYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vaWYgc29tZSBvdGhlciBmaWxlIGhhcyBsaW5rIHRvIHRoaXMgZmlsZSAtIHRyeSB0byBjb3B5IGZpbGVcclxuXHRcdC8vaWYgZmlsZSBhbHJlYWR5IGV4aXN0IGF0IG5ldyBsb2NhdGlvbiAtIGNvcHkgZmlsZSB3aXRoIG5ldyBuYW1lIG9yIGRvIG5vdGhpbmdcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRsZXQgZXhpc3RGaWxlID0gdGhpcy5saC5nZXRGaWxlQnlQYXRoKG5ld0xpbmtQYXRoKTtcclxuXHRcdFx0aWYgKCFleGlzdEZpbGUpIHtcclxuXHRcdFx0XHQvL2NvcHlcclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNvcHkgZmlsZSBbZnJvbSwgdG9dOiBcXG4gICBcIiArIGZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBuZXdMaW5rUGF0aClcclxuXHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogZmlsZS5wYXRoLCBuZXdQYXRoOiBuZXdMaW5rUGF0aCB9KVxyXG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNvcHkoZmlsZSwgbmV3TGlua1BhdGgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmIChkZWxldGVFeGlzdEZpbGVzKSB7XHJcblx0XHRcdFx0XHQvL2RvIG5vdGhpbmdcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly9jb3B5IHdpdGggbmV3IG5hbWVcclxuXHRcdFx0XHRcdGxldCBuZXdGaWxlQ29weU5hbWUgPSB0aGlzLmdlbmVyYXRlRmlsZUNvcHlOYW1lKG5ld0xpbmtQYXRoKVxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjb3B5IGZpbGUgd2l0aCBuZXcgbmFtZSBbZnJvbSwgdG9dOiBcXG4gICBcIiArIGZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBuZXdGaWxlQ29weU5hbWUpXHJcblx0XHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogZmlsZS5wYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNvcHkoZmlsZSwgbmV3RmlsZUNvcHlOYW1lKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMucHVzaCh7IG9sZFBhdGg6IG5ld0xpbmtQYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cclxuXHRhc3luYyBkZWxldGVFbXB0eUZvbGRlcnMoZGlyTmFtZTogc3RyaW5nKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKGRpck5hbWUpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKGRpck5hbWUuc3RhcnRzV2l0aChcIi4vXCIpKVxyXG5cdFx0XHRkaXJOYW1lID0gZGlyTmFtZS5zdWJzdHJpbmcoMik7XHJcblxyXG5cclxuXHRcdGxldCBsaXN0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRpck5hbWUpO1xyXG5cdFx0Zm9yIChsZXQgZm9sZGVyIG9mIGxpc3QuZm9sZGVycykge1xyXG5cdFx0XHRhd2FpdCB0aGlzLmRlbGV0ZUVtcHR5Rm9sZGVycyhmb2xkZXIpXHJcblx0XHR9XHJcblxyXG5cdFx0bGlzdCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkaXJOYW1lKTtcclxuXHRcdGlmIChsaXN0LmZpbGVzLmxlbmd0aCA9PSAwICYmIGxpc3QuZm9sZGVycy5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImRlbGV0ZSBlbXB0eSBmb2xkZXI6IFxcbiAgIFwiICsgZGlyTmFtZSlcclxuXHRcdFx0aWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGRpck5hbWUpKVxyXG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIoZGlyTmFtZSwgZmFsc2UpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZGVsZXRlVW51c2VkQXR0YWNobWVudHNGb3JDYWNoZWROb3RlKG5vdGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGVQYXRoKT8uZW1iZWRzO1xyXG5cdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRsZXQgbGluayA9IGVtYmVkLmxpbms7XHJcblxyXG5cdFx0XHRcdGxldCBmdWxsUGF0aCA9IHRoaXMubGguZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRsZXQgbGlua2VkTm90ZXMgPSB0aGlzLmxoLmdldENhY2hlZE5vdGVzVGhhdEhhdmVMaW5rVG9GaWxlKGZ1bGxQYXRoKTtcclxuXHRcdFx0XHRpZiAobGlua2VkTm90ZXMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5saC5nZXRGaWxlQnlMaW5rKGxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmIChmaWxlKSB7XHJcblx0XHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQudHJhc2goZmlsZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggeyB9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH1cclxufVxyXG5cclxuXHJcbiIsImltcG9ydCB7IEFwcCwgUGx1Z2luLCBUQWJzdHJhY3RGaWxlLCBURmlsZSwgRW1iZWRDYWNoZSwgTGlua0NhY2hlLCBOb3RpY2UsIEVkaXRvciwgTWFya2Rvd25WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgeyBQbHVnaW5TZXR0aW5ncywgREVGQVVMVF9TRVRUSU5HUywgU2V0dGluZ1RhYiB9IGZyb20gJy4vc2V0dGluZ3MnO1xyXG5pbXBvcnQgeyBVdGlscyB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBMaW5rc0hhbmRsZXIsIFBhdGhDaGFuZ2VJbmZvIH0gZnJvbSAnLi9saW5rcy1oYW5kbGVyJztcclxuaW1wb3J0IHsgRmlsZXNIYW5kbGVyLCBNb3ZlZEF0dGFjaG1lbnRSZXN1bHQgfSBmcm9tICcuL2ZpbGVzLWhhbmRsZXInO1xyXG5pbXBvcnQgeyBwYXRoIH0gZnJvbSAnLi9wYXRoJztcclxuXHJcblxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnNpc3RlbnRBdHRhY2htZW50c0FuZExpbmtzIGV4dGVuZHMgUGx1Z2luIHtcclxuXHRzZXR0aW5nczogUGx1Z2luU2V0dGluZ3M7XHJcblx0bGg6IExpbmtzSGFuZGxlcjtcclxuXHRmaDogRmlsZXNIYW5kbGVyO1xyXG5cclxuXHRyZWNlbnRseVJlbmFtZWRGaWxlczogUGF0aENoYW5nZUluZm9bXSA9IFtdO1xyXG5cdGN1cnJlbnRseVJlbmFtaW5nRmlsZXM6IFBhdGhDaGFuZ2VJbmZvW10gPSBbXTtcclxuXHR0aW1lcklkOiBOb2RlSlMuVGltZW91dDtcclxuXHRyZW5hbWluZ0lzQWN0aXZlID0gZmFsc2U7XHJcblxyXG5cdGFzeW5jIG9ubG9hZCgpIHtcclxuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcblxyXG5cdFx0dGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XHJcblxyXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxyXG5cdFx0XHR0aGlzLmFwcC52YXVsdC5vbignZGVsZXRlJywgKGZpbGUpID0+IHRoaXMuaGFuZGxlRGVsZXRlZEZpbGUoZmlsZSkpLFxyXG5cdFx0KTtcclxuXHJcblx0XHR0aGlzLnJlZ2lzdGVyRXZlbnQoXHJcblx0XHRcdHRoaXMuYXBwLnZhdWx0Lm9uKCdyZW5hbWUnLCAoZmlsZSwgb2xkUGF0aCkgPT4gdGhpcy5oYW5kbGVSZW5hbWVkRmlsZShmaWxlLCBvbGRQYXRoKSksXHJcblx0XHQpO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAnY29sbGVjdC1hbGwtYXR0YWNobWVudHMnLFxyXG5cdFx0XHRuYW1lOiAnQ29sbGVjdCBhbGwgYXR0YWNobWVudHMnLFxyXG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdGhpcy5jb2xsZWN0QWxsQXR0YWNobWVudHMoKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdjb2xsZWN0LWF0dGFjaG1lbnRzLWN1cnJlbnQtbm90ZScsXHJcblx0XHRcdG5hbWU6ICdDb2xsZWN0IGF0dGFjaG1lbnRzIGluIGN1cnJlbnQgbm90ZScsXHJcblx0XHRcdGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldykgPT4gdGhpcy5jb2xsZWN0QXR0YWNobWVudHNDdXJyZW50Tm90ZShlZGl0b3IsIHZpZXcpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ2RlbGV0ZS1lbXB0eS1mb2xkZXJzJyxcclxuXHRcdFx0bmFtZTogJ0RlbGV0ZSBlbXB0eSBmb2xkZXJzJyxcclxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuZGVsZXRlRW1wdHlGb2xkZXJzKClcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAnY29udmVydC1hbGwtbGluay1wYXRocy10by1yZWxhdGl2ZScsXHJcblx0XHRcdG5hbWU6ICdDb252ZXJ0IGFsbCBsaW5rIHBhdGhzIHRvIHJlbGF0aXZlJyxcclxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuY29udmVydEFsbExpbmtQYXRoc1RvUmVsYXRpdmUoKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdjb252ZXJ0LWFsbC1lbWJlZC1wYXRocy10by1yZWxhdGl2ZScsXHJcblx0XHRcdG5hbWU6ICdDb252ZXJ0IGFsbCBlbWJlZCBwYXRocyB0byByZWxhdGl2ZScsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmNvbnZlcnRBbGxFbWJlZHNQYXRoc1RvUmVsYXRpdmUoKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdyZXBsYWNlLWFsbC13aWtpbGlua3Mtd2l0aC1tYXJrZG93bi1saW5rcycsXHJcblx0XHRcdG5hbWU6ICdSZXBsYWNlIGFsbCB3aWtpbGlua3Mgd2l0aCBtYXJrZG93biBsaW5rcycsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLnJlcGxhY2VBbGxXaWtpbGlua3NXaXRoTWFya2Rvd25MaW5rcygpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ3Jlb3JnYW5pemUtdmF1bHQnLFxyXG5cdFx0XHRuYW1lOiAnUmVvcmdhbml6ZSB2YXVsdCcsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLnJlb3JnYW5pemVWYXVsdCgpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ2NoZWNrLWNvbnNpc3RlbnQnLFxyXG5cdFx0XHRuYW1lOiAnQ2hlY2sgdmF1bHQgY29uc2lzdGVudCcsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmNoZWNrQ29uc2lzdGVudCgpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmxoID0gbmV3IExpbmtzSGFuZGxlcihcclxuXHRcdFx0dGhpcy5hcHAsXHJcblx0XHRcdFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6IFwiLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXNcclxuXHRcdCk7XHJcblxyXG5cdFx0dGhpcy5maCA9IG5ldyBGaWxlc0hhbmRsZXIoXHJcblx0XHRcdHRoaXMuYXBwLFxyXG5cdFx0XHR0aGlzLmxoLFxyXG5cdFx0XHRcIkNvbnNpc3RlbnQgYXR0YWNobWVudHMgYW5kIGxpbmtzOiBcIixcclxuXHRcdFx0dGhpcy5zZXR0aW5ncy5pZ25vcmVGb2xkZXJzLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZpbGVzXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0aXNQYXRoSWdub3JlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoXCIuL1wiKSlcclxuXHRcdFx0cGF0aCA9IHBhdGguc3Vic3RyaW5nKDIpO1xyXG5cclxuXHRcdGZvciAobGV0IGZvbGRlciBvZiB0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMpIHtcclxuXHRcdFx0aWYgKHBhdGguc3RhcnRzV2l0aChmb2xkZXIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGxldCBmaWxlIG9mIHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXMpIHtcclxuXHRcdFx0aWYgKHBhdGggPT0gZmlsZSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgaGFuZGxlRGVsZXRlZEZpbGUoZmlsZTogVEFic3RyYWN0RmlsZSkge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLnBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGZpbGVFeHQgPSBmaWxlLnBhdGguc3Vic3RyaW5nKGZpbGUucGF0aC5sYXN0SW5kZXhPZihcIi5cIikpO1xyXG5cdFx0aWYgKGZpbGVFeHQgPT0gXCIubWRcIikge1xyXG5cdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5kZWxldGVBdHRhY2htZW50c1dpdGhOb3RlKSB7XHJcblx0XHRcdFx0YXdhaXQgdGhpcy5maC5kZWxldGVVbnVzZWRBdHRhY2htZW50c0ZvckNhY2hlZE5vdGUoZmlsZS5wYXRoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly9kZWxldGUgY2hpbGQgZm9sZGVycyAoZG8gbm90IGRlbGV0ZSBwYXJlbnQpXHJcblx0XHRcdGlmICh0aGlzLnNldHRpbmdzLmRlbGV0ZUVtcHR5Rm9sZGVycykge1xyXG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoLmRpcm5hbWUoZmlsZS5wYXRoKSkpIHtcclxuXHRcdFx0XHRcdGxldCBsaXN0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KHBhdGguZGlybmFtZShmaWxlLnBhdGgpKTtcclxuXHRcdFx0XHRcdGZvciAobGV0IGZvbGRlciBvZiBsaXN0LmZvbGRlcnMpIHtcclxuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5maC5kZWxldGVFbXB0eUZvbGRlcnMoZm9sZGVyKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGhhbmRsZVJlbmFtZWRGaWxlKGZpbGU6IFRBYnN0cmFjdEZpbGUsIG9sZFBhdGg6IHN0cmluZykge1xyXG5cdFx0dGhpcy5yZWNlbnRseVJlbmFtZWRGaWxlcy5wdXNoKHsgb2xkUGF0aDogb2xkUGF0aCwgbmV3UGF0aDogZmlsZS5wYXRoIH0pO1xyXG5cclxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVySWQpO1xyXG5cdFx0dGhpcy50aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuSGFuZGxlUmVjZW50bHlSZW5hbWVkRmlsZXMoKSB9LCAzMDAwKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIEhhbmRsZVJlY2VudGx5UmVuYW1lZEZpbGVzKCkge1xyXG5cdFx0aWYgKCF0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzIHx8IHRoaXMucmVjZW50bHlSZW5hbWVkRmlsZXMubGVuZ3RoID09IDApIC8vbm90aGluZyB0byByZW5hbWVcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmICh0aGlzLnJlbmFtaW5nSXNBY3RpdmUpIC8vYWxyZWFkeSBzdGFydGVkXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLnJlbmFtaW5nSXNBY3RpdmUgPSB0cnVlO1xyXG5cclxuXHRcdHRoaXMuY3VycmVudGx5UmVuYW1pbmdGaWxlcyA9IHRoaXMucmVjZW50bHlSZW5hbWVkRmlsZXM7IC8vY2xlYXIgYXJyYXkgZm9yIHB1c2hpbmcgbmV3IGZpbGVzIGFzeW5jXHJcblx0XHR0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzID0gW107XHJcblxyXG5cdFx0bmV3IE5vdGljZShcIkZpeGluZyBjb25zaXN0ZW50IGZvciBcIiArIHRoaXMuY3VycmVudGx5UmVuYW1pbmdGaWxlcy5sZW5ndGggKyBcIiByZW5hbWVkIGZpbGVzXCIgKyBcIi4uLlwiKTtcclxuXHRcdGNvbnNvbGUubG9nKFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6XFxuRml4aW5nIGNvbnNpc3RlbnQgZm9yIFwiICsgdGhpcy5jdXJyZW50bHlSZW5hbWluZ0ZpbGVzLmxlbmd0aCArIFwiIHJlbmFtZWQgZmlsZXNcIiArIFwiLi4uXCIpO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdGZvciAobGV0IGZpbGUgb2YgdGhpcy5jdXJyZW50bHlSZW5hbWluZ0ZpbGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLm5ld1BhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLm9sZFBhdGgpKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0XHQvLyBhd2FpdCBVdGlscy5kZWxheSgxMCk7IC8vd2FpdGluZyBmb3IgdXBkYXRlIHZhdWx0XHJcblxyXG5cdFx0XHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdDtcclxuXHJcblx0XHRcdFx0bGV0IGZpbGVFeHQgPSBmaWxlLm9sZFBhdGguc3Vic3RyaW5nKGZpbGUub2xkUGF0aC5sYXN0SW5kZXhPZihcIi5cIikpO1xyXG5cclxuXHRcdFx0XHRpZiAoZmlsZUV4dCA9PSBcIi5tZFwiKSB7XHJcblx0XHRcdFx0XHQvLyBhd2FpdCBVdGlscy5kZWxheSg1MDApOy8vd2FpdGluZyBmb3IgdXBkYXRlIG1ldGFkYXRhQ2FjaGVcclxuXHJcblx0XHRcdFx0XHRpZiAoKHBhdGguZGlybmFtZShmaWxlLm9sZFBhdGgpICE9IHBhdGguZGlybmFtZShmaWxlLm5ld1BhdGgpKSB8fCAodGhpcy5zZXR0aW5ncy5hdHRhY2htZW50c1N1YmZvbGRlci5jb250YWlucyhcIiR7ZmlsZW5hbWV9XCIpKSkge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5tb3ZlQXR0YWNobWVudHNXaXRoTm90ZSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IGF3YWl0IHRoaXMuZmgubW92ZUNhY2hlZE5vdGVBdHRhY2htZW50cyhcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGUub2xkUGF0aCxcclxuXHRcdFx0XHRcdFx0XHRcdGZpbGUubmV3UGF0aCxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSxcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuYXR0YWNobWVudHNTdWJmb2xkZXJcclxuXHRcdFx0XHRcdFx0XHQpXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnVwZGF0ZUxpbmtzICYmIHJlc3VsdCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGNoYW5nZWRGaWxlcyA9IHJlc3VsdC5yZW5hbWVkRmlsZXMuY29uY2F0KHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzKTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChjaGFuZ2VkRmlsZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLmxoLnVwZGF0ZUNoYW5nZWRQYXRoc0luTm90ZShmaWxlLm5ld1BhdGgsIGNoYW5nZWRGaWxlcylcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnVwZGF0ZUxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5saC51cGRhdGVJbnRlcm5hbExpbmtzSW5Nb3ZlZE5vdGUoZmlsZS5vbGRQYXRoLCBmaWxlLm5ld1BhdGgsIHRoaXMuc2V0dGluZ3MubW92ZUF0dGFjaG1lbnRzV2l0aE5vdGUpXHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vZGVsZXRlIGNoaWxkIGZvbGRlcnMgKGRvIG5vdCBkZWxldGUgcGFyZW50KVxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5kZWxldGVFbXB0eUZvbGRlcnMpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aC5kaXJuYW1lKGZpbGUub2xkUGF0aCkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgbGlzdCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChwYXRoLmRpcm5hbWUoZmlsZS5vbGRQYXRoKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZmguZGVsZXRlRW1wdHlGb2xkZXJzKGZvbGRlcik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgdXBkYXRlQWx0cyA9IHRoaXMuc2V0dGluZ3MuY2hhbmdlTm90ZUJhY2tsaW5rc0FsdCAmJiBmaWxlRXh0ID09IFwiLm1kXCI7XHJcblx0XHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MudXBkYXRlTGlua3MpIHtcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMubGgudXBkYXRlTGlua3NUb1JlbmFtZWRGaWxlKGZpbGUub2xkUGF0aCwgZmlsZS5uZXdQYXRoLCB1cGRhdGVBbHRzLCB0aGlzLnNldHRpbmdzLnVzZUJ1aWx0SW5PYnNpZGlhbkxpbmtDYWNoaW5nKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChyZXN1bHQgJiYgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMgJiYgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0bmV3IE5vdGljZShcIk1vdmVkIFwiICsgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoICsgXCIgYXR0YWNobWVudFwiICsgKHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcihcIkNvbnNpc3RlbnQgYXR0YWNobWVudHMgYW5kIGxpbmtzOiBcXG5cIiArIGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdG5ldyBOb3RpY2UoXCJGaXhpbmcgY29uc2lzdGVudCBjb21wbGV0ZVwiKTtcclxuXHRcdGNvbnNvbGUubG9nKFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6XFxuRml4aW5nIGNvbnNpc3RlbnQgY29tcGxldGVcIik7XHJcblxyXG5cdFx0dGhpcy5yZW5hbWluZ0lzQWN0aXZlID0gZmFsc2U7XHJcblxyXG5cdFx0aWYgKHRoaXMucmVjZW50bHlSZW5hbWVkRmlsZXMgJiYgdGhpcy5yZWNlbnRseVJlbmFtZWRGaWxlcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVySWQpO1xyXG5cdFx0XHR0aGlzLnRpbWVySWQgPSBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5IYW5kbGVSZWNlbnRseVJlbmFtZWRGaWxlcygpIH0sIDUwMCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgY29sbGVjdEF0dGFjaG1lbnRzQ3VycmVudE5vdGUoZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldykge1xyXG5cdFx0bGV0IG5vdGUgPSB2aWV3LmZpbGU7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpIHtcclxuXHRcdFx0bmV3IE5vdGljZShcIk5vdGUgcGF0aCBpcyBpZ25vcmVkXCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZmguY29sbGVjdEF0dGFjaG1lbnRzRm9yQ2FjaGVkTm90ZShcclxuXHRcdFx0bm90ZS5wYXRoLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmF0dGFjaG1lbnRzU3ViZm9sZGVyLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmRlbGV0ZUV4aXN0RmlsZXNXaGVuTW92ZU5vdGUpO1xyXG5cclxuXHRcdGlmIChyZXN1bHQgJiYgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMgJiYgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRhd2FpdCB0aGlzLmxoLnVwZGF0ZUNoYW5nZWRQYXRoc0luTm90ZShub3RlLnBhdGgsIHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzKVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChyZXN1bHQubW92ZWRBdHRhY2htZW50cy5sZW5ndGggPT0gMClcclxuXHRcdFx0bmV3IE5vdGljZShcIk5vIGZpbGVzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSBtb3ZlZFwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0bmV3IE5vdGljZShcIk1vdmVkIFwiICsgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoICsgXCIgYXR0YWNobWVudFwiICsgKHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBjb2xsZWN0QWxsQXR0YWNobWVudHMoKSB7XHJcblx0XHRsZXQgbW92ZWRBdHRhY2htZW50c0NvdW50ID0gMDtcclxuXHRcdGxldCBwcm9jZXNzZWROb3Rlc0NvdW50ID0gMDtcclxuXHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZmguY29sbGVjdEF0dGFjaG1lbnRzRm9yQ2FjaGVkTm90ZShcclxuXHRcdFx0XHRcdG5vdGUucGF0aCxcclxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuYXR0YWNobWVudHNTdWJmb2xkZXIsXHJcblx0XHRcdFx0XHR0aGlzLnNldHRpbmdzLmRlbGV0ZUV4aXN0RmlsZXNXaGVuTW92ZU5vdGUpO1xyXG5cclxuXHJcblx0XHRcdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQubW92ZWRBdHRhY2htZW50cyAmJiByZXN1bHQubW92ZWRBdHRhY2htZW50cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmxoLnVwZGF0ZUNoYW5nZWRQYXRoc0luTm90ZShub3RlLnBhdGgsIHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzKVxyXG5cdFx0XHRcdFx0bW92ZWRBdHRhY2htZW50c0NvdW50ICs9IHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmxlbmd0aDtcclxuXHRcdFx0XHRcdHByb2Nlc3NlZE5vdGVzQ291bnQrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAobW92ZWRBdHRhY2htZW50c0NvdW50ID09IDApXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJObyBmaWxlcyBmb3VuZCB0aGF0IG5lZWQgdG8gYmUgbW92ZWRcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJNb3ZlZCBcIiArIG1vdmVkQXR0YWNobWVudHNDb3VudCArIFwiIGF0dGFjaG1lbnRcIiArIChtb3ZlZEF0dGFjaG1lbnRzQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKVxyXG5cdFx0XHRcdCsgXCIgZnJvbSBcIiArIHByb2Nlc3NlZE5vdGVzQ291bnQgKyBcIiBub3RlXCIgKyAocHJvY2Vzc2VkTm90ZXNDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBjb252ZXJ0QWxsRW1iZWRzUGF0aHNUb1JlbGF0aXZlKCkge1xyXG5cdFx0bGV0IGNoYW5nZWRFbWJlZENvdW50ID0gMDtcclxuXHRcdGxldCBwcm9jZXNzZWROb3Rlc0NvdW50ID0gMDtcclxuXHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMubGguY29udmVydEFsbE5vdGVFbWJlZHNQYXRoc1RvUmVsYXRpdmUobm90ZS5wYXRoKTtcclxuXHJcblx0XHRcdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0Y2hhbmdlZEVtYmVkQ291bnQgKz0gcmVzdWx0Lmxlbmd0aDtcclxuXHRcdFx0XHRcdHByb2Nlc3NlZE5vdGVzQ291bnQrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY2hhbmdlZEVtYmVkQ291bnQgPT0gMClcclxuXHRcdFx0bmV3IE5vdGljZShcIk5vIGVtYmVkcyBmb3VuZCB0aGF0IG5lZWQgdG8gYmUgY29udmVydGVkXCIpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiQ29udmVydGVkIFwiICsgY2hhbmdlZEVtYmVkQ291bnQgKyBcIiBlbWJlZFwiICsgKGNoYW5nZWRFbWJlZENvdW50ID4gMSA/IFwic1wiIDogXCJcIilcclxuXHRcdFx0XHQrIFwiIGZyb20gXCIgKyBwcm9jZXNzZWROb3Rlc0NvdW50ICsgXCIgbm90ZVwiICsgKHByb2Nlc3NlZE5vdGVzQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKSk7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgY29udmVydEFsbExpbmtQYXRoc1RvUmVsYXRpdmUoKSB7XHJcblx0XHRsZXQgY2hhbmdlZExpbmtzQ291bnQgPSAwO1xyXG5cdFx0bGV0IHByb2Nlc3NlZE5vdGVzQ291bnQgPSAwO1xyXG5cclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5saC5jb252ZXJ0QWxsTm90ZUxpbmtzUGF0aHNUb1JlbGF0aXZlKG5vdGUucGF0aCk7XHJcblxyXG5cdFx0XHRcdGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdGNoYW5nZWRMaW5rc0NvdW50ICs9IHJlc3VsdC5sZW5ndGg7XHJcblx0XHRcdFx0XHRwcm9jZXNzZWROb3Rlc0NvdW50Kys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGNoYW5nZWRMaW5rc0NvdW50ID09IDApXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJObyBsaW5rcyBmb3VuZCB0aGF0IG5lZWQgdG8gYmUgY29udmVydGVkXCIpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiQ29udmVydGVkIFwiICsgY2hhbmdlZExpbmtzQ291bnQgKyBcIiBsaW5rXCIgKyAoY2hhbmdlZExpbmtzQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKVxyXG5cdFx0XHRcdCsgXCIgZnJvbSBcIiArIHByb2Nlc3NlZE5vdGVzQ291bnQgKyBcIiBub3RlXCIgKyAocHJvY2Vzc2VkTm90ZXNDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIHJlcGxhY2VBbGxXaWtpbGlua3NXaXRoTWFya2Rvd25MaW5rcygpIHtcclxuXHRcdGxldCBjaGFuZ2VkTGlua3NDb3VudCA9IDA7XHJcblx0XHRsZXQgcHJvY2Vzc2VkTm90ZXNDb3VudCA9IDA7XHJcblxyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCByZXN1bHQgPSBhd2FpdCB0aGlzLmxoLnJlcGxhY2VBbGxOb3RlV2lraWxpbmtzV2l0aE1hcmtkb3duTGlua3Mobm90ZS5wYXRoKTtcclxuXHJcblx0XHRcdFx0aWYgKHJlc3VsdCAmJiAocmVzdWx0LmxpbmtzLmxlbmd0aCA+IDAgfHwgcmVzdWx0LmVtYmVkcy5sZW5ndGggPiAwKSkge1xyXG5cdFx0XHRcdFx0Y2hhbmdlZExpbmtzQ291bnQgKz0gcmVzdWx0LmxpbmtzLmxlbmd0aDtcclxuXHRcdFx0XHRcdGNoYW5nZWRMaW5rc0NvdW50ICs9IHJlc3VsdC5lbWJlZHMubGVuZ3RoO1xyXG5cdFx0XHRcdFx0cHJvY2Vzc2VkTm90ZXNDb3VudCsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChjaGFuZ2VkTGlua3NDb3VudCA9PSAwKVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiTm8gd2lraWxpbmtzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSByZXBsYWNlZFwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0bmV3IE5vdGljZShcIlJlcGxhY2VkIFwiICsgY2hhbmdlZExpbmtzQ291bnQgKyBcIiB3aWtpbGlua1wiICsgKGNoYW5nZWRMaW5rc0NvdW50ID4gMSA/IFwic1wiIDogXCJcIilcclxuXHRcdFx0XHQrIFwiIGZyb20gXCIgKyBwcm9jZXNzZWROb3Rlc0NvdW50ICsgXCIgbm90ZVwiICsgKHByb2Nlc3NlZE5vdGVzQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKSk7XHJcblx0fVxyXG5cclxuXHRkZWxldGVFbXB0eUZvbGRlcnMoKSB7XHJcblx0XHR0aGlzLmZoLmRlbGV0ZUVtcHR5Rm9sZGVycyhcIi9cIilcclxuXHR9XHJcblxyXG5cdGFzeW5jIGNoZWNrQ29uc2lzdGVudCgpIHtcclxuXHRcdGxldCBiYWRMaW5rcyA9IHRoaXMubGguZ2V0QWxsQmFkTGlua3MoKTtcclxuXHRcdGxldCBiYWRTZWN0aW9uTGlua3MgPSBhd2FpdCB0aGlzLmxoLmdldEFsbEJhZFNlY3Rpb25MaW5rcygpO1xyXG5cdFx0bGV0IGJhZEVtYmVkcyA9IHRoaXMubGguZ2V0QWxsQmFkRW1iZWRzKCk7XHJcblx0XHRsZXQgd2lraUxpbmtzID0gdGhpcy5saC5nZXRBbGxXaWtpTGlua3MoKTtcclxuXHRcdGxldCB3aWtpRW1iZWRzID0gdGhpcy5saC5nZXRBbGxXaWtpRW1iZWRzKCk7XHJcblxyXG5cdFx0bGV0IHRleHQgPSBcIlwiO1xyXG5cclxuXHRcdGxldCBiYWRMaW5rc0NvdW50ID0gT2JqZWN0LmtleXMoYmFkTGlua3MpLmxlbmd0aDtcclxuXHRcdGxldCBiYWRFbWJlZHNDb3VudCA9IE9iamVjdC5rZXlzKGJhZEVtYmVkcykubGVuZ3RoO1xyXG5cdFx0bGV0IGJhZFNlY3Rpb25MaW5rc0NvdW50ID0gT2JqZWN0LmtleXMoYmFkU2VjdGlvbkxpbmtzKS5sZW5ndGg7XHJcblx0XHRsZXQgd2lraUxpbmtzQ291bnQgPSBPYmplY3Qua2V5cyh3aWtpTGlua3MpLmxlbmd0aDtcclxuXHRcdGxldCB3aWtpRW1iZWRzQ291bnQgPSBPYmplY3Qua2V5cyh3aWtpRW1iZWRzKS5sZW5ndGg7XHJcblxyXG5cdFx0aWYgKGJhZExpbmtzQ291bnQgPiAwKSB7XHJcblx0XHRcdHRleHQgKz0gXCIjIEJhZCBsaW5rcyAoXCIgKyBiYWRMaW5rc0NvdW50ICsgXCIgZmlsZXMpXFxuXCI7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgaW4gYmFkTGlua3MpIHtcclxuXHRcdFx0XHR0ZXh0ICs9IFwiW1wiICsgbm90ZSArIFwiXShcIiArIFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5vdGUpICsgXCIpOiBcIiArIFwiXFxuXCJcclxuXHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGJhZExpbmtzW25vdGVdKSB7XHJcblx0XHRcdFx0XHR0ZXh0ICs9IFwiLSAobGluZSBcIiArIGxpbmsucG9zaXRpb24uc3RhcnQubGluZSArIFwiKTogYFwiICsgbGluay5saW5rICsgXCJgXFxuXCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRleHQgKz0gXCJcXG5cXG5cIlxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0ZXh0ICs9IFwiIyBCYWQgbGlua3MgXFxuXCI7XHJcblx0XHRcdHRleHQgKz0gXCJObyBwcm9ibGVtcyBmb3VuZFxcblxcblwiXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdGlmIChiYWRTZWN0aW9uTGlua3NDb3VudCA+IDApIHtcclxuXHRcdFx0dGV4dCArPSBcIlxcblxcbiMgQmFkIG5vdGUgbGluayBzZWN0aW9ucyAoXCIgKyBiYWRTZWN0aW9uTGlua3NDb3VudCArIFwiIGZpbGVzKVxcblwiO1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIGluIGJhZFNlY3Rpb25MaW5rcykge1xyXG5cdFx0XHRcdHRleHQgKz0gXCJbXCIgKyBub3RlICsgXCJdKFwiICsgVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobm90ZSkgKyBcIik6IFwiICsgXCJcXG5cIlxyXG5cdFx0XHRcdGZvciAobGV0IGxpbmsgb2YgYmFkU2VjdGlvbkxpbmtzW25vdGVdKSB7XHJcblx0XHRcdFx0XHRsZXQgbGkgPSB0aGlzLmxoLnNwbGl0TGlua1RvUGF0aEFuZFNlY3Rpb24obGluay5saW5rKTtcclxuXHRcdFx0XHRcdGxldCBzZWN0aW9uID0gVXRpbHMubm9ybWFsaXplTGlua1NlY3Rpb24obGkuc2VjdGlvbik7XHJcblx0XHRcdFx0XHR0ZXh0ICs9IFwiLSAobGluZSBcIiArIGxpbmsucG9zaXRpb24uc3RhcnQubGluZSArIFwiKTogYFwiICsgbGkubGluayArIFwiI1wiICsgc2VjdGlvbiArIFwiYFxcblwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0ZXh0ICs9IFwiXFxuXFxuXCJcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGV4dCArPSBcIlxcblxcbiMgQmFkIG5vdGUgbGluayBzZWN0aW9uc1xcblwiXHJcblx0XHRcdHRleHQgKz0gXCJObyBwcm9ibGVtcyBmb3VuZFxcblxcblwiXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdGlmIChiYWRFbWJlZHNDb3VudCA+IDApIHtcclxuXHRcdFx0dGV4dCArPSBcIlxcblxcbiMgQmFkIGVtYmVkcyAoXCIgKyBiYWRFbWJlZHNDb3VudCArIFwiIGZpbGVzKVxcblwiO1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIGluIGJhZEVtYmVkcykge1xyXG5cdFx0XHRcdHRleHQgKz0gXCJbXCIgKyBub3RlICsgXCJdKFwiICsgVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobm90ZSkgKyBcIik6IFwiICsgXCJcXG5cIlxyXG5cdFx0XHRcdGZvciAobGV0IGxpbmsgb2YgYmFkRW1iZWRzW25vdGVdKSB7XHJcblx0XHRcdFx0XHR0ZXh0ICs9IFwiLSAobGluZSBcIiArIGxpbmsucG9zaXRpb24uc3RhcnQubGluZSArIFwiKTogYFwiICsgbGluay5saW5rICsgXCJgXFxuXCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRleHQgKz0gXCJcXG5cXG5cIlxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0ZXh0ICs9IFwiXFxuXFxuIyBCYWQgZW1iZWRzIFxcblwiO1xyXG5cdFx0XHR0ZXh0ICs9IFwiTm8gcHJvYmxlbXMgZm91bmRcXG5cXG5cIlxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRpZiAod2lraUxpbmtzQ291bnQgPiAwKSB7XHJcblx0XHRcdHRleHQgKz0gXCIjIFdpa2kgbGlua3MgKFwiICsgd2lraUxpbmtzQ291bnQgKyBcIiBmaWxlcylcXG5cIjtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBpbiB3aWtpTGlua3MpIHtcclxuXHRcdFx0XHR0ZXh0ICs9IFwiW1wiICsgbm90ZSArIFwiXShcIiArIFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5vdGUpICsgXCIpOiBcIiArIFwiXFxuXCJcclxuXHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIHdpa2lMaW5rc1tub3RlXSkge1xyXG5cdFx0XHRcdFx0dGV4dCArPSBcIi0gKGxpbmUgXCIgKyBsaW5rLnBvc2l0aW9uLnN0YXJ0LmxpbmUgKyBcIik6IGBcIiArIGxpbmsub3JpZ2luYWwgKyBcImBcXG5cIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGV4dCArPSBcIlxcblxcblwiXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRleHQgKz0gXCIjIFdpa2kgbGlua3MgXFxuXCI7XHJcblx0XHRcdHRleHQgKz0gXCJObyBwcm9ibGVtcyBmb3VuZFxcblxcblwiXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHdpa2lFbWJlZHNDb3VudCA+IDApIHtcclxuXHRcdFx0dGV4dCArPSBcIlxcblxcbiMgV2lraSBlbWJlZHMgKFwiICsgd2lraUVtYmVkc0NvdW50ICsgXCIgZmlsZXMpXFxuXCI7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgaW4gd2lraUVtYmVkcykge1xyXG5cdFx0XHRcdHRleHQgKz0gXCJbXCIgKyBub3RlICsgXCJdKFwiICsgVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobm90ZSkgKyBcIik6IFwiICsgXCJcXG5cIlxyXG5cdFx0XHRcdGZvciAobGV0IGxpbmsgb2Ygd2lraUVtYmVkc1tub3RlXSkge1xyXG5cdFx0XHRcdFx0dGV4dCArPSBcIi0gKGxpbmUgXCIgKyBsaW5rLnBvc2l0aW9uLnN0YXJ0LmxpbmUgKyBcIik6IGBcIiArIGxpbmsub3JpZ2luYWwgKyBcImBcXG5cIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGV4dCArPSBcIlxcblxcblwiXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRleHQgKz0gXCJcXG5cXG4jIFdpa2kgZW1iZWRzIFxcblwiO1xyXG5cdFx0XHR0ZXh0ICs9IFwiTm8gcHJvYmxlbXMgZm91bmRcXG5cXG5cIlxyXG5cdFx0fVxyXG5cclxuXHJcblxyXG5cdFx0bGV0IG5vdGVQYXRoID0gdGhpcy5zZXR0aW5ncy5jb25zaXN0ZW50UmVwb3J0RmlsZTtcclxuXHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIud3JpdGUobm90ZVBhdGgsIHRleHQpO1xyXG5cclxuXHRcdGxldCBmaWxlT3BlbmVkID0gZmFsc2U7XHJcblx0XHR0aGlzLmFwcC53b3Jrc3BhY2UuaXRlcmF0ZUFsbExlYXZlcyhsZWFmID0+IHtcclxuXHRcdFx0aWYgKGxlYWYuZ2V0RGlzcGxheVRleHQoKSAhPSBcIlwiICYmIG5vdGVQYXRoLnN0YXJ0c1dpdGgobGVhZi5nZXREaXNwbGF5VGV4dCgpKSkge1xyXG5cdFx0XHRcdGZpbGVPcGVuZWQgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRpZiAoIWZpbGVPcGVuZWQpXHJcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vcGVuTGlua1RleHQobm90ZVBhdGgsIFwiL1wiLCBmYWxzZSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyByZW9yZ2FuaXplVmF1bHQoKSB7XHJcblx0XHRhd2FpdCB0aGlzLnJlcGxhY2VBbGxXaWtpbGlua3NXaXRoTWFya2Rvd25MaW5rcygpXHJcblx0XHRhd2FpdCB0aGlzLmNvbnZlcnRBbGxFbWJlZHNQYXRoc1RvUmVsYXRpdmUoKVxyXG5cdFx0YXdhaXQgdGhpcy5jb252ZXJ0QWxsTGlua1BhdGhzVG9SZWxhdGl2ZSgpXHJcblx0XHQvLy0gUmVuYW1lIGFsbCBhdHRhY2htZW50cyAodXNpbmcgVW5pcXVlIGF0dGFjaG1lbnRzLCBvcHRpb25hbClcclxuXHRcdGF3YWl0IHRoaXMuY29sbGVjdEFsbEF0dGFjaG1lbnRzKClcclxuXHRcdGF3YWl0IHRoaXMuZGVsZXRlRW1wdHlGb2xkZXJzKClcclxuXHRcdG5ldyBOb3RpY2UoXCJSZW9yZ2FuaXphdGlvbiBvZiB0aGUgdmF1bHQgY29tcGxldGVkXCIpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuXHJcblx0XHR0aGlzLmxoID0gbmV3IExpbmtzSGFuZGxlcihcclxuXHRcdFx0dGhpcy5hcHAsXHJcblx0XHRcdFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6IFwiLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXNcclxuXHRcdCk7XHJcblxyXG5cdFx0dGhpcy5maCA9IG5ldyBGaWxlc0hhbmRsZXIoXHJcblx0XHRcdHRoaXMuYXBwLFxyXG5cdFx0XHR0aGlzLmxoLFxyXG5cdFx0XHRcIkNvbnNpc3RlbnQgYXR0YWNobWVudHMgYW5kIGxpbmtzOiBcIixcclxuXHRcdFx0dGhpcy5zZXR0aW5ncy5pZ25vcmVGb2xkZXJzLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZpbGVzXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5cclxuXHJcblxyXG4iXSwibmFtZXMiOlsiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciLCJub3JtYWxpemVQYXRoIiwiUGx1Z2luIiwiTm90aWNlIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXVEQTtBQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDdEcsUUFBUSxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDdEgsUUFBUSxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FB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
