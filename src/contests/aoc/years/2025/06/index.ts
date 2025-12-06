import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2025 - Day 6

function parseInput(input: string) {
  const lines = utils.input.lines(input)
  const numberLines = lines.slice(0, lines.length - 1)
  const numberGrids: string[][][] = []
  for (let i = 0; i < numberLines[0].length; ++i) {
    let numberWidth = 1
    while (i + numberWidth < numberLines[0].length && !numberLines.every(line => line[i + numberWidth] === " ")) {
      ++numberWidth
    }
    numberGrids.push(numberLines.map(line => line.slice(i, i + numberWidth).split("")))
    i += numberWidth
  }
  const operators = lines[lines.length - 1].split(/ +/)
  return { numbers: numberGrids, operators }
}

function part1(inputString: string) {
  const { numbers, operators } = parseInput(inputString)
  let sum = 0
  for (let i = 0; i < operators.length; i++) {
    const op = operators[i]
    const numbersAtIndex = numbers[i].map(row => Number(row.join("").trim()))
    if (op === "*") {
      sum += numbersAtIndex.reduce((a, b) => a * b, 1)
    } else if (op === "+") {
      sum += numbersAtIndex.reduce((a, b) => a + b, 0)
    }
  }
  return sum
}

function part2(inputString: string) {
  const { numbers, operators } = parseInput(inputString)
  let sum = 0
  for (let i = 0; i < operators.length; i++) {
    const op = operators[i]
    const numbersAtIndex = utils.grid.columns(numbers[i]).map(row => Number(row.join("").trim()))
    if (op === "*") {
      sum += numbersAtIndex.reduce((a, b) => a * b, 1)
    } else if (op === "+") {
      sum += numbersAtIndex.reduce((a, b) => a + b, 0)
    }
  }
  return sum
}

const EXAMPLE = `
123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  `

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 4277556,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 3263827,
      },
    ],
  },
} as AdventOfCodeContest
