// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

import std.stdio, std.conv, std.string;

void main() {
    // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
    while (true) {
        int maxHeight = -1, maxIndex = 0;
        foreach (i; 0 .. 8) {
            int h = readln.strip.to!int;
            if (h > maxHeight) {
                maxHeight = h;
                maxIndex = i;
            }
        }
        writeln(maxIndex);
        stdout.flush();
    }
}
