"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.config = exports.ConfigItem = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const OS = require("os");
const OSPath = require("path");
const rust_1 = require("./rust");
const path_1 = require("./path");
const filter_1 = require("./filter");
const fileitem_1 = require("./fileitem");
const action_1 = require("./action");
var ConfigItem;
(function (ConfigItem) {
    ConfigItem["RemoveIgnoredFiles"] = "removeIgnoredFiles";
    ConfigItem["HideDotfiles"] = "hideDotfiles";
    ConfigItem["HideIgnoreFiles"] = "hideIgnoredFiles";
    ConfigItem["IgnoreFileTypes"] = "ignoreFileTypes";
    ConfigItem["LabelIgnoredFiles"] = "labelIgnoredFiles";
})(ConfigItem = exports.ConfigItem || (exports.ConfigItem = {}));
function config(item) {
    return vscode.workspace.getConfiguration("file-browser").get(item);
}
exports.config = config;
let active = rust_1.None;
function setContext(state) {
    vscode.commands.executeCommand("setContext", "inFileBrowser", state);
}
class FileBrowser {
    constructor(path, file) {
        this.items = [];
        this.inActions = false;
        this.keepAlive = false;
        this.actionsButton = {
            iconPath: new vscode_1.ThemeIcon("ellipsis"),
            tooltip: "Actions on selected file",
        };
        this.stepOutButton = {
            iconPath: new vscode_1.ThemeIcon("arrow-left"),
            tooltip: "Step out of folder",
        };
        this.stepInButton = {
            iconPath: new vscode_1.ThemeIcon("arrow-right"),
            tooltip: "Step into folder",
        };
        this.path = path;
        this.file = file;
        this.pathHistory = { [this.path.id]: this.file };
        this.current = vscode.window.createQuickPick();
        this.current.buttons = [this.actionsButton, this.stepOutButton, this.stepInButton];
        this.current.placeholder = "Preparing the file list...";
        this.current.onDidHide(() => {
            if (!this.keepAlive) {
                this.dispose();
            }
        });
        this.current.onDidAccept(this.onDidAccept.bind(this));
        this.current.onDidChangeValue(this.onDidChangeValue.bind(this));
        this.current.onDidTriggerButton(this.onDidTriggerButton.bind(this));
        this.update().then(() => {
            this.current.placeholder = "Type a file name here to search or open a new file";
            this.current.busy = false;
        });
    }
    dispose() {
        setContext(false);
        this.current.dispose();
        active = rust_1.None;
    }
    hide() {
        this.current.hide();
        setContext(false);
    }
    show() {
        setContext(true);
        this.current.show();
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: temporary and UGLY fix of https://github.com/bodil/vscode-file-browser/issues/35.
            // Brought in from here https://github.com/atariq11700/vscode-file-browser/commit/a2525d01f262f17dac2c478e56640c9ce1f65713.
            // this.current.enabled = false;
            this.current.show();
            this.current.busy = true;
            this.current.title = this.path.fsPath;
            this.current.value = "";
            const stat = (yield rust_1.Result.try(vscode.workspace.fs.stat(this.path.uri))).unwrap();
            if (stat && this.inActions && (stat.type & vscode_1.FileType.File) === vscode_1.FileType.File) {
                this.items = [
                    (0, action_1.action)("$(file) Open this file", action_1.Action.OpenFile),
                    (0, action_1.action)("$(split-horizontal) Open this file to the side", action_1.Action.OpenFileBeside),
                    (0, action_1.action)("$(edit) Rename this file", action_1.Action.RenameFile),
                    (0, action_1.action)("$(trash) Delete this file", action_1.Action.DeleteFile),
                ];
                this.current.items = this.items;
            }
            else if (stat &&
                this.inActions &&
                (stat.type & vscode_1.FileType.Directory) === vscode_1.FileType.Directory) {
                this.items = [
                    (0, action_1.action)("$(folder-opened) Open this folder", action_1.Action.OpenFolder),
                    (0, action_1.action)("$(folder-opened) Open this folder in a new window", action_1.Action.OpenFolderInNewWindow),
                    (0, action_1.action)("$(edit) Rename this folder", action_1.Action.RenameFile),
                    (0, action_1.action)("$(trash) Delete this folder", action_1.Action.DeleteFile),
                ];
                this.current.items = this.items;
            }
            else if (stat && (stat.type & vscode_1.FileType.Directory) === vscode_1.FileType.Directory) {
                const records = yield vscode.workspace.fs.readDirectory(this.path.uri);
                records.sort(fileitem_1.fileRecordCompare);
                let items = records.map((entry) => new fileitem_1.FileItem(entry));
                if (config(ConfigItem.HideIgnoreFiles)) {
                    const rules = yield filter_1.Rules.forPath(this.path);
                    items = rules.filter(this.path, items);
                }
                if (config(ConfigItem.RemoveIgnoredFiles)) {
                    items = items.filter((item) => item.alwaysShow);
                }
                this.items = items;
                this.current.items = items;
                this.current.activeItems = items.filter((item) => this.file.contains(item.name));
            }
            else {
                this.items = [(0, action_1.action)("$(new-folder) Create this folder", action_1.Action.NewFolder)];
                this.current.items = this.items;
            }
            this.current.enabled = true;
        });
    }
    onDidChangeValue(value, isAutoComplete = false) {
        if (this.inActions) {
            return;
        }
        if (!isAutoComplete) {
            this.autoCompletion = undefined;
        }
        const existingItem = this.items.find((item) => item.name === value);
        if (value === "") {
            this.current.items = this.items;
            this.current.activeItems = [];
        }
        else if (existingItem !== undefined) {
            this.current.items = this.items;
            this.current.activeItems = [existingItem];
        }
        else {
            (0, path_1.endsWithPathSeparator)(value).match((path) => {
                if (path === "~") {
                    this.stepIntoFolder(path_1.Path.fromFilePath(OS.homedir()));
                }
                else if (path === "..") {
                    this.stepOut();
                }
                else {
                    this.stepIntoFolder(this.path.append(path));
                }
            }, () => {
                const newItem = {
                    label: `$(new-file) ${value}`,
                    name: value,
                    description: "Open as new file",
                    alwaysShow: true,
                    action: action_1.Action.NewFile,
                };
                this.current.items = [newItem, ...this.items];
                this.current.activeItems = [newItem];
            });
        }
    }
    onDidTriggerButton(button) {
        if (button === this.stepInButton) {
            this.stepIn();
        }
        else if (button === this.stepOutButton) {
            this.stepOut();
        }
        else if (button === this.actionsButton) {
            this.actions();
        }
    }
    activeItem() {
        return new rust_1.Option(this.current.activeItems[0]);
    }
    stepIntoFolder(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.path.equals(folder)) {
                this.path = folder;
                this.file = this.pathHistory[this.path.id] || rust_1.None;
                yield this.update();
            }
        });
    }
    stepIn() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeItem().ifSome((item) => __awaiter(this, void 0, void 0, function* () {
                if (item.action !== undefined) {
                    this.runAction(item);
                }
                else if (item.fileType !== undefined) {
                    if ((item.fileType & vscode_1.FileType.Directory) === vscode_1.FileType.Directory) {
                        yield this.stepIntoFolder(this.path.append(item.name));
                    }
                    else if ((item.fileType & vscode_1.FileType.File) === vscode_1.FileType.File) {
                        this.path.push(item.name);
                        this.file = rust_1.None;
                        this.inActions = true;
                        yield this.update();
                    }
                }
            }));
        });
    }
    stepOut() {
        return __awaiter(this, void 0, void 0, function* () {
            this.inActions = false;
            if (!this.path.atTop()) {
                this.pathHistory[this.path.id] = this.activeItem().map((item) => item.name);
                this.file = this.path.pop();
                yield this.update();
            }
        });
    }
    actions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inActions) {
                return;
            }
            yield this.activeItem().match((item) => __awaiter(this, void 0, void 0, function* () {
                this.inActions = true;
                this.path.push(item.name);
                this.file = rust_1.None;
                yield this.update();
            }), () => __awaiter(this, void 0, void 0, function* () {
                this.inActions = true;
                this.file = rust_1.None;
                yield this.update();
            }));
        });
    }
    tabCompletion(tabNext) {
        if (this.inActions) {
            return;
        }
        if (this.autoCompletion) {
            const length = this.autoCompletion.items.length;
            const step = tabNext ? 1 : -1;
            this.autoCompletion.index = (this.autoCompletion.index + length + step) % length;
        }
        else {
            const items = this.items.filter((i) => i.name.toLowerCase().startsWith(this.current.value.toLowerCase()));
            this.autoCompletion = {
                index: tabNext ? 0 : items.length - 1,
                items,
            };
        }
        const newIndex = this.autoCompletion.index;
        const length = this.autoCompletion.items.length;
        if (newIndex < length) {
            // This also checks out when items is empty
            const item = this.autoCompletion.items[newIndex];
            this.current.value = item.name;
            if (length === 1 && item.fileType === vscode_1.FileType.Directory) {
                this.current.value += "/";
            }
            this.onDidChangeValue(this.current.value, true);
        }
    }
    onDidAccept() {
        this.autoCompletion = undefined;
        this.activeItem().ifSome((item) => {
            if (item.action !== undefined) {
                this.runAction(item);
            }
            else if (item.fileType !== undefined &&
                (item.fileType & vscode_1.FileType.Directory) === vscode_1.FileType.Directory) {
                this.stepIn();
            }
            else {
                this.openFile(this.path.append(item.name).uri);
            }
        });
    }
    openFile(uri, column = vscode_1.ViewColumn.Active) {
        this.dispose();
        vscode.workspace
            .openTextDocument(uri)
            .then((doc) => vscode.window.showTextDocument(doc, column));
    }
    rename() {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = this.path.uri;
            const stat = yield vscode.workspace.fs.stat(uri);
            const isDir = (stat.type & vscode_1.FileType.Directory) === vscode_1.FileType.Directory;
            const fileName = this.path.pop().unwrapOrElse(() => {
                throw new Error("Can't rename an empty file name!");
            });
            const fileType = isDir ? "folder" : "file";
            const workspaceFolder = this.path.getWorkspaceFolder().map((wsf) => wsf.uri);
            const relPath = workspaceFolder
                .andThen((workspaceFolder) => new path_1.Path(uri).relativeTo(workspaceFolder))
                .unwrapOr(fileName);
            const extension = OSPath.extname(relPath);
            const startSelection = relPath.length - fileName.length;
            const endSelection = startSelection + (fileName.length - extension.length);
            const result = yield vscode.window.showInputBox({
                prompt: `Enter the new ${fileType} name`,
                value: relPath,
                valueSelection: [startSelection, endSelection],
            });
            this.file = (0, rust_1.Some)(fileName);
            if (result !== undefined) {
                const newUri = workspaceFolder.match((workspaceFolder) => vscode_1.Uri.joinPath(workspaceFolder, result), () => vscode_1.Uri.joinPath(this.path.uri, result));
                if ((yield rust_1.Result.try(vscode.workspace.fs.rename(uri, newUri))).isOk()) {
                    this.file = (0, rust_1.Some)(OSPath.basename(result));
                }
                else {
                    vscode.window.showErrorMessage(`Failed to rename ${fileType} "${fileName}"`);
                }
            }
        });
    }
    runAction(item) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (item.action) {
                case action_1.Action.NewFolder: {
                    yield vscode.workspace.fs.createDirectory(this.path.uri);
                    yield this.update();
                    break;
                }
                case action_1.Action.NewFile: {
                    const uri = this.path.append(item.name).uri;
                    this.openFile(uri.with({ scheme: "untitled" }));
                    break;
                }
                case action_1.Action.OpenFile: {
                    const path = this.path.clone();
                    if (item.name && item.name.length > 0) {
                        path.push(item.name);
                    }
                    this.openFile(path.uri);
                    break;
                }
                case action_1.Action.OpenFileBeside: {
                    const path = this.path.clone();
                    if (item.name && item.name.length > 0) {
                        path.push(item.name);
                    }
                    this.openFile(path.uri, vscode_1.ViewColumn.Beside);
                    break;
                }
                case action_1.Action.RenameFile: {
                    this.keepAlive = true;
                    this.hide();
                    yield this.rename();
                    this.show();
                    this.keepAlive = false;
                    this.inActions = false;
                    this.update();
                    break;
                }
                case action_1.Action.DeleteFile: {
                    this.keepAlive = true;
                    this.hide();
                    const uri = this.path.uri;
                    const stat = yield vscode.workspace.fs.stat(uri);
                    const isDir = (stat.type & vscode_1.FileType.Directory) === vscode_1.FileType.Directory;
                    const fileName = this.path.pop().unwrapOrElse(() => {
                        throw new Error("Can't delete an empty file name!");
                    });
                    const fileType = isDir ? "folder" : "file";
                    const goAhead = `$(trash) Delete the ${fileType} "${fileName}"`;
                    const result = yield vscode.window.showQuickPick(["$(close) Cancel", goAhead], {});
                    if (result === goAhead) {
                        const delOp = yield rust_1.Result.try(vscode.workspace.fs.delete(uri, { recursive: isDir }));
                        if (delOp.isErr()) {
                            vscode.window.showErrorMessage(`Failed to delete ${fileType} "${fileName}"`);
                        }
                    }
                    this.show();
                    this.keepAlive = false;
                    this.inActions = false;
                    this.update();
                    break;
                }
                case action_1.Action.OpenFolder: {
                    vscode.commands.executeCommand("vscode.openFolder", this.path.uri);
                    break;
                }
                case action_1.Action.OpenFolderInNewWindow: {
                    vscode.commands.executeCommand("vscode.openFolder", this.path.uri, true);
                    break;
                }
                default:
                    throw new Error(`Unhandled action ${item.action}`);
            }
        });
    }
}
function activate(context) {
    setContext(false);
    context.subscriptions.push(vscode.commands.registerCommand("file-browser.open", () => {
        var _a;
        const document = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
        let workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
        let path = new path_1.Path((workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri) || vscode_1.Uri.file(OS.homedir()));
        let file = rust_1.None;
        if (document && !document.isUntitled) {
            path = new path_1.Path(document.uri);
            file = path.pop();
        }
        active = (0, rust_1.Some)(new FileBrowser(path, file));
        setContext(true);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("file-browser.rename", () => active.orElse(() => {
        var _a;
        const document = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
        let workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
        let path = new path_1.Path((document === null || document === void 0 ? void 0 : document.uri) || (workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri) || vscode_1.Uri.file(OS.homedir()));
        active = (0, rust_1.Some)(new FileBrowser(path, rust_1.None));
        setContext(true);
        return active;
    }).ifSome((active) => active.rename())));
    context.subscriptions.push(vscode.commands.registerCommand("file-browser.stepIn", () => active.ifSome((active) => active.stepIn())));
    context.subscriptions.push(vscode.commands.registerCommand("file-browser.stepOut", () => active.ifSome((active) => active.stepOut())));
    context.subscriptions.push(vscode.commands.registerCommand("file-browser.actions", () => active.ifSome((active) => active.actions())));
    context.subscriptions.push(vscode.commands.registerCommand("file-browser.tabNext", () => active.ifSome((active) => active.tabCompletion(true))));
    context.subscriptions.push(vscode.commands.registerCommand("file-browser.tabPrev", () => active.ifSome((active) => active.tabCompletion(false))));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map