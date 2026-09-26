// 🎮 CodinGame Puzzle - binary-tree-visual
// https://www.codingame.com/training/medium/binary-tree-visual

const n = parseInt(readline())
const value: string[] = []
const left: number[] = []
const right: number[] = []
for (let i = 0; i < n; i++) {
  const [v, l, r] = readline().split(" ")
  value.push(v)
  left.push(+l)
  right.push(+r)
}
const cellWidth = 1 + Math.max(...value.map(v => v.length))

// In-order index gives the column, depth gives the level
const column: number[] = new Array(n).fill(0)
const depth: number[] = new Array(n).fill(0)
let nextColumn = 0
let levels = 0
const visit = (node: number, d: number) => {
  if (node < 0) return
  depth[node] = d
  levels = Math.max(levels, d + 1)
  visit(left[node], d + 1)
  column[node] = nextColumn++
  visit(right[node], d + 1)
}
visit(0, 0)

const height = levels + 3 * (levels - 1)
const grid: string[][] = []
for (let i = 0; i < height; i++) grid.push(new Array<string>(n * cellWidth).fill(" "))
// Rightmost character of a node's cell: values, '|' and '+' are right-justified on it
const anchor = (node: number) => (column[node] + 1) * cellWidth - 1

for (let node = 0; node < n; node++) {
  const row = 4 * depth[node]
  const end = anchor(node)
  for (let k = 0; k < value[node].length; k++) grid[row][end - value[node].length + 1 + k] = value[node][k]
  const children = [left[node], right[node]].filter(c => c >= 0)
  if (!children.length) continue
  grid[row + 1][end] = "|"
  const xs = children.map(anchor).concat(end)
  const from = Math.min(...xs)
  const to = Math.max(...xs)
  for (let x = from; x <= to; x++) grid[row + 2][x] = "-"
  for (const x of xs) grid[row + 2][x] = "+"
  for (const c of children) grid[row + 3][anchor(c)] = "|"
}

for (const line of grid) console.log(line.join("").replace(/\s+$/, ""))
