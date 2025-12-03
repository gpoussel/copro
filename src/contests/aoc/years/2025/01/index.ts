import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2025 - Day 1

function parseInput(input: string) {
  return utils.input.lines(input).map(line => ({
    side: line[0] === "L" ? -1 : 1,
    count: +line.substring(1),
  }))
}

function part1(inputString: string) {
  const rotations = parseInput(inputString)
  let currentValue = 50
  let password = 0
  for (const rotation of rotations) {
    const arithmeticCount = rotation.side * rotation.count
    currentValue = currentValue + arithmeticCount
    while (currentValue >= 100) {
      currentValue = currentValue - 100
    }
    while (currentValue < 0) {
      currentValue = 100 + currentValue
    }
    if (currentValue === 0) {
      password++
    }
  }
  return password
}

function part2(inputString: string) {
  const rotations = parseInput(inputString)
  let currentValue = 50
  let password = 0
  for (const rotation of rotations) {
    const arithmeticCount = rotation.side * rotation.count
    if (rotation.side > 0) {
      const afterRotation = Math.floor((currentValue + arithmeticCount) / 100)
      const beforeRotation = Math.floor(currentValue / 100)
      password += afterRotation - beforeRotation
    } else {
      const beforeRotation = Math.floor((currentValue - 1) / 100)
      const afterRotation = Math.floor((currentValue - 1 + arithmeticCount) / 100)
      password += beforeRotation - afterRotation
    }
    currentValue = (currentValue + arithmeticCount + 100) % 100
  }
  return password
}

const EXAMPLE = `
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`

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
        expected: 6,
      },
      {
        input: `R1000`,
        expected: 10,
      },
      {
        input: `R50\nL20`,
        expected: 1,
      },
    ],
  },
} as AdventOfCodeContest
