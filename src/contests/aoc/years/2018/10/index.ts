import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { getBoudingBox2, Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 10

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [_, px, py, vx, vy] = line.match(/position=<\s*([0-9-]+),\s*([0-9-]+)> velocity=<\s*([0-9-]+),\s*([0-9-]+)>/)!
    const position = new Vector2(+px, +py)
    const velocity = new Vector2(+vx, +vy)
    return {
      position,
      velocity,
    }
  })
}

const KNOWN_LETTERS = {
  "######..#.......#.......#.......#####...#.......#.......#.......#.......######..": "E",
  "#....#..#...#...#..#....#.#.....##......##......#.#.....#..#....#...#...#....#..": "K",
  "#.......#.......#.......#.......#.......#.......#.......#.......#.......######..": "L",
  "#....#..##...#..##...#..#.#..#..#.#..#..#..#.#..#..#.#..#...##..#...##..#....#..": "N",
  "#####...#....#..#....#..#....#..#####...#.......#.......#.......#.......#.......": "P",
  "#####...#....#..#....#..#....#..#####...#..#....#...#...#...#...#....#..#....#..": "R",
  "#....#..#....#...#..#....#..#.....##......##.....#..#....#..#...#....#..#....#..": "X",
}

function solve(input: ReturnType<typeof parseInput>) {
  let stars = input
  let previousArea = getBoudingBox2(stars.map(star => star.position)).area
  let time = 0
  while (true) {
    const newStars = stars.map(star => ({
      position: star.position.add(star.velocity),
      velocity: star.velocity,
    }))
    const { area } = getBoudingBox2(newStars.map(star => star.position))
    if (area > previousArea) {
      // Area is increasing: we've gone too far
      const { topLeft, width, height } = getBoudingBox2(stars.map(star => star.position))
      if ((width + 2) % 8 === 0 && height === 10) {
        const letters = Array.from({ length: (width + 2) / 8 }, () => Array.from({ length: 80 }, () => "."))
        stars.forEach(star => {
          const x = star.position.x - topLeft.x
          const y = star.position.y - topLeft.y
          const letterIndex = Math.floor(x / 8)
          letters[letterIndex][y * 8 + (x % 8)] = "#"
        })
        const word = []
        for (const letter of letters) {
          const key = letter.join("") as keyof typeof KNOWN_LETTERS
          if (KNOWN_LETTERS[key]) {
            word.push(KNOWN_LETTERS[key])
          } else {
            utils.iterate.chunk(letter, 8).forEach(chunk => console.log(chunk.join("")))
            throw new Error(`Unknown letter: "${key}"`)
          }
        }
        return { time, word: word.join("") }
      } else {
        throw new Error(`Unexpected bounding box: ${width}x${height}`)
      }
    }
    previousArea = area
    stars = newStars
    ++time
  }
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return solve(input).word
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return solve(input).time
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
