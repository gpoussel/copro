import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 23

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [_, x, y, z, r] = line.match(/pos=<(-?\d+),(-?\d+),(-?\d+)>, r=(\d+)/) as RegExpMatchArray
    return { position: new Vector3(+x, +y, +z), radius: +r }
  })
}

function part1(inputString: string) {
  const robots = parseInput(inputString)
  const strongestRobot = utils.iterate.maxBy(robots, robot => robot.radius)!
  return robots.filter(robot => robot.position.manhattanDistance(strongestRobot.position) <= strongestRobot.radius)
    .length
}

function part2(inputString: string) {
  const robots = parseInput(inputString)
  const minDimensional = robots.reduce(
    (min, robot) =>
      new Vector3(
        Math.min(min.x, robot.position.x),
        Math.min(min.y, robot.position.y),
        Math.min(min.z, robot.position.z)
      ),
    new Vector3(Infinity, Infinity, Infinity)
  )
  const maxDimensional = robots.reduce(
    (max, robot) =>
      new Vector3(
        Math.max(max.x, robot.position.x),
        Math.max(max.y, robot.position.y),
        Math.max(max.z, robot.position.z)
      ),
    new Vector3(-Infinity, -Infinity, -Infinity)
  )
  const maxDimension = Math.max(
    maxDimensional.x - minDimensional.x,
    maxDimensional.y - minDimensional.y,
    maxDimensional.z - minDimensional.z
  )
  const loopReduction = 10
  let factor = new Vector3(
    Math.ceil((maxDimensional.x - minDimensional.x) / loopReduction),
    Math.ceil((maxDimensional.y - minDimensional.y) / loopReduction),
    Math.ceil((maxDimensional.z - minDimensional.z) / loopReduction)
  )
  let start = minDimensional
  let end = maxDimensional
  while (factor.x >= 1 || factor.y >= 1 || factor.z >= 1) {
    let largestPosition = {
      position: new Vector3(0, 0, 0),
      robotsInRange: 0,
    }
    for (let i = start.x; i <= end.x; i += factor.x) {
      for (let j = start.y; j <= end.y; j += factor.y) {
        for (let k = start.z; k <= end.z; k += factor.z) {
          const position = new Vector3(i, j, k)
          const robotsInRange = robots.filter(robot => robot.position.manhattanDistance(position) <= robot.radius)
          if (robotsInRange.length > largestPosition.robotsInRange) {
            largestPosition = { position, robotsInRange: robotsInRange.length }
          }
        }
      }
    }

    start = largestPosition.position.subtract(factor)
    end = largestPosition.position.add(factor)

    if (factor.x === 1 && factor.y === 1 && factor.z === 1) {
      return largestPosition.position.manhattanDistance(new Vector3(0, 0, 0))
    }

    factor = new Vector3(
      Math.max(1, Math.ceil(factor.x / loopReduction)),
      Math.max(1, Math.ceil(factor.y / loopReduction)),
      Math.max(1, Math.ceil(factor.z / loopReduction))
    )
  }
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
pos=<0,0,0>, r=4
pos=<1,0,0>, r=1
pos=<4,0,0>, r=3
pos=<0,2,0>, r=1
pos=<0,5,0>, r=3
pos=<0,0,3>, r=1
pos=<1,1,1>, r=1
pos=<1,1,2>, r=1
pos=<1,3,1>, r=1`,
        expected: 7,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
pos=<10,12,12>, r=2
pos=<12,14,12>, r=2
pos=<16,12,12>, r=4
pos=<14,14,14>, r=6
pos=<50,50,50>, r=200
pos=<10,10,10>, r=5`,
        expected: 36,
      },
    ],
  },
} as AdventOfCodeContest
