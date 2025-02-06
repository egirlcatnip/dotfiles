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
exports.Rules = void 0;
const vscode = require("vscode");
const path_1 = require("./path");
const ignore_1 = require("ignore");
const fileitem_1 = require("./fileitem");
const OSPath = require("path");
const extension_1 = require("./extension");
class Rules {
    constructor(path) {
        this.path = path;
        this.rules = (0, ignore_1.default)();
        this.name = "empty";
    }
    static forPath(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const ruleFileNames = (0, extension_1.config)(extension_1.ConfigItem.IgnoreFileTypes);
            if (ruleFileNames === undefined) {
                return new Rules(path);
            }
            const ruleFilePath = yield (0, path_1.lookUpwards)(path.uri, ruleFileNames);
            return ruleFilePath.match((ruleFilePath) => __awaiter(this, void 0, void 0, function* () { return yield Rules.read(ruleFilePath); }), () => __awaiter(this, void 0, void 0, function* () { return new Rules(path); }));
        });
    }
    static read(ruleFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const ruleString = (yield vscode.workspace.fs.readFile(ruleFilePath)).toString();
            const ruleList = ruleString.trim().split(/\r?\n/);
            const rules = new Rules(new path_1.Path(ruleFilePath).parent());
            rules.name = OSPath.basename(ruleFilePath.path);
            rules.add(ruleList);
            return rules;
        });
    }
    add(rules) {
        this.rules.add(rules);
    }
    filter(base, items) {
        return items.map((item) => {
            let path = base
                .append(item.name)
                .relativeTo(this.path.uri)
                .unwrapOrElse(() => {
                throw new Error("Tried to apply ignore rules to a path that wasn't relative to the rule path!");
            });
            if ((0, fileitem_1.itemIsDir)(item)) {
                path += "/";
            }
            const ignored = this.rules.test(path).ignored;
            if (ignored) {
                item.alwaysShow = false;
                if ((0, extension_1.config)(extension_1.ConfigItem.LabelIgnoredFiles)) {
                    item.description = `(in ${this.name})`;
                }
            }
            return item;
        });
    }
}
exports.Rules = Rules;
//# sourceMappingURL=filter.js.map