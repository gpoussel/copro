// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

import std.stdio, std.conv, std.string;

long digitSum(long x) {
    long s = 0;
    while (x > 0) {
        s += x % 10;
        x /= 10;
    }
    return s;
}

void main() {
    long a = readln.strip.to!long;
    long b = readln.strip.to!long;
    while (a != b) {
        if (a < b) a += digitSum(a);
        else b += digitSum(b);
    }
    writeln(a);
}
