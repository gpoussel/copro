import { EverybodyCodesContest } from "../../../../../types/contest.js"
import { Heading } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 19

function parseInput(input: string) {
  const [instructionBlock, gridBlock] = utils.input.blocks(input)
  const instructions = utils.input.firstLine(instructionBlock).split("")
  const grid = utils.input.readGrid(gridBlock)
  return { instructions, grid }
}

function rotate(instructions: string[], grid: string[][], count: number) {
  const coordinateGrid = utils.grid.map(grid, (cell, x, y) => Vector2.fromCoordinates({ x, y }))
  let counter = 0
  for (let i = 1; i < coordinateGrid.length - 1; i++) {
    for (let j = 1; j < coordinateGrid[i].length - 1; j++) {
      const position = new Vector2(j, i)
      const neighborDirections: Heading[] = [
        "up-left",
        "up",
        "up-right",
        "right",
        "down-right",
        "down",
        "down-left",
        "left",
      ]
      if (instructions[counter % instructions.length] === "R") {
        neighborDirections.reverse()
      }
      const neighborPositions = neighborDirections.map(direction => position.move(direction))
      for (let i = 0; i < neighborPositions.length - 1; i++) {
        const neighbor = neighborPositions[i]
        const nextNeighbor = neighborPositions[(i + 1) % neighborPositions.length]
        utils.grid.swap(coordinateGrid, neighbor, nextNeighbor)
      }
      ++counter
    }
  }

  const paths = []
  const visited = new VectorSet<Vector2>()

  for (let i = 1; i < coordinateGrid.length - 1; i++) {
    for (let j = 1; j < coordinateGrid[i].length - 1; j++) {
      const startPosition = new Vector2(j, i)
      if (visited.contains(startPosition)) {
        continue
      }
      const path = []
      let currentPosition = startPosition
      while (!visited.contains(currentPosition)) {
        visited.add(currentPosition)
        path.push(currentPosition)
        currentPosition = utils.grid.at(coordinateGrid, currentPosition)
      }
      paths.push(path)
    }
  }

  const finalGrid = utils.grid.map(grid, () => "")
  for (const path of paths) {
    for (let i = 0; i < path.length - 1; i++) {
      const position = path[(i + count) % path.length]
      utils.grid.set(finalGrid, path[i], grid[position.y][position.x])
    }
  }

  return getResponse(finalGrid)
}

function getResponse(grid: string[][]) {
  return utils.grid.build(grid).match(/>([^<]+)</)?.[1]
}

function part1(inputString: string) {
  const { instructions, grid } = parseInput(inputString)
  return rotate(instructions, grid, 1)
}

function part2(inputString: string) {
  const { instructions, grid } = parseInput(inputString)
  return rotate(instructions, grid, 100)
}

function part3(inputString: string) {
  const { instructions, grid } = parseInput(inputString)
  return rotate(instructions, grid, 1048576000)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
LR

>-IN-
-----
W---<`,
        expected: "WIN",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
RRLL

A.VI..>...T
.CC...<...O
.....EIB.R.
.DHB...YF..
.....F..G..
D.H........`,
        expected: "VICTORY",
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
