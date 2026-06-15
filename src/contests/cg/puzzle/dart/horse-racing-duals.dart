// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

import 'dart:io';

void main() {
  int n = int.parse(stdin.readLineSync()!.trim());
  List<int> s = [];
  for (int i = 0; i < n; i++) s.add(int.parse(stdin.readLineSync()!.trim()));
  s.sort();
  int minDiff = 1 << 62;
  for (int i = 1; i < n; i++) {
    int diff = s[i] - s[i - 1];
    if (diff < minDiff) minDiff = diff;
  }
  print(minDiff);
}
