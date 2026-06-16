// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> s(n);
    for (int i = 0; i < n; i++) cin >> s[i];
    sort(s.begin(), s.end());
    long long minDiff = LLONG_MAX;
    for (int i = 1; i < n; i++) {
        int d = s[i] - s[i - 1];
        if (d < minDiff) minDiff = d;
    }
    cout << minDiff << endl;
}
