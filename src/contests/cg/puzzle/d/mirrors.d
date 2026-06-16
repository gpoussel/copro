// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

import std.stdio, std.conv, std.string, std.array, std.algorithm;

void main() {
    readln;
    auto r = readln.strip.split.map!(to!double).array;
    double reflected = 0.0;
    foreach_reverse (ri; r) {
        double denom = 1 - ri * reflected;
        reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom);
    }
    writefln("%.4f", reflected);
}
