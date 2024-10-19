function dt
set data $HOME/.config/btdt/data
set cmd (cat $data | fzf -d'\t' --with-nth 2 --preview='echo -e "\033[1m"{1}"\033[0m""\n\n"{3}' | cut -f1)
if test -z $cmd
    return
end
set cmdname (cat $data | grep $cmd | cut -f2)
set cmddesc (cat $data | grep $cmd | cut -f3)

echo "commandline: " $cmd
echo "short name : " $cmdname
if test -n $cmddesc
    echo "description: " $cmddesc
end
commandline --replace -- $cmd
end
