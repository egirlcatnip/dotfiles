# Nushell Config File
#
# version = "0.101.0"

mkdir ($nu.data-dir | path join "vendor/autoload")
starship init nu | save -f ($nu.data-dir | path join "vendor/autoload/starship.nu")

if $env.TERM == "linux" {
    $env.STARSHIP_CONFIG = "/home/egirlcatnip/.config/starship/starship_tty.toml"
    $env.EDITOR = "hx"

} else {
    $env.STARSHIP_CONFIG = "/home/egirlcatnip/.config/starship/starship.toml"
    $env.EDITOR = "codium"
}

$env.PATH = ($env.PATH | append "/home/egirlcatnip/.cargo/bin")
