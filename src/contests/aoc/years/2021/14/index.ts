import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 14

function parseInput(input: string) {
  const [templateInput, rulesInput] = utils.input.blocks(input)
  const template = utils.input.firstLine(templateInput)
  const rules = new Map<string, string>()
  for (const line of utils.input.lines(rulesInput)) {
    const [pair, insert] = line.split(" -> ")
    rules.set(pair, insert)
  }
  return { template, rules }
}

function applyRepeat(polymer: string, rules: Map<string, string>, steps: number) {
  // Count pairs instead of building the actual string
  let pairCounts = new Map<string, number>()
  for (let i = 0; i < polymer.length - 1; i++) {
    const pair = polymer[i] + polymer[i + 1]
    pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1)
  }

  for (let step = 0; step < steps; step++) {
    const newPairCounts = new Map<string, number>()
    for (const [pair, count] of pairCounts) {
      if (rules.has(pair)) {
        const insert = rules.get(pair)!
        const left = pair[0] + insert
        const right = insert + pair[1]
        newPairCounts.set(left, (newPairCounts.get(left) || 0) + count)
        newPairCounts.set(right, (newPairCounts.get(right) || 0) + count)
      } else {
        newPairCounts.set(pair, (newPairCounts.get(pair) || 0) + count)
      }
    }
    pairCounts = newPairCounts
  }

  // Convert pair counts to character counts
  const charCounts = new Map<string, number>()
  for (const [pair, count] of pairCounts) {
    charCounts.set(pair[0], (charCounts.get(pair[0]) || 0) + count)
  }
  // Add the last character (which never changes)
  const lastChar = polymer[polymer.length - 1]
  charCounts.set(lastChar, (charCounts.get(lastChar) || 0) + 1)

  const sortedCounts = Array.from(charCounts.values()).sort((a, b) => a - b)
  return sortedCounts[sortedCounts.length - 1] - sortedCounts[0]
}

function part1(inputString: string) {
  const { template, rules } = parseInput(inputString)
  return applyRepeat(template, rules, 10)
}

function part2(inputString: string) {
  const { template, rules } = parseInput(inputString)
  return applyRepeat(template, rules, 40)
}

const EXAMPLE = `
NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1588,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2188189693529,
      },
    ],
  },
} as AdventOfCodeContest
