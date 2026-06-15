// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

#import <Foundation/Foundation.h>
#include <string.h>

int main() {
    // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
    int n;
    scanf("%d", &n);
    char best[64];
    best[0] = '\0';
    char t[64];
    for (int i = 0; i < n; i++) {
        scanf("%63s", t);
        if (best[0] == '\0' || strcmp(t, best) < 0) strcpy(best, t);
    }
    printf("%s\n", best);
    return 0;
}
