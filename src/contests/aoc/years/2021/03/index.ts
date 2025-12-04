import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 3

function parseInput(input: string) {
  return utils.grid.map(utils.input.readGrid(input), v => +v)
}

function toDecimal(bits: number[]) {
  return parseInt(bits.join(""), 2)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const count = input.length
  const numberOfOnes = Array.from({ length: input[0].length }, () => 0)
  for (const line of input) {
    for (let i = 0; i < line.length; ++i) {
      if (line[i] === 1) {
        numberOfOnes[i]++
      }
    }
  }
  const gammaBinary = Array.from({ length: input[0].length }, (_, col) => (numberOfOnes[col] > count / 2 ? 1 : 0))
  const epsilonBinary = Array.from({ length: input[0].length }, (_, col) => (numberOfOnes[col] > count / 2 ? 0 : 1))
  return toDecimal(gammaBinary) * toDecimal(epsilonBinary)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return [
    { mostCommon: true, equalityTarget: 1 },
    { mostCommon: false, equalityTarget: 0 },
  ]
    .map(computation => {
      let rows = utils.grid.clone(input)
      for (let bit = 0; bit < input[0].length && rows.length > 1; ++bit) {
        const numberOfOnes = rows.filter(row => row[bit] === 1).length
        let targetValue = 0
        if (numberOfOnes > rows.length / 2) {
          targetValue = computation.mostCommon ? 1 : 0
        } else if (numberOfOnes < rows.length / 2) {
          targetValue = computation.mostCommon ? 0 : 1
        } else {
          targetValue = computation.equalityTarget
        }
        rows = rows.filter(row => row[bit] === targetValue)
      }
      return toDecimal(rows[0])
    })
    .reduce((a, b) => a * b, 1)
}

const EXAMPLE = `
00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 198,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 230,
      },
    ],
  },
} as AdventOfCodeContest
