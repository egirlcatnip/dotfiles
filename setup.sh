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

add_repositories() {
  log "Adding repositories..."
  arch="$(uname -m)"
  fedora_version="$(rpm -E %fedora)"

  sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

  sudo dnf install -y --repofrompath="vscode,https://packages.microsoft.com/yumrepos/vscode" --nogpgcheck code || warn "VS Code install failed or not supported on $arch"

  sudo dnf install -y --repofrompath="terra,https://repos.fyralabs.com/terra${fedora_version}" --nogpgcheck terra-release || warn "Terra repo install failed"

  sudo dnf install -y --repofrompath="rpmfusion-free,https://download1.rpmfusion.org/free/fedora/releases/${fedora_version}/Everything/${arch}/os/" --nogpgcheck rpmfusion-free-release || warn "RPM Fusion Free failed"

  sudo dnf install -y --repofrompath="rpmfusion-nonfree,https://download1.rpmfusion.org/nonfree/fedora/releases/${fedora_version}/Everything/${arch}/os/" --nogpgcheck rpmfusion-nonfree-release || warn "RPM Fusion Nonfree failed"

  sudo dnf install -y --repofrompath="adoptium,https://adoptium.jfrog.io/artifactory/rpm/${fedora_version}/${arch}/" --nogpgcheck adoptium-release || warn "Adoptium repo install failed"

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
  cp -f ~/.dotfiles/.bashrc ~/.bashrc

  success "Dotfiles installed"
}

install_core_packages() {
  log "Installing core packages..."

  sudo dnf install -y fish starship fastfetch micro btop topgrade tailscale ripgrep fd-find gh tealdeer
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
  sudo -v
  log "Starting system setup..."

  # Uncomment to enable repository setup
  # add_repositories

  install_core_packages
  install_dotfiles
  set_fish_shell
  run_finishers

}

main
