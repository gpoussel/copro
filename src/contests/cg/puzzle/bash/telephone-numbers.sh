# 🎮 CodinGame Puzzle - telephone-numbers
# https://www.codingame.com/training/medium/telephone-numbers

# Trie stored in an associative array keyed by "nodeId:digit" -> childId.
read n
declare -A nodes
cable=0
nextid=1
for ((t = 0; t < n; t++)); do
    read -r number
    cur=0
    len=${#number}
    for ((j = 0; j < len; j++)); do
        d=${number:j:1}
        key="$cur:$d"
        if [[ -z ${nodes[$key]} ]]; then
            nodes[$key]=$nextid
            ((nextid++))
            ((cable++))
        fi
        cur=${nodes[$key]}
    done
done
echo "$cable"
