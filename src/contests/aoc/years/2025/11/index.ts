import { log } from "console"
import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { logEvery } from "../../../../../utils/log.js"

// 🎄 Advent of Code 2025 - Day 11

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [node, rest] = line.split(": ")
    return { node, edges: rest.split(" ") }
  })
}

function countPathsMemo(
  curr: string,
  target: string,
  verticesMap: Map<string, { node: string; edges: string[] }>,
  memo: Map<string, number>,
  forbidNode?: string
): number {
  if (curr === target) return 1
  const key = `${curr}|${target}|${forbidNode ?? ""}`
  if (memo.has(key)) return memo.get(key)!
  let total = 0
  const neighbors = verticesMap.get(curr)?.edges || []
  for (const nxt of neighbors) {
    if (nxt === forbidNode) continue
    total += countPathsMemo(nxt, target, verticesMap, memo, forbidNode)
  }
  memo.set(key, total)
  return total
}

function part1(inputString: string) {
  const vertices = parseInput(inputString)
  const verticesMap = new Map<string, { node: string; edges: string[] }>()
  for (const v of vertices) {
    verticesMap.set(v.node, v)
  }

  // BFS to find all paths from 'you' to 'out'
  return countPathsMemo("you", "out", verticesMap, new Map())
}

function part2(inputString: string) {
  const vertices = parseInput(inputString)
  const verticesMap = new Map<string, { node: string; edges: string[] }>()
  for (const v of vertices) {
    verticesMap.set(v.node, v)
  }
  const memo = new Map<string, number>()

  const p1 =
    countPathsMemo("svr", "dac", verticesMap, memo) *
    countPathsMemo("dac", "fft", verticesMap, memo) *
    countPathsMemo("fft", "out", verticesMap, memo)

  const p2 =
    countPathsMemo("svr", "fft", verticesMap, memo) *
    countPathsMemo("fft", "dac", verticesMap, memo) *
    countPathsMemo("dac", "out", verticesMap, memo)

  return p1 + p2
}

const EXAMPLE1 = `
aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out`

const EXAMPLE2 = `
svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE2,
        expected: 2,
      },
    ],
  },
} as AdventOfCodeContest
