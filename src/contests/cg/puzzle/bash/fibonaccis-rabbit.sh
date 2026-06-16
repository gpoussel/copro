# 🎮 CodinGame Puzzle - fibonaccis-rabbit
# https://www.codingame.com/training/easy/fibonaccis-rabbit

# FN can exceed 2^63 (but is < 2^64); bc keeps the sums exact.
read f0 n
read a b
declare -a f
for ((i = 0; i <= n; i++)); do f[i]=0; done
f[0]=$f0
for ((i = 1; i <= n; i++)); do
    total=0
    for ((k = a; k <= b; k++)); do
        if (( i - k >= 0 )); then total=$(echo "$total + ${f[i - k]}" | bc); fi
    done
    f[i]=$total
done
echo "${f[n]}"
