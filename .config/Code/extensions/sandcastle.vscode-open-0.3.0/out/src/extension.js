"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
var vscode = require("vscode");
var opn = require("open");
/**
 * Activates the extension.
 */
function activate(context) {
    var controller = new OpenController();
    context.subscriptions.push(controller);
}
exports.activate = activate;
/**
 * Controller for handling file opens.
 */
var OpenController = /** @class */ (function () {
    function OpenController() {
        var _a;
        var _this = this;
        var subscriptions = [];
        var disposable = vscode.commands.registerCommand('workbench.action.files.openFileWithDefaultApplication', function (uri) {
            _this.open(uri);
        });
        subscriptions.push(disposable);
        this._disposable = (_a = vscode.Disposable).from.apply(_a, subscriptions);
    }
    OpenController.prototype.dispose = function () {
        this._disposable.dispose();
    };
    OpenController.prototype.open = function (uri) {
        var _a;
        if (uri === null || uri === void 0 ? void 0 : uri.scheme) {
            console.log("Opening from uri", uri.toString());
            this.openFile(uri.toString());
            return;
        }
        var editor = vscode.window.activeTextEditor;
        if (editor === null || editor === void 0 ? void 0 : editor.document.uri) {
            console.log("Opening from editor", editor.document.uri.toString());
            this.openFile(editor.document.uri.toString());
            return;
        }
        var tab_uri = ((_a = vscode.window.tabGroups.activeTabGroup.activeTab) === null || _a === void 0 ? void 0 : _a.input).uri;
        if (tab_uri) {
            console.log("Opening from tab", tab_uri.toString());
            this.openFile(tab_uri.toString());
            return;
        }
        vscode.window.showInformationMessage('No editor is active. Select an editor or a file in the Explorer view.');
    };
    OpenController.prototype.openFile = function (uri) {
        try {
            var p = opn(decodeURIComponent(uri));
            p.then(function (p) {
                p.on("exit", function (n) {
                    if (n != 0) {
                        vscode.window.showInformationMessage("Couldn't open file.");
                    }
                });
            });
        }
        catch (error) {
            vscode.window.showInformationMessage("Couldn't open file.");
            if (error instanceof Error) {
                console.error(error.stack);
            }
        }
    };
    return OpenController;
}());
//# sourceMappingURL=extension.js.map