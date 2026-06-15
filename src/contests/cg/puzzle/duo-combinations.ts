// 🎮 CodinGame Puzzle - duo-combinations
// https://www.codingame.com/

const total: number = parseInt(readline(), 10)
const symbols: string[] = []
for (let i = 0; i < total; i++) {
  symbols.push(readline())
}

if (total === 1) {
  console.log(symbols[0])
} else {
  const out: string[] = []
  for (let p = 0; p < total - 1; p++) {
    const zero: string = symbols[p]
    const one: string = symbols[p + 1]
    for (let mask = 0; mask < 1 << total; mask++) {
      // Skip the all-zero combination for pairs after the first,
      // since it duplicates the all-one combination of the previous pair.
      if (p > 0 && mask === 0) {
        continue
      }
      let line: string = ""
      for (let b = total - 1; b >= 0; b--) {
        line += (mask >> b) & 1 ? one : zero
      }
      out.push(line)
    }
  }
  console.log(out.join("\n"))
}
