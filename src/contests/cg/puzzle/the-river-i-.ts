// @ts-nocheck
// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

function digitSum(n: number): number {
  let s = 0;
  while (n > 0) {
    s += n % 10;
    n = Math.floor(n / 10);
  }
  return s;
}

function next(n: number): number {
  return n + digitSum(n);
}

const r1 = parseInt(readline());
const r2 = parseInt(readline());

let a = r1;
let b = r2;

while (a !== b) {
  if (a < b) {
    a = next(a);
  } else {
    b = next(b);
  }
}

console.log(a);
