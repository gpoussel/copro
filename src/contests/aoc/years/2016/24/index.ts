import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGrid } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2016 - Day 24

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function findNumberPositions(grid: string[][]) {
  const numberPositions = new Map<number, Vector2>()
  utils.grid.map(grid, (cell, x, y) => {
    if (/\d/.test(cell)) {
      numberPositions.set(Number(cell), new Vector2(x, y))
    }
  })
  return numberPositions
}

function findShortestPath(grid: string[][], initial: Vector2, goal: string) {
  const result = dijkstraOnGrid(grid, {
    starts: [initial],
    ends: position => {
      return utils.grid.at(grid, position) === goal
    },
    isMoveValid: (_from, to) => to !== "#",
    moveCost: 1,
    stopOnFirst: true,
    stopIfScameScore: true,
  })

  return result.bestScore
}

function solve(inputString: string, loop: boolean) {
  const grid = parseInput(inputString)
  const numberPositions = findNumberPositions(grid)
  if (!numberPositions.has(0)) {
    throw new Error("No starting position found")
  }

  const edges: {
    start: number
    end: number
    distance: number
  }[] = []

  const numbersToReach = [...numberPositions.keys()]
  for (let i = 0; i < numbersToReach.length - 1; ++i) {
    const startNumber = numbersToReach[i]
    for (let j = i + 1; j < numbersToReach.length; ++j) {
      const nextNumber = numbersToReach[j]
      const steps = findShortestPath(grid, numberPositions.get(startNumber)!, String(nextNumber))
      edges.push({
        start: startNumber,
        end: nextNumber,
        distance: steps,
      })
    }
  }

  const allPaths = utils.iterate.permutations(numbersToReach.slice(1)).map(permutation => {
    const path = [0, ...permutation, ...(loop ? [0] : [])]
    let distance = 0
    for (let i = 0; i < path.length - 1; ++i) {
      const edge = edges.find(
        e => (e.start === path[i] && e.end === path[i + 1]) || (e.start === path[i + 1] && e.end === path[i])
      )
      if (!edge) {
        throw new Error(`No edge found from ${path[i]} to ${path[i + 1]}`)
      }
      distance += edge.distance
    }
    return { path, distance }
  })
  return Math.min(...allPaths.map(p => p.distance))
}

function part1(inputString: string) {
  return solve(inputString, false)
}

function part2(inputString: string) {
  return solve(inputString, true)
}

const EXAMPLE = `
###########
#0.1.....2#
#.#######.#
#4.......3#
###########`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 14,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: undefined,
      },
    ],
  },
} as AdventOfCodeContest
