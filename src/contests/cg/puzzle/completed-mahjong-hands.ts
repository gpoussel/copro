// 🎮 CodinGame Puzzle - completed-mahjong-hands
// https://www.codingame.com/training/expert/completed-mahjong-hands

// Tiles are counted in a 34-slot histogram (m, p, s: 9 ranks each, z: 7).
// Standard hands are checked by recursion on the lowest remaining tile: it
// must start a triplet or a run (runs only in number suits). The pair is
// chosen up front among tiles present at least twice.

const SUITS = "mpsz"
const [handText, drawn] = readline().split(" ")
const counts: number[] = new Array(34).fill(0)
const tileIndex = (suit: string, rank: number): number => SUITS.indexOf(suit) * 9 + rank - 1

let pending: number[] = []
for (const ch of handText + drawn) {
  if (ch >= "0" && ch <= "9") pending.push(Number(ch))
  else {
    for (const rank of pending) counts[tileIndex(ch, rank)]++
    pending = []
  }
}

// Can the remaining tiles be split into sets only?
const allSets = (): boolean => {
  let i = 0
  while (i < 34 && counts[i] === 0) i++
  if (i === 34) return true
  if (counts[i] >= 3) {
    counts[i] -= 3
    const ok = allSets()
    counts[i] += 3
    if (ok) return true
  }
  if (i < 27 && i % 9 <= 6 && counts[i + 1] > 0 && counts[i + 2] > 0) {
    counts[i]--
    counts[i + 1]--
    counts[i + 2]--
    const ok = allSets()
    counts[i]++
    counts[i + 1]++
    counts[i + 2]++
    if (ok) return true
  }
  return false
}

const standard = (): boolean => {
  for (let i = 0; i < 34; i++) {
    if (counts[i] < 2) continue
    counts[i] -= 2
    const ok = allSets()
    counts[i] += 2
    if (ok) return true
  }
  return false
}

const sevenPairs = (): boolean => counts.filter(c => c === 2).length === 7

const kokushi = (): boolean => {
  const terminals = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33]
  let total = 0
  for (const t of terminals) {
    if (counts[t] === 0) return false
    total += counts[t]
  }
  return total === 14
}

console.log(standard() || sevenPairs() || kokushi() ? "TRUE" : "FALSE")
