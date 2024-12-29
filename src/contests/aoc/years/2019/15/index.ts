import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch, dijkstraOnGraph } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { Computer } from "../09/index.js"

// 🎄 Advent of Code 2019 - Day 15

const WALL = 0
const EMPTY = 1
const OXYGEN = 2

const NORTH = 1
const SOUTH = 2
const WEST = 3
const EAST = 4

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",").map(Number)
}

function buildGrid(cache: Map<string, { cell: number }>) {
  const coordinates = [...cache.keys()].map(Vector2.fromKey)
  const topLeft = coordinates.reduce(
    (acc, coord) => new Vector2(Math.min(acc.x, coord.x), Math.min(acc.y, coord.y)),
    new Vector2(Infinity, Infinity)
  )
  const bottomRight = coordinates.reduce(
    (acc, coord) => new Vector2(Math.max(acc.x, coord.x), Math.max(acc.y, coord.y)),
    new Vector2(-Infinity, -Infinity)
  )
  const width = bottomRight.x - topLeft.x + 1
  const height = bottomRight.y - topLeft.y + 1
  const grid = utils.grid.create(width, height, "#")
  for (const [positionStr, { cell }] of cache) {
    const position = Vector2.fromKey(positionStr)
    const relativePosition = position.subtract(topLeft)
    if (cell === WALL) {
      continue
    }
    utils.grid.set(grid, relativePosition, cell === EMPTY ? "." : "O")
  }
  return grid
}

function explore(program: number[], endPredicate: (cell: number) => boolean) {
  interface Node {
    position: Vector2
    end: boolean
  }
  const startNode: Node = {
    position: new Vector2(0, 0),
    end: false,
  }
  const cache = new Map<
    string,
    {
      computer: Computer
      cell: number
    }
  >()
  cache.set(startNode.position.str(), {
    computer: new Computer(program, []),
    cell: EMPTY,
  })
  function getOrCreateComputer(node: Node, robotDir: number, neighborPosition: Vector2) {
    const neighborComputerKey = neighborPosition.str()
    if (cache.has(neighborComputerKey)) {
      return cache.get(neighborComputerKey)!
    }
    const { computer } = cache.get(node.position.str())!
    const neighborComputer = computer.clone()
    neighborComputer.inputs.push(robotDir)
    neighborComputer.run()
    const neighborCell = neighborComputer.outputs.pop()!
    cache.set(neighborComputerKey, { computer: neighborComputer, cell: neighborCell })
    return { computer: neighborComputer, cell: neighborCell }
  }
  const result = dijkstraOnGraph<Node>([startNode], node => node.end, {
    equals(a, b) {
      return a.position.equals(b.position)
    },
    key(node) {
      return node.position.str()
    },
    moves(node) {
      const directions = [
        { robotDir: NORTH, position: node.position.move("up") },
        { robotDir: SOUTH, position: node.position.move("down") },
        { robotDir: WEST, position: node.position.move("left") },
        { robotDir: EAST, position: node.position.move("right") },
      ]
      const adjacents: Node[] = []
      for (const { robotDir, position: neighborPosition } of directions) {
        const { cell } = getOrCreateComputer(node, robotDir, neighborPosition)
        if (cell === WALL) {
          continue
        }
        adjacents.push({
          position: neighborPosition,
          end: endPredicate(cell),
        })
      }
      return adjacents.map(neighbor => ({ to: neighbor, cost: 1 }))
    },
  })
  return { ...result, cache }
}

function part1(inputString: string) {
  const program = parseInput(inputString)
  const { bestScore } = explore(program, cell => cell === OXYGEN)
  return bestScore
}

function part2(inputString: string) {
  const program = parseInput(inputString)
  const { cache } = explore(program, () => false)
  const grid = buildGrid(cache)
  const oxygenPosition = utils.grid.findPositions(grid, c => c === "O")[0]
  interface Node {
    position: Vector2
    distance: number
  }
  const queue: Node[] = []
  queue.push({ position: oxygenPosition, distance: 0 })
  const visited = new Map<string, number>()
  while (queue.length > 0) {
    const node = queue.shift()!
    if (utils.grid.at(grid, node.position) === "#") {
      continue
    }
    visited.set(node.position.str(), node.distance)
    for (const neighbor of node.position.plusShapeNeighbors()) {
      const key = neighbor.str()
      if (visited.has(key) && visited.get(key)! < node.distance + 1) {
        continue
      }
      queue.push({
        position: neighbor,
        distance: node.distance + 1,
      })
    }
  }
  return utils.iterate.max([...visited.values()])
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
