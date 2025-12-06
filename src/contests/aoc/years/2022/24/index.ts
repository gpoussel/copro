import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 24

interface Blizzard {
  pos: Vector2
  dir: Vector2
}

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  const height = grid.length
  const width = grid[0].length

  const blizzards: Blizzard[] = []
  const dirMap: Record<string, Vector2> = {
    "^": new Vector2(0, -1),
    v: new Vector2(0, 1),
    "<": new Vector2(-1, 0),
    ">": new Vector2(1, 0),
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = grid[y][x]
      if (c in dirMap) {
        blizzards.push({ pos: new Vector2(x, y), dir: dirMap[c] })
      }
    }
  }

  // Find start and end positions (gaps in top and bottom walls)
  const startX = grid[0].indexOf(".")
  const endX = grid[height - 1].indexOf(".")
  const start = new Vector2(startX, 0)
  const end = new Vector2(endX, height - 1)

  return { blizzards, width, height, start, end }
}

function getBlizzardPositions(blizzards: Blizzard[], time: number, width: number, height: number): Set<string> {
  const positions = new Set<string>()
  // Inner area is from (1, 1) to (width-2, height-2)
  const innerWidth = width - 2
  const innerHeight = height - 2

  for (const b of blizzards) {
    // Calculate position after `time` minutes (wrapping within inner area)
    const newX = ((((b.pos.x - 1 + b.dir.x * time) % innerWidth) + innerWidth) % innerWidth) + 1
    const newY = ((((b.pos.y - 1 + b.dir.y * time) % innerHeight) + innerHeight) % innerHeight) + 1
    positions.add(`${newX},${newY}`)
  }
  return positions
}

function findPath(
  blizzards: Blizzard[],
  width: number,
  height: number,
  start: Vector2,
  end: Vector2,
  startTime: number
): number {
  // BFS: state = (x, y, time)
  const directions = [
    new Vector2(0, 0), // wait
    new Vector2(0, -1), // up
    new Vector2(0, 1), // down
    new Vector2(-1, 0), // left
    new Vector2(1, 0), // right
  ]

  // Cache blizzard positions for each time step
  const blizzardCache = new Map<number, Set<string>>()
  const getBlizzards = (t: number) => {
    if (!blizzardCache.has(t)) {
      blizzardCache.set(t, getBlizzardPositions(blizzards, t, width, height))
    }
    return blizzardCache.get(t)!
  }

  const visited = new Set<string>()
  const queue: { pos: Vector2; time: number }[] = [{ pos: start, time: startTime }]
  visited.add(`${start.x},${start.y},${startTime}`)

  while (queue.length > 0) {
    const { pos, time } = queue.shift()!

    for (const dir of directions) {
      const newPos = pos.add(dir)
      const newTime = time + 1

      // Check if we reached the end
      if (newPos.x === end.x && newPos.y === end.y) {
        return newTime
      }

      // Check if position is valid (either start/end or inside the inner area)
      const isStart = newPos.x === start.x && newPos.y === start.y
      const isEnd = newPos.x === end.x && newPos.y === end.y
      const isInside = newPos.x >= 1 && newPos.x < width - 1 && newPos.y >= 1 && newPos.y < height - 1

      if (!isStart && !isEnd && !isInside) {
        continue
      }

      // Check if there's a blizzard at this position at this time
      const blizzardsAtTime = getBlizzards(newTime)
      if (blizzardsAtTime.has(`${newPos.x},${newPos.y}`)) {
        continue
      }

      const stateKey = `${newPos.x},${newPos.y},${newTime}`
      if (visited.has(stateKey)) {
        continue
      }

      visited.add(stateKey)
      queue.push({ pos: newPos, time: newTime })
    }
  }

  return -1 // Should never happen if there's a valid path
}

function part1(inputString: string) {
  const { blizzards, width, height, start, end } = parseInput(inputString)
  return findPath(blizzards, width, height, start, end, 0)
}

function part2(inputString: string) {
  const { blizzards, width, height, start, end } = parseInput(inputString)
  // Trip 1: start -> end
  const trip1 = findPath(blizzards, width, height, start, end, 0)
  // Trip 2: end -> start
  const trip2 = findPath(blizzards, width, height, end, start, trip1)
  // Trip 3: start -> end again
  const trip3 = findPath(blizzards, width, height, start, end, trip2)
  return trip3
}

const EXAMPLE = `
#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 18,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 54,
      },
    ],
  },
} as AdventOfCodeContest
