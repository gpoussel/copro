import { EverybodyCodesContest } from "../../../../../types/contest.js"
import { DirectedGraph } from "../../../../../utils/graph.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2024 - Quest 6

const FRUIT_CHAR = "@"

function parseInput(input: string) {
  const rules = utils.input.regexLines(input, /(\w+):(.*)/).map(([_, name, child]) => ({
    name,
    child: child.split(",").map(dep => dep.trim()),
  }))
  const graph = new DirectedGraph<string>()
  for (const { name, child } of rules) {
    child.forEach(child => {
      graph.addEdge(name, child)
    })
  }
  return graph
}

function findUniquePath(graph: DirectedGraph<string>) {
  const roots = graph.roots()
  if (roots.length !== 1) {
    throw new Error("Invalid graph")
  }

  const paths = graph.allPathsFromTo(roots[0], FRUIT_CHAR)
  const pathLengths = utils.iterate.countBy(paths, p => p.length)
  const pathWithUniqueLength = Array.from(pathLengths.entries()).find(([_, count]) => count === 1)
  if (!pathWithUniqueLength) {
    throw new Error("Invalid graph")
  }
  return paths.find(p => p.length === pathWithUniqueLength[0])!
}

function part1(inputString: string) {
  const graph = parseInput(inputString)
  return findUniquePath(graph).join("")
}

function part2(inputString: string) {
  const graph = parseInput(inputString)
  return findUniquePath(graph)
    .map(c => c.charAt(0))
    .join("")
}

function part3(inputString: string) {
  return part2(inputString)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
RR:A,B,C
A:D,E
B:F,@
C:G,H
D:@
E:@
F:@
G:@
H:@`,
        expected: "RRB@",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
RR:A,B,C
A:D,E
B:F,@
C:G,H
D:@
E:@
F:@
G:@
H:@`,
        expected: "RB@",
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
