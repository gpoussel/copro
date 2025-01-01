import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { LOWERCASE_LETTERS } from "../../../../../utils/string.js"

// 🎄 Advent of Code 2018 - Day 5

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

const REGEX_REPLACE = new RegExp(
  LOWERCASE_LETTERS.split("")
    .flatMap(letter => [letter.toUpperCase() + letter, letter + letter.toUpperCase()])
    .join("|"),
  "g"
)

function applyReactions(str: string) {
  let changed = true
  while (changed) {
    const newStr = str.replace(REGEX_REPLACE, "")
    changed = newStr.length !== str.length
    str = newStr
  }
  return str
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return applyReactions(input).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  const units = new Set(input.toLowerCase())
  const lengths = [...units].map(unit => applyReactions(input.replace(new RegExp(unit, "gi"), "")).length)
  return utils.iterate.min(lengths)
}

const EXAMPLE = `dabAcCaCBAcCcaDA`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 10,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 4,
      },
    ],
  },
} as AdventOfCodeContest
