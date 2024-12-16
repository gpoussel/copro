import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 13

const START_SYMBOL = "S"
const END_SYMBOL = "E"
const WALL_SYMBOL = "#"

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const startPositions = utils.grid
    .findPositions(input, c => c === START_SYMBOL)
    .map(position => ({
      position: Vector2.fromCoordinates(position),
      height: 0,
    }))
  const endPosition = {
    position: Vector2.fromCoordinates(utils.grid.findPositions(input, c => c === END_SYMBOL)[0]),
    height: 0,
  }
  startPositions.forEach(startPosition => {
    input[startPosition.position.y][startPosition.position.x] = "0"
  })
  input[endPosition.position.y][endPosition.position.x] = "0"

  function distanceModulo(a: number, b: number) {
    return Math.min(Math.abs(a - b), Math.abs(a - b + 10), Math.abs(a - b - 10))
  }
  const { bestScore } = utils.algo.dijkstraOnGraph<{ position: Vector2; height: number }>(
    startPositions,
    [endPosition],
    {
      key(node) {
        return `${node.position.str()}#${node.height}`
      },
      equals(a, b) {
        return a.position.equals(b.position) && a.height === b.height
      },
      moves(node, path) {
        const neighbors = node.position.plusShapeNeighbors()
        return neighbors
          .filter(neighbor => (utils.grid.at(input, neighbor) || WALL_SYMBOL) !== WALL_SYMBOL)
          .filter(neighbor => !path.some(p => p.position.equals(neighbor)))
          .map(neighborPosition => {
            const neighborHeight = parseInt(utils.grid.at(input, neighborPosition))
            return {
              to: { position: neighborPosition, height: parseInt(utils.grid.at(input, neighborPosition)) },
              cost: 1 + distanceModulo(node.height, neighborHeight),
            }
          })
      },
    }
  )
  return bestScore
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  return part1(inputString)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
#######
#6769##
S50505E
#97434#
#######`,
        expected: 28,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
SSSSSSSSSSS
S674345621S
S###6#4#18S
S53#6#4532S
S5450E0485S
S##7154532S
S2##314#18S
S971595#34S
SSSSSSSSSSS`,
        expected: 14,
      },
    ],
  },
} as EverybodyCodesContest
