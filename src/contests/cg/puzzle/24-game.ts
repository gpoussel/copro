// 🎮 CodinGame Puzzle - 24-game
// https://www.codingame.com/training/medium/24-game

const numbers: number[] = []
for (let i = 0; i < 4; i++) numbers.push(parseInt(readline()))

// Repeatedly combine any two values with any operation until one value remains
const solve = (values: number[]): boolean => {
  if (values.length === 1) return Math.abs(values[0] - 24) < 1e-9
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length; j++) {
      if (i === j) continue
      const rest = values.filter((_, k) => k !== i && k !== j)
      const a = values[i]
      const b = values[j]
      const results = [a + b, a - b, a * b]
      if (b !== 0) results.push(a / b)
      for (const r of results) if (solve(rest.concat([r]))) return true
    }
  }
  return false
}

console.log(solve(numbers) ? "true" : "false")
