// 🎮 CodinGame Puzzle - city-lights-part-2
// https://www.codingame.com/

const l: number = parseInt(readline(), 10)
const w: number = parseInt(readline(), 10)
const d: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)

const lines: string[] = []
for (let i = 0; i < n; i++) {
  lines.push(readline())
}

// Build 3D grid: grid[z][y][x] = char ('.' or source)
const grid: string[][] = []
for (let z = 0; z < d; z++) {
  const block: string[] = []
  for (let y = 0; y < w; y++) {
    block.push(lines[z * (w + 1) + y])
  }
  grid.push(block)
}

function radius(c: string): number {
  if (c === ".") return 0
  if (c >= "1" && c <= "9") return c.charCodeAt(0) - "0".charCodeAt(0)
  return c.charCodeAt(0) - "A".charCodeAt(0) + 10
}

interface Source {
  x: number
  y: number
  z: number
  r: number
}

const sources: Source[] = []
for (let z = 0; z < d; z++) {
  for (let y = 0; y < w; y++) {
    const row = grid[z][y]
    for (let x = 0; x < l; x++) {
      const c = row[x]
      if (c !== ".") {
        sources.push({ x, y, z, r: radius(c) })
      }
    }
  }
}

function toChar(b: number): string {
  let v = b
  if (v > 35) v = 35
  if (v < 0) v = 0
  if (v <= 9) return String(v)
  return String.fromCharCode("A".charCodeAt(0) + (v - 10))
}

const out: string[] = []
for (let z = 0; z < d; z++) {
  for (let y = 0; y < w; y++) {
    let line = ""
    for (let x = 0; x < l; x++) {
      let total = 0
      for (const s of sources) {
        const dist = Math.round(Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2 + (s.z - z) ** 2))
        const b = s.r - dist
        if (b > 0) total += b
      }
      line += toChar(total)
    }
    out.push(line)
  }
  if (z < d - 1) out.push("")
}

console.log(out.join("\n"))
