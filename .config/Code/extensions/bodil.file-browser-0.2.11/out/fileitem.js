"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRecordCompare = exports.itemIsDir = exports.FileItem = void 0;
const vscode_1 = require("vscode");
const extension_1 = require("./extension");
class FileItem {
    constructor(record) {
        const [name, fileType] = record;
        this.name = name;
        this.fileType = fileType;
        this.alwaysShow = (0, extension_1.config)(extension_1.ConfigItem.HideDotfiles) ? !name.startsWith(".") : true;
        switch (this.fileType) {
            case vscode_1.FileType.Directory:
                this.label = `$(folder) ${name}`;
                break;
            case vscode_1.FileType.Directory | vscode_1.FileType.SymbolicLink:
                this.label = `$(file-symlink-directory) ${name}`;
                break;
            case vscode_1.FileType.File | vscode_1.FileType.SymbolicLink:
                this.label = `$(file-symlink-file) ${name}`;
            default:
                this.label = `$(file) ${name}`;
                break;
        }
    }
}
exports.FileItem = FileItem;
function itemIsDir(item) {
    if (item.fileType === undefined) {
        return false;
    }
    return !!(item.fileType | vscode_1.FileType.Directory);
}
exports.itemIsDir = itemIsDir;
function fileRecordCompare(left, right) {
    const [leftName, leftDir] = [
        left[0].toLowerCase(),
        (left[1] & vscode_1.FileType.Directory) === vscode_1.FileType.Directory,
    ];
    const [rightName, rightDir] = [
        right[0].toLowerCase(),
        (right[1] & vscode_1.FileType.Directory) === vscode_1.FileType.Directory,
    ];
    if (leftDir && !rightDir) {
        return -1;
    }
    if (rightDir && !leftDir) {
        return 1;
    }
    return leftName > rightName ? 1 : leftName === rightName ? 0 : -1;
}
exports.fileRecordCompare = fileRecordCompare;
//# sourceMappingURL=fileitem.js.map