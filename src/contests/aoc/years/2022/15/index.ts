import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 15

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const match = line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)
    if (!match) {
      throw new Error(`Invalid line: ${line}`)
    }
    const sensor = new Vector2(+match[1], +match[2])
    const beacon = new Vector2(+match[3], +match[4])
    return { sensor, beacon }
  })
}

function getCoveredIntervalsForRow(pairs: ReturnType<typeof parseInput>, row: number): [number, number][] {
  const intervals: [number, number][] = []
  for (const pair of pairs) {
    const distance = pair.sensor.manhattanDistance(pair.beacon)
    const projectionDistance = Math.abs(pair.sensor.y - row)
    if (projectionDistance <= distance) {
      const reach = distance - projectionDistance
      intervals.push([pair.sensor.x - reach, pair.sensor.x + reach])
    }
  }
  // Sort intervals by start position
  intervals.sort((a, b) => a[0] - b[0])
  // Merge overlapping intervals
  const merged: [number, number][] = []
  for (const interval of intervals) {
    if (merged.length === 0 || merged[merged.length - 1][1] < interval[0] - 1) {
      merged.push(interval)
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1])
    }
  }
  return merged
}

function part1(inputString: string) {
  const pairs = parseInput(inputString)
  const targetRow = pairs.some(pair => pair.sensor.y >= 100) ? 2000000 : 10
  const intervals = getCoveredIntervalsForRow(pairs, targetRow)

  // Count total covered positions
  let count = 0
  for (const [start, end] of intervals) {
    count += end - start + 1
  }

  // Subtract beacons that are on the target row (only count each beacon once)
  const beaconsOnRow = new Set<number>()
  for (const pair of pairs) {
    if (pair.beacon.y === targetRow) {
      beaconsOnRow.add(pair.beacon.x)
    }
  }
  return count - beaconsOnRow.size
}

function part2(inputString: string) {
  const pairs = parseInput(inputString)
  const maxCoord = pairs.some(pair => pair.sensor.y >= 100) ? 4000000 : 20

  for (let y = 0; y <= maxCoord; y++) {
    const intervals = getCoveredIntervalsForRow(pairs, y)
    // Look for a gap in the intervals within [0, maxCoord]
    let x = 0
    for (const [start, end] of intervals) {
      if (start > x && x <= maxCoord) {
        // Found a gap at position x
        return x * 4000000 + y
      }
      x = Math.max(x, end + 1)
    }
  }
}

const EXAMPLE = `
Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 26,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 56000011,
      },
    ],
  },
} as AdventOfCodeContest
