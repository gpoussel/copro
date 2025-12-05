import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 12

function parseInput(input: string) {
  return utils.input.lines(input).map(line => line.split("-"))
}

function explorePath(edges: string[][], path: string[], allowDoubleSmallCave = false) {
  const paths = []
  const lastNode = path[path.length - 1]
  for (const [a, b] of edges) {
    let nextNode: string | null = null
    if (a === lastNode) {
      nextNode = b
    } else if (b === lastNode) {
      nextNode = a
    }
    if (!nextNode || nextNode === "start") {
      continue
    }
    const nextNodeIsSmallCave = nextNode === nextNode.toLowerCase()
    const nextNodeAlreadyVisited = path.includes(nextNode)
    if (nextNodeIsSmallCave && nextNodeAlreadyVisited) {
      if (!allowDoubleSmallCave) {
        continue
      }
      const smallCaveVisits = path.filter(n => n === n.toLowerCase())
      const smallCaveVisitCounts: Record<string, number> = {}
      for (const cave of smallCaveVisits) {
        smallCaveVisitCounts[cave] = (smallCaveVisitCounts[cave] || 0) + 1
      }
      const hasDoubleVisit = Object.values(smallCaveVisitCounts).some(count => count > 1)
      if (hasDoubleVisit && path.includes(nextNode)) {
        continue
      }
    }
    paths.push([...path, nextNode])
  }
  return paths
}

function part1(inputString: string) {
  const edges = parseInput(inputString)
  const paths = [["start"]]
  const endPaths = []
  while (paths.length > 0) {
    const path = paths.pop()!
    const lastNode = path[path.length - 1]
    if (lastNode === "end") {
      endPaths.push(path)
      continue
    }
    paths.push(...explorePath(edges, path))
  }
  return endPaths.length
}

function part2(inputString: string) {
  const edges = parseInput(inputString)
  const paths = [["start"]]
  const endPaths = []
  while (paths.length > 0) {
    const path = paths.pop()!
    const lastNode = path[path.length - 1]
    if (lastNode === "end") {
      endPaths.push(path)
      continue
    }
    paths.push(...explorePath(edges, path, true))
  }
  return endPaths.length
}

const EXAMPLE1 = `
start-A
start-b
A-c
A-b
b-d
A-end
b-end`

const EXAMPLE2 = `
dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc`

const EXAMPLE3 = `
fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 10,
      },
      {
        input: EXAMPLE2,
        expected: 19,
      },
      {
        input: EXAMPLE3,
        expected: 226,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 36,
      },
      {
        input: EXAMPLE2,
        expected: 103,
      },
      {
        input: EXAMPLE3,
        expected: 3509,
      },
    ],
  },
} as AdventOfCodeContest
