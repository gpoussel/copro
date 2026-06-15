// 🎮 CodinGame Puzzle - survey-prediction
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)

type Range = { genre: string; min: number; max: number }
const ranges: Map<string, Range[]> = new Map<string, Range[]>()
const queries: Array<{ age: number; gender: string }> = []

for (let i = 0; i < n; i++) {
  const parts: string[] = readline().split(" ")
  const age: number = parseInt(parts[0], 10)
  const gender: string = parts[1]
  if (parts.length >= 3) {
    const genre: string = parts[2]
    const list: Range[] = ranges.get(gender) ?? []
    const existing: Range | undefined = list.find(r => r.genre === genre)
    if (existing) {
      existing.min = Math.min(existing.min, age)
      existing.max = Math.max(existing.max, age)
    } else {
      list.push({ genre, min: age, max: age })
    }
    ranges.set(gender, list)
  } else {
    queries.push({ age, gender })
  }
}

const out: string[] = []
for (const q of queries) {
  const list: Range[] = ranges.get(q.gender) ?? []
  const match: Range | undefined = list.find(r => q.age >= r.min && q.age <= r.max)
  out.push(match ? match.genre : "None")
}
console.log(out.join("\n"))
