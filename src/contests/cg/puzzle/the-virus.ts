// 🎮 CodinGame Puzzle - the-virus
// https://www.codingame.com/training/medium/the-virus

// Board: the 25 cells of a 7x7 diamond (|x-3| + |y-3| <= 3) plus the exit at (-1, 3)
const EXIT_X = -1
const EXIT_Y = 3
const isValid = (x: number, y: number): boolean => (x === EXIT_X && y === EXIT_Y) || Math.abs(x - 3) + Math.abs(y - 3) <= 3
const DIRS: [string, number, number][] = [
  ["LEFT", -1, 0],
  ["UP", 0, -1],
  ["RIGHT", 1, 0],
  ["DOWN", 0, 1],
]

readline() // maxTurns
const deadCount = +readline()
const dead: string[] = []
for (let i = 0; i < deadCount; i++) dead.push(readline().trim().split(/\s+/).join(","))

const readCells = (): [number, number, number][] => {
  const count = +readline()
  const cells: [number, number, number][] = []
  for (let i = 0; i < count; i++) {
    const [id, x, y] = readline().trim().split(/\s+/).map(Number)
    cells.push([id, x, y])
  }
  return cells
}

const initial = readCells()
const ids: number[] = []
for (const [id] of initial) if (ids.indexOf(id) < 0) ids.push(id)
ids.sort((a, b) => a - b)
// Shape of each molecule as its initial cells; a state is the offset of each molecule
const shapes: [number, number][][] = ids.map(id => initial.filter(c => c[0] === id).map(c => [c[1], c[2]] as [number, number]))

type State = number[] // [dx0, dy0, dx1, dy1, ...]
const cellsOf = (state: State, k: number): [number, number][] => shapes[k].map(([x, y]) => [x + state[2 * k], y + state[2 * k + 1]] as [number, number])

// Apply a move (with pushing); null if it loses
const applyMove = (state: State, k: number, dx: number, dy: number): State | null => {
  const moved = ids.map(() => false)
  const queue = [k]
  while (queue.length > 0) {
    const m = queue.shift()!
    if (moved[m]) continue
    moved[m] = true
    const target = cellsOf(state, m).map(([x, y]) => `${x + dx},${y + dy}`)
    for (let o = 0; o < ids.length; o++) {
      if (moved[o]) continue
      if (cellsOf(state, o).some(([x, y]) => target.indexOf(`${x},${y}`) >= 0)) queue.push(o)
    }
  }
  const next = state.slice()
  for (let m = 0; m < ids.length; m++) {
    if (!moved[m]) continue
    next[2 * m] += dx
    next[2 * m + 1] += dy
    for (const [x, y] of cellsOf(next, m)) {
      if (!isValid(x, y) || dead.indexOf(`${x},${y}`) >= 0) return null
    }
  }
  return next
}

const virus = ids.indexOf(0)
const isWin = (state: State) => cellsOf(state, virus).some(([x]) => x === EXIT_X)

// BFS for the shortest sequence of moves
const start: State = ids.map(() => [0, 0]).reduce((a, b) => a.concat(b), [] as number[])
const parent: { [key: string]: [string, string] | null } = { [start.join(",")]: null }
const queue: State[] = [start]
let goal: string | null = null
while (queue.length > 0 && goal === null) {
  const state = queue.shift()!
  const key = state.join(",")
  for (let k = 0; k < ids.length && goal === null; k++) {
    for (const [name, dx, dy] of DIRS) {
      const next = applyMove(state, k, dx, dy)
      if (!next) continue
      const nextKey = next.join(",")
      if (nextKey in parent) continue
      parent[nextKey] = [key, `${ids[k]} ${name}`]
      if (isWin(next)) {
        goal = nextKey
        break
      }
      queue.push(next)
    }
  }
}

const plan: string[] = []
for (let key = goal; key !== null && parent[key]; key = parent[key]![0]) plan.unshift(parent[key]![1])

for (let turn = 0; ; turn++) {
  if (turn > 0) readCells()
  console.log(plan[turn] || "0 LEFT")
}
