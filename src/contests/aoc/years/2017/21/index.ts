import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 21

function parseInput(input: string) {
  const patterns = new Map<string, string[][]>()
  utils.input.lines(input).forEach(line => {
    const [from, to] = line.split(" => ")
    const fromLines = from.split("/").map(line => line.split(""))
    const toLines = to.split("/").map(line => line.split(""))
    for (const combination of allCombinations(fromLines)) {
      patterns.set(combination.flat().join(""), toLines)
    }
  })
  return patterns
}

const STARTING_PATTERN = [".#.", "..#", "###"].map(line => line.split(""))

function findApplicableRule(pattern: string[][], rules: ReturnType<typeof parseInput>) {
  return rules.get(pattern.flat().join(""))!
}

function applyRulesToPattern(pattern: string[][], rules: ReturnType<typeof parseInput>): string[][] {
  const patternSize = pattern.length
  if (patternSize % 2 === 0) {
    const newPatternSize = (patternSize / 2) * 3
    const newPattern = utils.grid.create(newPatternSize, newPatternSize, ".")
    for (let i = 0; i < patternSize; i += 2) {
      for (let j = 0; j < patternSize; j += 2) {
        const subPattern = [
          [pattern[i][j], pattern[i][j + 1]],
          [pattern[i + 1][j], pattern[i + 1][j + 1]],
        ]
        const newSubPattern = findApplicableRule(subPattern, rules)
        for (let m = 0; m < 3; m++) {
          for (let n = 0; n < 3; n++) {
            newPattern[(i / 2) * 3 + m][(j / 2) * 3 + n] = newSubPattern[m][n]
          }
        }
      }
    }
    return newPattern
  }
  if (patternSize % 3 === 0) {
    const newPatternSize = (patternSize / 3) * 4
    const newPattern = utils.grid.create(newPatternSize, newPatternSize, ".")
    for (let i = 0; i < patternSize; i += 3) {
      for (let j = 0; j < patternSize; j += 3) {
        const subPattern = [
          [pattern[i][j], pattern[i][j + 1], pattern[i][j + 2]],
          [pattern[i + 1][j], pattern[i + 1][j + 1], pattern[i + 1][j + 2]],
          [pattern[i + 2][j], pattern[i + 2][j + 1], pattern[i + 2][j + 2]],
        ]
        const newSubPattern = findApplicableRule(subPattern, rules)
        for (let m = 0; m < 4; m++) {
          for (let n = 0; n < 4; n++) {
            newPattern[(i / 3) * 4 + m][(j / 3) * 4 + n] = newSubPattern[m][n]
          }
        }
      }
    }
    return newPattern
  }
  throw new Error()
}

function allCombinations(pattern: string[][]): string[][][] {
  return [
    pattern,
    utils.grid.rotateLeft(pattern),
    utils.grid.rotateRight(pattern),
    utils.grid.flipHorizontal(pattern),
    utils.grid.flipVertical(pattern),
    utils.grid.flipHorizontal(utils.grid.rotateLeft(pattern)),
    utils.grid.flipHorizontal(utils.grid.rotateRight(pattern)),
    utils.grid.flipVertical(utils.grid.rotateLeft(pattern)),
    utils.grid.flipVertical(utils.grid.rotateRight(pattern)),
  ]
}

function iteratePattern(pattern: string[][], rules: ReturnType<typeof parseInput>, nth: number) {
  for (let i = 0; i < nth; i++) {
    pattern = applyRulesToPattern(pattern, rules)
  }
  return pattern
}

function part1(inputString: string) {
  const rules = parseInput(inputString)
  return iteratePattern(STARTING_PATTERN, rules, 5)
    .flat()
    .filter(char => char === "#").length
}

function part2(inputString: string) {
  const rules = parseInput(inputString)
  return iteratePattern(STARTING_PATTERN, rules, 18)
    .flat()
    .filter(char => char === "#").length
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
