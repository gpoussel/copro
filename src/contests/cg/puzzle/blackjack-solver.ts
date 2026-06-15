// 🎮 CodinGame Puzzle - blackjack-solver
// https://www.codingame.com/

function cardValue(card: string): number {
  if (card === "A") return 11
  if (card === "J" || card === "Q" || card === "K") return 10
  return parseInt(card, 10)
}

function handValue(cards: string[]): number {
  let total = 0
  let aces = 0
  for (const card of cards) {
    const v = cardValue(card)
    if (card === "A") aces++
    total += v
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

function isBlackjack(cards: string[]): boolean {
  return cards.length === 2 && handValue(cards) === 21
}

const bankCards: string[] = readline().split(" ")
const playerCards: string[] = readline().split(" ")

const bankValue = handValue(bankCards)
const playerValue = handValue(playerCards)
const bankBJ = isBlackjack(bankCards)
const playerBJ = isBlackjack(playerCards)

const bankBust = bankValue > 21
const playerBust = playerValue > 21

let result: string

if (playerBJ && !bankBJ) {
  result = "Blackjack!"
} else if (bankBJ && !playerBJ) {
  result = "Bank"
} else if (playerBust && bankBust) {
  result = "Bank"
} else if (playerBust) {
  result = "Bank"
} else if (bankBust) {
  result = "Player"
} else if (playerValue > bankValue) {
  result = "Player"
} else if (playerValue < bankValue) {
  result = "Bank"
} else {
  result = "Draw"
}

console.log(result)
