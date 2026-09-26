// 🎮 CodinGame Puzzle - you-have-been-hacked
// https://www.codingame.com/training/easy/you-have-been-hacked

type Stage = "ps" | "bf" | "mi"

// Exclusive upper bound blocked by the firewall at each stage
function thresholds(p: number): Record<Stage, number> {
  if (p >= 7) return { ps: 10000, bf: Infinity, mi: Infinity }
  if (p >= 5) return { ps: 0, bf: 5000, mi: 3000 }
  return { ps: 0, bf: 500, mi: 1000 }
}

const n = parseInt(readline(), 10)
const companies: { name: string; p: number; sums: Record<Stage, number> }[] = []
const byName = new Map<string, (typeof companies)[number]>()
for (let i = 0; i < n; i++) {
  const [name, p] = readline().split(":")
  const company = { name, p: parseInt(p, 10), sums: { ps: 0, bf: 0, mi: 0 } }
  companies.push(company)
  byName.set(name, company)
}

const a = parseInt(readline(), 10)
for (let i = 0; i < a; i++) {
  const [name, type, s] = readline().split(":")
  byName.get(name)!.sums[type as Stage] += parseInt(s, 10)
}

for (const { name, p, sums } of companies) {
  const limits = thresholds(p)
  const hacked = (["ps", "bf", "mi"] as Stage[]).every(stage => sums[stage] >= limits[stage])
  console.log(`${name}:${hacked ? "Hacked" : "Blocked"}`)
}
