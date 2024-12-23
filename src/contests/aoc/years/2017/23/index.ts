import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 23

function parseInput(input: string) {
  return utils.input.lines(input)
}

function runProgram(instructions: string[], initialA: number = 0) {
  const registers = new Map<string, number>()
  registers.set("a", initialA)

  let i = 0
  let mults = 0

  while (i < instructions.length) {
    const [instruction, x, y] = instructions[i].split(" ")
    function val(v: string) {
      if (v.charAt(0) >= "a" && v.charAt(0) <= "z") {
        return registers.get(v) ?? 0
      }
      return +v
    }
    switch (instruction) {
      case "set":
        registers.set(x, val(y))
        break
      case "sub":
        registers.set(x, val(x) - val(y))
        break
      case "mul":
        registers.set(x, val(x) * val(y))
        mults++
        break
      case "jnz":
        if (val(x) !== 0) {
          i += val(y) - 1
        }
        break
      default:
        throw new Error(instruction)
    }
    ++i
  }
  return mults
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return runProgram(input, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const number = +input[0].split(" ")[2] * 100 + 100000
  let nonprimes = 0
  for (let n = number; n <= number + 17000; n += 17) {
    let d = 2
    while (n % d !== 0) d++
    if (n !== d) nonprimes++
  }
  return nonprimes
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
