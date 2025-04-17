#!/bin/bash
# @egirlcatnip
# Setup Script v1.0.1
# Run with: curl -sSL https://raw.githubusercontent.com/egirlcatnip/dotfiles/main/setup.sh | bash

set -euo pipefail

VERSION="v1.0.1"

log()   { gum format "## $1"; }
success(){ gum format "**✔️ $1**"; }
warn()   { gum format "**⚠️ $1**"; }

install_gum(){
  command -v gum &> /dev/null || {
    echo "Installing gum…"
    sudo dnf install -y gum > /dev/null 2>&1
  }
}

prompt_user(){
  gum format "### Egirlcatnip Fedora Setup ${VERSION}

This installer will:
1. Register VS Code, RPM Fusion & Terra repos
2. Install missing core packages
3. Clone or update your dotfiles
4. Switch default shell to Fish
5. Apply final updates and cleanups
"
  gum confirm "Continue?" || { gum format "_Aborted._"; exit; }
}

add_repos(){
  arch=$(uname -m)
  fedora=$(rpm -E %fedora)

  if [[ ! -f /etc/yum.repos.d/vscode.repo ]]; then
    sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
    echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\nautorefresh=1\ntype=rpm‑md\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" \
      | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null \
      && success "VS Code repo added" \
      || warn    "VS Code repo failed"
  else
    success "VS Code repo exists"
  fi

  for repo in rpmfusion-free-release rpmfusion-nonfree-release; do
    if ! rpm -q $repo &> /dev/null; then
      base=${repo%%-release}
      sudo dnf install -y --repofrompath="${base},https://download1.rpmfusion.org/${base}/fedora/releases/${fedora}/Everything/${arch}/os/" \
        --nogpgcheck $repo > /dev/null 2>&1 \
        && success "$repo added" \
        || warn    "$repo failed"
    else
      success "$repo exists"
    fi
  done

  if [[ ! -f /etc/nobara-release ]]; then
    if ! rpm -q terra-release &> /dev/null; then
      sudo dnf install -y --repofrompath="terra,https://repos.fyralabs.com/terra${fedora}" \
        --nogpgcheck terra-release > /dev/null 2>&1 \
        && success "Terra repo added" \
        || warn    "Terra repo failed"
    else
      success "Terra repo exists"
    fi
  fi
}

install_packages(){
  core=(fish starship fastfetch micro btop topgrade tailscale ripgrep fd-find gh tealdeer rustup gdb)
  missing=()
  for pkg in "${core[@]}"; do
    rpm -q $pkg &> /dev/null || missing+=($pkg)
  done
  if (( ${#missing[@]} )); then
    sudo dnf install -y "${missing[@]}" > /dev/null 2>&1 \
      && success "Installed: ${missing[*]}" \
      || warn    "Some packages failed"
  else
    success "All core packages present"
  fi
}

install_dotfiles(){
  if [[ -d ~/.dotfiles ]]; then
    cd ~/.dotfiles
    git fetch --quiet
    if ! git diff --quiet HEAD origin/main; then
      git reset --hard origin/main --quiet && success "Dotfiles updated" || warn "Update failed"
    else
      success "Dotfiles up‑to‑date"
    fi
  else
    git clone --quiet https://github.com/egirlcatnip/dotfiles ~/.dotfiles \
      && success "Dotfiles cloned" \
      || warn    "Clone failed"
  fi
  cp -rf ~/.dotfiles/.config ~/.config
  cp -rf ~/.dotfiles/.local  ~/.local
  cp -rf ~/.dotfiles/.bashrc ~/.bashrc
}

set_shell(){
  if [[ "$SHELL" != "/bin/fish" ]]; then
    sudo chsh -s /bin/fish "$USER" && sudo chsh -s /bin/fish root && success "Fish shell set"
  else
    success "Fish is default"
  fi
}

finalize(){
  topgrade || warn "Topgrade issues"
  fastfetch || warn "Fastfetch issues"
}

main(){
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