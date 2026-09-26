// 🎮 CodinGame Puzzle - fractal-image-recognition
// https://www.codingame.com/training/medium/fractal-image-recognition

// Neighbours in clockwise order, with the digit used for a fractal in that direction
const DIRS: [number, number, string][] = [
  [-1, 0, "3"], // N
  [-1, 1, "4"], // NE
  [0, 1, "2"], // E
  [1, 1, "7"], // SE
  [1, 0, "6"], // S
  [1, -1, "8"], // SW
  [0, -1, "9"], // W
  [-1, -1, "5"], // NW
]

const size = parseInt(readline())
const image: string[][] = []
for (let i = 0; i < size; i++) image.push(readline().trim().split(" "))
const output = image.map(row => row.slice())

const isEmpty = (r: number, c: number) => r < 0 || c < 0 || r >= size || c >= size || image[r][c] === "0"

for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (image[r][c] !== "1") continue
    // A fractal goes in direction d when d and its two neighbours on each side are empty
    for (let d = 0; d < 8; d++) {
      let free = true
      for (let k = -2; k <= 2; k++) {
        const [dr, dc] = DIRS[(d + k + 8) % 8]
        if (!isEmpty(r + dr, c + dc)) free = false
      }
      const [dr, dc, digit] = DIRS[d]
      const nr = r + dr
      const nc = c + dc
      if (free && nr >= 0 && nc >= 0 && nr < size && nc < size) output[nr][nc] = digit
    }
  }
}

for (const row of output) console.log(row.join(" "))
