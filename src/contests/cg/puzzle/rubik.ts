// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

const N: number = parseInt(readline(), 10)
// Visible mini-cubes = all cubes minus the hidden inner cube of side N-2.
const inner = N >= 2 ? N - 2 : 0
console.log(N * N * N - inner * inner * inner)
