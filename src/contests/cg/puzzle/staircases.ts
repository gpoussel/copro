// 🎮 CodinGame Puzzle - staircases
// https://www.codingame.com/training/hard/staircases

// Partitions of N into distinct parts (0/1 knapsack count), minus the
// single-step partition {N}.

const bricks = parseInt(readline())
const ways: bigint[] = new Array(bricks + 1).fill(0n)
ways[0] = 1n
for (let part = 1; part <= bricks; part++) {
  for (let s = bricks; s >= part; s--) ways[s] += ways[s - part]
}
console.log((ways[bricks] - 1n).toString())
