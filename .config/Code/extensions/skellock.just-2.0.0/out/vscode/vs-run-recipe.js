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
const run_recipe_1 = require("../just/run-recipe");
/**
 * Attempts to run a just recipe.
 *
 * @param recipe the command to run
 */
function vsRunRecipe(recipe, outputChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        // create an output channel & log it
        const preserveFocus = true;
        outputChannel.show(preserveFocus);
        outputChannel.appendLine(`🤖 Running: just ${recipe.name}`);
        // run the command
        const runResult = yield run_recipe_1.runRecipe(recipe);
        switch (runResult.kind) {
            // we ran it successfully
            case 'ok':
                if (runResult.stdout) {
                    outputChannel.appendLine(runResult.stdout);
                }
                else {
                    outputChannel.appendLine(`Ran ${recipe.name} successfully.`);
                }
                break;
            // there was an error
            case 'error':
                outputChannel.appendLine(`Error`);
                if (runResult.stdout) {
                    outputChannel.appendLine(runResult.stdout);
                }
                if (runResult.stderr) {
                    outputChannel.appendLine(runResult.stderr);
                }
                break;
            // this shouldn't happen
            case 'unknown':
                outputChannel.appendLine(`Something bad happened running ${recipe.name}.`);
                break;
        }
    });
}
exports.vsRunRecipe = vsRunRecipe;
//# sourceMappingURL=vs-run-recipe.js.map