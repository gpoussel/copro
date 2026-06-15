# 🎮 CodinGame Puzzle - 1d-bush-fire
# https://www.codingame.com/training/easy/1d-bush-fire

read n
for ((t = 0; t < n; t++)); do
    read -r strip
    drops=0
    j=0
    len=${#strip}
    while (( j < len )); do
        if [[ ${strip:j:1} == "f" ]]; then
            # Drop at j covers j, j+1, j+2 — skip past all 3.
            ((drops++))
            j=$((j + 3))
        else
            ((j++))
        fi
    done
    echo "$drops"
done
