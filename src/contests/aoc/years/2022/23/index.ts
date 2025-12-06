import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 23

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const elves = new Set<string>()
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "#") {
        elves.add(new Vector2(x, y).str())
      }
    }
  }
  return elves
}

type DirectionCheck = {
  check: Vector2[] // positions to check for other elves
  move: Vector2 // direction to move if check passes
}

const DIRECTION_CHECKS: DirectionCheck[] = [
  // North: check N, NE, NW
  { check: [new Vector2(0, -1), new Vector2(1, -1), new Vector2(-1, -1)], move: new Vector2(0, -1) },
  // South: check S, SE, SW
  { check: [new Vector2(0, 1), new Vector2(1, 1), new Vector2(-1, 1)], move: new Vector2(0, 1) },
  // West: check W, NW, SW
  { check: [new Vector2(-1, 0), new Vector2(-1, -1), new Vector2(-1, 1)], move: new Vector2(-1, 0) },
  // East: check E, NE, SE
  { check: [new Vector2(1, 0), new Vector2(1, -1), new Vector2(1, 1)], move: new Vector2(1, 0) },
]

const ALL_NEIGHBORS = [
  new Vector2(-1, -1),
  new Vector2(0, -1),
  new Vector2(1, -1),
  new Vector2(-1, 0),
  new Vector2(1, 0),
  new Vector2(-1, 1),
  new Vector2(0, 1),
  new Vector2(1, 1),
]

function simulateRound(elves: Set<string>, startDirection: number): boolean {
  // First half: each elf proposes a move
  const proposals = new Map<string, Vector2>() // elf position -> proposed position
  const proposalCounts = new Map<string, number>() // proposed position -> count

  for (const elfKey of elves) {
    const elf = Vector2.fromKey(elfKey)

    // Check if any neighbor is occupied
    const hasNeighbor = ALL_NEIGHBORS.some(n => elves.has(elf.add(n).str()))

    if (!hasNeighbor) {
      // No neighbors, elf doesn't move
      continue
    }

    // Try each direction in order
    for (let i = 0; i < 4; i++) {
      const dirIndex = (startDirection + i) % 4
      const dirCheck = DIRECTION_CHECKS[dirIndex]

      // Check if all positions in this direction are empty
      const canMove = dirCheck.check.every(c => !elves.has(elf.add(c).str()))

      if (canMove) {
        const proposedPos = elf.add(dirCheck.move)
        proposals.set(elfKey, proposedPos)
        const propKey = proposedPos.str()
        proposalCounts.set(propKey, (proposalCounts.get(propKey) || 0) + 1)
        break
      }
    }
  }

  // Second half: move elves with unique proposals
  let moved = false
  for (const [elfKey, proposedPos] of proposals) {
    if (proposalCounts.get(proposedPos.str()) === 1) {
      elves.delete(elfKey)
      elves.add(proposedPos.str())
      moved = true
    }
  }

  return moved
}

function countEmptyTiles(elves: Set<string>): number {
  const positions = [...elves].map(Vector2.fromKey)
  const minX = Math.min(...positions.map(p => p.x))
  const maxX = Math.max(...positions.map(p => p.x))
  const minY = Math.min(...positions.map(p => p.y))
  const maxY = Math.max(...positions.map(p => p.y))

  const width = maxX - minX + 1
  const height = maxY - minY + 1
  const totalTiles = width * height

  return totalTiles - elves.size
}

function part1(inputString: string) {
  const elves = parseInput(inputString)

  for (let round = 0; round < 10; round++) {
    simulateRound(elves, round % 4)
  }

  return countEmptyTiles(elves)
}

function part2(inputString: string) {
  const elves = parseInput(inputString)

  let round = 0
  while (true) {
    const moved = simulateRound(elves, round % 4)
    round++
    if (!moved) {
      return round
    }
  }
}

const EXAMPLE = `
....#..
..###.#
#...#.#
.#...##
#.###..
##.#.##
.#..#..`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 110,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 20,
      },
    ],
  },
} as AdventOfCodeContest
