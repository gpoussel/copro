// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

import std.stdio, std.conv, std.string, std.array, std.algorithm;

void main() {
    readln;
    auto a = readln.strip.split.map!(to!long).array;
    int left = 0, right = cast(int) a.length - 1;
    long best = 0;
    while (left < right) {
        long h = min(a[left], a[right]);
        long area = h * (right - left);
        if (area > best) best = area;
        if (a[left] < a[right]) left++;
        else right--;
    }
    writeln(best);
}
