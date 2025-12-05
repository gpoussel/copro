import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2021 - Day 13

function parseInput(input: string) {
  const [dotsInput, foldsInput] = utils.input.blocks(input)
  const dots = utils.input.lines(dotsInput).map(line => {
    const [x, y] = line.split(",").map(Number)
    return { x, y }
  })
  const folds = utils.input.lines(foldsInput).map(line => {
    const [, axis, value] = line.match(/fold along (x|y)=(\d+)/)!
    return { axis, value: Number(value) }
  })
  return { dots, folds }
}

function applyFold(grid: string[][], fold: { axis: string; value: number }) {
  if (fold.axis === "x") {
    const left = grid.map(row => row.slice(0, fold.value))
    const right = grid.map(row => row.slice(fold.value + 1).reverse())
    const newHeight = left.length
    const newWidth = Math.max(left[0].length, right[0].length)
    const newGrid = utils.grid.create(newWidth, newHeight, ".")
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const leftValue = left[y]?.[x] ?? "."
        const rightValue = right[y]?.[x] ?? "."
        newGrid[y][x] = leftValue === "#" || rightValue === "#" ? "#" : "."
      }
    }
    return newGrid
  } else if (fold.axis === "y") {
    const top = grid.slice(0, fold.value)
    const bottom = grid.slice(fold.value + 1).reverse()
    const newHeight = Math.max(top.length, bottom.length)
    const newWidth = top[0].length
    const newGrid = utils.grid.create(newWidth, newHeight, ".")
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const topValue = top[y]?.[x] ?? "."
        const bottomValue = bottom[y]?.[x] ?? "."
        newGrid[y][x] = topValue === "#" || bottomValue === "#" ? "#" : "."
      }
    }
    return newGrid
  }
  throw new Error(`Invalid fold axis: ${fold.axis}`)
}

function part1(inputString: string) {
  const { dots, folds } = parseInput(inputString)
  const xs = dots.map(dot => dot.x)
  const ys = dots.map(dot => dot.y)
  const { min: minX, max: maxX } = utils.iterate.minMax(xs)
  const { min: minY, max: maxY } = utils.iterate.minMax(ys)
  let grid = utils.grid.create(maxX - minX + 1, maxY - minY + 1, ".")
  const origin = new Vector2(minX, minY)
  for (const dot of dots) {
    const position = new Vector2(dot.x, dot.y)
    utils.grid.set(grid, position.subtract(origin), "#")
  }
  grid = applyFold(grid, folds[0])
  let count = 0
  utils.grid.iterate(grid, item => {
    if (item === "#") {
      count++
    }
  })
  return count
}

function part2(inputString: string) {
  const { dots, folds } = parseInput(inputString)
  const xs = dots.map(dot => dot.x)
  const ys = dots.map(dot => dot.y)
  const { min: minX, max: maxX } = utils.iterate.minMax(xs)
  const { min: minY, max: maxY } = utils.iterate.minMax(ys)
  let grid = utils.grid.create(maxX - minX + 1, maxY - minY + 1, ".")
  const origin = new Vector2(minX, minY)
  for (const dot of dots) {
    const position = new Vector2(dot.x, dot.y)
    utils.grid.set(grid, position.subtract(origin), "#")
  }
  for (const fold of folds) {
    grid = applyFold(grid, fold)
  }
  const letters = Array.from({ length: grid[0].length / 5 }, (_, letterIndex) =>
    Array.from({ length: 6 }, (_, row) => grid[row].slice(letterIndex * 5, (letterIndex + 1) * 5).join(""))
  )
  return utils.ocr.recognizeWord(letters)
}

const EXAMPLE = `
6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 17,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
