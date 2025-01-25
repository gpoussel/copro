import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 6

function parseInput(input: string) {
  return utils.input.blocks(input).map(block => utils.input.lines(block))
}

function getCountOfPositiveAnswers(group: string[]) {
  const answers = group.join("").split("")
  const uniqueAnswers = new Set(answers)
  return uniqueAnswers.size
}

function getCountOfEveryPositiveAnswer(group: string[]) {
  const answers = group.join("").split("")
  const uniqueAnswers = [...new Set(answers)]
  return uniqueAnswers.filter(answer => group.every(person => person.includes(answer))).length
}

function part1(inputString: string) {
  const groups = parseInput(inputString)
  return groups.map(getCountOfPositiveAnswers).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const groups = parseInput(inputString)
  return groups.map(getCountOfEveryPositiveAnswer).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
abc

a
b
c

ab
ac

a
a
a
a

b`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 11,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 6,
      },
    ],
  },
} as AdventOfCodeContest
