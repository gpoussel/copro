// 🎮 CodinGame Puzzle - pyramid-stacker
// https://www.codingame.com/

const [n, h]: number[] = readline()
  .split(" ")
  .map((x: string): number => parseInt(x, 10))
const cubes: string = readline()

// Build layers from bottom (layer h) to top (layer 1), filling back to front,
// left to right. Each layer i is an i x i grid.
const grids: string[][][] = []
for (let i = 1; i <= h; i++) {
  grids[i] = []
  for (let r = 0; r < i; r++) {
    grids[i][r] = new Array<string>(i).fill("")
  }
}

let idx = 0
for (let i = h; i >= 1 && idx < n; i--) {
  for (let r = 0; r < i && idx < n; r++) {
    for (let c = 0; c < i && idx < n; c++) {
      grids[i][r][c] = cubes[idx++]
    }
  }
}

const lines: string[] = []
for (let i = 1; i <= h; i++) {
  // Front view: for each column, the front-most (largest row index) filled cube.
  const chars: string[] = []
  for (let c = 0; c < i; c++) {
    let label = ""
    for (let r = 0; r < i; r++) {
      if (grids[i][r][c] !== "") {
        label = grids[i][r][c]
      }
    }
    const col = h - i + 2 * c
    while (chars.length <= col) {
      chars.push(" ")
    }
    if (label !== "") {
      chars[col] = label
    }
  }
  lines.push(chars.join("").replace(/\s+$/, ""))
}

console.log(lines.join("\n"))
