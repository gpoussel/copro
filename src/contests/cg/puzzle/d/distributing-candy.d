// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

import std.stdio, std.conv, std.string, std.array, std.algorithm;

void main() {
    auto first = readln.strip.split;
    int n = first[0].to!int, m = first[1].to!int;
    auto candies = readln.strip.split.map!(to!int).array;
    candies.sort();
    long best = long.max;
    for (int i = 0; i + m - 1 < n; i++) {
        int diff = candies[i + m - 1] - candies[i];
        if (diff < best) best = diff;
    }
    writeln(best);
}
