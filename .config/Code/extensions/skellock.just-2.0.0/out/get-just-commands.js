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
const os_1 = require("os");
const just_command_1 = require("./just-command");
/**
 * Gets a list of recipes you can run from a justfile.
 */
function getRecipes(justfile) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // make the call to just
            const execaResult = yield execa("just", ["--list"]);
            // successful call to the executable?
            if (execaResult.code === 0) {
                // split up the result
                const lines = (execaResult.stdout || "").split(os_1.EOL);
                // nothing should never happen
                if (lines.length === 0) {
                    return { kind: "unknown" };
                }
                // 1 line means there are no recipes
                if (lines.length === 1) {
                    return { kind: "no-recipes" };
                }
                // more than 1 line?
                if (lines.length > 1) {
                    const tail = lines.splice(1, lines.length - 1);
                    const recipes = tail.map(just_command_1.parseRecipeLine);
                    return { kind: "ok", recipes };
                }
            }
        }
        catch (e) {
            // runtime check for an execa error
            if (e.cmd) {
                const error = e;
                const { code, stderr = "" } = error;
                // different types of errors we know of
                const noJustFile = code === 1 && stderr.trim() === "No justfile found.";
                const parseError = code === 1 && stderr.trim().startsWith("error: ");
                if (noJustFile) {
                    return { kind: "no-just-file" };
                }
                else if (parseError) {
                    return { kind: "just-parse-error" };
                }
                else {
                    return { kind: "unknown" };
                }
            }
            else {
                return { kind: "unknown" };
            }
        }
    });
}
exports.getRecipes = getRecipes;
//# sourceMappingURL=get-just-commands.js.map