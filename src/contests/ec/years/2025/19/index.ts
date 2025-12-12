import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 19

function parseInput(input: string) {
  return utils.input.lines(input).map(line => line.split(",").map(n => +n))
}

function computeMinFlaps(input: number[][]): number {
  const valid: Map<number, Set<number>> = new Map()
  let maxHeight = 0
  for (const [x, y, h] of input) {
    if (!valid.has(x)) valid.set(x, new Set())
    for (let i = 0; i < h; i++) {
      valid.get(x)!.add(y + i)
      maxHeight = Math.max(maxHeight, y + i)
    }
  }
  const positions = [...new Set(input.map(([x]) => x))].sort((a, b) => a - b)
  const n = positions.length
  const dp: number[][] = Array.from({ length: n }, () => Array(maxHeight + 1).fill(Infinity))
  const x0 = positions[0]
  const startHeight = 0
  const valid0 = valid.get(x0) || new Set()
  for (const h of valid0) {
    const steps = x0
    const delta = h - startHeight
    if ((steps + delta) % 2 === 0) {
      const ups = (steps + delta) / 2
      if (ups >= 0) dp[0][h] = ups
    }
  }
  for (let i = 1; i < n; i++) {
    const prevX = positions[i - 1]
    const currX = positions[i]
    const steps = currX - prevX
    const validPrev = valid.get(prevX) || new Set()
    const validCurr = valid.get(currX) || new Set()
    for (const prevH of validPrev) {
      if (dp[i - 1][prevH] === Infinity) continue
      for (const currH of validCurr) {
        const delta = currH - prevH
        if ((steps + delta) % 2 === 0) {
          const ups = (steps + delta) / 2
          if (ups >= 0) {
            dp[i][currH] = Math.min(dp[i][currH], dp[i - 1][prevH] + ups)
          }
        }
      }
    }
  }
  const lastX = positions[n - 1]
  const validLast = valid.get(lastX) || new Set()
  let minCost = Infinity
  for (const h of validLast) {
    minCost = Math.min(minCost, dp[n - 1][h])
  }
  return minCost
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return computeMinFlaps(input)
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  return part1(inputString)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
7,7,2
12,0,4
15,5,3
24,1,6
28,5,5
40,8,2`,
        expected: 24,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
7,7,2
7,1,3
12,0,4
15,5,3
24,1,6
28,5,5
40,3,3
40,8,2`,
        expected: 22,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
