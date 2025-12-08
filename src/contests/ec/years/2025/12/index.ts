import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2025 - Quest 12

function parseInput(input: string) {
  return utils.input.readGrid(input).map(row => row.map(Number))
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const { filledCount } = utils.grid.floodFill(grid, new Vector2(0, 0), -1, {
    validNeighbor(currentValue, neighborValue) {
      return currentValue >= neighborValue
    },
  })
  return filledCount
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const options = {
    validNeighbor(currentValue: number, neighborValue: number) {
      return currentValue >= neighborValue && neighborValue !== -1
    },
  }
  const { filledCount: firstPart } = utils.grid.floodFill(grid, new Vector2(0, 0), -1, options)
  const { filledCount: secondPart } = utils.grid.floodFill(
    grid,
    new Vector2(grid[0].length - 1, grid.length - 1),
    -1,
    options
  )
  return firstPart + secondPart
}

function part3(inputString: string) {
  const grid = parseInput(inputString)
  const options = {
    validNeighbor(currentValue: number, neighborValue: number) {
      return currentValue >= neighborValue && neighborValue !== -1
    },
  }
  function findBestPosition(grid: number[][]) {
    const bestPosition = {
      position: undefined as Vector2 | undefined,
      score: -Infinity,
      grid: undefined as number[][] | undefined,
    }
    for (let y = 0; y < grid.length; ++y) {
      for (let x = 0; x < grid[0].length; ++x) {
        const newGrid = utils.grid.clone(grid)
        const { filledCount } = utils.grid.floodFill(newGrid, new Vector2(x, y), -1, options)
        if (filledCount > bestPosition.score) {
          bestPosition.position = new Vector2(x, y)
          bestPosition.score = filledCount
          bestPosition.grid = newGrid
        }
      }
    }
    return bestPosition
  }
  const topPosition = findBestPosition(grid)
  const secondPosition = findBestPosition(topPosition.grid!)
  const thirdPosition = findBestPosition(secondPosition.grid!)
  return topPosition.score + secondPosition.score + thirdPosition.score
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
989601
857782
746543
766789`,
        expected: 16,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
9589233445
9679121695
8469121876
8352919876
7342914327
7234193437
6789193538
6781219648
5691219769
5443329859`,
        expected: 58,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
5411
3362
5235
3112`,
        expected: 14,
      },
      {
        input: `
41951111131882511179
32112222211518122215
31223333322115122219
31234444432147511128
91223333322176121892
61112222211166431583
14661111166111111746
11111119142122222177
41222118881233333219
71222127839122222196
56111126279711111517`,
        expected: 136,
      },
    ],
  },
} as EverybodyCodesContest
