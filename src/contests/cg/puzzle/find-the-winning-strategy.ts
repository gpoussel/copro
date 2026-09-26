// 🎮 CodinGame Puzzle - find-the-winning-strategy
// https://www.codingame.com/training/medium/find-the-winning-strategy

// Northcott's game: each row is a Nim heap whose size is the gap between both tokens
const rows = parseInt(readline())
readline() // columns

while (true) {
  const players: number[] = []
  const gaps: number[] = []
  for (let i = 0; i < rows; i++) {
    const [xPlayer, xBoss] = readline().split(" ").map(Number)
    players.push(xPlayer)
    gaps.push(xBoss - xPlayer - 1)
  }
  const nimSum = gaps.reduce((acc, g) => acc ^ g, 0)

  let row = -1
  let newGap = 0
  if (nimSum !== 0) {
    for (let i = 0; i < rows && row < 0; i++) {
      if ((gaps[i] ^ nimSum) < gaps[i]) {
        row = i
        newGap = gaps[i] ^ nimSum
      }
    }
  } else {
    // Losing position: stall by moving one step on any open row
    for (let i = 0; i < rows && row < 0; i++) {
      if (gaps[i] > 0) {
        row = i
        newGap = gaps[i] - 1
      }
    }
  }
  console.log(`${row} ${players[row] + gaps[row] - newGap}`)
}
