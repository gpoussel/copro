import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2, Vector2Set } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2024 - Day 15

const BOX_SYMBOL = "O"
const WALL_SYMBOL = "#"
const ROBOT_SYMBOL = "@"
const EMPTY_SYMBOL = "."
const LARGE_BOX_LEFT = "["
const LARGE_BOX_RIGHT = "]"
const LARGE_BOX_SYMBOLS: string[] = [LARGE_BOX_LEFT, LARGE_BOX_RIGHT] as const

function parseInput(input: string) {
  const [gridBlock, commandBlock] = utils.input.blocks(input)
  const grid = utils.input.readGrid(gridBlock)

  const robotPosition = utils.grid.find(grid, cell => cell === ROBOT_SYMBOL)
  if (!robotPosition) {
    throw new Error("Robot position not found")
  }

  return {
    grid: utils.input.readGrid(gridBlock),
    robotPosition,
    commands: utils.input.lines(commandBlock).join("").split(""),
  }
}

function moveRobotInSmallGrid(state: { grid: string[][]; robotPosition: Vector2 }, direction: Direction) {
  const nextPosition = state.robotPosition.move(direction)
  if (!utils.grid.inBounds(state.grid, nextPosition)) {
    return
  }
  const nextSymbol = utils.grid.at(state.grid, nextPosition)
  if (nextSymbol === WALL_SYMBOL) {
    return
  }
  if (nextSymbol === EMPTY_SYMBOL) {
    utils.grid.set(state.grid, state.robotPosition, EMPTY_SYMBOL)
    utils.grid.set(state.grid, nextPosition, ROBOT_SYMBOL)
    state.robotPosition = nextPosition
    return
  }
  if (nextSymbol === BOX_SYMBOL) {
    let furtherPosition = nextPosition
    while (utils.grid.at(state.grid, furtherPosition) === BOX_SYMBOL) {
      furtherPosition = furtherPosition.move(direction)
    }
    if (!utils.grid.inBounds(state.grid, furtherPosition)) {
      return
    }
    if (utils.grid.at(state.grid, furtherPosition) === WALL_SYMBOL) {
      return
    }
    if (utils.grid.at(state.grid, furtherPosition) === EMPTY_SYMBOL) {
      utils.grid.set(state.grid, state.robotPosition, EMPTY_SYMBOL)
      utils.grid.set(state.grid, nextPosition, ROBOT_SYMBOL)
      utils.grid.set(state.grid, furtherPosition, BOX_SYMBOL)
      state.robotPosition = nextPosition
      return
    }
  }
  throw new Error("Unexpected state")
}

function canMoveLargeBox(grid: string[][], position: Vector2, direction: "up" | "down") {
  const nextPosition = position.move(direction)
  if (!utils.grid.inBounds(grid, nextPosition)) {
    return { canMove: false, nextPositions: [] }
  }
  const nextSymbolLeft = utils.grid.at(grid, nextPosition)
  const nextSymbolRight = utils.grid.at(grid, nextPosition.move("right"))
  if (nextSymbolLeft === WALL_SYMBOL || nextSymbolRight === WALL_SYMBOL) {
    return { canMove: false, nextPositions: [] }
  }

  const positionLeft =
    nextSymbolLeft === EMPTY_SYMBOL
      ? []
      : [nextSymbolLeft === LARGE_BOX_LEFT ? nextPosition : nextPosition.move("left")]
  const positionRight =
    nextSymbolRight === EMPTY_SYMBOL
      ? []
      : [nextSymbolRight === LARGE_BOX_RIGHT ? nextPosition : nextPosition.move("right")]

  return {
    canMove: true,
    nextPositions: positionLeft.concat(positionRight),
  }
}

