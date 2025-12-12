import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes Story 2 - Quest 1

function parseInput(input: string) {
  const [grid, moves] = utils.input.blocks(input)
  return {
    grid: utils.input.readGrid(grid),
    moves: utils.input.lines(moves),
  }
}

function simulate(
  diagram: string[][],
  machineWidth: number,
  machineHeight: number,
  tokenSequence: string,
  tossSlot: number,
): number {
  let currentCol = (tossSlot - 1) * 2
  let behaviorIndex = 0

  for (let currentRow = 0; currentRow < machineHeight; currentRow++) {
    if (diagram[currentRow][currentCol] === "*") {
      const direction = tokenSequence[behaviorIndex]
      behaviorIndex++
      if (direction === "R") {
        if (currentCol + 1 >= machineWidth) {
          currentCol--
        } else {
          currentCol++
        }
      } else {
        // 'L'
        if (currentCol - 1 < 0) {
          currentCol++
        } else {
          currentCol--
        }
      }
    }
  }
  const finalSlot = Math.floor(currentCol / 2) + 1
  return Math.max(0, finalSlot * 2 - tossSlot)
}

function part1(inputString: string) {
  const input = parseInput(inputString)

  const diagram = input.grid
  const tokens = input.moves

  const machineHeight = diagram.length
  const machineWidth = diagram[0].length

  let totalCoinsWon = 0

  for (let i = 0; i < tokens.length; i++) {
    const tossSlot = i + 1
    totalCoinsWon += simulate(diagram, machineWidth, machineHeight, tokens[i], tossSlot)
  }

  return totalCoinsWon
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  const diagram = input.grid
  const tokens = input.moves

  if (!diagram || diagram.length === 0 || !tokens || tokens.length === 0) {
    return 0
  }

  const machineHeight = diagram.length
  const machineWidth = diagram[0].length
  const numSlots = Math.floor((machineWidth + 1) / 2)

  let totalMaxCoins = 0

  for (const tokenSequence of tokens) {
    let maxCoinsForThisToken = 0
    for (let tossSlot = 1; tossSlot <= numSlots; tossSlot++) {
      const coinsWon = simulate(diagram, machineWidth, machineHeight, tokenSequence, tossSlot)
      if (coinsWon > maxCoinsForThisToken) {
        maxCoinsForThisToken = coinsWon
      }
    }
    totalMaxCoins += maxCoinsForThisToken
  }

  return totalMaxCoins
}

