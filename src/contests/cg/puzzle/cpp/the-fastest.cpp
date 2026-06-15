// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

#include <iostream>
#include <string>
using namespace std;

int main() {
    // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
    int n;
    cin >> n;
    string best = "";
    for (int i = 0; i < n; i++) {
        string t;
        cin >> t;
        if (best == "" || t < best) best = t;
    }
    cout << best << endl;
}
