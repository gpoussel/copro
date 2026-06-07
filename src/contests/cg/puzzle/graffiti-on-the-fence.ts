// @ts-nocheck
// 🎮 CodinGame Puzzle - graffiti-on-the-fence
// https://www.codingame.com/training/easy/graffiti-on-the-fence

const L = parseInt(readline());
const N = parseInt(readline());

const segments: [number, number][] = [];
for (let i = 0; i < N; i++) {
    const parts = readline().split(' ');
    segments.push([parseInt(parts[0]), parseInt(parts[1])]);
}

// Sort segments by start, then merge overlapping/touching ones
segments.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

const merged: [number, number][] = [];
for (const [st, ed] of segments) {
    if (merged.length === 0 || merged[merged.length - 1][1] < st) {
        merged.push([st, ed]);
    } else {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], ed);
    }
}

// Find gaps between merged painted sections (and at fence boundaries)
const unpainted: [number, number][] = [];

let prev = 0;
for (const [st, ed] of merged) {
    if (prev < st) {
        unpainted.push([prev, st]);
    }
    prev = Math.max(prev, ed);
}
// Check end of fence
if (prev < L) {
    unpainted.push([prev, L]);
}

if (unpainted.length === 0) {
    console.log('All painted');
} else {
    for (const [st, ed] of unpainted) {
        console.log(st + ' ' + ed);
    }
}
