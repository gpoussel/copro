# 🎮 CodinGame Puzzle - telephone-numbers
# https://www.codingame.com/training/medium/telephone-numbers

n = int(input())
root = {}
cable_units = 0
for _ in range(n):
    number = input().strip()
    node = root
    for digit in number:
        if digit not in node:
            node[digit] = {}
            cable_units += 1
        node = node[digit]
print(cable_units)
