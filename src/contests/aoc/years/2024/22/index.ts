import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 22

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

const MOD = 16777216

function nextNumberInSequence(secret: number) {
  const res1 = ((secret * 64) ^ secret) % MOD
  const res2 = ((res1 >>> 5) ^ res1) % MOD
  return ((res2 * 2048) % MOD ^ res2) % MOD
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input
    .map(n => {
      for (let i = 0; i < 2000; i++) {
        n = nextNumberInSequence(n)
      }
      return n
    })
    .reduce((a, b) => a + b, 0)
}

function computeNumberOfBananas(n: number) {
  return n % 10
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  const monkeysSequences = new Array<Map<string, number>>()
  for (let i = 0; i < input.length; i++) {
    const monkeySequences = new Map<string, number>()
    let n = input[i]
    let numberOfBananas = computeNumberOfBananas(n)
    const lastDiffOfBananas = new Array<number>()
    for (let j = 0; j < 2000; j++) {
      const newNumber = nextNumberInSequence(n)
      const newNumberOfBananas = computeNumberOfBananas(newNumber)
      const diffOfBananas = newNumberOfBananas - numberOfBananas
      lastDiffOfBananas.push(diffOfBananas)
      if (lastDiffOfBananas.length > 4) {
        lastDiffOfBananas.shift()
      }
      if (lastDiffOfBananas.length === 4) {
        const key = lastDiffOfBananas.join(",")
        if (!monkeySequences.has(key)) {
          monkeySequences.set(key, newNumberOfBananas)
        }
      }
      n = newNumber
      numberOfBananas = newNumberOfBananas
    }
    monkeysSequences.push(monkeySequences)
  }

  const possibleSequences = new Set<string>()
  for (const monkeySequences of monkeysSequences) {
    for (const key of monkeySequences.keys()) {
      possibleSequences.add(key)
    }
  }

  let bestNumberOfBananas = 0
  for (const sequence of possibleSequences) {
    const numberOfBananas = monkeysSequences
      .map(monkeySequences => monkeySequences.get(sequence) || 0)
      .reduce((a, b) => a + b, 0)
    if (numberOfBananas > bestNumberOfBananas) {
      bestNumberOfBananas = numberOfBananas
    }
  }

  return bestNumberOfBananas
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
1
10
100
2024`,
        expected: 37327623,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
1
2
3
2024`,
        expected: 23,
      },
    ],
  },
} as AdventOfCodeContest
