# Initialize Starship prompt
mkdir -p "/tmp/starship"
starship init bash > "/tmp/starship/starship.sh"
source "/tmp/starship/starship.sh"

# Path managment
# Function to append to PATH if not already present
append_to_path() {
    if [[ ":$PATH:" != *":$1:"* ]]; then
        export PATH="$PATH:$1"
    fi
}

# Add paths
append_to_path "$HOME/.cargo/bin"
append_to_path "$HOME/.deno/bin"

# Aliases
alias gcc='gcc -Wall -Wpedantic -Wextra -Wno-deprecated-declarations -x c'
alias g++='g++ -Wall -Wpedantic -Wextra -Wno-deprecated-declarations -x c++'

# Terminal specific configuration
if [ "$TERM" == "linux" ]; then {
  # In TTY
  export EDITOR='micro'
  :
} else {
  # In graphical terminal
  export EDITOR='code'
  :
} fi

if [ "$SSH_CONNECTION" ]; then {
  # In SSH
  export EDITOR='micro'
  :
} else {
  # Not in SSH
  :
} fi

