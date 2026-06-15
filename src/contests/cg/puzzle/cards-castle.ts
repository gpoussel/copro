// 🎮 CodinGame Puzzle - cards-castle
// https://www.codingame.com/training/medium/cards-castle

const H: number = parseInt(readline(), 10)
const grid: string[] = []
for (let i = 0; i < H; i++) grid.push(readline())
const W = H * 2

const at = (r: number, c: number): string => {
  if (r < 0 || r >= H || c < 0 || c >= W) return "."
  const row = grid[r]
  return c < row.length ? row[c] : "."
}

let stable = true

outer: for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    const ch = at(r, c)
    if (ch !== "/" && ch !== "\\") continue

    // Horizontal pairing: "/" must be followed by "\", "\" must be preceded by "/"
    if (ch === "/") {
      if (at(r, c + 1) !== "\\") {
        stable = false
        break outer
      }
    } else {
      if (at(r, c - 1) !== "/") {
        stable = false
        break outer
      }
    }

    // Support below: ground (bottom row) or a card with opposite orientation
    if (r !== H - 1) {
      const below = at(r + 1, c)
      if (below !== "/" && below !== "\\") {
        stable = false
        break outer
      } // flying card
      if (below === ch) {
        stable = false
        break outer
      } // same orientation below
    }
  }
}

console.log(stable ? "STABLE" : "UNSTABLE")
