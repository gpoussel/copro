// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<int> c(n);
    for (int i = 0; i < n; i++) cin >> c[i];
    sort(c.begin(), c.end());
    long long best = LLONG_MAX;
    for (int i = 0; i + m - 1 < n; i++) {
        int diff = c[i + m - 1] - c[i];
        if (diff < best) best = diff;
    }
    cout << best << endl;
}
