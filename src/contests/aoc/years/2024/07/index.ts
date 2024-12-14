import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 7

function parseInput(input: string) {
  return utils.input.regexLines(input, /(\d+): ([\d ]+)/).map(([_, target, numbers]) => {
    return {
      target: Number(target),
      numbers: numbers.split(" ").map(Number),
    }
  })
}

function generatePossibleResults(numbers: number[], concatOperator: boolean) {
  const [first, ...rest] = numbers
  let possibleResults = [first]
  for (const number of rest) {
    const currentPossibleResults = []
    for (const result of possibleResults) {
      currentPossibleResults.push(result + number)
      currentPossibleResults.push(result * number)
      if (concatOperator) {
        currentPossibleResults.push(parseInt(`${result}${number}`))
      }
    }
    possibleResults = currentPossibleResults
  }
  return possibleResults
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input
    .filter(line => generatePossibleResults(line.numbers, false).includes(line.target))
    .reduce((acc, line) => acc + line.target, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input
    .filter(line => generatePossibleResults(line.numbers, true).includes(line.target))
    .reduce((acc, line) => acc + line.target, 0)
}

const EXAMPLE = `
190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 3749,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 11387,
      },
    ],
  },
} as AdventOfCodeContest
