// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

import 'dart:io';

int digitSum(int x) {
  int s = 0;
  while (x > 0) {
    s += x % 10;
    x ~/= 10;
  }
  return s;
}

void main() {
  int a = int.parse(stdin.readLineSync()!.trim());
  int b = int.parse(stdin.readLineSync()!.trim());
  while (a != b) {
    if (a < b) {
      a += digitSum(a);
    } else {
      b += digitSum(b);
    }
  }
  print(a);
}
