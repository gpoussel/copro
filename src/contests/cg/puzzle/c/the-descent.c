// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

#include <stdio.h>

int main() {
    // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
    while (1) {
        int maxHeight = -1, maxIndex = 0;
        for (int i = 0; i < 8; i++) {
            int h;
            scanf("%d", &h);
            if (h > maxHeight) {
                maxHeight = h;
                maxIndex = i;
            }
        }
        printf("%d\n", maxIndex);
        fflush(stdout);
    }
    return 0;
}
