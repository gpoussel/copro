import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 12

function parseInput(input: string) {
  const [initialBlock, rulesBlock] = utils.input.blocks(input)
  const state = initialBlock.split(": ")[1]
  const rules = new Map<string, string>()
  for (const [pattern, result] of rulesBlock.split("\n").map(rule => rule.split(" => "))) {
    rules.set(pattern, result)
  }
  return { state, rules }
}

function applyRules(state: string, rules: Map<string, string>) {
  const actualState = `.....${state}.....`
  const newState = []
  for (let i = 2; i < actualState.length - 2; i++) {
    const pattern = actualState.slice(i - 2, i + 3)
    newState.push(rules.get(pattern) || ".")
  }
  return newState.join("")
}

function evaluate(pattern: string, minX: number) {
  return pattern
    .split("")
    .map((c, i) => (c === "#" ? i + minX : 0))
    .reduce((a, b) => a + b, 0)
}

function solve(input: string, count: number) {
  const { state, rules } = parseInput(input)
  let currentState = state
  let minX = 0
  for (let i = 0; i < count; ++i) {
    let newState = applyRules(currentState, rules)
    const firstPlant = newState.indexOf("#")
    const lastPlant = newState.lastIndexOf("#")
    newState = newState.slice(firstPlant, lastPlant + 1)
    minX += firstPlant - 3
    if (currentState === newState) {
      return evaluate(newState, minX + (count - i - 1))
    }
    currentState = newState
  }
  return evaluate(currentState, minX)
}

function part1(inputString: string) {
  return solve(inputString, 20)
}

function part2(inputString: string) {
  return solve(inputString, 50000000000)
}

const EXAMPLE = `
initial state: #..#.#..##......###...###

...## => #
..#.. => #
.#... => #
.#.#. => #
.#.## => #
.##.. => #
.#### => #
#.#.# => #
#.### => #
##.#. => #
##.## => #
###.. => #
###.# => #
####. => #`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 325,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
