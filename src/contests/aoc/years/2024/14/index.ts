import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 14

function parseInput(input: string) {
  return utils.input.regexLines(input, /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/).map(match => ({
    position: new Vector2(parseInt(match[1]), parseInt(match[2])),
    velocity: new Vector2(parseInt(match[3]), parseInt(match[4])),
  }))
}

function getGridSize(robotsLength: number) {
  if (robotsLength === 12) {
    return new Vector2(11, 7)
  }
  return new Vector2(101, 103)
}

function advance(gridSize: Vector2, robot: { position: Vector2; velocity: Vector2 }, seconds: number) {
  return {
    position: robot.position.add(robot.velocity.multiply(seconds)).modulo(gridSize),
    velocity: robot.velocity,
  }
}

function getQuadrant(position: Vector2, gridSize: Vector2) {
  const middle = new Vector2((gridSize.x - 1) / 2, (gridSize.y - 1) / 2)
  if (position.x < middle.x && position.y < middle.y) {
    return 1
  }
  if (position.x > middle.x && position.y < middle.y) {
    return 2
  }
  if (position.x < middle.x && position.y > middle.y) {
    return 3
  }
  if (position.x > middle.x && position.y > middle.y) {
    return 4
  }
  return 0
}

function buildGrid(positions: Vector2[], gridSize: Vector2) {
  const grid = Array.from({ length: gridSize.x }, () => Array.from({ length: gridSize.y }, () => "."))
  positions.forEach(position => {
    grid[position.x][position.y] = "#"
  })
  return utils.grid.build(grid)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const gridSize = getGridSize(input.length)
  const quadrantCount = utils.iterate.countBy(
    input.map(robot => advance(gridSize, robot, 100)),
    robot => getQuadrant(robot.position, gridSize)
  )
  return (
    (quadrantCount.get(1) || 1) *
    (quadrantCount.get(2) || 1) *
    (quadrantCount.get(3) || 1) *
    (quadrantCount.get(4) || 1)
  )
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const gridSize = getGridSize(input.length)
  let found = false
  let seconds = 1
  let robots = input
  while (!found) {
    robots = robots.map(robot => advance(gridSize, robot, 1))
    const grid = buildGrid(
      robots.map(robot => robot.position),
      gridSize
    )
    if (grid.match(/#{20}/g)) {
      return seconds
    }

    ++seconds
    utils.log.logEvery(seconds, 1000)
  }
  return
}

const EXAMPLE = `
p=0,4 v=3,-3
p=6,3 v=-1,-3
p=10,3 v=-1,2
p=2,0 v=2,-1
p=0,0 v=1,3
p=3,0 v=-2,-2
p=7,6 v=-1,-3
p=3,0 v=-1,-2
p=9,3 v=2,3
p=7,3 v=-1,2
p=2,4 v=2,-3
p=9,5 v=-3,-3
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 12,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
