// @ts-nocheck
// 🎮 CodinGame Puzzle - gravity
// https://www.codingame.com/training/medium/gravity

const [width, height] = readline().split(' ').map(Number);

// Read the grid into columns
const cols: string[][] = Array.from({ length: width }, () => []);

for (let r = 0; r < height; r++) {
    const line = readline();
    for (let c = 0; c < width; c++) {
        cols[c].push(line[c]);
    }
}

// For each column, count '#' and rebuild: dots on top, hashes on bottom
const result: string[][] = Array.from({ length: height }, () => Array(width).fill('.'));

for (let c = 0; c < width; c++) {
    const hashCount = cols[c].filter(ch => ch === '#').length;
    // Place '#' at the bottom rows of this column
    for (let r = height - hashCount; r < height; r++) {
        result[r][c] = '#';
    }
}

// Print the result grid
for (let r = 0; r < height; r++) {
    console.log(result[r].join(''));
}
