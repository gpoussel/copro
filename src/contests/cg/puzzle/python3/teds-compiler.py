# 🎮 CodinGame Puzzle - teds-compiler
# https://www.codingame.com/training/easy/teds-compiler

line = input()
balance = 0
best = 0
for i, c in enumerate(line):
    if c == "<":
        balance += 1
    else:
        balance -= 1
    if balance < 0:
        break
    if balance == 0:
        best = i + 1
print(best)
