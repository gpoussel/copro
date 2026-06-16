# 🎮 CodinGame Puzzle - 1d-bush-fire
# https://www.codingame.com/training/easy/1d-bush-fire

n = int(input())
for _ in range(n):
    strip = input()
    drops = 0
    j = 0
    while j < len(strip):
        if strip[j] == "f":
            # Drop at j covers j, j+1, j+2 — skip past all 3.
            drops += 1
            j += 3
        else:
            j += 1
    print(drops)
