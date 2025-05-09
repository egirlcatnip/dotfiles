import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import VSCodeSearchProvider from "./provider.js";
export default class VSCodeSearchProviderExtension extends Extension {
    provider = null;
    _settings = null;
    enable() {
        this._settings = this.getSettings();
        this.provider = new VSCodeSearchProvider(this);
        Main.overview.searchController.addProvider(this.provider);
    }
    disable() {
        this._settings = null;
        if (this.provider) {
            Main.overview.searchController.removeProvider(this.provider);
            this.provider = null;
        }
    }
}
