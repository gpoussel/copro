import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction, nextDirClockwise, nextDirCounterClockwise } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 11

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function simulatePainting(program: number[], startingColor: number) {
  let facingDirection: Direction = "up"
  const computer = new Computer(program, [])
  const paintedPanels = new Map<string, number>()
  let position = new Vector2(0, 0)
  paintedPanels.set(position.str(), startingColor)
  while (true) {
    computer.inputs.push(paintedPanels.get(position.str()) ?? 0)
    computer.run()
    const color = computer.outputs.shift()!
    computer.run()
    const turn = computer.outputs.shift()!
    paintedPanels.set(position.str(), color)
    if (turn === 0) {
      facingDirection = nextDirCounterClockwise(facingDirection)
    } else {
      facingDirection = nextDirClockwise(facingDirection)
    }
    position = position.move(facingDirection)
    if (computer.halted) {
      break
    }
  }
  return paintedPanels
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const paintedPanels = simulatePainting(program, 0)
  return paintedPanels.size
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const paintedPanels = simulatePainting(program, 1)
  const positions = Array.from(paintedPanels.keys()).map(Vector2.fromKey)
  const topLeftPosition = positions.reduce(
    (min, pos) => new Vector2(Math.min(min.x, pos.x), Math.min(min.y, pos.y)),
    new Vector2(Infinity, Infinity)
  )
  const bottomRightPosition = positions.reduce(
    (max, pos) => new Vector2(Math.max(max.x, pos.x), Math.max(max.y, pos.y)),
    new Vector2(-Infinity, -Infinity)
  )
  const width = bottomRightPosition.x - topLeftPosition.x + 1
  const height = bottomRightPosition.y - topLeftPosition.y + 1
  if (height !== 6) {
    throw new Error(`Unexpected height: ${height}`)
  }
  const grid = utils.grid.create(width, height, ".")
  for (const [key, value] of paintedPanels.entries()) {
    const pos = Vector2.fromKey(key).subtract(topLeftPosition)
    const colorChar = value === 1 ? "#" : "."
    utils.grid.set(grid, pos, colorChar)
  }
  const columns = utils.grid.columns(grid)
  let startingColumn = 0
  while (columns[startingColumn].every(cell => cell === ".")) {
    startingColumn++
  }
  let endColumn = columns.length
  while (columns[endColumn - 1].every(cell => cell === ".")) {
    endColumn--
  }
  const trimmedGrid = grid.map(row => row.slice(startingColumn, endColumn + 1))
  if (trimmedGrid[0].length % 5 !== 0) {
    throw new Error(`Unexpected width: ${trimmedGrid[0].length}`)
  }
  const letters = Array.from({ length: trimmedGrid[0].length / 5 }, (_, letterIndex) =>
    Array.from({ length: 6 }, (_, row) => trimmedGrid[row].slice(letterIndex * 5, (letterIndex + 1) * 5).join(""))
  )
  return utils.ocr.recognizeWord(letters)
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
