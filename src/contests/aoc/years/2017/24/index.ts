import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 24

function parseInput(input: string) {
  return utils.input.lines(input).map(row => row.split("/").map(Number))
}

function computeStrength(path: string[]) {
  return path.flatMap(node => node.split("/").map(Number)).reduce((a, b) => a + b, 0)
}

function solve(inputString: string) {
  const pairs = parseInput(inputString)
  const visitedPaths: string[][] = []
  breadthFirstSearch(["0/0"], {
    adjacents(node) {
      const lastNode = node[node.length - 1]
      const port = lastNode.split("/").map(Number)
      const lastPort = port[1]
      return pairs
        .filter(pair => !node.includes(pair.join("/")) && !node.includes(pair.reverse().join("/")))
        .filter(pair => pair.includes(lastPort))
        .map(pair => {
          const nextPort = pair[0] === lastPort ? pair[1] : pair[0]
          return [...node, `${lastPort}/${nextPort}`]
        })
    },
    ends(node) {
      visitedPaths.push(node)
      return false
    },
    key(node) {
      return `${node.join(",")}`
    },
  })

  const maxStrength = visitedPaths.map(computeStrength).reduce((a, b) => Math.max(a, b), 0)
  const maxLength = visitedPaths.reduce((a, b) => Math.max(a, b.length), 0)
  const longestPaths = visitedPaths.filter(path => path.length === maxLength)
  const longestStrength = longestPaths.map(computeStrength).reduce((a, b) => Math.max(a, b), 0)

  return {
    maxStrength,
    longestStrength,
  }
}

function part1(inputString: string) {
  const { maxStrength } = solve(inputString)
  return maxStrength
}

function part2(inputString: string) {
  const { longestStrength } = solve(inputString)
  return longestStrength
}

const EXAMPLE = `
0/2
2/2
2/3
3/4
3/5
0/1
10/1
9/10`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 31,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 19,
      },
    ],
  },
} as AdventOfCodeContest
