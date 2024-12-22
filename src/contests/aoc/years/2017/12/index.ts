import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 12

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [program, connections] = line.split(" <-> ")
    return {
      program: +program,
      connections: connections.split(", ").map(Number),
    }
  })
}

function exploreGroup(program: number, nodes: ReturnType<typeof parseInput>) {
  const foundNodes = new Set<number>()
  breadthFirstSearch(program, {
    adjacents(node) {
      return nodes.find(n => n.program === node)?.connections || []
    },
    ends(node) {
      foundNodes.add(node)
      return false
    },
    key(node) {
      return `${node}`
    },
  })
  return foundNodes
}

function part1(inputString: string) {
  const nodes = parseInput(inputString)
  return exploreGroup(0, nodes).size
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const visitedOverall = new Set<number>()
  let groups = 0
  while (visitedOverall.size < input.length) {
    const unvisitedProgram = input.find(n => !visitedOverall.has(n.program))!.program
    const group = exploreGroup(unvisitedProgram, input)
    group.forEach(p => visitedOverall.add(p))
    groups++
  }
  return groups
}

const EXAMPLE = `
0 <-> 2
1 <-> 1
2 <-> 0, 3, 4
3 <-> 2, 4
4 <-> 2, 3, 6
5 <-> 6
6 <-> 4, 5`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 6,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
} as AdventOfCodeContest
