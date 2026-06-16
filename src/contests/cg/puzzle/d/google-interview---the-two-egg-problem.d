// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

import std.stdio, std.conv, std.string;

void main() {
    long n = readln.strip.to!long;
    long k = 0;
    while (k * (k + 1) / 2 < n) k++;
    writeln(k);
}
