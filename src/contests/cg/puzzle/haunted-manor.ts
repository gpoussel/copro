// 🎮 CodinGame Puzzle - haunted-manor
// https://www.codingame.com/training/hard/haunted-manor

// Trace the line of sight from every window, recording for each visited cell
// whether it is seen directly or through a mirror. Then backtrack over the
// cells, keeping for each window the count already seen and the number of
// still-undecided visits, and prune as soon as a window can no longer match.
const [vCount, zCount, gCount] = readline().split(" ").map(Number)
const size = Number(readline())
const readNums = () => readline().trim().split(/\s+/).map(Number)
const top = readNums()
const bottom = readNums()
const left = readNums()
const right = readNums()
const grid: string[][] = []
for (let i = 0; i < size; i++) grid.push(readline().split(""))

const targets: number[] = []
// visits[cell] = list of [window, reflected]
const visits: [number, boolean][][] = Array.from({ length: size * size }, () => [])
const unknown: number[] = []
function trace(x: number, y: number, dx: number, dy: number, target: number): void {
  const w = targets.length
  targets.push(target)
  let reflected = false
  let count = 0
  while (x >= 0 && y >= 0 && x < size && y < size) {
    const c = grid[y][x]
    if (c === "/") {
      ;[dx, dy] = [-dy, -dx]
      reflected = true
    } else if (c === "\\") {
      ;[dx, dy] = [dy, dx]
      reflected = true
    } else {
      visits[y * size + x].push([w, reflected])
      count++
    }
    x += dx
    y += dy
  }
  unknown.push(count)
}
for (let i = 0; i < size; i++) {
  trace(i, 0, 0, 1, top[i])
  trace(i, size - 1, 0, -1, bottom[i])
  trace(0, i, 1, 0, left[i])
  trace(size - 1, i, -1, 0, right[i])
}

const TYPES = ["V", "Z", "G"]
const remaining = [vCount, zCount, gCount]
const seen = (t: number, reflected: boolean) => t === 1 || (t === 0 ? !reflected : reflected)
const current = new Array<number>(targets.length).fill(0)
const cells: number[] = []
for (let i = 0; i < size * size; i++) if (grid[Math.floor(i / size)][i % size] === ".") cells.push(i)

function solve(k: number): boolean {
  if (k === cells.length) return true
  const cell = cells[k]
  for (let t = 0; t < 3; t++) {
    if (remaining[t] === 0) continue
    let ok = true
    for (const [w, r] of visits[cell]) {
      current[w] += seen(t, r) ? 1 : 0
      unknown[w]--
    }
    for (const [w] of visits[cell]) if (current[w] > targets[w] || current[w] + unknown[w] < targets[w]) ok = false
    remaining[t]--
    if (ok) {
      grid[Math.floor(cell / size)][cell % size] = TYPES[t]
      if (solve(k + 1)) return true
    }
    remaining[t]++
    for (const [w, r] of visits[cell]) {
      current[w] -= seen(t, r) ? 1 : 0
      unknown[w]++
    }
  }
  return false
}
solve(0)
console.log(grid.map(r => r.join("")).join("\n"))
