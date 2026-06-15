// 🎮 CodinGame Puzzle - playing-card-odds
// https://www.codingame.com/

const RANKS: string = "23456789TJQKA"
const SUITS: string = "CDHS"

function matches(card: string, classification: string): boolean {
  const cardRank: string = card[0]
  const cardSuit: string = card[1]
  const ranks: string[] = []
  const suits: string[] = []
  for (const ch of classification) {
    if (RANKS.includes(ch)) {
      ranks.push(ch)
    } else if (SUITS.includes(ch)) {
      suits.push(ch)
    }
  }
  const rankOk: boolean = ranks.length === 0 || ranks.includes(cardRank)
  const suitOk: boolean = suits.length === 0 || suits.includes(cardSuit)
  return rankOk && suitOk
}

const firstLine: string[] = readline().split(" ")
const R: number = parseInt(firstLine[0], 10)
const S: number = parseInt(firstLine[1], 10)

const removed: string[] = []
for (let i = 0; i < R; i++) {
  removed.push(readline())
}

const sought: string[] = []
for (let i = 0; i < S; i++) {
  sought.push(readline())
}

const deck: string[] = []
for (const r of RANKS) {
  for (const s of SUITS) {
    deck.push(r + s)
  }
}

const remaining: string[] = deck.filter(
  (card: string): boolean => !removed.some((cls: string): boolean => matches(card, cls))
)

const soughtCount: number = remaining.filter((card: string): boolean =>
  sought.some((cls: string): boolean => matches(card, cls))
).length

let percentage: number = 0
if (remaining.length > 0) {
  percentage = Math.round((soughtCount / remaining.length) * 100)
}

console.log(percentage + "%")
