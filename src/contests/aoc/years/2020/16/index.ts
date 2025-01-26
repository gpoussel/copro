import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 16

function parseRule(rule: string) {
  const [name, ranges] = rule.split(": ")
  const [range1, range2] = ranges.split(" or ").map(r => r.split("-").map(Number))
  return { name, ranges: [range1, range2] }
}

function parseTicket(ticket: string) {
  return ticket.split(",").map(Number)
}

function parseInput(input: string) {
  const [rules, ownTicket, otherTickets] = utils.input.blocks(input)
  return {
    rules: utils.input.lines(rules).map(parseRule),
    ownTicket: parseTicket(utils.input.lines(ownTicket)[1]),
    otherTickets: utils.input.lines(otherTickets).slice(1).map(parseTicket),
  }
}

function mergeRanges(ranges: number[][]) {
  const sortedRanges = ranges.sort((a, b) => a[0] - b[0])
  const mergedRanges = [sortedRanges[0]]
  for (let i = 1; i < sortedRanges.length; i++) {
    const lastRange = mergedRanges[mergedRanges.length - 1]
    const currentRange = sortedRanges[i]
    if (currentRange[0] <= lastRange[1]) {
      lastRange[1] = Math.max(lastRange[1], currentRange[1])
    } else {
      mergedRanges.push(currentRange)
    }
  }
  return mergedRanges
}

function isValidNumber(value: number, ranges: number[][]) {
  for (const [min, max] of ranges) {
    if (value >= min && value <= max) return true
    if (min > value) return false
  }
  return false
}

function isMatchingRule(values: number[], ranges: number[][]) {
  return values.every(value => isValidNumber(value, ranges))
}

function part1(inputString: string) {
  const { rules, otherTickets } = parseInput(inputString)
  const ranges = mergeRanges(rules.flatMap(rule => rule.ranges))
  const invalidValues = otherTickets.flatMap(ticket => ticket.filter(value => !isValidNumber(value, ranges)))
  return invalidValues.reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const { rules, ownTicket, otherTickets } = parseInput(inputString)
  const ranges = mergeRanges(rules.flatMap(rule => rule.ranges.map(r => [...r])))
  const validTickets = otherTickets.filter(ticket => ticket.every(value => isValidNumber(value, ranges)))

  const unassignedIndexes = Array.from({ length: validTickets[0].length }, (_, i) => i)
  const unassignedRules = [...rules]
  const assignedRules = new Map<number, string>()
  while (unassignedIndexes.length > 0) {
    for (const rule of unassignedRules) {
      const matchingIndexes = unassignedIndexes.filter(index =>
        isMatchingRule(
          validTickets.map(ticket => ticket[index]),
          rule.ranges
        )
      )
      if (matchingIndexes.length === 1) {
        const index = matchingIndexes[0]
        assignedRules.set(index, rule.name)
        unassignedIndexes.splice(unassignedIndexes.indexOf(index), 1)
        unassignedRules.splice(unassignedRules.indexOf(rule), 1)
        break
      }
    }
  }
  return [...assignedRules.entries()]
    .filter(([, ruleName]) => ruleName.startsWith("departure"))
    .map(([index]) => ownTicket[index])
    .reduce((a, b) => a * b, 1)
}

const EXAMPLE1 = `
class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12`

const EXAMPLE2 = `
class: 0-1 or 4-19
row: 0-5 or 8-19
seat: 0-13 or 16-19

your ticket:
11,12,13

nearby tickets:
3,9,18
15,1,5
5,14,9`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 71,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE2,
        expected: 1,
      },
    ],
  },
} as AdventOfCodeContest
