import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 16

type Operation = (registers: number[], a: number, b: number, c: number) => void
interface Example {
  before: number[]
  instruction: number[]
  after: number[]
}

const allOperations = {
  addr(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] + registers[b]
  },
  addi(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] + b
  },
  mulr(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] * registers[b]
  },
  muli(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] * b
  },
  banr(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] & registers[b]
  },
  bani(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] & b
  },
  borr(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] | registers[b]
  },
  bori(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] | b
  },
  setr(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a]
  },
  seti(registers: number[], a: number, b: number, c: number) {
    registers[c] = a
  },
  gtir(registers: number[], a: number, b: number, c: number) {
    registers[c] = a > registers[b] ? 1 : 0
  },
  gtri(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] > b ? 1 : 0
  },
  gtrr(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] > registers[b] ? 1 : 0
  },
  eqir(registers: number[], a: number, b: number, c: number) {
    registers[c] = a === registers[b] ? 1 : 0
  },
  eqri(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] === b ? 1 : 0
  },
  eqrr(registers: number[], a: number, b: number, c: number) {
    registers[c] = registers[a] === registers[b] ? 1 : 0
  },
}

export type OperationName = keyof typeof allOperations
export const OPERATIONS = allOperations as Record<OperationName, Operation>

function parseInput(input: string) {
  const blocks = utils.input.blocks(input)
  const program = utils.input.lines(blocks.pop()!).map(line => line.split(" ").map(Number))
  const parsedExamples = blocks.map(example => {
    const [before, instruction, after] = utils.input.lines(example)
    return {
      before: JSON.parse(before.split(": ")[1]) as number[],
      instruction: instruction.split(" ").map(Number),
      after: JSON.parse(after.split(": ")[1]) as number[],
    }
  })
  return {
    examples: parsedExamples,
    program,
  }
}

function isOperationCompatible(example: Example, operation: Operation) {
  const { before, instruction, after } = example
  const [, a, b, c] = instruction
  const registers = [...before]
  operation(registers, a, b, c)
  return utils.iterate.arrayEquals(registers, after)
}

function part1(inputString: string) {
  const { examples } = parseInput(inputString)
  return examples.filter(
    example => Object.values(OPERATIONS).filter(op => isOperationCompatible(example, op)).length >= 3
  ).length
}

function part2(inputString: string) {
  const { examples, program } = parseInput(inputString)
  const solvedOperations = new Map<number, OperationName>()
  while (solvedOperations.size < Object.keys(OPERATIONS).length) {
    const hypothesis = new Map<number, Set<OperationName>>()
    for (const example of examples) {
      const operation = example.instruction[0]
      if (solvedOperations.has(operation)) {
        continue
      }
      const possibleOperations = Object.entries(OPERATIONS).filter(([name, op]) => {
        return isOperationCompatible(example, op) && ![...solvedOperations.values()].includes(name as OperationName)
      })
      if (!hypothesis.has(operation)) {
        hypothesis.set(operation, new Set(possibleOperations.map(([name]) => name as OperationName)))
      } else {
        const currentHypothesis = hypothesis.get(operation)!
        const newHypothesis = new Set(possibleOperations.map(([name]) => name as OperationName))
        hypothesis.set(operation, new Set([...currentHypothesis].filter(name => newHypothesis.has(name))))
      }
      if (hypothesis.get(operation)!.size === 1) {
        const [solvedOperation] = hypothesis.get(operation)!
        solvedOperations.set(operation, solvedOperation)
      }
    }
  }

  const registers = [0, 0, 0, 0]
  for (const [operation, a, b, c] of program) {
    OPERATIONS[solvedOperations.get(operation)!](registers, a, b, c)
  }
  return registers[0]
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
