import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 23

function parseInput(input: string) {
  return utils.input.lines(input)
}

function solve(inputString: string, initialA: number) {
  const instructions = parseInput(inputString)
  const registers = new Map<string, number>()
  registers.set("a", initialA)
  registers.set("b", 0)
  let i = 0
  while (i < instructions.length) {
    const instruction = instructions[i]
    const [op, ...arg] = instruction.split(" ")
    if (op === "hlf") {
      registers.set(arg[0], registers.get(arg[0])! / 2)
    } else if (op === "tpl") {
      registers.set(arg[0], registers.get(arg[0])! * 3)
    } else if (op === "inc") {
      registers.set(arg[0], registers.get(arg[0])! + 1)
    } else if (op === "jmp") {
      i += parseInt(arg[0])
      continue
    } else if (op === "jie") {
      if (registers.get(arg[0][0])! % 2 === 0) {
        i += parseInt(arg[1])
        continue
      }
    } else if (op === "jio") {
      if (registers.get(arg[0][0])! === 1) {
        i += parseInt(arg[1])
        continue
      }
    }
    i++
  }
  return registers.get("b")
}

function part1(inputString: string) {
  return solve(inputString, 0)
}

function part2(inputString: string) {
  return solve(inputString, 1)
}

const EXAMPLE = `
inc b
jio b, +2
tpl b
inc b`

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
        expected: undefined,
      },
    ],
  },
} as AdventOfCodeContest
