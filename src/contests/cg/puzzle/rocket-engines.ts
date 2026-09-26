// 🎮 CodinGame Puzzle - rocket-engines
// https://www.codingame.com/training/medium/rocket-engines

const [a, b] = readline().split(" ").map(Number)
const [c, d] = readline().split(" ").map(Number)

// Row/column increments keep a - b - c + d invariant, and any matrix with that
// invariant is reachable (up to a common offset). The best spread splits it in two.
const invariant = Math.abs(a - b - c + d)
console.log(Math.ceil(invariant / 2))
