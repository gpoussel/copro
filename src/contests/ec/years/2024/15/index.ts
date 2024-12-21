import { EverybodyCodesContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 15

function findStartPosition(grid: string[][]) {
  const startPoint = grid[0].indexOf(".")
  return new Vector2(startPoint, 0)
}

function findAllHerbs(grid: string[][]) {
  const herbs = utils.grid
    .findPositions(grid, c => !["#", "~", "."].includes(c))
    .map(Vector2.fromCoordinates)
    .map(p => utils.grid.at(grid, p))
  const uniqueHerbs = Array.from(new Set(herbs))
  return uniqueHerbs
}

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const startPosition = findStartPosition(grid)
  return {
    grid,
    startPosition,
  }
}

function solve(input: ReturnType<typeof parseInput>, endPosition: Vector2, herbsToCollect: string[]) {
  const { grid, startPosition } = input

  interface Node {
    position: Vector2
    herbs: string[]
  }

  const result = breadthFirstSearch<Node>(
    { position: startPosition, herbs: [] },
    {
      adjacents(node) {
        const { position, herbs } = node
        const adjacentNodes = []
        for (const neighbor of position.plusShapeNeighbors()) {
          const neighborCell = utils.grid.at(grid, neighbor) || "#"
          if (neighborCell === "#" || neighborCell === "~") continue
          if (herbsToCollect.includes(neighborCell) && !herbs.includes(neighborCell)) {
            const adjacentHerbs = [...herbs, neighborCell].sort()
            adjacentNodes.push({ position: neighbor, herbs: adjacentHerbs })
          } else {
            adjacentNodes.push({ position: neighbor, herbs })
          }
        }
        return adjacentNodes
      },
      key(node) {
        return `${node.position.str()} ${node.herbs.join("")}`
      },
      ends(node: Node) {
        return node.herbs.length === herbsToCollect.length && node.position.equals(endPosition)
      },
    }
  )
  return result
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, input.startPosition, findAllHerbs(input.grid))?.distance
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  const input = parseInput(inputString)

  // Find the separation column (that splits the entire area in three regions)
  const height = input.grid.length
  const splitColumns = []
  for (let i = 1; i < input.grid[0].length - 2; i++) {
    let j = 0
    while (j < input.grid.length && (input.grid[j][i] === "#" || input.grid[j][i + 1] === "#")) {
      j++
    }
    if (j >= height - 2) {
      splitColumns.push(i)
    }
  }

  if (splitColumns.length !== 2) {
    throw new Error("Could not find the separation columns")
  }
  const [middleLeft, middleRight] = splitColumns

  // We know that we will have to go to all regions, so we can just do the three parts separately
  // First, do the middle region, the end position is the start position for the left position
  const middleGrid = input.grid.map(row => row.slice(middleLeft, middleRight + 2))
  const startPointForMiddleGrid = findStartPosition(middleGrid)
  const leftPointForMiddleGrid = new Vector2(1, middleGrid.length - 2)
  utils.grid.set(middleGrid, leftPointForMiddleGrid, "<")
  const rightPointForMiddleGrid = new Vector2(middleGrid[0].length - 2, middleGrid.length - 2)
  utils.grid.set(middleGrid, rightPointForMiddleGrid, ">")

  const middleResult = solve(
    { grid: middleGrid, startPosition: startPointForMiddleGrid },
    startPointForMiddleGrid,
    findAllHerbs(middleGrid)
  )
  if (!middleResult) {
    throw new Error()
  }
  const { distance: middleDistance, path: middlePath } = middleResult
  const middleHerbs = middlePath[middlePath.length - 1].herbs

  const leftGrid = input.grid.map(row => row.slice(0, middleLeft + 2))
  const startPointForLeftGrid = new Vector2(leftGrid[0].length - 1, leftGrid.length - 2)
  const leftResult = solve(
    { grid: leftGrid, startPosition: startPointForLeftGrid },
    startPointForLeftGrid,
    utils.iterate.differenceBy(findAllHerbs(leftGrid), middleHerbs, v => v)
  )
  if (!leftResult) {
    throw new Error()
  }
  const { distance: leftDistance, path: leftPath } = leftResult
  const leftHerbs = leftPath[leftPath.length - 1].herbs

  const herbsCollectedLeftMiddle = utils.iterate.union(middleHerbs, leftHerbs)

  const rightGrid = input.grid.map(row => row.slice(middleRight))
  const startPointForRightGrid = new Vector2(0, rightGrid.length - 2)
  const rightResult = solve(
    { grid: rightGrid, startPosition: startPointForRightGrid },
    startPointForRightGrid,
    utils.iterate.differenceBy(findAllHerbs(rightGrid), herbsCollectedLeftMiddle, v => v)
  )
  if (!rightResult) {
    throw new Error()
  }
  const { distance: rightDistance } = rightResult
  return middleDistance + leftDistance + rightDistance
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
#####.#####
#.........#
#.######.##
#.........#
###.#.#####
#H.......H#
###########`,
        expected: 26,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
##########.##########
#...................#
#.###.##.###.##.#.#.#
#..A#.#..~~~....#A#.#
#.#...#.~~~~~...#.#.#
#.#.#.#.~~~~~.#.#.#.#
#...#.#.B~~~B.#.#...#
#...#....BBB..#....##
#C............#....C#
#####################`,
        expected: 38,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
