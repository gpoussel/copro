// 🎮 CodinGame Puzzle - embedded-chessboards
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const out: string[] = []
for (let k = 0; k < n; k++) {
  const parts: number[] = readline()
    .split(" ")
    .map((x: string) => parseInt(x, 10))
  const row: number = parts[0]
  const col: number = parts[1]
  const isWhite: number = parts[2]

  // A board's bottom-right tile is at (i+7, j+7) for top-left (i, j),
  // i in [0, row-8], j in [0, col-8]. That tile must be white.
  // Painting bottom-right tile (row-1, col-1) has color isWhite.
  const baseSum: number = (row - 1 + (col - 1)) % 2
  const p: number = isWhite === 1 ? baseSum : 1 - baseSum

  // Need (i+7 + j+7) % 2 === p  =>  (i + j) % 2 === p
  const ni: number = row - 7
  const nj: number = col - 7
  const ie: number = Math.ceil(ni / 2)
  const io: number = Math.floor(ni / 2)
  const je: number = Math.ceil(nj / 2)
  const jo: number = Math.floor(nj / 2)

  const count: number = p === 0 ? ie * je + io * jo : ie * jo + io * je
  out.push(String(count))
}
console.log(out.join("\n"))
