# 🎮 CodinGame Puzzle - horse-racing-duals
# https://www.codingame.com/training/easy/horse-racing-duals

n = int(input())
strengths = sorted(int(input()) for _ in range(n))
min_diff = float("inf")
for i in range(1, len(strengths)):
    diff = strengths[i] - strengths[i - 1]
    if diff < min_diff:
        min_diff = diff
print(min_diff)
