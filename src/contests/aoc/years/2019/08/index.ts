import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 8

const IMAGE_WIDTH = 25
const IMAGE_HEIGHT = 6
const SIZE_OF_LAYER = IMAGE_WIDTH * IMAGE_HEIGHT

const LETTERS = {
  " ##  #  # #    #    #  #  ##  ": "C",
  " ##  #  # #    # ## #  #  ### ": "G",
  "#  # #  # #### #  # #  # #  # ": "H",
  "#    #    #    #    #    #### ": "L",
  "###  #  # #  # ###  #    #    ": "P",
}

function parseInput(input: string) {
  return utils.input.firstLine(input).split("").map(Number)
}

function part1(inputString: string) {
  const pixels = parseInput(inputString)
  const layerContent = utils.iterate.chunk(pixels, SIZE_OF_LAYER)
  const layerWithFewestZeroes = utils.iterate.minBy(layerContent, (layer1, layer2) => {
    const zeroes1 = layer1.filter(pixel => pixel === 0).length
    const zeroes2 = layer2.filter(pixel => pixel === 0).length
    return zeroes1 - zeroes2
  })
  const ones = layerWithFewestZeroes.filter(pixel => pixel === 1).length
  const twos = layerWithFewestZeroes.filter(pixel => pixel === 2).length
  return ones * twos
}

function part2(inputString: string) {
  const pixels = parseInput(inputString)
  const layerContent = utils.iterate.chunk(pixels, SIZE_OF_LAYER)
  const grid = utils.grid.create(IMAGE_WIDTH, IMAGE_HEIGHT, 2)
  for (const layer of layerContent) {
    for (const [index, pixel] of layer.entries()) {
      const x = index % IMAGE_WIDTH
      const y = Math.floor(index / IMAGE_WIDTH)
      if (grid[y][x] === 2) {
        grid[y][x] = pixel
      }
    }
  }

  const word = []
  for (let letterIndex = 0; letterIndex < 5; letterIndex++) {
    const letterArray = grid
      .flatMap(row => row.slice(letterIndex * 5, (letterIndex + 1) * 5))
      .map(c => (c === 1 ? "#" : " "))
      .join("")
    word.push(LETTERS[letterArray as keyof typeof LETTERS] || "?")
  }
  return word.join("")
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
