// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

#include <iostream>
using namespace std;

int main() {
    int f0, n;
    cin >> f0 >> n;
    int a, b;
    cin >> a >> b;
    // FN can exceed 2^63 (but is < 2^64), so accumulate in unsigned long long.
    unsigned long long f[61] = {0};
    f[0] = (unsigned long long)f0;
    for (int i = 1; i <= n; i++) {
        unsigned long long total = 0;
        for (int k = a; k <= b; k++)
            if (i - k >= 0) total += f[i - k];
        f[i] = total;
    }
    cout << f[n] << endl;
}
