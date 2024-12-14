import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 13

interface Machine {
  buttonA: Vector2
  buttonB: Vector2
  prize: Vector2
}

function parseInput(input: string): Machine[] {
  return utils.input.blocks(input).map(block => {
    const match = block.match(/Button A: X\+(\d+), Y\+(\d+)\nButton B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)/)
    if (!match) {
      throw new Error(`Invalid block ${block}`)
    }
    return {
      buttonA: new Vector2(parseInt(match[1]), parseInt(match[2])),
      buttonB: new Vector2(parseInt(match[3]), parseInt(match[4])),
      prize: new Vector2(parseInt(match[5]), parseInt(match[6])),
    }
  })
}

function findSolution(machine: Machine, offset: number) {
  const target = machine.prize.add(new Vector2(offset, offset))
  const solution = utils.algebra.solveLinearSystem2(
    [
      [machine.buttonA.x, machine.buttonB.x],
      [machine.buttonA.y, machine.buttonB.y],
    ],
    [target.x, target.y]
  )
  if (!solution || !Number.isInteger(solution[0]) || !Number.isInteger(solution[1])) {
    return 0
  }
  return 3 * solution[0] + solution[1]
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.reduce((acc, value) => acc + findSolution(value, 0), 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input.reduce((acc, value) => acc + findSolution(value, 10000000000000), 0)
}

const EXAMPLE = `
Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 480,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
