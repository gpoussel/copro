# 🎮 CodinGame Puzzle - the-river-i-
# https://www.codingame.com/training/easy/the-river-i-


def digit_sum(n):
    s = 0
    while n > 0:
        s += n % 10
        n //= 10
    return s


a = int(input())
b = int(input())
while a != b:
    if a < b:
        a += digit_sum(a)
    else:
        b += digit_sum(b)
print(a)
