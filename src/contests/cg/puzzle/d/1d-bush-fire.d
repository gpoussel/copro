// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

import std.stdio, std.conv, std.string;

void main() {
    int n = readln.strip.to!int;
    foreach (_; 0 .. n) {
        string row = readln.strip;
        int drops = 0;
        int j = 0;
        while (j < cast(int) row.length) {
            if (row[j] == 'f') {
                // Drop at j covers j, j+1, j+2 — skip past all 3.
                drops++;
                j += 3;
            } else {
                j++;
            }
        }
        writeln(drops);
    }
}
