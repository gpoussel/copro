// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    double r[n];
    for (int i = 0; i < n; i++) scanf("%lf", &r[i]);
    double reflected = 0.0;
    for (int i = n - 1; i >= 0; i--) {
        double ri = r[i];
        double denom = 1 - ri * reflected;
        reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom);
    }
    printf("%.4f\n", reflected);
    return 0;
}