function moveRobotInLargeGrid(state: { grid: string[][]; robotPosition: Vector2 }, direction: Direction) {
  const nextPosition = state.robotPosition.move(direction)
  if (!utils.grid.inBounds(state.grid, nextPosition)) {
    return
  }
  const nextSymbol = utils.grid.at(state.grid, nextPosition)
  if (nextSymbol === WALL_SYMBOL) {
    return
  }
  if (nextSymbol === EMPTY_SYMBOL) {
    utils.grid.set(state.grid, state.robotPosition, EMPTY_SYMBOL)
    utils.grid.set(state.grid, nextPosition, ROBOT_SYMBOL)
    state.robotPosition = nextPosition
    return
  }
  if (LARGE_BOX_SYMBOLS.includes(nextSymbol)) {
    if (direction === "left" || direction === "right") {
      let furtherPosition = nextPosition.move(direction, 2)
      while (LARGE_BOX_SYMBOLS.includes(utils.grid.at(state.grid, furtherPosition))) {
        furtherPosition = furtherPosition.move(direction, 2)
      }
      if (!utils.grid.inBounds(state.grid, furtherPosition)) {
        return
      }
      if (utils.grid.at(state.grid, furtherPosition) === WALL_SYMBOL) {
        return
      }
      if (utils.grid.at(state.grid, furtherPosition) === EMPTY_SYMBOL) {
        utils.grid.set(state.grid, state.robotPosition, EMPTY_SYMBOL)
        utils.grid.set(state.grid, nextPosition, ROBOT_SYMBOL)
        utils.grid.set(state.grid, furtherPosition, direction === "right" ? LARGE_BOX_RIGHT : LARGE_BOX_LEFT)
        furtherPosition = furtherPosition.move(direction, -1)

        while (LARGE_BOX_SYMBOLS.includes(utils.grid.at(state.grid, furtherPosition))) {
          utils.grid.set(
            state.grid,
            furtherPosition,
            utils.grid.at(state.grid, furtherPosition) === LARGE_BOX_LEFT ? LARGE_BOX_RIGHT : LARGE_BOX_LEFT
          )
          furtherPosition = furtherPosition.move(direction, -1)
        }
        state.robotPosition = nextPosition
        return
      }
    } else if (direction === "up" || direction === "down") {
      let boxPositions = new Vector2Set()
      const charAtNextPosition = utils.grid.at(state.grid, nextPosition)
      if (charAtNextPosition === LARGE_BOX_LEFT) {
        boxPositions.add(nextPosition)
      } else if (charAtNextPosition === LARGE_BOX_RIGHT) {
        boxPositions.add(nextPosition.move("left"))
      }
      const boxesToMove = new Vector2Set()
      let canMove = true
      while (canMove && boxPositions.length > 0) {
        const moveChecks = boxPositions.map(position => canMoveLargeBox(state.grid, position, direction))
        if (moveChecks.some(check => !check.canMove)) {
          canMove = false
        } else {
          boxPositions.forEach(pos => boxesToMove.add(pos))
          boxPositions = new Vector2Set(moveChecks.flatMap(check => check.nextPositions))
        }
      }
      if (canMove) {
        boxesToMove.forEach(boxPosition => {
          utils.grid.set(state.grid, boxPosition, EMPTY_SYMBOL)
          utils.grid.set(state.grid, boxPosition.move("right"), EMPTY_SYMBOL)
        })
        boxesToMove.forEach(boxPosition => {
          utils.grid.set(state.grid, boxPosition.move(direction), LARGE_BOX_LEFT)
          utils.grid.set(state.grid, boxPosition.move(direction).move("right"), LARGE_BOX_RIGHT)
        })
        utils.grid.set(state.grid, state.robotPosition, EMPTY_SYMBOL)
        utils.grid.set(state.grid, nextPosition, ROBOT_SYMBOL)
        state.robotPosition = nextPosition
      }
      return
    }
  }
  throw new Error("Unexpected state: direction = " + direction + ", nextSymbol = " + nextSymbol)
}

function sumOfCoordinates(grid: string[][]) {
  return utils.grid
    .iterate(
      grid,
      (_cell, x, y) => {
        return 100 * y + x
      },
      cell => cell === BOX_SYMBOL || cell === LARGE_BOX_LEFT
    )
    .reduce((sum, value) => sum + value, 0)
}

function scaleUpGrid(grid: string[][]) {
  const newGrid: string[][] = grid.map(row => Array.from({ length: row.length * 2 }).map(() => EMPTY_SYMBOL))
  utils.grid.iterate(grid, (cell, x, y) => {
    if (cell === WALL_SYMBOL || cell === EMPTY_SYMBOL) {
      utils.grid.set(newGrid, new Vector2(2 * x, y), cell)
      utils.grid.set(newGrid, new Vector2(2 * x + 1, y), cell)
    } else if (cell === ROBOT_SYMBOL) {
      utils.grid.set(newGrid, new Vector2(2 * x, y), cell)
    } else if (cell === BOX_SYMBOL) {
      utils.grid.set(newGrid, new Vector2(2 * x, y), LARGE_BOX_LEFT)
      utils.grid.set(newGrid, new Vector2(2 * x + 1, y), LARGE_BOX_RIGHT)
    }
  })
  return newGrid
}

function part1(inputString: string) {
  const { grid, commands, robotPosition } = parseInput(inputString)

  const state = {
    grid: grid,
    robotPosition: new Vector2(robotPosition.x, robotPosition.y),
  }
  for (const command of commands) {
    const direction = utils.grid.fromDirectionChar(command)
    moveRobotInSmallGrid(state, direction)
  }

  return sumOfCoordinates(state.grid)
}

function part2(inputString: string) {
  const { grid, commands, robotPosition } = parseInput(inputString)
  const scaledGrid = scaleUpGrid(grid)

  const state = {
    grid: scaledGrid,
    robotPosition: new Vector2(robotPosition.x * 2, robotPosition.y),
  }
  for (const command of commands) {
    const direction = utils.grid.fromDirectionChar(command)
    moveRobotInLargeGrid(state, direction)
  }

  return sumOfCoordinates(state.grid)
}

const EXAMPLE1 = `
########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<
`

const EXAMPLE2 = `
##########
#..O..O.O#
#......O.#
#.OO..O.O#
#..O@..O.#
#O#..O...#
#O..O..O.#
#.OO.O.OO#
#....O...#
##########

<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
`

const EXAMPLE3 = `
#######
#...#.#
#.....#
#..OO@#
#..O..#
#.....#
#######

<vv<<^^<<^^
`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 2028,
      },
      {
        input: EXAMPLE2,
        expected: 10092,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE3,
        expected: 618,
      },
      {
        input: EXAMPLE2,
        expected: 9021,
      },
    ],
  },
} as AdventOfCodeContest
