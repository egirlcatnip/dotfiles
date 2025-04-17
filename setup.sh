#!/bin/bash
# egirlcatscript fedora setup.sh
# curl -sSL https://raw.githubusercontent.com/egirlcatnip/dotfiles/refs/heads/main/setup.sh | sh

set -euo pipefail

VERSION="v1.0.4"

log()        { gum format "## $1"; }
success()    { gum format "OK: $1"; }
warn()       { gum format "WARNING: $1"; }

install_gum() {
  command -v gum &> /dev/null || {
    echo "Installing gum…"
    sudo dnf install -y gum > /dev/null 2>&1
  }
}

prompt_user() {
  gum format "### Egirlcatnip Fedora Setup ${VERSION}

This installer will:
1. Register VS Code, RPM Fusion & Terra repositories
2. Install any missing core packages
3. Clone or update your dotfiles
4. Switch your default shell to Fish
5. Run final update and cleanup steps
"
  gum confirm "Continue?" || { gum format "Aborted."; exit 1; }
}

add_repos() {
  arch=$(uname -m)
  fedora=$(rpm -E %fedora)

  if [[ ! -f /etc/yum.repos.d/vscode.repo ]]; then
    sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
    cat <<EOF | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null
[code]
name=Visual Studio Code
baseurl=https://packages.microsoft.com/yumrepos/vscode
enabled=1
autorefresh=1
type=rpm-md
gpgcheck=1
gpgkey=https://packages.microsoft.com/keys/microsoft.asc
EOF
    [[ -f /etc/yum.repos.d/vscode.repo ]] && success "VS Code repo added" || warn "VS Code repo failed"
  else
    success "VS Code repo exists"
  fi

  for repo in rpmfusion-free-release rpmfusion-nonfree-release; do
    if ! rpm -q "$repo" &> /dev/null; then
      base=${repo%%-release}
      sudo dnf install -y \
        --repofrompath="${base},https://download1.rpmfusion.org/${base}/fedora/releases/${fedora}/Everything/${arch}/os/" \
        --nogpgcheck "$repo" > /dev/null 2>&1 \
        && success "$repo added" || warn "$repo failed"
    else
      success "$repo exists"
    fi
  done

  if [[ ! -f /etc/nobara-release ]] && ! rpm -q terra-release &> /dev/null; then
    sudo dnf install -y \
      --repofrompath="terra,https://repos.fyralabs.com/terra${fedora}" \
      --nogpgcheck terra-release > /dev/null 2>&1 \
      && success "Terra repo added" || warn "Terra repo failed"
  else
    success "Terra repo exists or not supported"
  fi
}

install_packages() {
  core=(fish starship fastfetch micro btop topgrade tailscale ripgrep fd-find gh tealdeer rustup gdb)
  missing=()
  for pkg in "${core[@]}"; do
    rpm -q "$pkg" &> /dev/null || missing+=("$pkg")
  done
  if (( ${#missing[@]} > 0 )); then
    sudo dnf install -y "${missing[@]}" > /dev/null 2>&1 \
      && success "Installed: ${missing[*]}" || warn "Some packages failed"
  else
    success "All core packages present"
  fi
}

install_dotfiles() {
  if [[ -d ~/.dotfiles ]]; then
    git -C ~/.dotfiles fetch --quiet
    if ! git -C ~/.dotfiles diff --quiet HEAD origin/main; then
      git -C ~/.dotfiles reset --hard origin/main --quiet \
        && success "Dotfiles updated" || warn "Update failed"
    else
      success "Dotfiles up-to-date"
    fi
  else
    git clone --quiet https://github.com/egirlcatnip/dotfiles ~/.dotfiles \
      && success "Dotfiles cloned" || warn "Clone failed"
  fi

  cp -rf ~/.dotfiles/.config ~/.config
  cp -rf ~/.dotfiles/.local  ~/.local
  cp -rf ~/.dotfiles/.bashrc ~/.bashrc
}

set_shell() {
  if [[ "$SHELL" != "/bin/fish" ]]; then
    sudo chsh -s /bin/fish "$USER"
    sudo chsh -s /bin/fish root
    success "Fish shell set"
  else
    success "Fish is default shell"
  fi
}

finalize() {
  topgrade -y
  echo
  echo
  fastfetch
}

main() {
  install_gum
  prompt_user
  sudo -v
  log "Starting setup"
  add_repos
  install_packages
  install_dotfiles
  set_shell
  finalize
}

main
