// 🎮 CodinGame Puzzle - scrabble-score
// https://www.codingame.com/

const nbTiles: number = parseInt(readline(), 10)
const tileScore: Map<string, number> = new Map<string, number>()
for (let i = 0; i < nbTiles; i++) {
  const [ch, sc] = readline().split(" ")
  tileScore.set(ch, parseInt(sc, 10))
}
const [width, height] = readline()
  .split(" ")
  .map((v: string) => parseInt(v, 10))

const empty: string[] = []
for (let i = 0; i < height; i++) empty.push(readline())
const prev: string[] = []
for (let i = 0; i < height; i++) prev.push(readline())
const played: string[] = []
for (let i = 0; i < height; i++) played.push(readline())

const at = (board: string[], r: number, c: number): string =>
  r >= 0 && r < height && c >= 0 && c < width ? board[r][c] : "."

// Determine new tiles (cells where played has a letter and prev was empty)
const isNew: boolean[][] = []
let newCount: number = 0
for (let r = 0; r < height; r++) {
  const row: boolean[] = []
  for (let c = 0; c < width; c++) {
    const n = at(played, r, c) !== "." && at(prev, r, c) === "."
    row.push(n)
    if (n) newCount++
  }
  isNew.push(row)
}

type Word = { text: string; score: number }

const computeWord = (cells: Array<{ r: number; c: number }>): Word => {
  let sum: number = 0
  const wordMults: number[] = []
  let text: string = ""
  for (const { r, c } of cells) {
    const ch = at(played, r, c)
    text += ch
    let ts = tileScore.get(ch) ?? 0
    const special = at(empty, r, c)
    if (isNew[r][c]) {
      if (special === "l") ts *= 2
      else if (special === "L") ts *= 3
      else if (special === "w") wordMults.push(2)
      else if (special === "W") wordMults.push(3)
    }
    sum += ts
  }
  for (const m of wordMults) sum *= m
  return { text, score: sum }
}

const words: Word[] = []

const collect = (horizontal: boolean): void => {
  const outer = horizontal ? height : width
  const inner = horizontal ? width : height
  for (let a = 0; a < outer; a++) {
    let b = 0
    while (b < inner) {
      const r = horizontal ? a : b
      const c = horizontal ? b : a
      if (at(played, r, c) !== ".") {
        const cells: Array<{ r: number; c: number }> = []
        let hasNew: boolean = false
        while (b < inner) {
          const rr = horizontal ? a : b
          const cc = horizontal ? b : a
          if (at(played, rr, cc) === ".") break
          cells.push({ r: rr, c: cc })
          if (isNew[rr][cc]) hasNew = true
          b++
        }
        if (cells.length >= 2 && hasNew) words.push(computeWord(cells))
      } else {
        b++
      }
    }
  }
}

collect(true)
collect(false)

words.sort((x: Word, y: Word) => (x.text < y.text ? -1 : x.text > y.text ? 1 : 0))

let total: number = 0
const out: string[] = []
for (const w of words) {
  out.push(`${w.text} ${w.score}`)
  total += w.score
}
if (newCount === 7) {
  out.push("Bonus 50")
  total += 50
}
out.push(`Total ${total}`)
console.log(out.join("\n"))
