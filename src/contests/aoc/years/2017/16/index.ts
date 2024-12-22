import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 16

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",")
}

const ORIGINAL = "abcdefghijklmnop"

function runDance(programs: string[], input: string[]) {
  for (const instruction of input) {
    const type = instruction[0]
    const data = instruction.slice(1)
    if (type === "s") {
      const n = +data
      const end = programs.slice(-n)
      const start = programs.slice(0, -n)
      programs.splice(0, programs.length, ...end, ...start)
    } else if (type === "x") {
      const [a, b] = data.split("/").map(Number)
      utils.iterate.swap(programs, a, b)
    } else if (type === "p") {
      const [a, b] = data.split("/")
      const aIndex = programs.indexOf(a)
      const bIndex = programs.indexOf(b)
      utils.iterate.swap(programs, aIndex, bIndex)
    }
  }
}

function solve(inputString: string, nth: number) {
  const input = parseInput(inputString)
  const programs = ORIGINAL.split("")
  for (let i = 0; i < nth; i++) {
    runDance(programs, input)

    if (programs.join("") === ORIGINAL) {
      i = nth - (nth % (i + 1)) - 1
    }
  }
  return programs.join("")
}

function part1(inputString: string) {
  return solve(inputString, 1)
}

function part2(inputString: string) {
  return solve(inputString, 1_000_000_000)
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
