// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    struct Node *ch[10];
} Node;

static Node *newNode(void) {
    return calloc(1, sizeof(Node));
}

int main() {
    int n;
    scanf("%d", &n);
    Node *root = newNode();
    long long cable = 0;
    char num[64];
    for (int i = 0; i < n; i++) {
        scanf("%63s", num);
        Node *node = root;
        for (int j = 0; num[j]; j++) {
            int d = num[j] - '0';
            if (!node->ch[d]) {
                node->ch[d] = newNode();
                cable++;
            }
            node = node->ch[d];
        }
    }
    printf("%lld\n", cable);
    return 0;
}
