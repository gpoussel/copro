// 🎮 CodinGame Puzzle - sand-fall
// https://www.codingame.com/training/easy/sand-fall

const [w, h]: number[] = readline()
  .split(" ")
  .map((x: string): number => parseInt(x, 10))
const n: number = parseInt(readline(), 10)

const grid: string[][] = Array.from({ length: h }, (): string[] => new Array<string>(w).fill(" "))

const empty = (r: number, c: number): boolean => r < h && c >= 0 && c < w && grid[r][c] === " "

for (let i = 0; i < n; i++) {
  const [s, ps]: string[] = readline().split(" ")
  const isLower: boolean = s >= "a" && s <= "z"
  let r = 0
  let c: number = parseInt(ps, 10)
  const d1: number = isLower ? 1 : -1
  const d2: number = -d1
  while (true) {
    if (empty(r + 1, c)) {
      r++
    } else if (empty(r + 1, c + d1)) {
      r++
      c += d1
    } else if (empty(r + 1, c + d2)) {
      r++
      c += d2
    } else if (grid[r][c] !== " " && empty(r, c + d1)) {
      c += d1
    } else if (grid[r][c] !== " " && empty(r, c + d2)) {
      c += d2
    } else {
      break
    }
  }
  grid[r][c] = s
}

const lines: string[] = grid.map((row: string[]): string => "|" + row.join("") + "|")
lines.push("+" + "-".repeat(w) + "+")
console.log(lines.join("\n"))
