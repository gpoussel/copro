import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { DIRECTION_CHARS, fromDirectionChar } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 17

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function isScaffoldCharacter(c: string) {
  return c === "#" || isRobotCharacter(c)
}

function isRobotCharacter(c: string) {
  return ["^", "v", "<", ">"].includes(c)
}

function getGrid(program: number[]) {
  const computer = new Computer(program, [])
  computer.runUntilHalt()
  const grid = computer.outputs
    .map(n => String.fromCharCode(n))
    .join("")
    .split("\n")
    .map(row => row.split(""))
  return grid
}

function toAscii(input: string) {
  return input.split("").map(c => c.charCodeAt(0))
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const grid = getGrid(program)
  const scaffoldPositions = utils.grid.findPositions(grid, isScaffoldCharacter)
  const scaffoldKeys = new Set(scaffoldPositions.map(p => p.str()))
  return scaffoldPositions
    .filter(scaffoldPosition => scaffoldPosition.plusShapeNeighbors().every(n => scaffoldKeys.has(n.str())))
    .map(p => p.x * p.y)
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const grid = getGrid(program)
  console.log(utils.grid.build(grid))
  const pathParts = []
  let robotPosition = utils.grid.findPositions(grid, isRobotCharacter)[0]
  let direction = fromDirectionChar(utils.grid.at(grid, robotPosition))
  let endReached = false

  function cellAt(position: Vector2) {
    return utils.grid.at(grid, position) || " "
  }

  while (!endReached) {
    if (cellAt(robotPosition.move(direction)) !== "#") {
      // Can't go straight: turn left or right
      let turnRightDirection = utils.grid.nextDirClockwise(direction)
      let turnLeftDirection = utils.grid.nextDirCounterClockwise(direction)
      if (utils.grid.at(grid, robotPosition.move(turnRightDirection)) === "#") {
        direction = turnRightDirection
        pathParts.push("R")
      } else if (utils.grid.at(grid, robotPosition.move(turnLeftDirection)) === "#") {
        direction = turnLeftDirection
        pathParts.push("L")
      } else {
        endReached = true
        continue
      }
    } else {
      let steps = 0
      while (cellAt(robotPosition.move(direction)) === "#") {
        steps++
        robotPosition = robotPosition.move(direction)
      }
      if (steps === 0) {
        throw new Error(`No steps taken at ${robotPosition}`)
      }
      pathParts.push(steps.toString())
    }
  }

  const path = pathParts.join(",")

  const matcher = `${path},`.match(/^(.{1,20})\1*(.{1,20})(?:\1|\2)*(.{1,20})(?:\1|\2|\3)*$/)
  if (!matcher) {
    throw new Error()
  }
  const a = matcher[1].slice(0, -1)
  const b = matcher[2].slice(0, -1)
  const c = matcher[3].slice(0, -1)
  const finalPath = path
    .replace(new RegExp(a, "g"), "A")
    .replace(new RegExp(b, "g"), "B")
    .replace(new RegExp(c, "g"), "C")

  const inputs = [...toAscii([finalPath, a, b, c, "n"].join("\n")), 10]
  const runningProgram = [...program]
  runningProgram[0] = 2
  const computer = new Computer(runningProgram, inputs)
  computer.runUntilHalt()
  return computer.outputs.pop()
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
