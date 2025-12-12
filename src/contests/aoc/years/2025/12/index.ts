import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2025 - Day 12

interface Pattern {
  id: number
  layout: string[][]
}

interface Layout {
  width: number
  height: number
  patternIds: number[]
}

function parseInput(input: string) {
  const blocks = utils.input.blocks(input)
  const patterns: Pattern[] = []
  for (let i = 0; i < blocks.length - 1; i++) {
    const lines = utils.input.lines(blocks[i])
    const id = parseInt(lines[0].slice(0, -1), 10)
    const layout = lines.slice(1).map(line => line.split(""))
    patterns.push({ id, layout })
  }
  const layoutLines = utils.input.lines(blocks[blocks.length - 1])
  const layouts: Layout[] = []
  for (const layoutLine of layoutLines) {
    const [sizePart, idsPart] = layoutLine.split(": ")
    const [width, height] = sizePart.split("x").map(n => parseInt(n, 10))
    const patternIds = idsPart.split(" ").map(n => parseInt(n, 10))
    const layout: Layout = { width, height, patternIds }
    layouts.push(layout)
  }
  return { patterns, layouts }
}

// Check if a region can fit the given patterns with their counts
function checkRegion(
  presents: number[],
  region: { width: number; height: number; count: number[] },
  patternSizes: { width: number; height: number }[]
): number {
  const { width, height, count } = region
  // total filled cells
  let total = 0
  for (let i = 0; i < presents.length; ++i) {
    total += presents[i] * count[i]
  }
  if (total > width * height) return -1
  // Can we fit all patterns by tiling?
  let canTile = true
  let sumCount = 0
  for (let i = 0; i < count.length; ++i) {
    const size = patternSizes[i]
    if (!size) continue
    const { width: pw, height: ph } = size
    if (pw === 0 || ph === 0) continue
    if (Math.floor(width / pw) * Math.floor(height / ph) < count[i]) {
      canTile = false
      break
    }
    sumCount += count[i]
  }
  if (sumCount === 0) return 0
  if (canTile) return 1
  return 0
}

function part1(inputString: string) {
  const { patterns, layouts } = parseInput(inputString)
  // For each pattern, get filled count and size
  const presents: number[] = []
  const patternSizes: { width: number; height: number }[] = []
  for (const pattern of patterns) {
    let filled = 0
    for (const row of pattern.layout) {
      for (const cell of row) {
        if (cell === "#") filled++
      }
    }
    presents.push(filled)
    patternSizes.push({ width: pattern.layout[0].length, height: pattern.layout.length })
  }

  let count = 0
  for (const layout of layouts) {
    // patternIds is actually the counts for each pattern
    const countArr = layout.patternIds.slice(0, patterns.length)
    const region = { width: layout.width, height: layout.height, count: countArr }
    const result = checkRegion(presents, region, patternSizes)
    if (result === 1) {
      count++
    }
  }
  return count
}

function part2(inputString: string) {
  return "Well done! 🎉"
}

const EXAMPLE = `
0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 2,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
