import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 14

function parseInput(input: string) {
  return utils.input.number(input)
}

function tickElves(elves: number[], scores: number[]) {
  const sum = elves.reduce((sum, position) => sum + scores[position], 0)
  const digits = utils.math.digits(sum)
  scores.push(...digits)
  elves.forEach((position, index) => {
    elves[index] = (position + scores[position] + 1) % scores.length
  })
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const array = [3, 7]
  const elvesPositions = [0, 1]
  for (let i = 0; i < input + 10; ++i) {
    tickElves(elvesPositions, array)
  }
  return array.slice(input, input + 10).join("")
}

function part2(inputString: string) {
  const inputLength = inputString.trim().length
  const input = utils.math.digits(parseInput(inputString))
  const array = [3, 7]
  const elvesPositions = [0, 1]
  while (!utils.iterate.includes(array.slice(array.length - input.length - 1), input)) {
    tickElves(elvesPositions, array)
    utils.log.logEvery(array.length, 3_000_000)
  }
  return array.length - inputLength - (array[array.length - 1] === input[input.length - 1] ? 0 : 1)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "9",
        expected: "5158916779",
      },
      {
        input: "5",
        expected: "0124515891",
      },
      {
        input: "18",
        expected: "9251071085",
      },
      {
        input: "2018",
        expected: "5941429882",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "51589",
        expected: 9,
      },
      {
        input: "01245",
        expected: 5,
      },
      {
        input: "92510",
        expected: 18,
      },
      {
        input: "59414",
        expected: 2018,
      },
    ],
  },
} as AdventOfCodeContest
