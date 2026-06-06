// @ts-nocheck
// 🎮 CodinGame Puzzle - blowing-fuse
// https://www.codingame.com/training/easy/blowing-fuse

const [n, m, c] = readline().split(' ').map(Number);
const consumptions = readline().split(' ').map(Number);
const clicks = readline().split(' ').map(Number);

const powered = new Array(n).fill(false);
let current = 0;
let maxCurrent = 0;
let blown = false;

for (const id of clicks) {
  const idx = id - 1;
  if (powered[idx]) {
    powered[idx] = false;
    current -= consumptions[idx];
  } else {
    powered[idx] = true;
    current += consumptions[idx];
  }
  if (current > c) {
    blown = true;
    break;
  }
  if (current > maxCurrent) {
    maxCurrent = current;
  }
}

if (blown) {
  console.log('Fuse was blown.');
} else {
  console.log('Fuse was not blown.');
  console.log(`Maximal consumed current was ${maxCurrent} A.`);
}
