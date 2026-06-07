// @ts-nocheck
// 🎮 CodinGame Puzzle - sum-of-spirals-diagonals
// https://www.codingame.com/training/easy/sum-of-spirals-diagonals

// For a spiral of size NxN, the diagonal corners of each ring contribute to the sum.
//
// For an odd N: rings shrink by 2 each time: N, N-2, N-4, ..., 3, 1 (center).
//   For a ring of side length k (k >= 3), the 4 corner values are:
//     top-right = start + (k-1)
//     bot-right = start + 2*(k-1)
//     bot-left  = start + 3*(k-1)
//     top-left  = start (which is 1 for outermost ring)
//   Where "start" is the first value in that ring (top-left corner).
//   The center (k=1) contributes just 1 value.
//
// For an even N: rings shrink by 2: N, N-2, ..., 4, 2.
//   For the innermost 2x2 ring, all 4 cells are on the diagonals.
//   For larger rings (k >= 3), same 4-corner formula applies.
//
// "start" of each ring: outer ring starts at 1, next inner ring starts at N^2 - (N-2)^2 + 1...
// Actually: the outermost ring uses values 1..N^2-(N-2)^2, so inner ring starts at N^2-(N-2)^2+1? No.
// Let's think differently: spiralling inward, the outermost ring's last value = N^2-(N-2)^2 = 4*(N-1).
// Actually: total cells in ring of side k = k^2 - (k-2)^2 = 4*(k-1).
// The outermost NxN ring has the FIRST 4*(N-1) numbers starting at... wait.
// The spiral fills from outside IN, so outermost ring = values (N-2)^2+1 to N^2.
// Inner-most ring fills first values 1..(N-2)^2, then outer rings.
//
// Let me re-read: "spiralling from 1 to N^2 inward" — starts at top-left, goes right, down, left, up, inward.
// For N=3: top-left=1, so outermost ring has 1,2,3,4,5,6,7,8 and center=9.
// Top-left of outermost ring = 1 = start.
// Corners of outermost ring: top-left=1, top-right=3, bot-right=5, bot-left=7.
// Center = 9.
//
// For N=5: outermost ring starts at 1, has 4*(5-1)=16 values: 1..16, corners: 1,5,13,17... wait no.
// Let's trace: N=5 spiral goes: 1,2,3,4,5 (top), 6,7,8,9 (right going down), 10,11,12,13 (bottom going left), 14,15,16 (left going up), then inner 3x3 starts at 17.
// So outer ring: 1..16, corners = 1,5,13,17? No: top-right=5, bot-right=5+4*2-1...
// Side length 5: step = 5-1=4. Corners: 1, 1+4=5, 5+4=9... wait that's not right.
// Corner positions in a ring of side k starting at value s:
//   top-left = s, top-right = s+(k-1), bot-right = s+2*(k-1), bot-left = s+3*(k-1)
// For N=5, s=1, k=5: 1, 5, 9, 13. Next inner ring k=3, s=17: 17, 19, 21, 23. Center=25.
// Sum = 1+5+9+13 + 17+19+21+23 + 25 = 28+80+25=133. YES! Matches N=5 → 133.
//
// General: for ring of side k with start s, corners sum = 4*s + 6*(k-1).
// We iterate k from N down to 3 (step -2), plus center (if N is odd).
// Start of ring of side k: it's the value right after the inner (k-2)x(k-2) ring fills.
// The inner region = everything inside this ring = (k-2)^2 cells = values 1..(k-2)^2... NO.
// Actually the spiral goes inward, so outermost ring has values 1..4*(N-1), next ring has 4*(N-3)+1...no.
//
// From the N=5 example: outermost ring (k=5) has values 1..16 = 1..4*(5-1).
// Inner ring (k=3) has values 17..24 = 4*(5-1)+1 .. 4*(5-1)+4*(3-1).
// Center = 25.
// So: ring k starts at s_k where s_N=1, and s_{k-2} = s_k + 4*(k-1).
//
// For even N (k=2 innermost): k=2, "ring" has 4 values: s, s+1, s+2, s+3.
// For N=4: outermost ring k=4, s=1: corners 1, 4, 7, 10. Sum=22.
//   inner ring k=2, s=13: values 13,14,15,16 — all on diagonals. Sum=58.
//   Total=80. YES!
// For k=2: sum of all 4 = 4*s + 6 = 4*s + 0+1+2+3... wait 4*s+(0+1+2+3)=4*s+6.
// So the same formula 4*s + 6*(k-1) = 4*s + 6*1 = 4*s+6 works for k=2 too!
// But for k=2, are all 4 values on diagonals? Yes (2x2 matrix has all corners on both diagonals).

const n = parseInt(readline());

let sum = 0;
let s = 1; // start value of current outermost ring

for (let k = n; k >= 2; k -= 2) {
  // Add the 4 corner values of ring with side k starting at value s
  // corners: s, s+(k-1), s+2*(k-1), s+3*(k-1)
  // sum of corners = 4*s + 6*(k-1)
  sum += 4 * s + 6 * (k - 1);
  s += 4 * (k - 1); // next ring starts after this ring's cells
}

// If N is odd, add the center cell
if (n % 2 === 1) {
  sum += s; // center value = n*n
}

console.log(sum);
