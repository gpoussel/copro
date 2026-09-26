// 🎮 CodinGame Puzzle - mind-cracker
// https://www.codingame.com/training/hard/mind-cracker

// Depth-first search over the code, one position at a time. For every guess
// we maintain the blacks so far (exact position matches) and the total
// matches so far (sum over colours of min(guess count, code count)); both only
// grow, and each can grow by at most one per remaining position, which prunes
// the search very early.
const nColors = Number(readline())
const nColumns = Number(readline())
const nLines = Number(readline())
const guesses: number[][] = []
const blacks: number[] = []
const totals: number[] = []
const guessCount: number[][] = []
for (let i = 0; i < nLines; i++) {
  const [g, b, w] = readline().trim().split(/\s+/)
  const digits = g.split("").map(Number)
  guesses.push(digits)
  blacks.push(Number(b))
  totals.push(Number(b) + Number(w))
  const cnt = new Array<number>(nColors).fill(0)
  for (const d of digits) cnt[d]++
  guessCount.push(cnt)
}

const code = new Array<number>(nColumns).fill(0)
const codeCount = new Array<number>(nColors).fill(0)
const curBlack = new Array<number>(nLines).fill(0)
const curTotal = new Array<number>(nLines).fill(0)

function search(pos: number): boolean {
  const left = nColumns - pos
  for (let i = 0; i < nLines; i++) {
    if (curBlack[i] > blacks[i] || curBlack[i] + left < blacks[i]) return false
    if (curTotal[i] > totals[i] || curTotal[i] + left < totals[i]) return false
  }
  if (pos === nColumns) return true
  for (let c = 0; c < nColors; c++) {
    code[pos] = c
    for (let i = 0; i < nLines; i++) {
      if (guesses[i][pos] === c) curBlack[i]++
      if (codeCount[c] < guessCount[i][c]) curTotal[i]++
    }
    codeCount[c]++
    if (search(pos + 1)) return true
    codeCount[c]--
    for (let i = 0; i < nLines; i++) {
      if (guesses[i][pos] === c) curBlack[i]--
      if (codeCount[c] < guessCount[i][c]) curTotal[i]--
    }
  }
  return false
}
search(0)
console.log(code.join(""))
