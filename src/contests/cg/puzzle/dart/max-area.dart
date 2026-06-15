// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

import 'dart:io';

void main() {
  stdin.readLineSync();
  List<int> a = stdin.readLineSync()!.trim().split(' ').map(int.parse).toList();
  int left = 0, right = a.length - 1, best = 0;
  while (left < right) {
    int h = a[left] < a[right] ? a[left] : a[right];
    int area = h * (right - left);
    if (area > best) best = area;
    if (a[left] < a[right]) {
      left++;
    } else {
      right--;
    }
  }
  print(best);
}
