// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

import 'dart:io';

void main() {
  int n = int.parse(stdin.readLineSync()!.trim());
  int k = 0;
  while (k * (k + 1) ~/ 2 < n) k++;
  print(k);
}
