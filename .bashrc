# Initialize Starship prompt
starship init bash > $HOME/.cache/starship/starship.sh

source $HOME/.cache/starship/starship.sh

# Environment variables
export EDITOR='micro'
export BINSTALL_NO_CONFIRM="true"
export STARSHIP_CONFIG="$HOME/.config/starship_tty.toml"

# Path managment
# Function to append to PATH if not already present
append_to_path() {
    if [[ ":$PATH:" != *":$1:"* ]]; then
        export PATH="$PATH:$1"
    fi
}

# Usage examples
append_to_path "$HOME/.cargo/bin"
append_to_path "$HOME/.deno/bin"

# Aliases
alias ccc='clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c23 -x c'
alias ccp='clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c++23 -x c++'

alias gnome-terminal='ptyxis'
alias prolog='scryer-prolog'


# Terminal specific configuration
if [ "$TERM" == "linux" ]; then {
  # In TTY
  :;
} else {
  # In graphical terminal
  export STARSHIP_CONFIG="$HOME/.config/starship.toml";
  export EDITOR='codium';
}
fi
