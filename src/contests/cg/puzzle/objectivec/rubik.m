// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

#import <Foundation/Foundation.h>

int main() {
    long long n;
    scanf("%lld", &n);
    // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
    long long inner = n >= 2 ? n - 2 : 0;
    printf("%lld\n", n * n * n - inner * inner * inner);
    return 0;
}
