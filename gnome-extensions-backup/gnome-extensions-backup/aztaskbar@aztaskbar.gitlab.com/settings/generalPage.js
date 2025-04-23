import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';


import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export const GeneralPage = GObject.registerClass(
class GeneralPage extends Adw.PreferencesPage {
    _init(settings) {
        super._init({
            title: _('Settings'),
            icon_name: 'preferences-system-symbolic',
            name: 'GeneralPage',
        });

        this._settings = settings;

        const generalGroup = new Adw.PreferencesGroup({
            title: _('General'),
        });
        this.add(generalGroup);

        const dashVisibilitySwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
            active: this._settings.get_boolean('hide-dash'),
        });
        const dashVisibilityRow = new Adw.ActionRow({
            title: _('Hide Dash in Overview'),
            activatable_widget: dashVisibilitySwitch,
        });
        dashVisibilitySwitch.connect('notify::active', widget => {
            this._settings.set_boolean('hide-dash', widget.get_active());
        });
        dashVisibilityRow.add_suffix(dashVisibilitySwitch);
        generalGroup.add(dashVisibilityRow);

        const taskbarGroup = new Adw.PreferencesGroup({
            title: _('Taskbar Behavior'),
        });
        this.add(taskbarGroup);

        const panelPositions = new Gtk.StringList();
        panelPositions.append(_('Left'));
        panelPositions.append(_('Center'));
        panelPositions.append(_('Right'));
        const panelPositionRow = new Adw.ComboRow({
            title: _('Position in Panel'),
            model: panelPositions,
            selected: this._settings.get_enum('position-in-panel'),
        });
        panelPositionRow.connect('notify::selected', widget => {
            this._settings.set_enum('position-in-panel', widget.selected);
        });
        taskbarGroup.add(panelPositionRow);

        const positionOffsetSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0, upper: 15, step_increment: 1, page_increment: 1, page_size: 0,
            }),
            climb_rate: 1,
            digits: 0,
            numeric: true,
            valign: Gtk.Align.CENTER,
        });
        positionOffsetSpinButton.set_value(this._settings.get_int('position-offset'));
        positionOffsetSpinButton.connect('value-changed', widget => {
            this._settings.set_int('position-offset', widget.get_value());
        });
        const positionOffsetRow = new Adw.ActionRow({
            title: _('Position Offset'),
            subtitle: _('Offset the position within the above selected box'),
            activatable_widget: positionOffsetSpinButton,
        });
        positionOffsetRow.add_suffix(positionOffsetSpinButton);
        taskbarGroup.add(positionOffsetRow);

        const [showAppsButton, showAppsButtonPosition] =
            this._settings.get_value('show-apps-button').deep_unpack();

        const showAppsButtonSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        showAppsButtonSwitch.connect('notify::active', widget => {
            const [oldEnabled_, oldValue] = this._settings.get_value('show-apps-button').deep_unpack();
            this._settings.set_value('show-apps-button',
                new GLib.Variant('(bi)', [widget.get_active(), oldValue]));
            if (widget.get_active())
                showAppsButtonCombo.set_sensitive(true);
            else
                showAppsButtonCombo.set_sensitive(false);
        });
        const showAppsButtonCombo = new Gtk.ComboBoxText({
            valign: Gtk.Align.CENTER,
            sensitive: showAppsButton,
        });
        showAppsButtonCombo.append_text(_('Left'));
        showAppsButtonCombo.append_text(_('Right'));
        showAppsButtonCombo.set_active(showAppsButtonPosition);
        showAppsButtonCombo.connect('changed', widget => {
            const [oldEnabled, oldValue_] = this._settings.get_value('show-apps-button').deep_unpack();
            this._settings.set_value('show-apps-button',
                new GLib.Variant('(bi)', [oldEnabled, widget.get_active()]));
        });

        const showAppsButtonRow = new Adw.ActionRow({
            title: _('Show Apps Button'),
            activatable_widget: showAppsButtonSwitch,
        });
        showAppsButtonRow.use_markup = true;
        showAppsButtonRow.add_suffix(showAppsButtonSwitch);
        showAppsButtonRow.add_suffix(new Gtk.Separator({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 10,
            margin_bottom: 10,
        }));
        showAppsButtonRow.add_suffix(showAppsButtonCombo);
        showAppsButtonSwitch.set_active(showAppsButton);
        taskbarGroup.add(showAppsButtonRow);

        const favoritesRow = new Adw.ExpanderRow({
            title: _('Show Favorite Apps'),
            show_enable_switch: true,
            expanded: false,
            enable_expansion: this._settings.get_boolean('favorites'),
        });
        favoritesRow.connect('notify::enable-expansion', widget => {
            this._settings.set_boolean('favorites', widget.enable_expansion);
        });
        taskbarGroup.add(favoritesRow);

        const favsOnAllMonitorsSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
            active: this._settings.get_boolean('favorites-on-all-monitors'),
        });
        const favsOnAllMonitorsRow = new Adw.ActionRow({
            title: _('Show Favorites on All Monitors'),
            activatable_widget: favsOnAllMonitorsSwitch,
        });
        favsOnAllMonitorsSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('favorites-on-all-monitors', widget.get_active());
        });
        favsOnAllMonitorsRow.add_suffix(favsOnAllMonitorsSwitch);
        favoritesRow.add_row(favsOnAllMonitorsRow);

        const runningAppsRow = new Adw.ExpanderRow({
            title: _('Show Running Apps'),
            show_enable_switch: true,
            expanded: false,
            enable_expansion: this._settings.get_boolean('show-running-apps'),
        });
        runningAppsRow.connect('notify::enable-expansion', widget => {
            this._settings.set_boolean('show-running-apps', widget.enable_expansion);
        });
        taskbarGroup.add(runningAppsRow);

        const isolateWorkspacesSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        const isolateWorkspacesRow = new Adw.ActionRow({
            title: _('Isolate Workspaces'),
            activatable_widget: isolateWorkspacesSwitch,
        });
        isolateWorkspacesSwitch.set_active(this._settings.get_boolean('isolate-workspaces'));
        isolateWorkspacesSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('isolate-workspaces', widget.get_active());
        });
        isolateWorkspacesRow.add_suffix(isolateWorkspacesSwitch);
        runningAppsRow.add_row(isolateWorkspacesRow);

        const isolateMonitorsSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        const isolateMonitorsRow = new Adw.ActionRow({
            title: _('Isolate Monitors'),
            activatable_widget: isolateMonitorsSwitch,
        });
        isolateMonitorsSwitch.set_active(this._settings.get_boolean('isolate-monitors'));
        isolateMonitorsSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('isolate-monitors', widget.get_active());
        });
        isolateMonitorsRow.add_suffix(isolateMonitorsSwitch);
        runningAppsRow.add_row(isolateMonitorsRow);

        const panelGroup = new Adw.PreferencesGroup({
            title: _('Panel'),
        });
        this.add(panelGroup);

        const panelLocations = new Gtk.StringList();
        panelLocations.append(_('Top'));
        panelLocations.append(_('Bottom'));
        const panelLocationRow = new Adw.ComboRow({
            title: _('Panel Location'),
            model: panelLocations,
            selected: this._settings.get_enum('panel-location'),
        });
        panelLocationRow.connect('notify::selected', widget => {
            this._settings.set_enum('panel-location', widget.selected);
        });
        panelGroup.add(panelLocationRow);

        const showOnAllMonitorsSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        const showOnAllMonitorsRow = new Adw.ActionRow({
            title: _('Show Panels on All Monitors'),
            activatable_widget: showOnAllMonitorsSwitch,
        });
        showOnAllMonitorsSwitch.set_active(this._settings.get_boolean('panel-on-all-monitors'));
        showOnAllMonitorsSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('panel-on-all-monitors', widget.get_active());
        });
        showOnAllMonitorsRow.add_suffix(showOnAllMonitorsSwitch);
        panelGroup.add(showOnAllMonitorsRow);

        const [panelHeightOverride, panelHeight] =
            this._settings.get_value('main-panel-height').deep_unpack();

        const panelHeightSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        panelHeightSwitch.connect('notify::active', widget => {
            const [oldEnabled_, oldValue] = this._settings.get_value('main-panel-height').deep_unpack();
            this._settings.set_value('main-panel-height',
                new GLib.Variant('(bi)', [widget.get_active(), oldValue]));
            if (widget.get_active())
                panelHeightSpinButton.set_sensitive(true);
            else
                panelHeightSpinButton.set_sensitive(false);
        });
        const panelHeightSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 5,
                upper: 60,
                step_increment: 1,
            }),
            climb_rate: 1,
            digits: 0,
            numeric: true,
            valign: Gtk.Align.CENTER,
            value: panelHeight,
            sensitive: panelHeightOverride,
        });
        panelHeightSpinButton.connect('value-changed', widget => {
            const [oldEnabled, oldValue_] = this._settings.get_value('main-panel-height').deep_unpack();
            this._settings.set_value('main-panel-height',
                new GLib.Variant('(bi)', [oldEnabled, widget.get_value()]));
        });

        const panelHeightRow = new Adw.ActionRow({
            title: _('Panel Height'),
            activatable_widget: panelHeightSwitch,
        });
        panelHeightRow.add_suffix(panelHeightSwitch);
        panelHeightRow.add_suffix(new Gtk.Separator({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 10,
            margin_bottom: 10,
        }));
        panelHeightRow.add_suffix(panelHeightSpinButton);
        panelHeightSwitch.set_active(panelHeightOverride);
        panelGroup.add(panelHeightRow);

        const activitiesSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        const activitiesRow = new Adw.ActionRow({
            title: _('Show Activities Button'),
            activatable_widget: activitiesSwitch,
        });
        activitiesSwitch.set_active(this._settings.get_boolean('show-panel-activities-button'));
        activitiesSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('show-panel-activities-button', widget.get_active());
        });
        activitiesRow.add_suffix(activitiesSwitch);
        panelGroup.add(activitiesRow);

        const showWeather = this._settings.get_enum('show-weather-by-clock');
        const weatherOptions = new Gtk.StringList();
        weatherOptions.append(_('Off'));
        weatherOptions.append(_('Left'));
        weatherOptions.append(_('Right'));
        const weatherOptionsRow = new Adw.ComboRow({
            title: _('Show Weather near Clock'),
            model: weatherOptions,
            selected: showWeather,
        });
        weatherOptionsRow.connect('notify::selected', widget => {
            this._settings.set_enum('show-weather-by-clock', widget.selected);
        });
        panelGroup.add(weatherOptionsRow);

        const [clockOverride, clockFormat] = this._settings.get_value('override-panel-clock-format').deep_unpack();
        const clockExpanderRow = new Adw.ExpanderRow({
            title: _('Customize Panel Clock'),
        });
        panelGroup.add(clockExpanderRow);

        const clockPositionRow = new Adw.ComboRow({
            title: _('Clock Position in Panel'),
            model: panelPositions,
            selected: this._settings.get_enum('clock-position-in-panel'),
        });
        clockPositionRow.connect('notify::selected', widget => {
            this._settings.set_enum('clock-position-in-panel', widget.selected);
        });
        clockExpanderRow.add_row(clockPositionRow);

        const clockOffsetSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0, upper: 15, step_increment: 1, page_increment: 1, page_size: 0,
            }),
            climb_rate: 1,
            digits: 0,
            numeric: true,
            valign: Gtk.Align.CENTER,
        });
        clockOffsetSpinButton.set_value(this._settings.get_int('clock-position-offset'));
        clockOffsetSpinButton.connect('value-changed', widget => {
            this._settings.set_int('clock-position-offset', widget.get_value());
        });
        const clockOffsetRow = new Adw.ActionRow({
            title: _('Position Offset'),
            subtitle: _('Offset the position within the above selected box'),
            activatable_widget: clockOffsetSpinButton,
        });
        clockOffsetRow.add_suffix(clockOffsetSpinButton);
        clockExpanderRow.add_row(clockOffsetRow);

        const linkButton = new Gtk.LinkButton({
            label: _('Format Guide'),
            uri: 'https://docs.gtk.org/glib/method.DateTime.format.html#description',
            css_classes: ['caption'],
            valign: Gtk.Align.CENTER,
        });
        const enableFormatSwitch = new Gtk.Switch({
            active: clockOverride,
            valign: Gtk.Align.CENTER,
        });
        enableFormatSwitch.connect('notify::active', widget => {
            clockFormatEntry.sensitive = widget.get_active();
            const [oldClockOverride_, oldClockFormat] = this._settings.get_value('override-panel-clock-format').deep_unpack();
            this._settings.set_value('override-panel-clock-format',
                new GLib.Variant('(bs)', [widget.get_active(), oldClockFormat]));
        });
        const clockFormatTextRow = new Adw.ActionRow({
            title: _('Customize Clock Format'),
        });
        clockFormatTextRow.add_suffix(linkButton);
        clockFormatTextRow.add_suffix(enableFormatSwitch);
        clockExpanderRow.add_row(clockFormatTextRow);

        const clockFormatEntry = new Gtk.Entry({
            valign: Gtk.Align.FILL,
            vexpand: true,
            halign: Gtk.Align.FILL,
            hexpand: true,
            text: clockFormat || '',
            sensitive: clockOverride,
        });
        clockFormatEntry.connect('changed', widget => {
            const [oldClockOverride, oldClockFormat_] = this._settings.get_value('override-panel-clock-format').deep_unpack();
            this._settings.set_value('override-panel-clock-format',
                new GLib.Variant('(bs)', [oldClockOverride, widget.get_text()]));
        });
        const clockFormatRow = new Adw.ActionRow({
            activatable: false,
            selectable: false,
        });

        clockFormatRow.set_child(clockFormatEntry);
        clockExpanderRow.add_row(clockFormatRow);

        const [clockSizeOverride, clockSize] =
            this._settings.get_value('clock-font-size').deep_unpack();

        const clockSizeSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
        });
        clockSizeSwitch.connect('notify::active', widget => {
            const [oldEnabled_, oldValue] = this._settings.get_value('clock-font-size').deep_unpack();
            this._settings.set_value('clock-font-size',
                new GLib.Variant('(bi)', [widget.get_active(), oldValue]));
            if (widget.get_active())
                clockSizeSpinButton.set_sensitive(true);
            else
                clockSizeSpinButton.set_sensitive(false);
        });
        const clockSizeSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 5,
                upper: 60,
                step_increment: 1,
            }),
            climb_rate: 1,
            digits: 0,
            numeric: true,
            valign: Gtk.Align.CENTER,
            value: clockSize,
            sensitive: clockSizeOverride,
        });
        clockSizeSpinButton.connect('value-changed', widget => {
            const [oldEnabled, oldValue_] = this._settings.get_value('clock-font-size').deep_unpack();
            this._settings.set_value('clock-font-size',
                new GLib.Variant('(bi)', [oldEnabled, widget.get_value()]));
        });

        const clockSizeRow = new Adw.ActionRow({
            title: _('Clock Font Size'),
            activatable_widget: clockSizeSwitch,
        });
        clockSizeRow.add_suffix(clockSizeSwitch);
        clockSizeRow.add_suffix(new Gtk.Separator({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 10,
            margin_bottom: 10,
        }));
        clockSizeRow.add_suffix(clockSizeSpinButton);
        clockSizeSwitch.set_active(clockSizeOverride);
        clockExpanderRow.add_row(clockSizeRow);

        const iconGroup = new Adw.PreferencesGroup({
            title: _('App Icons'),
        });
        this.add(iconGroup);

        const iconSizeSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 15, upper: 50, step_increment: 1, page_increment: 1, page_size: 0,
            }),
            climb_rate: 1,
            digits: 0,
            numeric: true,
            valign: Gtk.Align.CENTER,
        });
        iconSizeSpinButton.set_value(this._settings.get_int('icon-size'));
        iconSizeSpinButton.connect('value-changed', widget => {
            this._settings.set_int('icon-size', widget.get_value());
        });
        const iconSizeRow = new Adw.ActionRow({
            title: _('Icon Size'),
            activatable_widget: iconSizeSpinButton,
        });
        iconSizeRow.add_suffix(iconSizeSpinButton);
        iconGroup.add(iconSizeRow);

        const desatureFactorSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0.0, upper: 1.0, step_increment: 0.05, page_increment: 0.1, page_size: 0,
            }),
            climb_rate: 0.05,
            digits: 2,
            numeric: true,
            valign: Gtk.Align.CENTER,
        });
        desatureFactorSpinButton.set_value(this._settings.get_double('desaturation-factor'));
        desatureFactorSpinButton.connect('value-changed', widget => {
            this._settings.set_double('desaturation-factor', widget.get_value());
        });
        const desatureFactorRow = new Adw.ActionRow({
            title: _('Icon Desaturate Factor'),
            activatable_widget: desatureFactorSpinButton,
        });
        desatureFactorRow.add_suffix(desatureFactorSpinButton);
        iconGroup.add(desatureFactorRow);

        const iconStyles = new Gtk.StringList();
        iconStyles.append(_('Regular'));
        iconStyles.append(_('Symbolic'));
        const iconStyleRow = new Adw.ComboRow({
            title: _('Icon Style'),
            subtitle: _('Icon themes may not have a symbolic icon for every app'),
            model: iconStyles,
            selected: this._settings.get_enum('icon-style'),
        });
        iconStyleRow.connect('notify::selected', widget => {
            this._settings.set_enum('icon-style', widget.selected);
        });
        iconGroup.add(iconStyleRow);

        const danceUrgentSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
            active: this._settings.get_boolean('dance-urgent'),
        });
        const danceUrgentRow = new Adw.ActionRow({
            title: _('Dance Urgent App Icons'),
            activatable_widget: danceUrgentSwitch,
        });
        danceUrgentSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('dance-urgent', widget.get_active());
        });
        danceUrgentRow.add_suffix(danceUrgentSwitch);
        iconGroup.add(danceUrgentRow);

        const indicatorGroup = new Adw.PreferencesGroup({
            title: _('Indicator'),
        });
        this.add(indicatorGroup);

        const multiWindowIndicatorStyles = new Gtk.StringList();
        multiWindowIndicatorStyles.append(_('Indicator'));
        multiWindowIndicatorStyles.append(_('Multi-Dashes'));
        const multiWindowIndicatorRow = new Adw.ComboRow({
            title: _('Multi-Window Indicator Style'),
            model: multiWindowIndicatorStyles,
            selected: this._settings.get_enum('multi-window-indicator-style'),
        });
        multiWindowIndicatorRow.connect('notify::selected', widget => {
            this._settings.set_enum('multi-window-indicator-style', widget.selected);
        });
        indicatorGroup.add(multiWindowIndicatorRow);

        const indicatorLocations = new Gtk.StringList();
        indicatorLocations.append(_('Top'));
        indicatorLocations.append(_('Bottom'));
        const indicatorLocationRow = new Adw.ComboRow({
            title: _('Indicator Location'),
            model: indicatorLocations,
            selected: this._settings.get_enum('indicator-location'),
        });
        indicatorLocationRow.connect('notify::selected', widget => {
            this._settings.set_enum('indicator-location', widget.selected);
        });
        indicatorGroup.add(indicatorLocationRow);

        let color = new Gdk.RGBA();
        color.parse(this._settings.get_string('indicator-color-running'));
        const indicatorRunningColorButton = new Gtk.ColorButton({
            rgba: color,
            use_alpha: true,
            valign: Gtk.Align.CENTER,
        });
        indicatorRunningColorButton.connect('color-set', widget => {
            const widgetColor = widget.get_rgba().to_string();
            this._settings.set_string('indicator-color-running', widgetColor);
        });
        const indicatorRunningRow = new Adw.ActionRow({
            title: _('Running Indicator Color'),
            activatable_widget: indicatorRunningColorButton,
        });
        indicatorRunningRow.add_suffix(indicatorRunningColorButton);
        indicatorGroup.add(indicatorRunningRow);

        color = new Gdk.RGBA();
        color.parse(this._settings.get_string('indicator-color-focused'));
        const indicatorFocusedColorButton = new Gtk.ColorButton({
            rgba: color,
            use_alpha: true,
            valign: Gtk.Align.CENTER,
        });
        indicatorFocusedColorButton.connect('color-set', widget => {
            const widgetColor = widget.get_rgba().to_string();
            this._settings.set_string('indicator-color-focused', widgetColor);
        });

        const indicatorFocusedRow = new Adw.ActionRow({
            title: _('Focused Indicator Color'),
            activatable_widget: indicatorFocusedColorButton,
        });
        indicatorFocusedRow.add_suffix(indicatorFocusedColorButton);
        indicatorGroup.add(indicatorFocusedRow);

        const badgesGroup = new Adw.PreferencesGroup({
            title: _('Taskbar Badges'),
        });
        this.add(badgesGroup);

        const notificationCounterSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
            active: this._settings.get_boolean('notification-badges'),
        });
        const notificationCounterRow = new Adw.ActionRow({
            title: _('Notification Badges Count'),
            // eslint-disable-next-line max-len
            subtitle: _('Adds a badge counter to the App Icon based on GNOME shell notifications'),
            activatable_widget: notificationCounterSwitch,
        });
        notificationCounterSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('notification-badges', widget.get_active());
        });
        notificationCounterRow.add_suffix(notificationCounterSwitch);
        badgesGroup.add(notificationCounterRow);

        const notificationAlwaysShowSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
            active: this._settings.get_boolean('always-show-notifications'),
        });
        const notificationAlwaysShowRow = new Adw.ActionRow({
            title: _('Always Show Notification Badges'),
            subtitle: _('Bypass "Do Not Disturb" mode'),
            activatable_widget: notificationAlwaysShowSwitch,
        });
        notificationAlwaysShowSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('always-show-notifications', widget.get_active());
        });
        notificationAlwaysShowRow.add_suffix(notificationAlwaysShowSwitch);
        badgesGroup.add(notificationAlwaysShowRow);

        const unityCountSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
            active: this._settings.get_boolean('unity-badges'),
        });
        const unityCountRow = new Adw.ActionRow({
            title: _('Unity Badges Count'),
            subtitle: _('Requires Unity API'),
            activatable_widget: unityCountSwitch,
        });
        unityCountSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('unity-badges', widget.get_active());
        });
        unityCountRow.add_suffix(unityCountSwitch);
        badgesGroup.add(unityCountRow);

        const progressSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER,
            active: this._settings.get_boolean('unity-progress-bars'),
        });
        const progressRow = new Adw.ActionRow({
            title: _('Unity Progress Bars'),
            subtitle: _('Requires Unity API'),
            activatable_widget: progressSwitch,
        });
        progressSwitch.connect('notify::active', widget => {
            this._settings.set_boolean('unity-progress-bars', widget.get_active());
        });
        progressRow.add_suffix(progressSwitch);
        badgesGroup.add(progressRow);
    }
});
