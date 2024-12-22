import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { breadthFirstSearch, dijkstraOnGrid } from "../../../../../utils/algo.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2017 - Day 19

function parseInput(input: string) {
  return input
    .split(/\r?\n/)
    .filter(r => r.length > 0)
    .map(line => line.split(""))
}

function solve(inputString: string) {
  const grid = parseInput(inputString)
  const startingX = grid[0].indexOf("|")

  interface Node {
    position: Vector2
    direction: Direction
    letters: number
  }

  const lettersToCollect: string[] = []
  utils.grid.map(grid, (cell, position) => {
    if (cell >= "A" && cell <= "Z") {
      lettersToCollect.push(cell)
    }
  })

  const result = breadthFirstSearch<Node>(
    {
      position: new Vector2(startingX, 0),
      direction: "down",
      letters: 0,
    },
    {
      adjacents(node) {
        const { position, direction, letters } = node
        const nextPositionInDirection = position.move(direction)
        const nextCellInDirection = utils.grid.at(grid, nextPositionInDirection)
        if (nextCellInDirection >= "A" && nextCellInDirection <= "Z") {
          return [{ position: nextPositionInDirection, direction, letters: letters + 1 }]
        }
        if (direction === "down" || direction === "up") {
          if (nextCellInDirection === "|" || nextCellInDirection === "-") {
            return [{ position: nextPositionInDirection, direction, letters }]
          } else if (nextCellInDirection === "+") {
            if (utils.grid.at(grid, nextPositionInDirection.move("left")) !== " ") {
              return [{ position: nextPositionInDirection, direction: "left", letters }]
            } else if (utils.grid.at(grid, nextPositionInDirection.move("right")) !== " ") {
              return [{ position: nextPositionInDirection, direction: "right", letters }]
            }
          }
        }
        if (direction === "left" || direction === "right") {
          if (nextCellInDirection === "-" || nextCellInDirection === "|") {
            return [{ position: nextPositionInDirection, direction, letters }]
          } else if (nextCellInDirection === "+") {
            if (utils.grid.at(grid, nextPositionInDirection.move("up")) !== " ") {
              return [{ position: nextPositionInDirection, direction: "up", letters }]
            } else if (utils.grid.at(grid, nextPositionInDirection.move("down")) !== " ") {
              return [{ position: nextPositionInDirection, direction: "down", letters }]
            }
          }
        }
        return []
      },
      ends(node) {
        return node.letters === lettersToCollect.length
      },
      key(node) {
        return `${node.position.str()},${node.direction}`
      },
      distance(from, to) {
        return 1
      },
    }
  )
  return {
    letters: result.path
      .map(node => utils.grid.at(grid, node.position))
      .filter(c => c >= "A" && c <= "Z")
      .join(""),
    length: result.path.length + 1,
  }
}

function part1(inputString: string) {
  return solve(inputString).letters
}

function part2(inputString: string) {
  return solve(inputString).length
}

const EXAMPLE = `
     |          
     |  +--+    
     A  |  C    
 F---|----E|--+ 
     |  |  |  D 
     +B-+  +--+ 
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: "ABCDEF",
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 38,
      },
    ],
  },
} as AdventOfCodeContest
