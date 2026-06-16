# 🎮 CodinGame Puzzle - the-river-i-
# https://www.codingame.com/training/easy/the-river-i-

read a
read b
while (( a != b )); do
    if (( a < b )); then x=$a; else x=$b; fi
    s=0
    t=$x
    while (( t > 0 )); do
        s=$(( s + t % 10 ))
        t=$(( t / 10 ))
    done
    if (( a < b )); then a=$(( a + s )); else b=$(( b + s )); fi
done
echo "$a"
