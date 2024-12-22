import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 25

function parseInput(input: string) {
  return utils.input.lines(input)
}

function solve(input: string[], initialA: number) {
  const registers = new Map<string, number>()
  registers.set("a", initialA)
  registers.set("b", 0)
  registers.set("c", 0)
  registers.set("d", 0)

  function val(x: string): number {
    return x === "a" || x === "b" || x === "c" || x === "d" ? registers.get(x)! : +x
  }

  let expectedOutput = 0
  const visited = new Set<string>()

  for (let i = 0; i < input.length; i++) {
    const stateKey = `${i},${registers.get("a")},${registers.get("b")},${registers.get("c")},${registers.get("d")}`
    if (visited.has(stateKey)) {
      return true
    }
    visited.add(stateKey)
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
    } else if (op === "out") {
      const value = val(x)
      if (value !== expectedOutput) {
        return false
      }
      expectedOutput = 1 - expectedOutput
    } else {
      throw new Error(op)
    }
  }

  return true
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  for (let i = 0; i < 1000; ++i) {
    if (solve(input, i)) {
      return i
    }
  }
  return -1
}

function part2() {
  return "Merry Christmas!"
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
