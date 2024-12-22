import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2016 - Day 22

function parseInput(input: string) {
  const [, , ...sizes] = utils.input.lines(input)
  return sizes.map(line => {
    const parts = line.split(/\s+/)
    const [x, y] = parts[0]
      .match(/x(\d+)-y(\d+)/)!
      .slice(1)
      .map(Number)
    const size = Number(parts[1].slice(0, -1))
    const used = Number(parts[2].slice(0, -1))
    const avail = Number(parts[3].slice(0, -1))
    return {
      position: new Vector2(x, y),
      size,
      used,
      avail,
    }
  })
}

function part1(inputString: string) {
  const nodes = parseInput(inputString)
  let pairCount = 0
  for (const node1 of nodes) {
    for (const node2 of nodes) {
      if (node1 === node2) {
        continue
      }
      if (node1.used === 0) {
        continue
      }
      if (node1.used < node2.avail) {
        pairCount++
      }
    }
  }
  return pairCount
}

function part2(inputString: string) {
  const nodes = parseInput(inputString)
  const maxX = Math.max(...nodes.map(node => node.position.x))
  const maxY = Math.max(...nodes.map(node => node.position.y))

  const initialTargetPosition = new Vector2(maxX, 0)
  const emptyNode = nodes.find(node => node.used === 0)!
  const initialEmptyNodePosition = emptyNode.position
  const wallNodes = nodes.filter(node => node.used > 100).map(node => node.position)

  const result = breadthFirstSearch<Vector2>(initialEmptyNodePosition, {
    adjacents(node) {
      const nodes = []
      for (const neighbor of node.plusShapeNeighbors()) {
        if (neighbor.x < 0 || neighbor.y < 0 || neighbor.x > maxX || neighbor.y > maxY) {
          continue
        }
        if (wallNodes.some(wallNode => wallNode.equals(neighbor))) {
          continue
        }
        nodes.push(neighbor)
      }
      return nodes
    },
    ends(node) {
      return node.equals(new Vector2(initialTargetPosition.x - 1, 0))
    },
    key(node) {
      return node.str()
    },
  })

  return result.distance + 1 + 5 * (initialTargetPosition.x - 1)
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
