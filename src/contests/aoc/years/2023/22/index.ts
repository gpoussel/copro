import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 22

interface Brick {
  id: number
  x1: number
  y1: number
  z1: number
  x2: number
  y2: number
  z2: number
}

function parseInput(input: string): Brick[] {
  return utils.input.lines(input).map((line, id) => {
    const [a, b] = line.split("~")
    const [x1, y1, z1] = a.split(",").map(Number)
    const [x2, y2, z2] = b.split(",").map(Number)
    return { id, x1, y1, z1, x2, y2, z2 }
  })
}

function overlapsXY(a: Brick, b: Brick): boolean {
  return a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1
}

function settleBricks(bricks: Brick[]): {
  settled: Brick[]
  supports: Map<number, Set<number>>
  supportedBy: Map<number, Set<number>>
} {
  // Sort by z (lowest first)
  const sorted = [...bricks].sort((a, b) => a.z1 - b.z1)
  const settled: Brick[] = []
  const supports = new Map<number, Set<number>>() // brick -> bricks it supports
  const supportedBy = new Map<number, Set<number>>() // brick -> bricks supporting it

  for (const brick of sorted) {
    supports.set(brick.id, new Set())
    supportedBy.set(brick.id, new Set())
  }

  for (const brick of sorted) {
    // Find highest z where this brick can rest
    let maxZ = 1
    for (const other of settled) {
      if (overlapsXY(brick, other)) {
        maxZ = Math.max(maxZ, other.z2 + 1)
      }
    }

    // Drop the brick
    const drop = brick.z1 - maxZ
    const newBrick = {
      ...brick,
      z1: brick.z1 - drop,
      z2: brick.z2 - drop,
    }

    // Find what supports this brick
    for (const other of settled) {
      if (overlapsXY(newBrick, other) && other.z2 === newBrick.z1 - 1) {
        supports.get(other.id)!.add(newBrick.id)
        supportedBy.get(newBrick.id)!.add(other.id)
      }
    }

    settled.push(newBrick)
  }

  return { settled, supports, supportedBy }
}

function part1(inputString: string) {
  const bricks = parseInput(inputString)
  const { supports, supportedBy } = settleBricks(bricks)

  let safeCount = 0
  for (const brick of bricks) {
    // Can disintegrate if all bricks it supports have other supports
    const canDisintegrate = [...supports.get(brick.id)!].every(supported => supportedBy.get(supported)!.size > 1)
    if (canDisintegrate) safeCount++
  }

  return safeCount
}

function part2(inputString: string) {
  const bricks = parseInput(inputString)
  const { supports, supportedBy } = settleBricks(bricks)

  let total = 0
  for (const brick of bricks) {
    // BFS to find chain reaction
    const falling = new Set<number>([brick.id])
    const queue = [...supports.get(brick.id)!]

    while (queue.length) {
      const check = queue.shift()!
      if (falling.has(check)) continue

      // Check if all supports are falling
      const allSupportsFalling = [...supportedBy.get(check)!].every(s => falling.has(s))
      if (allSupportsFalling) {
        falling.add(check)
        queue.push(...supports.get(check)!)
      }
    }

    total += falling.size - 1 // Don't count the disintegrated brick
  }

  return total
}

const EXAMPLE = `
1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 7,
      },
    ],
  },
} as AdventOfCodeContest
