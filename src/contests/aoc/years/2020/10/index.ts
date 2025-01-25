import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 10

function parseInput(input: string) {
  return utils.input.lines(input).map(Number)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const adapters = input.sort((a, b) => a - b)
  const differences = new Map<number, number>()
  differences.set(1, 0)
  differences.set(2, 0)
  differences.set(3, 1)
  for (let i = 0; i < adapters.length; i++) {
    const diff = adapters[i] - (i === 0 ? 0 : adapters[i - 1])
    differences.set(diff, differences.get(diff)! + 1)
  }
  return differences.get(1)! * differences.get(3)!
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const adapters = [0, ...input, utils.iterate.max(input) + 3].sort((a, b) => a - b)
  const dp = Array(adapters.length).fill(0)
  dp[0] = 1
  for (let i = 1; i < adapters.length; i++) {
    for (let j = i - 1; j >= 0; j--) {
      if (adapters[i] - adapters[j] <= 3) {
        dp[i] += dp[j]
      } else {
        break
      }
    }
  }
  return dp[dp.length - 1]
}

const EXAMPLE1 = `
16
10
15
5
1
11
7
19
6
12
4`

const EXAMPLE2 = `
28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 35,
      },
      {
        input: EXAMPLE2,
        expected: 220,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 8,
      },
      {
        input: EXAMPLE2,
        expected: 19208,
      },
    ],
  },
} as AdventOfCodeContest
