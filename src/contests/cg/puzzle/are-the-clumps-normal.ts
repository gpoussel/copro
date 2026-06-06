// @ts-nocheck
// 🎮 CodinGame Puzzle - are-the-clumps-normal
// https://www.codingame.com/training/easy/are-the-clumps-normal

const N = readline();
const digits = N.split('').map(Number);

function countClumps(base: number): number {
  if (base === 1) {
    // All digits have remainder 0 mod 1, so one clump always
    return 1;
  }
  let clumps = 1;
  let prevRem = digits[0] % base;
  for (let i = 1; i < digits.length; i++) {
    const rem = digits[i] % base;
    if (rem !== prevRem) {
      clumps++;
      prevRem = rem;
    }
  }
  return clumps;
}

let prevCount = countClumps(1);
let result = 'Normal';

for (let b = 2; b <= 9; b++) {
  const count = countClumps(b);
  if (count < prevCount) {
    result = String(b);
    break;
  }
  prevCount = count;
}

console.log(result);
