import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2024 - Quest 9

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function buildCache(input: number[], stamps: number[]) {
  const cache = Array.from({ length: Math.max(...input) + 1 }, () => 0)
  for (let i = 1; i < cache.length; ++i) {
    cache[i] = Math.min(
      ...stamps
        .map(stamp => i - stamp)
        .filter(diff => diff >= 0)
        .map(diff => cache[diff] + 1)
    )
  }
  return cache
}

function solve(inputString: string, stamps: number[]) {
  const input = parseInput(inputString)
  const cache = buildCache(input, stamps)
  return input.map(number => cache[number]).reduce((a, b) => a + b, 0)
}

function part1(inputString: string) {
  return solve(inputString, [1, 3, 5, 10])
}

function part2(inputString: string) {
  return solve(inputString, [1, 3, 5, 10, 15, 16, 20, 24, 25, 30])
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const cache = buildCache(input, [1, 3, 5, 10, 15, 16, 20, 24, 25, 30, 37, 38, 49, 50, 74, 75, 100, 101])
  return input
    .map(number => {
      const middle = Math.floor(number / 2)
      const results = Array.from({ length: Math.min(51, middle) }, (_row, index) => index).map(delta => {
        const left = middle - delta
        const right = number - left
        if (right - left > 100) {
          return { left, right, sum: Infinity }
        }
        return { left, right, sum: cache[left] + cache[right] }
      })
      return Math.min(...results.map(({ sum }) => sum))
    })
    .reduce((a, b) => a + b, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
2
4
7
16`,
        expected: 10,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
33
41
55
99`,
        expected: 10,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
156488
352486
546212`,
        expected: 10449,
      },
    ],
  },
} as EverybodyCodesContest
