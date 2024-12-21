import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 6

function parseInput(input: string) {
  return utils.input.lines(input)
}

function solve(inputString: string, comparator: (a: number, b: number) => number) {
  const lines = parseInput(inputString)
  const password = []
  for (let i = 0; i < lines[0].length; ++i) {
    const frequencies = utils.iterate.countBy(
      lines.map(line => line[i]),
      c => c
    )
    const sorted = [...frequencies.entries()].sort((a, b) => comparator(a[1], b[1]))
    password.push(sorted[0][0])
  }
  return password.join("")
}

function part1(inputString: string) {
  return solve(inputString, (a, b) => b - a)
}

function part2(inputString: string) {
  return solve(inputString, (a, b) => a - b)
}

const EXAMPLE = `
eedadn
drvtee
eandsr
raavrd
atevrs
tsrnev
sdttsa
rasrtv
nssdts
ntnada
svetve
tesnvt
vntsnd
vrdear
dvrsen
enarar`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "easter",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "advent",
      },
    ],
  },
} as AdventOfCodeContest
