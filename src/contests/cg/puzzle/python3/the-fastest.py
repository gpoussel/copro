# 🎮 CodinGame Puzzle - the-fastest
# https://www.codingame.com/training/medium/the-fastest

# Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
n = int(input())
best = ""
for _ in range(n):
    t = input().strip()
    if best == "" or t < best:
        best = t
print(best)
