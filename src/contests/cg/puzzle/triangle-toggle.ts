// 🎮 CodinGame Puzzle - triangle-toggle
// https://www.codingame.com/training/easy/triangle-toggle

const [HI, WI] = readline()
  .split(" ")
  .map(s => parseInt(s, 10))
const style: string = readline().trim()
const expanded: boolean = style === "expanded"
const howMany: number = parseInt(readline(), 10)
type Tri = [number, number, number, number, number, number]
const tris: Tri[] = []
for (let i = 0; i < howMany; i++) {
  const v = readline()
    .split(" ")
    .map(s => parseInt(s, 10))
  tris.push([v[0], v[1], v[2], v[3], v[4], v[5]])
}

function sign(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  return (px - bx) * (ay - by) - (ax - bx) * (py - by)
}

function inTriangle(px: number, py: number, t: Tri): boolean {
  const d1 = sign(px, py, t[0], t[1], t[2], t[3])
  const d2 = sign(px, py, t[2], t[3], t[4], t[5])
  const d3 = sign(px, py, t[4], t[5], t[0], t[1])
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNeg && hasPos)
}

const lines: string[] = []
for (let y = 0; y < HI; y++) {
  const cells: string[] = []
  for (let x = 0; x < WI; x++) {
    let count = 0
    for (const t of tris) {
      if (inTriangle(x, y, t)) count++
    }
    cells.push(count % 2 === 1 ? " " : "*")
  }
  lines.push(expanded ? cells.join(" ") : cells.join(""))
}
console.log(lines.join("\n"))
