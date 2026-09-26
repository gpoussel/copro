// 🎮 CodinGame Puzzle - 3d-printer
// https://www.codingame.com/training/medium/3d-printer

const width = +readline()
const height = +readline()
const length = +readline()
const readView = (rows: number): string[] => {
  const view: string[] = []
  for (let i = 0; i < rows; i++) view.push(readline())
  return view
}
const front = readView(height) // [y][x]
const right = readView(height) // [y][length - 1 - z]
const top = readView(length) // [z][x]

const solid = (view: string[], r: number, c: number) => view[r][c] === "#"

// Keep every voxel allowed by all three projections (undetermined parts are solid)
const out: string[] = []
for (let y = height - 1; y >= 0; y--) {
  for (let z = 0; z < length; z++) {
    let line = ""
    for (let x = 0; x < width; x++) {
      line += solid(front, y, x) && solid(right, y, length - 1 - z) && solid(top, z, x) ? "#" : " "
    }
    out.push(line.replace(/\s+$/, ""))
  }
  out.push("--")
}
console.log(out.join("\n"))
