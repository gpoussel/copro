import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 10

function tieKnots(lengths: number[], nth: number) {
  const numbers = utils.iterate.range(0, 256)
  let currentPosition = 0
  let skipSize = 0
  for (let round = 0; round < nth; round++) {
    for (const length of lengths) {
      const subList = Array.from({ length }, (_, i) => numbers[(currentPosition + i) % numbers.length])
      subList.reverse()
      for (let i = 0; i < length; i++) {
        numbers[(currentPosition + i) % numbers.length] = subList[i]
      }
      currentPosition += length + skipSize
      currentPosition %= numbers.length
      skipSize++
    }
  }
  return numbers
}

function part1(inputString: string) {
  const lengths = utils.input.firstLine(inputString).split(",").map(Number)
  const numbers = tieKnots(lengths, 1)
  return numbers[0] * numbers[1]
}

function part2(inputString: string) {
  const input = utils.input
    .firstLine(inputString)
    .split("")
    .map(char => char.charCodeAt(0))
    .concat([17, 31, 73, 47, 23])
  const numbers = tieKnots(input, 64)
  const blocks = utils.iterate.range(0, 16).map(i => numbers.slice(i * 16, i * 16 + 16))
  const denseHash = blocks.map(block => block.reduce((a, b) => a ^ b, 0))
  return denseHash.map(n => n.toString(16).padStart(2, "0")).join("")
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