function part3(inputString: string) {
  const input = parseInput(inputString)

  const diagram = input.grid
  const tokens = input.moves

  if (!diagram || diagram.length === 0 || !tokens || tokens.length === 0) {
    return "0 0"
  }

  const machineHeight = diagram.length
  const machineWidth = diagram[0].length
  const numTokens = tokens.length
  const numSlots = Math.floor((machineWidth + 1) / 2)

  const scores: number[][] = Array(numTokens)
    .fill(0)
    .map(() => Array(numSlots).fill(0))

  for (let i = 0; i < numTokens; i++) {
    for (let j = 0; j < numSlots; j++) {
      scores[i][j] = simulate(diagram, machineWidth, machineHeight, tokens[i], j + 1)
    }
  }

  function solveAssignment(matrix: number[][], mode: "min" | "max"): number {
    const n = matrix.length
    if (n === 0) return 0
    const usedCols = new Array(n).fill(false)
    let result = mode === "min" ? Infinity : -Infinity

    function find(row: number, currentSum: number) {
      if (row === n) {
        if (mode === "min") {
          result = Math.min(result, currentSum)
        } else {
          result = Math.max(result, currentSum)
        }
        return
      }
      for (let col = 0; col < n; col++) {
        if (!usedCols[col]) {
          usedCols[col] = true
          find(row + 1, currentSum + matrix[row][col])
          usedCols[col] = false
        }
      }
    }
    find(0, 0)
    return result
  }

  let globalMin = Infinity
  let globalMax = -Infinity

  function generateCombinations(startIndex: number, combo: number[]) {
    if (combo.length === numTokens) {
      const subMatrix = scores.map(tokenScores => combo.map(slotIndex => tokenScores[slotIndex]))
      globalMin = Math.min(globalMin, solveAssignment(subMatrix, "min"))
      globalMax = Math.max(globalMax, solveAssignment(subMatrix, "max"))
      return
    }
    if (startIndex >= numSlots) return
    for (let i = startIndex; i < numSlots; i++) {
      if (numSlots - i < numTokens - combo.length) break // Optimization
      combo.push(i)
      generateCombinations(i + 1, combo)
      combo.pop()
    }
  }

  generateCombinations(0, [])

  return `${globalMin} ${globalMax}`
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.
*.*.*...*.*...*..
.*.*.*.*.*...*.*.
*.*.....*...*.*.*
.*.*.*.*.*.*.*.*.
*...*...*.*.*.*.*
.*.*.*.*.*.*.*.*.
*.*.*...*.*.*.*.*
.*...*...*.*.*.*.
*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.

RRRLRLRRRRRL
LLLLRLRRRRRR
RLLLLLRLRLRL
LRLLLRRRLRLR
LLRLLRLLLRRL
LRLRLLLRRRRL
LRLLLLLLRLLL
RRLLLRLLRLRR
RLLLLLRLLLRL`,
        expected: 26,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*.*.*.*.
..*.*.*.*...*.*...*.*.*..
.*...*.*.*.*.*.*.....*.*.
*.*...*.*.*.*.*.*...*.*.*
.*.*.*.*.*.*.*.*.......*.
*.*.*.*.*.*.*.*.*.*...*..
.*.*.*.*.*.*.*.*.....*.*.
*.*...*.*.*.*.*.*.*.*....
.*.*.*.*.*.*.*.*.*.*.*.*.
*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*...*.*.
*.*.*.*.*.*.*.*.*...*.*.*
.*.*.*.*.*.*.*.*.....*.*.
*.*.*.*.*.*.*.*...*...*.*
.*.*.*.*.*.*.*.*.*.*.*.*.
*.*.*...*.*.*.*.*.*.*.*.*
.*...*.*.*.*...*.*.*...*.
*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*.*.*.*.

RRRLLRRRLLRLRRLLLRLR
RRRRRRRRRRLRRRRRLLRR
LLLLLLLLRLRRLLRRLRLL
RRRLLRRRLLRLLRLLLRRL
RLRLLLRRLRRRLRRLRRRL
LLLLLLLLRLLRRLLRLLLL
LRLLRRLRLLLLLLLRLRRL
LRLLRRLLLRRRRRLRRLRR
LRLLRRLRLLRLRRLLLRLL
RLLRRRRLRLRLRLRLLRRL`,
        expected: 115,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.
*.*.*...*.*...*..
.*.*.*.*.*...*.*.
*.*.....*...*.*.*
.*.*.*.*.*.*.*.*.
*...*...*.*.*.*.*
.*.*.*.*.*.*.*.*.
*.*.*...*.*.*.*.*
.*...*...*.*.*.*.
*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.

RRRLRLRRRRRL
LLLLRLRRRRRR
RLLLLLRLRLRL
LRLLLRRRLRLR
LLRLLRLLLRRL
LRLRLLLRRRRL`,
        expected: "13 43",
      },
      {
        input: `
*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*.*.*.*.
..*.*.*.*...*.*...*.*.*..
.*...*.*.*.*.*.*.....*.*.
*.*...*.*.*.*.*.*...*.*.*
.*.*.*.*.*.*.*.*.......*.
*.*.*.*.*.*.*.*.*.*...*..
.*.*.*.*.*.*.*.*.....*.*.
*.*...*.*.*.*.*.*.*.*....
.*.*.*.*.*.*.*.*.*.*.*.*.
*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*...*.*.
*.*.*.*.*.*.*.*.*...*.*.*
.*.*.*.*.*.*.*.*.....*.*.
*.*.*.*.*.*.*.*...*...*.*
.*.*.*.*.*.*.*.*.*.*.*.*.
*.*.*...*.*.*.*.*.*.*.*.*
.*...*.*.*.*...*.*.*...*.
*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*.*.*.*.

RRRLLRRRLLRLRRLLLRLR
RRRRRRRRRRLRRRRRLLRR
LLLLLLLLRLRRLLRRLRLL
RRRLLRRRLLRLLRLLLRRL
RLRLLLRRLRRRLRRLRRRL
LLLLLLLLRLLRRLLRLLLL`,
        expected: "25 66",
      },
      {
        input: `
*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.
..*.*.*.*.*.*.........*.*.*.*.....*.*.*
.*.*...*.*.*.*.*.*.*.*.*.*.*...*.*.*.*.
*.*.*.*...*.*.*.*.*.....*.*.*.*...*.*..
.*...*.*...*.*.*.*.*.*.*.....*.*.*.*.*.
*.*.*.*.*.....*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*...*.*.*.*.....*.*.*.*...*.
*.*...*.*.*.*.*.*.*.*...*.*.*...*.*.*.*
.*...*.*.*.*.*.*.*.*...*.*.*.*.*.*.*.*.
*.*.*.*.*.*...*.....*.*...*...*.*.*.*.*
.*...*.*.*.*.*...*.*.*.*.*...*.*...*.*.
*.*.*.*.*...*.*.*.*.*.*.*.*...*.*.*.*.*
.*.*.*.*.*.*.*.*...*.*.*.*.*.*.*.*.*.*.
....*.*.*.*...*.*.*.*.*.*.*...*.*.*...*
.*.*.*...*.*.*.*.*...*.*.*.*.*.*.*.*...
*.*.*.*.*.*.*.....*...*...*.*.*.*.*.*.*
.*.*...*.....*.*.*.*.*.*.*...*.*.*.*.*.
*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*
.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.

RRRRLLRRLLLLLLLRLLRL
RRRRRRRLRRLRRLRRRLRR
RRRLLRRRRRLRRRRRLRRR
LLLLRRLLRRLLLLLRRLLL
LRRRRLRRLRLLRLLRRLRR
RRRRRRRRLRRRRLLRRRLR`,
        expected: "39 122",
      },
    ],
  },
} as EverybodyCodesContest
