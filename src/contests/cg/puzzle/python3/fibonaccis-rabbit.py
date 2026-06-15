# 🎮 CodinGame Puzzle - fibonaccis-rabbit
# https://www.codingame.com/training/easy/fibonaccis-rabbit

f0, n = map(int, input().split())
a, b = map(int, input().split())
f = [0] * (n + 1)
f[0] = f0
for i in range(1, n + 1):
    total = 0
    for k in range(a, b + 1):
        if i - k >= 0:
            total += f[i - k]
    f[i] = total
print(f[n])
