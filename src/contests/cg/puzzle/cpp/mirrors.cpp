// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

#include <iostream>
#include <iomanip>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<double> r(n);
    for (int i = 0; i < n; i++) cin >> r[i];
    double reflected = 0.0;
    for (int i = n - 1; i >= 0; i--) {
        double ri = r[i];
        double denom = 1 - ri * reflected;
        reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom);
    }
    cout << fixed << setprecision(4) << reflected << endl;
}
