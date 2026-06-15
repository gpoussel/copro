// 🎮 CodinGame Puzzle - azimut
// https://www.codingame.com/training/easy/azimut

const dirs: string[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

let pos: number = dirs.indexOf(readline().trim())
const n: number = parseInt(readline(), 10)

const turns: Record<string, number> = {
  RIGHT: 1,
  LEFT: -1,
  BACK: 4,
  FORWARD: 0,
}

for (let i = 0; i < n; i++) {
  const turn: string = readline().trim()
  pos = (pos + turns[turn] + 8) % 8
}

console.log(dirs[pos])
