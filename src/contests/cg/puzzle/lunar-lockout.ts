// 🎮 CodinGame Puzzle - lunar-lockout
// https://www.codingame.com/training/medium/lunar-lockout

const SIZE = 5
const start: string[] = []
for (let i = 0; i < SIZE; i++) start.push(readline())
const initial = start.join("")

// Tokens in alphabetical order (X comes after the helper-bots), directions too
const tokens = initial
  .split("")
  .filter(ch => ch !== ".")
  .sort()
const directions: [string, number, number][] = [
  ["D", 1, 0],
  ["L", 0, -1],
  ["R", 0, 1],
  ["U", -1, 0],
]
const CENTER = 2 * SIZE + 2

// BFS exploring moves in alphabetical order: first visit = shortest, then alphabetically first path
const previous = new Map<string, [string, string] | null>()
previous.set(initial, null)
let queue = [initial]
let goal: string | null = initial.charAt(CENTER) === "X" ? initial : null
while (goal === null && queue.length > 0) {
  const next: string[] = []
  for (const state of queue) {
    for (const token of tokens) {
      const pos = state.indexOf(token)
      const r0 = Math.floor(pos / SIZE)
      const c0 = pos % SIZE
      for (const [name, dr, dc] of directions) {
        let r = r0
        let c = c0
        let blocked = false
        while (true) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break
          if (state.charAt(nr * SIZE + nc) !== ".") {
            blocked = true
            break
          }
          r = nr
          c = nc
        }
        if (!blocked || (r === r0 && c === c0)) continue
        const cells = state.split("")
        cells[pos] = "."
        cells[r * SIZE + c] = token
        const moved = cells.join("")
        if (previous.has(moved)) continue
        previous.set(moved, [state, token + name])
        if (token === "X" && r * SIZE + c === CENTER && goal === null) goal = moved
        next.push(moved)
      }
      if (goal !== null) break
    }
    if (goal !== null) break
  }
  queue = next
}

const moves: string[] = []
let cursor = goal!
while (previous.get(cursor)) {
  const [parent, move] = previous.get(cursor)!
  moves.unshift(move)
  cursor = parent
}
console.log(moves.join(" "))
console.log("")
for (let i = 0; i < SIZE; i++) console.log(goal!.substr(i * SIZE, SIZE))
