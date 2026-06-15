// 🎮 CodinGame Puzzle - city-lights-part-1
// https://www.codingame.com/

const h: number = parseInt(readline(), 10)
const w: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < h; i++) {
  grid.push(readline())
}

const radiusOf = (c: string): number => {
  if (c >= "1" && c <= "9") return c.charCodeAt(0) - "0".charCodeAt(0)
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - "A".charCodeAt(0) + 10
  return 0
}

const encode = (v: number): string => {
  if (v <= 9) return String(v)
  const capped = Math.min(v, 35)
  return String.fromCharCode("A".charCodeAt(0) + capped - 10)
}

const out: string[] = []
for (let y = 0; y < h; y++) {
  let line = ""
  for (let x = 0; x < w; x++) {
    let total = 0
    for (let sy = 0; sy < h; sy++) {
      for (let sx = 0; sx < w; sx++) {
        const r = radiusOf(grid[sy][sx])
        if (r === 0) continue
        const dist = Math.round(Math.sqrt((sx - x) ** 2 + (sy - y) ** 2))
        const brightness = r - dist
        if (brightness > 0) total += brightness
      }
    }
    line += encode(total)
  }
  out.push(line)
}

console.log(out.join("\n"))
