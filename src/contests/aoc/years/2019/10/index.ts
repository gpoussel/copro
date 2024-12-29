import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2019 - Day 10

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function findBestPosition(grid: string[][]) {
  const asteroidPositions = utils.grid.findPositions(grid, cell => cell === "#")
  let bestPosition: { reachableCount: number; position: Vector2 } | undefined = undefined
  for (const asteroidPosition of asteroidPositions) {
    const angles = new Set<number>(asteroidPositions.map(otherAsteroid => asteroidPosition.angle(otherAsteroid)))
    if (!bestPosition || angles.size > bestPosition.reachableCount) {
      bestPosition = { position: asteroidPosition, reachableCount: angles.size }
    }
  }
  if (!bestPosition) {
    throw new Error("No best position found")
  }
  return bestPosition
}

function getReachableAsteroids(grid: string[][], position: Vector2) {
  const otherAsteroidPositions = utils.grid
    .findPositions(grid, cell => cell === "#")
    .filter(asteroidPosition => !asteroidPosition.equals(position))
  const asteroidsByAngles = utils.iterate.mapBy(otherAsteroidPositions, asteroidPosition =>
    position.angle(asteroidPosition)
  )
  const asteroids: Vector2[] = []
  let currentAngle = 0
  while (asteroidsByAngles.size > 0) {
    const sortedAngles = Array.from(asteroidsByAngles.keys()).sort()
    let nextAngle = sortedAngles.find(angle => angle >= currentAngle)
    if (nextAngle === undefined) {
      nextAngle = sortedAngles[0]
    }
    const asteroidsAtThisAngle = asteroidsByAngles.get(nextAngle)!
    if (asteroidsAtThisAngle.length === 0) {
      throw new Error("Element should have been removed")
    }
    const vaporizedAsteroid = utils.iterate.minBy(asteroidsAtThisAngle, asteroid =>
      position.manhattanDistance(asteroid)
    )
    asteroids.push(vaporizedAsteroid)
    const remainingAsteroidsAtThisAngle = asteroidsAtThisAngle.filter(asteroid => !asteroid.equals(vaporizedAsteroid))
    if (remainingAsteroidsAtThisAngle.length === 0) {
      asteroidsByAngles.delete(nextAngle)
    } else {
      asteroidsByAngles.set(nextAngle, remainingAsteroidsAtThisAngle)
    }
    currentAngle = nextAngle + 1e-6
  }
  return asteroids
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  return findBestPosition(grid).reachableCount
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const { position } = findBestPosition(input)
  const reachableAsteroids = getReachableAsteroids(input, position)
  const twoHundredthAsteroid = reachableAsteroids[199]
  return twoHundredthAsteroid.x * 100 + twoHundredthAsteroid.y
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
.#..#
.....
#####
....#
...##`,
        expected: 8,
      },
      {
        input: `
......#.#.
#..#.#....
..#######.
.#.#.###..
.#..#.....
..#....#.#
#..#....#.
.##.#..###
##...#..#.
.#....####`,
        expected: 33,
      },
      {
        input: `
#.#...#.#.
.###....#.
.#....#...
##.#.#.#.#
....#.#.#.
.##..###.#
..#...##..
..##....##
......#...
.####.###.`,
        expected: 35,
      },
      {
        input: `
.#..#..###
####.###.#
....###.#.
..###.##.#
##.##.#.#.
....###..#
..#.#..#.#
#..#.#.###
.##...##.#
.....#.#..`,
        expected: 41,
      },
      {
        input: `
.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`,
        expected: 210,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`,
        expected: 802,
      },
    ],
  },
} as AdventOfCodeContest
