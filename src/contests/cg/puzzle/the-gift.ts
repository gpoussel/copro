// 🎮 CodinGame Puzzle - the-gift
// https://www.codingame.com/training/medium/the-gift

const n: number = parseInt(readline())
const c: number = parseInt(readline())

const budgets: number[] = []
for (let i = 0; i < n; i++) {
  budgets.push(parseInt(readline()))
}

budgets.sort((a: number, b: number) => a - b)

const total: number = budgets.reduce((acc: number, b: number) => acc + b, 0)
if (total < c) {
  console.log("IMPOSSIBLE")
} else {
  const contributions: number[] = []
  let remaining: number = c

  for (let i = 0; i < n; i++) {
    const people: number = n - i
    const share: number = Math.floor(remaining / people)
    const contribution: number = Math.min(budgets[i], share)
    contributions.push(contribution)
    remaining -= contribution
  }

  // contributions are already in ascending order (water-filling on sorted budgets)
  for (const contrib of contributions) {
    console.log(contrib)
  }
}
