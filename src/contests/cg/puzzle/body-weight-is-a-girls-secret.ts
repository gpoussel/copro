// @ts-nocheck
// 🎮 CodinGame Puzzle - body-weight-is-a-girls-secret
// https://www.codingame.com/training/easy/body-weight-is-a-girls-secret

const sums = readline().trim().split(' ').map(Number);
sums.sort((a, b) => a - b);

// There are 5 girls with weights a0 <= a1 <= a2 <= a3 <= a4.
// We get all C(5,2)=10 pairwise sums (sorted).
// Key facts:
//   sums[0] = a0+a1  (always the smallest pair)
//   sums[1] = a0+a2  (always the second smallest)
//   sums[9] = a3+a4  (always the largest)
//   S = (sum of all 10 pairwise sums) / 4  (each individual appears in 4 pairs)
//
// Strategy: try each candidate value for a0 in range [1, sums[0]/2].
// Given a0, derive a1=sums[0]-a0, a2=sums[1]-a0, then greedily pick the next
// smallest remaining sum as a0+a3, and finally compute a4=S-a0-a1-a2-a3.
// Validate that all expected pairwise sums are present.

const totalSum = sums.reduce((acc, v) => acc + v, 0);
const S = totalSum / 4; // sum of the 5 individual weights

function removeFirst(arr: number[], val: number): boolean {
    const idx = arr.indexOf(val);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    return true;
}

function tryWithA0(a0: number): number[] | null {
    const remaining = [...sums];

    const a1 = sums[0] - a0;
    if (a1 < a0) return null; // enforce ordering

    const a2 = sums[1] - a0;
    if (a2 < a1) return null;

    // Remove the three pairs involving only a0,a1,a2
    if (!removeFirst(remaining, a0 + a1)) return null;
    if (!removeFirst(remaining, a0 + a2)) return null;
    if (!removeFirst(remaining, a1 + a2)) return null;

    // Next smallest remaining must be a0+a3 (since a0 is the smallest individual)
    const a3 = remaining[0] - a0;
    if (a3 < a2) return null;

    if (!removeFirst(remaining, a0 + a3)) return null;
    if (!removeFirst(remaining, a1 + a3)) return null;
    if (!removeFirst(remaining, a2 + a3)) return null;

    const a4 = S - a0 - a1 - a2 - a3;
    if (a4 < a3) return null;

    if (!removeFirst(remaining, a0 + a4)) return null;
    if (!removeFirst(remaining, a1 + a4)) return null;
    if (!removeFirst(remaining, a2 + a4)) return null;
    if (!removeFirst(remaining, a3 + a4)) return null;

    if (remaining.length !== 0) return null;

    return [a0, a1, a2, a3, a4];
}

// a0 <= a1 means a0 <= sums[0]/2
const maxA0 = Math.floor(sums[0] / 2);
let answer: number[] | null = null;
for (let a0 = 1; a0 <= maxA0; a0++) {
    answer = tryWithA0(a0);
    if (answer) break;
}

console.log(answer!.join(' '));
