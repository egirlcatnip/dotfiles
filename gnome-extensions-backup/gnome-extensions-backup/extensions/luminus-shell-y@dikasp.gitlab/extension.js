import St from 'gi://St';
import Gio from 'gi://Gio';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class LuminusExtension extends Extension {
    // For modern GNOME. Changes the default scheme.
    // Automatically handled by GNOME on scheme switch.
    _setDefaultColorScheme(scheme, notify = true) {
        Main.sessionMode.colorScheme = scheme;

        if (notify) {
            St.Settings.get().notify('color-scheme');
        }
    }

    // Get current main color scheme
    _getColorScheme() {
        return this._interface.get_string('color-scheme');
    }

    // For legacy applications.
    //
    // ! Schemes will not switch if dark variation of legacy theme is missing
    //   on target system.
    _setLegacyColorScheme(scheme) {
        const isDark = this._getLegacyColorScheme().endsWith("-dark");

        switch (scheme) {
            case 'default':
            case 'prefer-light':
                if (isDark) {
                    this._interface.set_string(
                        'gtk-theme',
                        this._getLegacyColorScheme().slice(0,-5)
                    );
                }
                break;
            case 'prefer-dark':
                if (!isDark) {
                    this._interface.set_string(
                        'gtk-theme',
                        this._getLegacyColorScheme() + "-dark"
                    );
                }
                break;
            default:
                break;
        }
    }

    // Get current legacy scheme
    _getLegacyColorScheme() {
        return this._interface.get_string('gtk-theme');
    }

    _schemeChangeHook() {
        let scheme = this._getColorScheme();
        this._setLegacyColorScheme(scheme);
    }

    enable() {
        // Hook the legacy theme switcher to scheme switch
        this._interface = Gio.Settings.new('org.gnome.desktop.interface');
        this._hookID = this._interface.connect('changed::color-scheme', () => {
            this._schemeChangeHook();
        });

        // Change default scheme
        this._savedColorScheme = Main.sessionMode.colorScheme;

        let currentColorScheme = this._getColorScheme();

        this._setDefaultColorScheme('prefer-light');
        this._setLegacyColorScheme(currentColorScheme);
    }

    disable() {
        this._interface.disconnect(this._hookID);
        this._hookID = null;

        this._setDefaultColorScheme(this._savedColorScheme);

        // Legacy apps scheme should always be reset to light, as it
        // doesn't support the mode switching.
        this._setLegacyColorScheme('default');

        this._interface = null;
    }
}
