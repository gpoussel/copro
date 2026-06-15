// 🎮 CodinGame Puzzle - rocks-papers-scissors-es
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const moves: string[] = []
for (let i = 0; i < n; i++) {
  moves.push(readline())
}

const beats: Record<string, string> = {
  Rock: "Scissors",
  Scissors: "Paper",
  Paper: "Rock",
}

let bestWins: number = -1
let bestMove: string = ""
let bestStart: number = 0

for (let p = 0; p < n; p++) {
  const move: string = (Object.keys(beats) as string[]).find((m: string): boolean => beats[m] === moves[p]) as string
  let wins: number = 0
  for (let k = 0; k < n; k++) {
    const opp: string = moves[(p + k) % n]
    if (beats[move] === opp) {
      wins++
    } else if (move === opp) {
      continue
    } else {
      break
    }
  }
  if (wins > bestWins) {
    bestWins = wins
    bestMove = move
    bestStart = p
  }
}

console.log(bestMove)
console.log(bestStart)
