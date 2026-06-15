# 🎮 CodinGame Puzzle - the-fastest
# https://www.codingame.com/training/medium/the-fastest

# Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
export LC_ALL=C
read n
best=""
for ((i = 0; i < n; i++)); do
    read t
    if [[ -z $best || $t < $best ]]; then best=$t; fi
done
echo "$best"
