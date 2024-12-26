import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2, VectorSet } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 15

interface GameState {
  units: Map<string, Unit>
  walls: VectorSet<Vector2>
  width: number
  height: number
}

interface GameParameters {
  elfPower: number
  stopOnElfDeath: boolean
}

interface Unit {
  position: Vector2
  type: "G" | "E"
  hp: number
}

function parseInput(inputString: string): GameState {
  const grid = utils.input.readGrid(inputString)
  const units = new Map<string, Unit>()
  const walls = new VectorSet<Vector2>(utils.grid.findPositions(grid, c => c === "#").map(Vector2.fromCoordinates))
  utils.grid
    .findPositions(grid, c => c === "G" || c === "E")
    .map(Vector2.fromCoordinates)
    .forEach(position => {
      units.set(position.str(), {
        position,
        type: grid[position.y][position.x] as "G" | "E",
        hp: 200,
      })
    })
  const height = grid.length
  const width = grid[0].length
  return { units, walls, width, height }
}

function simulateGameRounds(state: GameState, parameters: GameParameters): number | undefined {
  let rounds = 0
  while (true) {
    const result = doRound(state, parameters)
    if (result === "elf-died") {
      return
    }
    if (result === "end") {
      break
    }
    rounds++
  }
  return rounds * [...state.units.values()].reduce((sum, unit) => sum + unit.hp, 0)
}

function doRound(state: GameState, parameters: GameParameters): "end" | "continue" | "elf-died" {
  const sortedUnits = [...state.units.values()].sort((a, b) => a.position.compare(b.position))
  for (let unitIndex = 0; unitIndex < sortedUnits.length; unitIndex++) {
    const attacker = sortedUnits[unitIndex]
    const targets = sortedUnits.filter(unit => attacker.type !== unit.type)
    if (targets.length === 0) {
      return "end"
    }

    const openSquaresInRange = new VectorSet<Vector2>(
      targets
        .flatMap(t => t.position.plusShapeNeighbors())
        .filter(pos => !isOccupied(state, pos))
        .sort((a, b) => a.compare(b))
    )
    let targetsInRange = targets.filter(target => attacker.position.manhattanDistance(target.position) === 1)
    if (targetsInRange.length === 0 && openSquaresInRange.length === 0) {
      continue
    }
    if (targetsInRange.length === 0) {
      const pathsFromAttacker = findPaths(state, attacker.position)
      const closestOpenSquares = openSquaresInRange
        .map(square => pathsFromAttacker.get(square.str())!)
        .filter(path => path.cost < Infinity)
      if (!closestOpenSquares.length) {
        continue
      }
      const closestOpenSquare = utils.iterate.minBy(closestOpenSquares, compareByCost)
      const pathsToOpenSquare = findPaths(state, closestOpenSquare.position)
      const neighbours = attacker.position.plusShapeNeighbors()
      const neighbourPaths = neighbours
        .map(neighbour => pathsToOpenSquare.get(neighbour.str())!)
        .filter(path => path.cost < Infinity)
      const nextPosition = utils.iterate.minBy(neighbourPaths, compareByCost)
      state.units.delete(attacker.position.str())
      attacker.position = nextPosition.position
      state.units.set(attacker.position.str(), attacker)
    }

    targetsInRange = targets.filter(target => attacker.position.manhattanDistance(target.position) === 1)
    if (targetsInRange.length === 0) {
      continue
    }
    const weakestTarget = utils.iterate.minBy(targetsInRange, (a, b) => {
      return a.hp - b.hp || a.position.compare(b.position)
    })
    weakestTarget.hp -= attacker.type === "E" ? parameters.elfPower : 3
    if (weakestTarget.hp <= 0) {
      if (weakestTarget.type === "E" && parameters.stopOnElfDeath) {
        return "elf-died"
      }
      state.units.delete(weakestTarget.position.str())
      const weakestTargetOrder = sortedUnits.indexOf(weakestTarget)
      sortedUnits.splice(weakestTargetOrder, 1)
      if (unitIndex >= weakestTargetOrder) {
        unitIndex--
      }
    }
  }
  return "continue"
}

function isOccupied(state: GameState, position: Vector2): boolean {
  return state.units.has(position.str()) || state.walls.contains(position)
}

interface Node {
  position: Vector2
  cost: number
  prev: Node | undefined
  visited: boolean
}

function findPaths(state: GameState, start: Vector2): Map<string, Node> {
  const nodes = new Map<string, Node>()
  const unvisited: Node[] = []
  for (let y = 0; y < state.height; y++) {
    for (let x = 0; x < state.width; x++) {
      const node = { position: new Vector2(x, y), cost: Infinity, prev: undefined, visited: false }
      nodes.set(node.position.str(), node)
      unvisited.push(node)
    }
  }
  nodes.get(start.str())!.cost = 0
  unvisited.sort(compareByCost)

  while (unvisited.length > 0 && unvisited[0].cost < Infinity) {
    const current = unvisited[0]
    for (let neighbourPosition of current.position.plusShapeNeighbors()) {
      const neighbour = nodes.get(neighbourPosition.str())!
      if (neighbour.visited || isOccupied(state, neighbour.position)) {
        continue
      }
      const costThroughCurrent = current.cost + 1
      if (costThroughCurrent < neighbour.cost) {
        const oldIndex = utils.iterate.binarySearch(unvisited, neighbour, compareByCost)
        unvisited.splice(oldIndex, 1)

        neighbour.cost = costThroughCurrent
        neighbour.prev = current

        const newIndex = -(utils.iterate.binarySearch(unvisited, neighbour, compareByCost) + 1)
        unvisited.splice(newIndex, 0, neighbour)
      }
    }
    current.visited = true
    unvisited.shift()
  }

  return nodes
}

function compareByCost(left: Node, right: Node): number {
  return left.cost - right.cost || left.position.compare(right.position)
}

function part1(inputString: string) {
  const gameState = parseInput(inputString)
  const parameters = {
    elfPower: 3,
    stopOnElfDeath: false,
  }
  return simulateGameRounds(gameState, parameters)
}

function part2(inputString: string) {
  let elfPower = 4
  while (true) {
    const gameState = parseInput(inputString)
    const parameters = {
      elfPower,
      stopOnElfDeath: true,
    }
    const result = simulateGameRounds(gameState, parameters)
    if (result !== undefined) {
      return result
    }
    elfPower++
  }
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`,
        expected: 27730,
      },
      {
        input: `
#######
#G..#E#
#E#E.E#
#G.##.#
#...#E#
#...E.#
#######`,
        expected: 36334,
      },
      {
        input: `
#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######`,
        expected: 39514,
      },
      {
        input: `
#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######`,
        expected: 27755,
      },
      {
        input: `
#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`,
        expected: 28944,
      },
      {
        input: `
#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`,
        expected: 18740,
      },
      {
        input: `
#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`,
        expected: 18740,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`,
        expected: 4988,
      },
      {
        input: `
#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######`,
        expected: 31284,
      },
      {
        input: `
#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######`,
        expected: 3478,
      },
      {
        input: `
#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`,
        expected: 6474,
      },
      {
        input: `
#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`,
        expected: 1140,
      },
    ],
  },
} as AdventOfCodeContest
