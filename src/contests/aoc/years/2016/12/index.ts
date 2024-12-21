import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 12

function parseInput(input: string) {
  return utils.input.lines(input)
}

function solve(inputString: string, initialC: number) {
  const input = parseInput(inputString)

  const registers = new Map<string, number>()
  registers.set("a", 0)
  registers.set("b", 0)
  registers.set("c", initialC)
  registers.set("d", 0)

  function val(x: string): number {
    return x === "a" || x === "b" || x === "c" || x === "d" ? registers.get(x)! : +x
  }

  for (let i = 0; i < input.length; i++) {
    const [op, x, y] = input[i].split(" ")
    if (op === "jnz") {
      const value = val(x)
      if (value !== 0) {
        i += +y - 1
      }
      continue
    }
    if (op === "cpy") {
      registers.set(y, val(x))
    } else if (op === "inc") {
      registers.set(x, registers.get(x)! + 1)
    } else if (op === "dec") {
      registers.set(x, registers.get(x)! - 1)
    }
  }

  return registers.get("a")!
}

function part1(inputString: string) {
  return solve(inputString, 0)
}

function part2(inputString: string) {
  return solve(inputString, 1)
}

const EXAMPLE = `
cpy 41 a
inc a
inc a
dec a
jnz a 2
dec a`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 42,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 42,
      },
    ],
  },
} as AdventOfCodeContest
