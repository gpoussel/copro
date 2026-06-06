// @ts-nocheck
// 🎮 CodinGame Puzzle - count-as-i-count
// https://www.codingame.com/training/easy/count-as-i-count

const N = parseInt(readline());
const target = 50;
const remaining = target - N;

// In each round, you can score between 1 and 12 points.
// Ways to score exactly k points in one round:
//   k = 1: 1 way (knock down pin labeled 1)
//   k = 2..12: 2 ways (knock down pin labeled k, OR knock down k pins)
//   k > 12: 0 ways
function waysToScore(k: number): number {
    if (k === 1) return 1;
    if (k >= 2 && k <= 12) return 2;
    return 0;
}

// Count the number of ordered sequences of 1..4 rounds where:
// - Each round scores between 1 and 12 points
// - The total sum equals `remaining`
// - Each round has waysToScore(k) possibilities
// We use recursion/DP: count(rounds_left, points_needed)

function count(roundsLeft: number, needed: number): number {
    if (needed === 0) return 1; // reached exactly 50
    if (roundsLeft === 0) return 0; // no rounds left, didn't reach 50
    if (needed < 0) return 0; // overshot
    if (needed > roundsLeft * 12) return 0; // impossible to reach in remaining rounds

    let total = 0;
    for (let k = 1; k <= 12; k++) {
        const w = waysToScore(k);
        if (w > 0 && needed >= k) {
            total += w * count(roundsLeft - 1, needed - k);
        }
    }
    return total;
}

console.log(count(4, remaining));
