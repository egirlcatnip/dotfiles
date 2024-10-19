# Loads starship if starship is installed. Does nothing if 
# starship is not installed

status is-interactive || exit

if type -t starship > /dev/null  
  starship init fish | source
end
