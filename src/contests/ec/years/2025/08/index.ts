import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 8

function parseInput(input: string) {
  return utils.input.firstLine(input).split(/,/g).map(Number)
}

function part1(inputString: string) {
  const numbers = parseInput(inputString)
  const nails = numbers.length <= 10 ? 8 : 32
  let count = 0
  for (let i = 1; i < numbers.length; ++i) {
    const max = Math.max(numbers[i], numbers[i - 1])
    const min = Math.min(numbers[i], numbers[i - 1])
    const diff = max - min
    if (diff === nails / 2) {
      count++
    }
  }
  return count
}

function part2(inputString: string) {
  const numbers = parseInput(inputString)
  const segments = utils.iterate.slidingWindows(numbers, 2)
  let count = 0
  for (let i = 0; i < segments.length; ++i) {
    const [a1, a2] = segments[i]
    count += countIntersections(segments.slice(i + 1), a1, a2)
  }
  return count
}

function countIntersections(segments: number[][], a1: number, a2: number) {
  let count = 0
  for (let j = 0; j < segments.length; ++j) {
    const [b1, b2] = segments[j]

    // Check for unique nail positions
    const uniqueNails = new Set([a1, a2, b1, b2])
    if (uniqueNails.size < 4) {
      continue
    }

    // Two chords on a circle intersect iff their endpoints interleave
    // Normalize so we go from smaller to larger (mod nails)
    const inRange = (x: number, lo: number, hi: number) => {
      // Check if x is strictly between lo and hi going clockwise
      if (lo < hi) {
        return x > lo && x < hi
      } else {
        return x > lo || x < hi
      }
    }

    // Check if exactly one of b1, b2 is in the arc from a1 to a2
    const b1InArc = inRange(b1, a1, a2)
    const b2InArc = inRange(b2, a1, a2)

    if (b1InArc !== b2InArc) {
      count++
    }
  }
  return count
}

function part3(inputString: string) {
  const numbers = parseInput(inputString)
  const segments = utils.iterate.slidingWindows(numbers, 2)
  const maxNail = Math.max(...numbers)

  const inArc = (p: number, x: number, y: number) => p > x && p < y

  let bestCount = 0
  for (let x = 1; x <= maxNail; x++) {
    for (let y = x + 1; y <= maxNail; y++) {
      let intersections = 0
      for (const [a, b] of segments) {
        // If same segment, count it (they overlap)
        if ((x === a && y === b) || (x === b && y === a)) {
          intersections++
          continue
        }

        // Skip if shared endpoint (but not if it's the exact same segment)
        if (x === a || x === b || y === a || y === b) continue

        // Check if exactly one of a, b is in arc (x -> y)
        const aIn = inArc(a, x, y)
        const bIn = inArc(b, x, y)
        if (aIn !== bIn) intersections++
      }
      if (intersections > bestCount) {
        bestCount = intersections
      }
    }
  }

  return bestCount
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `1,5,2,6,8,4,1,7,3`,
        expected: 4,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `1,5,2,6,8,4,1,7,3,5,7,8,2`,
        expected: 21,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `1,5,2,6,8,4,1,7,3,6`,
        expected: 7,
      },
    ],
  },
} as EverybodyCodesContest
