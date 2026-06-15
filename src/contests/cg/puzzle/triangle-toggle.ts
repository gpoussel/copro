// 🎮 CodinGame Puzzle - triangle-toggle
// https://www.codingame.com/

const [HI, WI]: number[] = readline().split(" ").map(Number)
const style: string = readline()
const howManyTriangles: number = Number(readline())

type Triangle = [number, number, number, number, number, number]
const triangles: Triangle[] = []
for (let i = 0; i < howManyTriangles; i++) {
  const [x1, y1, x2, y2, x3, y3]: number[] = readline().split(" ").map(Number)
  triangles.push([x1, y1, x2, y2, x3, y3])
}

const cross = (ax: number, ay: number, bx: number, by: number, px: number, py: number): number =>
  (bx - ax) * (py - ay) - (by - ay) * (px - ax)

const inTriangle = (t: Triangle, px: number, py: number): boolean => {
  const [x1, y1, x2, y2, x3, y3]: Triangle = t
  const d1: number = cross(x1, y1, x2, y2, px, py)
  const d2: number = cross(x2, y2, x3, y3, px, py)
  const d3: number = cross(x3, y3, x1, y1, px, py)
  const hasNeg: boolean = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos: boolean = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNeg && hasPos)
}

const lines: string[] = []
for (let y = 0; y < HI; y++) {
  const cells: string[] = []
  for (let x = 0; x < WI; x++) {
    let count = 0
    for (const t of triangles) {
      if (inTriangle(t, x, y)) count++
    }
    cells.push(count % 2 === 0 ? "*" : " ")
  }
  lines.push(cells.join(style === "expanded" ? " " : ""))
}

console.log(lines.join("\n"))
