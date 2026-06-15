# 🎮 CodinGame Puzzle - mirrors
# https://www.codingame.com/training/easy/mirrors

input()
r = list(map(float, input().split()))
reflected = 0.0
for ri in reversed(r):
    denom = 1 - ri * reflected
    reflected = ri + (0 if denom == 0 else ((1 - ri) * (1 - ri) * reflected) / denom)
print(f"{reflected:.4f}")
