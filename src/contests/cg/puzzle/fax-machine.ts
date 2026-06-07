// @ts-nocheck
// 🎮 CodinGame Puzzle - fax-machine
// https://www.codingame.com/training/easy/fax-machine

const W = parseInt(readline());
const H = parseInt(readline());
const counts = readline().split(' ').map(Number);

// Build pixel array: start with black ('*'), alternate with white (' ')
const pixels: string[] = [];
let color = '*';
for (const count of counts) {
  for (let i = 0; i < count; i++) {
    pixels.push(color);
  }
  color = color === '*' ? ' ' : '*';
}

// Output H rows, each W pixels wide, surrounded by '|'
for (let row = 0; row < H; row++) {
  const start = row * W;
  const rowPixels = pixels.slice(start, start + W);
  // Pad with spaces if not enough pixels (shouldn't happen per spec)
  while (rowPixels.length < W) rowPixels.push(' ');
  console.log('|' + rowPixels.join('') + '|');
}
