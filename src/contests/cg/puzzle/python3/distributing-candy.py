# 🎮 CodinGame Puzzle - distributing-candy
# https://www.codingame.com/training/easy/distributing-candy

n, m = map(int, input().split())
candies = sorted(map(int, input().split()))
best = float("inf")
for i in range(0, n - m + 1):
    diff = candies[i + m - 1] - candies[i]
    if diff < best:
        best = diff
print(best)
