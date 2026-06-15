// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

#import <Foundation/Foundation.h>

int main() {
    // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
    // sum of divisors is sum over d of d * floor(n/d).
    long long n;
    scanf("%lld", &n);
    long long total = 0;
    for (long long d = 1; d <= n; d++) total += d * (n / d);
    printf("%lld\n", total);
    return 0;
}
