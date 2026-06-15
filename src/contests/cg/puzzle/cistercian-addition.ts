// 🎮 CodinGame Puzzle - cistercian-addition
// https://www.codingame.com/

type Mark = [number, number, string]

const OVERLINE = String.fromCharCode(0x203e)

// Marks (row, col, char) for each digit 1..9 per place. Digit 0 has no marks.
// Each place writes into its own quadrant, so decoding is unambiguous.
const UNITS: Mark[][] = [
  [],
  [[0, 3, "_"]],
  [[1, 3, "_"]],
  [[1, 3, "\\"]],
  [[1, 3, "/"]],
  [
    [0, 3, "_"],
    [1, 3, "/"],
  ],
  [[1, 4, "|"]],
  [
    [0, 3, "_"],
    [1, 4, "|"],
  ],
  [
    [1, 3, "_"],
    [1, 4, "|"],
  ],
  [
    [0, 3, "_"],
    [1, 3, "_"],
    [1, 4, "|"],
  ],
]

const TENS: Mark[][] = [
  [],
  [[0, 1, "_"]],
  [[1, 1, "_"]],
  [[1, 1, "/"]],
  [[1, 1, "\\"]],
  [
    [0, 1, "_"],
    [1, 1, "\\"],
  ],
  [[1, 0, "|"]],
  [
    [0, 1, "_"],
    [1, 0, "|"],
  ],
  [
    [1, 1, "_"],
    [1, 0, "|"],
  ],
  [
    [0, 1, "_"],
    [1, 1, "_"],
    [1, 0, "|"],
  ],
]

const HUNDREDS: Mark[][] = [
  [],
  [[3, 3, "_"]],
  [[2, 3, "_"]],
  [[3, 3, "/"]],
  [[3, 3, "\\"]],
  [
    [3, 3, "\\"],
    [4, 3, OVERLINE],
  ],
  [[3, 4, "|"]],
  [
    [3, 3, "_"],
    [3, 4, "|"],
  ],
  [
    [2, 3, "_"],
    [3, 4, "|"],
  ],
  [
    [2, 3, "_"],
    [3, 3, "_"],
    [3, 4, "|"],
  ],
]

const THOUSANDS: Mark[][] = [
  [],
  [[3, 1, "_"]],
  [[2, 1, "_"]],
  [[3, 1, "\\"]],
  [[3, 1, "/"]],
  [
    [3, 1, "/"],
    [4, 1, OVERLINE],
  ],
  [[3, 0, "|"]],
  [
    [3, 1, "_"],
    [3, 0, "|"],
  ],
  [
    [2, 1, "_"],
    [3, 0, "|"],
  ],
  [
    [2, 1, "_"],
    [3, 1, "_"],
    [3, 0, "|"],
  ],
]

const PLACES: Mark[][][] = [UNITS, TENS, HUNDREDS, THOUSANDS]

function readGrid(): string[][] {
  const rows: string[][] = []
  for (let i = 0; i < 5; i++) {
    const line = readline()
    const chars: string[] = []
    for (let c = 0; c < 5; c++) {
      chars.push(c < line.length ? line[c] : " ")
    }
    rows.push(chars)
  }
  return rows
}

function decodeDigit(grid: string[][], table: Mark[][]): number {
  // Find the digit whose mark set exactly matches what is present.
  // Collect all cells referenced by any digit in this place.
  const cells: Set<string> = new Set<string>()
  for (const marks of table) {
    for (const [r, c] of marks) {
      cells.add(`${r},${c}`)
    }
  }
  for (let d = 0; d < 10; d++) {
    const want: Map<string, string> = new Map<string, string>()
    for (const [r, c, ch] of table[d]) {
      want.set(`${r},${c}`, ch)
    }
    let ok = true
    for (const key of cells) {
      const parts = key.split(",")
      const r = Number(parts[0])
      const c = Number(parts[1])
      const actual = grid[r][c]
      const expected = want.has(key) ? (want.get(key) as string) : " "
      if (actual !== expected) {
        ok = false
        break
      }
    }
    if (ok) {
      return d
    }
  }
  return 0
}

function decodeNumber(grid: string[][]): number {
  let value = 0
  let mul = 1
  for (const table of PLACES) {
    value += decodeDigit(grid, table) * mul
    mul *= 10
  }
  return value
}

function render(value: number): string[] {
  const grid: string[][] = []
  for (let r = 0; r < 5; r++) {
    grid.push([" ", " ", " ", " ", " "])
  }
  // Spine
  grid[1][2] = "|"
  grid[2][2] = "|"
  grid[3][2] = "|"
  let mul = 1
  for (const table of PLACES) {
    const digit = Math.floor(value / mul) % 10
    for (const [r, c, ch] of table[digit]) {
      grid[r][c] = ch
    }
    mul *= 10
  }
  return grid.map(row => row.join(""))
}

const a = decodeNumber(readGrid())
const b = decodeNumber(readGrid())
console.log(render(a + b).join("\n"))
