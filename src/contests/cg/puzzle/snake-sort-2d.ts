// 🎮 CodinGame Puzzle - snake-sort-2d
// https://www.codingame.com/

type Apple = { name: string; row: number; col: number }

const n: number = parseInt(readline(), 10)
const apples: Apple[] = []
for (let i = 0; i < n; i++) {
  const [name, r, c]: string[] = readline().split(" ")
  apples.push({ name, row: parseInt(r, 10), col: parseInt(c, 10) })
}

const rows: number[] = [...new Set<number>(apples.map((a: Apple) => a.row))].sort((a: number, b: number) => a - b)

const result: string[] = []
rows.forEach((row: number, idx: number) => {
  const inRow: Apple[] = apples.filter((a: Apple) => a.row === row)
  inRow.sort((a: Apple, b: Apple) => (idx % 2 === 0 ? a.col - b.col : b.col - a.col))
  for (const a of inRow) {
    result.push(a.name)
  }
})

console.log(result.join(","))
