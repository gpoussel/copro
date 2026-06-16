// 🎮 CodinGame Puzzle - crop-circles
// https://www.codingame.com/training/easy/crop-circles

const W = 19
const H = 25

const field: boolean[][] = Array.from({ length: H }, () => Array<boolean>(W).fill(true))

const input: string = readline().trim()
const tokens: string[] = input.split(/\s+/)

for (const token of tokens) {
  let mode: "MOW" | "PLANT" | "PLANTMOW" = "MOW"
  let rest: string = token
  if (rest.startsWith("PLANTMOW")) {
    mode = "PLANTMOW"
    rest = rest.slice(8)
  } else if (rest.startsWith("PLANT")) {
    mode = "PLANT"
    rest = rest.slice(5)
  }
  const cx: number = rest.charCodeAt(0) - 97
  const cy: number = rest.charCodeAt(1) - 97
  const d: number = parseInt(rest.slice(2), 10)
  const r: number = d / 2
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx: number = x - cx
      const dy: number = y - cy
      if (dx * dx + dy * dy <= r * r) {
        if (mode === "MOW") {
          field[y][x] = false
        } else if (mode === "PLANT") {
          field[y][x] = true
        } else {
          field[y][x] = !field[y][x]
        }
      }
    }
  }
}

const lines: string[] = field.map(row => row.map(c => (c ? "{}" : "  ")).join(""))
console.log(lines.join("\n"))
