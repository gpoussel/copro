import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 22

function parseInput(input: string) {
  const blocks = utils.input.blocks(input)
  return blocks.map(block => utils.input.lines(block).slice(1).map(Number))
}

function computeScore(deck: number[]) {
  return deck
    .slice()
    .reverse()
    .reduce((acc, card, index) => acc + card * (index + 1), 0)
}

function part1(inputString: string) {
  const playerDecks = parseInput(inputString)
  while (playerDecks.every(deck => deck.length > 0)) {
    const playerTopCards = playerDecks.map(deck => deck.shift()!)
    const roundWinner = playerTopCards.indexOf(Math.max(...playerTopCards))
    const roundCards = playerTopCards.sort((a, b) => b - a)
    playerDecks[roundWinner].push(...roundCards)
  }
  const winnerDeck = playerDecks.find(deck => deck.length > 0)!
  return computeScore(winnerDeck)
}

function getWinnerId(playerDecks: number[][]): number {
  const previousRounds = new Set<string>()
  while (playerDecks.every(deck => deck.length > 0)) {
    const roundDecks = playerDecks.map(deck => deck.join(",")).join("|")
    if (previousRounds.has(roundDecks)) {
      return 0
    }
    previousRounds.add(roundDecks)
    const playerTopCards = playerDecks.map(deck => deck.shift()!)
    let roundWinner = undefined
    let roundCards = undefined
    if (playerDecks.every((deck, i) => deck.length >= playerTopCards[i])) {
      const subGameDecks = playerDecks.map((deck, i) => deck.slice(0, playerTopCards[i]))
      roundWinner = getWinnerId(subGameDecks)
      roundCards = [playerTopCards[roundWinner], playerTopCards[1 - roundWinner]]
    } else {
      roundWinner = playerTopCards.indexOf(Math.max(...playerTopCards))
      roundCards = playerTopCards.sort((a, b) => b - a)
    }
    playerDecks[roundWinner].push(...roundCards)
  }
  return playerDecks.findIndex(deck => deck.length > 0)!
}

function part2(inputString: string) {
  const playerDecks = parseInput(inputString)
  const winner = getWinnerId(playerDecks)
  return computeScore(playerDecks[winner])
}

const EXAMPLE = `
Player 1:
9
2
6
3
1

Player 2:
5
8
4
7
10`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 306,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 291,
      },
    ],
  },
} as AdventOfCodeContest
