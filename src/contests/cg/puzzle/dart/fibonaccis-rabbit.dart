// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

import 'dart:io';

void main() {
  var first = stdin.readLineSync()!.trim().split(' ');
  int f0 = int.parse(first[0]);
  int n = int.parse(first[1]);
  var second = stdin.readLineSync()!.trim().split(' ');
  int a = int.parse(second[0]);
  int b = int.parse(second[1]);
  // FN can exceed 2^63 (but is < 2^64), so accumulate with BigInt.
  List<BigInt> f = List.filled(n + 1, BigInt.zero);
  f[0] = BigInt.from(f0);
  for (int i = 1; i <= n; i++) {
    BigInt total = BigInt.zero;
    for (int k = a; k <= b; k++) {
      if (i - k >= 0) total += f[i - k];
    }
    f[i] = total;
  }
  print(f[n]);
}
