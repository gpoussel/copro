# 🎮 CodinGame Puzzle - horse-racing-duals
# https://www.codingame.com/training/easy/horse-racing-duals

read n
arr=()
for ((i = 0; i < n; i++)); do
    read x
    arr+=("$x")
done
mapfile -t sorted < <(printf '%s\n' "${arr[@]}" | sort -n)
minDiff=999999999999999999
for ((i = 1; i < n; i++)); do
    diff=$(( sorted[i] - sorted[i - 1] ))
    (( diff < minDiff )) && minDiff=$diff
done
echo "$minDiff"
