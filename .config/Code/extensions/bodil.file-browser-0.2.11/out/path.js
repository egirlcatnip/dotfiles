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
exports.lookUpwards = exports.endsWithPathSeparator = exports.Path = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const OSPath = require("path");
const rust_1 = require("./rust");
class Path {
    constructor(uri) {
        this.pathUri = uri;
    }
    static fromFilePath(filePath) {
        return new Path(vscode_1.Uri.file(filePath));
    }
    get uri() {
        return this.pathUri;
    }
    /**
     * Get a unique identifier string for the [[Path]]. Do not display this to the user.
     */
    get id() {
        return this.pathUri.toString(false);
    }
    get fsPath() {
        return this.pathUri.fsPath;
    }
    /**
     * Get the path component of the [[Path]] as a string.
     */
    // get pathString(): string {
    //     return this.pathUri.path;
    // }
    /**
     * Make a copy of this path.
     */
    clone() {
        return new Path(this.pathUri);
    }
    equals(other) {
        return this.id === other.id;
    }
    /**
     * Test if the path is at its root.
     */
    atTop() {
        return this.pathUri === vscode_1.Uri.joinPath(this.pathUri, "..");
    }
    /**
     * Get the root of the file system the [[Path]] resides in.
     */
    root() {
        return this.pathUri.with({ path: "/" });
    }
    /**
     * Return a new path with the provided segments appended.
     */
    append(...pathSegments) {
        return new Path(vscode_1.Uri.joinPath(this.pathUri, ...pathSegments));
    }
    /**
     * Return the parent of a path.
     *
     * This always succeeds; if the path has no parent, it returns itself.
     * Use [[`Path.atTop`]] to check whether a path has a parent.
     */
    parent() {
        return this.append("..");
    }
    /**
     * Push `pathSegments` onto the end of the path.
     */
    push(...pathSegments) {
        this.pathUri = vscode_1.Uri.joinPath(this.pathUri, ...pathSegments);
    }
    /**
     * Pop the last path segment off the path.
     *
     * @returns [[None]] if the path has no more segments to pop.
     */
    pop() {
        if (this.atTop()) {
            return rust_1.None;
        }
        const current = new Path(this.pathUri);
        this.pathUri = vscode_1.Uri.joinPath(this.pathUri, "..");
        return current.relativeTo(this.pathUri);
    }
    getWorkspaceFolder() {
        return new rust_1.Option(vscode.workspace.getWorkspaceFolder(this.pathUri));
    }
    relativeTo(other) {
        if (this.pathUri.authority !== other.authority || this.pathUri.scheme !== other.scheme) {
            return rust_1.None;
        }
        const relPath = OSPath.relative(other.fsPath, this.pathUri.fsPath);
        return (0, rust_1.Some)(relPath);
    }
    stat() {
        return __awaiter(this, void 0, void 0, function* () {
            return rust_1.Result.try(vscode.workspace.fs.stat(this.pathUri));
        });
    }
    isDir() {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield this.stat();
            return stat.match((stat) => !!(stat.type | vscode_1.FileType.Directory), () => false);
        });
    }
    isFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield this.stat();
            return stat.match((stat) => !!(stat.type | vscode_1.FileType.File), () => false);
        });
    }
}
exports.Path = Path;
/**
 * If a string ends with a path separator, return the string with the path separator removed.
 * Otherwise, return [[None]].
 */
function endsWithPathSeparator(value) {
    if (value.endsWith("/")) {
        return (0, rust_1.Some)(value.slice(0, value.length - 1));
    }
    if (value.endsWith(OSPath.sep)) {
        return (0, rust_1.Some)(value.slice(0, value.length - OSPath.sep.length));
    }
    return rust_1.None;
}
exports.endsWithPathSeparator = endsWithPathSeparator;
/**
 * Given a list of file names, try to find one of them in the provided path,
 * then step up one folder at a time and repeat the search until we find something
 * or run out of parents.
 *
 * If no file is found, we return [[FileSystemError.FileNotFound]].
 *
 * If `uri` points to a file, we immediately return [[FileSystemError.FileNotADirectory]].
 *
 * Returns either the [[Uri]] of the first file found, or [[None]].
 */
function lookUpwards(uri, files) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = new Path(uri);
        if (!(yield path.isDir())) {
            return (0, rust_1.Err)(vscode_1.FileSystemError.FileNotADirectory(uri));
        }
        while (true) {
            for (const file of files) {
                let filePath = path.append(file);
                if (yield filePath.isFile()) {
                    return (0, rust_1.Ok)(filePath.uri);
                }
            }
            if (path.pop().isNone()) {
                return (0, rust_1.Err)(vscode_1.FileSystemError.FileNotFound());
            }
        }
    });
}
exports.lookUpwards = lookUpwards;
//# sourceMappingURL=path.js.map