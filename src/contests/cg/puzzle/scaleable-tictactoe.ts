// 🎮 CodinGame Puzzle - scaleable-tictactoe
// https://www.codingame.com/training/easy/scaleable-tictactoe

const [n, g]: number[] = readline()
  .split(" ")
  .map((s: string) => parseInt(s, 10))

const grid: string[][] = []
for (let i = 0; i < n; i++) {
  const line: string = readline()
  const row: string[] = []
  for (let j = 0; j < n; j++) {
    row.push(j < line.length ? line[j] : " ")
  }
  grid.push(row)
}

type Dir = { dr: number; dc: number; mark: string }
const dirs: Dir[] = [
  { dr: 0, dc: 1, mark: "-" },
  { dr: 1, dc: 0, mark: "|" },
  { dr: 1, dc: 1, mark: "\\" },
  { dr: -1, dc: 1, mark: "/" },
]

let winner: string = ""
const path: string[][] = grid.map((row: string[]) => row.slice())

outer: for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    const cell: string = grid[r][c]
    if (cell !== "X" && cell !== "O") {
      continue
    }
    for (const d of dirs) {
      let ok: boolean = true
      for (let k = 0; k < g; k++) {
        const nr: number = r + d.dr * k
        const nc: number = c + d.dc * k
        if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc] !== cell) {
          ok = false
          break
        }
      }
      if (ok) {
        for (let k = 0; k < g; k++) {
          path[r + d.dr * k][c + d.dc * k] = d.mark
        }
        winner = cell
        break outer
      }
    }
  }
}

const out: string[] = path.map((row: string[]) => row.join(""))

let result: string
if (winner === "X") {
  result = "The winner is X."
} else if (winner === "O") {
  result = "The winner is O."
} else {
  let hasEmpty: boolean = false
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === " ") {
        hasEmpty = true
      }
    }
  }
  result = hasEmpty ? "The game isn't over yet!" : "The game ended in a draw!"
}

out.push(result)
console.log(out.join("\n"))
