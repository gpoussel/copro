// 🎮 CodinGame Puzzle - the-grand-festival---ii
// https://www.codingame.com/training/medium/the-grand-festival---ii

const weeks = parseInt(readline())
const maxStreak = parseInt(readline())
const prizes: number[] = []
for (let i = 0; i < weeks; i++) prizes.push(parseInt(readline()))

// best[i][c]: max prize from week i onward, having played c consecutive weeks just before
const best: number[][] = []
for (let i = 0; i <= weeks; i++) best.push(new Array<number>(maxStreak + 1).fill(0))
for (let i = weeks - 1; i >= 0; i--) {
  for (let c = 0; c <= maxStreak; c++) {
    const rest = best[i + 1][0]
    const play = c < maxStreak ? prizes[i] + best[i + 1][c + 1] : -1
    best[i][c] = Math.max(rest, play)
  }
}

// Rebuild the path, preferring to play on ties
const played: number[] = []
let streak = 0
for (let i = 0; i < weeks; i++) {
  if (streak < maxStreak && prizes[i] + best[i + 1][streak + 1] >= best[i + 1][0]) {
    played.push(i + 1)
    streak++
  } else streak = 0
}
console.log(played.join(">"))
