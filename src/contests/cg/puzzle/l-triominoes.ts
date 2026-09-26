// 🎮 CodinGame Puzzle - l-triominoes
// https://www.codingame.com/training/medium/l-triominoes

const level = parseInt(readline())
const [holeX, holeY] = readline().split(" ").map(Number)
const side = 1 << level

// tileId[y][x]: identifier of the triomino covering the cell (0 = the hole)
const tileId: number[][] = []
for (let y = 0; y < side; y++) {
  tileId.push([])
  for (let x = 0; x < side; x++) tileId[y].push(0)
}
let nextTile = 1

function tile(top: number, left: number, size: number, hx: number, hy: number): void {
  if (size === 1) return
  const halfSize = size / 2
  const id = nextTile++
  const quadrantHoles: [number, number][] = []
  for (let qy = 0; qy < 2; qy++) {
    for (let qx = 0; qx < 2; qx++) {
      const qTop = top + qy * halfSize
      const qLeft = left + qx * halfSize
      const containsHole = hx >= qLeft && hx < qLeft + halfSize && hy >= qTop && hy < qTop + halfSize
      if (containsHole) quadrantHoles.push([hx, hy])
      else {
        // The central triomino covers this quadrant's corner cell at the centre
        const cx = left + halfSize - 1 + qx
        const cy = top + halfSize - 1 + qy
        tileId[cy][cx] = id
        quadrantHoles.push([cx, cy])
      }
    }
  }
  for (let q = 0; q < 4; q++) {
    const qTop = top + (q >> 1) * halfSize
    const qLeft = left + (q & 1) * halfSize
    tile(qTop, qLeft, halfSize, quadrantHoles[q][0], quadrantHoles[q][1])
  }
}

tile(0, 0, side, holeX, holeY)

function sameTile(y1: number, x1: number, y2: number, x2: number): boolean {
  if (y1 < 0 || x1 < 0 || y2 >= side || x2 >= side) return false
  return tileId[y1][x1] === tileId[y2][x2]
}

const drawing: string[] = []
for (let y = 0; y <= side; y++) {
  let border = "+"
  for (let x = 0; x < side; x++) border += (sameTile(y - 1, x, y, x) ? "  " : "--") + "+"
  drawing.push(border)
  if (y === side) break
  let row = "|"
  for (let x = 0; x < side; x++) {
    row += x === holeX && y === holeY ? "##" : "  "
    row += sameTile(y, x, y, x + 1) ? " " : "|"
  }
  drawing.push(row)
}
console.log(drawing.join("\n"))
