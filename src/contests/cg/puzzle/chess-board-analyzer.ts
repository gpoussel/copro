// 🎮 CodinGame Puzzle - chess-board-analyzer
// https://www.codingame.com/training/hard/chess-board-analyzer

// A king is mated when it is in check and every square around it is either
// off-board, held by its own side, or attacked by the opponent. Attacks are
// computed with the king lifted from the board (so it cannot hide behind
// itself on a line); an attacked enemy piece counts as protected.

const chessBoard: string[] = []
for (let i = 0; i < 8; i++) chessBoard.push(readline())

const inside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8
const isWhite = (ch: string) => ch >= "A" && ch <= "Z"

// Squares attacked by the side `white`, ignoring the square `skip`
function attacks(white: boolean, skip: [number, number]): boolean[][] {
  const hit = Array.from({ length: 8 }, () => new Array<boolean>(8).fill(false))
  const at = (r: number, c: number) => (r === skip[0] && c === skip[1] ? "." : chessBoard[r][c])
  const ray = (r: number, c: number, dirs: number[][]) => {
    for (const [dr, dc] of dirs)
      for (let rr = r + dr, cc = c + dc; inside(rr, cc); rr += dr, cc += dc) {
        hit[rr][cc] = true
        if (at(rr, cc) !== ".") break
      }
  }
  const jumps = (r: number, c: number, dirs: number[][]) => {
    for (const [dr, dc] of dirs) if (inside(r + dr, c + dc)) hit[r + dr][c + dc] = true
  }
  const straight = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  const diagonal = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  const knight = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ]
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const ch = at(r, c)
      if (ch === "." || isWhite(ch) !== white) continue
      switch (ch.toLowerCase()) {
        case "r":
          ray(r, c, straight)
          break
        case "b":
          ray(r, c, diagonal)
          break
        case "q":
          ray(r, c, [...straight, ...diagonal])
          break
        case "n":
          jumps(r, c, knight)
          break
        case "k":
          jumps(r, c, [...straight, ...diagonal])
          break
        case "p":
          jumps(
            r,
            c,
            white
              ? [
                  [-1, -1],
                  [-1, 1],
                ]
              : [
                  [1, -1],
                  [1, 1],
                ]
          )
          break
      }
    }
  return hit
}

function mated(white: boolean): boolean {
  const kingChar = white ? "K" : "k"
  let kr = -1
  let kc = -1
  chessBoard.forEach((row, r) => [...row].forEach((ch, c) => ch === kingChar && ((kr = r), (kc = c))))
  if (kr < 0) return false
  const enemy = attacks(!white, [kr, kc])
  if (!enemy[kr][kc]) return false
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const r = kr + dr
      const c = kc + dc
      if ((dr === 0 && dc === 0) || !inside(r, c)) continue
      const ch = chessBoard[r][c]
      if (ch !== "." && isWhite(ch) === white) continue
      if (!enemy[r][c]) return false
    }
  return true
}

console.log(mated(false) ? "W" : mated(true) ? "B" : "N")
