// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

import 'dart:io';

void main() {
  // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
  int n = int.parse(stdin.readLineSync()!.trim());
  String best = "";
  for (int i = 0; i < n; i++) {
    String t = stdin.readLineSync()!.trim();
    if (best == "" || t.compareTo(best) < 0) best = t;
  }
  print(best);
}
