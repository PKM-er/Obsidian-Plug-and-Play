/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TrashExplorerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/models.ts
var import_obsidian = require("obsidian");

// src/path.ts
var nodePath = __toESM(require("path"));
function basename2(path) {
  var _a;
  if (typeof (nodePath == null ? void 0 : nodePath.basename) === "function") {
    return nodePath.basename(path);
  }
  return ((_a = path.match(/([^/]+)\/?$/)) == null ? void 0 : _a.at(1)) || path;
}
function dirname2(path) {
  var _a;
  if (typeof (nodePath == null ? void 0 : nodePath.dirname) === "function") {
    return nodePath.dirname(path);
  }
  return ((_a = path.match(/^(.+)\/.+/)) == null ? void 0 : _a.at(1)) || ".";
}

// src/models.ts
var TRASH_ROOT = (0, import_obsidian.normalizePath)(".trash");
var TrashRoot = class {
  constructor(vault) {
    this.vault = vault;
    this.items = [];
    this.collator = new Intl.Collator(void 0, {
      sensitivity: "base"
    });
    this.compareName = (a, b) => this.collator.compare(a, b);
  }
  async refresh() {
    if (await this.vault.adapter.exists(TRASH_ROOT)) {
      const trashedFiles = await this.vault.adapter.list(TRASH_ROOT);
      this.items = await this.buildItems(trashedFiles);
    } else {
      this.items = [];
    }
  }
  async empty() {
    if (await this.vault.adapter.exists(TRASH_ROOT)) {
      await this.vault.adapter.rmdir(TRASH_ROOT, true);
    }
    this.items = [];
  }
  async buildItems(trashedFiles) {
    const items = [];
    for (const path of trashedFiles.folders.sort(this.compareName)) {
      const files = await this.vault.adapter.list(path);
      const children = await this.buildItems(files);
      const trashedFolder = new TrashedFolder(this.vault, path, children);
      items.push(trashedFolder);
    }
    for (const path of trashedFiles.files.sort(this.compareName)) {
      const trashedFile = new TrashedFile(this.vault, path);
      items.push(trashedFile);
    }
    return items;
  }
};
var TrashedBase = class {
  constructor(vault, path) {
    this.vault = vault;
    this.path = (0, import_obsidian.normalizePath)(path);
    this.basename = basename2(this.path);
  }
  async restore() {
    const restorePath = (0, import_obsidian.normalizePath)(this.path.replace(`${TRASH_ROOT}/`, ""));
    if (await this.vault.adapter.exists(restorePath)) {
      return false;
    }
    const restoreParentDir = dirname2(restorePath);
    if (!await this.vault.adapter.exists(restoreParentDir)) {
      await this.vault.adapter.mkdir(restoreParentDir);
    }
    await this.vault.adapter.rename(this.path, restorePath);
    return true;
  }
};
var TrashedFile = class extends TrashedBase {
  constructor() {
    super(...arguments);
    this.kind = "file";
  }
  async remove() {
    await this.vault.adapter.remove(this.path);
  }
};
var TrashedFolder = class extends TrashedBase {
  constructor(vault, path, children) {
    super(vault, path);
    this.children = children;
    this.kind = "folder";
  }
  async remove() {
    await this.vault.adapter.rmdir(this.path, true);
  }
};

