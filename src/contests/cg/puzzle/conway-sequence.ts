// @ts-nocheck
// 🎮 CodinGame Puzzle - conway-sequence
// https://www.codingame.com/training/medium/conway-sequence

const R = parseInt(readline());
const L = parseInt(readline());

// Build the Conway look-and-say sequence starting from R
// Line 1 is just [R], each subsequent line is the RLE of the previous line
let current: number[] = [R];

for (let line = 1; line < L; line++) {
  const next: number[] = [];
  let i = 0;
  while (i < current.length) {
    const val = current[i];
    let count = 1;
    while (i + count < current.length && current[i + count] === val) {
      count++;
    }
    // RLE encoding: count first, then value
    next.push(count, val);
    i += count;
  }
  current = next;
}

console.log(current.join(' '));
