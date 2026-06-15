// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

import 'dart:io';

void main() {
  var parts = stdin.readLineSync()!.trim().split(' ');
  int a = int.parse(parts[0]);
  int b = int.parse(parts[1]);
  int x = a, y = b;
  while (y != 0) {
    int q = x ~/ y;
    int r = x % y;
    print('$x=$y*$q+$r');
    x = y;
    y = r;
  }
  print('GCD($a,$b)=$x');
}
