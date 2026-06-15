// 🎮 CodinGame Puzzle - solar-shadow-hunter
// https://www.codingame.com/

const [w, h] = readline()
  .split(" ")
  .map((v: string) => parseInt(v, 10))
const k: number = parseInt(readline(), 10)

const grid: string[][] = []
for (let i = 0; i < h; i++) {
  grid.push(readline().split(""))
}

const shaded: boolean[][] = Array.from({ length: h }, () => new Array<boolean>(w).fill(false))

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const c: string = grid[y][x]
    if (c >= "1" && c <= "9") {
      const length: number = parseInt(c, 10) * k
      for (let d = 1; d <= length; d++) {
        const ny: number = y - d
        if (ny < 0) break
        shaded[ny][x] = true
      }
    }
  }
}

let total: number = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (grid[y][x] === "P" && !shaded[y][x]) {
      total += 100
    }
  }
}

console.log(total)
