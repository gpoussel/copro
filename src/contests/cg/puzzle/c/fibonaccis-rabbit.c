// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

#include <stdio.h>

int main() {
    int f0, n;
    scanf("%d %d", &f0, &n);
    int a, b;
    scanf("%d %d", &a, &b);
    // FN can exceed 2^63 (but is < 2^64), so accumulate in unsigned long long.
    unsigned long long f[61];
    for (int i = 0; i <= n; i++) f[i] = 0;
    f[0] = (unsigned long long)f0;
    for (int i = 1; i <= n; i++) {
        unsigned long long total = 0;
        for (int k = a; k <= b; k++)
            if (i - k >= 0) total += f[i - k];
        f[i] = total;
    }
    printf("%llu\n", f[n]);
    return 0;
}
