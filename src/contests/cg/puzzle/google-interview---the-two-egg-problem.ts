// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

const N: number = parseInt(readline())
let k = 0
while ((k * (k + 1)) / 2 < N) k++
console.log(k)
