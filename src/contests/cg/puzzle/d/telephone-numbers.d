// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

import std.stdio, std.conv, std.string;

class Node {
    Node[char] ch;
}

void main() {
    int n = readln.strip.to!int;
    auto root = new Node();
    long cable = 0;
    foreach (_; 0 .. n) {
        string number = readln.strip;
        auto node = root;
        foreach (d; number) {
            if (d !in node.ch) {
                node.ch[d] = new Node();
                cable++;
            }
            node = node.ch[d];
        }
    }
    writeln(cable);
}
