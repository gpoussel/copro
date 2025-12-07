import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 8

function parseInput(input: string) {
  const [instStr, nodesStr] = utils.input.blocks(input)
  const instructions = utils.input.firstLine(instStr).split("")
  const nodes = new Map<string, { left: string; right: string }>()
  for (const line of utils.input.lines(nodesStr)) {
    const [name, childrenStr] = line.split(" = ")
    const [left, right] = childrenStr.replace("(", "").replace(")", "").split(", ")
    nodes.set(name, { left, right })
  }
  return { instructions, nodes }
}

function part1(inputString: string) {
  const network = parseInput(inputString)
  let position = "AAA"
  let index = 0
  while (position !== "ZZZ") {
    const node = network.nodes.get(position)!
    const instruction = network.instructions[index % network.instructions.length]
    position = instruction === "L" ? node.left : node.right
    index++
  }
  return index
}

function part2(inputString: string) {
  const network = parseInput(inputString)
  const startPositions = [...network.nodes.keys()].filter(n => n.endsWith("A"))

  // Find cycle length for each starting position
  const cycleLengths = startPositions.map(start => {
    let position = start
    let index = 0
    while (!position.endsWith("Z")) {
      const node = network.nodes.get(position)!
      const instruction = network.instructions[index % network.instructions.length]
      position = instruction === "L" ? node.left : node.right
      index++
    }
    return index
  })

  // Compute LCM of all cycle lengths
  return utils.math.lcm(...cycleLengths)
}

const EXAMPLE1 = `
RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`

const EXAMPLE2 = `
LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`

const EXAMPLE3 = `
LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 2,
      },
      {
        input: EXAMPLE2,
        expected: 6,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 2,
      },
      {
        input: EXAMPLE2,
        expected: 6,
      },
      {
        input: EXAMPLE3,
        expected: 6,
      },
    ],
  },
} as AdventOfCodeContest
