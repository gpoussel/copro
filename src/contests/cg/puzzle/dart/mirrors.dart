// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

import 'dart:io';

void main() {
  stdin.readLineSync();
  List<double> r =
      stdin.readLineSync()!.trim().split(' ').map(double.parse).toList();
  double reflected = 0.0;
  for (int i = r.length - 1; i >= 0; i--) {
    double ri = r[i];
    double denom = 1 - ri * reflected;
    reflected =
        ri + (denom == 0 ? 0.0 : ((1 - ri) * (1 - ri) * reflected) / denom);
  }
  print(reflected.toStringAsFixed(4));
}
