const bank = readline().split(" ")
const player = readline().split(" ")

function value(card: string): number {
  if (card === "A") return 11
  if (["10", "J", "Q", "K"].includes(card)) return 10
  return parseInt(card)
}

function score(cards: string[]): number {
  let total = 0
  let aces = 0
  for (const c of cards) {
    total += value(c)
    if (c === "A") aces++
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

function isBlackjack(cards: string[]): boolean {
  return cards.length === 2 && score(cards) === 21
}

const bankScore = score(bank)
const playerScore = score(player)
const bankBJ = isBlackjack(bank)
const playerBJ = isBlackjack(player)

let result: string

if (playerBJ && !bankBJ) {
  result = "Blackjack!"
} else if (playerBJ && bankBJ) {
  result = "Draw"
} else if (bankBJ && !playerBJ) {
  result = "Bank"
} else {
  const bankBust = bankScore > 21
  const playerBust = playerScore > 21
  if (playerBust) {
    result = "Bank"
  } else if (bankBust) {
    result = "Player"
  } else if (playerScore > bankScore) {
    result = "Player"
  } else if (playerScore < bankScore) {
    result = "Bank"
  } else {
    result = "Draw"
  }
}

console.log(result)
