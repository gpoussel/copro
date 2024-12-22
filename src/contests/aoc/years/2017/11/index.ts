import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2017 - Day 11

function parseInput(input: string) {
  return utils.input.firstLine(input).split(",")
}

function distanceToStart(position: Vector3) {
  return (Math.abs(position.x) + Math.abs(position.y) + Math.abs(position.z)) / 2
}

function solve(inputString: string) {
  const input = parseInput(inputString)
  let position = new Vector3(0, 0, 0)
  let visited = new VectorSet<Vector3>()
  for (const direction of input) {
    if (direction === "n") position = position.add(new Vector3(0, 1, -1))
    if (direction === "ne") position = position.add(new Vector3(1, 0, -1))
    if (direction === "se") position = position.add(new Vector3(1, -1, 0))
    if (direction === "s") position = position.add(new Vector3(0, -1, 1))
    if (direction === "sw") position = position.add(new Vector3(-1, 0, 1))
    if (direction === "nw") position = position.add(new Vector3(-1, 1, 0))
    visited.add(position)
  }
  return {
    endDistance: distanceToStart(position),
    maxDistance: utils.iterate.max(visited.map(distanceToStart)),
  }
}

function part1(inputString: string) {
  return solve(inputString).endDistance
}

function part2(inputString: string) {
  return solve(inputString).maxDistance
}

const EXAMPLE = ``

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: "ne,ne,ne",
        expected: 3,
      },
      {
        input: "ne,ne,sw,sw",
        expected: 0,
      },
      {
        input: "ne,ne,s,s",
        expected: 2,
      },
      {
        input: "se,sw,se,sw,sw",
        expected: 3,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
