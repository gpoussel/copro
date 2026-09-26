// 🎮 CodinGame Puzzle - rational-number-tree
// https://www.codingame.com/training/medium/rational-number-tree
// Stern-Brocot tree. All values stay below 2^53 so plain numbers are exact.

const testCount = +readline()

const fractionToPath = (p: number, q: number): string => {
  let path = ""
  while (p !== q) {
    if (p < q) {
      // Run of L moves: q -= p repeatedly while staying above p
      const steps = q % p === 0 ? q / p - 1 : Math.floor(q / p)
      path += "L".repeat(steps)
      q -= steps * p
    } else {
      const steps = p % q === 0 ? p / q - 1 : Math.floor(p / q)
      path += "R".repeat(steps)
      p -= steps * q
    }
  }
  return path
}

const pathToFraction = (path: string): string => {
  let [ln, ld, rn, rd] = [0, 1, 1, 0]
  for (const move of path) {
    const mn = ln + rn
    const md = ld + rd
    if (move === "L") [rn, rd] = [mn, md]
    else [ln, ld] = [mn, md]
  }
  return `${ln + rn}/${ld + rd}`
}

for (let i = 0; i < testCount; i++) {
  const line = readline().trim()
  if (line.indexOf("/") >= 0) {
    const [p, q] = line.split("/").map(Number)
    console.log(fractionToPath(p, q))
  } else console.log(pathToFraction(line))
}
