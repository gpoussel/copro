// 🎮 CodinGame Puzzle - minimal-number-of-swaps
// https://www.codingame.com/training/medium/minimal-number-of-swaps

// With k ones total, they must occupy the first k slots. Each 0 currently in
// those first k slots can be swapped with a misplaced 1, so the answer is the
// number of zeros among the first k positions.
const n: number = parseInt(readline())
const arr: number[] = readline().split(" ").map(Number)
const k = arr.filter(x => x === 1).length
let zerosInFront = 0
for (let i = 0; i < k; i++) {
  if (arr[i] === 0) zerosInFront++
}
console.log(zerosInFront)
