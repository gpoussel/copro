import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 18

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

const SAFE_CELL = "."
const TRAP_CELL = "^"

function isSafe(left: string, center: string, right: string) {
  if (left === TRAP_CELL && center === TRAP_CELL && right === SAFE_CELL) {
    return false
  }
  if (left === SAFE_CELL && center === TRAP_CELL && right === TRAP_CELL) {
    return false
  }
  if (left === TRAP_CELL && center === SAFE_CELL && right === SAFE_CELL) {
    return false
  }
  if (left === SAFE_CELL && center === SAFE_CELL && right === TRAP_CELL) {
    return false
  }
  return true
}

function nextRow(row: string) {
  return row
    .split("")
    .map((cell, i) => {
      const left = row[i - 1] || SAFE_CELL
      const center = cell
      const right = row[i + 1] || SAFE_CELL
      return isSafe(left, center, right) ? SAFE_CELL : TRAP_CELL
    })
    .join("")
}

function countSafeCells(row: string) {
  return row.split("").filter(cell => cell === SAFE_CELL).length
}

function solve(input: string, count: number) {
  let row = input
  let total = countSafeCells(row)
  for (let i = 0; i < count - 1; i++) {
    row = nextRow(row)
    total += countSafeCells(row)
  }
  return total
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, 40)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, 400000)
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
