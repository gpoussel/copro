import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 15

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [_, value] = line.match(/(\d+)/)!
    return +value
  })
}

const MOD = 2147483647
const A_FACTOR = 16807
const b_FACTOR = 48271

function nextValue(value: number, factor: number) {
  return (value * factor) % MOD
}

function part1(inputString: string) {
  let [a, b] = parseInput(inputString)
  let i = 0
  let pairs = 0
  while (i < 40_000_000) {
    a = nextValue(a, A_FACTOR)
    b = nextValue(b, b_FACTOR)
    if ((a & 0xffff) === (b & 0xffff)) {
      ++pairs
    }
    i++
    utils.log.logEvery(i, 5_000_000)
  }
  return pairs
}

function part2(inputString: string) {
  let [a, b] = parseInput(inputString)
  let i = 0
  let pairs = 0
  while (i < 5_000_000) {
    do {
      a = nextValue(a, A_FACTOR)
    } while (a % 4 !== 0)

    do {
      b = nextValue(b, b_FACTOR)
    } while (b % 8 !== 0)

    if ((a & 0xffff) === (b & 0xffff)) {
      ++pairs
    }
    i++
    utils.log.logEvery(i, 1_000_000)
  }
  return pairs
}

const EXAMPLE = `
Generator A starts with 65
Generator B starts with 8921`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 588,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 309,
      },
    ],
  },
} as AdventOfCodeContest
