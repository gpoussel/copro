import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGraph } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 6

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    return line.split(")")
  })
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const lefts = new Set(input.map(([left, _right]) => left))
  const rights = new Set(input.map(([_left, right]) => right))
  const roots = Array.from(lefts).filter(left => !rights.has(left))

  let sum = 0
  for (const root of roots) {
    const distancesFromRoot = new Map<string, number>()
    distancesFromRoot.set(root, 0)
    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop()!
      const distance = distancesFromRoot.get(node)!
      const children = input.filter(([left, _right]) => left === node).map(([_left, right]) => right)
      for (const child of children) {
        distancesFromRoot.set(child, distance + 1)
        stack.push(child)
      }
    }
    sum += Array.from(distancesFromRoot.values()).reduce((a, b) => a + b, 0)
  }
  return sum
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const { bestScore } = dijkstraOnGraph(["YOU"], ["SAN"], {
    equals(a, b) {
      return a === b
    },
    key(node) {
      return node
    },
    moves(node) {
      return [
        ...input.filter(([left, _right]) => left === node).map(([_left, right]) => right),
        ...input.filter(([_left, right]) => right === node).map(([left, _right]) => left),
      ].map(node => ({ to: node, cost: 1 }))
    },
  })
  return bestScore - 2
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`,
        expected: 42,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
K)YOU
I)SAN`,
        expected: 4,
      },
    ],
  },
} as AdventOfCodeContest
