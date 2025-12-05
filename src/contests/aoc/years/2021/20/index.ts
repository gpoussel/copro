import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 20

function parseInput(input: string) {
  const [algorithm, imageBlock] = utils.input.blocks(input)
  const image = utils.input.readGrid(imageBlock)
  return { algorithm, image }
}

function enhanceImage(grid: string[][], algorithm: string, infinitePixel: string) {
  const result = utils.grid.create<string>(grid.length + 2, grid[0].length + 2, ".")
  for (let r = -1; r <= grid.length; r++) {
    for (let c = -1; c <= grid[0].length; c++) {
      let index = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          index <<= 1
          const rr = r + dr
          const cc = c + dc
          let pixel: string
          if (rr >= 0 && rr < grid.length && cc >= 0 && cc < grid[0].length) {
            pixel = grid[rr][cc]
          } else {
            pixel = infinitePixel
          }
          if (pixel === "#") {
            index |= 1
          }
        }
      }
      result[r + 1][c + 1] = algorithm[index]
    }
  }
  return result
}

function countLitPixels(grid: string[][]): number {
  let count = 0
  utils.grid.iterate(grid, cell => {
    if (cell === "#") {
      count++
    }
  })
  return count
}

function enhanceTimes(grid: string[][], algorithm: string, times: number): string[][] {
  let image = grid
  let infinitePixel = "."
  for (let i = 0; i < times; i++) {
    image = enhanceImage(image, algorithm, infinitePixel)
    infinitePixel = infinitePixel === "." ? algorithm[0] : algorithm[511]
  }
  return image
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return countLitPixels(enhanceTimes(input.image, input.algorithm, 2))
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return countLitPixels(enhanceTimes(input.image, input.algorithm, 50))
}

const EXAMPLE = `
..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#

#..#.
#....
##..#
..#..
..###`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 35,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 3351,
      },
    ],
  },
} as AdventOfCodeContest
