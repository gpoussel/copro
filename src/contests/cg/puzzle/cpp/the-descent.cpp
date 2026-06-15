// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

#include <iostream>
using namespace std;

int main() {
    // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
    while (true) {
        int maxHeight = -1, maxIndex = 0;
        for (int i = 0; i < 8; i++) {
            int h;
            cin >> h;
            if (h > maxHeight) {
                maxHeight = h;
                maxIndex = i;
            }
        }
        cout << maxIndex << endl;
    }
}
