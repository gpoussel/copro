// @ts-nocheck
// 🎮 CodinGame Puzzle - rectangle-partition
// https://www.codingame.com/training/easy/rectangle-partition

const [w, h, countX, countY] = readline().split(' ').map(Number);
const xMeasurements = readline().split(' ').map(Number);
const yMeasurements = readline().split(' ').map(Number);

// Build x boundary coordinates: 0, x1, x2, ..., w
const xCoords = [0, ...xMeasurements, w];
// Build y boundary coordinates: 0, y1, y2, ..., h
const yCoords = [0, ...yMeasurements, h];

// Compute all possible widths (distances between any two x boundaries)
// and count how many times each appears
const xWidthCount = new Map<number, number>();
for (let i = 0; i < xCoords.length; i++) {
    for (let j = i + 1; j < xCoords.length; j++) {
        const dist = xCoords[j] - xCoords[i];
        xWidthCount.set(dist, (xWidthCount.get(dist) || 0) + 1);
    }
}

// Compute all possible heights (distances between any two y boundaries)
// and count how many times each appears
const yHeightCount = new Map<number, number>();
for (let i = 0; i < yCoords.length; i++) {
    for (let j = i + 1; j < yCoords.length; j++) {
        const dist = yCoords[j] - yCoords[i];
        yHeightCount.set(dist, (yHeightCount.get(dist) || 0) + 1);
    }
}

// Count squares: for each size that appears as both a width and a height,
// multiply the counts
let count = 0;
for (const [size, xCount] of xWidthCount) {
    const yCount = yHeightCount.get(size);
    if (yCount !== undefined) {
        count += xCount * yCount;
    }
}

console.log(count);
