// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

import std.stdio, std.string;

void main() {
    string line = readln.strip;
    int balance = 0, best = 0;
    foreach (i, c; line) {
        if (c == '<') balance++;
        else balance--;
        if (balance < 0) break;
        if (balance == 0) best = cast(int) i + 1;
    }
    writeln(best);
}
