if status is-interactive

    if test "$TERM" = linux
        set -Ux STARSHIP_CONFIG ~/.config/starship/starship_tty.toml
        set -Ux EDITOR micro
    else
        set -Ux STARSHIP_CONFIG ~/.config/starship/starship.toml
        set -Ux EDITOR code
    end

    set -Ux TERMINAL ptyxis

    bind \b backward-kill-word
    bind \e\[3\;5~ kill-word
    bind -k btab ''


end

set -U fish_greeting
set -Ux FZF_DEFAULT_OPTS_FILE ~/.config/fzf/fzf
set -Ux CARGO_HOME ~/.cargo


function fish_title
    set pwd (pwd)
    echo (string replace -r "^$HOME" "~" $pwd)
end