// src/view.ts
var import_obsidian2 = require("obsidian");
var VIEW_TYPE = "trash-explorer";
var TrashExplorerView = class extends import_obsidian2.ItemView {
  constructor(leaf, trash) {
    super(leaf);
    this.trash = trash;
    this.icon = "trash";
    this.navigation = false;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Trash explorer";
  }
  async onOpen() {
    await this.refresh();
  }
  async refresh() {
    const container = this.contentEl;
    container.empty();
    this.renderItems(this.trash.items, container);
  }
  async renderItems(items, container) {
    for (const item of items) {
      const itemContainer = container.createEl("div");
      this.renderItem(item, itemContainer);
      if (item.kind === "folder") {
        const nestedContainer = itemContainer.createEl("div");
        nestedContainer.style.paddingLeft = "1em";
        await this.renderItems(item.children, nestedContainer);
      }
    }
  }
  renderItem(item, container) {
    const el = container.createEl("div", {
      cls: "trash-item"
    });
    el.createEl("div", {
      cls: "trash-item__text",
      text: item.basename
    });
    const buttons = el.createEl("div", {
      cls: "trash-item__buttons"
    });
    const restoreButton = new import_obsidian2.ButtonComponent(buttons);
    restoreButton.setIcon("reset");
    restoreButton.setTooltip("Restore");
    restoreButton.onClick(async () => {
      if (await this.restoreFile(item)) {
        container.remove();
      }
    });
    const deleteButton = new import_obsidian2.ButtonComponent(buttons);
    deleteButton.setIcon("trash");
    deleteButton.setTooltip("Delete permanently");
    deleteButton.setWarning();
    deleteButton.onClick(async () => {
      if (await this.deleteFile(item)) {
        container.remove();
      }
    });
    return el;
  }
  async restoreFile(item) {
    if (await item.restore()) {
      new import_obsidian2.Notice(`Restored "${item.basename}" from trash`);
      return true;
    }
    new import_obsidian2.Notice(`Unable to restore "${item.basename}": the path already exists`, 10 * 1e3);
    return false;
  }
  async deleteFile(item) {
    const title = item.kind === "folder" ? "Delete folder" : "Delete file";
    const message = `Are you sure you want to permanently delete "${item.basename}"?`;
    return new Promise((resolve) => {
      const confirmModal = new ConfirmModal(this.app, title, message, "Delete", async () => {
        await item.remove();
        new import_obsidian2.Notice(`Permanently deleted "${item.basename}"`);
        confirmModal.close();
        resolve(true);
      });
      confirmModal.open();
    });
  }
};
var ConfirmModal = class extends import_obsidian2.Modal {
  constructor(app, title, message, submitText, onSubmit) {
    super(app);
    this.title = title;
    this.message = message;
    this.submitText = submitText;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    this.titleEl.setText(this.title);
    this.contentEl.createEl("p", {
      text: this.message
    });
    new import_obsidian2.Setting(this.contentEl).addButton((button) => button.setButtonText(this.submitText).setWarning().onClick(() => {
      this.onSubmit();
      this.close();
    })).addButton((button) => button.setButtonText("Cancel").onClick(() => {
      this.close();
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/main.ts
var TrashExplorerPlugin = class extends import_obsidian3.Plugin {
  async onload() {
    this.trash = new TrashRoot(this.app.vault);
    await this.trash.refresh();
    this.registerView(VIEW_TYPE, (leaf) => new TrashExplorerView(leaf, this.trash));
    this.addRibbonIcon("trash", "Open trash explorer", () => this.activateView());
    this.addCommand({
      id: "show-trash-explorer",
      name: "Show trash explorer",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "empty-trash",
      name: "Empty trash",
      callback: () => this.emptyTrash()
    });
    this.registerEvent(this.app.vault.on("delete", async () => {
      await this.trash.refresh();
      await this.refreshOpenLeaves();
    }));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }
  async activateView() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
    await this.app.workspace.getLeftLeaf(false).setViewState({
      type: VIEW_TYPE,
      active: true
    });
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    await this.trash.refresh();
    await leaf.view.refresh();
    this.app.workspace.revealLeaf(leaf);
  }
  async refreshOpenLeaves() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    for (const leaf of leaves) {
      if (leaf.view instanceof TrashExplorerView) {
        await leaf.view.refresh();
      }
    }
  }
  emptyTrash() {
    const title = "Empty trash";
    const message = `Are you sure you want to empty the trash? All files in the "${TRASH_ROOT}" folder will be permanently deleted!`;
    return new Promise((resolve) => {
      const confirmModal = new ConfirmModal(this.app, title, message, "Empty trash", async () => {
        await this.trash.empty();
        await this.refreshOpenLeaves();
        new import_obsidian3.Notice(`Emptied the trash`);
        confirmModal.close();
        resolve();
      });
      confirmModal.open();
    });
  }
};
