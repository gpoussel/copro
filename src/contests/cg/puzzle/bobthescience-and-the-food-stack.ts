// 🎮 CodinGame Puzzle - bobthescience-and-the-food-stack
// https://www.codingame.com/training/medium/bobthescience-and-the-food-stack

const [m, n] = readline().split(" ").map(Number)
const weights = readline().trim().split(/\s+/).map(Number)

// Always feed the lightest stack: since each pancake weighs at most d,
// the spread between the heaviest and lightest stack never exceeds d
const totals: number[] = new Array<number>(n).fill(0)
const assignment: number[] = []
for (let i = 0; i < m; i++) {
  let lightest = 0
  for (let s = 1; s < n; s++) if (totals[s] < totals[lightest]) lightest = s
  totals[lightest] += weights[i]
  assignment.push(lightest + 1)
}
console.log(assignment.join(" "))
