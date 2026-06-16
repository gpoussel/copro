// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

import 'dart:io';

void main() {
  int n = int.parse(stdin.readLineSync()!.trim());
  // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
  int inner = n >= 2 ? n - 2 : 0;
  print(n * n * n - inner * inner * inner);
}
