// @ts-nocheck
// 🎮 CodinGame Puzzle - create-the-longest-sequence-of-1s
// https://www.codingame.com/training/easy/create-the-longest-sequence-of-1s

const b = readline();
let best = 0;

for (let i = 0; i < b.length; i++) {
    if (b[i] === '0') {
        // Count consecutive 1s to the left of position i
        let left = 0;
        for (let j = i - 1; j >= 0 && b[j] === '1'; j--) {
            left++;
        }
        // Count consecutive 1s to the right of position i
        let right = 0;
        for (let j = i + 1; j < b.length && b[j] === '1'; j++) {
            right++;
        }
        // Flipping this 0 creates a run of left + 1 + right
        const total = left + 1 + right;
        if (total > best) {
            best = total;
        }
    }
}

console.log(best);
