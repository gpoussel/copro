// 🎮 CodinGame Puzzle - crack-the-trio-code
// https://www.codingame.com/training/easy/crack-the-trio-code

const L: number[] = readline()
  .split(",")
  .map(s => parseInt(s, 10))

const target: Set<number> = new Set(L)
const maxL: number = Math.max(...L)

const triadSums = (a: number, b: number, c: number): Set<number> => {
  const t: number[] = [a, b, c]
  const sums: Set<number> = new Set()
  for (let i = 0; i < 3; i++) {
    sums.add(t[i])
    for (let j = i; j < 3; j++) {
      sums.add(t[i] + t[j])
      for (let k = j; k < 3; k++) {
        sums.add(t[i] + t[j] + t[k])
      }
    }
  }
  return sums
}

const solutions: string[] = []
for (let a = 1; a <= maxL; a++) {
  for (let b = a; b <= maxL; b++) {
    for (let c = b; c <= maxL; c++) {
      const sums: Set<number> = triadSums(a, b, c)
      let ok = true
      for (const v of target) {
        if (!sums.has(v)) {
          ok = false
          break
        }
      }
      if (ok) {
        solutions.push(`${a},${b},${c}`)
        if (solutions.length > 1) break
      }
    }
    if (solutions.length > 1) break
  }
  if (solutions.length > 1) break
}

if (solutions.length === 0) {
  console.log("none")
} else if (solutions.length > 1) {
  console.log("many")
} else {
  console.log(solutions[0])
}
