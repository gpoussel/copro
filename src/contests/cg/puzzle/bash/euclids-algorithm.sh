# 🎮 CodinGame Puzzle - euclids-algorithm
# https://www.codingame.com/training/easy/euclids-algorithm

read a b
x=$a
y=$b
while (( y != 0 )); do
    q=$((x / y))
    r=$((x % y))
    echo "$x=$y*$q+$r"
    x=$y
    y=$r
done
echo "GCD($a,$b)=$x"
