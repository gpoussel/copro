// 🎮 CodinGame Puzzle - rocks-papers-scissors-es
// https://www.codingame.com/training/easy/rocks-papers-scissors-es

const n: number = parseInt(readline())
const moves: string[] = []
for (let i = 0; i < n; i++) moves.push(readline().trim())
const beats: { [k: string]: string } = { Rock: "Scissors", Scissors: "Paper", Paper: "Rock" }
const beatedBy: { [k: string]: string } = { Scissors: "Rock", Paper: "Scissors", Rock: "Paper" }

let bestWins = -1
let bestMove = ""
let bestPos = -1

for (let p = 0; p < n; p++) {
  const myMove = beatedBy[moves[p]]
  let wins = 0
  for (let k = 0; k < n; k++) {
    const opp = moves[(p + k) % n]
    if (beats[myMove] === opp) {
      wins++
    } else if (myMove === opp) {
      // draw, continue
    } else {
      break
    }
  }
  if (wins > bestWins) {
    bestWins = wins
    bestMove = myMove
    bestPos = p
  }
}
console.log(bestMove)
console.log(bestPos)
