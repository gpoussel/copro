import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch, dijkstraOnGraph } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2016 - Day 11

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    if (line.includes("nothing relevant")) {
      return []
    }
    const generatorMatches = [...line.matchAll(/(\w+) generator/g)]
    const microchipMatches = [...line.matchAll(/(\w+)-compatible microchip/g)]
    return [...generatorMatches.map(match => match[1] + "G"), ...microchipMatches.map(match => match[1] + "M")]
  })
}

function isFloorSafe(floor: string[]) {
  const generators = floor.filter(item => item.endsWith("G")).map(item => item.slice(0, item.length - 1))
  const microchips = floor.filter(item => item.endsWith("M")).map(item => item.slice(0, item.length - 1))
  return microchips.every(microchip => generators.includes(microchip) || generators.length === 0)
}

function getPossibleElevatorContent(floor: string[], upstairs: boolean) {
  return [
    ...floor.filter(item => item.endsWith("G")).map(item => [item]),
    ...floor.filter(item => item.endsWith("M")).map(item => [item]),
    ...floor.flatMap((item1, i) => floor.map((item2, j) => [item1, item2]).filter(([a, b]) => a !== b)),
  ]
    .map(content => content.sort())
    .filter((content, index, array) => {
      return array.findIndex(c => JSON.stringify(c) === JSON.stringify(content)) === index
    })
    .filter((content, index, array) => {
      if (
        content.length === 2 &&
        content[0].substring(0, content[0].length - 1) === content[1].substring(0, content[1].length - 1)
      ) {
        return (
          array.findIndex(
            c => c.length === 2 && c[0].substring(0, c[0].length - 1) === c[1].substring(0, c[1].length - 1)
          ) === index
        )
      }
      return true
    })
    .filter((content, _, array) => {
      if (upstairs && array.some(c => c.length === 2)) {
        return content.length === 2
      } else if (!upstairs && array.some(c => c.length === 1)) {
        return content.length === 1
      }
    })
}

function solve(floors: string[][]) {
  interface State {
    elevator: number
    floors: string[][]
  }
  const allElements = floors.flat()
  const initialState: State = {
    elevator: 0,
    floors: [...floors],
  }

  const { distance } = breadthFirstSearch(initialState, {
    adjacents(node) {
      const { elevator, floors } = node
      const allFloorsBelowEmpty = floors.slice(0, elevator).every(floor => floor.length === 0)
      const reachableFloors = [...(elevator > 0 && allFloorsBelowEmpty ? [] : [elevator - 1]), elevator + 1].filter(
        floor => floor >= 0 && floor < floors.length
      )
      return reachableFloors.flatMap(targetFloor =>
        getPossibleElevatorContent(floors[elevator], targetFloor > elevator).flatMap(elevatorContent => {
          const currentFloorContent = floors[elevator].filter(item => !elevatorContent.includes(item))
          const targetFloorContent = [...floors[targetFloor], ...elevatorContent]
          if (!isFloorSafe(currentFloorContent) || !isFloorSafe(targetFloorContent)) return []
          return [
            {
              elevator: targetFloor,
              floors: floors.map((floor, index) => {
                if (index === elevator) return currentFloorContent
                if (index === targetFloor) return targetFloorContent
                return floor
              }),
            },
          ]
        })
      )
    },
    ends(node) {
      return node.elevator === floors.length - 1 && node.floors[floors.length - 1].length === allElements.length
    },
    key(node) {
      return JSON.stringify({ elevator: node.elevator, floors: node.floors.map(floor => floor.sort()) })
    },
  })
  return distance
}

function part1(inputString: string) {
  const floors = parseInput(inputString)
  return solve(floors)
}

function part2(inputString: string) {
  const floors = parseInput(inputString)
  floors[0].push("eleriumG", "eleriumM", "dilithiumG", "dilithiumM")
  return solve(floors)
}

const EXAMPLE = `
The first floor contains a hydrogen-compatible microchip and a lithium-compatible microchip.
The second floor contains a hydrogen generator.
The third floor contains a lithium generator.
The fourth floor contains nothing relevant.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 11,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
