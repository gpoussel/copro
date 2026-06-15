# 🎮 CodinGame Puzzle - the-descent
# https://www.codingame.com/training/easy/the-descent

# Game loop: each turn, read 8 mountain heights and fire on the tallest one.
while true; do
    maxHeight=-1
    maxIndex=0
    for ((i = 0; i < 8; i++)); do
        read h
        if (( h > maxHeight )); then
            maxHeight=$h
            maxIndex=$i
        fi
    done
    echo "$maxIndex"
done
