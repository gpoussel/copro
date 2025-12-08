import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2025 - Quest 15

interface Instruction {
  direction: "R" | "L"
  distance: number
}

function parseInput(input: string): Instruction[] {
  return utils.input
    .firstLine(input)
    .split(",")
    .map(instr => {
      const direction = instr[0] as "R" | "L"
      const distance = parseInt(instr.slice(1), 10)
      return { direction, distance }
    })
}

function getPolyline(instructions: Instruction[]): Vector2[] {
  const points: Vector2[] = []
  let currentPosition = new Vector2(0, 0)
  let direction = 3 // 0=right, 1=down, 2=left, 3=up
  points.push(currentPosition)
  for (const instr of instructions) {
    switch (instr.direction) {
      case "R":
        direction = (direction + 1) % 4
        break
      case "L":
        direction = (direction + 3) % 4
        break
    }
    switch (direction) {
      case 0:
        currentPosition = currentPosition.add(new Vector2(instr.distance, 0))
        break
      case 1:
        currentPosition = currentPosition.add(new Vector2(0, instr.distance))
        break
      case 2:
        currentPosition = currentPosition.add(new Vector2(-instr.distance, 0))
        break
      case 3:
        currentPosition = currentPosition.add(new Vector2(0, -instr.distance))
        break
    }
    points.push(currentPosition)
  }
  return points
}

interface Segment {
  p1: Vector2
  p2: Vector2
  horizontal: boolean
}

function getSegments(polyline: Vector2[]): Segment[] {
  const segments: Segment[] = []
  for (let i = 0; i < polyline.length - 1; i++) {
    segments.push({
      p1: polyline[i],
      p2: polyline[i + 1],
      horizontal: polyline[i].y === polyline[i + 1].y,
    })
  }
  return segments
}

// Check if a point is on the polyline (including endpoints)
function isPointOnPolyline(x: number, y: number, segments: Segment[]): boolean {
  for (const seg of segments) {
    if (seg.horizontal) {
      if (y !== seg.p1.y) continue
      const minX = Math.min(seg.p1.x, seg.p2.x)
      const maxX = Math.max(seg.p1.x, seg.p2.x)
      if (x >= minX && x <= maxX) return true
    } else {
      if (x !== seg.p1.x) continue
      const minY = Math.min(seg.p1.y, seg.p2.y)
      const maxY = Math.max(seg.p1.y, seg.p2.y)
      if (y >= minY && y <= maxY) return true
    }
  }
  return false
}

// Check if moving from (x1,y) to (x2,y) horizontally crosses any vertical segment
function crossesVerticalSegment(y: number, x1: number, x2: number, segments: Segment[]): boolean {
  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  for (const seg of segments) {
    if (!seg.horizontal) {
      // Vertical segment
      const segX = seg.p1.x
      const segMinY = Math.min(seg.p1.y, seg.p2.y)
      const segMaxY = Math.max(seg.p1.y, seg.p2.y)
      // Check if our horizontal movement crosses this vertical segment
      // We cross if segX is strictly between our x positions AND y is within the segment range (not at endpoints)
      if (segX > minX && segX < maxX && y > segMinY && y < segMaxY) {
        return true
      }
    }
  }
  return false
}

// Check if moving from (x,y1) to (x,y2) vertically crosses any horizontal segment
function crossesHorizontalSegment(x: number, y1: number, y2: number, segments: Segment[]): boolean {
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)
  for (const seg of segments) {
    if (seg.horizontal) {
      // Horizontal segment
      const segY = seg.p1.y
      const segMinX = Math.min(seg.p1.x, seg.p2.x)
      const segMaxX = Math.max(seg.p1.x, seg.p2.x)
      // Check if our vertical movement crosses this horizontal segment
      // We cross if segY is strictly between our y positions AND x is within the segment range (not at endpoints)
      if (segY > minY && segY < maxY && x > segMinX && x < segMaxX) {
        return true
      }
    }
  }
  return false
}

