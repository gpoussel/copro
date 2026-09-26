// 🎮 CodinGame Puzzle - execution-circle
// https://www.codingame.com/training/hard/execution-circle

// Josephus problem with k = 2: writing N = 2^m + L, the survivor sits 2L places
// after the starting person in the counting direction.

const [n, s] = readline().trim().split(/\s+/).map(BigInt)
const dir = readline().trim()

let pow = 1n
while (pow * 2n <= n) pow *= 2n
const offset = 2n * (n - pow)
const shift = dir === "LEFT" ? offset : -offset
const pos = (((s - 1n + shift) % n) + n) % n

console.log(String(pos + 1n))
