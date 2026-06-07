// @ts-nocheck
// 🎮 CodinGame Puzzle - unit-fractions
// https://www.codingame.com/training/easy/unit-fractions

const n = parseInt(readline());

// We need to find all pairs (x, y) with x >= y > 0 such that 1/n = 1/x + 1/y
//
// From 1/n = 1/x + 1/y => 1/x = 1/n - 1/y = (y - n) / (ny)
// So x = ny / (y - n)
//
// Let k = y - n (k >= 1, so y = n + k).
// Then x = n(n + k) / k = n^2/k + n.
// For x to be a positive integer, k must divide n^2.
// The condition x >= y means n^2/k + n >= n + k => n^2/k >= k => k^2 <= n^2 => k <= n.
//
// So we enumerate all divisors k of n^2 with 1 <= k <= n.
// For each such k:
//   y = n + k
//   x = n + n^2 / k    (which is always >= y)
//
// Results should be sorted by x descending, i.e., by k ascending (smaller k => larger x).

const n2 = n * n;

// Collect all divisors of n^2 that are <= n
const results: [number, number][] = [];

for (let k = 1; k <= n; k++) {
  if (n2 % k === 0) {
    const y = n + k;
    const x = n + n2 / k;
    results.push([x, y]);
  }
}

// Sort by x descending (k ascending = x descending, but let's be explicit)
results.sort((a, b) => b[0] - a[0]);

for (const [x, y] of results) {
  console.log(`1/${n} = 1/${x} + 1/${y}`);
}
