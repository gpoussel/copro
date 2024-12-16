import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 10

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function iterateHiking(grid: string[][]) {
  return utils.grid
    .iterate(grid, (cell, x, y) => {
      if (cell !== "0") {
        return undefined
      }
      let currentDigit = 0
      let paths = [{ nodes: [new Vector2(x, y)] }]
      while (currentDigit !== 9) {
        paths = paths.flatMap(path =>
          path.nodes[path.nodes.length - 1]
            .plusShapeNeighbors()
            .filter(neighbor => {
              return utils.grid.at(grid, neighbor) === `${currentDigit + 1}`
            })
            .map(neighbor => ({
              nodes: [...path.nodes, neighbor],
            }))
        )
        currentDigit++
      }
      const uniqueLocations = new VectorSet<Vector2>(paths.map(path => path.nodes[path.nodes.length - 1]))
      const uniquePaths = new Set(paths.map(path => path.nodes.map(pos => `${pos.x},${pos.y}`).join("-")))
      return {
        trailhead: uniqueLocations.length,
        paths: uniquePaths.size,
      }
    })
    .filter(result => result !== undefined)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return iterateHiking(input)
    .map(hike => hike.trailhead)
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return iterateHiking(input)
    .map(hike => hike.paths)
    .reduce((a, b) => a + b, 0)
}

const EXAMPLE1 = `
10..9..
2...8..
3...7..
4567654
...8..3
...9..2
.....01
`

const EXAMPLE2 = `
89010123
78121874
87430965
96549874
45678903
32019012
01329801
10456732
`

const EXAMPLE3 = `
..90..9
...1.98
...2..7
6543456
765.987
876....
987....
`

const EXAMPLE4 = `
012345
123456
234567
345678
4.6789
56789.
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 3,
      },
      {
        input: EXAMPLE2,
        expected: 36,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE3,
        expected: 13,
      },
      {
        input: EXAMPLE4,
        expected: 227,
      },
      {
        input: EXAMPLE2,
        expected: 81,
      },
    ],
  },
} as AdventOfCodeContest
