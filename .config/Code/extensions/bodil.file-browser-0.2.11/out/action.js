"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.Action = void 0;
var Action;
(function (Action) {
    Action[Action["NewFile"] = 0] = "NewFile";
    Action[Action["NewFolder"] = 1] = "NewFolder";
    Action[Action["OpenFile"] = 2] = "OpenFile";
    Action[Action["OpenFileBeside"] = 3] = "OpenFileBeside";
    Action[Action["RenameFile"] = 4] = "RenameFile";
    Action[Action["DeleteFile"] = 5] = "DeleteFile";
    Action[Action["OpenFolder"] = 6] = "OpenFolder";
    Action[Action["OpenFolderInNewWindow"] = 7] = "OpenFolderInNewWindow";
})(Action = exports.Action || (exports.Action = {}));
function action(label, action) {
    return {
        label,
        name: "",
        action,
        alwaysShow: true,
    };
}
exports.action = action;
//# sourceMappingURL=action.js.map