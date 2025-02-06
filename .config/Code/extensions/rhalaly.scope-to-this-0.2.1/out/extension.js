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
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const utils = require("./utils");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    utils.initContext(context);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let scope = vscode.commands.registerCommand('scope-to-this.scope', (path) => __awaiter(this, void 0, void 0, function* () {
        // The code you place here will be executed every time your command is executed
        if (!path) {
            vscode.window.showInformationMessage("Use this command from the Explorer context menu.");
            return;
        }
        yield utils.clearScope();
        yield utils.scopeToThis(path);
    }));
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let clear = vscode.commands.registerCommand('scope-to-this.clear', () => __awaiter(this, void 0, void 0, function* () {
        // The code you place here will be executed every time your command is executed
        yield utils.clearScope();
    }));
    context.subscriptions.push(scope);
    context.subscriptions.push(clear);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map