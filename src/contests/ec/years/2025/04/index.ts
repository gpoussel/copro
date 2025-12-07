import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 4

function parseInput1(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const input = parseInput1(inputString)
  return Math.floor((2025 * input[0]) / input[input.length - 1])
}

function part2(inputString: string) {
  const input = parseInput1(inputString)
  return Math.ceil(10000000000000 / (input[0] / input[input.length - 1]))
}

function parseInput2(input: string) {
  const lines = utils.input.lines(input)
  const first = +lines[0]
  const last = +lines[lines.length - 1]
  const middle = lines.slice(1, lines.length - 1).map(line => line.split("|").map(Number))
  return { first, last, middle }
}

function part3(inputString: string) {
  const { first, last, middle } = parseInput2(inputString)
  const ratio = (first / last) * middle.map(([a, b]) => b / a).reduce((acc, val) => acc * val, 1)
  return Math.floor(100 * ratio)
}

const EXAMPLE1 = `128
64
32
16
8`

const EXAMPLE2 = `102
75
50
35
13`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 32400,
      },
      {
        input: EXAMPLE2,
        expected: 15888,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 625000000000,
      },
      {
        input: EXAMPLE2,
        expected: 1274509803922,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `5
5|10
10|20
5`,
        expected: 400,
      },
      {
        input: `5
7|21
18|36
27|27
10|50
10|50
11`,
        expected: 6818,
      },
    ],
  },
} as EverybodyCodesContest
