# 🎮 CodinGame Puzzle - teds-compiler
# https://www.codingame.com/training/easy/teds-compiler

read -r line
balance=0
best=0
len=${#line}
for ((i = 0; i < len; i++)); do
    c=${line:i:1}
    if [[ $c == "<" ]]; then ((balance++)); else ((balance--)); fi
    (( balance < 0 )) && break
    (( balance == 0 )) && best=$((i + 1))
done
echo "$best"
