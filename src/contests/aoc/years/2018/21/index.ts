import { AdventOfCodeContest } from "../../../../../types/contest.js"

// 🎄 Advent of Code 2018 - Day 21

function execute() {
  let c = 0
  let d = 0
  c = d | 65536
  d = 1099159
  const history: number[] = []
  while (true) {
    d = (((d + (c & 255)) & 16777215) * 65899) & 16777215
    if (256 > c) {
      if (history.includes(d)) {
        break
      }
      history.push(d)
      c = d | 65536
      d = 1099159
      continue
    }
    c = Math.floor(c / 256)
  }
  return history
}

function part1() {
  return execute()[0]
}

function part2() {
  const results = execute()
  return results[results.length - 1]
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
