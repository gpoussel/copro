// 🎮 CodinGame Puzzle - turing-machine
// https://www.codingame.com/training/hard/turing-machine

const [, T, X] = readline().split(" ").map(Number)
const start = readline().trim()
const N = parseInt(readline())

type Action = { write: number; move: number; next: string }
const table: Map<string, Action[]> = new Map()
for (let i = 0; i < N; i++) {
  const line = readline()
  const colon = line.indexOf(":")
  const name = line.slice(0, colon).trim()
  const actionsStr = line.slice(colon + 1).split(";")
  const actions: Action[] = actionsStr.map(a => {
    const parts = a.trim().split(/\s+/)
    return {
      write: parseInt(parts[0]),
      move: parts[1] === "L" ? -1 : 1,
      next: parts[2],
    }
  })
  table.set(name, actions)
}

const tape: number[] = new Array(T).fill(0)
let pos = X
let state = start
let steps = 0

while (true) {
  const actions = table.get(state)!
  const sym = tape[pos]
  const act = actions[sym]
  tape[pos] = act.write
  pos += act.move
  steps++
  if (act.next === "HALT") {
    break
  }
  if (pos < 0) {
    pos = -1
    break
  }
  if (pos >= T) {
    pos = T
    break
  }
  state = act.next
}

console.log(steps)
console.log(pos)
console.log(tape.join(""))
