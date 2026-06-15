// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

#import <Foundation/Foundation.h>
#include <string.h>

static char line[1000006];

int main() {
    if (!fgets(line, sizeof(line), stdin)) return 0;
    int len = strlen(line);
    while (len > 0 && (line[len - 1] == '\n' || line[len - 1] == '\r' || line[len - 1] == ' '))
        line[--len] = '\0';
    int balance = 0, best = 0;
    for (int i = 0; i < len; i++) {
        if (line[i] == '<') balance++;
        else balance--;
        if (balance < 0) break;
        if (balance == 0) best = i + 1;
    }
    printf("%d\n", best);
    return 0;
}
