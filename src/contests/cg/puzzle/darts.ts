// @ts-nocheck
// 🎮 CodinGame Puzzle - darts
// https://www.codingame.com/training/easy/darts

const size = parseInt(readline());
const half = size / 2;

const n = parseInt(readline());
const names: string[] = [];
for (let i = 0; i < n; i++) {
    names.push(readline().trim());
}

const scores: Map<string, number> = new Map();
for (const name of names) {
    scores.set(name, 0);
}

const t = parseInt(readline());
for (let i = 0; i < t; i++) {
    const parts = readline().trim().split(' ');
    const name = parts[0];
    const x = parseInt(parts[1]);
    const y = parseInt(parts[2]);

    // Check diamond: |x| + |y| <= half
    if (Math.abs(x) + Math.abs(y) <= half) {
        scores.set(name, (scores.get(name) || 0) + 15);
    }
    // Check circle: x^2 + y^2 <= half^2
    else if (x * x + y * y <= half * half) {
        scores.set(name, (scores.get(name) || 0) + 10);
    }
    // Check square: |x| <= half AND |y| <= half
    else if (Math.abs(x) <= half && Math.abs(y) <= half) {
        scores.set(name, (scores.get(name) || 0) + 5);
    }
    // Outside square: 0 points
}

// Sort by score descending, then by original order (stable sort preserves ties)
const sorted = names.slice().sort((a, b) => (scores.get(b) || 0) - (scores.get(a) || 0));

for (const name of sorted) {
    console.log(`${name} ${scores.get(name) || 0}`);
}
