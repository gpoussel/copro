// 🎮 CodinGame Puzzle - what-a-dessert
// https://www.codingame.com/training/easy/what-a-dessert

const [e, f, s, b]: number[] = readline()
  .split(" ")
  .map((x: string) => parseInt(x, 10))

const recipes: { name: string; e: number; f: number; s: number; b: number }[] = [
  { name: "Cake", e: 3, f: 180, s: 100, b: 100 },
  { name: "Cookie", e: 1, f: 100, s: 150, b: 50 },
  { name: "Muffin", e: 2, f: 150, s: 100, b: 150 },
]

let bestCount: number = -1
let bestName: string = ""
for (const r of recipes) {
  const count: number = Math.min(Math.floor(e / r.e), Math.floor(f / r.f), Math.floor(s / r.s), Math.floor(b / r.b))
  if (count > bestCount) {
    bestCount = count
    bestName = r.name
  }
}

console.log(`${bestCount} ${bestName}`)
