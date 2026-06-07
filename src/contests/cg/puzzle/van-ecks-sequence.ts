// @ts-nocheck
// 🎮 CodinGame Puzzle - van-ecks-sequence
// https://www.codingame.com/training/easy/van-ecks-sequence

const a1 = parseInt(readline());
const n = parseInt(readline());

// lastSeen[v] = last index (1-based) at which value v was seen
// We use a Map for O(1) lookup, avoiding array allocation issues for large values
const lastSeen = new Map<number, number>();

let current = a1;

for (let i = 1; i < n; i++) {
    const prev = lastSeen.get(current);
    lastSeen.set(current, i); // record position i (1-based) for current value

    if (prev === undefined) {
        // current value has not been seen before this position
        current = 0;
    } else {
        // distance from last occurrence to current position
        current = i - prev;
    }
}

console.log(current);
