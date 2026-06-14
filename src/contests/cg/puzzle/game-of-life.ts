const [width, height] = readline().split(" ").map(Number)
const grid: string[] = []
for (let i = 0; i < height; i++) grid.push(readline())

const out: string[] = []
for (let y = 0; y < height; y++) {
  let line = ""
  for (let x = 0; x < width; x++) {
    let n = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const ny = y + dy
        const nx = x + dx
        if (ny >= 0 && ny < height && nx >= 0 && nx < width && grid[ny][nx] === "1") n++
      }
    }
    const alive = grid[y][x] === "1"
    line += (alive ? n === 2 || n === 3 : n === 3) ? "1" : "0"
  }
  out.push(line)
}
console.log(out.join("\n"))
