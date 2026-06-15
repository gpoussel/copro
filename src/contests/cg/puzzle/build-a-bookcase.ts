// 🎮 CodinGame Puzzle - build-a-bookcase
// https://www.codingame.com/training/easy/build-a-bookcase

const height: number = parseInt(readline())
const width: number = parseInt(readline())
const s: number = parseInt(readline())

const out: string[] = []
if (width % 2 === 1) {
  const side = (width - 1) / 2
  out.push("/".repeat(side) + "^" + "\\".repeat(side))
} else {
  const side = width / 2
  out.push("/".repeat(side) + "\\".repeat(side))
}

const inner = width - 2
const empty = "|" + " ".repeat(inner) + "|"
const shelf = "|" + "_".repeat(inner) + "|"

const R = height - 1
const base = Math.floor(R / s)
const extra = R % s
for (let i = 0; i < s; i++) {
  const rows = i >= s - extra ? base + 1 : base
  for (let r = 0; r < rows - 1; r++) out.push(empty)
  out.push(shelf)
}
console.log(out.join("\n"))
