"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const url_1 = require("url");
const path_1 = require("path");
let terminal;
let extensionUri;
function runExe(fileUri) {
    var _a, _b;
    if (!fileUri) {
        const tabInput = (_a = vscode.window.tabGroups.activeTabGroup.activeTab) === null || _a === void 0 ? void 0 : _a.input;
        if (tabInput instanceof vscode.TabInputText ||
            tabInput instanceof vscode.TabInputCustom) {
            fileUri = tabInput.uri;
        }
    }
    if (!fileUri || fileUri.scheme !== 'file') {
        vscode.window.showErrorMessage('Selected file is an invalid local file.');
        return;
    }
    const config = vscode.workspace.getConfiguration('exeRunner'), filePath = (0, url_1.fileURLToPath)(fileUri.toString()), isWin = process.platform === 'win32';
    terminal = terminal !== null && terminal !== void 0 ? terminal : vscode.window.createTerminal({
        name: 'exe Runner',
        iconPath: {
            light: vscode.Uri.joinPath(extensionUri, 'media', 'light.svg'),
            dark: vscode.Uri.joinPath(extensionUri, 'media', 'dark.svg')
        }
    });
    if (config.get('clearTerminal')) {
        terminal.sendText(isWin ? 'cls' : 'clear');
    }
    terminal.show();
    let command = '';
    if (config.get('runInFileDirectory')) {
        const directory = (0, path_1.dirname)(filePath);
        command += `cd "${directory}" && `;
    }
    const shellPath = (_b = terminal.creationOptions.shellPath) !== null && _b !== void 0 ? _b : vscode.env.shell;
    if (isWin && (shellPath.endsWith('powershell.exe') || shellPath.endsWith('pwsh.exe'))) {
        command += '& ';
    }
    else if (!isWin) {
        command += config.get('compatibilityLayer') + ' ';
    }
    terminal.sendText(`${command}"${filePath}"`);
    vscode.window.onDidCloseTerminal(closedTerminal => {
        if (closedTerminal === terminal) {
            terminal = undefined;
        }
    });
}
function activate(context) {
    terminal = vscode.window.terminals.find(term => term.name === 'exe Runner');
    extensionUri = context.extensionUri;
    context.subscriptions.push(vscode.commands.registerCommand('exe-runner.run', runExe));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map