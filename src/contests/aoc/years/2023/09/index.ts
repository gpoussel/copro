import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 9

function parseInput(input: string) {
  return utils.input.lines(input).map(line => line.split(" ").map(n => +n))
}

function extrapolateNext(sequence: number[]): number {
  // Build difference sequences until all zeros
  const sequences: number[][] = [sequence]
  while (!sequences[sequences.length - 1].every(n => n === 0)) {
    const current = sequences[sequences.length - 1]
    const diffs = []
    for (let i = 0; i < current.length - 1; i++) {
      diffs.push(current[i + 1] - current[i])
    }
    sequences.push(diffs)
  }

  // Work back up, adding next value to each sequence
  for (let i = sequences.length - 2; i >= 0; i--) {
    const below = sequences[i + 1]
    const current = sequences[i]
    current.push(current[current.length - 1] + below[below.length - 1])
  }

  return sequences[0][sequences[0].length - 1]
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.map(extrapolateNext).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  // Reverse each sequence to extrapolate backwards
  return input.map(seq => extrapolateNext([...seq].reverse())).reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 114,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
} as AdventOfCodeContest
