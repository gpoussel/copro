// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int left = 0, right = n - 1;
    long long best = 0;
    while (left < right) {
        long long h = min(a[left], a[right]);
        long long area = h * (right - left);
        if (area > best) best = area;
        if (a[left] < a[right]) left++;
        else right--;
    }
    cout << best << endl;
}
