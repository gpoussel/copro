import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGraph } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2019 - Day 20

const WALL = "#"
const EMPTY = "."

function parseInput(input: string) {
  const grid = input
    .split(/\n/)
    .filter(l => l.length > 0)
    .map(l => l.split(""))
  const innerLocations = new Map<string, Vector2>()
  const outerLocations = new Map<string, Vector2>()
  function recordNamedLocation(name: string, position: Vector2, side: "inner" | "outer") {
    const namedLocations = side === "inner" ? innerLocations : outerLocations
    namedLocations.set(name, position)
  }
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const position = new Vector2(j, i)
      const cell = utils.grid.at(grid, position)
      if (utils.string.isUpperCaseLetter(cell)) {
        const rightCell = utils.grid.at(grid, position.move("right"))
        if (utils.string.isUpperCaseLetter(rightCell)) {
          const name = cell + rightCell
          const leftCell = utils.grid.at(grid, position.move("left"))
          if (leftCell === EMPTY) {
            // The label is to the right of the teleporter node
            const side = utils.grid.at(grid, position.move("right", 2)) === undefined ? "outer" : "inner"
            recordNamedLocation(name, position.move("left"), side)
          } else {
            // The label is to the left of the teleporter node
            const side = utils.grid.at(grid, position.move("left")) === undefined ? "outer" : "inner"
            recordNamedLocation(name, position.move("right", 2), side)
          }
          utils.grid.set(grid, position, WALL)
          utils.grid.set(grid, position.move("right"), WALL)
        } else {
          const bottomCell = utils.grid.at(grid, position.move("down"))
          if (utils.string.isUpperCaseLetter(bottomCell)) {
            const name = cell + bottomCell
            const topCell = utils.grid.at(grid, position.move("up"))
            if (topCell === EMPTY) {
              // The label is below the teleporter node
              const side = utils.grid.at(grid, position.move("down", 2)) === undefined ? "outer" : "inner"
              recordNamedLocation(name, position.move("up"), side)
            } else {
              // The label is above the teleporter node
              const side = utils.grid.at(grid, position.move("up")) === undefined ? "outer" : "inner"
              recordNamedLocation(name, position.move("down", 2), side)
            }
            utils.grid.set(grid, position, WALL)
            utils.grid.set(grid, position.move("down"), WALL)
          } else {
            throw new Error(`Invalid named location at ${position.str()} (${cell})`)
          }
        }
      }
    }
  }
  const startPosition = outerLocations.get("AA")!
  const endPosition = outerLocations.get("ZZ")!
  outerLocations.delete("AA")
  outerLocations.delete("ZZ")
  const namedLocations = new Map<string, { inner: Vector2; outer: Vector2 }>()
  for (const [name, position] of innerLocations) {
    const outerPosition = outerLocations.get(name)
    if (outerPosition) {
      namedLocations.set(name, { inner: position, outer: outerPosition })
    } else {
      throw new Error(`Invalid named location at ${position.str()} (${name}) - no outer position`)
    }
  }
  return { grid, namedLocations, startPosition, endPosition }
}

function getNamedLocationsByPosition(namedLocations: Map<string, { inner: Vector2; outer: Vector2 }>) {
  const namedLocationsByPosition = new Map<string, string>()
  for (const [name, positions] of namedLocations) {
    namedLocationsByPosition.set(positions.inner.str(), name)
    namedLocationsByPosition.set(positions.outer.str(), name)
  }
  return namedLocationsByPosition
}

interface DijkstraNode {
  level: number
  position: Vector2
}

function getTeleportMovesWithLevels(node: DijkstraNode, otherPositions: { inner: Vector2; outer: Vector2 }) {
  if (otherPositions.inner.equals(node.position)) {
    // Exiting from inner loop: increasing the level
    return { position: otherPositions.outer, level: node.level + 1 }
  } else {
    // Exiting from outer loop: reducing the level
    if (node.level > 0) {
      return { position: otherPositions.inner, level: node.level - 1 }
    }
  }
}

function getTeleportMovesWithoutLevels(node: DijkstraNode, otherPositions: { inner: Vector2; outer: Vector2 }) {
  return {
    position: otherPositions.inner.equals(node.position) ? otherPositions.outer : otherPositions.inner,
    level: node.level,
  }
}

