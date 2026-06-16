// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

import 'dart:io';

void main() {
  int n = int.parse(stdin.readLineSync()!.trim());
  Map<String, dynamic> root = {};
  int cable = 0;
  for (int i = 0; i < n; i++) {
    String number = stdin.readLineSync()!.trim();
    Map<String, dynamic> node = root;
    for (int j = 0; j < number.length; j++) {
      String d = number[j];
      if (!node.containsKey(d)) {
        node[d] = <String, dynamic>{};
        cable++;
      }
      node = node[d] as Map<String, dynamic>;
    }
  }
  print(cable);
}
