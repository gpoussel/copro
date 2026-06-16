// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    scanf("%d", &n);
    long long *a = malloc(n * sizeof(long long));
    for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
    int left = 0, right = n - 1;
    long long best = 0;
    while (left < right) {
        long long h = a[left] < a[right] ? a[left] : a[right];
        long long area = h * (right - left);
        if (area > best) best = area;
        if (a[left] < a[right]) left++;
        else right--;
    }
    printf("%lld\n", best);
    free(a);
    return 0;
}
