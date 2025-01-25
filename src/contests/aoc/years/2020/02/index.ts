import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 2

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [settings, password] = line.split(": ")
    const [range, letter] = settings.split(" ")
    const [min, max] = range.split("-").map(Number)
    return { min, max, letter, password }
  })
}

function isValidPart1(attributes: ReturnType<typeof parseInput>[0]) {
  const occurrences = utils.string.countSubstring(attributes.password, attributes.letter)
  return occurrences >= attributes.min && occurrences <= attributes.max
}

function isValidPart2(attributes: ReturnType<typeof parseInput>[0]) {
  const { min, max, letter, password } = attributes
  const first = password[min - 1] === letter
  const second = password[max - 1] === letter
  return first !== second
}

function part1(inputString: string) {
  const passwords = parseInput(inputString)
  return passwords.filter(isValidPart1).length
}

function part2(inputString: string) {
  const passwords = parseInput(inputString)
  return passwords.filter(isValidPart2).length
}

const EXAMPLE = `
1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: undefined,
      },
    ],
  },
} as AdventOfCodeContest
