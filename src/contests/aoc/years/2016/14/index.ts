import { Md5 } from "ts-md5"
import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 14

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function solve(inputString: string, nth: number) {
  const input = parseInput(inputString)
  let index = 0

  const hashes = new Map<string, string>()

  function md5Repeat(input: string, times: number) {
    let hash = input
    for (let i = 0; i < times; i++) {
      hash = Md5.hashStr(hash)
    }
    return hash
  }

  function md5(input: string) {
    if (!hashes.has(input)) {
      hashes.set(input, md5Repeat(input, nth))
      if (hashes.size > 1000) {
        hashes.delete(Array.from(hashes.keys())[0])
      }
    }
    return hashes.get(input)!
  }

  const keys = []
  while (keys.length < 64) {
    const hash = md5(input + index)
    const match = hash.match(/(.)\1\1/)
    if (match) {
      const char = match[1]
      const regex = new RegExp(char.repeat(5))
      for (let i = 1; i <= 1000; i++) {
        const nextHash = md5(input + (index + i))
        if (nextHash.match(regex)) {
          keys.push(hash)
          break
        }
      }
    }
    index++
  }
  return index - 1
}

function part1(inputString: string) {
  return solve(inputString, 1)
}

function part2(inputString: string) {
  return solve(inputString, 2017)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "abc",
        expected: 22728,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
