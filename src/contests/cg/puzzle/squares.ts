// 🎮 CodinGame Puzzle - squares
// https://www.codingame.com/training/medium/squares

const [side, m, n] = readline().split(" ").map(Number)
// Squares as [left, top, right, bottom] grid-line coordinates (tiles are [k-1, k))
const squares: number[][] = []
for (let i = 0; i < m; i++) {
  const [x, y, s] = readline().split(" ").map(Number)
  squares.push([x - 1, y - 1, x - 1 + s, y - 1 + s])
}

function breakpoints(lo: number, hi: number): number[] {
  const set: { [k: number]: boolean } = { 0: true, [side]: true }
  for (const sq of squares) {
    set[sq[lo]] = true
    set[sq[hi]] = true
  }
  return Object.keys(set).map(Number).sort((a, b) => a - b)
}

const xs = breakpoints(0, 2)
const ys = breakpoints(1, 3)
const w = xs.length - 1
const h = ys.length - 1

// Wall on the vertical line at X between rows [y0, y1)
function verticalWall(X: number, y0: number, y1: number): boolean {
  return squares.some(([l, t, r, b]) => (X === l || X === r) && t <= y0 && y1 <= b)
}
function horizontalWall(Y: number, x0: number, x1: number): boolean {
  return squares.some(([l, t, r, b]) => (Y === t || Y === b) && l <= x0 && x1 <= r)
}

const region: number[][] = []
for (let r = 0; r < h; r++) region.push(new Array<number>(w).fill(-1))
const areas: number[] = []
for (let r0 = 0; r0 < h; r0++) {
  for (let c0 = 0; c0 < w; c0++) {
    if (region[r0][c0] >= 0) continue
    const id = areas.length
    let area = 0
    region[r0][c0] = id
    const stack: [number, number][] = [[r0, c0]]
    while (stack.length > 0) {
      const [r, c] = stack.pop()!
      area += (xs[c + 1] - xs[c]) * (ys[r + 1] - ys[r])
      const next: [number, number, boolean][] = [
        [r, c + 1, c + 1 < w && !verticalWall(xs[c + 1], ys[r], ys[r + 1])],
        [r, c - 1, c > 0 && !verticalWall(xs[c], ys[r], ys[r + 1])],
        [r + 1, c, r + 1 < h && !horizontalWall(ys[r + 1], xs[c], xs[c + 1])],
        [r - 1, c, r > 0 && !horizontalWall(ys[r], xs[c], xs[c + 1])],
      ]
      for (const [nr, nc, open] of next) {
        if (open && region[nr][nc] < 0) {
          region[nr][nc] = id
          stack.push([nr, nc])
        }
      }
    }
    areas.push(area)
  }
}

function cellIndex(bounds: number[], tile: number): number {
  let i = 0
  while (bounds[i + 1] <= tile - 1) i++
  return i
}

const out: number[] = []
for (let i = 0; i < n; i++) {
  const [tx, ty] = readline().split(" ").map(Number)
  out.push(areas[region[cellIndex(ys, ty)][cellIndex(xs, tx)]])
}
console.log(out.join("\n"))
