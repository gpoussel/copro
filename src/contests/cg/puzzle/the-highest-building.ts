// 🎮 CodinGame Puzzle - the-highest-building
// https://www.codingame.com/training/hard/the-highest-building

// Buildings have no overhang, so each one is a maximal run of "#" on the
// ground row; its height is the tallest column of that run.
const [W, H] = readline().split(" ").map(Number)
const rows: string[] = []
for (let i = 0; i < H; i++) rows.push((readline() ?? "").padEnd(W, " "))

const ground = rows[H - 1]
const buildings: { from: number; to: number; top: number }[] = []
for (let x = 0; x < W; x++) {
  if (ground[x] !== "#" || (x > 0 && ground[x - 1] === "#")) continue
  let end = x
  while (end + 1 < W && ground[end + 1] === "#") end++
  let top = H - 1
  for (let c = x; c <= end; c++) for (let y = 0; y < top; y++) if (rows[y][c] === "#") top = y
  buildings.push({ from: x, to: end, top })
}

const best = Math.min(...buildings.map(b => b.top))
const pictures = buildings
  .filter(b => b.top === best)
  .map(b =>
    rows
      .slice(b.top)
      .map(r => r.slice(b.from, b.to + 1).trimEnd())
      .join("\n")
  )
console.log(pictures.join("\n\n"))
