import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 19

function parseRule(rule: string) {
  const [name, rest] = rule.split(": ")
  if (rest.startsWith('"')) {
    return { name: +name, value: rest[1] }
  }
  const options = rest.split(" | ").map(option => option.split(" ").map(Number))
  return { name: +name, value: options }
}

function parseInput(input: string) {
  const [rules, messages] = utils.input.blocks(input)
  return {
    rules: utils.input.lines(rules).map(parseRule),
    messages: utils.input.lines(messages),
  }
}

function part1(inputString: string) {
  const { rules, messages } = parseInput(inputString)
  const ruleMap = new Map(rules.map(rule => [rule.name, rule.value]))
  const stack: (string | number)[][] = [[0]]
  const values = new Set<string>()
  while (stack.length > 0) {
    const current = stack.pop()!
    if (current?.every(element => typeof element === "string")) {
      values.add(current.join(""))
      continue
    }
    let next = [[]] as (string | number)[][]
    for (let i = 0; i < current.length; i++) {
      const value = current[i]
      if (typeof value === "string") {
        next.forEach(option => option.push(value))
        continue
      }
      const rule = ruleMap.get(value)!
      if (typeof rule === "string") {
        next.forEach(option => option.push(rule))
        continue
      }
      const options = rule as (string | number)[][]
      next = next.flatMap(n => options.map(option => [...n, ...option]))
    }
    next.forEach(value => stack.push(value))
  }
  return messages.filter(message => values.has(message)).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return
}

const EXAMPLE = `
0: 4 1 5
1: 2 3 | 3 2
2: 4 4 | 5 5
3: 4 5 | 5 4
4: "a"
5: "b"

ababbb
bababa
abbbab
aaabbb
aaaabbb`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: undefined,
      },
    ],
  },
} as AdventOfCodeContest
