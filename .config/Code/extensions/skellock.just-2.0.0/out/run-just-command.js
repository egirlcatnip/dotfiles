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
const execa = require("execa");
/**
 * Gets a list of commands you can run from a justfile.
 */
function runRecipe(recipe) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // make the call to just
            const execaResult = yield execa("just", [recipe.name]);
            // successful call to the executable?
            if (execaResult.code === 0) {
                // split up the result
                return {
                    kind: "ok",
                    stdout: execaResult.stdout && execaResult.stdout.trim(),
                };
            }
        }
        catch (e) {
            // runtime check for an execa error
            if (e.cmd) {
                const error = e;
                return {
                    kind: "error",
                    stderr: error.stderr && error.stderr.trim(),
                    stdout: error.stdout && error.stdout.trim(),
                };
            }
            else {
                return { kind: "unknown" };
            }
        }
    });
}
exports.runRecipe = runRecipe;
//# sourceMappingURL=run-just-command.js.map