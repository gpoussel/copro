# 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
# https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

n = int(input())
k = 0
while k * (k + 1) // 2 < n:
    k += 1
print(k)
