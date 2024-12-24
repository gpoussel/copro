import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { DirectedGraph } from "../../../../../utils/graph.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 7

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const words = line.split(" ")
    return {
      before: words[1],
      after: words[7],
    }
  })
}

function buildRequirementsMap(edges: { before: string; after: string }[]) {
  const requirements = new Map<string, string[]>()
  for (const { before, after } of edges) {
    if (!requirements.has(after)) {
      requirements.set(after, [])
    }
    if (!requirements.has(before)) {
      requirements.set(before, [])
    }
    requirements.get(after)!.push(before)
  }
  return requirements
}

function part1(inputString: string) {
  const edges = parseInput(inputString)
  const requirements = buildRequirementsMap(edges)
  const order: string[] = []
  while (order.length < requirements.size) {
    const next = [...requirements.keys()]
      .filter(k => !order.includes(k))
      .filter(k => (requirements.get(k) || []).every(r => order.includes(r)))
      .sort()[0]
    order.push(next)
  }
  return order.join("")
}

function part2(inputString: string) {
  const edges = parseInput(inputString)
  const requirements = buildRequirementsMap(edges)
  const workers: { task: { name: string; time: number } | undefined }[] = [
    { task: undefined },
    { task: undefined },
    { task: undefined },
    { task: undefined },
    { task: undefined },
  ]
  const started = new Set<string>()
  const completed = new Set<string>()
  let time = 0
  while (completed.size < requirements.size) {
    for (const worker of workers) {
      if (worker.task) {
        worker.task.time--
        if (worker.task.time === 0) {
          completed.add(worker.task.name)
          worker.task = undefined
        }
      }
    }
    for (const worker of workers) {
      if (worker.task === undefined) {
        const next = [...requirements.keys()]
          .filter(k => !started.has(k))
          .filter(k => (requirements.get(k) || []).every(r => completed.has(r)))
          .sort()[0]
        if (next) {
          worker.task = { name: next, time: (edges.length > 100 ? 60 : 0) + next.charCodeAt(0) - "A".charCodeAt(0) + 1 }
          started.add(next)
        }
      }
    }
    time++
  }
  return time - 1
}

const EXAMPLE = `
Step C must be finished before step A can begin.
Step C must be finished before step F can begin.
Step A must be finished before step B can begin.
Step A must be finished before step D can begin.
Step B must be finished before step E can begin.
Step D must be finished before step E can begin.
Step F must be finished before step E can begin.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "CABDFE",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 14,
      },
    ],
  },
} as AdventOfCodeContest