function solveCompressed(instructions: Instruction[]): number {
  const polyline = getPolyline(instructions)
  const start = polyline[0]
  const end = polyline[polyline.length - 1]
  const segments = getSegments(polyline)

  // Collect all interesting X and Y coordinates
  const xSet = new Set<number>()
  const ySet = new Set<number>()
  for (const p of polyline) {
    xSet.add(p.x)
    ySet.add(p.y)
    // Also add adjacent coordinates to allow walking around corners
    xSet.add(p.x - 1)
    xSet.add(p.x + 1)
    ySet.add(p.y - 1)
    ySet.add(p.y + 1)
  }

  const xs = Array.from(xSet).sort((a, b) => a - b)
  const ys = Array.from(ySet).sort((a, b) => a - b)

  const xIndex = new Map<number, number>()
  const yIndex = new Map<number, number>()
  xs.forEach((x, i) => xIndex.set(x, i))
  ys.forEach((y, i) => yIndex.set(y, i))

  // BFS on compressed coordinates
  const startKey = `${xIndex.get(start.x)},${yIndex.get(start.y)}`
  const endXi = xIndex.get(end.x)!
  const endYi = yIndex.get(end.y)!

  const visited = new Map<string, number>()
  const queue: { xi: number; yi: number; dist: number }[] = []
  queue.push({ xi: xIndex.get(start.x)!, yi: yIndex.get(start.y)!, dist: 0 })
  visited.set(startKey, 0)

  while (queue.length > 0) {
    const { xi, yi, dist } = queue.shift()!
    const x = xs[xi]
    const y = ys[yi]

    if (xi === endXi && yi === endYi) {
      return dist
    }

    // Try moving to adjacent compressed coordinates
    const moves = [
      { dxi: -1, dyi: 0 },
      { dxi: 1, dyi: 0 },
      { dxi: 0, dyi: -1 },
      { dxi: 0, dyi: 1 },
    ]

    for (const { dxi, dyi } of moves) {
      const nxi = xi + dxi
      const nyi = yi + dyi
      if (nxi < 0 || nxi >= xs.length || nyi < 0 || nyi >= ys.length) continue

      const nx = xs[nxi]
      const ny = ys[nyi]
      const key = `${nxi},${nyi}`

      if (visited.has(key)) continue

      // Check if destination is on the polyline interior (not allowed except for start/end)
      const isDestOnWall = isPointOnPolyline(nx, ny, segments)
      const isDestStartOrEnd = (nx === start.x && ny === start.y) || (nx === end.x && ny === end.y)

      // Check if this move crosses the polyline
      let blocked = false
      if (dxi !== 0) {
        // Horizontal move
        blocked = crossesVerticalSegment(y, x, nx, segments)
      } else {
        // Vertical move
        blocked = crossesHorizontalSegment(x, y, ny, segments)
      }

      // Also block if landing on wall (unless it's start or end)
      if (isDestOnWall && !isDestStartOrEnd) {
        blocked = true
      }

      if (!blocked) {
        const moveDist = Math.abs(nx - x) + Math.abs(ny - y)
        visited.set(key, dist + moveDist)
        queue.push({ xi: nxi, yi: nyi, dist: dist + moveDist })
      }
    }

    // Sort queue by distance (make it a proper Dijkstra)
    queue.sort((a, b) => a.dist - b.dist)
  }

  return Infinity
}

function part1(inputString: string) {
  const instructions = parseInput(inputString)
  return solveCompressed(instructions)
}

function part2(inputString: string) {
  const instructions = parseInput(inputString)
  return solveCompressed(instructions)
}

function part3(inputString: string) {
  const instructions = parseInput(inputString)
  return solveCompressed(instructions)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `R3,R4,L3,L4,R3,R6,R9`,
        expected: 6,
      },
      {
        input: `L6,L3,L6,R3,L6,L3,L3,R6,L6,R6,L6,L6,R3,L3,L3,R3,R3,L6,L6,L3`,
        expected: 16,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
