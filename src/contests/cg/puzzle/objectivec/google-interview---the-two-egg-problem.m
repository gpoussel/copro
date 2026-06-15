// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

#import <Foundation/Foundation.h>

int main() {
    long long n;
    scanf("%lld", &n);
    long long k = 0;
    while (k * (k + 1) / 2 < n) k++;
    printf("%lld\n", k);
    return 0;
}
