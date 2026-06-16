// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

import 'dart:io';

void main() {
  var first = stdin.readLineSync()!.trim().split(' ');
  int n = int.parse(first[0]);
  int m = int.parse(first[1]);
  List<int> candies =
      stdin.readLineSync()!.trim().split(' ').map(int.parse).toList();
  candies.sort();
  int best = 1 << 62;
  for (int i = 0; i + m - 1 < n; i++) {
    int diff = candies[i + m - 1] - candies[i];
    if (diff < best) best = diff;
  }
  print(best);
}
