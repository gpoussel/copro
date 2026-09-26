// 🎮 CodinGame Puzzle - tennis-score
// https://www.codingame.com/training/medium/tennis-score

const names = readline().trim().split(" ")
const maxSets = parseInt(readline())
const bits: number[] = []
for (const hex of readline().trim().split(/\s+/)) {
  const byte = parseInt(hex, 16)
  for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1)
}

const setsToWin = (maxSets + 1) / 2
const sets: number[][] = [[0, 0]]
const setsWon = [0, 0]
let points = [0, 0]
let winner = -1

const isTieBreak = (): boolean => {
  const current = sets[sets.length - 1]
  return current[0] === 6 && current[1] === 6
}

for (const p of bits) {
  if (winner >= 0) break
  points[p]++
  const target = isTieBreak() ? (sets.length === maxSets ? 10 : 7) : 4
  if (points[p] < target || points[p] - points[1 - p] < 2) continue
  // Game won
  points = [0, 0]
  const current = sets[sets.length - 1]
  current[p]++
  const setWon = (current[p] >= 6 && current[p] - current[1 - p] >= 2) || current[p] === 7
  if (!setWon) continue
  setsWon[p]++
  if (setsWon[p] === setsToWin) winner = p
  else sets.push([0, 0])
}

const gameScore = (player: number): string => {
  const mine = points[player]
  const theirs = points[1 - player]
  if (isTieBreak()) return String(mine)
  if (mine >= 3 && theirs >= 3) return mine === theirs ? "40" : mine > theirs ? "AV" : "-"
  return ["0", "15", "30", "40"][mine]
}

const pad = (name: string): string => {
  let s = name
  while (s.length < 15) s += "."
  return s
}

for (let player = 0; player < 2; player++) {
  const parts = [pad(names[player])].concat(sets.map(s => String(s[player])))
  if (winner < 0) parts.push("|", gameScore(player))
  console.log(parts.join(" "))
}
console.log(winner < 0 ? "Game in progress" : `${names[winner]} wins`)
