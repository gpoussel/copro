import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 2

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [gameNumber, drawsStr] = line.split(": ")
    const draws = drawsStr.split(";").map(pStr => {
      const balls = pStr.trim().split(/\s*,\s*/)
      const counts: Record<string, number> = {}
      for (const ball of balls) {
        const count = +ball.split(" ")[0]
        const color = ball.split(" ")[1]
        counts[color] = count
      }
      return counts
    })
    return { number: +gameNumber.replace("Game ", ""), draws }
  })
}

function part1(inputString: string) {
  const games = parseInput(inputString)
  return games
    .filter(game =>
      game.draws.every(
        draw => (!draw.red || draw.red <= 12) && (!draw.green || draw.green <= 13) && (!draw.blue || draw.blue <= 14)
      )
    )
    .reduce((acc, game) => acc + game.number, 0)
}

function part2(inputString: string) {
  const games = parseInput(inputString)
  return games
    .map(game => {
      const maxRed = Math.max(...game.draws.map(draw => (draw.red !== undefined ? draw.red : 0)))
      const maxBlue = Math.max(...game.draws.map(draw => (draw.blue !== undefined ? draw.blue : 0)))
      const maxGreen = Math.max(...game.draws.map(draw => (draw.green !== undefined ? draw.green : 0)))
      return maxRed * maxBlue * maxGreen
    })
    .reduce((acc, val) => acc + val, 0)
}

const EXAMPLE = `
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 8,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 2286,
      },
    ],
  },
} as AdventOfCodeContest