function solve(
  input: ReturnType<typeof parseInput>,
  teleportFn: (node: DijkstraNode, otherPositions: { inner: Vector2; outer: Vector2 }) => DijkstraNode | undefined
) {
  const { grid, namedLocations, startPosition, endPosition } = input
  const namedLocationsByPosition = getNamedLocationsByPosition(namedLocations)
  const result = dijkstraOnGraph<DijkstraNode>(
    [{ position: startPosition, level: 0 }],
    [{ position: endPosition, level: 0 }],
    {
      equals(a, b) {
        return a.position.equals(b.position) && a.level === b.level
      },
      key(node) {
        return node.position.str() + ";" + node.level
      },
      moves(node) {
        const moves = []
        for (const neighbor of node.position.plusShapeNeighbors()) {
          const neighborCell = utils.grid.at(grid, neighbor)
          if (neighborCell === EMPTY) {
            moves.push({ position: neighbor, level: node.level })
          }
        }
        const teleportMoves = []
        const name = namedLocationsByPosition.get(node.position.str())
        if (name) {
          const otherPositions = namedLocations.get(name)!
          const teleportMove = teleportFn(node, otherPositions)
          if (teleportMove) {
            teleportMoves.push(teleportMove)
          }
        }
        return [...moves.map(m => ({ to: m, cost: 1 })), ...teleportMoves.map(m => ({ to: m, cost: 1 }))]
      },
    }
  )
  return result.bestScore
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, getTeleportMovesWithoutLevels)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return solve(input, getTeleportMovesWithLevels)
}

const EXAMPLE1 = `
         A           
         A           
  #######.#########  
  #######.........#  
  #######.#######.#  
  #######.#######.#  
  #######.#######.#  
  #####  B    ###.#  
BC...##  C    ###.#  
  ##.##       ###.#  
  ##...DE  F  ###.#  
  #####    G  ###.#  
  #########.#####.#  
DE..#######...###.#  
  #.#########.###.#  
FG..#########.....#  
  ###########.#####  
             Z       
             Z       `

const EXAMPLE2 = `
                   A               
                   A               
  #################.#############  
  #.#...#...................#.#.#  
  #.#.#.###.###.###.#########.#.#  
  #.#.#.......#...#.....#.#.#...#  
  #.#########.###.#####.#.#.###.#  
  #.............#.#.....#.......#  
  ###.###########.###.#####.#.#.#  
  #.....#        A   C    #.#.#.#  
  #######        S   P    #####.#  
  #.#...#                 #......VT
  #.#.#.#                 #.#####  
  #...#.#               YN....#.#  
  #.###.#                 #####.#  
DI....#.#                 #.....#  
  #####.#                 #.###.#  
ZZ......#               QG....#..AS
  ###.###                 #######  
JO..#.#.#                 #.....#  
  #.#.#.#                 ###.#.#  
  #...#..DI             BU....#..LF
  #####.#                 #.#####  
YN......#               VT..#....QG
  #.###.#                 #.###.#  
  #.#...#                 #.....#  
  ###.###    J L     J    #.#.###  
  #.....#    O F     P    #.#...#  
  #.###.#####.#.#####.#####.###.#  
  #...#.#.#...#.....#.....#.#...#  
  #.#####.###.###.#.#.#########.#  
  #...#.#.....#...#.#.#.#.....#.#  
  #.###.#####.###.###.#.#.#######  
  #.#.........#...#.............#  
  #########.###.###.#############  
           B   J   C               
           U   P   P               `

const EXAMPLE3 = `
             Z L X W       C                 
             Z P Q B       K                 
  ###########.#.#.#.#######.###############  
  #...#.......#.#.......#.#.......#.#.#...#  
  ###.#.#.#.#.#.#.#.###.#.#.#######.#.#.###  
  #.#...#.#.#...#.#.#...#...#...#.#.......#  
  #.###.#######.###.###.#.###.###.#.#######  
  #...#.......#.#...#...#.............#...#  
  #.#########.#######.#.#######.#######.###  
  #...#.#    F       R I       Z    #.#.#.#  
  #.###.#    D       E C       H    #.#.#.#  
  #.#...#                           #...#.#  
  #.###.#                           #.###.#  
  #.#....OA                       WB..#.#..ZH
  #.###.#                           #.#.#.#  
CJ......#                           #.....#  
  #######                           #######  
  #.#....CK                         #......IC
  #.###.#                           #.###.#  
  #.....#                           #...#.#  
  ###.###                           #.#.#.#  
XF....#.#                         RF..#.#.#  
  #####.#                           #######  
  #......CJ                       NM..#...#  
  ###.#.#                           #.###.#  
RE....#.#                           #......RF
  ###.###        X   X       L      #.#.#.#  
  #.....#        F   Q       P      #.#.#.#  
  ###.###########.###.#######.#########.###  
  #.....#...#.....#.......#...#.....#.#...#  
  #####.#.###.#######.#######.###.###.#.#.#  
  #.......#.......#.#.#.#.#...#...#...#.#.#  
  #####.###.#####.#.#.#.#.###.###.#.###.###  
  #.......#.....#.#...#...............#...#  
  #############.#.#.###.###################  
               A O F   N                     
               A A D   M                     `

export default {
  part1: {
    run: part1,
    tests: [
      { input: EXAMPLE1, expected: 23 },
      { input: EXAMPLE2, expected: 58 },
    ],
  },
  part2: {
    run: part2,
    tests: [{ input: EXAMPLE3, expected: 396 }],
  },
} as AdventOfCodeContest
