import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 23

function parseInput(input: string) {
  const instructions = utils.input.lines(input)
  return instructions.map(line => ({
    command: line.split(" ")[0],
    arguments: line.split(" ").slice(1),
  }))
}

function solve(inputString: string, initialA: number) {
  const instructions = parseInput(inputString)

  const registers = new Map<string, number>()
  registers.set("a", initialA)
  registers.set("b", 0)
  registers.set("c", 0)
  registers.set("d", 0)

  function val(x: string): number {
    return x === "a" || x === "b" || x === "c" || x === "d" ? registers.get(x)! : +x
  }

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]
    if (instruction.command === "jnz") {
      const x = val(instruction.arguments[0])
      const y = val(instruction.arguments[1])
      if (x !== 0) {
        i += y - 1
      }
      continue
    }
    if (instruction.command === "mul") {
      const x = val(instruction.arguments[0])
      const y = val(instruction.arguments[1])
      const z = instruction.arguments[2]
      registers.set(z, x * y)
    } else if (instruction.command === "cpy") {
      const x = val(instruction.arguments[0])
      const y = instruction.arguments[1]
      registers.set(y, x)
    } else if (instruction.command === "inc") {
      const x = instruction.arguments[0]
      registers.set(x, registers.get(x)! + 1)
    } else if (instruction.command === "dec") {
      const x = instruction.arguments[0]
      registers.set(x, registers.get(x)! - 1)
    } else if (instruction.command === "tgl") {
      const x = val(instruction.arguments[0])
      const target = i + x
      if (target < 0 || target >= instructions.length) {
        continue
      }
      const targetInstruction = instructions[target]
      if (targetInstruction.command === "dec" || targetInstruction.command === "tgl") {
        targetInstruction.command = "inc"
      } else if (targetInstruction.command === "inc") {
        targetInstruction.command = "dec"
      } else if (targetInstruction.command === "jnz") {
        targetInstruction.command = "cpy"
      } else if (targetInstruction.command === "cpy") {
        targetInstruction.command = "jnz"
      }
    }
  }

  return registers.get("a")
}

function part1(inputString: string) {
  return solve(inputString, 7)
}

function part2(inputString: string) {
  return solve(inputString, 12)
}

const EXAMPLE = `
cpy 2 a
tgl a
tgl a
tgl a
cpy 1 a
dec a
dec a`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 3,
      },
    ],
  },
} as AdventOfCodeContest
