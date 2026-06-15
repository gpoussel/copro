// 🎮 CodinGame Puzzle - city-lights-part-1
// https://www.codingame.com/training/easy/city-lights-part-1

const h = parseInt(readline())
const w = parseInt(readline())
const grid: string[] = []
for (let i = 0; i < h; i++) grid.push(readline())

function radius(ch: string): number {
  if (ch >= "1" && ch <= "9") return ch.charCodeAt(0) - "0".charCodeAt(0)
  if (ch >= "A" && ch <= "Z") return ch.charCodeAt(0) - "A".charCodeAt(0) + 10
  return 0
}

function toChar(v: number): string {
  if (v < 0) v = 0
  if (v > 35) v = 35
  if (v <= 9) return String(v)
  return String.fromCharCode("A".charCodeAt(0) + v - 10)
}

const sources: { r: number; c: number; rad: number }[] = []
for (let r = 0; r < h; r++) {
  for (let c = 0; c < w; c++) {
    const ch = grid[r][c]
    if (ch !== ".") sources.push({ r, c, rad: radius(ch) })
  }
}

const out: string[] = []
for (let r = 0; r < h; r++) {
  let line = ""
  for (let c = 0; c < w; c++) {
    let total = 0
    for (const s of sources) {
      const d = Math.round(Math.sqrt((s.r - r) ** 2 + (s.c - c) ** 2))
      const b = s.rad - d
      if (b > 0) total += b
    }
    line += toChar(total)
  }
  out.push(line)
}
console.log(out.join("\n"))
