import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 13

function parseInput(input: string) {
  return utils.input.blocks(input).map(block => {
    const [left, right] = utils.input.lines(block)
    return { left: JSON.parse(left), right: JSON.parse(right) }
  })
}

function comparePackets(left: any, right: any): number {
  if (typeof left === "number" && typeof right === "number") {
    return left - right
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < left.length; i++) {
      if (i >= right.length) {
        return 1
      }
      const cmp = comparePackets(left[i], right[i])
      if (cmp !== 0) {
        return cmp
      }
    }
    return left.length - right.length
  }
  if (typeof left === "number") {
    return comparePackets([left], right)
  } else {
    return comparePackets(left, [right])
  }
}

function part1(inputString: string) {
  const pairs = parseInput(inputString)
  let sum = 0
  for (let i = 0; i < pairs.length; i++) {
    const { left, right } = pairs[i]
    if (comparePackets(left, right) < 0) {
      sum += i + 1
    }
  }
  return sum
}

function part2(inputString: string) {
  const pairs = parseInput(inputString)
  const divider1 = [[2]]
  const divider2 = [[6]]
  const packets = [...pairs.map(p => p.left), ...pairs.map(p => p.right), divider1, divider2]
  packets.sort((a, b) => comparePackets(a, b))
  const index1 = packets.findIndex(p => p == divider1) + 1
  const index2 = packets.findIndex(p => p == divider2) + 1
  return index1 * index2
}

const EXAMPLE = `
[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 13,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 140,
      },
    ],
  },
} as AdventOfCodeContest
