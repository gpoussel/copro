import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 10

function parseInput(input: string) {
  return utils.input.lines(input)
}

const SCORE_TABLE: Record<string, number> = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
}

const CLOSING_TABLE: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">",
}

const COMPLETION_SCORE_TABLE: Record<string, number> = {
  ")": 1,
  "]": 2,
  "}": 3,
  ">": 4,
}

function part1(inputString: string) {
  const lines = parseInput(inputString)
  let totalScore = 0
  for (const line of lines) {
    const stack = []
    for (const char of line) {
      if ("([{<".includes(char)) {
        stack.push(char)
      } else {
        const last = stack.pop()
        if (last === undefined || CLOSING_TABLE[last as keyof typeof CLOSING_TABLE] !== char) {
          totalScore += SCORE_TABLE[char]
          break
        }
      }
    }
  }
  return totalScore
}

function part2(inputString: string) {
  const lines = parseInput(inputString)
  const scores = []
  for (const line of lines) {
    const stack = []
    let valid = true
    for (const char of line) {
      if ("([{<".includes(char)) {
        stack.push(char)
      } else {
        const last = stack.pop()
        if (last === undefined || CLOSING_TABLE[last as keyof typeof CLOSING_TABLE] !== char) {
          valid = false
          break
        }
      }
    }
    if (valid) {
      let lineScore = 0
      while (stack.length > 0) {
        const last = stack.pop() as string
        const closingChar = CLOSING_TABLE[last as keyof typeof CLOSING_TABLE]
        lineScore = lineScore * 5 + COMPLETION_SCORE_TABLE[closingChar]
      }
      scores.push(lineScore)
    }
  }
  return utils.iterate.median(scores)
}

const EXAMPLE = `
[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 26397,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 288957,
      },
    ],
  },
} as AdventOfCodeContest
