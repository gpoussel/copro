import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 18

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const entrances = [0, grid[0].length - 1].flatMap(entranceCol => {
    const entranceRow = grid.findIndex(row => row[entranceCol] === ".")
    if (entranceRow === -1) {
      return []
    }
    return [new Vector2(entranceCol, entranceRow)]
  })
  const treePositions = utils.grid.findPositions(grid, cell => cell === "P").map(Vector2.fromCoordinates)
  return { grid, entrances, treePositions }
}

function solve(grid: string[][], treePositions: Vector2[], entrances: Vector2[]) {
  const treeCount = treePositions.length
  entrances.forEach(entrance => utils.grid.set(grid, entrance, "~"))
  const reachedTrees = []
  let nextFilledNodes = [...entrances]
  let steps = 0
  while (reachedTrees.length < treeCount) {
    const nextNodes = nextFilledNodes.flatMap(node => {
      const neighbors = node.plusShapeNeighbors()
      return neighbors.filter(neighbor => {
        return !["#", "~"].includes(utils.grid.at(grid, neighbor) || "#")
      })
    })
    nextNodes
      .filter(node => utils.grid.at(grid, node) === "P")
      .forEach(node => {
        reachedTrees.push(node)
      })
    nextNodes.forEach(node => {
      utils.grid.set(grid, node, "~")
    })
    nextFilledNodes = nextNodes
    steps++
  }
  return steps
}

function part1(inputString: string) {
  const { grid, entrances, treePositions } = parseInput(inputString)
  return solve(grid, treePositions, entrances)
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  const { grid, entrances, treePositions } = parseInput(inputString)
  const distances = new Map<string, number>()
  for (const treePosition of treePositions) {
    const visited = new Set<string>()
    const queue = [{ pos: treePosition, distance: 0 }]

    while (queue.length > 0) {
      const { pos, distance } = queue.shift()!
      const nextNodes = pos
        .plusShapeNeighbors()
        .filter(neighbor => {
          return (utils.grid.at(grid, neighbor) || "#") !== "#"
        })
        .filter(neighbor => !visited.has(neighbor.str()))
        .map(neighbor => ({ pos: neighbor, distance: distance + 1 }))
      distances.set(pos.str(), (distances.get(pos.str()) || 0) + distance)
      nextNodes.forEach(node => {
        visited.add(node.pos.str())
        queue.push(node)
      })
    }
  }
  return Math.min(...distances.values())
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
##########
..#......#
#.P.####P#
#.#...P#.#
##########`,
        expected: 11,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
#######################
...P..P...#P....#.....#
#.#######.#.#.#.#####.#
#.....#...#P#.#..P....#
#.#####.#####.#########
#...P....P.P.P.....P#.#
#.#######.#####.#.#.#.#
#...#.....#P...P#.#....
#######################`,
        expected: 21,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
##########
#.#......#
#.P.####P#
#.#...P#.#
##########`,
        expected: 12,
      },
    ],
  },
} as EverybodyCodesContest
