// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

import std.stdio, std.conv, std.string;

void main() {
    long n = readln.strip.to!long;
    // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
    long inner = n >= 2 ? n - 2 : 0;
    writeln(n * n * n - inner * inner * inner);
}
