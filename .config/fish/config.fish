# Initialize Starship prompt
mkdir -p /tmp/starship
starship init fish >"/tmp/starship/starship.fish"
source "/tmp/starship/starship.fish"

# Environment variables
set fish_greeting
set -x BINSTALL_NO_CONFIRM true

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
alias gcc='gcc -Wall -Wpedantic -Wextra -Wno-deprecated-declarations -x c'
alias g++='g++ -Wall -Wpedantic -Wextra -Wno-deprecated-declarations -x c++'

# Terminal specific configuration
if test "$TERM" = linux
    # In TTY
    export EDITOR='micro'

    :
else
    # In graphical terminal
    export EDITOR='code'

    :
end

if test "$SSH_CONNECTION"
    # In SSH
    export EDITOR='micro'
    :
else
    # Not in SSH
    :
end
