import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 13

function parseInputPart1(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const numbers = parseInputPart1(inputString)
  const rightPart = []
  const leftPart = []
  for (let i = 0; i < numbers.length; ++i) {
    if (i % 2 === 0) {
      rightPart.push(numbers[i])
    } else {
      leftPart.push(numbers[i])
    }
  }
  const merged = [1, ...rightPart, ...leftPart.reverse()]
  return merged[2025 % merged.length]
}

interface Range {
  start: number
  end: number
}

function parseInputPart2(input: string): Range[] {
  return utils.input.lines(input).map(line => {
    const [start, end] = line.split("-").map(Number)
    return { start, end }
  })
}

function solveWithRanges(ranges: Range[], target: number) {
  const rightPart: Range[] = []
  const leftPart: Range[] = []
  for (let i = 0; i < ranges.length; ++i) {
    if (i % 2 === 0) {
      rightPart.push(ranges[i])
    } else {
      leftPart.push(ranges[i])
    }
  }
  const rightPartSize = rightPart.map(r => r.end - r.start + 1).reduce((a, b) => a + b, 0)
  const leftPartSize = leftPart.map(r => r.end - r.start + 1).reduce((a, b) => a + b, 0)
  const totalSize = 1 + rightPartSize + leftPartSize

  const actualTarget = target % totalSize
  if (actualTarget === 0) {
    return 1
  }

  if (actualTarget <= rightPartSize) {
    let count = 0
    for (const range of rightPart) {
      const rangeSize = range.end - range.start + 1
      if (actualTarget <= count + rangeSize) {
        return range.start + (actualTarget - count) - 1
      }
      count += rangeSize
    }
  }

  let count = rightPartSize
  for (let i = leftPart.length - 1; i >= 0; --i) {
    const range = leftPart[i]
    const rangeSize = range.end - range.start + 1
    if (actualTarget <= count + rangeSize) {
      return range.end - (actualTarget - count) + 1
    }
    count += rangeSize
  }
}

function part2(inputString: string) {
  const ranges = parseInputPart2(inputString)
  return solveWithRanges(ranges, 20252025)
}

function part3(inputString: string) {
  const ranges = parseInputPart2(inputString)
  return solveWithRanges(ranges, 202520252025)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
72
58
47
61
67`,
        expected: 67,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
10-15
12-13
20-21
19-23
30-37`,
        expected: 30,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
