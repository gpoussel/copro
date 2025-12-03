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

function analyzeRulesAndMessages(rules: ReturnType<typeof parseRule>[], messages: string[]) {
  const ruleMap = new Map(rules.map(rule => [rule.name, rule.value]))

  function matchRule(message: string, pos: number, ruleNum: number): number[] {
    const rule = ruleMap.get(ruleNum)!

    // Terminal rule (character)
    if (typeof rule === "string") {
      return pos < message.length && message[pos] === rule ? [pos + 1] : []
    }

    // Non-terminal rule (list of alternatives)
    const results: number[] = []
    for (const alternative of rule as number[][]) {
      const positions = matchSequence(message, pos, alternative)
      results.push(...positions)
    }
    return results
  }

  function matchSequence(message: string, pos: number, sequence: number[]): number[] {
    if (sequence.length === 0) return [pos]

    const [first, ...rest] = sequence
    const positions: number[] = []

    for (const newPos of matchRule(message, pos, first)) {
      positions.push(...matchSequence(message, newPos, rest))
    }

    return positions
  }

  function isValid(message: string): boolean {
    return matchRule(message, 0, 0).includes(message.length)
  }

  return messages.filter(isValid).length
}

function part1(inputString: string) {
  const { rules, messages } = parseInput(inputString)
  return analyzeRulesAndMessages(rules, messages)
}

function part2(inputString: string) {
  const { rules, messages } = parseInput(inputString)
  // Modify rules 8 and 11 for part 2
  for (const rule of rules) {
    if (rule.name === 8) {
      rule.value = [[42], [42, 8]]
    } else if (rule.name === 11) {
      rule.value = [
        [42, 31],
        [42, 11, 31],
      ]
    }
  }
  return analyzeRulesAndMessages(rules, messages)
}

const EXAMPLE1 = `
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

const EXAMPLE2 = `
42: 9 14 | 10 1
9: 14 27 | 1 26
10: 23 14 | 28 1
1: "a"
11: 42 31
5: 1 14 | 15 1
19: 14 1 | 14 14
12: 24 14 | 19 1
16: 15 1 | 14 14
31: 14 17 | 1 13
6: 14 14 | 1 14
2: 1 24 | 14 4
0: 8 11
13: 14 3 | 1 12
15: 1 | 14
17: 14 2 | 1 7
23: 25 1 | 22 14
28: 16 1
4: 1 1
20: 14 14 | 1 15
3: 5 14 | 16 1
27: 1 6 | 14 18
14: "b"
21: 14 1 | 1 14
25: 1 1 | 1 14
22: 14 14
8: 42
26: 14 22 | 1 20
18: 15 15
7: 14 5 | 1 21
24: 14 1

abbbbbabbbaaaababbaabbbbabababbbabbbbbbabaaaa
bbabbbbaabaabba
babbbbaabbbbbabbbbbbaabaaabaaa
aaabbbbbbaaaabaababaabababbabaaabbababababaaa
bbbbbbbaaaabbbbaaabbabaaa
bbbababbbbaaaaaaaabbababaaababaabab
ababaaaaaabaaab
ababaaaaabbbaba
baabbaaaabbaaaababbaababb
abbbbabbbbaaaababbbbbbaaaababb
aaaaabbaabaaaaababaa
aaaabbaaaabbaaa
aaaabbaabbaaaaaaabbbabbbaaabbaabaaa
babaaabbbaaabaababbaabababaaab
aabbbbbaabbbaaaaaabbbbbababaaaaabbaaabba`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 2,
      },
      {
        input: EXAMPLE2,
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE2,
        expected: 12,
      },
    ],
  },
} as AdventOfCodeContest
