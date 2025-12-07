import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 7

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [handString, bidString] = line.split(" ")
    const hand = handString.split("")
    const bid = +bidString
    return { hand, bid }
  })
}

function getCardValuePart1(card: string): number {
  if (card.match(/[2-9]/)) {
    return parseInt(card, 10)
  }
  switch (card) {
    case "T":
      return 10
    case "J":
      return 11
    case "Q":
      return 12
    case "K":
      return 13
    case "A":
      return 14
    default:
      return 0
  }
}

function getCardValuePart2(card: string): number {
  if (card.match(/[2-9]/)) {
    return parseInt(card, 10)
  }
  switch (card) {
    case "T":
      return 10
    case "J":
      return 1 // Joker is now weakest
    case "Q":
      return 12
    case "K":
      return 13
    case "A":
      return 14
    default:
      return 0
  }
}

function getHandType(hand: string[]): number {
  const uniqueCards = Array.from(new Set(hand))
  const counts = uniqueCards.map(card => hand.filter(c => c === card).length).sort((a, b) => b - a)

  if (counts[0] === 5) {
    // Five of a kind
    return 6
  }
  if (counts[0] === 4) {
    // Four of a kind
    return 5
  }
  if (counts[0] === 3 && counts[1] === 2) {
    // Full house
    return 4
  }
  if (counts[0] === 3) {
    // Three of a kind
    return 3
  }
  if (counts[0] === 2 && counts[1] === 2) {
    // Two pair
    return 2
  }
  if (counts[0] === 2) {
    // One pair
    return 1
  }
  // High card
  return 0
}

function compareHandsPart1(a: string[], b: string[]): number {
  const typeA = getHandType(a)
  const typeB = getHandType(b)

  if (typeA !== typeB) {
    return typeA - typeB
  }

  // Same type - compare cards left to right in original order
  for (let i = 0; i < a.length; ++i) {
    const valA = getCardValuePart1(a[i])
    const valB = getCardValuePart1(b[i])
    if (valA !== valB) {
      return valA - valB
    }
  }
  return 0
}

function getHandTypeWithJokers(hand: string[]): number {
  const jokerCount = hand.filter(c => c === "J").length
  if (jokerCount === 0) {
    return getHandType(hand)
  }
  if (jokerCount === 5) {
    return 6 // Five of a kind
  }

  // Count non-joker cards
  const nonJokers = hand.filter(c => c !== "J")
  const uniqueCards = Array.from(new Set(nonJokers))
  const counts = uniqueCards.map(card => nonJokers.filter(c => c === card).length).sort((a, b) => b - a)

  // Add jokers to the highest count to maximize hand type
  const bestCount = counts[0] + jokerCount

  if (bestCount === 5) return 6 // Five of a kind
  if (bestCount === 4) return 5 // Four of a kind
  if (bestCount === 3 && counts[1] === 2) return 4 // Full house
  if (bestCount === 3) return 3 // Three of a kind
  if (bestCount === 2 && counts[1] === 2) return 2 // Two pair
  if (bestCount === 2) return 1 // One pair
  return 0
}

function compareHandsPart2(a: string[], b: string[]): number {
  const typeA = getHandTypeWithJokers(a)
  const typeB = getHandTypeWithJokers(b)

  if (typeA !== typeB) {
    return typeA - typeB
  }

  // Same type - compare cards left to right in original order
  for (let i = 0; i < a.length; ++i) {
    const valA = getCardValuePart2(a[i])
    const valB = getCardValuePart2(b[i])
    if (valA !== valB) {
      return valA - valB
    }
  }
  return 0
}

function part1(inputString: string) {
  const hands = parseInput(inputString)
  const sortedHands = hands.sort((a, b) => compareHandsPart1(a.hand, b.hand))
  const scores = sortedHands.map((hand, index) => (index + 1) * hand.bid)
  return scores.reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const hands = parseInput(inputString)
  const sortedHands = hands.sort((a, b) => compareHandsPart2(a.hand, b.hand))
  const scores = sortedHands.map((hand, index) => (index + 1) * hand.bid)
  return scores.reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 6440,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 5905,
      },
    ],
  },
} as AdventOfCodeContest
