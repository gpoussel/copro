// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
    long long inner = n >= 2 ? n - 2 : 0;
    cout << n * n * n - inner * inner * inner << endl;
}
