// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

import 'dart:io';

void main() {
  int n = int.parse(stdin.readLineSync()!.trim());
  for (int t = 0; t < n; t++) {
    String strip = stdin.readLineSync()!.trimRight();
    int drops = 0, j = 0;
    while (j < strip.length) {
      if (strip[j] == 'f') {
        // Drop at j covers j, j+1, j+2 — skip past all 3.
        drops++;
        j += 3;
      } else {
        j++;
      }
    }
    print(drops);
  }
}
