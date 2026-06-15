# 🎮 CodinGame Puzzle - sum-of-divisors
# https://www.codingame.com/training/medium/sum-of-divisors

# d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
# of divisors is sum over d of d * floor(n/d).
n = int(input())
total = 0
for d in range(1, n + 1):
    total += d * (n // d)
print(total)
