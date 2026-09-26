// 🎮 CodinGame Puzzle - texas-holdem
// https://www.codingame.com/training/medium/texas-holdem

const VALUE_CHARS = "23456789TJQKA"
const HAND_TYPES = [
  "HIGH_CARD",
  "PAIR",
  "TWO_PAIR",
  "THREE_OF_A_KIND",
  "STRAIGHT",
  "FLUSH",
  "FULL_HOUSE",
  "FOUR_OF_A_KIND",
  "STRAIGHT_FLUSH",
]

interface PokerCard {
  value: number // 2..14
  suit: string
}

interface HandScore {
  type: number
  ordered: number[] // card values in output order (low ace = 1)
}

function parseCards(line: string): PokerCard[] {
  return line
    .trim()
    .split(" ")
    .map(s => ({ value: VALUE_CHARS.indexOf(s[0]) + 2, suit: s[1] }))
}

function evaluateFive(cards: PokerCard[]): HandScore {
  const values = cards.map(c => c.value).sort((a, b) => b - a)
  const isFlush = cards.every(c => c.suit === cards[0].suit)
  const distinct = values.every((v, i) => i === 0 || v !== values[i - 1])
  let straight: number[] | null = null
  if (distinct && values[0] - values[4] === 4) straight = values
  else if (distinct && values.join(",") === "14,5,4,3,2") straight = [5, 4, 3, 2, 1]
  if (straight) return { type: isFlush ? 8 : 4, ordered: straight }
  if (isFlush) return { type: 5, ordered: values }

  const counts: { [value: number]: number } = {}
  for (const v of values) counts[v] = (counts[v] || 0) + 1
  const ordered = values.slice().sort((a, b) => counts[b] - counts[a] || b - a)
  const pattern = Object.keys(counts)
    .map(k => counts[+k])
    .sort((a, b) => b - a)
    .join("")
  const typeByPattern: { [pattern: string]: number } = {
    "41": 7,
    "32": 6,
    "311": 3,
    "221": 2,
    "2111": 1,
    "11111": 0,
  }
  return { type: typeByPattern[pattern], ordered }
}

function compareScores(a: HandScore, b: HandScore): number {
  if (a.type !== b.type) return a.type - b.type
  for (let i = 0; i < 5; i++) {
    if (a.ordered[i] !== b.ordered[i]) return a.ordered[i] - b.ordered[i]
  }
  return 0
}

function bestHand(cards: PokerCard[]): HandScore {
  let best: HandScore | null = null
  for (let skipA = 0; skipA < cards.length; skipA++) {
    for (let skipB = skipA + 1; skipB < cards.length; skipB++) {
      const five = cards.filter((_, k) => k !== skipA && k !== skipB)
      const score = evaluateFive(five)
      if (best === null || compareScores(score, best) > 0) best = score
    }
  }
  return best!
}

const holePlayer1 = parseCards(readline())
const holePlayer2 = parseCards(readline())
const communityCards = parseCards(readline())
const score1 = bestHand(holePlayer1.concat(communityCards))
const score2 = bestHand(holePlayer2.concat(communityCards))
const comparison = compareScores(score1, score2)

function formatValues(values: number[]): string {
  return values.map(v => (v === 1 ? "A" : VALUE_CHARS[v - 2])).join("")
}

if (comparison === 0) console.log("DRAW")
else {
  const winnerId = comparison > 0 ? 1 : 2
  const winner = comparison > 0 ? score1 : score2
  console.log(`${winnerId} ${HAND_TYPES[winner.type]} ${formatValues(winner.ordered)}`)
}
