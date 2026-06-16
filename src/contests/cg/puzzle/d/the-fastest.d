// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

import std.stdio, std.conv, std.string;

void main() {
    // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
    int n = readln.strip.to!int;
    string best = "";
    foreach (_; 0 .. n) {
        string t = readln.strip;
        if (best == "" || t < best) best = t;
    }
    writeln(best);
}
