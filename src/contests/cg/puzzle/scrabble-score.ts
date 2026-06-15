// 🎮 CodinGame Puzzle - scrabble-score
// https://www.codingame.com/training/easy/scrabble-score

const nbTiles = parseInt(readline())
const score: Record<string, number> = {}
for (let i = 0; i < nbTiles; i++) {
  const line = readline()
  const sp = line.lastIndexOf(" ")
  const ch = line.substring(0, sp)
  const sc = parseInt(line.substring(sp + 1))
  score[ch] = sc
}
const [width, height] = readline().split(" ").map(Number)
const empty: string[] = []
for (let i = 0; i < height; i++) empty.push(readline())
const prev: string[] = []
for (let i = 0; i < height; i++) prev.push(readline())
const played: string[] = []
for (let i = 0; i < height; i++) played.push(readline())

const isNew: boolean[][] = []
let newCount = 0
for (let r = 0; r < height; r++) {
  isNew.push([])
  for (let c = 0; c < width; c++) {
    const p = prev[r][c]
    const n = played[r][c]
    const newTile = n !== "." && p === "."
    isNew[r].push(newTile)
    if (newTile) newCount++
  }
}

function isLetter(r: number, c: number): boolean {
  return played[r][c] !== "."
}

type WordRes = { word: string; sc: number }
const results: WordRes[] = []

function evalWord(cells: { r: number; c: number }[]): WordRes {
  let word = ""
  let sum = 0
  let wordMult = 1
  for (const { r, c } of cells) {
    const ch = played[r][c]
    word += ch
    let tileScore = score[ch]
    const special = empty[r][c]
    if (isNew[r][c]) {
      if (special === "l") tileScore *= 2
      else if (special === "L") tileScore *= 3
      else if (special === "w") wordMult *= 2
      else if (special === "W") wordMult *= 3
    }
    sum += tileScore
  }
  return { word, sc: sum * wordMult }
}

for (let r = 0; r < height; r++) {
  let c = 0
  while (c < width) {
    if (isLetter(r, c)) {
      const cells: { r: number; c: number }[] = []
      let hasNew = false
      while (c < width && isLetter(r, c)) {
        cells.push({ r, c })
        if (isNew[r][c]) hasNew = true
        c++
      }
      if (cells.length >= 2 && hasNew) results.push(evalWord(cells))
    } else c++
  }
}
for (let c = 0; c < width; c++) {
  let r = 0
  while (r < height) {
    if (isLetter(r, c)) {
      const cells: { r: number; c: number }[] = []
      let hasNew = false
      while (r < height && isLetter(r, c)) {
        cells.push({ r, c })
        if (isNew[r][c]) hasNew = true
        r++
      }
      if (cells.length >= 2 && hasNew) results.push(evalWord(cells))
    } else r++
  }
}

results.sort((a, b) => (a.word < b.word ? -1 : a.word > b.word ? 1 : 0))
let total = 0
const out: string[] = []
for (const res of results) {
  out.push(`${res.word} ${res.sc}`)
  total += res.sc
}
if (newCount === 7) {
  out.push("Bonus 50")
  total += 50
}
out.push(`Total ${total}`)
console.log(out.join("\n"))
