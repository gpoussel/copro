// 🎮 CodinGame Puzzle - pachinko-jackpot
// https://www.codingame.com/training/medium/pachinko-jackpot

const boardHeight = +readline()
// best[j]: largest counter total when hitting peg j of the current row
let best: number[] = []
for (let row = 0; row < boardHeight; row++) {
  const increments = readline().trim().split("").map(Number)
  const next: number[] = []
  for (let j = 0; j <= row; j++) {
    const fromLeft = j > 0 ? best[j - 1] : -Infinity
    const fromAbove = j < row ? best[j] : -Infinity
    next.push((row === 0 ? 0 : Math.max(fromLeft, fromAbove)) + increments[j])
  }
  best = next
}

let jackpot = 0
for (let k = 0; k <= boardHeight; k++) {
  const prize = +readline()
  const reach = Math.max(k > 0 ? best[k - 1] : -Infinity, k < boardHeight ? best[k] : -Infinity)
  jackpot = Math.max(jackpot, reach * prize)
}
console.log(jackpot)
