// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

#include <stdio.h>
#include <stdlib.h>

static int cmp(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    int *c = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &c[i]);
    qsort(c, n, sizeof(int), cmp);
    long long best = 9000000000000000000LL;
    for (int i = 0; i + m - 1 < n; i++) {
        int diff = c[i + m - 1] - c[i];
        if (diff < best) best = diff;
    }
    printf("%lld\n", best);
    free(c);
    return 0;
}
