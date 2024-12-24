import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 8

function parseInput(input: string) {
  return utils.input.readNumbers(input)
}

interface TreeNode {
  childNodes: TreeNode[]
  metadata: number[]
}

function parseNode(numbers: number[]): TreeNode {
  const childNdodesCount = numbers.shift()!
  const metadataCount = numbers.shift()!
  const childNodes = Array.from({ length: childNdodesCount }, () => parseNode(numbers))
  const metadata = numbers.splice(0, metadataCount)
  return { childNodes, metadata }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const root = parseNode(input)

  function computeMetadataSum(node: TreeNode): number {
    return node.metadata.reduce((a, b) => a + b, 0) + node.childNodes.map(computeMetadataSum).reduce((a, b) => a + b, 0)
  }
  return computeMetadataSum(root)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const root = parseNode(input)

  function computeValue(node: TreeNode): number {
    if (node.childNodes.length === 0) {
      return node.metadata.reduce((a, b) => a + b, 0)
    }
    return node.metadata
      .filter(m => m > 0 && m <= node.childNodes.length)
      .map(m => computeValue(node.childNodes[m - 1]))
      .reduce((a, b) => a + b, 0)
  }
  return computeValue(root)
}

const EXAMPLE = "2 3 0 3 10 11 12 1 1 0 1 99 2 1 1 2"

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 138,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 66,
      },
    ],
  },
} as AdventOfCodeContest
