#!/bin/bash
# @egirlcatnip
# Setup Script v1.0.0
# Run with: curl -sSL https://raw.githubusercontent.com/egirlcatnip/dotfiles/main/setup.sh | bash

set -euo pipefail

VERSION="v1.0.0"

log() {
  gum format "## $1"
}

success() {
  gum format "**✔️ $1**"
}

warn() {
  gum format "**⚠️ $1**"
}

install_gum_if_needed() {
  if ! command -v gum &> /dev/null; then
    echo "gum not found. Installing..."
    sudo dnf install -y gum > /dev/null 2>&1
  fi
}

prompt_user() {
  gum format "## Setup Script ${VERSION}

This script will perform the following actions:

1. Add repositories for VS Code, Terra and RPM Fusion.
2. Install core packages like fish, starship, micro, btop, etc.
3. Install and configure dotfiles from GitHub.
4. Set fish shell as the default shell.
5. Run system updates and additional setup tasks.
"

  if gum confirm "Do you want to proceed?"; then
    return
  else
    gum format "_Exiting script._"
    exit
  fi
}

add_repositories() {
  log "Adding repositories..."

  arch="$(uname -m)"
  fedora_version="$(rpm -E %fedora)"

  sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

  echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\nautorefresh=1\ntype=rpm-md\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" |
    sudo tee /etc/yum.repos.d/vscode.repo > /dev/null || warn "VS Code repo install failed"

  sudo dnf install -y --repofrompath="rpmfusion-free,https://download1.rpmfusion.org/free/fedora/releases/${fedora_version}/Everything/${arch}/os/" --nogpgcheck rpmfusion-free-release > /dev/null 2>&1 || warn "RPM Fusion Free failed"

  sudo dnf install -y --repofrompath="rpmfusion-nonfree,https://download1.rpmfusion.org/nonfree/fedora/releases/${fedora_version}/Everything/${arch}/os/" --nogpgcheck rpmfusion-nonfree-release > /dev/null 2>&1 || warn "RPM Fusion Nonfree failed"

  if [ -f /etc/nobara-release ]; then
    warn "Terra is only supported on Fedora. Skipping Terra installation."
  else
    sudo dnf install -y --repofrompath="terra,https://repos.fyralabs.com/terra${fedora_version}" --nogpgcheck terra-release > /dev/null 2>&1 || warn "Terra repo install failed"
  fi

  success "Repositories added"
}

install_dotfiles() {
  log "Installing dotfiles..."

  if [ -d ~/.dotfiles ]; then
    cd ~/.dotfiles
    git fetch --quiet
    if ! git diff --quiet HEAD origin/main; then
      git reset --hard origin/main --quiet
      success "Dotfiles updated"
    else
      success "Dotfiles already up-to-date"
    fi
    return
  fi

  git clone --quiet https://github.com/egirlcatnip/dotfiles ~/.dotfiles
  cp -rf ~/.dotfiles/.config ~/.config
  cp -rf ~/.dotfiles/.local ~/.local
  cp -rf ~/.dotfiles/.bashrc ~/.bashrc

  success "Dotfiles installed"
}

install_core_packages() {
  log "Installing core packages..."
  sudo dnf install -y fish starship fastfetch micro btop topgrade tailscale ripgrep fd-find gh tealdeer rustup gdb > /dev/null 2>&1
  success "Core packages installed"
}

set_fish_shell() {
  if [ "$SHELL" = "/bin/fish" ]; then
    success "Fish is already the default shell"
    return
  fi

  log "Setting Fish shell as default"
  sudo chsh -s /bin/fish "$USER"
  sudo chsh -s /bin/fish root
  success "Fish shell set"
}

run_finishers() {
  log "Updating..."
  topgrade > /dev/null 2>&1 || warn "Topgrade failed"

  success "System setup complete"

  log "Fastfetch..."
  fastfetch || warn "Fastfetch failed"
}

main() {
  install_gum_if_needed
  prompt_user
  sudo -v
  log "Starting system setup..."
  add_repositories
  install_core_packages
  install_dotfiles
  set_fish_shell
  run_finishers
}

main