function bt --argument cmd

    if test -z $cmd
    	builtin history merge
        set cmd (builtin history | fzf --header="Choose a command to save" --no-sort)
    end
    if test -z $cmd
        echo Aborted
        return 2
    end
    echo Saving \"$cmd\"...
    read -p "echo Name of command:\ " name
    if test -z $name
        echo No name given, aborting
        return 1
    end
    read -p "echo Longer description \(optional\):\ " desc
    if test ! -d $HOME/.config/btdt
        mkdir -p $HOME/.config/btdt
        echo \nCreating btdt directory...
    end
    set btdt_data $HOME/.config/btdt/data
    if test ! -e $btdt_data
        touch $btdt_data
        echo \nCreating btdt_data file
    end
    set result $cmd\t$name\t$desc
    echo $result >>$btdt_data
    echo \nOK
end
