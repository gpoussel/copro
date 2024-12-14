import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { VISITED } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, Vector2Set } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 6

const WALL = "#"

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const guardPosition = utils.grid.find(grid, cell =>
    (Object.values(utils.grid.DIRECTION_CHARS) as string[]).includes(cell)
  )
  if (!guardPosition) {
    throw new Error("Guard position not found")
  }
  return {
    grid,
    guardPosition: new Vector2(guardPosition.x, guardPosition.y),
  }
}

function visit(
  grid: string[][],
  originalGuardPosition: Vector2,
  checkForCycles = false
): { loop: boolean; steps: number; obstaclesThatCreateCycles: Vector2Set } {
  const visits = Array.from({ length: grid.length }, () =>
    Array.from({ length: grid[0].length }, () => ({
      left: false,
      right: false,
      up: false,
      down: false,
    }))
  )
  const gridCopy = utils.grid.clone(grid)
  let guardPosition = originalGuardPosition
  let guardDirection = utils.grid.fromDirectionChar(utils.grid.at(grid, guardPosition))
  let canMove = true
  let steps = 0
  const obstaclesThatCreateCycles = new Vector2Set()
  let loop = false

  while (canMove) {
    if (!utils.grid.inBounds(grid, guardPosition)) {
      break
    }
    if (visits[guardPosition.y][guardPosition.x][guardDirection]) {
      loop = true
      break
    }
    const nextPosition = guardPosition.move(guardDirection)
    if (utils.grid.at(gridCopy, nextPosition) === WALL) {
      guardDirection =
        utils.grid.DIRECTIONS[(utils.grid.DIRECTIONS.indexOf(guardDirection) + 1) % utils.grid.DIRECTIONS.length]
      utils.grid.set(gridCopy, guardPosition, utils.grid.DIRECTION_CHARS[guardDirection])
    } else {
      visits[guardPosition.y][guardPosition.x][guardDirection] = true
      if (
        checkForCycles &&
        !obstaclesThatCreateCycles.contains(nextPosition) &&
        !nextPosition.equals(originalGuardPosition)
      ) {
        const gridClone = utils.grid.clone(grid)
        utils.grid.set(gridClone, nextPosition, WALL)
        const pathIfObstacle = visit(gridClone, originalGuardPosition)
        if (pathIfObstacle.loop) {
          obstaclesThatCreateCycles.add(nextPosition)
        }
      }
      if (utils.grid.at(gridCopy, nextPosition) !== VISITED) {
        steps++
      }
      utils.grid.set(gridCopy, guardPosition, VISITED)
      guardPosition = nextPosition
    }
  }
  return {
    loop,
    steps,
    obstaclesThatCreateCycles,
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return visit(input.grid, input.guardPosition).steps
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return visit(input.grid, input.guardPosition, true).obstaclesThatCreateCycles.length
}

const EXAMPLE = `
....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 41,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 6,
      },
    ],
  },
} as AdventOfCodeContest
