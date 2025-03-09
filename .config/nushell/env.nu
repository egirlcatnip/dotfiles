# Initialize Starship prompt
starship init nu | save -f "~/.cache/starship/starship.nu"
source "~/.cache/starship/starship.nu"

# Environment variables
$env.EDITOR = 'micro'
$env.BINSTALL_NO_CONFIRM = "true"
$env.STARSHIP_CONFIG = '.config/starship_tty.toml'

# Path management
def --env append_to_path [new_path: string] {
    $env.PATH = ($env.PATH | split row ":" | append $new_path | path expand | str join ":")
    $env.PATH = ($env.PATH | split row ":" | collect)
}

# Add paths
append_to_path "~/.cargo/bin"
append_to_path "~/.deno/bin"

# Aliases
alias ccc = clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c23 -x c
alias ccp = clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c++23 -x c++

alias gnome-terminal = ptyxis
alias prolog = scryer-prolog


# Terminal specific configuration
if $env.TERM == "linux" {
    # In TTY
    ;
} else {
    # In graphical terminal
    $env.STARSHIP_CONFIG = '.config/starship.toml'
    $env.EDITOR = 'codium'
}
