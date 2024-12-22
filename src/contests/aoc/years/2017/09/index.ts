import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 9

function parseInput(input: string) {
  return utils.input.firstLine(input)
}

function solve(inputString: string) {
  const input = parseInput(inputString)
  const groups = [{ depth: 0, char: "OUTER" }]
  let score = 0
  let garbageCharacters = 0
  let garbage = false
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (!garbage && char === "<") {
      garbage = true
    } else if (garbage && char === ">") {
      garbage = false
    } else {
      if (garbage) {
        if (char === "!") {
          i++
        } else {
          garbageCharacters++
        }
      } else {
        if (char === "}") {
          const group = groups.pop()!
          score += group.depth
        } else if (char === "{") {
          groups.push({
            depth: groups.length,
            char,
          })
        }
      }
    }
  }
  return { score, garbageCharacters }
}

function part1(inputString: string) {
  return solve(inputString).score
}

function part2(inputString: string) {
  return solve(inputString).garbageCharacters
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "{}",
        expected: 1,
      },
      {
        input: "{{{}}}",
        expected: 6,
      },
      {
        input: "{{},{}}",
        expected: 5,
      },
      {
        input: "{{{},{},{{}}}}",
        expected: 16,
      },
      {
        input: "{<a>,<a>,<a>,<a>}",
        expected: 1,
      },
      {
        input: "{{<ab>},{<ab>},{<ab>},{<ab>}}",
        expected: 9,
      },
      {
        input: "{{<!!>},{<!!>},{<!!>},{<!!>}}",
        expected: 9,
      },
      {
        input: "{{<a!>},{<a!>},{<a!>},{<ab>}}",
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: "<>",
        expected: 0,
      },
      {
        input: "<random characters>",
        expected: 17,
      },
      {
        input: "<<<<>",
        expected: 3,
      },
      {
        input: "<{!>}>",
        expected: 2,
      },
      {
        input: "<!!>",
        expected: 0,
      },
      {
        input: "<!!!>>",
        expected: 0,
      },
      {
        input: '<{o"i!a,<{i<a>',
        expected: 10,
      },
    ],
  },
} as AdventOfCodeContest
