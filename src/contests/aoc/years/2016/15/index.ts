import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 15

function parseInput(input: string) {
  return utils.input
    .regexLines(input, /Disc #(\d+) has (\d+) positions; at time=0, it is at position (\d+)./)
    .map(([, disc, positions, start]) => ({ disc: +disc, positions: +positions, start: +start }))
}

function getEarliestTimeWhereAllDiscsAreAligned(discs: ReturnType<typeof parseInput>) {
  const combinations = discs.map(disc => disc.positions).reduce((acc, val) => acc * val, 1)
  for (let time = 0; time < combinations; time++) {
    if (discs.every(disc => (disc.start + disc.disc + time) % disc.positions === 0)) {
      return time
    }
  }
}

function part1(inputString: string) {
  const discs = parseInput(inputString)
  return getEarliestTimeWhereAllDiscsAreAligned(discs)
}

function part2(inputString: string) {
  const discs = parseInput(inputString)
  discs.push({ disc: discs.length + 1, positions: 11, start: 0 })
  return getEarliestTimeWhereAllDiscsAreAligned(discs)
}

const EXAMPLE = `
Disc #1 has 5 positions; at time=0, it is at position 4.
Disc #2 has 2 positions; at time=0, it is at position 1.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 85,
      },
    ],
  },
} as AdventOfCodeContest
