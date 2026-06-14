// 🎮 CodinGame Puzzle - crop-circles
// https://www.codingame.com/training/easy/crop-circles

const W = 19
const H = 25
const input = readline().trim()

// true = planted, false = mowed
const grid: boolean[][] = []
for (let y = 0; y < H; y++) {
  const row: boolean[] = []
  for (let x = 0; x < W; x++) row.push(true)
  grid.push(row)
}

const tokens = input.split(/\s+/).filter(t => t.length > 0)

for (const tok of tokens) {
  let op = "MOW"
  let rest = tok
  if (rest.startsWith("PLANTMOW")) {
    op = "PLANTMOW"
    rest = rest.substring("PLANTMOW".length)
  } else if (rest.startsWith("PLANT")) {
    op = "PLANT"
    rest = rest.substring("PLANT".length)
  }
  const cx = rest.charCodeAt(0) - 97 // 'a'
  const cy = rest.charCodeAt(1) - 97
  const d = parseInt(rest.substring(2))
  const r = d / 2
  const r2 = r * r
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r2) {
        if (op === "MOW") grid[y][x] = false
        else if (op === "PLANT") grid[y][x] = true
        else grid[y][x] = !grid[y][x]
      }
    }
  }
}

const out: string[] = []
for (let y = 0; y < H; y++) {
  let line = ""
  for (let x = 0; x < W; x++) line += grid[y][x] ? "{}" : "  "
  out.push(line)
}
console.log(out.join("\n"))
