// @ts-nocheck
// 🎮 CodinGame Puzzle - object-insertion
// https://www.codingame.com/training/easy/object-insertion

const [a, b] = readline().split(' ').map(Number);
const object: string[] = [];
for (let i = 0; i < a; i++) {
    object.push(readline());
}

const [c, d] = readline().split(' ').map(Number);
const grid: string[] = [];
for (let i = 0; i < c; i++) {
    grid.push(readline());
}

// Collect all '*' positions in the object (relative to top-left of bounding box)
const objCells: [number, number][] = [];
for (let r = 0; r < a; r++) {
    for (let col = 0; col < b; col++) {
        if (object[r][col] === '*') {
            objCells.push([r, col]);
        }
    }
}

// Try every possible placement of the object's top-left corner in the grid
const validPlacements: [number, number][] = [];

for (let startRow = 0; startRow <= c - a; startRow++) {
    for (let startCol = 0; startCol <= d - b; startCol++) {
        // Check if placing the object at (startRow, startCol) is valid
        let fits = true;
        for (const [dr, dc] of objCells) {
            const gr = startRow + dr;
            const gc = startCol + dc;
            if (grid[gr][gc] !== '.') {
                fits = false;
                break;
            }
        }
        if (fits) {
            validPlacements.push([startRow, startCol]);
        }
    }
}

console.log(validPlacements.length);

if (validPlacements.length === 1) {
    const [startRow, startCol] = validPlacements[0];
    // Build the resulting grid
    const result: string[][] = grid.map(row => row.split(''));
    for (const [dr, dc] of objCells) {
        result[startRow + dr][startCol + dc] = '*';
    }
    for (const row of result) {
        console.log(row.join(''));
    }
}
