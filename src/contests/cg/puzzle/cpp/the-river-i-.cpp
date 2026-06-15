// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

#include <iostream>
using namespace std;

long long digitSum(long long x) {
    long long s = 0;
    while (x > 0) {
        s += x % 10;
        x /= 10;
    }
    return s;
}

int main() {
    long long a, b;
    cin >> a >> b;
    while (a != b) {
        if (a < b) a += digitSum(a);
        else b += digitSum(b);
    }
    cout << a << endl;
}
