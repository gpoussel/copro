# 🎮 CodinGame Puzzle - max-area
# https://www.codingame.com/training/easy/max-area

input()
a = list(map(int, input().split()))
left = 0
right = len(a) - 1
best = 0
while left < right:
    height = min(a[left], a[right])
    area = height * (right - left)
    if area > best:
        best = area
    if a[left] < a[right]:
        left += 1
    else:
        right -= 1
print(best)
