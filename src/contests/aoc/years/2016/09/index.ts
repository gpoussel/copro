import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 9

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function decompress(line: string) {
  let i = 0
  const result = []
  while (i < line.length) {
    if (line[i] === "(") {
      const end = line.indexOf(")", i)
      const [length, repeat] = line
        .slice(i + 1, end)
        .split("x")
        .map(Number)
      i = end + 1
      result.push(line.slice(i, i + length).repeat(repeat))
      i += length
    } else {
      result.push(line[i])
      i++
    }
  }
  return result.join("")
}

function decompressRecursiveLength(line: string): number {
  let i = 0
  const result = []
  while (i < line.length) {
    if (line[i] === "(") {
      const end = line.indexOf(")", i)
      const [length, repeat] = line
        .slice(i + 1, end)
        .split("x")
        .map(Number)
      i = end + 1
      result.push(decompressRecursiveLength(line.slice(i, i + length)) * repeat)
      i += length
    } else {
      result.push(1)
      i++
    }
  }
  return result.reduce((a, b) => a + b, 0)
}

function part1(inputString: string) {
  const line = parseInput(inputString)
  return decompress(line).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return decompressRecursiveLength(input)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "ADVENT",
        expected: 6,
      },
      {
        input: "A(1x5)BC",
        expected: 7,
      },
      {
        input: "(3x3)XYZ",
        expected: 9,
      },
      {
        input: "A(2x2)BCD(2x2)EFG",
        expected: 11,
      },
      {
        input: "(6x1)(1x3)A",
        expected: 6,
      },
      {
        input: "X(8x2)(3x3)ABCY",
        expected: 18,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "ADVENT",
        expected: 6,
      },
      {
        input: "X(8x2)(3x3)ABCY",
        expected: 20,
      },
      {
        input: "(27x12)(20x12)(13x14)(7x10)(1x12)A",
        expected: 241920,
      },
      {
        input: "(25x3)(3x3)ABC(2x3)XY(5x2)PQRSTX(18x9)(3x2)TWO(5x7)SEVEN",
        expected: 445,
      },
    ],
  },
} as AdventOfCodeContest
