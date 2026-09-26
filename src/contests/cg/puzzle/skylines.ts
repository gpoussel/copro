// 🎮 CodinGame Puzzle - skylines
// https://www.codingame.com/training/expert/skylines

// Rasterize the silhouette on unit cells [x, x+1), compress equal-height runs,
// then trim ground on both ends. Each run is one horizontal line, and every
// boundary between runs (plus the two outer walls) is one vertical line.
const count = parseInt(readline())
const profile = new Array<number>(5001).fill(0)
for (let i = 0; i < count; i++) {
  const [h, x1, x2] = readline().split(" ").map(Number)
  for (let x = x1; x < x2; x++) if (profile[x] < h) profile[x] = h
}
const runs: number[] = []
for (const h of profile) if (runs.length === 0 || runs[runs.length - 1] !== h) runs.push(h)
while (runs.length && runs[0] === 0) runs.shift()
while (runs.length && runs[runs.length - 1] === 0) runs.pop()
console.log(runs.length ? 2 * runs.length + 1 : 0)
