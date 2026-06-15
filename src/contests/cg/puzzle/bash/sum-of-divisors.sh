# 🎮 CodinGame Puzzle - sum-of-divisors
# https://www.codingame.com/training/medium/sum-of-divisors

# d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
# of divisors is sum over d of d * floor(n/d).
read n
total=0
for ((d = 1; d <= n; d++)); do
    total=$((total + d * (n / d)))
done
echo "$total"
