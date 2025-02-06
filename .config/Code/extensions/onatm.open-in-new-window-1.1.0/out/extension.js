"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    const openCommand = 'open-in-new-window.open';
    let openCommandHandler = vscode.commands.registerCommand(openCommand, (uri) => {
        if (!uri) {
            vscode.window.showWarningMessage('The intended usage is from the explorer context menu.');
            return;
        }
        const showNotification = vscode.workspace.getConfiguration("open-in-new-window").get("showNotification");
        if (showNotification) {
            vscode.window.showInformationMessage(`Opening ${uri.path} in new window!`);
        }
        vscode.commands.executeCommand('vscode.openFolder', uri, true);
    });
    context.subscriptions.push(openCommandHandler);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map