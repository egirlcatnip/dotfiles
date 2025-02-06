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
const get_recipes_1 = require("../just/get-recipes");
const vs_run_recipe_1 = require("./vs-run-recipe");
/**
 * Gets a list of recipes kicks off the workflow to list, then execute a recipe.
 *
 * @param outputChannel The output channel we'll write to.
 */
function executeRunCommand(outputChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the commands
        const result = yield get_recipes_1.getRecipes();
        // what kind of commands did we get?
        switch (result.kind) {
            case 'ok': {
                // this is here to coerce typescript (no pattern matching ftl)
                const commands = result.kind === 'ok' && result.recipes;
                // convert to a vscode quick pick list
                const qpCommands = commands.map(x => ({
                    label: x.name,
                    detail: x.description,
                    description: '',
                }));
                // show the list and wait for a response
                const qp = yield vscode_1.window.showQuickPick(qpCommands);
                if (qp) {
                    // lookup the command
                    const command = commands.find(x => x.name === qp.label);
                    vs_run_recipe_1.vsRunRecipe(command, outputChannel);
                }
                break;
            }
            case 'no-just-file':
                vscode_1.window.showErrorMessage('Could not find a justfile.');
                break;
            case 'just-parse-error':
                vscode_1.window.showErrorMessage('Parsing error reading justfile.');
                break;
            case 'no-just':
                vscode_1.window.showErrorMessage('Could not find the just executable.');
                break;
            case 'no-recipes':
                vscode_1.window.showWarningMessage('No recipes available to run.');
                break;
            case 'unknown':
                vscode_1.window.showErrorMessage('Something really wrong happened. 💩');
                break;
        }
        outputChannel.appendLine('');
    });
}
exports.executeRunCommand = executeRunCommand;
//# sourceMappingURL=vs-run-get-recipes.js.map