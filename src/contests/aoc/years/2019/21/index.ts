import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 21

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function toAscii(input: string) {
  return [...input.split(""), "\n"].map(c => c.charCodeAt(0))
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const computer = new Computer(
    program,
    ["OR A J", "AND B J", "AND C J", "NOT J J", "AND D J", "WALK"].map(toAscii).flat()
  )
  computer.runUntilHalt()
  return computer.outputs[computer.outputs.length - 1]
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const computer = new Computer(
    program,
    ["OR A J", "AND B J", "AND C J", "NOT J J", "AND D J", "OR E T", "OR H T", "AND T J", "RUN"].map(toAscii).flat()
  )
  computer.runUntilHalt()
  return computer.outputs[computer.outputs.length - 1]
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
