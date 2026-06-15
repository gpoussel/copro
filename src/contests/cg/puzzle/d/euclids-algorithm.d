// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

import std.stdio, std.conv, std.string, std.array;

void main() {
    auto parts = readln.strip.split;
    long a = parts[0].to!long, b = parts[1].to!long;
    long x = a, y = b;
    while (y != 0) {
        long q = x / y, r = x % y;
        writeln(x, "=", y, "*", q, "+", r);
        x = y;
        y = r;
    }
    writeln("GCD(", a, ",", b, ")=", x);
}
