import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 18

type SnailfishNumber = [number, number][]

function parseInput(input: string) {
  const lines = utils.input.lines(input)
  return lines.map(line => {
    const n: SnailfishNumber = []
    let lvl = 0
    for (const c of line) {
      if (c === "[") {
        lvl += 1
      } else if (c === "]") {
        lvl -= 1
      } else if (c === ",") {
        continue
      } else {
        n.push([parseInt(c), lvl])
      }
    }
    return n
  })
}

function reduce(n: SnailfishNumber): SnailfishNumber {
  while (true) {
    if (explode(n)) {
      continue
    }
    if (split(n)) {
      continue
    }
    return n
  }
}

function add(n1: SnailfishNumber, n2: SnailfishNumber): SnailfishNumber {
  return [
    ...(n1.map(([v1, lvl1]) => [v1, lvl1 + 1]) as SnailfishNumber),
    ...(n2.map(([v2, lvl2]) => [v2, lvl2 + 1]) as SnailfishNumber),
  ]
}

function explode(n: SnailfishNumber): boolean {
  const i = utils.iterate.slidingWindows(n, 2).findIndex(([[v1, lvl1], [v2, lvl2]]) => lvl1 === lvl2 && lvl1 > 4)
  if (i === -1) {
    return false
  }
  if (n[i - 1]) {
    n[i - 1][0] += n[i][0]
  }
  if (n[i + 2]) {
    n[i + 2][0] += n[i + 1][0]
  }
  n.splice(i, 2, [0, 4])
  return true
}

function split(n: SnailfishNumber): boolean {
  const i = n.findIndex(([value, level]) => value >= 10)
  if (i === -1) {
    return false
  }
  n.splice(i, 1, [Math.floor(n[i][0] / 2), n[i][1] + 1], [Math.ceil(n[i][0] / 2), n[i][1] + 1])
  return true
}

function magnitude(n: SnailfishNumber): number {
  while (n.length > 1) {
    const i = utils.iterate.slidingWindows(n, 2).findIndex(([[v1, lvl1], [v2, lvl2]]) => lvl1 === lvl2)
    const v = 3 * n[i][0] + 2 * n[i + 1][0]
    n.splice(i, 2, [v, n[i][1] - 1])
  }
  return n[0][0]
}

function part1(inputString: string) {
  const numbers = parseInput(inputString)
  const result = numbers.reduce((acc, n) => reduce(add(acc, n)))
  return magnitude(result)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const magnitudes = utils.iterate
    .cartesianProduct(utils.iterate.range(0, input.length - 1), utils.iterate.range(0, input.length - 1))
    .filter(([i, j]) => i !== j)
    .map(([i, j]) => magnitude(reduce(add(input[i], input[j]))))
  return utils.iterate.max(magnitudes)
}

const EXAMPLE = `
[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
[[[5,[2,8]],4],[5,[[9,9],0]]]
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
[[[[5,4],[7,7]],8],[[8,3],8]]
[[9,3],[[9,9],[6,[4,9]]]]
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 4140,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 3993,
      },
    ],
  },
} as AdventOfCodeContest
