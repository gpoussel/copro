import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { DirectedGraph } from "../../../../../utils/graph.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 7

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    if (line.includes(" -> ")) {
      const parts = line.split(" -> ")
      const [name, weight] = parts[0].match(/(\w+) \((\d+)\)/)!.slice(1)
      const discs = parts[1].split(", ")
      return {
        name,
        weight: parseInt(weight),
        discs,
      }
    }
    const [name, weight] = line.match(/(\w+) \((\d+)\)/)!.slice(1)
    return {
      name,
      weight: parseInt(weight),
      discs: [],
    }
  })
}

function buildGraph(nodes: ReturnType<typeof parseInput>) {
  const graph = new DirectedGraph<string>()
  for (const node of nodes) {
    for (const disc of node.discs) {
      graph.addEdge(node.name, disc)
    }
  }
  return graph
}

function part1(inputString: string) {
  const nodes = parseInput(inputString)
  const graph = buildGraph(nodes)
  const roots = graph.roots()
  if (roots.length !== 1) {
    throw new Error("Expected exactly one root node")
  }
  return roots[0]
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const graph = buildGraph(input)
  const roots = graph.roots()
  if (roots.length !== 1) {
    throw new Error("Expected exactly one root node")
  }
  const root = roots[0]
  const totalWeights = new Map<string, number>()
  graph.dfs(root, [], (_node, path) => {
    const lastNodeNameInPath = path[path.length - 1]
    const lastNodeInPath = input.find(n => n.name === lastNodeNameInPath)!
    path.forEach(nodeInPath => {
      totalWeights.set(nodeInPath, (totalWeights.get(nodeInPath) || 0) + lastNodeInPath.weight)
    })
  })
  for (const line of input) {
    const childWeights = line.discs.map(disc => totalWeights.get(disc)!)
    const uniqueChildWeights = new Set(childWeights)
    if (uniqueChildWeights.size > 1) {
      const unabalancedWeight = [...uniqueChildWeights].filter(w => childWeights.filter(cw => cw === w).length === 1)[0]
      const balancedWeight = [...uniqueChildWeights].filter(w => childWeights.filter(cw => cw === w).length > 1)[0]
      const childNameWithUnbalancedWeight = line.discs[childWeights.indexOf(unabalancedWeight)]
      const childNodeWithUnbalancedWeight = input.find(n => n.name === childNameWithUnbalancedWeight)!
      return childNodeWithUnbalancedWeight.weight + (balancedWeight - unabalancedWeight)
    }
  }

  throw new Error("Could not find unbalanced node")
}

const EXAMPLE = `
pbga (66)
xhth (57)
ebii (61)
havc (66)
ktlj (57)
fwft (72) -> ktlj, cntj, xhth
qoyq (66)
padx (45) -> pbga, havc, qoyq
tknk (41) -> ugml, padx, fwft
jptl (61)
ugml (68) -> gyxo, ebii, jptl
gyxo (61)
cntj (57)`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "tknk",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 60,
      },
    ],
  },
} as AdventOfCodeContest
