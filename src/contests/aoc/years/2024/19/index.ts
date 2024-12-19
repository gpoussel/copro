import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 19

function parseInput(input: string) {
  const [towelBlock, patternBlock] = utils.input.blocks(input)
  const towels = utils.input.firstLine(towelBlock).split(", ")
  const patterns = utils.input.lines(patternBlock)
  return { towels, patterns }
}

function isComposable(towels: string[], pattern: string) {
  if (towels.includes(pattern)) {
    return true
  }
  const dp = new Array<boolean>()
  dp[0] = true
  for (let i = 1; i <= pattern.length; ++i) {
    dp[i] = false
  }
  for (let i = 1; i <= pattern.length; ++i) {
    for (let j = 0; j < i; ++j) {
      if (dp[j] && towels.includes(pattern.substring(j, i))) {
        dp[i] = true
        break
      }
    }
  }
  return dp[pattern.length]
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.patterns.filter(p => isComposable(input.towels, p)).length
}

function countCompositions(towels: string[], pattern: string) {
  if (towels.includes(pattern)) {
    return 1
  }
  const dp = new Array<number>()
  dp[0] = 1
  for (let i = 1; i <= pattern.length; ++i) {
    dp[i] = 0
  }
  for (let i = 1; i <= pattern.length; ++i) {
    for (let j = 0; j < i; ++j) {
      if (dp[j] && towels.includes(pattern.substring(j, i))) {
        dp[i] += dp[j]
      }
    }
  }
  return dp[pattern.length]
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.patterns
    .filter(p => isComposable(input.towels, p))
    .reduce((acc, p) => acc + countCompositions(input.towels, p), 0)
}

const EXAMPLE = `
r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 6,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 16,
      },
    ],
  },
} as AdventOfCodeContest
