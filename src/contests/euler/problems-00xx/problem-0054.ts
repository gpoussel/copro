// 🧮 Project Euler - Problem 54

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

function getRank(card: string) {
  return card[0]
}

function getSuit(card: string) {
  return card[1]
}

function isFlush(hand: string[]) {
  return new Set(hand.map(getSuit)).size === 1
}

function getRankValue(card: string) {
  return "23456789TJQKA".indexOf(getRank(card))
}

function getHighestCard(hand: string[]) {
  return Math.max(...hand.map(card => getRankValue(card)))
}

function isStraight(hand: string[]) {
  for (const possibleStraight of [
    "2345A",
    "23456",
    "34567",
    "45678",
    "56789",
    "6789T",
    "789TJ",
    "89TJQ",
    "9TJQK",
    "TJQKA",
  ]) {
    if (possibleStraight.split("").every(card => hand.some(c => getRank(c) === card))) {
      return true
    }
  }
}

function isNthOfAKind(hand: string[], n: number) {
  const ranks = hand.map(getRank)
  return ranks.some(rank => ranks.filter(r => r === rank).length === n)
}

function findNthOfAKind(hand: string[], n: number) {
  return getRankValue(hand.find(card => hand.filter(c => getRank(c) === getRank(card)).length === n)!)
}

function isRoyalFlush(hand: string[]) {
  return "TJQKA".split("").every(card => hand.some(c => getRank(c) === card))
}

function isStraightFlush(hand: string[]) {
  return isFlush(hand) && isStraight(hand)
}

function isFlushHouse(hand: string[]) {
  if (isNthOfAKind(hand, 3)) {
    const rankThree = findNthOfAKind(hand, 3)
    const otherCards = hand.filter(card => getRankValue(card) !== rankThree)
    return isNthOfAKind(otherCards, 2)
  }
  return false
}

function isTwoPairs(hand: string[]) {
  if (isNthOfAKind(hand, 2)) {
    const rankTwo = findNthOfAKind(hand, 2)
    const otherCards = hand.filter(card => getRankValue(card) !== rankTwo)
    if (isNthOfAKind(otherCards, 2)) {
      return true
    }
  }
  return false
}

function getHandScore(hand: string[]): { handRank: number; cards: number[] } {
  if (isRoyalFlush(hand)) {
    return { handRank: 10, cards: [] }
  }
  if (isStraightFlush(hand)) {
    return { handRank: 9, cards: [getHighestCard(hand)] }
  }
  if (isNthOfAKind(hand, 4)) {
    const rankFour = findNthOfAKind(hand, 4)
    const rankOne = findNthOfAKind(hand, 1)
    return { handRank: 8, cards: [rankFour, rankOne] }
  }
  if (isFlushHouse(hand)) {
    const rankThree = findNthOfAKind(hand, 3)
    const otherCards = hand.filter(card => getRankValue(card) !== rankThree)
    const rankTwo = findNthOfAKind(otherCards, 2)
    return { handRank: 7, cards: [rankThree, rankTwo] }
  }
  if (isFlush(hand)) {
    return { handRank: 6, cards: hand.map(getRankValue).sort((a, b) => b - a) }
  }
  if (isStraight(hand)) {
    return { handRank: 5, cards: [getHighestCard(hand)] }
  }
  if (isNthOfAKind(hand, 3)) {
    const rankThree = findNthOfAKind(hand, 3)
    const otherCards = hand.filter(card => getRankValue(card) !== rankThree)
    return { handRank: 4, cards: [rankThree, ...otherCards.map(getRankValue).sort((a, b) => b - a)] }
  }
  if (isTwoPairs(hand)) {
    const rankTwo1 = findNthOfAKind(hand, 2)
    const otherCards1 = hand.filter(card => getRankValue(card) !== rankTwo1)
    const rankTwo2 = findNthOfAKind(otherCards1, 2)
    const ranksWithPairs = [rankTwo1, rankTwo2].sort((a, b) => b - a)
    const rankOne = hand.filter(card => !ranksWithPairs.includes(getRankValue(card)))[0]
    return { handRank: 3, cards: [...ranksWithPairs, getRankValue(rankOne)] }
  }
  if (isNthOfAKind(hand, 2)) {
    const rankTwo = findNthOfAKind(hand, 2)
    const otherCards = hand.filter(card => getRankValue(card) !== rankTwo)
    return { handRank: 2, cards: [rankTwo, ...otherCards.map(getRankValue).sort((a, b) => b - a)] }
  }
  return { handRank: 1, cards: hand.map(getRankValue).sort((a, b) => b - a) }
}

function isPlayer1Winner(player1: string[], player2: string[]) {
  const { handRank: handRank1, cards: cards1 } = getHandScore(player1)
  const { handRank: handRank2, cards: cards2 } = getHandScore(player2)
  if (handRank1 > handRank2) {
    return true
  } else if (handRank1 < handRank2) {
    return false
  }
  for (let i = 0; i < cards1.length; i++) {
    if (cards1[i] > cards2[i]) {
      return true
    } else if (cards1[i] < cards2[i]) {
      return false
    }
  }
  throw new Error(`Tie breaker needed for ${player1} and ${player2}`)
}

export function solve() {
  const filePath = resolve(dirname(fileURLToPath(import.meta.url)), "0054_poker.txt")
  const hands = readFileSync(filePath, "utf-8")
    .trim()
    .split("\n")
    .map(line => line.trim().split(" "))
    .map(cards => ({
      player1: cards.slice(0, 5),
      player2: cards.slice(5),
    }))
  return hands.filter(deal => isPlayer1Winner(deal.player1, deal.player2)).length
}
