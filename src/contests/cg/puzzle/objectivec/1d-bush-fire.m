// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

#import <Foundation/Foundation.h>
#include <string.h>

static char strip[1000006];

int main() {
    int n;
    scanf("%d", &n);
    for (int t = 0; t < n; t++) {
        scanf("%1000000s", strip);
        int len = strlen(strip);
        int drops = 0, j = 0;
        while (j < len) {
            if (strip[j] == 'f') {
                // Drop at j covers j, j+1, j+2 — skip past all 3.
                drops++;
                j += 3;
            } else {
                j++;
            }
        }
        printf("%d\n", drops);
    }
    return 0;
}
