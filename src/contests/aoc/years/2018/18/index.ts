import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 18

const OPEN_GROUND = "."
const TREE = "|"
const LUMBERYARD = "#"

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function tickGrid(grid: string[][]) {
  return utils.grid.map(grid, (cell, x, y) => {
    const position = new Vector2(x, y)
    let counters = {
      openGround: 0,
      trees: 0,
      LUMBERYARD: 0,
    }
    for (const neighbor of position.neighbors()) {
      const neighborCell = utils.grid.at(grid, neighbor)
      if (neighborCell === OPEN_GROUND) {
        counters.openGround++
      } else if (neighborCell === TREE) {
        counters.trees++
      } else if (neighborCell === LUMBERYARD) {
        counters.LUMBERYARD++
      }
    }
    if (cell === OPEN_GROUND) {
      if (counters.trees >= 3) {
        return TREE
      }
    } else if (cell === TREE) {
      if (counters.LUMBERYARD >= 3) {
        return LUMBERYARD
      }
    } else if (cell === LUMBERYARD) {
      if (counters.LUMBERYARD >= 1 && counters.trees >= 1) {
        return LUMBERYARD
      }
      return OPEN_GROUND
    }
    return cell
  })
}

function severalTicksGrid(grid: string[][], ticks: number) {
  let currentGrid = grid
  const visited = new Map<string, number>()
  let lastCycle = false
  for (let i = 0; i < ticks; i++) {
    currentGrid = tickGrid(currentGrid)

    const key = currentGrid.flat().join("")
    if (!lastCycle && visited.has(key)) {
      const previousPosition = visited.get(key)!
      const cycleDuration = i - previousPosition
      const remainingCycles = Math.floor((ticks - i) / cycleDuration)
      i += cycleDuration * remainingCycles
      lastCycle = true
    }
    visited.set(key, i)
  }
  return currentGrid
}

function score(grid: string[][]) {
  const trees = utils.grid.findPositions(grid, c => c === TREE).length
  const lumberyards = utils.grid.findPositions(grid, c => c === LUMBERYARD).length
  return trees * lumberyards
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const finalGrid = severalTicksGrid(grid, 10)
  return score(finalGrid)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const finalGrid = severalTicksGrid(grid, 1_000_000_000)
  return score(finalGrid)
}

const EXAMPLE = `
.#.#...|#.
.....#|##|
.|..|...#.
..|#.....#
#.#|||#|#|
...#.||...
.|....|...
||...#|.#|
|.||||..|.
...#.|..|.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1147,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
