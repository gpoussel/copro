// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

import std.stdio, std.conv, std.string, std.array;

void main() {
    auto l1 = readln.strip.split;
    int f0 = l1[0].to!int, n = l1[1].to!int;
    auto l2 = readln.strip.split;
    int a = l2[0].to!int, b = l2[1].to!int;
    // FN can exceed 2^63 (but is < 2^64), so accumulate in ulong.
    ulong[] f = new ulong[n + 1];
    f[0] = cast(ulong) f0;
    for (int i = 1; i <= n; i++) {
        ulong total = 0;
        for (int k = a; k <= b; k++)
            if (i - k >= 0) total += f[i - k];
        f[i] = total;
    }
    writeln(f[n]);
}
