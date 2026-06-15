// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

import 'dart:io';

void main() {
  String line = stdin.readLineSync()!.trimRight();
  int balance = 0, best = 0;
  for (int i = 0; i < line.length; i++) {
    if (line[i] == '<') {
      balance++;
    } else {
      balance--;
    }
    if (balance < 0) break;
    if (balance == 0) best = i + 1;
  }
  print(best);
}
