# 🎮 CodinGame Puzzle - distributing-candy
# https://www.codingame.com/training/easy/distributing-candy

read n m
read -a arr
mapfile -t sorted < <(printf '%s\n' "${arr[@]}" | sort -n)
best=999999999999999999
for ((i = 0; i + m - 1 < n; i++)); do
    diff=$(( sorted[i + m - 1] - sorted[i] ))
    (( diff < best )) && best=$diff
done
echo "$best"
