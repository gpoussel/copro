// 🎮 CodinGame Puzzle - ascii-art-the-drunken-bishop-algorithm
// https://www.codingame.com/training/medium/ascii-art-the-drunken-bishop-algorithm

const fp = readline().trim()
const bytes = fp.split(":").map(h => parseInt(h, 16))

const W = 17
const H = 9
const counts: number[][] = []
for (let y = 0; y < H; y++) {
  const row: number[] = []
  for (let x = 0; x < W; x++) row.push(0)
  counts.push(row)
}

let x = 8
let y = 4

for (const b of bytes) {
  for (let p = 0; p < 4; p++) {
    const pair = (b >> (p * 2)) & 3
    const dx = pair & 1 ? 1 : -1
    const dy = pair & 2 ? 1 : -1
    x = Math.max(0, Math.min(W - 1, x + dx))
    y = Math.max(0, Math.min(H - 1, y + dy))
    counts[y][x]++
  }
}

const symbols = " .o+=*BOX@%&#/^"

const out: string[] = []
out.push("+---[CODINGAME]---+")
for (let yy = 0; yy < H; yy++) {
  let line = "|"
  for (let xx = 0; xx < W; xx++) {
    if (xx === 8 && yy === 4) line += "S"
    else if (xx === x && yy === y) line += "E"
    else line += symbols[counts[yy][xx] % 15]
  }
  line += "|"
  out.push(line)
}
out.push("+-----------------+")
console.log(out.join("\n"))
