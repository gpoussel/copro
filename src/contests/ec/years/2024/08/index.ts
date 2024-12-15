import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2024 - Quest 8

function parseInput(input: string) {
  return parseInt(input, 10)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const sqrt = Math.floor(Math.sqrt(input))
  const square = (sqrt + 1) ** 2
  const baseWidth = 2 * sqrt + 1
  const missing = square - input
  return baseWidth * missing
}

function part2(inputString: string) {
  const priests = parseInput(inputString)
  const constructions = [
    {
      thickness: 1,
      baseWidth: 1,
      number: 1,
    },
  ]
  const numberOfBlocks = priests < 10 ? 50 : 20240000
  while (constructions[constructions.length - 1].number < numberOfBlocks) {
    const lastConstruction = constructions[constructions.length - 1]
    const lastThickness = lastConstruction.thickness
    const nextThickness = (lastThickness * priests) % (priests < 10 ? 5 : 1111)
    const nextBaseWidth = lastConstruction.baseWidth + 2
    constructions.push({
      thickness: nextThickness,
      baseWidth: nextBaseWidth,
      number: lastConstruction.number + nextBaseWidth * nextThickness,
    })
  }
  const lastConstruction = constructions[constructions.length - 1]
  const baseWidth = lastConstruction.baseWidth
  const missing = lastConstruction.number - numberOfBlocks
  return baseWidth * missing
}

function part3(inputString: string) {
  const priests = parseInput(inputString)
  const constructions = [
    {
      thickness: 1,
      baseWidth: 1,
      number: 1,
      columnHeights: [1],
    },
  ]
  const numberOfAcolytes = priests < 10000 ? 5 : 10
  const numberOfBlocks = priests < 10000 ? 160 : 202400000
  while (constructions[constructions.length - 1].number < numberOfBlocks) {
    const lastConstruction = constructions[constructions.length - 1]
    const lastThickness = lastConstruction.thickness
    const nextThickness = ((lastThickness * priests) % numberOfAcolytes) + numberOfAcolytes
    const nextBaseWidth = lastConstruction.baseWidth + 2
    const nextColumnHeights = [
      nextThickness,
      ...lastConstruction.columnHeights.map(h => h + nextThickness),
      nextThickness,
    ]
    constructions.push({
      thickness: nextThickness,
      baseWidth: nextBaseWidth,
      number: lastConstruction.number + nextColumnHeights.length * nextThickness,
      columnHeights: nextColumnHeights,
    })
  }
  const lastConstruction = constructions[constructions.length - 1]
  const removedBlocks = lastConstruction.columnHeights.map((h, idx) => {
    if (idx === 0 || idx === lastConstruction.columnHeights.length - 1) {
      return 0
    }
    return (priests * lastConstruction.baseWidth * h) % numberOfAcolytes
  })
  const totalRemovedBlocks = removedBlocks.reduce((acc, b) => acc + b, 0)
  const necessaryBlocks = lastConstruction.number - totalRemovedBlocks
  return necessaryBlocks - numberOfBlocks
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `3`,
        expected: 3,
      },
      {
        input: `13`,
        expected: 21,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `3`,
        expected: 27,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `2`,
        expected: 2,
      },
    ],
  },
} as EverybodyCodesContest
