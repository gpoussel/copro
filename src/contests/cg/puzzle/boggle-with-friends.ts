// 🎮 CodinGame Puzzle - boggle-with-friends
// https://www.codingame.com/training/medium/boggle-with-friends

const board: string[][] = []
for (let i = 0; i < 4; i++) board.push(readline().trim().split(/\s+/))

function canSpell(word: string): boolean {
  const used: boolean[][] = board.map(row => row.map(() => false))
  const dfs = (r: number, c: number, k: number): boolean => {
    if (r < 0 || r >= 4 || c < 0 || c >= 4 || used[r][c] || board[r][c] !== word[k]) return false
    if (k === word.length - 1) return true
    used[r][c] = true
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        if ((dr || dc) && dfs(r + dr, c + dc, k + 1)) {
          used[r][c] = false
          return true
        }
    used[r][c] = false
    return false
  }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (dfs(r, c, 0)) return true
  return false
}

function points(word: string): number {
  const n = word.length
  if (n <= 4) return 1
  if (n === 5) return 2
  if (n === 6) return 3
  if (n === 7) return 5
  return 11
}

const n = parseInt(readline())
const players: { name: string; words: string[] }[] = []
const writers: { [word: string]: number } = {}
for (let i = 0; i < n; i++) {
  const tokens = readline().trim().split(/\s+/)
  const name = tokens[0]
  const words = tokens.slice(2).filter((w, j, arr) => arr.indexOf(w) === j)
  for (const w of words) writers[w] = (writers[w] || 0) + 1
  players.push({ name, words })
}

const results = players.map(p => {
  const scoring = p.words.filter(w => w.length > 2 && writers[w] === 1 && canSpell(w))
  return { name: p.name, scoring, score: scoring.reduce((s, w) => s + points(w), 0) }
})

let best = results[0]
for (const r of results) if (r.score > best.score) best = r

const out: string[] = [`${best.name} is the winner!`, "", "===Each Player's Score==="]
for (const r of results) out.push(`${r.name} ${r.score}`)
out.push("", "===Each Scoring Player's Scoring Words===")
for (const r of results) {
  if (r.score === 0) continue
  out.push(r.name)
  for (const w of r.scoring) out.push(`${points(w)} ${w}`)
}
console.log(out.join("\n"))
