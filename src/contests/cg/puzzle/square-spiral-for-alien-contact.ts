// 🎮 CodinGame Puzzle - square-spiral-for-alien-contact
// https://www.codingame.com/

const line: string = readline().trim()
const parts: string[] = line.split(/\s+/)
const sideSize: number = parseInt(parts[0], 10)
const corner: string = parts[1]
const direction: string = parts[2]

function parsePattern(p: string): { letter: number; count: number } {
  const letter: number = p.charCodeAt(0) - 65
  const count: number = parseInt(p.slice(1), 10)
  return { letter, count }
}

const first: { letter: number; count: number } = parsePattern(parts[3])
const second: { letter: number; count: number } = parsePattern(parts[4])
const letter0: number = first.letter
const count0: number = first.count
const deltaLetter: number = second.letter - first.letter
const deltaCount: number = second.count - first.count

// Build the canonical inward square spiral path (top-left start, clockwise),
// leaving a one-cell gap between successive arms.
function buildPath(n: number): Array<[number, number]> {
  const path: Array<[number, number]> = [[0, 0]]
  let r: number = 0
  let c: number = 0
  let top: number = 0
  let bottom: number = n - 1
  let left: number = 0
  let right: number = n - 1
  while (true) {
    while (c < right) {
      c++
      path.push([r, c])
    }
    while (r < bottom) {
      r++
      path.push([r, c])
    }
    while (c > left) {
      c--
      path.push([r, c])
    }
    top += 2
    while (r > top) {
      r--
      path.push([r, c])
    }
    left += 2
    right -= 2
    bottom -= 2
    if (left > right || top > bottom) break
    c++
    path.push([r, c])
    if (c > right) break
  }
  return path
}

// Coordinate transforms mapping the canonical (top-left, clockwise) layout to
// the requested corner/direction.
function transform(r: number, c: number, n: number): [number, number] {
  const key: string = corner + "|" + direction
  switch (key) {
    case "topLeft|clockwise":
      return [r, c]
    case "topRight|clockwise":
      return [c, n - 1 - r]
    case "bottomRight|clockwise":
      return [n - 1 - r, n - 1 - c]
    case "bottomLeft|clockwise":
      return [n - 1 - c, r]
    case "topLeft|counter-clockwise":
      return [c, r]
    case "topRight|counter-clockwise":
      return [r, n - 1 - c]
    case "bottomRight|counter-clockwise":
      return [n - 1 - c, n - 1 - r]
    case "bottomLeft|counter-clockwise":
      return [n - 1 - r, c]
    default:
      return [r, c]
  }
}

const path: Array<[number, number]> = buildPath(sideSize)
const grid: string[][] = Array.from({ length: sideSize }, () => new Array<string>(sideSize).fill(" "))

let idx: number = 0
let block: number = 0
while (idx < path.length) {
  const len: number = count0 + block * deltaCount
  const letterValue: number = letter0 + block * deltaLetter
  if (letterValue < 0 || letterValue > 25) break
  const ch: string = String.fromCharCode(65 + letterValue)
  for (let i = 0; i < len && idx < path.length; i++, idx++) {
    const [pr, pc] = path[idx]
    const [tr, tc] = transform(pr, pc, sideSize)
    grid[tr][tc] = ch
  }
  block++
}

const limit: number = sideSize > 31 ? 31 : sideSize
const output: string[] = []
for (let r = 0; r < limit; r++) {
  output.push(grid[r].slice(0, limit).join(""))
}
console.log(output.join("\n"))
