// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int t = 0; t < n; t++) {
        string strip;
        cin >> strip;
        int drops = 0;
        size_t j = 0;
        while (j < strip.size()) {
            if (strip[j] == 'f') {
                // Drop at j covers j, j+1, j+2 — skip past all 3.
                drops++;
                j += 3;
            } else {
                j++;
            }
        }
        cout << drops << "\n";
    }
}
