import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2017 - Day 13

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [depth, range] = line.split(": ").map(Number)
    return { depth, range }
  })
}

function solve(layerConfig: ReturnType<typeof parseInput>, delay: number) {
  const layerNumbers = utils.iterate.range(0, layerConfig[layerConfig.length - 1].depth + 1)
  const layersThatCaughtMe = layerNumbers.filter(layerNumber => {
    const layer = layerConfig.find(layer => layer.depth === layerNumber)
    if (!layer) return false
    return (layer.depth + delay) % (2 * (layer.range - 1)) === 0
  })
  const severity = layersThatCaughtMe
    .map(layerNumber => {
      const layer = layerConfig.find(layer => layer.depth === layerNumber)!
      return layer.depth * layer.range
    })
    .reduce((a, b) => a + b, 0)

  return {
    severity,
    layersThatCaughtMe,
  }
}

function part1(inputString: string) {
  const layerConfig = parseInput(inputString)
  return solve(layerConfig, 0).severity
}

function part2(inputString: string) {
  const layerConfig = parseInput(inputString)
  let i = 0
  while (true) {
    if (solve(layerConfig, i).layersThatCaughtMe.length === 0) {
      return i
    }
    utils.log.logEvery(i, 100000)
    ++i
  }
}

const EXAMPLE = `
0: 3
1: 2
4: 4
6: 4`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 24,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 10,
      },
    ],
  },
} as AdventOfCodeContest
