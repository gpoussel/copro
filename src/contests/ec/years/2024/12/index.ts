import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, Vector2Set } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 12

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const height = grid.length
  const width = grid[0].length
  const cannonColumn = grid[grid.length - 2].indexOf("A")
  const targetPositions = utils.grid.findPositions(grid, cell => cell === "T" || cell === "H")
  return { grid, height, width, cannonColumn, targetPositions }
}

function findReachablePositions(input: ReturnType<typeof parseInput>) {
  const bestScore = new Map<string, [Vector2, number]>()
  for (let i = 0; i < 3; ++i) {
    const reachableTargets = new Map<number, Vector2Set>()
    const cannonPosition = new Vector2(input.cannonColumn, input.height - 2 - i)
    for (let power = 1; power <= input.width; ++power) {
      const reachableAtPower = new Vector2Set()
      let currentPosition = cannonPosition
      let levelOutOfBounds = false
      for (let j = 0; !levelOutOfBounds && j < power; ++j) {
        currentPosition = currentPosition.move("up-right", 1)
        if ((utils.grid.at(input.grid, currentPosition) || ".") !== "." || currentPosition.y >= input.height - 1) {
          levelOutOfBounds = true
        }
        reachableAtPower.add(currentPosition)
      }
      for (let j = 0; !levelOutOfBounds && j < power; ++j) {
        currentPosition = currentPosition.move("right", 1)
        if ((utils.grid.at(input.grid, currentPosition) || ".") !== "." || currentPosition.y >= input.height - 1) {
          levelOutOfBounds = true
        }
        reachableAtPower.add(currentPosition)
      }
      for (let j = 0; !levelOutOfBounds; ++j) {
        currentPosition = currentPosition.move("down-right", 1)
        if ((utils.grid.at(input.grid, currentPosition) || ".") !== "." || currentPosition.y >= input.height - 1) {
          levelOutOfBounds = true
        }
        reachableAtPower.add(currentPosition)
      }
      reachableTargets.set(power, reachableAtPower)
    }
    for (let power = 1; power < reachableTargets.size; ++power) {
      const targets = reachableTargets.get(power)!
      targets.forEach(target => {
        const key = target.str()
        const score = power * (i + 1)
        if (!bestScore.has(key) || score < bestScore.get(key)![1]) {
          bestScore.set(key, [target, score])
        }
      })
    }
  }
  return bestScore
}

function getSumOfCost(input: ReturnType<typeof parseInput>) {
  const sortedTargetPositions = input.targetPositions
    .sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y
      return a.x - b.x
    })
    .map(Vector2.fromCoordinates)
  let workingGrid = utils.grid.clone(input.grid)
  let sumOfCost = 0
  for (let i = 0; i < sortedTargetPositions.length; ++i) {
    const reachablePositions = findReachablePositions({ ...input, grid: workingGrid })
    const target = sortedTargetPositions[i]
    const key = target.str()
    if (!reachablePositions.has(key)) {
      return -1
    }
    const targetCell = utils.grid.at(workingGrid, target)
    const numberOfShoots = targetCell === "H" ? 2 : 1
    for (let j = 0; j < numberOfShoots; ++j) {
      sumOfCost += reachablePositions.get(key)![1]
    }
    workingGrid[target.y][target.x] = "."
  }
  return sumOfCost
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return getSumOfCost(input)
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  return
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
.............
.C...........
.B......T....
.A......T.T..
=============`,
        expected: 13,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
.............
.C...........
.B......H....
.A......T.H..
=============`,
        expected: 22,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: ``,
        expected: undefined,
      },
    ],
  },
} as EverybodyCodesContest
