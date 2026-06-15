// 🎮 CodinGame Puzzle - snap
// https://www.codingame.com/training/easy/snap

const suitOrder: { [key: string]: number } = { S: 4, H: 3, D: 2, C: 1 }

function rankOf(card: string): string {
  return card.slice(0, card.length - 1)
}

function suitOf(card: string): string {
  return card[card.length - 1]
}

function readDeck(): string[] {
  const count: number = parseInt(readline(), 10)
  const deck: string[] = []
  for (let i = 0; i < count; i++) {
    deck.push(readline())
  }
  return deck
}

const p1: string[] = readDeck()
const p2: string[] = readDeck()
const decks: string[][] = [p1, p2]

// pile[pile.length - 1] is the most recently placed (top)
const pile: string[] = []
let turn: number = 0

let winnerIndex: number = -1

// If a player has no cards before the game starts, the other wins outright.
if (decks[0].length === 0) {
  winnerIndex = 1
} else if (decks[1].length === 0) {
  winnerIndex = 0
}

while (winnerIndex === -1) {
  if (decks[turn].length === 0) {
    // Current player cannot play: opponent wins
    winnerIndex = 1 - turn
    break
  }

  const card: string = decks[turn].shift() as string
  const below: string | undefined = pile.length > 0 ? pile[pile.length - 1] : undefined
  pile.push(card)

  if (below !== undefined && rankOf(below) === rankOf(card)) {
    // Snap: player who played the higher-suit card claims the pile
    const cardPlayer: number = turn
    const belowPlayer: number = 1 - turn
    const winner: number = suitOrder[suitOf(card)] > suitOrder[suitOf(below)] ? cardPlayer : belowPlayer

    // Place pile face-down on bottom, in bottom-to-top order
    while (pile.length > 0) {
      decks[winner].push(pile.shift() as string)
    }
    turn = winner
  } else {
    turn = 1 - turn
  }

  // The game ends the moment a player has no cards left in their deck.
  if (decks[0].length === 0) {
    winnerIndex = 1
  } else if (decks[1].length === 0) {
    winnerIndex = 0
  }
}
console.log(`Winner: Player ${winnerIndex + 1}`)
console.log(decks[winnerIndex].length)
