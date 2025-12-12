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

function part1(inputString: string) {
  const input = parseInput(inputString)

  const diagram = input.grid
  const tokens = input.moves

  const machineHeight = diagram.length
  const machineWidth = diagram[0].length

  let totalCoinsWon = 0

  for (let i = 0; i < tokens.length; i++) {
    const tossSlot = i + 1
    const tokenSequence = tokens[i]

    let currentCol = (tossSlot - 1) * 2
    let behaviorIndex = 0

    for (let currentRow = 0; currentRow < machineHeight; currentRow++) {
      if (diagram[currentRow][currentCol] === "*") {
        const direction = tokenSequence[behaviorIndex]
        behaviorIndex++

        if (direction === "R") {
          if (currentCol + 1 >= machineWidth) {
            currentCol-- // Bounce left from right wall
          } else {
            currentCol++
          }
        } else {
          // direction === "L"
          if (currentCol - 1 < 0) {
            currentCol++ // Bounce right from left wall
          } else {
            currentCol--
          }
        }
      }
    }

    const finalSlot = Math.floor(currentCol / 2) + 1
    const coinsWon = finalSlot * 2 - tossSlot

    if (coinsWon > 0) {
      totalCoinsWon += coinsWon
    }
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
      let currentCol = (tossSlot - 1) * 2
      let behaviorIndex = 0

      for (let currentRow = 0; currentRow < machineHeight; currentRow++) {
        if (diagram[currentRow][currentCol] === "*") {
          const direction = tokenSequence[behaviorIndex]
          behaviorIndex++

          if (direction === "R") {
            if (currentCol + 1 >= machineWidth) {
              currentCol-- // Bounce left from right wall
            } else {
              currentCol++
            }
          } else {
            // direction === "L"
            if (currentCol - 1 < 0) {
              currentCol++ // Bounce right from left wall
            } else {
              currentCol--
            }
          }
        }
      }

      const finalSlot = Math.floor(currentCol / 2) + 1
      const coinsWon = Math.max(0, finalSlot * 2 - tossSlot)

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
  return
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
        input: ``,
        expected: undefined,
      },
    ],
  },
} as EverybodyCodesContest
