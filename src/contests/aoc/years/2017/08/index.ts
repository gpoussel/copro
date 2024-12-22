import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 8

function parseInput(input: string) {
  return utils.input.lines(input)
}

const CONDITIONS_OPERATORS = {
  "==": (a: number, b: number) => a === b,
  "!=": (a: number, b: number) => a !== b,
  ">": (a: number, b: number) => a > b,
  "<": (a: number, b: number) => a < b,
  ">=": (a: number, b: number) => a >= b,
  "<=": (a: number, b: number) => a <= b,
}

function solve(inputString: string) {
  const lines = parseInput(inputString)
  const registers = new Map<string, number>()
  let maxEverSeen = -Infinity
  for (const line of lines) {
    const [register, op, amount, _, conditionRegister, conditionOp, conditionValue] = line.split(" ")
    const registerValue = registers.get(register) ?? 0
    const amountNumberValue = +amount * (op === "inc" ? 1 : -1)
    const conditionRegisterValue = registers.get(conditionRegister) ?? 0
    const conditionNumberValue = +conditionValue
    const condition = CONDITIONS_OPERATORS[conditionOp as keyof typeof CONDITIONS_OPERATORS](
      conditionRegisterValue,
      conditionNumberValue
    )
    if (condition) {
      const newValue = registerValue + amountNumberValue
      registers.set(register, newValue)
      maxEverSeen = Math.max(maxEverSeen, newValue)
    }
  }
  return {
    maxEnd: Math.max(...registers.values()),
    maxEverSeen,
  }
}

function part1(inputString: string) {
  return solve(inputString).maxEnd
}

function part2(inputString: string) {
  return solve(inputString).maxEverSeen
}

const EXAMPLE = `
b inc 5 if a > 1
a inc 1 if b < 5
c dec -10 if a >= 1
c inc -20 if c == 10`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 10,
      },
    ],
  },
} as AdventOfCodeContest
