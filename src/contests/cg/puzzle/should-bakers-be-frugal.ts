// 🎮 CodinGame Puzzle - should-bakers-be-frugal
// https://www.codingame.com/training/easy/should-bakers-be-frugal

const [side, diameter] = readline().split(" ").map(Number)

const radius = diameter / 2
const biscuitArea = Math.PI * radius * radius

function cutBiscuits(squareSide: number): number {
  const cols = Math.floor(squareSide / diameter)
  return cols * cols
}

// Wasteful baker: just cut once
const wastefulCount = cutBiscuits(side)

// Frugal baker: keep reforming remaining dough into a new square
let frugalCount = 0
let currentSide = side

while (true) {
  const biscuitsThisRound = cutBiscuits(currentSide)
  if (biscuitsThisRound === 0) break

  frugalCount += biscuitsThisRound

  // Remaining dough area
  const squareArea = currentSide * currentSide
  const usedArea = biscuitsThisRound * biscuitArea
  const remainingArea = squareArea - usedArea

  // Reform into a new square
  currentSide = Math.sqrt(remainingArea)
}

console.log(frugalCount - wastefulCount)
