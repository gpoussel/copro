// 🎮 CodinGame Puzzle - boggle
// https://www.codingame.com/training/hard/boggle

// Plain backtracking DFS from every cell, marking cells used on the path.
const grid: string[] = []
for (let i = 0; i < 4; i++) grid.push(readline().trim().toUpperCase())
const n = parseInt(readline())

const used: boolean[][] = grid.map(() => new Array<boolean>(4).fill(false))

const search = (word: string, k: number, r: number, c: number): boolean => {
  if (grid[r][c] !== word[k]) return false
  if (k === word.length - 1) return true
  used[r][c] = true
  let found = false
  for (let dr = -1; dr <= 1 && !found; dr++) {
    for (let dc = -1; dc <= 1 && !found; dc++) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr > 3 || nc < 0 || nc > 3 || used[nr][nc]) continue
      found = search(word, k + 1, nr, nc)
    }
  }
  used[r][c] = false
  return found
}

const out: string[] = []
for (let i = 0; i < n; i++) {
  const word = readline().trim().toUpperCase()
  let ok = false
  if (word.length > 0 && word.length <= 16) {
    for (let r = 0; r < 4 && !ok; r++) for (let c = 0; c < 4 && !ok; c++) ok = search(word, 0, r, c)
  }
  out.push(String(ok))
}
console.log(out.join("\n"))
