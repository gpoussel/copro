// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

#include <stdio.h>

long long digitSum(long long x) {
    long long s = 0;
    while (x > 0) {
        s += x % 10;
        x /= 10;
    }
    return s;
}

int main() {
    long long a, b;
    scanf("%lld", &a);
    scanf("%lld", &b);
    while (a != b) {
        if (a < b) a += digitSum(a);
        else b += digitSum(b);
    }
    printf("%lld\n", a);
    return 0;
}
