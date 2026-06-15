// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

import std.stdio, std.conv, std.string;

void main() {
    // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
    // sum of divisors is sum over d of d * floor(n/d).
    long n = readln.strip.to!long;
    long total = 0;
    for (long d = 1; d <= n; d++) total += d * (n / d);
    writeln(total);
}
