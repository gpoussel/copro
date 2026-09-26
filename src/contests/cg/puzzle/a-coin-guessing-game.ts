// 🎮 CodinGame Puzzle - a-coin-guessing-game
// https://www.codingame.com/training/medium/a-coin-guessing-game

const [n, t] = readline().split(" ").map(Number)
// allowed[i][j]: odd number 2i+1 may still share a coin with even number 2j+2
const allowed: boolean[][] = []
for (let i = 0; i < n; i++) allowed.push(new Array<boolean>(n).fill(true))
for (let k = 0; k < t; k++) {
  const seen = readline().split(" ").map(Number)
  const odds = seen.filter(v => v % 2 === 1)
  const evens = seen.filter(v => v % 2 === 0)
  // Numbers visible at the same time are on different coins
  for (const o of odds) for (const e of evens) allowed[(o - 1) / 2][e / 2 - 1] = false
}

// The perfect matching is guaranteed unique: find any with augmenting paths (Kuhn)
const matchOfEven: number[] = new Array(n).fill(-1)
function augment(odd: number, visited: boolean[]): boolean {
  for (let e = 0; e < n; e++) {
    if (!allowed[odd][e] || visited[e]) continue
    visited[e] = true
    if (matchOfEven[e] < 0 || augment(matchOfEven[e], visited)) {
      matchOfEven[e] = odd
      return true
    }
  }
  return false
}
for (let i = 0; i < n; i++) augment(i, new Array<boolean>(n).fill(false))

const answer: number[] = new Array(n).fill(0)
matchOfEven.forEach((odd, e) => (answer[odd] = 2 * e + 2))
console.log(answer.join(" "))
