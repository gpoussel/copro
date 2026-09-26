// 🎮 CodinGame Puzzle - minimax-exercise
// https://www.codingame.com/training/medium/minimax-exercise

const [depth, branching] = readline().split(" ").map(Number)
const leaves = readline().trim().split(/\s+/).map(Number)
let visited = 0

function alphaBeta(level: number, index: number, alpha: number, beta: number, maximizing: boolean): number {
  visited++
  if (level === depth) return leaves[index]
  let best = maximizing ? -Infinity : Infinity
  for (let i = 0; i < branching; i++) {
    const score = alphaBeta(level + 1, index * branching + i, alpha, beta, !maximizing)
    if (maximizing) {
      best = Math.max(best, score)
      alpha = Math.max(alpha, best)
    } else {
      best = Math.min(best, score)
      beta = Math.min(beta, best)
    }
    if (alpha >= beta) break
  }
  return best
}

const rootScore = alphaBeta(0, 0, -Infinity, Infinity, true)
console.log(`${rootScore} ${visited}`)
