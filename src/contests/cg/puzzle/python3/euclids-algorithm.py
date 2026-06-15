# 🎮 CodinGame Puzzle - euclids-algorithm
# https://www.codingame.com/training/easy/euclids-algorithm

a, b = map(int, input().split())
x, y = a, b
while y != 0:
    q = x // y
    r = x % y
    print(f"{x}={y}*{q}+{r}")
    x, y = y, r
print(f"GCD({a},{b})={x}")
