import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 2

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function executeProgram(program: number[]) {
  for (let i = 0; i < program.length; i += 4) {
    if (program[i] === 1) {
      const a = program[program[i + 1]]
      const b = program[program[i + 2]]
      program[program[i + 3]] = a + b
    } else if (program[i] === 2) {
      const a = program[program[i + 1]]
      const b = program[program[i + 2]]
      program[program[i + 3]] = a * b
    } else if (program[i] === 99) {
      break
    }
  }
  return program[0]
}

function findNounAndVerb(program: number[], target: number) {
  for (let noun = 0; noun <= 99; noun++) {
    for (let verb = 0; verb <= 99; verb++) {
      const memory = program.slice()
      memory[1] = noun
      memory[2] = verb
      if (executeProgram(memory) === target) {
        return { noun, verb }
      }
    }
  }
  throw new Error()
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  input[1] = 12
  input[2] = 2
  return executeProgram(input)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const { noun, verb } = findNounAndVerb(input, 19690720)
  return 100 * noun + verb
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
