#!/bin/bash
# @egirlcatnip

# run this script from github with:
# curl -sSL https://raw.githubusercontent.com/egirlcatnip/dotfiles/main/setup.sh | bash

set -euo pipefail

green="\033[0;32m"
blue="\033[0;34m"
yellow="\033[1;33m"
reset="\033[0m"

log() {
  printf "\n${blue}>>${reset} %s\n" "$1"
}

success() {
  printf "\n${green}>>${reset} %s\n" "$1"
}

warn() {
  printf "\n${yellow}>>${reset} %s\n" "$1"
}

prompt_user() {
  log "This script will perform the following actions:"
  log "1. Add repositories for VS Code, Terra and RPM Fusion."
  log "2. Install core packages like fish, starship, micro, btop, etc."
  log "3. Install and configure dotfiles from GitHub."
  log "4. Set fish shell as the default shell."
  log "5. Run system updates and additional setup tasks."

  if [ -t 0 ]; then
    while true; do
      read -r -p "Do you want to proceed? (y/n): " yn
      case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Exiting script."; exit;;
        * ) echo "Please answer y or n.";;
      esac
    done
  else
    warn "Running in non-interactive mode (e.g., piped). Starting in 10 seconds..."
    for i in {10..1}; do
      printf "\rStarting in %2d seconds..." "$i"
      sleep 1
    done
    echo
  fi
}


add_repositories() {
  log "Adding repositories..."

  arch="$(uname -m)"
  fedora_version="$(rpm -E %fedora)"

  sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
  echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\nautorefresh=1\ntype=rpm-md\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null || warn "VS Code repo install failed"

  sudo dnf install -y --repofrompath="rpmfusion-free,https://download1.rpmfusion.org/free/fedora/releases/${fedora_version}/Everything/${arch}/os/" --nogpgcheck rpmfusion-free-release || warn "RPM Fusion Free failed"

  sudo dnf install -y --repofrompath="rpmfusion-nonfree,https://download1.rpmfusion.org/nonfree/fedora/releases/${fedora_version}/Everything/${arch}/os/" --nogpgcheck rpmfusion-nonfree-release || warn "RPM Fusion Nonfree failed"


  if [ -f /etc/nobara-release ]; then
    warn "Terra is only supported on Fedora. Skipping Terra installation."
  else
    sudo dnf install -y --repofrompath="terra,https://repos.fyralabs.com/terra${fedora_version}" --nogpgcheck terra-release || warn "Terra repo install failed"
  fi

  success "Repositories added"
}

install_dotfiles() {
  log "Installing dotfiles..."

  if [ -d ~/.dotfiles ]; then
    cd ~/.dotfiles
    git fetch
    if ! git diff --quiet HEAD origin/main; then
      git reset --hard origin/main
      success "Dotfiles updated"
    else
      success "Dotfiles already up-to-date"
    fi
    return
  fi

  git clone https://github.com/egirlcatnip/dotfiles ~/.dotfiles
  cp -rf ~/.dotfiles/.config ~/.config
  cp -rf ~/.dotfiles/.local ~/.local
  cp -rf ~/.dotfiles/.bashrc ~/.bashrc

  success "Dotfiles installed"
}

install_core_packages() {
  log "Installing core packages..."

  sudo dnf install -y fish starship fastfetch micro btop topgrade tailscale ripgrep fd-find gh tealdeer rustup gdb
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
  topgrade || warn "Topgrade failed"

  success "System setup complete"

  log "Fastfetch..."
  fastfetch || warn "Fastfetch failed"
}

main() {
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
