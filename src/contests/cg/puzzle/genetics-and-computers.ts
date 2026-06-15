// 🎮 CodinGame Puzzle - genetics-and-computers
// https://www.codingame.com/training/easy/genetics-and-computers

const [parent1, parent2] = readline().split(" ")
const ratio: string[] = readline().split(":")

const gametes = (p: string): string[] => {
  const a = [p[0], p[1]]
  const b = [p[2], p[3]]
  const out: string[] = []
  for (const x of a) {
    for (const y of b) {
      out.push(x + y)
    }
  }
  return out
}

const orderPair = (x: string, y: string): string => {
  // dominant (uppercase) before recessive (lowercase)
  if (x.toUpperCase() === x && y.toLowerCase() === y) return x + y
  if (y.toUpperCase() === y && x.toLowerCase() === x) return y + x
  // same case: keep uppercase ordering consistent
  return x <= y ? x + y : y + x
}

const normalize = (g1: string, g2: string): string => {
  // g1 = aAbB shape "XY", g2 = "XY" -> characteristic A: g1[0],g2[0]; B: g1[1],g2[1]
  const charA = orderPair(g1[0], g2[0])
  const charB = orderPair(g1[1], g2[1])
  return charA + charB
}

const counts: Map<string, number> = new Map()
for (const g1 of gametes(parent1)) {
  for (const g2 of gametes(parent2)) {
    const key = normalize(g1, g2)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
}

const values: number[] = ratio.map(r => counts.get(r) ?? 0)

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const g = values.reduce((acc, v) => gcd(acc, v), 0)
const divisor = g === 0 ? 1 : g

console.log(values.map(v => v / divisor).join(":"))
