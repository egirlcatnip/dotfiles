"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const execute_run_command_1 = require("./vscode/execute-run-command");
/**
 * The channel we'll be writing our output to.
 */
const OUTPUT_CHANNEL_NAME = 'just';
/**
 * The command key for running a just recipe.
 *
 * This needs to match up in two places in our `package.json`.
 */
const RUN_RECIPE_COMMAND_KEY = 'just.run';
/**
 * Fires the first time our extension loads.
 *
 * @param context The vscode context.
 */
function activate(context) {
    // the output channel we'll be writing to when we run tasks
    const outputChannel = vscode_1.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
    // register a command which will allow us to run a recipe
    context.subscriptions.push(vscode_1.commands.registerCommand(RUN_RECIPE_COMMAND_KEY, () => __awaiter(this, void 0, void 0, function* () {
        yield execute_run_command_1.executeRunCommand(outputChannel);
    })));
}
exports.activate = activate;
/**
 * Fires when our extension dies.
 */
function deactivate() {
    // nothing to do
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map