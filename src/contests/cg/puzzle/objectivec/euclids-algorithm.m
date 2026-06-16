// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

#import <Foundation/Foundation.h>

int main() {
    long long a, b;
    scanf("%lld %lld", &a, &b);
    long long x = a, y = b;
    while (y != 0) {
        long long q = x / y, r = x % y;
        printf("%lld=%lld*%lld+%lld\n", x, y, q, r);
        x = y;
        y = r;
    }
    printf("GCD(%lld,%lld)=%lld\n", a, b, x);
    return 0;
}
