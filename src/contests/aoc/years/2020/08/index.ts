import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 8

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [operation, argument] = line.split(" ")
    return { operation, argument: Number(argument) }
  })
}

function visitLoop(instructions: ReturnType<typeof parseInput>) {
  let accumulator = 0
  let pointer = 0
  const visited = new Set<number>()
  let infinite = false
  while (pointer < instructions.length) {
    if (visited.has(pointer)) {
      infinite = true
      break
    }
    visited.add(pointer)
    const { operation, argument } = instructions[pointer]
    if (operation === "jmp") {
      pointer += argument
    } else {
      if (operation === "acc") {
        accumulator += argument
      }
      pointer++
    }
  }
  return { visited, accumulator, infinite }
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  const { accumulator } = visitLoop(instructions)
  return accumulator
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const { visited } = visitLoop(input)
  for (const index of visited) {
    const instructions = [...input]
    const { operation, argument } = instructions[index]
    if (operation === "acc") {
      continue
    }
    instructions[index] = { operation: operation === "jmp" ? "nop" : "jmp", argument }
    const { accumulator, infinite } = visitLoop(instructions)
    if (infinite) {
      continue
    }
    return accumulator
  }
  return
}

const EXAMPLE = `
nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`

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
        expected: 8,
      },
    ],
  },
} as AdventOfCodeContest
