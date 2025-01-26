import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2020 - Day 17

const ACTIVE_CELL = "#" as const
const INACTIVE_CELL = "." as const
type Cell = typeof ACTIVE_CELL | typeof INACTIVE_CELL
type Grid = Cell[][]

function parseInput(input: string): Grid {
  return utils.input.readGrid(input).map(row => row.map(cell => cell as Cell))
}

function solve(initialGrid: Grid, dimension: 3 | 4) {
  let pocket = new Set<string>()
  let edits = new Set<string>()

  function newPosition() {
    return new Int8Array(dimension)
  }

  utils.grid.iterate(initialGrid, (cell, x, y) => {
    const pos = newPosition()
    pos[0] = x
    pos[1] = y
    if (cell === ACTIVE_CELL) {
      pocket.add(pos.toString())
      edits.add(pos.toString())
    }
  })
  const dimensions: [number, number][] = []
  for (let dim = 0; dim < dimension; dim++) {
    dimensions.push([0, 0])
  }

  function* neighbors(pos: Int8Array = newPosition(), dim = 0, zero = true): Generator<Int8Array, void> {
    if (dim === dimension) {
      if (!zero) {
        yield pos.slice()
      }
      return
    }
    const value = pos[dim]
    yield* neighbors(pos, dim + 1, zero)
    pos[dim] = value - 1
    yield* neighbors(pos, dim + 1, false)
    pos[dim] = value + 1
    yield* neighbors(pos, dim + 1, false)
    pos[dim] = value
  }

  const closeCells = [...neighbors()]

  function check(pos: Int8Array) {
    let activeNeighbors = 0
    for (const cc of closeCells) {
      for (let d = 0; d < dimension; ++d) {
        pos[d] += cc[d]
      }
      const active = pocket.has(pos.toString())
      for (let d = 0; d < dimension; ++d) {
        pos[d] -= cc[d]
      }
      if (active) {
        activeNeighbors++
      }
      if (activeNeighbors > 3) {
        break
      }
    }

    const key = pos.join(",")
    const isActive = pocket.has(key)
    if (isActive) {
      if (activeNeighbors == 2 || activeNeighbors == 3) {
        edits.add(key)
      } else {
        edits.delete(key)
      }
    } else {
      if (activeNeighbors == 3) {
        edits.add(key)
      } else {
        edits.delete(key)
      }
    }
  }

  function loop(dim = 0, pos = newPosition()) {
    for (let d = dimensions[dim][0] - 1; d <= dimensions[dim][1] + 1; d++) {
      pos[dim] = d
      if (dim < dimension - 1) {
        loop(dim + 1, pos)
      } else if (dim == dimension - 1) {
        check(pos)
      }
    }
  }

  function expand() {
    for (const dd of dimensions) {
      dd[0] = 0
      dd[1] = 0
    }
    for (const key of pocket) {
      const pos = key.split(",").map(x => +x)
      for (let d = 0; d < dimension; d++) {
        if (pos[d] < dimensions[d][0]) {
          dimensions[d][0] = pos[d]
        }
        if (pos[d] > dimensions[d][1]) {
          dimensions[d][1] = pos[d]
        }
      }
    }
  }

  for (let cycle = 0; cycle < 6; cycle++) {
    edits = new Set<string>()
    expand()
    loop()
    pocket = edits
  }

  return pocket.size
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return solve(grid, 3)
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  return solve(grid, 4)
}

const EXAMPLE = `
.#.
..#
###`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 112,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 848,
      },
    ],
  },
} as AdventOfCodeContest
