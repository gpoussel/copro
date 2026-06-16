// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

import std.stdio, std.conv, std.string, std.algorithm;

void main() {
    int n = readln.strip.to!int;
    int[] s;
    foreach (_; 0 .. n) s ~= readln.strip.to!int;
    s.sort();
    long minDiff = long.max;
    for (int i = 1; i < n; i++) {
        int d = s[i] - s[i - 1];
        if (d < minDiff) minDiff = d;
    }
    writeln(minDiff);
}
