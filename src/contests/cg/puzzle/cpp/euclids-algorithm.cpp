// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    long long x = a, y = b;
    while (y != 0) {
        long long q = x / y, r = x % y;
        cout << x << "=" << y << "*" << q << "+" << r << "\n";
        x = y;
        y = r;
    }
    cout << "GCD(" << a << "," << b << ")=" << x << "\n";
}
