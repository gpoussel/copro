import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 16

function parseInput(input: string) {
  return utils.input.firstLine(input).split("").map(Number)
}

const PATTERN = [1, 0, -1, 0]

function lastDigit(n: number) {
  return Math.abs(n % 10)
}

function computeNextPhase(input: number[], output: number[]) {
  for (let i = 0; i < input.length; ++i) {
    let sum = 0
    for (let j = 0; j < input.length - i; ++j) {
      const position = Math.floor(j / (i + 1))
      const value = PATTERN[position % PATTERN.length]
      sum += (input[i + j] * value) % 10
    }
    output[i] = lastDigit(sum)
  }
}

function repeatedComputation(input: number[], times: number) {
  let value = input
  let output = [...input]
  for (let i = 0; i < times; i++) {
    computeNextPhase(value, output)
    ;[value, output] = [output, value]
    utils.log.logEvery(i, 10)
  }
  return value
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const value = repeatedComputation(input, 100)
  return value.join("").slice(0, 8)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const offsetValue = Number(input.slice(0, 7).join(""))
  const times = Math.ceil((input.length * 10_000 - offsetValue) / input.length)
  const tape = Array.from({ length: input.length * times }, (_, i) => input[i % input.length]).slice(
    offsetValue % input.length
  )
  for (let i = 0; i < 100; i++) {
    for (let j = tape.length - 2; j >= 0; j--) {
      tape[j] = lastDigit(tape[j] + tape[j + 1])
    }
  }
  return tape.slice(0, 8).join("")
}

export default {
  part1: {
    run: part1,
    tests: [
      { input: "80871224585914546619083218645595", expected: "24176176" },
      { input: "19617804207202209144916044189917", expected: "73745418" },
      { input: "69317163492948606335995924319873", expected: "52432133" },
    ],
  },
  part2: {
    run: part2,
    tests: [
      // { input: "03036732577212944063491565474664", expected: "84462026" },
      // { input: "02935109699940807407585447034323", expected: "78725270" },
      // { input: "03081770884921959731165446850517", expected: "53553731" },
    ],
  },
} as AdventOfCodeContest
