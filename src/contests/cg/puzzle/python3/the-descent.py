# 🎮 CodinGame Puzzle - the-descent
# https://www.codingame.com/training/easy/the-descent

# Game loop: each turn, read 8 mountain heights and fire on the tallest one.
while True:
    max_height = -1
    max_index = 0
    for i in range(8):
        mountain_h = int(input())
        if mountain_h > max_height:
            max_height = mountain_h
            max_index = i
    print(max_index)
