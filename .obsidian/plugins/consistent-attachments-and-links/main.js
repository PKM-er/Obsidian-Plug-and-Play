'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
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
            .setDesc("Collect attachments in this subfolder of the note folder (when using the \"Collect all attachments\" hotkey). Leave empty to collect attachments to the note folder without subfolders.")
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
    updateLinksToRenamedFile(oldNotePath, newNotePath, changelinksAlt = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isPathIgnored(oldNotePath) || this.isPathIgnored(newNotePath))
                return;
            let notes = yield this.getNotesThatHaveLinkToFile(oldNotePath);
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
        if (section != "" && linkBeforeHash.endsWith(".md")) { // for links with sections like [](note.md#section)
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
    moveCachedNoteAttachments(oldNotePath, newNotePath, deleteExistFiles) {
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
                if (newLinkPath == file.path)
                    continue; //nothing to change
                let res = yield this.moveAttachment(file, newLinkPath, [oldNotePath, newNotePath], deleteExistFiles);
                result.movedAttachments = result.movedAttachments.concat(res.movedAttachments);
                result.renamedFiles = result.renamedFiles.concat(res.renamedFiles);
            }
            return result;
        });
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
                    let newPath = (subfolderName == "") ? path.dirname(notePath) : path.join(path.dirname(notePath), subfolderName);
                    newPath = Utils.normalizePathForFile(path.join(newPath, path.basename(file.path)));
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
                    let newPath = (subfolderName == "") ? path.dirname(notePath) : path.join(path.dirname(notePath), subfolderName);
                    newPath = Utils.normalizePathForFile(path.join(newPath, path.basename(file.path)));
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
                        if (path.dirname(file.oldPath) != path.dirname(file.newPath)) {
                            if (this.settings.moveAttachmentsWithNote) {
                                result = yield this.fh.moveCachedNoteAttachments(file.oldPath, file.newPath, this.settings.deleteExistFilesWhenMoveNote);
                                if (this.settings.updateLinks) {
                                    if (result && result.renamedFiles && result.renamedFiles.length > 0) {
                                        yield this.lh.updateChangedPathsInNote(file.newPath, result.renamedFiles);
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
                        yield this.lh.updateLinksToRenamedFile(file.oldPath, file.newPath, updateAlts);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy91dGlscy50cyIsInNyYy9wYXRoLnRzIiwic3JjL2xpbmtzLWhhbmRsZXIudHMiLCJzcmMvZmlsZXMtaGFuZGxlci50cyIsInNyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBmcm9tLmxlbmd0aCwgaiA9IHRvLmxlbmd0aDsgaSA8IGlsOyBpKyssIGorKylcclxuICAgICAgICB0b1tqXSA9IGZyb21baV07XHJcbiAgICByZXR1cm4gdG87XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHByaXZhdGVNYXApIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJpdmF0ZU1hcC5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgcHJpdmF0ZU1hcCwgdmFsdWUpIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBzZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlTWFwLnNldChyZWNlaXZlciwgdmFsdWUpO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbiIsImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgfSBmcm9tICdvYnNpZGlhbic7XHJcbmltcG9ydCBDb25zaXN0ZW50QXR0YWNobWVudHNBbmRMaW5rcyBmcm9tICcuL21haW4nO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQbHVnaW5TZXR0aW5ncyB7XHJcbiAgICBtb3ZlQXR0YWNobWVudHNXaXRoTm90ZTogYm9vbGVhbjtcclxuICAgIGRlbGV0ZUF0dGFjaG1lbnRzV2l0aE5vdGU6IGJvb2xlYW47XHJcbiAgICB1cGRhdGVMaW5rczogYm9vbGVhbjtcclxuICAgIGRlbGV0ZUVtcHR5Rm9sZGVyczogYm9vbGVhbjtcclxuICAgIGRlbGV0ZUV4aXN0RmlsZXNXaGVuTW92ZU5vdGU6IGJvb2xlYW47XHJcbiAgICBjaGFuZ2VOb3RlQmFja2xpbmtzQWx0OiBib29sZWFuO1xyXG4gICAgaWdub3JlRm9sZGVyczogc3RyaW5nW107XHJcbiAgICBpZ25vcmVGaWxlczogc3RyaW5nW107XHJcbiAgICBhdHRhY2htZW50c1N1YmZvbGRlcjogc3RyaW5nO1xyXG4gICAgY29uc2lzdGVudFJlcG9ydEZpbGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFBsdWdpblNldHRpbmdzID0ge1xyXG4gICAgbW92ZUF0dGFjaG1lbnRzV2l0aE5vdGU6IHRydWUsXHJcbiAgICBkZWxldGVBdHRhY2htZW50c1dpdGhOb3RlOiB0cnVlLFxyXG4gICAgdXBkYXRlTGlua3M6IHRydWUsXHJcbiAgICBkZWxldGVFbXB0eUZvbGRlcnM6IHRydWUsXHJcbiAgICBkZWxldGVFeGlzdEZpbGVzV2hlbk1vdmVOb3RlOiB0cnVlLFxyXG4gICAgY2hhbmdlTm90ZUJhY2tsaW5rc0FsdDogZmFsc2UsXHJcbiAgICBpZ25vcmVGb2xkZXJzOiBbXCIuZ2l0L1wiLCBcIi5vYnNpZGlhbi9cIl0sXHJcbiAgICBpZ25vcmVGaWxlczogW1wiY29uc2lzdGFudC1yZXBvcnQubWRcIl0sXHJcbiAgICBhdHRhY2htZW50c1N1YmZvbGRlcjogXCJcIixcclxuICAgIGNvbnNpc3RlbnRSZXBvcnRGaWxlOiBcImNvbnNpc3RhbnQtcmVwb3J0Lm1kXCIsXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgICBwbHVnaW46IENvbnNpc3RlbnRBdHRhY2htZW50c0FuZExpbmtzO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IENvbnNpc3RlbnRBdHRhY2htZW50c0FuZExpbmtzKSB7XHJcbiAgICAgICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xyXG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0NvbnNpc3RlbnQgYXR0YWNobWVudHMgYW5kIGxpbmtzIC0gU2V0dGluZ3MnIH0pO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdNb3ZlIGF0dGFjaG1lbnRzIHdpdGggbm90ZScpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKCdXaGVuIGEgbm90ZSBtb3ZlcywgbW92ZSB3aXRoIGl0IGFueSBhdHRhY2htZW50cyB0aGF0IGFyZSBpbiB0aGUgc2FtZSBmb2xkZXIgYW5kIHN1YmZvbGRlcnMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5tb3ZlQXR0YWNobWVudHNXaXRoTm90ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5tb3ZlQXR0YWNobWVudHNXaXRoTm90ZSkpO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdEZWxldGUgdW51c2VkIGF0dGFjaG1lbnRzIHdpdGggbm90ZScpXHJcbiAgICAgICAgICAgIC5zZXREZXNjKCdXaGVuIHRoZSBub3RlIGlzIGRlbGV0ZWQsIGRlbGV0ZSBhbGwgYXR0YWNobWVudHMgdGhhdCBhcmUgbm8gbG9uZ2VyIHVzZWQgaW4gb3RoZXIgbm90ZXMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWxldGVBdHRhY2htZW50c1dpdGhOb3RlID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlbGV0ZUF0dGFjaG1lbnRzV2l0aE5vdGUpKTtcclxuXHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZSgnVXBkYXRlIGxpbmtzJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1VwZGF0ZSBsaW5rcyB0byBhdHRhY2htZW50cyBhbmQgb3RoZXIgbm90ZXMgd2hlbiBtb3Zpbmcgbm90ZXMgb3IgYXR0YWNobWVudHMuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy51cGRhdGVMaW5rcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy51cGRhdGVMaW5rcykpO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0RlbGV0ZSBlbXB0eSBmb2xkZXJzJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0RlbGV0ZSBlbXB0eSBmb2xkZXJzIGFmdGVyIG1vdmluZyBub3RlcyB3aXRoIGF0dGFjaG1lbnRzLicpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsZXRlRW1wdHlGb2xkZXJzID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlbGV0ZUVtcHR5Rm9sZGVycykpO1xyXG5cclxuXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdEZWxldGUgZHVwbGljYXRlIGF0dGFjaG1lbnRzIHdoaWxlIG5vdGUgbW92aW5nJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ0RlbGV0ZSBhdHRhY2htZW50IHdoZW4gbW92aW5nIGEgbm90ZSBpZiB0aGVyZSBpcyBhIGZpbGUgd2l0aCB0aGUgc2FtZSBuYW1lIGluIHRoZSBuZXcgZm9sZGVyLiBJZiBkaXNhYmxlZCwgZmlsZSB3aWxsIGJlIHJlbmFtZWQgYW5kIG1vdmVkLicpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWxldGVFeGlzdEZpbGVzV2hlbk1vdmVOb3RlKSk7XHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0NoYW5nZSBiYWNrbGluayB0ZXh0IHdoZW4gcmVuYW1pbmcgYSBub3RlJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1doZW4gdGhlIG5vdGUgaXMgcmVuYW1lZCwgdGhlIGxpbmtzIHRvIGl0IGFyZSB1cGRhdGVkLiBJZiB0aGlzIG9wdGlvbiBpcyBlbmFibGVkLCB0aGUgdGV4dCBvZiBsaW5rcyB0byB0aGlzIG5vdGUgd2lsbCBhbHNvIGJlIGNoYW5nZWQuJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5jaGFuZ2VOb3RlQmFja2xpbmtzQWx0ID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmNoYW5nZU5vdGVCYWNrbGlua3NBbHQpKTtcclxuXHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJJZ25vcmUgZm9sZGVyc1wiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIkxpc3Qgb2YgZm9sZGVycyB0byBpZ25vcmUuIEVhY2ggZm9sZGVyIG9uIGEgbmV3IGxpbmUuXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYShjYiA9PiBjYlxyXG4gICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRXhhbXBsZTogLmdpdCwgLm9ic2lkaWFuXCIpXHJcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlRm9sZGVycy5qb2luKFwiXFxuXCIpKVxyXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXRocyA9IHZhbHVlLnRyaW0oKS5zcGxpdChcIlxcblwiKS5tYXAodmFsdWUgPT4gdGhpcy5nZXROb3JtYWxpemVkUGF0aCh2YWx1ZSkgKyBcIi9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlRm9sZGVycyA9IHBhdGhzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJJZ25vcmUgZmlsZXNcIilcclxuICAgICAgICAgICAgLnNldERlc2MoXCJMaXN0IG9mIGZpbGVzIHRvIGlnbm9yZS4gRWFjaCBmaWxlIG9uIGEgbmV3IGxpbmUuXCIpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYShjYiA9PiBjYlxyXG4gICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKFwiRXhhbXBsZTogY29uc2lzdGFudC1yZXBvcnQubWRcIilcclxuICAgICAgICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5pZ25vcmVGaWxlcy5qb2luKFwiXFxuXCIpKVxyXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXRocyA9IHZhbHVlLnRyaW0oKS5zcGxpdChcIlxcblwiKS5tYXAodmFsdWUgPT4gdGhpcy5nZXROb3JtYWxpemVkUGF0aCh2YWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZUZpbGVzID0gcGF0aHM7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgICAgICAuc2V0TmFtZShcIkF0dGFjaG1lbnRzIHN1YmZvbGRlclwiKVxyXG4gICAgICAgICAgICAuc2V0RGVzYyhcIkNvbGxlY3QgYXR0YWNobWVudHMgaW4gdGhpcyBzdWJmb2xkZXIgb2YgdGhlIG5vdGUgZm9sZGVyICh3aGVuIHVzaW5nIHRoZSBcXFwiQ29sbGVjdCBhbGwgYXR0YWNobWVudHNcXFwiIGhvdGtleSkuIExlYXZlIGVtcHR5IHRvIGNvbGxlY3QgYXR0YWNobWVudHMgdG8gdGhlIG5vdGUgZm9sZGVyIHdpdGhvdXQgc3ViZm9sZGVycy5cIilcclxuICAgICAgICAgICAgLmFkZFRleHQoY2IgPT4gY2JcclxuICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4YW1wbGU6IF9hdHRhY2htZW50c1wiKVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF0dGFjaG1lbnRzU3ViZm9sZGVyKVxyXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmF0dGFjaG1lbnRzU3ViZm9sZGVyID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoXCJDb25zaXN0YW50IHJlcG9ydCBmaWxlIG5hbWVcIilcclxuICAgICAgICAgICAgLnNldERlc2MoXCJcIilcclxuICAgICAgICAgICAgLmFkZFRleHQoY2IgPT4gY2JcclxuICAgICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4YW1wbGU6IGNvbnNpc3RhbnQtcmVwb3J0Lm1kXCIpXHJcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uc2lzdGVudFJlcG9ydEZpbGUpXHJcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uc2lzdGVudFJlcG9ydEZpbGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXROb3JtYWxpemVkUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBwYXRoLmxlbmd0aCA9PSAwID8gcGF0aCA6IG5vcm1hbGl6ZVBhdGgocGF0aCk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY2xhc3MgVXRpbHMge1xyXG5cclxuXHRzdGF0aWMgYXN5bmMgZGVsYXkobXM6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG5cdH1cclxuXHJcblxyXG5cdHN0YXRpYyBub3JtYWxpemVQYXRoRm9yRmlsZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cGF0aCA9IHBhdGgucmVwbGFjZSgvXFxcXC9naSwgXCIvXCIpOyAvL3JlcGxhY2UgXFwgdG8gL1xyXG5cdFx0cGF0aCA9IHBhdGgucmVwbGFjZSgvJTIwL2dpLCBcIiBcIik7IC8vcmVwbGFjZSAlMjAgdG8gc3BhY2VcclxuXHRcdHJldHVybiBwYXRoO1xyXG5cdH1cclxuXHJcblxyXG5cdHN0YXRpYyBub3JtYWxpemVQYXRoRm9yTGluayhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cGF0aCA9IHBhdGgucmVwbGFjZSgvXFxcXC9naSwgXCIvXCIpOyAvL3JlcGxhY2UgXFwgdG8gL1xyXG5cdFx0cGF0aCA9IHBhdGgucmVwbGFjZSgvIC9naSwgXCIlMjBcIik7IC8vcmVwbGFjZSBzcGFjZSB0byAlMjBcclxuXHRcdHJldHVybiBwYXRoO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIG5vcm1hbGl6ZUxpbmtTZWN0aW9uKHNlY3Rpb246IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRzZWN0aW9uID0gZGVjb2RlVVJJKHNlY3Rpb24pO1xyXG5cdFx0cmV0dXJuIHNlY3Rpb247XHJcblx0fVxyXG59IiwiZXhwb3J0IGNsYXNzIHBhdGgge1xyXG4gICAgc3RhdGljIGpvaW4oLi4ucGFydHM6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybiAnLic7XHJcbiAgICAgICAgdmFyIGpvaW5lZDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoYXJnLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgICAgICBqb2luZWQgPSBhcmc7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgam9pbmVkICs9ICcvJyArIGFyZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHJldHVybiAnLic7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zaXhOb3JtYWxpemUoam9pbmVkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZGlybmFtZShwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiAnLic7XHJcbiAgICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgdmFyIGhhc1Jvb3QgPSBjb2RlID09PSA0NyAvKi8qLztcclxuICAgICAgICB2YXIgZW5kID0gLTE7XHJcbiAgICAgICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAxOyAtLWkpIHtcclxuICAgICAgICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvclxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbmQgPT09IC0xKSByZXR1cm4gaGFzUm9vdCA/ICcvJyA6ICcuJztcclxuICAgICAgICBpZiAoaGFzUm9vdCAmJiBlbmQgPT09IDEpIHJldHVybiAnLy8nO1xyXG4gICAgICAgIHJldHVybiBwYXRoLnNsaWNlKDAsIGVuZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGJhc2VuYW1lKHBhdGg6IHN0cmluZywgZXh0Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKGV4dCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBleHQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImV4dFwiIGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTtcclxuXHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gMDtcclxuICAgICAgICB2YXIgZW5kID0gLTE7XHJcbiAgICAgICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiBleHQubGVuZ3RoID4gMCAmJiBleHQubGVuZ3RoIDw9IHBhdGgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmIChleHQubGVuZ3RoID09PSBwYXRoLmxlbmd0aCAmJiBleHQgPT09IHBhdGgpIHJldHVybiAnJztcclxuICAgICAgICAgICAgdmFyIGV4dElkeCA9IGV4dC5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICB2YXIgZmlyc3ROb25TbGFzaEVuZCA9IC0xO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3ROb25TbGFzaEVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIHJlbWVtYmVyIHRoaXMgaW5kZXggaW4gY2FzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBuZWVkIGl0IGlmIHRoZSBleHRlbnNpb24gZW5kcyB1cCBub3QgbWF0Y2hpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0Tm9uU2xhc2hFbmQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4dElkeCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyeSB0byBtYXRjaCB0aGUgZXhwbGljaXQgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSBleHQuY2hhckNvZGVBdChleHRJZHgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoLS1leHRJZHggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCB0aGUgZXh0ZW5zaW9uLCBzbyBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXIgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFeHRlbnNpb24gZG9lcyBub3QgbWF0Y2gsIHNvIG91ciByZXN1bHQgaXMgdGhlIGVudGlyZSBwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dElkeCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXJ0ID09PSBlbmQpIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7IGVsc2UgaWYgKGVuZCA9PT0gLTEpIGVuZCA9IHBhdGgubGVuZ3RoO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbmQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhdGggY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChlbmQgPT09IC0xKSByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZXh0bmFtZShwYXRoOiBzdHJpbmcpIHtcclxuICAgICAgICB2YXIgc3RhcnREb3QgPSAtMTtcclxuICAgICAgICB2YXIgc3RhcnRQYXJ0ID0gMDtcclxuICAgICAgICB2YXIgZW5kID0gLTE7XHJcbiAgICAgICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XHJcbiAgICAgICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxyXG4gICAgICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXHJcbiAgICAgICAgdmFyIHByZURvdFN0YXRlID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xyXG4gICAgICAgICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxyXG4gICAgICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcclxuICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlbmQgPSBpICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICBzdGFydERvdCA9IGk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSlcclxuICAgICAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxyXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIHByZURvdFN0YXRlID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHwgZW5kID09PSAtMSB8fFxyXG4gICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxyXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxyXG4gICAgICAgICAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXHJcbiAgICAgICAgICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICBzdGF0aWMgcGFyc2UocGF0aDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIHZhciByZXQgPSB7IHJvb3Q6ICcnLCBkaXI6ICcnLCBiYXNlOiAnJywgZXh0OiAnJywgbmFtZTogJycgfTtcclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiByZXQ7XHJcbiAgICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgdmFyIGlzQWJzb2x1dGUgPSBjb2RlID09PSA0NyAvKi8qLztcclxuICAgICAgICB2YXIgc3RhcnQ7XHJcbiAgICAgICAgaWYgKGlzQWJzb2x1dGUpIHtcclxuICAgICAgICAgICAgcmV0LnJvb3QgPSAnLyc7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydERvdCA9IC0xO1xyXG4gICAgICAgIHZhciBzdGFydFBhcnQgPSAwO1xyXG4gICAgICAgIHZhciBlbmQgPSAtMTtcclxuICAgICAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICB2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTtcclxuXHJcbiAgICAgICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxyXG4gICAgICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXHJcbiAgICAgICAgdmFyIHByZURvdFN0YXRlID0gMDtcclxuXHJcbiAgICAgICAgLy8gR2V0IG5vbi1kaXIgaW5mb1xyXG4gICAgICAgIGZvciAoOyBpID49IHN0YXJ0OyAtLWkpIHtcclxuICAgICAgICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxyXG4gICAgICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcclxuICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlbmQgPSBpICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSkgc3RhcnREb3QgPSBpOyBlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSkgcHJlRG90U3RhdGUgPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcclxuICAgICAgICAgICAgICAgIC8vIGhhdmUgYSBnb29kIGNoYW5jZSBhdCBoYXZpbmcgYSBub24tZW1wdHkgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcclxuICAgICAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcclxuICAgICAgICAgICAgcHJlRG90U3RhdGUgPT09IDAgfHxcclxuICAgICAgICAgICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xyXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkge1xyXG4gICAgICAgICAgICBpZiAoZW5kICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBlbmQpOyBlbHNlIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKDEsIHN0YXJ0RG90KTtcclxuICAgICAgICAgICAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZSgxLCBlbmQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgc3RhcnREb3QpO1xyXG4gICAgICAgICAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXQuZXh0ID0gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdGFydFBhcnQgPiAwKSByZXQuZGlyID0gcGF0aC5zbGljZSgwLCBzdGFydFBhcnQgLSAxKTsgZWxzZSBpZiAoaXNBYnNvbHV0ZSkgcmV0LmRpciA9ICcvJztcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcblxyXG5cclxuXHJcbiAgICBzdGF0aWMgcG9zaXhOb3JtYWxpemUocGF0aDogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcclxuXHJcbiAgICAgICAgdmFyIGlzQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xyXG4gICAgICAgIHZhciB0cmFpbGluZ1NlcGFyYXRvciA9IHBhdGguY2hhckNvZGVBdChwYXRoLmxlbmd0aCAtIDEpID09PSA0NyAvKi8qLztcclxuXHJcbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXHJcbiAgICAgICAgcGF0aCA9IHRoaXMubm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCwgIWlzQWJzb2x1dGUpO1xyXG5cclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDAgJiYgIWlzQWJzb2x1dGUpIHBhdGggPSAnLic7XHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID4gMCAmJiB0cmFpbGluZ1NlcGFyYXRvcikgcGF0aCArPSAnLyc7XHJcblxyXG4gICAgICAgIGlmIChpc0Fic29sdXRlKSByZXR1cm4gJy8nICsgcGF0aDtcclxuICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aDogc3RyaW5nLCBhbGxvd0Fib3ZlUm9vdDogYm9vbGVhbikge1xyXG4gICAgICAgIHZhciByZXMgPSAnJztcclxuICAgICAgICB2YXIgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xyXG4gICAgICAgIHZhciBsYXN0U2xhc2ggPSAtMTtcclxuICAgICAgICB2YXIgZG90cyA9IDA7XHJcbiAgICAgICAgdmFyIGNvZGU7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gcGF0aC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoaSA8IHBhdGgubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgZWxzZSBpZiAoY29kZSA9PT0gNDcgLyovKi8pXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29kZSA9IDQ3IC8qLyovO1xyXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgIGlmIChsYXN0U2xhc2ggPT09IGkgLSAxIHx8IGRvdHMgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBOT09QXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxhc3RTbGFzaCAhPT0gaSAtIDEgJiYgZG90cyA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoIDwgMiB8fCBsYXN0U2VnbWVudExlbmd0aCAhPT0gMiB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IDQ2IC8qLiovIHx8IHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAyKSAhPT0gNDYgLyouKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFzdFNsYXNoSW5kZXggPSByZXMubGFzdEluZGV4T2YoJy8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCAhPT0gcmVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGxhc3RTbGFzaEluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSByZXMubGVuZ3RoIC0gMSAtIHJlcy5sYXN0SW5kZXhPZignLycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvdHMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggPT09IDIgfHwgcmVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90cyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzICs9ICcvLi4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSAnLi4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyArPSAnLycgKyBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IGkgLSBsYXN0U2xhc2ggLSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcclxuICAgICAgICAgICAgICAgIGRvdHMgPSAwO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDQ2IC8qLiovICYmIGRvdHMgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICArK2RvdHM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkb3RzID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcG9zaXhSZXNvbHZlKC4uLmFyZ3M6IHN0cmluZ1tdKSB7XHJcbiAgICAgICAgdmFyIHJlc29sdmVkUGF0aCA9ICcnO1xyXG4gICAgICAgIHZhciByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGN3ZDtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IGFyZ3MubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXRoO1xyXG4gICAgICAgICAgICBpZiAoaSA+PSAwKVxyXG4gICAgICAgICAgICAgICAgcGF0aCA9IGFyZ3NbaV07XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGN3ZCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCk7XHJcbiAgICAgICAgICAgICAgICBwYXRoID0gY3dkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgLy8gU2tpcCBlbXB0eSBlbnRyaWVzXHJcbiAgICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XHJcbiAgICAgICAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxyXG4gICAgICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxyXG5cclxuICAgICAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcclxuICAgICAgICByZXNvbHZlZFBhdGggPSB0aGlzLm5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUpO1xyXG5cclxuICAgICAgICBpZiAocmVzb2x2ZWRBYnNvbHV0ZSkge1xyXG4gICAgICAgICAgICBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJy8nICsgcmVzb2x2ZWRQYXRoO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJy8nO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gJy4nO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcmVsYXRpdmUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgIGlmIChmcm9tID09PSB0bykgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBmcm9tID0gdGhpcy5wb3NpeFJlc29sdmUoZnJvbSk7XHJcbiAgICAgICAgdG8gPSB0aGlzLnBvc2l4UmVzb2x2ZSh0byk7XHJcblxyXG4gICAgICAgIGlmIChmcm9tID09PSB0bykgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXHJcbiAgICAgICAgdmFyIGZyb21TdGFydCA9IDE7XHJcbiAgICAgICAgZm9yICg7IGZyb21TdGFydCA8IGZyb20ubGVuZ3RoOyArK2Zyb21TdGFydCkge1xyXG4gICAgICAgICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCkgIT09IDQ3IC8qLyovKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBmcm9tRW5kID0gZnJvbS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xyXG5cclxuICAgICAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXHJcbiAgICAgICAgdmFyIHRvU3RhcnQgPSAxO1xyXG4gICAgICAgIGZvciAoOyB0b1N0YXJ0IDwgdG8ubGVuZ3RoOyArK3RvU3RhcnQpIHtcclxuICAgICAgICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgIT09IDQ3IC8qLyovKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB0b0VuZCA9IHRvLmxlbmd0aDtcclxuICAgICAgICB2YXIgdG9MZW4gPSB0b0VuZCAtIHRvU3RhcnQ7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgcGF0aHMgdG8gZmluZCB0aGUgbG9uZ2VzdCBjb21tb24gcGF0aCBmcm9tIHJvb3RcclxuICAgICAgICB2YXIgbGVuZ3RoID0gZnJvbUxlbiA8IHRvTGVuID8gZnJvbUxlbiA6IHRvTGVuO1xyXG4gICAgICAgIHZhciBsYXN0Q29tbW9uU2VwID0gLTE7XHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgIGZvciAoOyBpIDw9IGxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChpID09PSBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0b0xlbiA+IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvZm9vL2Jhci9iYXonXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIHJvb3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy8nOyB0bz0nL2ZvbydcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZyb21MZW4gPiBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGBmcm9tYC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyL2Jheic7IHRvPScvZm9vL2JhcidcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIHJvb3QuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vJzsgdG89Jy8nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBmcm9tQ29kZSA9IGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKTtcclxuICAgICAgICAgICAgdmFyIHRvQ29kZSA9IHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpO1xyXG4gICAgICAgICAgICBpZiAoZnJvbUNvZGUgIT09IHRvQ29kZSlcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChmcm9tQ29kZSA9PT0gNDcgLyovKi8pXHJcbiAgICAgICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBvdXQgPSAnJztcclxuICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgcmVsYXRpdmUgcGF0aCBiYXNlZCBvbiB0aGUgcGF0aCBkaWZmZXJlbmNlIGJldHdlZW4gYHRvYFxyXG4gICAgICAgIC8vIGFuZCBgZnJvbWBcclxuICAgICAgICBmb3IgKGkgPSBmcm9tU3RhcnQgKyBsYXN0Q29tbW9uU2VwICsgMTsgaSA8PSBmcm9tRW5kOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKGkgPT09IGZyb21FbmQgfHwgZnJvbS5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG91dC5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9ICcuLic7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0ICs9ICcvLi4nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxyXG4gICAgICAgIC8vIHRoZSBjb21tb24gcGF0aCBwYXJ0c1xyXG4gICAgICAgIGlmIChvdXQubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgcmV0dXJuIG91dCArIHRvLnNsaWNlKHRvU3RhcnQgKyBsYXN0Q29tbW9uU2VwKTtcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdG9TdGFydCArPSBsYXN0Q29tbW9uU2VwO1xyXG4gICAgICAgICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSA9PT0gNDcgLyovKi8pXHJcbiAgICAgICAgICAgICAgICArK3RvU3RhcnQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBBcHAsIFRBYnN0cmFjdEZpbGUsIFRGaWxlLCBFbWJlZENhY2hlLCBMaW5rQ2FjaGUsIFBvcyB9IGZyb20gJ29ic2lkaWFuJztcclxuaW1wb3J0IHsgVXRpbHMgfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgcGF0aCB9IGZyb20gJy4vcGF0aCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBhdGhDaGFuZ2VJbmZvIHtcclxuXHRvbGRQYXRoOiBzdHJpbmcsXHJcblx0bmV3UGF0aDogc3RyaW5nLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVtYmVkQ2hhbmdlSW5mbyB7XHJcblx0b2xkOiBFbWJlZENhY2hlLFxyXG5cdG5ld0xpbms6IHN0cmluZyxcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaW5rQ2hhbmdlSW5mbyB7XHJcblx0b2xkOiBMaW5rQ2FjaGUsXHJcblx0bmV3TGluazogc3RyaW5nLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIExpbmtzQW5kRW1iZWRzQ2hhbmdlZEluZm8ge1xyXG5cdGVtYmVkczogRW1iZWRDaGFuZ2VJbmZvW11cclxuXHRsaW5rczogTGlua0NoYW5nZUluZm9bXVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaW5rU2VjdGlvbkluZm8ge1xyXG5cdGhhc1NlY3Rpb246IGJvb2xlYW5cclxuXHRsaW5rOiBzdHJpbmdcclxuXHRzZWN0aW9uOiBzdHJpbmdcclxufVxyXG5cclxuXHJcbi8vc2ltcGxlIHJlZ2V4XHJcbi8vIGNvbnN0IG1hcmtkb3duTGlua09yRW1iZWRSZWdleFNpbXBsZSA9IC9cXFsoLio/KVxcXVxcKCguKj8pXFwpL2dpbVxyXG4vLyBjb25zdCBtYXJrZG93bkxpbmtSZWdleFNpbXBsZSA9IC8oPzwhXFwhKVxcWyguKj8pXFxdXFwoKC4qPylcXCkvZ2ltO1xyXG4vLyBjb25zdCBtYXJrZG93bkVtYmVkUmVnZXhTaW1wbGUgPSAvXFwhXFxbKC4qPylcXF1cXCgoLio/KVxcKS9naW1cclxuXHJcbi8vIGNvbnN0IHdpa2lMaW5rT3JFbWJlZFJlZ2V4U2ltcGxlID0gL1xcW1xcWyguKj8pXFxdXFxdL2dpbVxyXG4vLyBjb25zdCB3aWtpTGlua1JlZ2V4U2ltcGxlID0gLyg/PCFcXCEpXFxbXFxbKC4qPylcXF1cXF0vZ2ltO1xyXG4vLyBjb25zdCB3aWtpRW1iZWRSZWdleFNpbXBsZSA9IC9cXCFcXFtcXFsoLio/KVxcXVxcXS9naW1cclxuXHJcbi8vd2l0aCBlc2NhcGluZyBcXCBjaGFyYWN0ZXJzXHJcbmNvbnN0IG1hcmtkb3duTGlua09yRW1iZWRSZWdleEcgPSAvKD88IVxcXFwpXFxbKC4qPykoPzwhXFxcXClcXF1cXCgoLio/KSg/PCFcXFxcKVxcKS9naW1cclxuY29uc3QgbWFya2Rvd25MaW5rUmVnZXhHID0gLyg/PCFcXCEpKD88IVxcXFwpXFxbKC4qPykoPzwhXFxcXClcXF1cXCgoLio/KSg/PCFcXFxcKSg/OiMoLio/KSk/XFwpL2dpbTtcclxuY29uc3QgbWFya2Rvd25FbWJlZFJlZ2V4RyA9IC8oPzwhXFxcXClcXCFcXFsoLio/KSg/PCFcXFxcKVxcXVxcKCguKj8pKD88IVxcXFwpXFwpL2dpbVxyXG5cclxuY29uc3Qgd2lraUxpbmtPckVtYmVkUmVnZXhHID0gLyg/PCFcXFxcKVxcW1xcWyguKj8pKD88IVxcXFwpXFxdXFxdL2dpbVxyXG5jb25zdCB3aWtpTGlua1JlZ2V4RyA9IC8oPzwhXFwhKSg/PCFcXFxcKVxcW1xcWyguKj8pKD88IVxcXFwpXFxdXFxdL2dpbTtcclxuY29uc3Qgd2lraUVtYmVkUmVnZXhHID0gLyg/PCFcXFxcKVxcIVxcW1xcWyguKj8pKD88IVxcXFwpXFxdXFxdL2dpbVxyXG5cclxuY29uc3QgbWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4ID0gLyg/PCFcXFxcKVxcWyguKj8pKD88IVxcXFwpXFxdXFwoKC4qPykoPzwhXFxcXClcXCkvaW1cclxuY29uc3QgbWFya2Rvd25MaW5rUmVnZXggPSAvKD88IVxcISkoPzwhXFxcXClcXFsoLio/KSg/PCFcXFxcKVxcXVxcKCguKj8pKD88IVxcXFwpXFwpL2ltO1xyXG5jb25zdCBtYXJrZG93bkVtYmVkUmVnZXggPSAvKD88IVxcXFwpXFwhXFxbKC4qPykoPzwhXFxcXClcXF1cXCgoLio/KSg/PCFcXFxcKVxcKS9pbVxyXG5cclxuY29uc3Qgd2lraUxpbmtPckVtYmVkUmVnZXggPSAvKD88IVxcXFwpXFxbXFxbKC4qPykoPzwhXFxcXClcXF1cXF0vaW1cclxuY29uc3Qgd2lraUxpbmtSZWdleCA9IC8oPzwhXFwhKSg/PCFcXFxcKVxcW1xcWyguKj8pKD88IVxcXFwpXFxdXFxdL2ltO1xyXG5jb25zdCB3aWtpRW1iZWRSZWdleCA9IC8oPzwhXFxcXClcXCFcXFtcXFsoLio/KSg/PCFcXFxcKVxcXVxcXS9pbVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBMaW5rc0hhbmRsZXIge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHByaXZhdGUgYXBwOiBBcHAsXHJcblx0XHRwcml2YXRlIGNvbnNvbGVMb2dQcmVmaXg6IHN0cmluZyA9IFwiXCIsXHJcblx0XHRwcml2YXRlIGlnbm9yZUZvbGRlcnM6IHN0cmluZ1tdID0gW10sXHJcblx0XHRwcml2YXRlIGlnbm9yZUZpbGVzOiBzdHJpbmdbXSA9IFtdLFxyXG5cdCkgeyB9XHJcblxyXG5cdGlzUGF0aElnbm9yZWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRpZiAocGF0aC5zdGFydHNXaXRoKFwiLi9cIikpXHJcblx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cmluZygyKTtcclxuXHJcblx0XHRmb3IgKGxldCBmb2xkZXIgb2YgdGhpcy5pZ25vcmVGb2xkZXJzKSB7XHJcblx0XHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoZm9sZGVyKSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChsZXQgZmlsZSBvZiB0aGlzLmlnbm9yZUZpbGVzKSB7XHJcblx0XHRcdGlmIChwYXRoID09IGZpbGUpIHtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2hlY2tJc0NvcnJlY3RNYXJrZG93bkVtYmVkKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaChtYXJrZG93bkVtYmVkUmVnZXhHKTtcclxuXHRcdHJldHVybiAoZWxlbWVudHMgIT0gbnVsbCAmJiBlbGVtZW50cy5sZW5ndGggPiAwKVxyXG5cdH1cclxuXHJcblx0Y2hlY2tJc0NvcnJlY3RNYXJrZG93bkxpbmsodGV4dDogc3RyaW5nKSB7XHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKG1hcmtkb3duTGlua1JlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cdGNoZWNrSXNDb3JyZWN0TWFya2Rvd25FbWJlZE9yTGluayh0ZXh0OiBzdHJpbmcpIHtcclxuXHRcdGxldCBlbGVtZW50cyA9IHRleHQubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cdGNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaCh3aWtpRW1iZWRSZWdleEcpO1xyXG5cdFx0cmV0dXJuIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApXHJcblx0fVxyXG5cclxuXHRjaGVja0lzQ29ycmVjdFdpa2lMaW5rKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaCh3aWtpTGlua1JlZ2V4Ryk7XHJcblx0XHRyZXR1cm4gKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMClcclxuXHR9XHJcblxyXG5cdGNoZWNrSXNDb3JyZWN0V2lraUVtYmVkT3JMaW5rKHRleHQ6IHN0cmluZykge1xyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaCh3aWtpTGlua09yRW1iZWRSZWdleEcpO1xyXG5cdFx0cmV0dXJuIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApXHJcblx0fVxyXG5cclxuXHJcblx0Z2V0RmlsZUJ5TGluayhsaW5rOiBzdHJpbmcsIG93bmluZ05vdGVQYXRoOiBzdHJpbmcpOiBURmlsZSB7XHJcblx0XHRsZXQgbGkgPSB0aGlzLnNwbGl0TGlua1RvUGF0aEFuZFNlY3Rpb24obGluayk7XHJcblx0XHRsZXQgZnVsbFBhdGggPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhsaS5saW5rLCBvd25pbmdOb3RlUGF0aCk7XHJcblx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChmdWxsUGF0aCk7XHJcblx0XHRyZXR1cm4gZmlsZTtcclxuXHR9XHJcblxyXG5cclxuXHRnZXRGaWxlQnlQYXRoKHBhdGg6IHN0cmluZyk6IFRGaWxlIHtcclxuXHRcdHBhdGggPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShwYXRoKTtcclxuXHRcdGxldCBmaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldEZpbGVzKCk7XHJcblx0XHRsZXQgZmlsZSA9IGZpbGVzLmZpbmQoZmlsZSA9PiBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShmaWxlLnBhdGgpID09PSBwYXRoKTtcclxuXHRcdHJldHVybiBmaWxlO1xyXG5cdH1cclxuXHJcblxyXG5cdGdldEZ1bGxQYXRoRm9yTGluayhsaW5rOiBzdHJpbmcsIG93bmluZ05vdGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0bGluayA9IHRoaXMuc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rKS5saW5rO1xyXG5cdFx0bGluayA9IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKGxpbmspO1xyXG5cdFx0b3duaW5nTm90ZVBhdGggPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShvd25pbmdOb3RlUGF0aCk7XHJcblxyXG5cdFx0bGV0IHBhcmVudEZvbGRlciA9IG93bmluZ05vdGVQYXRoLnN1YnN0cmluZygwLCBvd25pbmdOb3RlUGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xyXG5cdFx0bGV0IGZ1bGxQYXRoID0gcGF0aC5qb2luKHBhcmVudEZvbGRlciwgbGluayk7XHJcblxyXG5cdFx0ZnVsbFBhdGggPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShmdWxsUGF0aCk7XHJcblx0XHRyZXR1cm4gZnVsbFBhdGg7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0QWxsQ2FjaGVkTGlua3NUb0ZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfSB7XHJcblx0XHRsZXQgYWxsTGlua3M6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfSA9IHt9O1xyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKG5vdGUucGF0aCA9PSBmaWxlUGF0aClcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8ubGlua3M7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRsZXQgbGlua0Z1bGxQYXRoID0gdGhpcy5nZXRGdWxsUGF0aEZvckxpbmsobGluay5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAobGlua0Z1bGxQYXRoID09IGZpbGVQYXRoKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFhbGxMaW5rc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0ucHVzaChsaW5rKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxMaW5rcztcclxuXHR9XHJcblxyXG5cclxuXHRnZXRBbGxDYWNoZWRFbWJlZHNUb0ZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0ge1xyXG5cdFx0bGV0IGFsbEVtYmVkczogeyBbbm90ZVBhdGg6IHN0cmluZ106IEVtYmVkQ2FjaGVbXTsgfSA9IHt9O1xyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKG5vdGUucGF0aCA9PSBmaWxlUGF0aClcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGUucGF0aCk/LmVtYmVkcztcclxuXHJcblx0XHRcdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBsaW5rRnVsbFBhdGggPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhlbWJlZC5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAobGlua0Z1bGxQYXRoID09IGZpbGVQYXRoKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFhbGxFbWJlZHNbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdFx0YWxsRW1iZWRzW25vdGUucGF0aF0ucHVzaChlbWJlZCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gYWxsRW1iZWRzO1xyXG5cdH1cclxuXHJcblxyXG5cclxuXHRnZXRBbGxCYWRMaW5rcygpOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0ge1xyXG5cdFx0bGV0IGFsbExpbmtzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8ubGlua3M7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRpZiAobGluay5saW5rLnN0YXJ0c1dpdGgoXCIjXCIpKSAvL2ludGVybmFsIHNlY3Rpb24gbGlua1xyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGxpbmsubGluaywgbm90ZS5wYXRoKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFhbGxMaW5rc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0ucHVzaChsaW5rKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxMaW5rcztcclxuXHR9XHJcblxyXG5cdGdldEFsbEJhZEVtYmVkcygpOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9IHtcclxuXHRcdGxldCBhbGxFbWJlZHM6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGUucGF0aCk/LmVtYmVkcztcclxuXHJcblx0XHRcdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKGVtYmVkLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGVtYmVkLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghYWxsRW1iZWRzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxFbWJlZHNbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdLnB1c2goZW1iZWQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbEVtYmVkcztcclxuXHR9XHJcblxyXG5cclxuXHRnZXRBbGxHb29kTGlua3MoKTogeyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9IHtcclxuXHRcdGxldCBhbGxMaW5rczogeyBbbm90ZVBhdGg6IHN0cmluZ106IExpbmtDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdFx0XHRsZXQgbGlua3MgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGUucGF0aCk/LmxpbmtzO1xyXG5cclxuXHRcdFx0XHRpZiAobGlua3MpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGxpbmsgb2YgbGlua3MpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGxpbmsubGluay5zdGFydHNXaXRoKFwiI1wiKSkgLy9pbnRlcm5hbCBzZWN0aW9uIGxpbmtcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUxpbmsobGluay5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhsaW5rLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChmaWxlKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFhbGxMaW5rc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0ucHVzaChsaW5rKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxMaW5rcztcclxuXHR9XHJcblxyXG5cdGFzeW5jIGdldEFsbEJhZFNlY3Rpb25MaW5rcygpOiBQcm9taXNlPHsgW25vdGVQYXRoOiBzdHJpbmddOiBMaW5rQ2FjaGVbXTsgfT4ge1xyXG5cdFx0bGV0IGFsbExpbmtzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8ubGlua3M7XHJcblx0XHRcdFx0aWYgKGxpbmtzKSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUxpbmsobGluay5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgbGkgPSB0aGlzLnNwbGl0TGlua1RvUGF0aEFuZFNlY3Rpb24obGluay5saW5rKTtcclxuXHRcdFx0XHRcdFx0aWYgKCFsaS5oYXNTZWN0aW9uKVxyXG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluay5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdFx0XHRcdFx0XHRsZXQgc2VjdGlvbiA9IFV0aWxzLm5vcm1hbGl6ZUxpbmtTZWN0aW9uKGxpLnNlY3Rpb24pO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoc2VjdGlvbi5zdGFydHNXaXRoKFwiXlwiKSkgLy9za2lwIF4gbGlua3NcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRsZXQgcmVnZXggPSAvWyAhQCQlXiYqKCktPV8rXFxcXC87J1xcW1xcXVxcXCJcXHxcXD8uXFwsXFw8XFw+XFxgXFx+XFx7XFx9XS9naW07XHJcblx0XHRcdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgJycpO1xyXG5cdFx0XHRcdFx0XHRcdHNlY3Rpb24gPSBzZWN0aW9uLnJlcGxhY2UocmVnZXgsICcnKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKCF0ZXh0LmNvbnRhaW5zKFwiI1wiICsgc2VjdGlvbikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICghYWxsTGlua3Nbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdFx0YWxsTGlua3Nbbm90ZS5wYXRoXS5wdXNoKGxpbmspO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxMaW5rcztcclxuXHR9XHJcblxyXG5cdGdldEFsbEdvb2RFbWJlZHMoKTogeyBbbm90ZVBhdGg6IHN0cmluZ106IEVtYmVkQ2FjaGVbXTsgfSB7XHJcblx0XHRsZXQgYWxsRW1iZWRzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9ID0ge307XHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdFx0XHRsZXQgZW1iZWRzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlLnBhdGgpPy5lbWJlZHM7XHJcblxyXG5cdFx0XHRcdGlmIChlbWJlZHMpIHtcclxuXHRcdFx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhlbWJlZC5saW5rLCBub3RlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRpZiAoZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghYWxsRW1iZWRzW25vdGUucGF0aF0pXHJcblx0XHRcdFx0XHRcdFx0XHRhbGxFbWJlZHNbbm90ZS5wYXRoXSA9IFtdO1xyXG5cdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdLnB1c2goZW1iZWQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbEVtYmVkcztcclxuXHR9XHJcblxyXG5cdGdldEFsbFdpa2lMaW5rcygpOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0ge1xyXG5cdFx0bGV0IGFsbExpbmtzOiB7IFtub3RlUGF0aDogc3RyaW5nXTogTGlua0NhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZS5wYXRoKT8ubGlua3M7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKSlcclxuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghYWxsTGlua3Nbbm90ZS5wYXRoXSlcclxuXHRcdFx0XHRcdFx0XHRhbGxMaW5rc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdGFsbExpbmtzW25vdGUucGF0aF0ucHVzaChsaW5rKTtcclxuXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFsbExpbmtzO1xyXG5cdH1cclxuXHJcblx0Z2V0QWxsV2lraUVtYmVkcygpOiB7IFtub3RlUGF0aDogc3RyaW5nXTogRW1iZWRDYWNoZVtdOyB9IHtcclxuXHRcdGxldCBhbGxFbWJlZHM6IHsgW25vdGVQYXRoOiBzdHJpbmddOiBFbWJlZENhY2hlW107IH0gPSB7fTtcclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0XHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGUucGF0aCk/LmVtYmVkcztcclxuXHJcblx0XHRcdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRcdGlmICghdGhpcy5jaGVja0lzQ29ycmVjdFdpa2lFbWJlZChlbWJlZC5vcmlnaW5hbCkpXHJcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIWFsbEVtYmVkc1tub3RlLnBhdGhdKVxyXG5cdFx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdID0gW107XHJcblx0XHRcdFx0XHRcdGFsbEVtYmVkc1tub3RlLnBhdGhdLnB1c2goZW1iZWQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBhbGxFbWJlZHM7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlTGlua3NUb1JlbmFtZWRGaWxlKG9sZE5vdGVQYXRoOiBzdHJpbmcsIG5ld05vdGVQYXRoOiBzdHJpbmcsIGNoYW5nZWxpbmtzQWx0ID0gZmFsc2UpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQob2xkTm90ZVBhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChuZXdOb3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgbm90ZXMgPSBhd2FpdCB0aGlzLmdldE5vdGVzVGhhdEhhdmVMaW5rVG9GaWxlKG9sZE5vdGVQYXRoKTtcclxuXHRcdGxldCBsaW5rczogUGF0aENoYW5nZUluZm9bXSA9IFt7IG9sZFBhdGg6IG9sZE5vdGVQYXRoLCBuZXdQYXRoOiBuZXdOb3RlUGF0aCB9XTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGF3YWl0IHRoaXMudXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGUsIGxpbmtzLCBjaGFuZ2VsaW5rc0FsdCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyB1cGRhdGVDaGFuZ2VkUGF0aEluTm90ZShub3RlUGF0aDogc3RyaW5nLCBvbGRMaW5rOiBzdHJpbmcsIG5ld0xpbms6IHN0cmluZywgY2hhbmdlbGlua3NBbHQgPSBmYWxzZSkge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgY2hhbmdlczogUGF0aENoYW5nZUluZm9bXSA9IFt7IG9sZFBhdGg6IG9sZExpbmssIG5ld1BhdGg6IG5ld0xpbmsgfV07XHJcblx0XHRyZXR1cm4gYXdhaXQgdGhpcy51cGRhdGVDaGFuZ2VkUGF0aHNJbk5vdGUobm90ZVBhdGgsIGNoYW5nZXMsIGNoYW5nZWxpbmtzQWx0KTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyB1cGRhdGVDaGFuZ2VkUGF0aHNJbk5vdGUobm90ZVBhdGg6IHN0cmluZywgY2hhbmdlZExpbmtzOiBQYXRoQ2hhbmdlSW5mb1tdLCBjaGFuZ2VsaW5rc0FsdCA9IGZhbHNlKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlQYXRoKG5vdGVQYXRoKTtcclxuXHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiY2FudCB1cGRhdGUgbGlua3MgaW4gbm90ZSwgZmlsZSBub3QgZm91bmQ6IFwiICsgbm90ZVBhdGgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xyXG5cdFx0bGV0IGRpcnR5ID0gZmFsc2U7XHJcblxyXG5cdFx0bGV0IGVsZW1lbnRzID0gdGV4dC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXhHKTtcclxuXHRcdGlmIChlbGVtZW50cyAhPSBudWxsICYmIGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgZWwgb2YgZWxlbWVudHMpIHtcclxuXHRcdFx0XHRsZXQgYWx0ID0gZWwubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4KVsxXTtcclxuXHRcdFx0XHRsZXQgbGluayA9IGVsLm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleClbMl07XHJcblx0XHRcdFx0bGV0IGxpID0gdGhpcy5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbmspO1xyXG5cclxuXHRcdFx0XHRpZiAobGkuaGFzU2VjdGlvbikgIC8vIGZvciBsaW5rcyB3aXRoIHNlY3Rpb25zIGxpa2UgW10obm90ZS5tZCNzZWN0aW9uKVxyXG5cdFx0XHRcdFx0bGluayA9IGxpLmxpbms7XHJcblxyXG5cdFx0XHRcdGxldCBmdWxsTGluayA9IHRoaXMuZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG5vdGVQYXRoKTtcclxuXHJcblx0XHRcdFx0Zm9yIChsZXQgY2hhbmdlZExpbmsgb2YgY2hhbmdlZExpbmtzKSB7XHJcblx0XHRcdFx0XHRpZiAoZnVsbExpbmsgPT0gY2hhbmdlZExpbmsub2xkUGF0aCkge1xyXG5cdFx0XHRcdFx0XHRsZXQgbmV3UmVsTGluazogc3RyaW5nID0gcGF0aC5yZWxhdGl2ZShub3RlUGF0aCwgY2hhbmdlZExpbmsubmV3UGF0aCk7XHJcblx0XHRcdFx0XHRcdG5ld1JlbExpbmsgPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhuZXdSZWxMaW5rKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChuZXdSZWxMaW5rLnN0YXJ0c1dpdGgoXCIuLi9cIikpIHtcclxuXHRcdFx0XHRcdFx0XHRuZXdSZWxMaW5rID0gbmV3UmVsTGluay5zdWJzdHJpbmcoMyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChjaGFuZ2VsaW5rc0FsdCAmJiBuZXdSZWxMaW5rLmVuZHNXaXRoKFwiLm1kXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly9yZW5hbWUgb25seSBpZiBvbGQgYWx0ID09IG9sZCBub3RlIG5hbWVcclxuXHRcdFx0XHRcdFx0XHRpZiAoYWx0ID09PSBwYXRoLmJhc2VuYW1lKGNoYW5nZWRMaW5rLm9sZFBhdGgsIHBhdGguZXh0bmFtZShjaGFuZ2VkTGluay5vbGRQYXRoKSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGxldCBleHQgPSBwYXRoLmV4dG5hbWUobmV3UmVsTGluayk7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgYmFzZU5hbWUgPSBwYXRoLmJhc2VuYW1lKG5ld1JlbExpbmssIGV4dCk7XHJcblx0XHRcdFx0XHRcdFx0XHRhbHQgPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShiYXNlTmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAobGkuaGFzU2VjdGlvbilcclxuXHRcdFx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGVsLCAnWycgKyBhbHQgKyAnXScgKyAnKCcgKyBuZXdSZWxMaW5rICsgJyMnICsgbGkuc2VjdGlvbiArICcpJyk7XHJcblx0XHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGVsLCAnWycgKyBhbHQgKyAnXScgKyAnKCcgKyBuZXdSZWxMaW5rICsgJyknKTtcclxuXHJcblx0XHRcdFx0XHRcdGRpcnR5ID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwibGluayB1cGRhdGVkIGluIGNhY2hlZCBub3RlIFtub3RlLCBvbGQgbGluaywgbmV3IGxpbmtdOiBcXG4gICBcIlxyXG5cdFx0XHRcdFx0XHRcdCsgZmlsZS5wYXRoICsgXCJcXG4gICBcIiArIGxpbmsgKyBcIlxcbiAgIFwiICsgbmV3UmVsTGluaylcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGlydHkpXHJcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCB0ZXh0KTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyB1cGRhdGVJbnRlcm5hbExpbmtzSW5Nb3ZlZE5vdGUob2xkTm90ZVBhdGg6IHN0cmluZywgbmV3Tm90ZVBhdGg6IHN0cmluZywgYXR0YWNobWVudHNBbHJlYWR5TW92ZWQ6IGJvb2xlYW4pIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQob2xkTm90ZVBhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChuZXdOb3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChuZXdOb3RlUGF0aCk7XHJcblx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhbnQgdXBkYXRlIGludGVybmFsIGxpbmtzLCBmaWxlIG5vdCBmb3VuZDogXCIgKyBuZXdOb3RlUGF0aCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgdGV4dCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XHJcblx0XHRsZXQgZGlydHkgPSBmYWxzZTtcclxuXHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleEcpO1xyXG5cdFx0aWYgKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRmb3IgKGxldCBlbCBvZiBlbGVtZW50cykge1xyXG5cdFx0XHRcdGxldCBhbHQgPSBlbC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXgpWzFdO1xyXG5cdFx0XHRcdGxldCBsaW5rID0gZWwubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4KVsyXTtcclxuXHRcdFx0XHRsZXQgbGkgPSB0aGlzLnNwbGl0TGlua1RvUGF0aEFuZFNlY3Rpb24obGluayk7XHJcblxyXG5cdFx0XHRcdGlmIChsaW5rLnN0YXJ0c1dpdGgoXCIjXCIpKSAvL2ludGVybmFsIHNlY3Rpb24gbGlua1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGlmIChsaS5oYXNTZWN0aW9uKSAgLy8gZm9yIGxpbmtzIHdpdGggc2VjdGlvbnMgbGlrZSBbXShub3RlLm1kI3NlY3Rpb24pXHJcblx0XHRcdFx0XHRsaW5rID0gbGkubGluaztcclxuXHJcblxyXG5cdFx0XHRcdC8vc3RhcnRzV2l0aChcIi4uL1wiKSAtIGZvciBub3Qgc2tpcHBpbmcgZmlsZXMgdGhhdCBub3QgaW4gdGhlIG5vdGUgZGlyXHJcblx0XHRcdFx0aWYgKGF0dGFjaG1lbnRzQWxyZWFkeU1vdmVkICYmICFsaW5rLmVuZHNXaXRoKFwiLm1kXCIpICYmICFsaW5rLnN0YXJ0c1dpdGgoXCIuLi9cIikpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmdldEZpbGVCeUxpbmsobGluaywgb2xkTm90ZVBhdGgpO1xyXG5cdFx0XHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRcdFx0ZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5TGluayhsaW5rLCBuZXdOb3RlUGF0aCk7XHJcblx0XHRcdFx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBuZXdOb3RlUGF0aCArIFwiIGhhcyBiYWQgbGluayAoZmlsZSBkb2VzIG5vdCBleGlzdCk6IFwiICsgbGluayk7XHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRcdGxldCBuZXdSZWxMaW5rOiBzdHJpbmcgPSBwYXRoLnJlbGF0aXZlKG5ld05vdGVQYXRoLCBmaWxlLnBhdGgpO1xyXG5cdFx0XHRcdG5ld1JlbExpbmsgPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhuZXdSZWxMaW5rKTtcclxuXHJcblx0XHRcdFx0aWYgKG5ld1JlbExpbmsuc3RhcnRzV2l0aChcIi4uL1wiKSkge1xyXG5cdFx0XHRcdFx0bmV3UmVsTGluayA9IG5ld1JlbExpbmsuc3Vic3RyaW5nKDMpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGxpLmhhc1NlY3Rpb24pXHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGVsLCAnWycgKyBhbHQgKyAnXScgKyAnKCcgKyBuZXdSZWxMaW5rICsgJyMnICsgbGkuc2VjdGlvbiArICcpJyk7XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShlbCwgJ1snICsgYWx0ICsgJ10nICsgJygnICsgbmV3UmVsTGluayArICcpJyk7XHJcblxyXG5cdFx0XHRcdGRpcnR5ID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJsaW5rIHVwZGF0ZWQgaW4gbW92ZWQgbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdCsgZmlsZS5wYXRoICsgXCJcXG4gICBcIiArIGxpbmsgKyBcIiAgIFxcblwiICsgbmV3UmVsTGluayk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGlydHkpXHJcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCB0ZXh0KTtcclxuXHR9XHJcblxyXG5cclxuXHRnZXRDYWNoZWROb3Rlc1RoYXRIYXZlTGlua1RvRmlsZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nW10ge1xyXG5cdFx0bGV0IG5vdGVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0bGV0IGFsbE5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChhbGxOb3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIGFsbE5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCBub3RlUGF0aCA9IG5vdGUucGF0aDtcclxuXHRcdFx0XHRpZiAobm90ZS5wYXRoID09IGZpbGVQYXRoKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGVtYmVkcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZVBhdGgpPy5lbWJlZHM7XHJcblx0XHRcdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdFx0XHRcdGxldCBsaW5rUGF0aCA9IHRoaXMuZ2V0RnVsbFBhdGhGb3JMaW5rKGVtYmVkLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rUGF0aCA9PSBmaWxlUGF0aCkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghbm90ZXMuY29udGFpbnMobm90ZVBhdGgpKVxyXG5cdFx0XHRcdFx0XHRcdFx0bm90ZXMucHVzaChub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRcdFx0bGV0IGxpbmtzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlUGF0aCk/LmxpbmtzO1xyXG5cdFx0XHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0XHRsZXQgbGlua1BhdGggPSB0aGlzLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLmxpbmssIG5vdGUucGF0aCk7XHJcblx0XHRcdFx0XHRcdGlmIChsaW5rUGF0aCA9PSBmaWxlUGF0aCkge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghbm90ZXMuY29udGFpbnMobm90ZVBhdGgpKVxyXG5cdFx0XHRcdFx0XHRcdFx0bm90ZXMucHVzaChub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbm90ZXM7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgZ2V0Tm90ZXNUaGF0SGF2ZUxpbmtUb0ZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuXHRcdGxldCBub3Rlczogc3RyaW5nW10gPSBbXTtcclxuXHRcdGxldCBhbGxOb3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAoYWxsTm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBhbGxOb3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgbm90ZVBhdGggPSBub3RlLnBhdGg7XHJcblx0XHRcdFx0aWYgKG5vdGVQYXRoID09IGZpbGVQYXRoKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCBsaW5rcyA9IGF3YWl0IHRoaXMuZ2V0TGlua3NGcm9tTm90ZShub3RlUGF0aCk7XHJcblx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdFx0bGV0IGxpID0gdGhpcy5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbmsubGluayk7XHJcblx0XHRcdFx0XHRsZXQgbGlua0Z1bGxQYXRoID0gdGhpcy5nZXRGdWxsUGF0aEZvckxpbmsobGkubGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKGxpbmtGdWxsUGF0aCA9PSBmaWxlUGF0aCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoIW5vdGVzLmNvbnRhaW5zKG5vdGVQYXRoKSlcclxuXHRcdFx0XHRcdFx0XHRub3Rlcy5wdXNoKG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbm90ZXM7XHJcblx0fVxyXG5cclxuXHRzcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGxpbms6IHN0cmluZyk6IExpbmtTZWN0aW9uSW5mbyB7XHJcblx0XHRsZXQgcmVzOiBMaW5rU2VjdGlvbkluZm8gPSB7XHJcblx0XHRcdGhhc1NlY3Rpb246IGZhbHNlLFxyXG5cdFx0XHRsaW5rOiBsaW5rLFxyXG5cdFx0XHRzZWN0aW9uOiBcIlwiXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCFsaW5rLmNvbnRhaW5zKCcjJykpXHJcblx0XHRcdHJldHVybiByZXM7XHJcblxyXG5cclxuXHRcdGxldCBsaW5rQmVmb3JlSGFzaCA9IGxpbmsubWF0Y2goLyguKj8pIyguKj8pJC8pWzFdO1xyXG5cdFx0bGV0IHNlY3Rpb24gPSBsaW5rLm1hdGNoKC8oLio/KSMoLio/KSQvKVsyXTtcclxuXHJcblxyXG5cclxuXHRcdGlmIChzZWN0aW9uICE9IFwiXCIgJiYgbGlua0JlZm9yZUhhc2guZW5kc1dpdGgoXCIubWRcIikpIHsgLy8gZm9yIGxpbmtzIHdpdGggc2VjdGlvbnMgbGlrZSBbXShub3RlLm1kI3NlY3Rpb24pXHJcblx0XHRcdHJlcyA9IHtcclxuXHRcdFx0XHRoYXNTZWN0aW9uOiB0cnVlLFxyXG5cdFx0XHRcdGxpbms6IGxpbmtCZWZvcmVIYXNoLFxyXG5cdFx0XHRcdHNlY3Rpb246IHNlY3Rpb25cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG5cclxuXHJcblx0Z2V0RmlsZVBhdGhXaXRoUmVuYW1lZEJhc2VOYW1lKGZpbGVQYXRoOiBzdHJpbmcsIG5ld0Jhc2VOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKHBhdGguam9pbihwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCBuZXdCYXNlTmFtZSArIHBhdGguZXh0bmFtZShmaWxlUGF0aCkpKTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBnZXRMaW5rc0Zyb21Ob3RlKG5vdGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPExpbmtDYWNoZVtdPiB7XHJcblx0XHRsZXQgZmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhbnQgZ2V0IGVtYmVkcywgZmlsZSBub3QgZm91bmQ6IFwiICsgbm90ZVBhdGgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xyXG5cclxuXHRcdGxldCBsaW5rczogTGlua0NhY2hlW10gPSBbXTtcclxuXHJcblx0XHRsZXQgZWxlbWVudHMgPSB0ZXh0Lm1hdGNoKG1hcmtkb3duTGlua09yRW1iZWRSZWdleEcpO1xyXG5cdFx0aWYgKGVsZW1lbnRzICE9IG51bGwgJiYgZWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRmb3IgKGxldCBlbCBvZiBlbGVtZW50cykge1xyXG5cdFx0XHRcdGxldCBhbHQgPSBlbC5tYXRjaChtYXJrZG93bkxpbmtPckVtYmVkUmVnZXgpWzFdO1xyXG5cdFx0XHRcdGxldCBsaW5rID0gZWwubWF0Y2gobWFya2Rvd25MaW5rT3JFbWJlZFJlZ2V4KVsyXTtcclxuXHJcblx0XHRcdFx0bGV0IGVtYjogTGlua0NhY2hlID0ge1xyXG5cdFx0XHRcdFx0bGluazogbGluayxcclxuXHRcdFx0XHRcdGRpc3BsYXlUZXh0OiBhbHQsXHJcblx0XHRcdFx0XHRvcmlnaW5hbDogZWwsXHJcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xyXG5cdFx0XHRcdFx0XHRzdGFydDoge1xyXG5cdFx0XHRcdFx0XHRcdGNvbDogMCwvL3RvZG9cclxuXHRcdFx0XHRcdFx0XHRsaW5lOiAwLFxyXG5cdFx0XHRcdFx0XHRcdG9mZnNldDogMFxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRlbmQ6IHtcclxuXHRcdFx0XHRcdFx0XHRjb2w6IDAsLy90b2RvXHJcblx0XHRcdFx0XHRcdFx0bGluZTogMCxcclxuXHRcdFx0XHRcdFx0XHRvZmZzZXQ6IDBcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH07XHJcblxyXG5cdFx0XHRcdGxpbmtzLnB1c2goZW1iKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGxpbmtzO1xyXG5cdH1cclxuXHJcblxyXG5cclxuXHJcblx0YXN5bmMgY29udmVydEFsbE5vdGVFbWJlZHNQYXRoc1RvUmVsYXRpdmUobm90ZVBhdGg6IHN0cmluZyk6IFByb21pc2U8RW1iZWRDaGFuZ2VJbmZvW10+IHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGNoYW5nZWRFbWJlZHM6IEVtYmVkQ2hhbmdlSW5mb1tdID0gW107XHJcblxyXG5cdFx0bGV0IGVtYmVkcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZVBhdGgpPy5lbWJlZHM7XHJcblxyXG5cdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRsZXQgaXNNYXJrZG93bkVtYmVkID0gdGhpcy5jaGVja0lzQ29ycmVjdE1hcmtkb3duRW1iZWQoZW1iZWQub3JpZ2luYWwpO1xyXG5cdFx0XHRcdGxldCBpc1dpa2lFbWJlZCA9IHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpRW1iZWQoZW1iZWQub3JpZ2luYWwpO1xyXG5cdFx0XHRcdGlmIChpc01hcmtkb3duRW1iZWQgfHwgaXNXaWtpRW1iZWQpIHtcclxuXHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGVtYmVkLmxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmIChmaWxlKVxyXG5cdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0XHRmaWxlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaXJzdExpbmtwYXRoRGVzdChlbWJlZC5saW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0XHRpZiAoZmlsZSkge1xyXG5cdFx0XHRcdFx0XHRsZXQgbmV3UmVsTGluazogc3RyaW5nID0gcGF0aC5yZWxhdGl2ZShub3RlUGF0aCwgZmlsZS5wYXRoKTtcclxuXHRcdFx0XHRcdFx0bmV3UmVsTGluayA9IGlzTWFya2Rvd25FbWJlZCA/IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JMaW5rKG5ld1JlbExpbmspIDogVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUobmV3UmVsTGluayk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAobmV3UmVsTGluay5zdGFydHNXaXRoKFwiLi4vXCIpKSB7XHJcblx0XHRcdFx0XHRcdFx0bmV3UmVsTGluayA9IG5ld1JlbExpbmsuc3Vic3RyaW5nKDMpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjaGFuZ2VkRW1iZWRzLnB1c2goeyBvbGQ6IGVtYmVkLCBuZXdMaW5rOiBuZXdSZWxMaW5rIH0pXHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIG5vdGVQYXRoICsgXCIgaGFzIGJhZCBlbWJlZCAoZmlsZSBkb2VzIG5vdCBleGlzdCk6IFwiICsgZW1iZWQubGluayk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGVtYmVkIChmb3JtYXQgb2YgbGluayBpcyBub3QgbWFya2Rvd24gb3Igd2lraWxpbmspOiBcIiArIGVtYmVkLm9yaWdpbmFsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRhd2FpdCB0aGlzLnVwZGF0ZUNoYW5nZWRFbWJlZEluTm90ZShub3RlUGF0aCwgY2hhbmdlZEVtYmVkcyk7XHJcblx0XHRyZXR1cm4gY2hhbmdlZEVtYmVkcztcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBjb252ZXJ0QWxsTm90ZUxpbmtzUGF0aHNUb1JlbGF0aXZlKG5vdGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPExpbmtDaGFuZ2VJbmZvW10+IHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGNoYW5nZWRMaW5rczogTGlua0NoYW5nZUluZm9bXSA9IFtdO1xyXG5cclxuXHRcdGxldCBsaW5rcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobm90ZVBhdGgpPy5saW5rcztcclxuXHJcblx0XHRpZiAobGlua3MpIHtcclxuXHRcdFx0Zm9yIChsZXQgbGluayBvZiBsaW5rcykge1xyXG5cdFx0XHRcdGxldCBpc01hcmtkb3duTGluayA9IHRoaXMuY2hlY2tJc0NvcnJlY3RNYXJrZG93bkxpbmsobGluay5vcmlnaW5hbCk7XHJcblx0XHRcdFx0bGV0IGlzV2lraUxpbmsgPSB0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUxpbmsobGluay5vcmlnaW5hbCk7XHJcblx0XHRcdFx0aWYgKGlzTWFya2Rvd25MaW5rIHx8IGlzV2lraUxpbmspIHtcclxuXHRcdFx0XHRcdGlmIChsaW5rLmxpbmsuc3RhcnRzV2l0aChcIiNcIikpIC8vaW50ZXJuYWwgc2VjdGlvbiBsaW5rXHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5nZXRGaWxlQnlMaW5rKGxpbmsubGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKGZpbGUpXHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRcdC8vISEhIGxpbmsuZGlzcGxheVRleHQgaXMgYWx3YXlzIFwiXCIgLSBPQlNJRElBTiBCVUc/LCBzbyBnZXQgZGlzcGxheSB0ZXh0IG1hbnVhbHlcclxuXHRcdFx0XHRcdGlmIChpc01hcmtkb3duTGluaykge1xyXG5cdFx0XHRcdFx0XHRsZXQgZWxlbWVudHMgPSBsaW5rLm9yaWdpbmFsLm1hdGNoKG1hcmtkb3duTGlua1JlZ2V4KTtcclxuXHRcdFx0XHRcdFx0aWYgKGVsZW1lbnRzKVxyXG5cdFx0XHRcdFx0XHRcdGxpbmsuZGlzcGxheVRleHQgPSBlbGVtZW50c1sxXTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRmaWxlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaXJzdExpbmtwYXRoRGVzdChsaW5rLmxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmIChmaWxlKSB7XHJcblx0XHRcdFx0XHRcdGxldCBuZXdSZWxMaW5rOiBzdHJpbmcgPSBwYXRoLnJlbGF0aXZlKG5vdGVQYXRoLCBmaWxlLnBhdGgpO1xyXG5cdFx0XHRcdFx0XHRuZXdSZWxMaW5rID0gaXNNYXJrZG93bkxpbmsgPyBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhuZXdSZWxMaW5rKSA6IFV0aWxzLm5vcm1hbGl6ZVBhdGhGb3JGaWxlKG5ld1JlbExpbmspO1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKG5ld1JlbExpbmsuc3RhcnRzV2l0aChcIi4uL1wiKSkge1xyXG5cdFx0XHRcdFx0XHRcdG5ld1JlbExpbmsgPSBuZXdSZWxMaW5rLnN1YnN0cmluZygzKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Y2hhbmdlZExpbmtzLnB1c2goeyBvbGQ6IGxpbmssIG5ld0xpbms6IG5ld1JlbExpbmsgfSlcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGxpbmsgKGZpbGUgZG9lcyBub3QgZXhpc3QpOiBcIiArIGxpbmsubGluayk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGxpbmsgKGZvcm1hdCBvZiBsaW5rIGlzIG5vdCBtYXJrZG93biBvciB3aWtpbGluayk6IFwiICsgbGluay5vcmlnaW5hbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0YXdhaXQgdGhpcy51cGRhdGVDaGFuZ2VkTGlua0luTm90ZShub3RlUGF0aCwgY2hhbmdlZExpbmtzKTtcclxuXHRcdHJldHVybiBjaGFuZ2VkTGlua3M7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgdXBkYXRlQ2hhbmdlZEVtYmVkSW5Ob3RlKG5vdGVQYXRoOiBzdHJpbmcsIGNoYW5nZWRFbWJlZHM6IEVtYmVkQ2hhbmdlSW5mb1tdKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCBub3RlRmlsZSA9IHRoaXMuZ2V0RmlsZUJ5UGF0aChub3RlUGF0aCk7XHJcblx0XHRpZiAoIW5vdGVGaWxlKSB7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjYW50IHVwZGF0ZSBlbWJlZHMgaW4gbm90ZSwgZmlsZSBub3QgZm91bmQ6IFwiICsgbm90ZVBhdGgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKG5vdGVGaWxlKTtcclxuXHRcdGxldCBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdGlmIChjaGFuZ2VkRW1iZWRzICYmIGNoYW5nZWRFbWJlZHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBjaGFuZ2VkRW1iZWRzKSB7XHJcblx0XHRcdFx0aWYgKGVtYmVkLm9sZC5saW5rID09IGVtYmVkLm5ld0xpbmspXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RNYXJrZG93bkVtYmVkKGVtYmVkLm9sZC5vcmlnaW5hbCkpIHtcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoZW1iZWQub2xkLm9yaWdpbmFsLCAnIVsnICsgZW1iZWQub2xkLmRpc3BsYXlUZXh0ICsgJ10nICsgJygnICsgZW1iZWQubmV3TGluayArICcpJyk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKGVtYmVkLm9sZC5vcmlnaW5hbCkpIHtcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoZW1iZWQub2xkLm9yaWdpbmFsLCAnIVtbJyArIGVtYmVkLm5ld0xpbmsgKyAnXV0nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBub3RlUGF0aCArIFwiIGhhcyBiYWQgZW1iZWQgKGZvcm1hdCBvZiBsaW5rIGlzIG5vdCBtYWVrZG93biBvciB3aWtpbGluayk6IFwiICsgZW1iZWQub2xkLm9yaWdpbmFsKTtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJlbWJlZCB1cGRhdGVkIGluIG5vdGUgW25vdGUsIG9sZCBsaW5rLCBuZXcgbGlua106IFxcbiAgIFwiXHJcblx0XHRcdFx0XHQrIG5vdGVGaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgZW1iZWQub2xkLmxpbmsgKyBcIlxcbiAgIFwiICsgZW1iZWQubmV3TGluaylcclxuXHJcblx0XHRcdFx0ZGlydHkgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRpcnR5KVxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkobm90ZUZpbGUsIHRleHQpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIHVwZGF0ZUNoYW5nZWRMaW5rSW5Ob3RlKG5vdGVQYXRoOiBzdHJpbmcsIGNoYW5kZWRMaW5rczogTGlua0NoYW5nZUluZm9bXSkge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgbm90ZUZpbGUgPSB0aGlzLmdldEZpbGVCeVBhdGgobm90ZVBhdGgpO1xyXG5cdFx0aWYgKCFub3RlRmlsZSkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiY2FudCB1cGRhdGUgbGlua3MgaW4gbm90ZSwgZmlsZSBub3QgZm91bmQ6IFwiICsgbm90ZVBhdGgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKG5vdGVGaWxlKTtcclxuXHRcdGxldCBkaXJ0eSA9IGZhbHNlO1xyXG5cclxuXHRcdGlmIChjaGFuZGVkTGlua3MgJiYgY2hhbmRlZExpbmtzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgbGluayBvZiBjaGFuZGVkTGlua3MpIHtcclxuXHRcdFx0XHRpZiAobGluay5vbGQubGluayA9PSBsaW5rLm5ld0xpbmspXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RNYXJrZG93bkxpbmsobGluay5vbGQub3JpZ2luYWwpKSB7XHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGxpbmsub2xkLm9yaWdpbmFsLCAnWycgKyBsaW5rLm9sZC5kaXNwbGF5VGV4dCArICddJyArICcoJyArIGxpbmsubmV3TGluayArICcpJyk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUxpbmsobGluay5vbGQub3JpZ2luYWwpKSB7XHJcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5yZXBsYWNlKGxpbmsub2xkLm9yaWdpbmFsLCAnW1snICsgbGluay5uZXdMaW5rICsgJ11dJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGxpbmsgKGZvcm1hdCBvZiBsaW5rIGlzIG5vdCBtYWVrZG93biBvciB3aWtpbGluayk6IFwiICsgbGluay5vbGQub3JpZ2luYWwpO1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhY2hlZCBsaW5rIHVwZGF0ZWQgaW4gbm90ZSBbbm90ZSwgb2xkIGxpbmssIG5ldyBsaW5rXTogXFxuICAgXCJcclxuXHRcdFx0XHRcdCsgbm90ZUZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBsaW5rLm9sZC5saW5rICsgXCJcXG4gICBcIiArIGxpbmsubmV3TGluaylcclxuXHJcblx0XHRcdFx0ZGlydHkgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRpcnR5KVxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkobm90ZUZpbGUsIHRleHQpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIHJlcGxhY2VBbGxOb3RlV2lraWxpbmtzV2l0aE1hcmtkb3duTGlua3Mobm90ZVBhdGg6IHN0cmluZyk6IFByb21pc2U8TGlua3NBbmRFbWJlZHNDaGFuZ2VkSW5mbz4ge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlUGF0aCkpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRsZXQgcmVzOiBMaW5rc0FuZEVtYmVkc0NoYW5nZWRJbmZvID0ge1xyXG5cdFx0XHRsaW5rczogW10sXHJcblx0XHRcdGVtYmVkczogW10sXHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IG5vdGVGaWxlID0gdGhpcy5nZXRGaWxlQnlQYXRoKG5vdGVQYXRoKTtcclxuXHRcdGlmICghbm90ZUZpbGUpIHtcclxuXHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNhbnQgdXBkYXRlIHdpa2lsaW5rcyBpbiBub3RlLCBmaWxlIG5vdCBmb3VuZDogXCIgKyBub3RlUGF0aCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgbGlua3MgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGVQYXRoKT8ubGlua3M7XHJcblx0XHRsZXQgZW1iZWRzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShub3RlUGF0aCk/LmVtYmVkcztcclxuXHRcdGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChub3RlRmlsZSk7XHJcblx0XHRsZXQgZGlydHkgPSBmYWxzZTtcclxuXHJcblx0XHRpZiAoZW1iZWRzKSB7IC8vZW1iZWRzIG11c3QgZ28gZmlyc3QhXHJcblx0XHRcdGZvciAobGV0IGVtYmVkIG9mIGVtYmVkcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmNoZWNrSXNDb3JyZWN0V2lraUVtYmVkKGVtYmVkLm9yaWdpbmFsKSkge1xyXG5cclxuXHRcdFx0XHRcdGxldCBuZXdQYXRoID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsoZW1iZWQubGluaylcclxuXHRcdFx0XHRcdGxldCBuZXdMaW5rID0gJyFbJyArICddJyArICcoJyArIG5ld1BhdGggKyAnKSdcclxuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LnJlcGxhY2UoZW1iZWQub3JpZ2luYWwsIG5ld0xpbmspO1xyXG5cclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwid2lraWxpbmsgKGVtYmVkKSByZXBsYWNlZCBpbiBub3RlIFtub3RlLCBvbGQgbGluaywgbmV3IGxpbmtdOiBcXG4gICBcIlxyXG5cdFx0XHRcdFx0XHQrIG5vdGVGaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgZW1iZWQub3JpZ2luYWwgKyBcIlxcbiAgIFwiICsgbmV3TGluaylcclxuXHJcblx0XHRcdFx0XHRyZXMuZW1iZWRzLnB1c2goeyBvbGQ6IGVtYmVkLCBuZXdMaW5rOiBuZXdMaW5rIH0pXHJcblxyXG5cdFx0XHRcdFx0ZGlydHkgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChsaW5rcykge1xyXG5cdFx0XHRmb3IgKGxldCBsaW5rIG9mIGxpbmtzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuY2hlY2tJc0NvcnJlY3RXaWtpTGluayhsaW5rLm9yaWdpbmFsKSkge1xyXG5cdFx0XHRcdFx0bGV0IG5ld1BhdGggPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhsaW5rLmxpbmspXHJcblxyXG5cdFx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpcnN0TGlua3BhdGhEZXN0KGxpbmsubGluaywgbm90ZVBhdGgpO1xyXG5cdFx0XHRcdFx0aWYgKGZpbGUgJiYgZmlsZS5leHRlbnNpb24gPT0gXCJtZFwiICYmICFuZXdQYXRoLmVuZHNXaXRoKFwiLm1kXCIpKVxyXG5cdFx0XHRcdFx0XHRuZXdQYXRoID0gbmV3UGF0aCArIFwiLm1kXCI7XHJcblxyXG5cdFx0XHRcdFx0bGV0IG5ld0xpbmsgPSAnWycgKyBsaW5rLmRpc3BsYXlUZXh0ICsgJ10nICsgJygnICsgbmV3UGF0aCArICcpJ1xyXG5cdFx0XHRcdFx0dGV4dCA9IHRleHQucmVwbGFjZShsaW5rLm9yaWdpbmFsLCBuZXdMaW5rKTtcclxuXHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcIndpa2lsaW5rIHJlcGxhY2VkIGluIG5vdGUgW25vdGUsIG9sZCBsaW5rLCBuZXcgbGlua106IFxcbiAgIFwiXHJcblx0XHRcdFx0XHRcdCsgbm90ZUZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBsaW5rLm9yaWdpbmFsICsgXCJcXG4gICBcIiArIG5ld0xpbmspXHJcblxyXG5cdFx0XHRcdFx0cmVzLmxpbmtzLnB1c2goeyBvbGQ6IGxpbmssIG5ld0xpbms6IG5ld0xpbmsgfSlcclxuXHJcblx0XHRcdFx0XHRkaXJ0eSA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRpcnR5KVxyXG5cdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkobm90ZUZpbGUsIHRleHQpO1xyXG5cclxuXHRcdHJldHVybiByZXM7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgQXBwLCBUQWJzdHJhY3RGaWxlLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcclxuaW1wb3J0IHsgTGlua3NIYW5kbGVyLCBQYXRoQ2hhbmdlSW5mbyB9IGZyb20gJy4vbGlua3MtaGFuZGxlcic7XHJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IHBhdGggfSBmcm9tICcuL3BhdGgnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBNb3ZlZEF0dGFjaG1lbnRSZXN1bHQge1xyXG5cdG1vdmVkQXR0YWNobWVudHM6IFBhdGhDaGFuZ2VJbmZvW11cclxuXHRyZW5hbWVkRmlsZXM6IFBhdGhDaGFuZ2VJbmZvW10sXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlc0hhbmRsZXIge1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0cHJpdmF0ZSBhcHA6IEFwcCxcclxuXHRcdHByaXZhdGUgbGg6IExpbmtzSGFuZGxlcixcclxuXHRcdHByaXZhdGUgY29uc29sZUxvZ1ByZWZpeDogc3RyaW5nID0gXCJcIixcclxuXHRcdHByaXZhdGUgaWdub3JlRm9sZGVyczogc3RyaW5nW10gPSBbXSxcclxuXHRcdHByaXZhdGUgaWdub3JlRmlsZXM6IHN0cmluZ1tdID0gW10sXHJcblx0KSB7IH1cclxuXHJcblx0aXNQYXRoSWdub3JlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoXCIuL1wiKSlcclxuXHRcdFx0cGF0aCA9IHBhdGguc3Vic3RyaW5nKDIpO1xyXG5cclxuXHRcdGZvciAobGV0IGZvbGRlciBvZiB0aGlzLmlnbm9yZUZvbGRlcnMpIHtcclxuXHRcdFx0aWYgKHBhdGguc3RhcnRzV2l0aChmb2xkZXIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGxldCBmaWxlIG9mIHRoaXMuaWdub3JlRmlsZXMpIHtcclxuXHRcdFx0aWYgKHBhdGggPT0gZmlsZSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhc3luYyBjcmVhdGVGb2xkZXJGb3JBdHRhY2htZW50RnJvbUxpbmsobGluazogc3RyaW5nLCBvd25pbmdOb3RlUGF0aDogc3RyaW5nKSB7XHJcblx0XHRsZXQgbmV3RnVsbFBhdGggPSB0aGlzLmxoLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBvd25pbmdOb3RlUGF0aCk7XHJcblx0XHRyZXR1cm4gYXdhaXQgdGhpcy5jcmVhdGVGb2xkZXJGb3JBdHRhY2htZW50RnJvbVBhdGgobmV3RnVsbFBhdGgpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgY3JlYXRlRm9sZGVyRm9yQXR0YWNobWVudEZyb21QYXRoKGZpbGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdGxldCBuZXdQYXJlbnRGb2xkZXIgPSBmaWxlUGF0aC5zdWJzdHJpbmcoMCwgZmlsZVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcclxuXHRcdHRyeSB7XHJcblx0XHRcdC8vdG9kbyBjaGVjayBmaWxkZXIgZXhpc3RcclxuXHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlRm9sZGVyKG5ld1BhcmVudEZvbGRlcilcclxuXHRcdH0gY2F0Y2ggeyB9XHJcblx0fVxyXG5cclxuXHRnZW5lcmF0ZUZpbGVDb3B5TmFtZShvcmlnaW5hbE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRsZXQgZXh0ID0gcGF0aC5leHRuYW1lKG9yaWdpbmFsTmFtZSk7XHJcblx0XHRsZXQgYmFzZU5hbWUgPSBwYXRoLmJhc2VuYW1lKG9yaWdpbmFsTmFtZSwgZXh0KTtcclxuXHRcdGxldCBkaXIgPSBwYXRoLmRpcm5hbWUob3JpZ2luYWxOYW1lKTtcclxuXHRcdGZvciAobGV0IGkgPSAxOyBpIDwgMTAwMDAwOyBpKyspIHtcclxuXHRcdFx0bGV0IG5ld05hbWUgPSBkaXIgKyBcIi9cIiArIGJhc2VOYW1lICsgXCIgXCIgKyBpICsgZXh0O1xyXG5cdFx0XHRsZXQgZXhpc3RGaWxlID0gdGhpcy5saC5nZXRGaWxlQnlQYXRoKG5ld05hbWUpO1xyXG5cdFx0XHRpZiAoIWV4aXN0RmlsZSlcclxuXHRcdFx0XHRyZXR1cm4gbmV3TmFtZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBcIlwiO1xyXG5cdH1cclxuXHJcblxyXG5cclxuXHRhc3luYyBtb3ZlQ2FjaGVkTm90ZUF0dGFjaG1lbnRzKG9sZE5vdGVQYXRoOiBzdHJpbmcsIG5ld05vdGVQYXRoOiBzdHJpbmcsXHJcblx0XHRkZWxldGVFeGlzdEZpbGVzOiBib29sZWFuKTogUHJvbWlzZTxNb3ZlZEF0dGFjaG1lbnRSZXN1bHQ+IHtcclxuXHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG9sZE5vdGVQYXRoKSB8fCB0aGlzLmlzUGF0aElnbm9yZWQobmV3Tm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Ly90cnkgdG8gZ2V0IGVtYmVkcyBmb3Igb2xkIG9yIG5ldyBwYXRoIChtZXRhZGF0YUNhY2hlIGNhbiBiZSB1cGRhdGVkIG9yIG5vdClcdFx0XHJcblx0XHQvLyEhISB0aGlzIGNhbiByZXR1cm4gdW5kZWZpbmVkIGlmIG5vdGUgd2FzIGp1c3QgdXBkYXRlZFxyXG5cdFx0bGV0IGVtYmVkcyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Q2FjaGUobmV3Tm90ZVBhdGgpPy5lbWJlZHM7XHJcblx0XHRpZiAoIWVtYmVkcylcclxuXHRcdFx0ZW1iZWRzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRDYWNoZShvbGROb3RlUGF0aCk/LmVtYmVkcztcclxuXHJcblx0XHRpZiAoIWVtYmVkcylcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdCA9IHtcclxuXHRcdFx0bW92ZWRBdHRhY2htZW50czogW10sXHJcblx0XHRcdHJlbmFtZWRGaWxlczogW11cclxuXHRcdH07XHJcblxyXG5cdFx0Zm9yIChsZXQgZW1iZWQgb2YgZW1iZWRzKSB7XHJcblx0XHRcdGxldCBsaW5rID0gZW1iZWQubGluaztcclxuXHRcdFx0bGV0IG9sZExpbmtQYXRoID0gdGhpcy5saC5nZXRGdWxsUGF0aEZvckxpbmsobGluaywgb2xkTm90ZVBhdGgpO1xyXG5cclxuXHRcdFx0aWYgKHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmZpbmRJbmRleCh4ID0+IHgub2xkUGF0aCA9PSBvbGRMaW5rUGF0aCkgIT0gLTEpXHJcblx0XHRcdFx0Y29udGludWU7Ly9hbHJlYWR5IG1vdmVkXHJcblxyXG5cdFx0XHRsZXQgZmlsZSA9IHRoaXMubGguZ2V0RmlsZUJ5TGluayhsaW5rLCBvbGROb3RlUGF0aCk7XHJcblx0XHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRcdGZpbGUgPSB0aGlzLmxoLmdldEZpbGVCeUxpbmsobGluaywgbmV3Tm90ZVBhdGgpO1xyXG5cdFx0XHRcdGlmICghZmlsZSkge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcih0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBvbGROb3RlUGF0aCArIFwiIGhhcyBiYWQgZW1iZWQgKGZpbGUgZG9lcyBub3QgZXhpc3QpOiBcIiArIGxpbmspO1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvL2lmIGF0dGFjaG1lbnQgbm90IGluIHRoZSBub3RlIGZvbGRlciwgc2tpcCBpdFxyXG5cdFx0XHQvLyA9IFwiLlwiIG1lYW5zIHRoYXQgbm90ZSB3YXMgYXQgcm9vdCBwYXRoLCBzbyBkbyBub3Qgc2tpcCBpdFxyXG5cdFx0XHRpZiAocGF0aC5kaXJuYW1lKG9sZE5vdGVQYXRoKSAhPSBcIi5cIiAmJiAhcGF0aC5kaXJuYW1lKG9sZExpbmtQYXRoKS5zdGFydHNXaXRoKHBhdGguZGlybmFtZShvbGROb3RlUGF0aCkpKVxyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0bGV0IG5ld0xpbmtQYXRoID0gdGhpcy5saC5nZXRGdWxsUGF0aEZvckxpbmsobGluaywgbmV3Tm90ZVBhdGgpO1xyXG5cdFx0XHRpZiAobmV3TGlua1BhdGggPT0gZmlsZS5wYXRoKVxyXG5cdFx0XHRcdGNvbnRpbnVlOyAvL25vdGhpbmcgdG8gY2hhbmdlXHJcblxyXG5cclxuXHRcdFx0bGV0IHJlcyA9IGF3YWl0IHRoaXMubW92ZUF0dGFjaG1lbnQoZmlsZSwgbmV3TGlua1BhdGgsIFtvbGROb3RlUGF0aCwgbmV3Tm90ZVBhdGhdLCBkZWxldGVFeGlzdEZpbGVzKTtcclxuXHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMgPSByZXN1bHQubW92ZWRBdHRhY2htZW50cy5jb25jYXQocmVzLm1vdmVkQXR0YWNobWVudHMpO1xyXG5cdFx0XHRyZXN1bHQucmVuYW1lZEZpbGVzID0gcmVzdWx0LnJlbmFtZWRGaWxlcy5jb25jYXQocmVzLnJlbmFtZWRGaWxlcyk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgY29sbGVjdEF0dGFjaG1lbnRzRm9yQ2FjaGVkTm90ZShub3RlUGF0aDogc3RyaW5nLCBzdWJmb2xkZXJOYW1lOiBzdHJpbmcsXHJcblx0XHRkZWxldGVFeGlzdEZpbGVzOiBib29sZWFuKTogUHJvbWlzZTxNb3ZlZEF0dGFjaG1lbnRSZXN1bHQ+IHtcclxuXHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGVQYXRoKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdCA9IHtcclxuXHRcdFx0bW92ZWRBdHRhY2htZW50czogW10sXHJcblx0XHRcdHJlbmFtZWRGaWxlczogW11cclxuXHRcdH07XHJcblxyXG5cdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGVQYXRoKT8uZW1iZWRzO1xyXG5cdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRsZXQgbGluayA9IGVtYmVkLmxpbms7XHJcblxyXG5cdFx0XHRcdGxldCBmaWxsUGF0aExpbmsgPSB0aGlzLmxoLmdldEZ1bGxQYXRoRm9yTGluayhsaW5rLCBub3RlUGF0aCk7XHJcblx0XHRcdFx0aWYgKHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmZpbmRJbmRleCh4ID0+IHgub2xkUGF0aCA9PSBmaWxsUGF0aExpbmspICE9IC0xKVxyXG5cdFx0XHRcdFx0Y29udGludWU7Ly9hbHJlYWR5IG1vdmVkXHRcclxuXHJcblx0XHRcdFx0bGV0IGZpbGUgPSB0aGlzLmxoLmdldEZpbGVCeUxpbmsobGluaywgbm90ZVBhdGgpXHJcblx0XHRcdFx0aWYgKCFmaWxlKSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIG5vdGVQYXRoICsgXCIgaGFzIGJhZCBlbWJlZCAoZmlsZSBkb2VzIG5vdCBleGlzdCk6IFwiICsgbGluayk7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGxldCBuZXdQYXRoID0gKHN1YmZvbGRlck5hbWUgPT0gXCJcIikgPyBwYXRoLmRpcm5hbWUobm90ZVBhdGgpIDogcGF0aC5qb2luKHBhdGguZGlybmFtZShub3RlUGF0aCksIHN1YmZvbGRlck5hbWUpO1xyXG5cdFx0XHRcdG5ld1BhdGggPSBVdGlscy5ub3JtYWxpemVQYXRoRm9yRmlsZShwYXRoLmpvaW4obmV3UGF0aCwgcGF0aC5iYXNlbmFtZShmaWxlLnBhdGgpKSk7XHJcblxyXG5cclxuXHRcdFx0XHRpZiAobmV3UGF0aCA9PSBmaWxlLnBhdGgpLy9ub3RoaW5nIHRvIG1vdmVcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzID0gYXdhaXQgdGhpcy5tb3ZlQXR0YWNobWVudChmaWxlLCBuZXdQYXRoLCBbbm90ZVBhdGhdLCBkZWxldGVFeGlzdEZpbGVzKTtcclxuXHJcblx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMgPSByZXN1bHQubW92ZWRBdHRhY2htZW50cy5jb25jYXQocmVzLm1vdmVkQXR0YWNobWVudHMpO1xyXG5cdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMgPSByZXN1bHQucmVuYW1lZEZpbGVzLmNvbmNhdChyZXMucmVuYW1lZEZpbGVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vISEhIHRoaXMgY2FuIHJldHVybiB1bmRlZmluZWQgaWYgbm90ZSB3YXMganVzdCB1cGRhdGVkXHJcblx0XHRsZXQgbGlua3MgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGVQYXRoKT8ubGlua3M7XHJcblx0XHRpZiAobGlua3MpIHtcclxuXHRcdFx0Zm9yIChsZXQgbCBvZiBsaW5rcykge1xyXG5cdFx0XHRcdGxldCBsaW5rID0gdGhpcy5saC5zcGxpdExpbmtUb1BhdGhBbmRTZWN0aW9uKGwubGluaykubGluaztcclxuXHJcblx0XHRcdFx0aWYgKGxpbmsuc3RhcnRzV2l0aChcIiNcIikpIC8vaW50ZXJuYWwgc2VjdGlvbiBsaW5rXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0aWYgKGxpbmsuZW5kc1dpdGgoXCIubWRcIikpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IGZpbGxQYXRoTGluayA9IHRoaXMubGguZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRpZiAocmVzdWx0Lm1vdmVkQXR0YWNobWVudHMuZmluZEluZGV4KHggPT4geC5vbGRQYXRoID09IGZpbGxQYXRoTGluaykgIT0gLTEpXHJcblx0XHRcdFx0XHRjb250aW51ZTsvL2FscmVhZHkgbW92ZWRcdFxyXG5cclxuXHRcdFx0XHRsZXQgZmlsZSA9IHRoaXMubGguZ2V0RmlsZUJ5TGluayhsaW5rLCBub3RlUGF0aClcclxuXHRcdFx0XHRpZiAoIWZpbGUpIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IodGhpcy5jb25zb2xlTG9nUHJlZml4ICsgbm90ZVBhdGggKyBcIiBoYXMgYmFkIGxpbmsgKGZpbGUgZG9lcyBub3QgZXhpc3QpOiBcIiArIGxpbmspO1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgbmV3UGF0aCA9IChzdWJmb2xkZXJOYW1lID09IFwiXCIpID8gcGF0aC5kaXJuYW1lKG5vdGVQYXRoKSA6IHBhdGguam9pbihwYXRoLmRpcm5hbWUobm90ZVBhdGgpLCBzdWJmb2xkZXJOYW1lKTtcclxuXHRcdFx0XHRuZXdQYXRoID0gVXRpbHMubm9ybWFsaXplUGF0aEZvckZpbGUocGF0aC5qb2luKG5ld1BhdGgsIHBhdGguYmFzZW5hbWUoZmlsZS5wYXRoKSkpO1xyXG5cclxuXHRcdFx0XHRpZiAobmV3UGF0aCA9PSBmaWxlLnBhdGgpLy9ub3RoaW5nIHRvIG1vdmVcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzID0gYXdhaXQgdGhpcy5tb3ZlQXR0YWNobWVudChmaWxlLCBuZXdQYXRoLCBbbm90ZVBhdGhdLCBkZWxldGVFeGlzdEZpbGVzKTtcclxuXHJcblx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMgPSByZXN1bHQubW92ZWRBdHRhY2htZW50cy5jb25jYXQocmVzLm1vdmVkQXR0YWNobWVudHMpO1xyXG5cdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMgPSByZXN1bHQucmVuYW1lZEZpbGVzLmNvbmNhdChyZXMucmVuYW1lZEZpbGVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgbW92ZUF0dGFjaG1lbnQoZmlsZTogVEZpbGUsIG5ld0xpbmtQYXRoOiBzdHJpbmcsIHBhcmVudE5vdGVQYXRoczogc3RyaW5nW10sIGRlbGV0ZUV4aXN0RmlsZXM6IGJvb2xlYW4pOiBQcm9taXNlPE1vdmVkQXR0YWNobWVudFJlc3VsdD4ge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLnBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cclxuXHRcdGlmIChmaWxlLnBhdGggPT0gbmV3TGlua1BhdGgpIHtcclxuXHRcdFx0Y29uc29sZS53YXJuKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiQ2FudCBtb3ZlIGZpbGUuIFNvdXJjZSBhbmQgZGVzdGluYXRpb24gcGF0aCB0aGUgc2FtZS5cIilcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdCA9IHtcclxuXHRcdFx0bW92ZWRBdHRhY2htZW50czogW10sXHJcblx0XHRcdHJlbmFtZWRGaWxlczogW11cclxuXHRcdH07XHJcblxyXG5cdFx0YXdhaXQgdGhpcy5jcmVhdGVGb2xkZXJGb3JBdHRhY2htZW50RnJvbVBhdGgobmV3TGlua1BhdGgpO1xyXG5cclxuXHRcdGxldCBsaW5rZWROb3RlcyA9IHRoaXMubGguZ2V0Q2FjaGVkTm90ZXNUaGF0SGF2ZUxpbmtUb0ZpbGUoZmlsZS5wYXRoKTtcclxuXHRcdGlmIChwYXJlbnROb3RlUGF0aHMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZVBhdGggb2YgcGFyZW50Tm90ZVBhdGhzKSB7XHJcblx0XHRcdFx0bGlua2VkTm90ZXMucmVtb3ZlKG5vdGVQYXRoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vaWYgbm8gb3RoZXIgZmlsZSBoYXMgbGluayB0byB0aGlzIGZpbGUgLSB0cnkgdG8gbW92ZSBmaWxlXHJcblx0XHQvL2lmIGZpbGUgYWxyZWFkeSBleGlzdCBhdCBuZXcgbG9jYXRpb24gLSBkZWxldGUgb3IgbW92ZSB3aXRoIG5ldyBuYW1lXHJcblx0XHRpZiAobGlua2VkTm90ZXMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0bGV0IGV4aXN0RmlsZSA9IHRoaXMubGguZ2V0RmlsZUJ5UGF0aChuZXdMaW5rUGF0aCk7XHJcblx0XHRcdGlmICghZXhpc3RGaWxlKSB7XHJcblx0XHRcdFx0Ly9tb3ZlXHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJtb3ZlIGZpbGUgW2Zyb20sIHRvXTogXFxuICAgXCIgKyBmaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgbmV3TGlua1BhdGgpXHJcblx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMucHVzaCh7IG9sZFBhdGg6IGZpbGUucGF0aCwgbmV3UGF0aDogbmV3TGlua1BhdGggfSlcclxuXHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3TGlua1BhdGgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmIChkZWxldGVFeGlzdEZpbGVzKSB7XHJcblx0XHRcdFx0XHQvL2RlbGV0ZVxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJkZWxldGUgZmlsZTogXFxuICAgXCIgKyBmaWxlLnBhdGgpXHJcblx0XHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogZmlsZS5wYXRoLCBuZXdQYXRoOiBuZXdMaW5rUGF0aCB9KVxyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQudHJhc2goZmlsZSwgdHJ1ZSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vbW92ZSB3aXRoIG5ldyBuYW1lXHJcblx0XHRcdFx0XHRsZXQgbmV3RmlsZUNvcHlOYW1lID0gdGhpcy5nZW5lcmF0ZUZpbGVDb3B5TmFtZShuZXdMaW5rUGF0aClcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuY29uc29sZUxvZ1ByZWZpeCArIFwiY29weSBmaWxlIHdpdGggbmV3IG5hbWUgW2Zyb20sIHRvXTogXFxuICAgXCIgKyBmaWxlLnBhdGggKyBcIlxcbiAgIFwiICsgbmV3RmlsZUNvcHlOYW1lKVxyXG5cdFx0XHRcdFx0cmVzdWx0Lm1vdmVkQXR0YWNobWVudHMucHVzaCh7IG9sZFBhdGg6IGZpbGUucGF0aCwgbmV3UGF0aDogbmV3RmlsZUNvcHlOYW1lIH0pXHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5yZW5hbWUoZmlsZSwgbmV3RmlsZUNvcHlOYW1lKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMucHVzaCh7IG9sZFBhdGg6IG5ld0xpbmtQYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vaWYgc29tZSBvdGhlciBmaWxlIGhhcyBsaW5rIHRvIHRoaXMgZmlsZSAtIHRyeSB0byBjb3B5IGZpbGVcclxuXHRcdC8vaWYgZmlsZSBhbHJlYWR5IGV4aXN0IGF0IG5ldyBsb2NhdGlvbiAtIGNvcHkgZmlsZSB3aXRoIG5ldyBuYW1lIG9yIGRvIG5vdGhpbmdcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRsZXQgZXhpc3RGaWxlID0gdGhpcy5saC5nZXRGaWxlQnlQYXRoKG5ld0xpbmtQYXRoKTtcclxuXHRcdFx0aWYgKCFleGlzdEZpbGUpIHtcclxuXHRcdFx0XHQvL2NvcHlcclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImNvcHkgZmlsZSBbZnJvbSwgdG9dOiBcXG4gICBcIiArIGZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBuZXdMaW5rUGF0aClcclxuXHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogZmlsZS5wYXRoLCBuZXdQYXRoOiBuZXdMaW5rUGF0aCB9KVxyXG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNvcHkoZmlsZSwgbmV3TGlua1BhdGgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmIChkZWxldGVFeGlzdEZpbGVzKSB7XHJcblx0XHRcdFx0XHQvL2RvIG5vdGhpbmdcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly9jb3B5IHdpdGggbmV3IG5hbWVcclxuXHRcdFx0XHRcdGxldCBuZXdGaWxlQ29weU5hbWUgPSB0aGlzLmdlbmVyYXRlRmlsZUNvcHlOYW1lKG5ld0xpbmtQYXRoKVxyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5jb25zb2xlTG9nUHJlZml4ICsgXCJjb3B5IGZpbGUgd2l0aCBuZXcgbmFtZSBbZnJvbSwgdG9dOiBcXG4gICBcIiArIGZpbGUucGF0aCArIFwiXFxuICAgXCIgKyBuZXdGaWxlQ29weU5hbWUpXHJcblx0XHRcdFx0XHRyZXN1bHQubW92ZWRBdHRhY2htZW50cy5wdXNoKHsgb2xkUGF0aDogZmlsZS5wYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNvcHkoZmlsZSwgbmV3RmlsZUNvcHlOYW1lKTtcclxuXHRcdFx0XHRcdHJlc3VsdC5yZW5hbWVkRmlsZXMucHVzaCh7IG9sZFBhdGg6IG5ld0xpbmtQYXRoLCBuZXdQYXRoOiBuZXdGaWxlQ29weU5hbWUgfSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cclxuXHRhc3luYyBkZWxldGVFbXB0eUZvbGRlcnMoZGlyTmFtZTogc3RyaW5nKSB7XHJcblx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKGRpck5hbWUpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0aWYgKGRpck5hbWUuc3RhcnRzV2l0aChcIi4vXCIpKVxyXG5cdFx0XHRkaXJOYW1lID0gZGlyTmFtZS5zdWJzdHJpbmcoMik7XHJcblxyXG5cclxuXHRcdGxldCBsaXN0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KGRpck5hbWUpO1xyXG5cdFx0Zm9yIChsZXQgZm9sZGVyIG9mIGxpc3QuZm9sZGVycykge1xyXG5cdFx0XHRhd2FpdCB0aGlzLmRlbGV0ZUVtcHR5Rm9sZGVycyhmb2xkZXIpXHJcblx0XHR9XHJcblxyXG5cdFx0bGlzdCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChkaXJOYW1lKTtcclxuXHRcdGlmIChsaXN0LmZpbGVzLmxlbmd0aCA9PSAwICYmIGxpc3QuZm9sZGVycy5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLmNvbnNvbGVMb2dQcmVmaXggKyBcImRlbGV0ZSBlbXB0eSBmb2xkZXI6IFxcbiAgIFwiICsgZGlyTmFtZSlcclxuXHRcdFx0aWYgKGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGRpck5hbWUpKVxyXG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIucm1kaXIoZGlyTmFtZSwgZmFsc2UpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgZGVsZXRlVW51c2VkQXR0YWNobWVudHNGb3JDYWNoZWROb3RlKG5vdGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZVBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0Ly8hISEgdGhpcyBjYW4gcmV0dXJuIHVuZGVmaW5lZCBpZiBub3RlIHdhcyBqdXN0IHVwZGF0ZWRcclxuXHRcdGxldCBlbWJlZHMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldENhY2hlKG5vdGVQYXRoKT8uZW1iZWRzO1xyXG5cdFx0aWYgKGVtYmVkcykge1xyXG5cdFx0XHRmb3IgKGxldCBlbWJlZCBvZiBlbWJlZHMpIHtcclxuXHRcdFx0XHRsZXQgbGluayA9IGVtYmVkLmxpbms7XHJcblxyXG5cdFx0XHRcdGxldCBmdWxsUGF0aCA9IHRoaXMubGguZ2V0RnVsbFBhdGhGb3JMaW5rKGxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRsZXQgbGlua2VkTm90ZXMgPSB0aGlzLmxoLmdldENhY2hlZE5vdGVzVGhhdEhhdmVMaW5rVG9GaWxlKGZ1bGxQYXRoKTtcclxuXHRcdFx0XHRpZiAobGlua2VkTm90ZXMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0XHRcdGxldCBmaWxlID0gdGhpcy5saC5nZXRGaWxlQnlMaW5rKGxpbmssIG5vdGVQYXRoKTtcclxuXHRcdFx0XHRcdGlmIChmaWxlKSB7XHJcblx0XHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQudHJhc2goZmlsZSwgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggeyB9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH1cclxufVxyXG5cclxuXHJcbiIsImltcG9ydCB7IEFwcCwgUGx1Z2luLCBUQWJzdHJhY3RGaWxlLCBURmlsZSwgRW1iZWRDYWNoZSwgTGlua0NhY2hlLCBOb3RpY2UgfSBmcm9tICdvYnNpZGlhbic7XHJcbmltcG9ydCB7IFBsdWdpblNldHRpbmdzLCBERUZBVUxUX1NFVFRJTkdTLCBTZXR0aW5nVGFiIH0gZnJvbSAnLi9zZXR0aW5ncyc7XHJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IExpbmtzSGFuZGxlciwgUGF0aENoYW5nZUluZm8gfSBmcm9tICcuL2xpbmtzLWhhbmRsZXInO1xyXG5pbXBvcnQgeyBGaWxlc0hhbmRsZXIsIE1vdmVkQXR0YWNobWVudFJlc3VsdCB9IGZyb20gJy4vZmlsZXMtaGFuZGxlcic7XHJcbmltcG9ydCB7IHBhdGggfSBmcm9tICcuL3BhdGgnO1xyXG5cclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uc2lzdGVudEF0dGFjaG1lbnRzQW5kTGlua3MgZXh0ZW5kcyBQbHVnaW4ge1xyXG5cdHNldHRpbmdzOiBQbHVnaW5TZXR0aW5ncztcclxuXHRsaDogTGlua3NIYW5kbGVyO1xyXG5cdGZoOiBGaWxlc0hhbmRsZXI7XHJcblxyXG5cdHJlY2VudGx5UmVuYW1lZEZpbGVzOiBQYXRoQ2hhbmdlSW5mb1tdID0gW107XHJcblx0Y3VycmVudGx5UmVuYW1pbmdGaWxlczogUGF0aENoYW5nZUluZm9bXSA9IFtdO1xyXG5cdHRpbWVySWQ6IE5vZGVKUy5UaW1lb3V0O1xyXG5cdHJlbmFtaW5nSXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcblx0YXN5bmMgb25sb2FkKCkge1xyXG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcclxuXHJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcclxuXHJcblx0XHR0aGlzLnJlZ2lzdGVyRXZlbnQoXHJcblx0XHRcdHRoaXMuYXBwLnZhdWx0Lm9uKCdkZWxldGUnLCAoZmlsZSkgPT4gdGhpcy5oYW5kbGVEZWxldGVkRmlsZShmaWxlKSksXHJcblx0XHQpO1xyXG5cclxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcclxuXHRcdFx0dGhpcy5hcHAudmF1bHQub24oJ3JlbmFtZScsIChmaWxlLCBvbGRQYXRoKSA9PiB0aGlzLmhhbmRsZVJlbmFtZWRGaWxlKGZpbGUsIG9sZFBhdGgpKSxcclxuXHRcdCk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdjb2xsZWN0LWFsbC1hdHRhY2htZW50cycsXHJcblx0XHRcdG5hbWU6ICdDb2xsZWN0IGFsbCBhdHRhY2htZW50cycsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmNvbGxlY3RBbGxBdHRhY2htZW50cygpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ2RlbGV0ZS1lbXB0eS1mb2xkZXJzJyxcclxuXHRcdFx0bmFtZTogJ0RlbGV0ZSBlbXB0eSBmb2xkZXJzJyxcclxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuZGVsZXRlRW1wdHlGb2xkZXJzKClcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XHJcblx0XHRcdGlkOiAnY29udmVydC1hbGwtbGluay1wYXRocy10by1yZWxhdGl2ZScsXHJcblx0XHRcdG5hbWU6ICdDb252ZXJ0IGFsbCBsaW5rIHBhdGhzIHRvIHJlbGF0aXZlJyxcclxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuY29udmVydEFsbExpbmtQYXRoc1RvUmVsYXRpdmUoKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdjb252ZXJ0LWFsbC1lbWJlZC1wYXRocy10by1yZWxhdGl2ZScsXHJcblx0XHRcdG5hbWU6ICdDb252ZXJ0IGFsbCBlbWJlZCBwYXRocyB0byByZWxhdGl2ZScsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmNvbnZlcnRBbGxFbWJlZHNQYXRoc1RvUmVsYXRpdmUoKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdyZXBsYWNlLWFsbC13aWtpbGlua3Mtd2l0aC1tYXJrZG93bi1saW5rcycsXHJcblx0XHRcdG5hbWU6ICdSZXBsYWNlIGFsbCB3aWtpbGlua3Mgd2l0aCBtYXJrZG93biBsaW5rcycsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLnJlcGxhY2VBbGxXaWtpbGlua3NXaXRoTWFya2Rvd25MaW5rcygpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ3Jlb3JnYW5pemUtdmF1bHQnLFxyXG5cdFx0XHRuYW1lOiAnUmVvcmdhbml6ZSB2YXVsdCcsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLnJlb3JnYW5pemVWYXVsdCgpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xyXG5cdFx0XHRpZDogJ2NoZWNrLWNvbnNpc3RlbnQnLFxyXG5cdFx0XHRuYW1lOiAnQ2hlY2sgdmF1bHQgY29uc2lzdGVudCcsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmNoZWNrQ29uc2lzdGVudCgpXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmxoID0gbmV3IExpbmtzSGFuZGxlcihcclxuXHRcdFx0dGhpcy5hcHAsXHJcblx0XHRcdFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6IFwiLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXNcclxuXHRcdCk7XHJcblxyXG5cdFx0dGhpcy5maCA9IG5ldyBGaWxlc0hhbmRsZXIoXHJcblx0XHRcdHRoaXMuYXBwLFxyXG5cdFx0XHR0aGlzLmxoLFxyXG5cdFx0XHRcIkNvbnNpc3RlbnQgYXR0YWNobWVudHMgYW5kIGxpbmtzOiBcIixcclxuXHRcdFx0dGhpcy5zZXR0aW5ncy5pZ25vcmVGb2xkZXJzLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZpbGVzXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0aXNQYXRoSWdub3JlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoXCIuL1wiKSlcclxuXHRcdFx0cGF0aCA9IHBhdGguc3Vic3RyaW5nKDIpO1xyXG5cclxuXHRcdGZvciAobGV0IGZvbGRlciBvZiB0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMpIHtcclxuXHRcdFx0aWYgKHBhdGguc3RhcnRzV2l0aChmb2xkZXIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGxldCBmaWxlIG9mIHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXMpIHtcclxuXHRcdFx0aWYgKHBhdGggPT0gZmlsZSkge1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgaGFuZGxlRGVsZXRlZEZpbGUoZmlsZTogVEFic3RyYWN0RmlsZSkge1xyXG5cdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLnBhdGgpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0bGV0IGZpbGVFeHQgPSBmaWxlLnBhdGguc3Vic3RyaW5nKGZpbGUucGF0aC5sYXN0SW5kZXhPZihcIi5cIikpO1xyXG5cdFx0aWYgKGZpbGVFeHQgPT0gXCIubWRcIikge1xyXG5cdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5kZWxldGVBdHRhY2htZW50c1dpdGhOb3RlKSB7XHJcblx0XHRcdFx0YXdhaXQgdGhpcy5maC5kZWxldGVVbnVzZWRBdHRhY2htZW50c0ZvckNhY2hlZE5vdGUoZmlsZS5wYXRoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly9kZWxldGUgY2hpbGQgZm9sZGVycyAoZG8gbm90IGRlbGV0ZSBwYXJlbnQpXHJcblx0XHRcdGlmICh0aGlzLnNldHRpbmdzLmRlbGV0ZUVtcHR5Rm9sZGVycykge1xyXG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwYXRoLmRpcm5hbWUoZmlsZS5wYXRoKSkpIHtcclxuXHRcdFx0XHRcdGxldCBsaXN0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5saXN0KHBhdGguZGlybmFtZShmaWxlLnBhdGgpKTtcclxuXHRcdFx0XHRcdGZvciAobGV0IGZvbGRlciBvZiBsaXN0LmZvbGRlcnMpIHtcclxuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5maC5kZWxldGVFbXB0eUZvbGRlcnMoZm9sZGVyKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFzeW5jIGhhbmRsZVJlbmFtZWRGaWxlKGZpbGU6IFRBYnN0cmFjdEZpbGUsIG9sZFBhdGg6IHN0cmluZykge1xyXG5cdFx0dGhpcy5yZWNlbnRseVJlbmFtZWRGaWxlcy5wdXNoKHsgb2xkUGF0aDogb2xkUGF0aCwgbmV3UGF0aDogZmlsZS5wYXRoIH0pO1xyXG5cclxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnRpbWVySWQpO1xyXG5cdFx0dGhpcy50aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMuSGFuZGxlUmVjZW50bHlSZW5hbWVkRmlsZXMoKSB9LCAzMDAwKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIEhhbmRsZVJlY2VudGx5UmVuYW1lZEZpbGVzKCkge1xyXG5cdFx0aWYgKCF0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzIHx8IHRoaXMucmVjZW50bHlSZW5hbWVkRmlsZXMubGVuZ3RoID09IDApIC8vbm90aGluZyB0byByZW5hbWVcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmICh0aGlzLnJlbmFtaW5nSXNBY3RpdmUpIC8vYWxyZWFkeSBzdGFydGVkXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0aGlzLnJlbmFtaW5nSXNBY3RpdmUgPSB0cnVlO1xyXG5cclxuXHRcdHRoaXMuY3VycmVudGx5UmVuYW1pbmdGaWxlcyA9IHRoaXMucmVjZW50bHlSZW5hbWVkRmlsZXM7IC8vY2xlYXIgYXJyYXkgZm9yIHB1c2hpbmcgbmV3IGZpbGVzIGFzeW5jXHJcblx0XHR0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzID0gW107XHJcblxyXG5cdFx0bmV3IE5vdGljZShcIkZpeGluZyBjb25zaXN0ZW50IGZvciBcIiArIHRoaXMuY3VycmVudGx5UmVuYW1pbmdGaWxlcy5sZW5ndGggKyBcIiByZW5hbWVkIGZpbGVzXCIgKyBcIi4uLlwiKTtcclxuXHRcdGNvbnNvbGUubG9nKFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6XFxuRml4aW5nIGNvbnNpc3RlbnQgZm9yIFwiICsgdGhpcy5jdXJyZW50bHlSZW5hbWluZ0ZpbGVzLmxlbmd0aCArIFwiIHJlbmFtZWQgZmlsZXNcIiArIFwiLi4uXCIpO1xyXG5cclxuXHRcdHRyeSB7XHJcblx0XHRcdGZvciAobGV0IGZpbGUgb2YgdGhpcy5jdXJyZW50bHlSZW5hbWluZ0ZpbGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLm5ld1BhdGgpIHx8IHRoaXMuaXNQYXRoSWdub3JlZChmaWxlLm9sZFBhdGgpKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0XHQvLyBhd2FpdCBVdGlscy5kZWxheSgxMCk7IC8vd2FpdGluZyBmb3IgdXBkYXRlIHZhdWx0XHJcblxyXG5cdFx0XHRcdGxldCByZXN1bHQ6IE1vdmVkQXR0YWNobWVudFJlc3VsdDtcclxuXHJcblx0XHRcdFx0bGV0IGZpbGVFeHQgPSBmaWxlLm9sZFBhdGguc3Vic3RyaW5nKGZpbGUub2xkUGF0aC5sYXN0SW5kZXhPZihcIi5cIikpO1xyXG5cclxuXHRcdFx0XHRpZiAoZmlsZUV4dCA9PSBcIi5tZFwiKSB7XHJcblx0XHRcdFx0XHQvLyBhd2FpdCBVdGlscy5kZWxheSg1MDApOy8vd2FpdGluZyBmb3IgdXBkYXRlIG1ldGFkYXRhQ2FjaGVcclxuXHJcblx0XHRcdFx0XHRpZiAocGF0aC5kaXJuYW1lKGZpbGUub2xkUGF0aCkgIT0gcGF0aC5kaXJuYW1lKGZpbGUubmV3UGF0aCkpIHtcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MubW92ZUF0dGFjaG1lbnRzV2l0aE5vdGUpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBhd2FpdCB0aGlzLmZoLm1vdmVDYWNoZWROb3RlQXR0YWNobWVudHMoXHJcblx0XHRcdFx0XHRcdFx0XHRmaWxlLm9sZFBhdGgsXHJcblx0XHRcdFx0XHRcdFx0XHRmaWxlLm5ld1BhdGgsXHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldHRpbmdzLmRlbGV0ZUV4aXN0RmlsZXNXaGVuTW92ZU5vdGVcclxuXHRcdFx0XHRcdFx0XHQpXHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnVwZGF0ZUxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAocmVzdWx0ICYmIHJlc3VsdC5yZW5hbWVkRmlsZXMgJiYgcmVzdWx0LnJlbmFtZWRGaWxlcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMubGgudXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKGZpbGUubmV3UGF0aCwgcmVzdWx0LnJlbmFtZWRGaWxlcylcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnNldHRpbmdzLnVwZGF0ZUxpbmtzKSB7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5saC51cGRhdGVJbnRlcm5hbExpbmtzSW5Nb3ZlZE5vdGUoZmlsZS5vbGRQYXRoLCBmaWxlLm5ld1BhdGgsIHRoaXMuc2V0dGluZ3MubW92ZUF0dGFjaG1lbnRzV2l0aE5vdGUpXHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vZGVsZXRlIGNoaWxkIGZvbGRlcnMgKGRvIG5vdCBkZWxldGUgcGFyZW50KVxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5kZWxldGVFbXB0eUZvbGRlcnMpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGF0aC5kaXJuYW1lKGZpbGUub2xkUGF0aCkpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgbGlzdCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubGlzdChwYXRoLmRpcm5hbWUoZmlsZS5vbGRQYXRoKSk7XHJcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBmb2xkZXIgb2YgbGlzdC5mb2xkZXJzKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZmguZGVsZXRlRW1wdHlGb2xkZXJzKGZvbGRlcik7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgdXBkYXRlQWx0cyA9IHRoaXMuc2V0dGluZ3MuY2hhbmdlTm90ZUJhY2tsaW5rc0FsdCAmJiBmaWxlRXh0ID09IFwiLm1kXCI7XHJcblx0XHRcdFx0aWYgKHRoaXMuc2V0dGluZ3MudXBkYXRlTGlua3MpIHtcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMubGgudXBkYXRlTGlua3NUb1JlbmFtZWRGaWxlKGZpbGUub2xkUGF0aCwgZmlsZS5uZXdQYXRoLCB1cGRhdGVBbHRzKVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQubW92ZWRBdHRhY2htZW50cyAmJiByZXN1bHQubW92ZWRBdHRhY2htZW50cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRuZXcgTm90aWNlKFwiTW92ZWQgXCIgKyByZXN1bHQubW92ZWRBdHRhY2htZW50cy5sZW5ndGggKyBcIiBhdHRhY2htZW50XCIgKyAocmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoID4gMSA/IFwic1wiIDogXCJcIikpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6IFxcblwiICsgZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0bmV3IE5vdGljZShcIkZpeGluZyBjb25zaXN0ZW50IGNvbXBsZXRlXCIpO1xyXG5cdFx0Y29uc29sZS5sb2coXCJDb25zaXN0ZW50IGF0dGFjaG1lbnRzIGFuZCBsaW5rczpcXG5GaXhpbmcgY29uc2lzdGVudCBjb21wbGV0ZVwiKTtcclxuXHJcblx0XHR0aGlzLnJlbmFtaW5nSXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcblx0XHRpZiAodGhpcy5yZWNlbnRseVJlbmFtZWRGaWxlcyAmJiB0aGlzLnJlY2VudGx5UmVuYW1lZEZpbGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXJJZCk7XHJcblx0XHRcdHRoaXMudGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLkhhbmRsZVJlY2VudGx5UmVuYW1lZEZpbGVzKCkgfSwgNTAwKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHJcblxyXG5cdGFzeW5jIGNvbGxlY3RBbGxBdHRhY2htZW50cygpIHtcclxuXHRcdGxldCBtb3ZlZEF0dGFjaG1lbnRzQ291bnQgPSAwO1xyXG5cdFx0bGV0IHByb2Nlc3NlZE5vdGVzQ291bnQgPSAwO1xyXG5cclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5maC5jb2xsZWN0QXR0YWNobWVudHNGb3JDYWNoZWROb3RlKFxyXG5cdFx0XHRcdFx0bm90ZS5wYXRoLFxyXG5cdFx0XHRcdFx0dGhpcy5zZXR0aW5ncy5hdHRhY2htZW50c1N1YmZvbGRlcixcclxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MuZGVsZXRlRXhpc3RGaWxlc1doZW5Nb3ZlTm90ZSk7XHJcblxyXG5cclxuXHRcdFx0XHRpZiAocmVzdWx0ICYmIHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzICYmIHJlc3VsdC5tb3ZlZEF0dGFjaG1lbnRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMubGgudXBkYXRlQ2hhbmdlZFBhdGhzSW5Ob3RlKG5vdGUucGF0aCwgcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMpXHJcblx0XHRcdFx0XHRtb3ZlZEF0dGFjaG1lbnRzQ291bnQgKz0gcmVzdWx0Lm1vdmVkQXR0YWNobWVudHMubGVuZ3RoO1xyXG5cdFx0XHRcdFx0cHJvY2Vzc2VkTm90ZXNDb3VudCsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChtb3ZlZEF0dGFjaG1lbnRzQ291bnQgPT0gMClcclxuXHRcdFx0bmV3IE5vdGljZShcIk5vIGZpbGVzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSBtb3ZlZFwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0bmV3IE5vdGljZShcIk1vdmVkIFwiICsgbW92ZWRBdHRhY2htZW50c0NvdW50ICsgXCIgYXR0YWNobWVudFwiICsgKG1vdmVkQXR0YWNobWVudHNDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpXHJcblx0XHRcdFx0KyBcIiBmcm9tIFwiICsgcHJvY2Vzc2VkTm90ZXNDb3VudCArIFwiIG5vdGVcIiArIChwcm9jZXNzZWROb3Rlc0NvdW50ID4gMSA/IFwic1wiIDogXCJcIikpO1xyXG5cdH1cclxuXHJcblxyXG5cdGFzeW5jIGNvbnZlcnRBbGxFbWJlZHNQYXRoc1RvUmVsYXRpdmUoKSB7XHJcblx0XHRsZXQgY2hhbmdlZEVtYmVkQ291bnQgPSAwO1xyXG5cdFx0bGV0IHByb2Nlc3NlZE5vdGVzQ291bnQgPSAwO1xyXG5cclxuXHRcdGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcblx0XHRpZiAobm90ZXMpIHtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBvZiBub3Rlcykge1xyXG5cdFx0XHRcdGlmICh0aGlzLmlzUGF0aElnbm9yZWQobm90ZS5wYXRoKSlcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cclxuXHRcdFx0XHRsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5saC5jb252ZXJ0QWxsTm90ZUVtYmVkc1BhdGhzVG9SZWxhdGl2ZShub3RlLnBhdGgpO1xyXG5cclxuXHRcdFx0XHRpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRjaGFuZ2VkRW1iZWRDb3VudCArPSByZXN1bHQubGVuZ3RoO1xyXG5cdFx0XHRcdFx0cHJvY2Vzc2VkTm90ZXNDb3VudCsrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChjaGFuZ2VkRW1iZWRDb3VudCA9PSAwKVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiTm8gZW1iZWRzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSBjb252ZXJ0ZWRcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJDb252ZXJ0ZWQgXCIgKyBjaGFuZ2VkRW1iZWRDb3VudCArIFwiIGVtYmVkXCIgKyAoY2hhbmdlZEVtYmVkQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKVxyXG5cdFx0XHRcdCsgXCIgZnJvbSBcIiArIHByb2Nlc3NlZE5vdGVzQ291bnQgKyBcIiBub3RlXCIgKyAocHJvY2Vzc2VkTm90ZXNDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHR9XHJcblxyXG5cclxuXHRhc3luYyBjb252ZXJ0QWxsTGlua1BhdGhzVG9SZWxhdGl2ZSgpIHtcclxuXHRcdGxldCBjaGFuZ2VkTGlua3NDb3VudCA9IDA7XHJcblx0XHRsZXQgcHJvY2Vzc2VkTm90ZXNDb3VudCA9IDA7XHJcblxyXG5cdFx0bGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuXHRcdGlmIChub3Rlcykge1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNQYXRoSWdub3JlZChub3RlLnBhdGgpKVxyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblxyXG5cdFx0XHRcdGxldCByZXN1bHQgPSBhd2FpdCB0aGlzLmxoLmNvbnZlcnRBbGxOb3RlTGlua3NQYXRoc1RvUmVsYXRpdmUobm90ZS5wYXRoKTtcclxuXHJcblx0XHRcdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0Y2hhbmdlZExpbmtzQ291bnQgKz0gcmVzdWx0Lmxlbmd0aDtcclxuXHRcdFx0XHRcdHByb2Nlc3NlZE5vdGVzQ291bnQrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY2hhbmdlZExpbmtzQ291bnQgPT0gMClcclxuXHRcdFx0bmV3IE5vdGljZShcIk5vIGxpbmtzIGZvdW5kIHRoYXQgbmVlZCB0byBiZSBjb252ZXJ0ZWRcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJDb252ZXJ0ZWQgXCIgKyBjaGFuZ2VkTGlua3NDb3VudCArIFwiIGxpbmtcIiArIChjaGFuZ2VkTGlua3NDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpXHJcblx0XHRcdFx0KyBcIiBmcm9tIFwiICsgcHJvY2Vzc2VkTm90ZXNDb3VudCArIFwiIG5vdGVcIiArIChwcm9jZXNzZWROb3Rlc0NvdW50ID4gMSA/IFwic1wiIDogXCJcIikpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgcmVwbGFjZUFsbFdpa2lsaW5rc1dpdGhNYXJrZG93bkxpbmtzKCkge1xyXG5cdFx0bGV0IGNoYW5nZWRMaW5rc0NvdW50ID0gMDtcclxuXHRcdGxldCBwcm9jZXNzZWROb3Rlc0NvdW50ID0gMDtcclxuXHJcblx0XHRsZXQgbm90ZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XHJcblxyXG5cdFx0aWYgKG5vdGVzKSB7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc1BhdGhJZ25vcmVkKG5vdGUucGF0aCkpXHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHJcblx0XHRcdFx0bGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMubGgucmVwbGFjZUFsbE5vdGVXaWtpbGlua3NXaXRoTWFya2Rvd25MaW5rcyhub3RlLnBhdGgpO1xyXG5cclxuXHRcdFx0XHRpZiAocmVzdWx0ICYmIChyZXN1bHQubGlua3MubGVuZ3RoID4gMCB8fCByZXN1bHQuZW1iZWRzLmxlbmd0aCA+IDApKSB7XHJcblx0XHRcdFx0XHRjaGFuZ2VkTGlua3NDb3VudCArPSByZXN1bHQubGlua3MubGVuZ3RoO1xyXG5cdFx0XHRcdFx0Y2hhbmdlZExpbmtzQ291bnQgKz0gcmVzdWx0LmVtYmVkcy5sZW5ndGg7XHJcblx0XHRcdFx0XHRwcm9jZXNzZWROb3Rlc0NvdW50Kys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGNoYW5nZWRMaW5rc0NvdW50ID09IDApXHJcblx0XHRcdG5ldyBOb3RpY2UoXCJObyB3aWtpbGlua3MgZm91bmQgdGhhdCBuZWVkIHRvIGJlIHJlcGxhY2VkXCIpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRuZXcgTm90aWNlKFwiUmVwbGFjZWQgXCIgKyBjaGFuZ2VkTGlua3NDb3VudCArIFwiIHdpa2lsaW5rXCIgKyAoY2hhbmdlZExpbmtzQ291bnQgPiAxID8gXCJzXCIgOiBcIlwiKVxyXG5cdFx0XHRcdCsgXCIgZnJvbSBcIiArIHByb2Nlc3NlZE5vdGVzQ291bnQgKyBcIiBub3RlXCIgKyAocHJvY2Vzc2VkTm90ZXNDb3VudCA+IDEgPyBcInNcIiA6IFwiXCIpKTtcclxuXHR9XHJcblxyXG5cdGRlbGV0ZUVtcHR5Rm9sZGVycygpIHtcclxuXHRcdHRoaXMuZmguZGVsZXRlRW1wdHlGb2xkZXJzKFwiL1wiKVxyXG5cdH1cclxuXHJcblx0YXN5bmMgY2hlY2tDb25zaXN0ZW50KCkge1xyXG5cdFx0bGV0IGJhZExpbmtzID0gdGhpcy5saC5nZXRBbGxCYWRMaW5rcygpO1xyXG5cdFx0bGV0IGJhZFNlY3Rpb25MaW5rcyA9IGF3YWl0IHRoaXMubGguZ2V0QWxsQmFkU2VjdGlvbkxpbmtzKCk7XHJcblx0XHRsZXQgYmFkRW1iZWRzID0gdGhpcy5saC5nZXRBbGxCYWRFbWJlZHMoKTtcclxuXHRcdGxldCB3aWtpTGlua3MgPSB0aGlzLmxoLmdldEFsbFdpa2lMaW5rcygpO1xyXG5cdFx0bGV0IHdpa2lFbWJlZHMgPSB0aGlzLmxoLmdldEFsbFdpa2lFbWJlZHMoKTtcclxuXHJcblx0XHRsZXQgdGV4dCA9IFwiXCI7XHJcblxyXG5cdFx0bGV0IGJhZExpbmtzQ291bnQgPSBPYmplY3Qua2V5cyhiYWRMaW5rcykubGVuZ3RoO1xyXG5cdFx0bGV0IGJhZEVtYmVkc0NvdW50ID0gT2JqZWN0LmtleXMoYmFkRW1iZWRzKS5sZW5ndGg7XHJcblx0XHRsZXQgYmFkU2VjdGlvbkxpbmtzQ291bnQgPSBPYmplY3Qua2V5cyhiYWRTZWN0aW9uTGlua3MpLmxlbmd0aDtcclxuXHRcdGxldCB3aWtpTGlua3NDb3VudCA9IE9iamVjdC5rZXlzKHdpa2lMaW5rcykubGVuZ3RoO1xyXG5cdFx0bGV0IHdpa2lFbWJlZHNDb3VudCA9IE9iamVjdC5rZXlzKHdpa2lFbWJlZHMpLmxlbmd0aDtcclxuXHJcblx0XHRpZiAoYmFkTGlua3NDb3VudCA+IDApIHtcclxuXHRcdFx0dGV4dCArPSBcIiMgQmFkIGxpbmtzIChcIiArIGJhZExpbmtzQ291bnQgKyBcIiBmaWxlcylcXG5cIjtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBpbiBiYWRMaW5rcykge1xyXG5cdFx0XHRcdHRleHQgKz0gXCJbXCIgKyBub3RlICsgXCJdKFwiICsgVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobm90ZSkgKyBcIik6IFwiICsgXCJcXG5cIlxyXG5cdFx0XHRcdGZvciAobGV0IGxpbmsgb2YgYmFkTGlua3Nbbm90ZV0pIHtcclxuXHRcdFx0XHRcdHRleHQgKz0gXCItIChsaW5lIFwiICsgbGluay5wb3NpdGlvbi5zdGFydC5saW5lICsgXCIpOiBgXCIgKyBsaW5rLmxpbmsgKyBcImBcXG5cIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGV4dCArPSBcIlxcblxcblwiXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRleHQgKz0gXCIjIEJhZCBsaW5rcyBcXG5cIjtcclxuXHRcdFx0dGV4dCArPSBcIk5vIHByb2JsZW1zIGZvdW5kXFxuXFxuXCJcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0aWYgKGJhZFNlY3Rpb25MaW5rc0NvdW50ID4gMCkge1xyXG5cdFx0XHR0ZXh0ICs9IFwiXFxuXFxuIyBCYWQgbm90ZSBsaW5rIHNlY3Rpb25zIChcIiArIGJhZFNlY3Rpb25MaW5rc0NvdW50ICsgXCIgZmlsZXMpXFxuXCI7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgaW4gYmFkU2VjdGlvbkxpbmtzKSB7XHJcblx0XHRcdFx0dGV4dCArPSBcIltcIiArIG5vdGUgKyBcIl0oXCIgKyBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhub3RlKSArIFwiKTogXCIgKyBcIlxcblwiXHJcblx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBiYWRTZWN0aW9uTGlua3Nbbm90ZV0pIHtcclxuXHRcdFx0XHRcdGxldCBsaSA9IHRoaXMubGguc3BsaXRMaW5rVG9QYXRoQW5kU2VjdGlvbihsaW5rLmxpbmspO1xyXG5cdFx0XHRcdFx0bGV0IHNlY3Rpb24gPSBVdGlscy5ub3JtYWxpemVMaW5rU2VjdGlvbihsaS5zZWN0aW9uKTtcclxuXHRcdFx0XHRcdHRleHQgKz0gXCItIChsaW5lIFwiICsgbGluay5wb3NpdGlvbi5zdGFydC5saW5lICsgXCIpOiBgXCIgKyBsaS5saW5rICsgXCIjXCIgKyBzZWN0aW9uICsgXCJgXFxuXCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRleHQgKz0gXCJcXG5cXG5cIlxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0ZXh0ICs9IFwiXFxuXFxuIyBCYWQgbm90ZSBsaW5rIHNlY3Rpb25zXFxuXCJcclxuXHRcdFx0dGV4dCArPSBcIk5vIHByb2JsZW1zIGZvdW5kXFxuXFxuXCJcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0aWYgKGJhZEVtYmVkc0NvdW50ID4gMCkge1xyXG5cdFx0XHR0ZXh0ICs9IFwiXFxuXFxuIyBCYWQgZW1iZWRzIChcIiArIGJhZEVtYmVkc0NvdW50ICsgXCIgZmlsZXMpXFxuXCI7XHJcblx0XHRcdGZvciAobGV0IG5vdGUgaW4gYmFkRW1iZWRzKSB7XHJcblx0XHRcdFx0dGV4dCArPSBcIltcIiArIG5vdGUgKyBcIl0oXCIgKyBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhub3RlKSArIFwiKTogXCIgKyBcIlxcblwiXHJcblx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiBiYWRFbWJlZHNbbm90ZV0pIHtcclxuXHRcdFx0XHRcdHRleHQgKz0gXCItIChsaW5lIFwiICsgbGluay5wb3NpdGlvbi5zdGFydC5saW5lICsgXCIpOiBgXCIgKyBsaW5rLmxpbmsgKyBcImBcXG5cIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGV4dCArPSBcIlxcblxcblwiXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRleHQgKz0gXCJcXG5cXG4jIEJhZCBlbWJlZHMgXFxuXCI7XHJcblx0XHRcdHRleHQgKz0gXCJObyBwcm9ibGVtcyBmb3VuZFxcblxcblwiXHJcblx0XHR9XHJcblxyXG5cclxuXHRcdGlmICh3aWtpTGlua3NDb3VudCA+IDApIHtcclxuXHRcdFx0dGV4dCArPSBcIiMgV2lraSBsaW5rcyAoXCIgKyB3aWtpTGlua3NDb3VudCArIFwiIGZpbGVzKVxcblwiO1xyXG5cdFx0XHRmb3IgKGxldCBub3RlIGluIHdpa2lMaW5rcykge1xyXG5cdFx0XHRcdHRleHQgKz0gXCJbXCIgKyBub3RlICsgXCJdKFwiICsgVXRpbHMubm9ybWFsaXplUGF0aEZvckxpbmsobm90ZSkgKyBcIik6IFwiICsgXCJcXG5cIlxyXG5cdFx0XHRcdGZvciAobGV0IGxpbmsgb2Ygd2lraUxpbmtzW25vdGVdKSB7XHJcblx0XHRcdFx0XHR0ZXh0ICs9IFwiLSAobGluZSBcIiArIGxpbmsucG9zaXRpb24uc3RhcnQubGluZSArIFwiKTogYFwiICsgbGluay5vcmlnaW5hbCArIFwiYFxcblwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0ZXh0ICs9IFwiXFxuXFxuXCJcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGV4dCArPSBcIiMgV2lraSBsaW5rcyBcXG5cIjtcclxuXHRcdFx0dGV4dCArPSBcIk5vIHByb2JsZW1zIGZvdW5kXFxuXFxuXCJcclxuXHRcdH1cclxuXHJcblx0XHRpZiAod2lraUVtYmVkc0NvdW50ID4gMCkge1xyXG5cdFx0XHR0ZXh0ICs9IFwiXFxuXFxuIyBXaWtpIGVtYmVkcyAoXCIgKyB3aWtpRW1iZWRzQ291bnQgKyBcIiBmaWxlcylcXG5cIjtcclxuXHRcdFx0Zm9yIChsZXQgbm90ZSBpbiB3aWtpRW1iZWRzKSB7XHJcblx0XHRcdFx0dGV4dCArPSBcIltcIiArIG5vdGUgKyBcIl0oXCIgKyBVdGlscy5ub3JtYWxpemVQYXRoRm9yTGluayhub3RlKSArIFwiKTogXCIgKyBcIlxcblwiXHJcblx0XHRcdFx0Zm9yIChsZXQgbGluayBvZiB3aWtpRW1iZWRzW25vdGVdKSB7XHJcblx0XHRcdFx0XHR0ZXh0ICs9IFwiLSAobGluZSBcIiArIGxpbmsucG9zaXRpb24uc3RhcnQubGluZSArIFwiKTogYFwiICsgbGluay5vcmlnaW5hbCArIFwiYFxcblwiO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0ZXh0ICs9IFwiXFxuXFxuXCJcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGV4dCArPSBcIlxcblxcbiMgV2lraSBlbWJlZHMgXFxuXCI7XHJcblx0XHRcdHRleHQgKz0gXCJObyBwcm9ibGVtcyBmb3VuZFxcblxcblwiXHJcblx0XHR9XHJcblxyXG5cclxuXHJcblx0XHRsZXQgbm90ZVBhdGggPSB0aGlzLnNldHRpbmdzLmNvbnNpc3RlbnRSZXBvcnRGaWxlO1xyXG5cdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci53cml0ZShub3RlUGF0aCwgdGV4dCk7XHJcblxyXG5cdFx0bGV0IGZpbGVPcGVuZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMuYXBwLndvcmtzcGFjZS5pdGVyYXRlQWxsTGVhdmVzKGxlYWYgPT4ge1xyXG5cdFx0XHRpZiAobGVhZi5nZXREaXNwbGF5VGV4dCgpICE9IFwiXCIgJiYgbm90ZVBhdGguc3RhcnRzV2l0aChsZWFmLmdldERpc3BsYXlUZXh0KCkpKSB7XHJcblx0XHRcdFx0ZmlsZU9wZW5lZCA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdGlmICghZmlsZU9wZW5lZClcclxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9wZW5MaW5rVGV4dChub3RlUGF0aCwgXCIvXCIsIGZhbHNlKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIHJlb3JnYW5pemVWYXVsdCgpIHtcclxuXHRcdGF3YWl0IHRoaXMucmVwbGFjZUFsbFdpa2lsaW5rc1dpdGhNYXJrZG93bkxpbmtzKClcclxuXHRcdGF3YWl0IHRoaXMuY29udmVydEFsbEVtYmVkc1BhdGhzVG9SZWxhdGl2ZSgpXHJcblx0XHRhd2FpdCB0aGlzLmNvbnZlcnRBbGxMaW5rUGF0aHNUb1JlbGF0aXZlKClcclxuXHRcdC8vLSBSZW5hbWUgYWxsIGF0dGFjaG1lbnRzICh1c2luZyBVbmlxdWUgYXR0YWNobWVudHMsIG9wdGlvbmFsKVxyXG5cdFx0YXdhaXQgdGhpcy5jb2xsZWN0QWxsQXR0YWNobWVudHMoKVxyXG5cdFx0YXdhaXQgdGhpcy5kZWxldGVFbXB0eUZvbGRlcnMoKVxyXG5cdFx0bmV3IE5vdGljZShcIlJlb3JnYW5pemF0aW9uIG9mIHRoZSB2YXVsdCBjb21wbGV0ZWRcIik7XHJcblx0fVxyXG5cclxuXHJcblx0YXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XHJcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xyXG5cclxuXHRcdHRoaXMubGggPSBuZXcgTGlua3NIYW5kbGVyKFxyXG5cdFx0XHR0aGlzLmFwcCxcclxuXHRcdFx0XCJDb25zaXN0ZW50IGF0dGFjaG1lbnRzIGFuZCBsaW5rczogXCIsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRm9sZGVycyxcclxuXHRcdFx0dGhpcy5zZXR0aW5ncy5pZ25vcmVGaWxlc1xyXG5cdFx0KTtcclxuXHJcblx0XHR0aGlzLmZoID0gbmV3IEZpbGVzSGFuZGxlcihcclxuXHRcdFx0dGhpcy5hcHAsXHJcblx0XHRcdHRoaXMubGgsXHJcblx0XHRcdFwiQ29uc2lzdGVudCBhdHRhY2htZW50cyBhbmQgbGlua3M6IFwiLFxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmlnbm9yZUZvbGRlcnMsXHJcblx0XHRcdHRoaXMuc2V0dGluZ3MuaWdub3JlRmlsZXNcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcblxyXG5cclxuXHJcbiJdLCJuYW1lcyI6WyJQbHVnaW5TZXR0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
