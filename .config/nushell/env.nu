# Nushell Config File
#
# version = "0.101.0"

mkdir ($nu.data-dir | path join "vendor/autoload")
starship init nu | save -f ($nu.data-dir | path join "vendor/autoload/starship.nu")

if $env.TERM == "linux" {
  # We're in a tty
  $env.STARSHIP_CONFIG = ($env.HOME | path join '.config/starship_tty.toml')
  $env.EDITOR = 'hx'
} else {
  # We're in a graphical terminal
  $env.STARSHIP_CONFIG = ($env.HOME | path join '.config/starship.toml')
  $env.EDITOR = 'codium'
}

$env.BINSTALL_NO_CONFIRM = "true"

def --env append_to_path [new_path: string] {
    $env.PATH = ($env.PATH | split row ":" | append $new_path | str join ":")

    $env.PATH = ($env.PATH | split row ":" | collect )

}

append_to_path ($env.HOME | path join ".cargo/bin")
append_to_path ($env.HOME | path join ".deno/bin")

alias ccc = clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c23 -x c
alias ccp = clang -Wall -Wpedantic -Wextra -Wno-format -Wno-format-pedantic -Wno-unused-parameter -Wno-newline-eof -Wno-deprecated-declarations --std=c++23 -x c++

alias prolog = scryer-prolog


