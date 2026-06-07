// @ts-nocheck
// 🎮 CodinGame Puzzle - hooch-clash
// https://www.codingame.com/training/easy/hooch-clash

const [orbSizeMin, orbSizeMax] = readline().split(' ').map(Number);
const [g1, g2] = readline().split(' ').map(Number);

const target = g1 ** 3 + g2 ** 3;

// Precompute cube roots: for each possible s in [orbSizeMin, orbSizeMax], store s³
// We want pairs (s1, s2) with s1 <= s2, both in range, s1³ + s2³ = target

// Build a set of all cubes in range for quick lookup
const cubeSet = new Map<number, number>(); // cube value -> diameter
for (let s = orbSizeMin; s <= orbSizeMax; s++) {
  cubeSet.set(s ** 3, s);
}

// Find all valid pairs
let bestFun: [number, number] | null = null;
let bestFunScore = -1;
let hasValid = false;

for (let s1 = orbSizeMin; s1 <= orbSizeMax; s1++) {
  const s1cube = s1 ** 3;
  if (s1cube > target) break; // s2 would be negative

  const s2cube = target - s1cube;
  const s2 = cubeSet.get(s2cube);
  if (s2 === undefined) continue;
  if (s2 < s1) continue; // avoid duplicates (s1 <= s2)

  // Valid clash found (s1³ + s2³ = target, both in range)
  hasValid = true;

  // Check if fun: all four orbs distinct
  const glowingSet = new Set([g1, g2]);
  if (!glowingSet.has(s1) && !glowingSet.has(s2) && s1 !== s2) {
    // Fun clash! Score = |s1² - s2²|
    const score = Math.abs(s1 ** 2 - s2 ** 2);
    if (score > bestFunScore) {
      bestFunScore = score;
      bestFun = [s1, s2];
    }
  }
}

if (bestFun !== null) {
  console.log(bestFun[0] + ' ' + bestFun[1]);
} else if (hasValid) {
  console.log('VALID');
} else {
  console.log('NO CLASH');
}
