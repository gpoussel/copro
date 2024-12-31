import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 5

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const computer = new Computer(program, [1])
  computer.runUntilHalt()
  return computer.outputs.pop()
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const computer = new Computer(program, [5])
  computer.runUntilHalt()
  return computer.outputs.pop()
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
