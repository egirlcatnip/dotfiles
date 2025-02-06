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
exports.clearScope = exports.scopeToThis = exports.initContext = void 0;
const vscode = require("vscode");
const KEY_CURRENT_SCOPE = 'scopeToThis.currentScope';
const CONTEXT_IS_SCOPED = 'scopeToThis.scoped';
const workspaceFolders = vscode.workspace.workspaceFolders;
let vscodeContext = null;
function initContext(context) {
    vscodeContext = context;
    const scope = vscodeContext === null || vscodeContext === void 0 ? void 0 : vscodeContext.workspaceState.get(KEY_CURRENT_SCOPE, undefined);
    if (scope) {
        vscode.commands.executeCommand('setContext', CONTEXT_IS_SCOPED, true);
    }
}
exports.initContext = initContext;
function scopeToThis(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const relative = getRelativePath(path);
            const excludes = getExcludes();
            if (excludes && relative) {
                const paths = createExcludeList(relative);
                paths.forEach(path => excludes[path] = true);
                yield updateExcludes(excludes);
                vscodeContext === null || vscodeContext === void 0 ? void 0 : vscodeContext.workspaceState.update(KEY_CURRENT_SCOPE, relative);
                vscode.commands.executeCommand('setContext', CONTEXT_IS_SCOPED, true);
            }
            else {
                vscode.window.showErrorMessage("Error in reading vscode settings.");
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(error.message || error);
        }
    });
}
exports.scopeToThis = scopeToThis;
function clearScope() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const scope = vscodeContext === null || vscodeContext === void 0 ? void 0 : vscodeContext.workspaceState.get(KEY_CURRENT_SCOPE, undefined);
            if (scope) {
                const excludes = getExcludes();
                if (excludes) {
                    const paths = createExcludeList(scope);
                    paths.forEach(path => {
                        if (path && excludes.hasOwnProperty(path)) {
                            excludes[path] = undefined;
                        }
                    });
                    yield updateExcludes(excludes);
                    vscodeContext === null || vscodeContext === void 0 ? void 0 : vscodeContext.workspaceState.update(KEY_CURRENT_SCOPE, undefined);
                    vscode.commands.executeCommand('setContext', CONTEXT_IS_SCOPED, false);
                }
                else {
                    vscode.window.showErrorMessage("Error in reading vscode settings.");
                }
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(error.message || error);
        }
    });
}
exports.clearScope = clearScope;
function getRelativePath(path) {
    if (!workspaceFolders || !workspaceFolders.length) {
        return;
    }
    for (const workspace of workspaceFolders) {
        if (path.fsPath.startsWith(workspace.uri.fsPath)) {
            const relative = path.path.substring(workspace.uri.path.length);
            return relative.startsWith('/') ? relative.substring(1) : relative;
        }
    }
}
function createExcludeList(path) {
    const excludes = [];
    const dirs = path.split('/');
    dirs.forEach((dir, dirI) => {
        const dirsSoFar = dirs.slice(0, dirI).join('/') + (dirI > 0 ? '/' : '');
        for (let i = 0; i < dir.length; i++) {
            excludes.push(`${dirsSoFar}${dir.slice(0, i)}[!${dir[i]}]*/**`);
        }
    });
    return excludes;
}
function getExcludes() {
    if (!workspaceFolders || !workspaceFolders.length) {
        return;
    }
    try {
        const config = vscode.workspace.getConfiguration('files', null);
        return config.get('exclude', {});
    }
    catch (error) {
        vscode.window.showErrorMessage(error.message || error);
    }
}
function updateExcludes(excludes) {
    return __awaiter(this, void 0, void 0, function* () {
        if (workspaceFolders && workspaceFolders.length > 0) {
            try {
                const config = vscode.workspace.getConfiguration('files', null);
                const target = vscode.ConfigurationTarget.Workspace || null;
                return yield config.update('exclude', excludes, target);
            }
            catch (error) {
                vscode.window.showErrorMessage(error.message || error);
            }
        }
    });
}
//# sourceMappingURL=utils.js.map