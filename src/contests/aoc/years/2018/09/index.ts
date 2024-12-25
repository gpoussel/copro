import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { RingBuffer } from "../../../../../utils/structures/ring-buffer.js"

// 🎄 Advent of Code 2018 - Day 9

function parseInput(input: string) {
  const line = utils.input.firstLine(input)
  const [players, lastMarble] = line.match(/\d+/g)!.map(Number)
  return { players, lastMarble }
}

function solve(players: number, lastMarble: number) {
  const marbles = new RingBuffer<number>()
  marbles.push(0)
  let currentPlayer = 0
  let playerScores = Array(players).fill(0)
  for (let i = 1; i <= lastMarble; i++) {
    if (i % 23 === 0) {
      playerScores[currentPlayer] += i
      marbles.rotate(-7)
      const droppedMarble = marbles.remove()
      playerScores[currentPlayer] += droppedMarble
    } else {
      marbles.rotate(1)
      marbles.push(i)
    }
    currentPlayer = (currentPlayer + 1) % players

    utils.log.logEvery(i, 1_000_000)
  }
  return utils.iterate.max(playerScores)
}

function part1(inputString: string) {
  const { players, lastMarble } = parseInput(inputString)
  return solve(players, lastMarble)
}

function part2(inputString: string) {
  const { players, lastMarble } = parseInput(inputString)
  return solve(players, lastMarble * 100)
}

export default {
  part1: {
    run: part1,
    tests: [
      { input: "9 players; last marble is worth 25 points", expected: 32 },
      { input: "10 players; last marble is worth 1618 points", expected: 8317 },
      { input: "13 players; last marble is worth 7999 points", expected: 146373 },
      { input: "17 players; last marble is worth 1104 points", expected: 2764 },
      { input: "21 players; last marble is worth 6111 points", expected: 54718 },
      { input: "30 players; last marble is worth 5807 points", expected: 37305 },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
