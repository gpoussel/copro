import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 25

function parseInput(input: string) {
  const graph = new Map<string, Set<string>>()

  function addEdge(a: string, b: string) {
    if (!graph.has(a)) graph.set(a, new Set())
    if (!graph.has(b)) graph.set(b, new Set())
    graph.get(a)!.add(b)
    graph.get(b)!.add(a)
  }

  for (const line of utils.input.lines(input)) {
    const [left, right] = line.split(": ")
    const neighbors = right.split(" ")
    for (const n of neighbors) {
      addEdge(left, n)
    }
  }

  return graph
}

// Karger's algorithm for minimum cut
function findMinCut(graph: Map<string, Set<string>>): [Set<string>, Set<string>] {
  const nodes = [...graph.keys()]

  // Run many times to find the 3-edge cut
  for (let attempt = 0; attempt < 1000; attempt++) {
    // Each node maps to a set of merged nodes
    const groups = new Map<string, Set<string>>()
    for (const n of nodes) {
      groups.set(n, new Set([n]))
    }

    // Copy edges
    const edges: [string, string][] = []
    for (const [a, neighbors] of graph) {
      for (const b of neighbors) {
        if (a < b) edges.push([a, b])
      }
    }

    // Find representative
    function find(n: string): string {
      for (const [rep, group] of groups) {
        if (group.has(n)) return rep
      }
      return n
    }

    // Contract edges until 2 nodes remain
    let activeNodes = nodes.length
    while (activeNodes > 2) {
      // Pick random edge
      const idx = Math.floor(Math.random() * edges.length)
      const [a, b] = edges[idx]
      const repA = find(a)
      const repB = find(b)

      if (repA === repB) continue // Same group

      // Merge B into A
      const groupB = groups.get(repB)!
      for (const n of groupB) {
        groups.get(repA)!.add(n)
      }
      groups.delete(repB)
      activeNodes--
    }

    // Count edges between the two groups
    const [group1, group2] = [...groups.values()]
    let cutSize = 0
    for (const a of group1) {
      for (const b of graph.get(a)!) {
        if (group2.has(b)) cutSize++
      }
    }

    if (cutSize === 3) {
      return [group1, group2]
    }
  }

  throw new Error("Could not find min cut")
}

function part1(inputString: string) {
  const graph = parseInput(inputString)
  const [group1, group2] = findMinCut(graph)
  return group1.size * group2.size
}

function part2(_inputString: string) {
  return "Merry Christmas!"
}

const EXAMPLE = `
jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 54,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
