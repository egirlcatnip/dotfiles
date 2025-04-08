# Initialize Starship prompt
starship init fish > $HOME/.cache/starship/starship.fish
source $HOME/.cache/starship/starship.fish

# Environment variables
set fish_greeting
set -x EDITOR micro
set -x BINSTALL_NO_CONFIRM true
set -x STARSHIP_CONFIG "$HOME/.config/starship_tty.toml"

# Path management
# Function to append to PATH if not already present
function append_to_path
    if not contains -- $argv $PATH
        set -x PATH $PATH $argv
    end
end

# Add paths
append_to_path "$HOME/.cargo/bin"
append_to_path "$HOME/.deno/bin"

# Aliases
alias ccc='clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c23 -x c'
alias ccp='clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c++23 -x c++'

alias gnome-terminal='ptyxis'
alias prolog='scryer-prolog'

# Terminal specific configuration
if test "$TERM" = "linux"
    # In TTY
    ;
else
    # In graphical terminal
    set -x STARSHIP_CONFIG "$HOME/.config/starship.toml"
    set -x EDITOR codium
end
