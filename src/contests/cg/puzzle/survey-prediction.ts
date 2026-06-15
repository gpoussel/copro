// 🎮 CodinGame Puzzle - survey-prediction
// https://www.codingame.com/training/easy/survey-prediction

const n = parseInt(readline())
type Range = { gender: string; genre: string; min: number; max: number }
const ranges: Map<string, Range> = new Map()
const missing: { age: number; gender: string }[] = []
for (let i = 0; i < n; i++) {
  const parts = readline().split(" ")
  const age = parseInt(parts[0])
  const gender = parts[1]
  if (parts.length >= 3) {
    const genre = parts[2]
    const key = `${gender}|${genre}`
    const r = ranges.get(key)
    if (r) {
      r.min = Math.min(r.min, age)
      r.max = Math.max(r.max, age)
    } else {
      ranges.set(key, { gender, genre, min: age, max: age })
    }
  } else {
    missing.push({ age, gender })
  }
}
const out = missing.map(m => {
  for (const r of ranges.values()) {
    if (r.gender === m.gender && m.age >= r.min && m.age <= r.max) return r.genre
  }
  return "None"
})
console.log(out.join("\n"))
