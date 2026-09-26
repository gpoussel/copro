// 🎮 CodinGame Puzzle - duck-hunt
// https://www.codingame.com/training/medium/duck-hunt

const w = parseInt(readline())
const h = parseInt(readline())

const locate = () => {
  const pos: { [id: string]: [number, number] } = {}
  for (let y = 0; y < h; y++) {
    const row = readline()
    for (let x = 0; x < w; x++) if (row[x] >= "1" && row[x] <= "9") pos[row[x]] = [x, y]
  }
  return pos
}
const first = locate()
const second = locate()

interface Duck {
  id: string
  x: number
  y: number
  dx: number
  dy: number
  deadline: number // last turn the duck is still in sight
}
const inside = (x: number, y: number) => x >= 0 && x < w && y >= 0 && y < h
const ducks: Duck[] = Object.keys(second).map(id => {
  const [x, y] = first[id]
  const dx = second[id][0] - x
  const dy = second[id][1] - y
  let deadline = 1
  if (dx === 0 && dy === 0) deadline = Infinity
  else while (inside(x + (deadline + 1) * dx, y + (deadline + 1) * dy)) deadline++
  return { id, x, y, dx, dy, deadline }
})

// Earliest-deadline-first is optimal for one unit-time shot per turn
ducks.sort((a, b) => a.deadline - b.deadline || Number(a.id) - Number(b.id))
let turn = 2
for (const duck of ducks) {
  if (duck.deadline < turn) continue
  console.log(`${duck.id} ${duck.x + turn * duck.dx} ${duck.y + turn * duck.dy}`)
  turn++
}
