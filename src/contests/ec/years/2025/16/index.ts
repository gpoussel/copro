import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 16

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function part1(inputString: string) {
  const numbers = parseInput(inputString)
  let sum = 0
  for (let i = 1; i <= 90; ++i) {
    for (const num of numbers) {
      if (i % num === 0) {
        sum++
      }
    }
  }
  return sum
}

function part2(inputString: string) {
  const numbers = [0, ...parseInput(inputString)]
  let current = 1
  const result = []
  while (numbers.some(num => num > 0)) {
    if (numbers[current] === 0) {
      current++
    } else if (numbers[current] === 1) {
      result.push(current)
      numbers[current] = 0
      for (let i = current; i < numbers.length; i += current) {
        numbers[i]--
      }
      current++
    } else {
      throw new Error("Unexpected number")
    }
  }
  return result.reduce((a, b) => a * b, 1)
}

function extractSpell(inputString: string): number[] {
  const numbers = [0, ...parseInput(inputString)]
  let current = 1
  const result: number[] = []
  while (numbers.some(num => num > 0)) {
    if (numbers[current] === 0) {
      current++
    } else if (numbers[current] === 1) {
      result.push(current)
      numbers[current] = 0
      for (let i = current; i < numbers.length; i += current) {
        numbers[i]--
      }
      current++
    } else {
      throw new Error("Unexpected number")
    }
  }
  return result
}

function part3(inputString: string) {
  const spell = extractSpell(inputString)
  const numberOfBlocks = 202520252025000n

  // Height of column i = count of spell numbers that divide i
  // For a spell [s1, s2, ..., sk], height(i) = sum of (1 if sj divides i else 0)

  // Total blocks for wall of length L = sum_{i=1}^{L} height(i)
  // = sum_{i=1}^{L} sum_{s in spell} (1 if s|i else 0)
  // = sum_{s in spell} floor(L/s)

  function blocksForLength(L: bigint): bigint {
    let total = 0n
    for (const s of spell) {
      total += L / BigInt(s)
    }
    return total
  }

  // Binary search for the maximum wall length
  let lo = 0n
  let hi = numberOfBlocks * 2n // Upper bound (each column has at least height 1 if 1 is in spell)

  while (lo < hi) {
    const mid = (lo + hi + 1n) / 2n
    if (blocksForLength(mid) <= numberOfBlocks) {
      lo = mid
    } else {
      hi = mid - 1n
    }
  }

  return Number(lo)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `1,2,3,5,9`,
        expected: 193,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `1,2,2,2,2,3,1,2,3,3,1,3,1,2,3,2,1,4,1,3,2,2,1,3,2,2`,
        expected: 270,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `1,2,2,2,2,3,1,2,3,3,1,3,1,2,3,2,1,4,1,3,2,2,1,3,2,2`,
        expected: 94439495762954,
      },
    ],
  },
} as EverybodyCodesContest
