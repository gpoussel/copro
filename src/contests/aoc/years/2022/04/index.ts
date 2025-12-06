import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 4

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [part1, part2] = line.split(",")
    const [start1, end1] = part1.split("-").map(Number)
    const [start2, end2] = part2.split("-").map(Number)
    return { range1: [start1, end1], range2: [start2, end2] }
  })
}

function part1(inputString: string) {
  const assignments = parseInput(inputString)
  return assignments.filter(({ range1, range2 }) => {
    return (range1[0] <= range2[0] && range1[1] >= range2[1]) || (range2[0] <= range1[0] && range2[1] >= range1[1])
  }).length
}

function part2(inputString: string) {
  const assignments = parseInput(inputString)
  return assignments.filter(({ range1, range2 }) => {
    return (range1[0] <= range2[1] && range1[1] >= range2[0]) || (range2[0] <= range1[1] && range2[1] >= range1[0])
  }).length
}

const EXAMPLE = `
2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`

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
        expected: 4,
      },
    ],
  },
} as AdventOfCodeContest
