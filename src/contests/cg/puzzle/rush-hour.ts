// 🎮 CodinGame Puzzle - rush-hour
// https://www.codingame.com/training/medium/rush-hour

interface Vehicle {
  id: number
  fixed: number // row for horizontal vehicles, column for vertical ones
  length: number
  horizontal: boolean
}

const n = parseInt(readline())
const readVehicles = () => {
  const vehicles: Vehicle[] = []
  const start: number[] = []
  for (let i = 0; i < n; i++) {
    const [id, x, y, length, axis] = readline().split(" ")
    const horizontal = axis === "H"
    vehicles.push({ id: +id, fixed: horizontal ? +y : +x, length: +length, horizontal })
    start.push(horizontal ? +x : +y)
  }
  return { vehicles, start }
}

// BFS over states (position of each vehicle along its axis), one cell per move
const solve = (vehicles: Vehicle[], start: number[]): string[] => {
  const red = vehicles.findIndex(v => v.id === 0)
  const occupancy = (state: number[]) => {
    const grid = new Uint8Array(36)
    vehicles.forEach((v, i) => {
      for (let k = 0; k < v.length; k++) {
        const cell = v.horizontal ? v.fixed * 6 + state[i] + k : (state[i] + k) * 6 + v.fixed
        grid[cell] = 1
      }
    })
    return grid
  }
  const cellAt = (v: Vehicle, along: number) => (v.horizontal ? v.fixed * 6 + along : along * 6 + v.fixed)

  const parent: { [key: string]: [string, string] | null } = {}
  const startKey = start.join(",")
  parent[startKey] = null
  const queue: number[][] = [start]
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head]
    const key = state.join(",")
    if (state[red] === 4) {
      const moves: string[] = []
      for (let k = key; parent[k]; k = parent[k]![0]) moves.push(parent[k]![1])
      return moves.reverse()
    }
    const grid = occupancy(state)
    vehicles.forEach((v, i) => {
      for (const delta of [-1, 1]) {
        const lead = delta < 0 ? state[i] - 1 : state[i] + v.length
        if (lead < 0 || lead >= 6 || grid[cellAt(v, lead)]) continue
        const next = state.slice()
        next[i] += delta
        const nextKey = next.join(",")
        if (nextKey in parent) continue
        const dir = v.horizontal ? (delta < 0 ? "LEFT" : "RIGHT") : delta < 0 ? "UP" : "DOWN"
        parent[nextKey] = [key, `${v.id} ${dir}`]
        queue.push(next)
      }
    })
  }
  return []
}

let plan: string[] | null = null
let turn = 0
while (true) {
  const { vehicles, start } = readVehicles()
  if (!plan) plan = solve(vehicles, start)
  console.log(plan[turn++] || "0 RIGHT")
}
