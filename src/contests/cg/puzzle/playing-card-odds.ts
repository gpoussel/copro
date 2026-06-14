// 🎮 CodinGame Puzzle - playing-card-odds
// https://www.codingame.com/training/medium/playing-card-odds

const RANKS = "23456789TJQKA"
const SUITS = "CDHS"

const [R, S] = readline()
  .split(" ")
  .map(v => parseInt(v))

interface Card {
  rank: string
  suit: string
}

const deck: Card[] = []
for (const r of RANKS) for (const s of SUITS) deck.push({ rank: r, suit: s })

function parseClass(str: string): { ranks: Set<string>; suits: Set<string> } {
  const ranks = new Set<string>()
  const suits = new Set<string>()
  for (const ch of str) {
    if (RANKS.includes(ch)) ranks.add(ch)
    else if (SUITS.includes(ch)) suits.add(ch)
  }
  return { ranks, suits }
}

function matches(c: Card, cls: { ranks: Set<string>; suits: Set<string> }): boolean {
  const rankOk = cls.ranks.size === 0 || cls.ranks.has(c.rank)
  const suitOk = cls.suits.size === 0 || cls.suits.has(c.suit)
  return rankOk && suitOk
}

const removed: { ranks: Set<string>; suits: Set<string> }[] = []
for (let i = 0; i < R; i++) removed.push(parseClass(readline().trim()))
const sought: { ranks: Set<string>; suits: Set<string> }[] = []
for (let i = 0; i < S; i++) sought.push(parseClass(readline().trim()))

const remaining = deck.filter(c => !removed.some(cls => matches(c, cls)))
const wanted = remaining.filter(c => sought.some(cls => matches(c, cls)))

let pct = 0
if (remaining.length > 0) {
  pct = Math.round((wanted.length / remaining.length) * 100)
}

console.log(pct + "%")
