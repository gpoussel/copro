import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 4

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [cardPart, rest] = line.split(": ")
    const [winningPart, ownPart] = rest.split(" | ")
    const winningNumbers = winningPart
      .trim()
      .split(/ +/)
      .map(s => +s.trim())
    const ownNumbers = ownPart
      .trim()
      .split(/ +/)
      .map(s => +s.trim())
    return {
      cardId: +cardPart.replace("Card ", "").trim(),
      winningNumbers,
      ownNumbers,
    }
  })
}

function countMatchingNumbers(winningNumbers: number[], ownNumbers: number[]): number {
  const winningSet = new Set(winningNumbers)
  let count = 0
  for (const num of ownNumbers) {
    if (winningSet.has(num)) {
      count++
    }
  }
  return count
}

function buildMatchingNumberMap(cards: ReturnType<typeof parseInput>): Map<number, number> {
  const matchMap = new Map<number, number>()
  for (const card of cards) {
    const matchCount = countMatchingNumbers(card.winningNumbers, card.ownNumbers)
    matchMap.set(card.cardId, matchCount)
  }
  return matchMap
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const matchMap = buildMatchingNumberMap(input)
  return [...matchMap.values()]
    .filter(count => count > 0)
    .map(count => 2 ** (count - 1))
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const matchMap = buildMatchingNumberMap(input)
  const copies = Array.from(matchMap.values()).map(count => 1)
  for (const [index, matchCount] of matchMap.entries()) {
    for (let i = 1; i <= matchCount; i++) {
      copies[index + i - 1] += copies[index - 1]
    }
  }
  return copies.reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 13,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 30,
      },
    ],
  },
} as AdventOfCodeContest
