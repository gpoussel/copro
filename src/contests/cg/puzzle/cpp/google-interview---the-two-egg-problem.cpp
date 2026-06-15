// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long k = 0;
    while (k * (k + 1) / 2 < n) k++;
    cout << k << endl;
}
