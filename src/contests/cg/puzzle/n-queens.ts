// 🎮 CodinGame Puzzle - n-queens
// https://www.codingame.com/training/hard/n-queens

const n: number = parseInt(readline(), 10)
const full = (1 << n) - 1
let count = 0
function solve(cols: number, d1: number, d2: number): void {
  if (cols === full) {
    count++
    return
  }
  let avail = full & ~(cols | d1 | d2)
  while (avail) {
    const bit = avail & -avail
    avail -= bit
    solve(cols | bit, (d1 | bit) << 1, (d2 | bit) >> 1)
  }
}
solve(0, 0, 0)
console.log(count)
