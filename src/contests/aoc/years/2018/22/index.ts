import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGraph } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { PriorityQueue } from "../../../../../utils/structures/priority-queue.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 22

const ROCKY = 0
const WET = 1
const NARROW = 2

const TOOL_NONE = 0
const TOOL_TORCH = 1
const TOOL_CLIMBING_GEAR = 2

function parseInput(input: string) {
  const [depthLine, targetLine] = utils.input.lines(input)
  const depth = parseInt(depthLine.split(": ")[1])
  const [targetX, targetY] = targetLine.split(": ")[1].split(",").map(Number)
  return {
    depth,
    target: new Vector2(targetX, targetY),
  }
}

function areaScanner(depth: number, target: Vector2) {
  const erosionLevels = new Map<string, number>()
  const geologicIndexes = new Map<string, number>()

  function computeGeologicIndex(position: Vector2): number {
    if ((position.x === 0 && position.y === 0) || position.equals(target)) {
      return 0
    }
    if (position.y === 0) {
      return position.x * 16807
    }
    if (position.x === 0) {
      return position.y * 48271
    }
    return getErosionLevel(position.add(new Vector2(-1, 0))) * getErosionLevel(position.add(new Vector2(0, -1)))
  }

  function getGeologicIndex(position: Vector2) {
    const key = `${position.x},${position.y}`
    if (geologicIndexes.has(key)) {
      return geologicIndexes.get(key)!
    }
    const value = computeGeologicIndex(position)
    geologicIndexes.set(key, value)
    return value
  }

  function getErosionLevel(position: Vector2) {
    const key = `${position.x},${position.y}`
    if (erosionLevels.has(key)) {
      return erosionLevels.get(key)!
    }
    const value = (getGeologicIndex(position) + depth) % 20183
    erosionLevels.set(key, value)
    return value
  }

  function getRiskLevel(position: Vector2) {
    return getErosionLevel(position) % 3
  }

  return {
    getRiskLevel,
  }
}

function getAllowedTools(riskLevel: number) {
  if (riskLevel === ROCKY) {
    return [TOOL_TORCH, TOOL_CLIMBING_GEAR]
  } else if (riskLevel === WET) {
    return [TOOL_CLIMBING_GEAR, TOOL_NONE]
  } else if (riskLevel === NARROW) {
    return [TOOL_TORCH, TOOL_NONE]
  }
  throw new Error()
}

function part1(inputString: string) {
  const { depth, target } = parseInput(inputString)
  const scanner = areaScanner(depth, target)
  let sum = 0
  for (let y = 0; y <= target.y; y++) {
    for (let x = 0; x <= target.x; x++) {
      sum += scanner.getRiskLevel(new Vector2(x, y))
    }
  }
  return sum
}

function part2(inputString: string) {
  const { depth, target } = parseInput(inputString)
  const scanner = areaScanner(depth, target)
  interface Node {
    position: Vector2
    tool: number
  }
  const startNode: Node = { position: new Vector2(0, 0), tool: TOOL_TORCH }
  const endNode: Node = { position: target, tool: TOOL_TORCH }
  const result = dijkstraOnGraph([startNode], [endNode], {
    equals(a, b) {
      return a.position.equals(b.position) && a.tool === b.tool
    },
    key(node) {
      return `${node.position.str()},${node.tool}`
    },
    moves(node, path) {
      const currentRiskLevel = scanner.getRiskLevel(node.position)
      const moves: { to: Node; cost: number }[] = []
      getAllowedTools(currentRiskLevel)
        .filter(t => t !== node.tool)
        .forEach(tool => {
          moves.push({ to: { position: node.position, tool }, cost: 7 })
        })
      node.position
        .plusShapeNeighbors()
        .filter(neighbor => neighbor.x >= 0 && neighbor.y >= 0)
        .filter(neighbor => neighbor.x <= target.x + 50 && neighbor.y <= target.y + 5)
        .flatMap(neighbor => {
          const neighborRiskLevel = scanner.getRiskLevel(neighbor)
          const allowedTools = getAllowedTools(neighborRiskLevel)
          if (!allowedTools.includes(node.tool)) {
            return []
          }
          return [{ position: neighbor, tool: node.tool }]
        })
        .forEach(neighbor => {
          moves.push({ to: neighbor, cost: 1 })
        })
      return moves
    },
  })
  return result.bestScore
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
