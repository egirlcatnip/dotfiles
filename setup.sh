#!/usr/bin/env bash

VERSION="1.5"
set -euo pipefail

INFO="\033[0;34m"
OK="\033[0;32m"
WARN="\033[1;33m"
RESET="\033[0m"

log() {
  printf "%b>>%b %s\n" "$1" "$RESET" "$2"
}

confirm() {
  read -p "Proceed? [y/N]: " response < /dev/tty
  [[ "${response,,}" =~ ^(y|yes)$ ]]
}

disclaimer() {
  log "$INFO" "egirlcatscript $VERSION"
  confirm || { log "$WARN" "Aborted"; return 1; }
}

install_repos() {
  log "$INFO" "Setting up repositories"

  sudo dnf install -y --nogpgcheck --repofrompath \
  'terra,https://repos.fyralabs.com/terra$releasever' \
  terra-release \
    || log "$WARN" "Failed to enable Terra repository"

  sudo dnf install -y --nogpgcheck --repofrompath \
  'rpmfusion-free,https://download1.rpmfusion.org/free/fedora/releases/$releasever/Everything/$basearch/os' \
  rpmfusion-free-release \
    || log "$WARN" "Failed to enable RPM Fusion Free repository"

  sudo dnf install -y --nogpgcheck --repofrompath \
  'rpmfusion-nonfree,https://download1.rpmfusion.org/nonfree/fedora/releases/$releasever/Everything/$basearch/os' \
  rpmfusion-nonfree-release \
    || log "$WARN" "Failed to enable RPM Fusion Non-Free repository"
}

install_tools() {
  log "$INFO" "Installing core tools"
  sudo dnf install -y fish starship fastfetch micro btop topgrade ripgrep fd-find gh tealdeer gdb bat zoxide \
    || log "$WARN" "Some packages failed"
  log "$OK" "Core tools installed"
}

apply_dotfiles() {
  DOTDIR="$HOME/.dotfiles"
  log "$INFO" "Downloading dotfiles to $DOTDIR"

  if [[ -d $DOTDIR ]]; then
    git -C "$DOTDIR" pull fetch || log "$WARN" "Dotfiles update failed"
    git -C "$DOTDIR" checkout || log "$WARN" "Dotfiles update failed"
  else
    git clone https://github.com/egirlcatnip/dotfiles "$DOTDIR" || log "$WARN" "Clone failed"
  fi

  log "$INFO" "Applying dotfiles"
  cp -f "$DOTDIR/.bashrc" "$HOME/.bashrc"
  mkdir -p "$HOME/.config"
  cp -rf "$DOTDIR/.config/" "$HOME/.config/"
  log "$OK" "Dotfiles applied"
}

install_fish() {
  if [[ "$SHELL" != "/usr/bin/fish" ]]; then
    log "$INFO" "Set fish as default shell?"
    if confirm; then
      sudo chsh -s /usr/bin/fish "$USER"
      sudo chsh -s /usr/bin/fish root
      log "$OK" "Default shell is now fish"
    fi
  fi
}

update_system() {
  log "$INFO" "Update system?"
  if confirm; then
    topgrade -y
  else
    log "$WARN" "Skipping system update"
  fi
}

install_dconf() {
  log "$INFO" "Apply dconf?"
  if ! confirm; then
    log "$WARN" "Skipping dconf"
    return
  fi

  dconf write /org/gnome/desktop/wm/keybindings/close "['<Super>q']"
  dconf write /org/gnome/desktop/wm/keybindings/toggle-maximized "['<Super>f']"
  dconf write /org/gnome/desktop/wm/keybindings/toggle-fullscreen "['<Control><Super>f']"

  dconf write /org/gnome/desktop/wm/keybindings/show-desktop "['<Super>d']"

  dconf write /org/gnome/desktop/wm/keybindings/switch-windows "['<Alt>Tab']"
  dconf write /org/gnome/desktop/wm/keybindings/switch-windows-backward "['<Shift><Alt>Tab']"

  dconf write /org/gnome/desktop/wm/keybindings/maximize "@as []"
  dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-left "@as []"
  dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-right "@as []"
  dconf write /org/gnome/desktop/wm/keybindings/switch-applications "@as []"
  dconf write /org/gnome/desktop/wm/keybindings/switch-applications-backward "@as []"
  dconf write /org/gnome/desktop/wm/keybindings/unmaximize "@as []"



  log "$OK" "Dconf applied"
}

install_extensions() {
  log "$INFO" "Install GNOME extensions?"
  if confirm; then
    mkdir -p ~/.local/share/gnome-shell/extensions
    cp -rf "$HOME/.dotfiles/gnome-extensions-backup" ~/.local/share/gnome-shell/extensions
    log "$OK" "GNOME extensions installed"
  else
    log "$WARN" "Skipping GNOME extensions"
  fi
}

main() {
  disclaimer || return 1
  sudo -v

  apply_dotfiles
  install_repos
  install_tools
  install_extensions
  install_dconf
  install_fish
  update_system

  log "$OK" "Setup complete"
  echo
  fastfetch
}

main
