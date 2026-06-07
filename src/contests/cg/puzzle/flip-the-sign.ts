// @ts-nocheck
// 🎮 CodinGame Puzzle - flip-the-sign
// https://www.codingame.com/training/easy/flip-the-sign

const [height, width] = readline().split(' ').map(Number);

const grid: number[][] = [];
for (let i = 0; i < height; i++) {
  grid.push(readline().split(' ').map(Number));
}

const mask: string[][] = [];
for (let i = 0; i < height; i++) {
  mask.push(readline().split(' '));
}

const sequence: number[] = [];
for (let r = 0; r < height; r++) {
  for (let c = 0; c < width; c++) {
    if (mask[r][c] === 'X') {
      sequence.push(grid[r][c]);
    }
  }
}

let alternates = true;
for (let i = 1; i < sequence.length; i++) {
  const prevPositive = sequence[i - 1] > 0;
  const currPositive = sequence[i] > 0;
  if (prevPositive === currPositive) {
    alternates = false;
    break;
  }
}

console.log(alternates ? 'true' : 'false');
