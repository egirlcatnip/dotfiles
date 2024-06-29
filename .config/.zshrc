# ZINIT
ZINIT_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}/zinit/zinit.git"
[ ! -d $ZINIT_HOME ] && mkdir -p "$(dirname $ZINIT_HOME)"
[ ! -d $ZINIT_HOME/.git ] && git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"
source "${ZINIT_HOME}/zinit.zsh"
autoload -U compinit
compinit

#SHELL CONFIG
MAILCHECK=0
setopt COMPLETE_IN_WORD



#HISTORY
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt APPEND_HISTORY
setopt SHARE_HISTORY
setopt INC_APPEND_HISTORY
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_IGNORE_SPACE

# PLUGINS
zinit light zdharma-continuum/fast-syntax-highlighting
zinit light Aloxaf/fzf-tab

#PROMPT
# curl -sS https://starship.rs/install.sh | sh
eval "$(starship init zsh)"

#OPTIONS
export FZF_DEFAULT_OPTS="
 --scroll-off=10
 --border="rounded"
 --marker=\" (\"
 --pointer=\" \"
 --info="right"
 --color=bg+:-1,bg:-1,fg:0,fg+:3,hl:2,hl+:2,header:0,info:1,pointer:1,marker:4,prompt:0,spinner:3,border:0
 "




#PATH
path+=("~/.cargo/bin/")

#CONFIGS
export STARSHIP_CONFIG=~/.config/starship/starship.toml



#TOOLS

# rustup
# curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# cargo binstall
# curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash

# cargo binstall bacon cargo-update eza bat ripgrep fd-find
