// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

import 'dart:io';

void main() {
  // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
  // of divisors is sum over d of d * floor(n/d).
  int n = int.parse(stdin.readLineSync()!.trim());
  int total = 0;
  for (int d = 1; d <= n; d++) total += d * (n ~/ d);
  print(total);
}
