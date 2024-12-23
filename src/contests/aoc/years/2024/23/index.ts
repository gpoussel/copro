import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2024 - Day 23

function parseInput(input: string): [string, string][] {
  return utils.input.lines(input).map(line => line.split("-") as [string, string])
}

function buildConnectionMap(input: [string, string][]) {
  const connections = new Map<string, Set<string>>()
  for (const [a, b] of input) {
    if (!connections.has(a)) {
      connections.set(a, new Set())
    }
    if (!connections.has(b)) {
      connections.set(b, new Set())
    }
    connections.get(a)!.add(b)
    connections.get(b)!.add(a)
  }
  return connections
}

function buildNodeSet(input: [string, string][]) {
  const nodeSet = new Set<string>()
  for (const [a, b] of input) {
    nodeSet.add(a)
    nodeSet.add(b)
  }
  return nodeSet
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const nodeSet = buildNodeSet(input)
  const connections = buildConnectionMap(input)

  const groups: [string, string, string][] = []
  for (const edge of input) {
    const [a, b] = edge
    for (const otherNode of nodeSet) {
      if (otherNode === a || otherNode === b) {
        continue
      }

      if (connections.get(a)!.has(otherNode) && connections.get(b)!.has(otherNode)) {
        groups.push([a, b, otherNode])
        continue
      }
    }
  }

  const uniqueGroups = new Set(groups.map(group => group.sort().join("-")))
  return [...uniqueGroups].filter(group => group.split("-").some(node => node.startsWith("t"))).length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const nodeSet = buildNodeSet(input)
  const connections = buildConnectionMap(input)

  const visitedGroups = new Set<string>()

  let bestPath: string[] = []
  for (const edge of input) {
    const [a, b] = edge
    const nodesInGroup = [a, b]
    const allConnectedNdes = [...nodeSet].filter(node => connections.get(a)!.has(node) && connections.get(b)!.has(node))
    if (allConnectedNdes.length + 2 <= bestPath.length) {
      continue
    }

    const visitedGroupsInIteration = new Set<string>()
    function key(node: string[]) {
      return node.sort().join(",")
    }
    breadthFirstSearch<string[]>(nodesInGroup, {
      adjacents(node) {
        if (visitedGroups.has(key(node))) {
          return []
        }
        return allConnectedNdes
          .filter(connectedNode => node.every(n => connections.get(connectedNode)!.has(n)))
          .map(cn => [...node, cn])
      },
      ends(node) {
        visitedGroupsInIteration.add(key(node))
        if (node.length > bestPath.length) {
          bestPath = node
        }
        return false
      },
      key,
    })

    visitedGroupsInIteration.forEach(group => visitedGroups.add(group))
  }

  return bestPath.sort().join(",")
}

const EXAMPLE = `
kh-tc
qp-kh
de-cg
ka-co
yn-aq
qp-ub
cg-tb
vc-aq
tb-ka
wh-tc
yn-cg
kh-ub
ta-co
de-co
tc-td
tb-wq
wh-td
ta-ka
td-qp
aq-cg
wq-ub
ub-vc
de-ta
wq-aq
wq-vc
wh-yn
ka-de
kh-ta
co-tc
wh-qp
tb-vc
td-yn`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 7,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "co,de,ka,ta",
      },
    ],
  },
} as AdventOfCodeContest
