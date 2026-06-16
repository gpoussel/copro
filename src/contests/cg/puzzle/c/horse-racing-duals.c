// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

#include <stdio.h>
#include <stdlib.h>

static int cmp(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int main() {
    int n;
    scanf("%d", &n);
    int *s = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &s[i]);
    qsort(s, n, sizeof(int), cmp);
    long long minDiff = 9000000000000000000LL;
    for (int i = 1; i < n; i++) {
        int d = s[i] - s[i - 1];
        if (d < minDiff) minDiff = d;
    }
    printf("%lld\n", minDiff);
    free(s);
    return 0;
}
