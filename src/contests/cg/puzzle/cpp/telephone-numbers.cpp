// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

#include <iostream>
#include <string>
#include <map>
using namespace std;

struct Node {
    map<char, Node *> ch;
};

int main() {
    int n;
    cin >> n;
    Node *root = new Node();
    long long cable = 0;
    for (int i = 0; i < n; i++) {
        string num;
        cin >> num;
        Node *node = root;
        for (char d : num) {
            if (node->ch.find(d) == node->ch.end()) {
                node->ch[d] = new Node();
                cable++;
            }
            node = node->ch[d];
        }
    }
    cout << cable << endl;
}
