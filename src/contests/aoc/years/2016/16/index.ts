import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 16

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function advance(a: string) {
  const b = a
    .split("")
    .reverse()
    .map(c => (c === "1" ? "0" : "1"))
    .join("")
  return `${a}0${b}`
}

function computeChecksum(data: string) {
  let checksum = ""
  for (let i = 0; i < data.length; i += 2) {
    checksum += data[i] === data[i + 1] ? "1" : "0"
  }
  return checksum
}

function solve(input: string, size: number) {
  let data = input
  while (data.length < size) {
    data = advance(data)
  }
  data = data.slice(0, size)

  let checksum = computeChecksum(data)
  while (checksum.length % 2 === 0) {
    checksum = computeChecksum(checksum)
  }
  return checksum
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, 272)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, 35651584)
}

const EXAMPLE = ``

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
