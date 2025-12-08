import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2025 - Quest 14

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function simulateRounds(grid: string[][], rounds: number) {
  let countActive = 0
  for (let round = 0; round < rounds; ++round) {
    const { newGrid, activeThisRound }: { newGrid: string[][]; activeThisRound: number } = nextRound(grid)
    grid = newGrid
    countActive += activeThisRound
  }
  return countActive
}

function part1(inputString: string) {
  let grid = parseInput(inputString)
  return simulateRounds(grid, 10)
}

function part2(inputString: string) {
  let grid = parseInput(inputString)
  return simulateRounds(grid, 2025)
}

function extractCenter(grid: string[][], size: number): string[][] {
  const startX = Math.floor((grid[0].length - size) / 2)
  const startY = Math.floor((grid.length - size) / 2)
  const center: string[][] = []
  for (let y = 0; y < size; y++) {
    center.push(grid[startY + y].slice(startX, startX + size))
  }
  return center
}

function gridToString(grid: string[][]): string {
  return grid.map(row => row.join("")).join("\n")
}

function matchesPattern(grid: string[][], pattern: string[][]): boolean {
  const center = extractCenter(grid, pattern.length)
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[0].length; x++) {
      if (center[y][x] !== pattern[y][x]) {
        return false
      }
    }
  }
  return true
}

function part3(inputString: string) {
  const pattern = parseInput(inputString)
  const gridSize = 34
  let grid: string[][] = utils.grid.create(gridSize, gridSize, ".")

  const totalRounds = 1_000_000_000
  const matchingRounds: { round: number; activeCount: number }[] = []
  const seenStates = new Map<string, number>() // state -> round number

  let cycleStart = -1
  let cycleLength = -1

  for (let round = 1; round <= totalRounds; ++round) {
    var { newGrid, activeThisRound }: { newGrid: string[][]; activeThisRound: number } = nextRound(grid)
    grid = newGrid

    if (matchesPattern(grid, pattern)) {
      matchingRounds.push({ round, activeCount: activeThisRound })
    }

    const stateKey = gridToString(grid)
    if (seenStates.has(stateKey)) {
      cycleStart = seenStates.get(stateKey)!
      cycleLength = round - cycleStart
      break
    }
    seenStates.set(stateKey, round)
  }

  if (cycleLength === -1) {
    // No cycle found within totalRounds, just sum what we have
    return matchingRounds.reduce((sum, m) => sum + m.activeCount, 0)
  }

  // Separate matching rounds into pre-cycle and in-cycle
  const preCycleMatches = matchingRounds.filter(m => m.round < cycleStart)
  const inCycleMatches = matchingRounds.filter(m => m.round >= cycleStart)

  // Calculate total sum
  let totalSum = 0

  // Add all pre-cycle matches
  for (const m of preCycleMatches) {
    totalSum += m.activeCount
  }

  // Calculate how many full cycles fit and remaining rounds
  const remainingRounds = totalRounds - cycleStart + 1
  const fullCycles = Math.floor(remainingRounds / cycleLength)
  const partialRounds = remainingRounds % cycleLength

  // Sum of all in-cycle matches in one full cycle
  const cycleSum = inCycleMatches.reduce((sum, m) => sum + m.activeCount, 0)
  totalSum += fullCycles * cycleSum

  // Add partial cycle matches
  for (const m of inCycleMatches) {
    const offsetInCycle = m.round - cycleStart
    if (offsetInCycle < partialRounds) {
      totalSum += m.activeCount
    }
  }

  return totalSum
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
.#.##.
##..#.
..##.#
.#.##.
.###..
###.##`,
        expected: 200,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
#......#
..#..#..
.##..##.
...##...
...##...
.##..##.
..#..#..
#......#`,
        expected: 278388552,
      },
    ],
  },
} as EverybodyCodesContest
function nextRound(grid: string[][]) {
  const newGrid: string[][] = utils.grid.create(grid[0].length, grid.length, ".")
  let activeThisRound = 0
  for (let y = 0; y < grid.length; ++y) {
    for (let x = 0; x < grid[0].length; ++x) {
      const pos = new Vector2(x, y)
      const neighbors = [pos.move("down-left"), pos.move("up-left"), pos.move("up-right"), pos.move("down-right")]
      const activeNeighbors = neighbors.filter(n => utils.grid.at(grid, n) === "#").length
      const active =
        (utils.grid.at(grid, pos) === "#" && activeNeighbors % 2 === 1) ||
        (utils.grid.at(grid, pos) === "." && activeNeighbors % 2 === 0)
      if (active) {
        activeThisRound++
        utils.grid.set(newGrid, pos, "#")
      }
    }
  }
  return { newGrid, activeThisRound }
}
