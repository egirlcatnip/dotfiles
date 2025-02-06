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
exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
let includeExtensions = [];
let excludeFolders = [];
let unableToFormat = [];
function activate(context) {
    const config = vscode.workspace.getConfiguration('formatAll');
    includeExtensions = config.get('includeFileExtensions', []);
    excludeFolders = config.get('excludeFolders', []);
    let disposable = vscode.commands.registerCommand('formatallfilesinworkspace.formatAll', () => __awaiter(this, void 0, void 0, function* () {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            return;
        }
        for (const folder of folders) {
            yield formatAll(folder.uri);
        }
        vscode.window.showInformationMessage('Finished formatting all.');
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function formatAll(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield vscode.workspace.fs.stat(uri);
        if (((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) && !excludeFolders.includes(path.basename(uri.fsPath))) {
            const files = yield vscode.workspace.fs.readDirectory(uri);
            for (const file of files) {
                yield formatAll(vscode.Uri.joinPath(uri, file[0]));
            }
        }
        else if (((stat.type & vscode.FileType.File) === vscode.FileType.File) && includeExtensions.includes(path.extname(uri.fsPath))) {
            try {
                yield vscode.window.showTextDocument(uri);
                yield vscode.commands.executeCommand('editor.action.formatDocument');
            }
            catch (e) {
                unableToFormat.push(uri.fsPath);
            }
        }
    });
}
//# sourceMappingURL=extension.js.map