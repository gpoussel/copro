# 🎮 CodinGame Puzzle - rubik
# https://www.codingame.com/training/medium/rubik

n = int(input())
# Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
inner = n - 2 if n >= 2 else 0
print(n ** 3 - inner ** 3)
