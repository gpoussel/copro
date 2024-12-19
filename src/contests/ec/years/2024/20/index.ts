import { EverybodyCodesContest } from "../../../../../types/contest.js"
import { Direction } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 20

function parseInput(input: string) {
  const grid = utils.input.readGrid(input)
  return { grid }
}

function part1(inputString: string) {
  const { grid } = parseInput(inputString)
  const startPosition = Vector2.fromCoordinates(utils.grid.find(grid, c => c === "S")!)
  interface State {
    pos: Vector2
    direction: Direction
    altitude: number
  }
  let states = new Map<string, State>()
  function getKey(state: State) {
    return `${state.pos.x},${state.pos.y},${state.direction}`
  }

  for (const direction of ["up", "down", "left", "right"]) {
    const state = {
      pos: startPosition,
      direction: direction as Direction,
      altitude: 1000,
    }
    states.set(getKey(state), state)
  }

  for (let i = 0; i < 100; i++) {
    const nextStates = new Map<string, State>()

    ;[...states.values()].forEach((state: State) => {
      const { pos, direction, altitude } = state
      pos
        .plusShapeNeighbors()
        .filter(neighbor => (utils.grid.at(grid, neighbor) || "#") !== "#")
        .filter(neighbor => !neighbor.move(direction).equals(pos))
        .forEach(neighbor => {
          const cellValue = utils.grid.at(grid, neighbor)
          const change = cellValue === "+" ? 1 : cellValue === "-" ? -2 : -1
          const newAltitude = altitude + change

          const nextState = {
            pos: neighbor,
            direction: pos.directionTo(neighbor),
            altitude: newAltitude,
          }
          const nextKey = getKey(nextState)
          if (!nextStates.has(nextKey)) {
            nextStates.set(nextKey, nextState)
          } else {
            const existingState = nextStates.get(nextKey)!
            if (newAltitude > existingState.altitude) {
              nextStates.set(nextKey, nextState)
            }
          }
        })
    })

    states = nextStates
  }
  return Math.max(...[...states.values()].map(state => state.altitude))
}

function part2(inputString: string) {
  const { grid } = parseInput(inputString)
  const startPosition = Vector2.fromCoordinates(utils.grid.find(grid, c => c === "S")!)
  interface State {
    pos: Vector2
    direction: Direction
    altitude: number
    checkpoint: number
  }
  let states = new Map<string, State>()
  function getKey(state: State) {
    return `${state.pos.x},${state.pos.y},${state.direction},${state.checkpoint}`
  }

  for (const direction of ["up", "down", "left", "right"]) {
    const state = {
      pos: startPosition,
      direction: direction as Direction,
      altitude: 1000,
      checkpoint: 0,
    }
    states.set(getKey(state), state)
  }

  let found = false
  let time = 0
  while (!found) {
    const nextStates = new Map<string, State>()

    ;[...states.values()].forEach((state: State) => {
      const { pos, direction, altitude, checkpoint } = state
      pos
        .plusShapeNeighbors()
        .filter(neighbor => (utils.grid.at(grid, neighbor) || "#") !== "#")
        .filter(neighbor => !neighbor.move(direction).equals(pos))
        .forEach(neighbor => {
          const cellValue = utils.grid.at(grid, neighbor)
          const change = cellValue === "+" ? 1 : cellValue === "-" ? -2 : -1
          const newAltitude = altitude + change
          let newCheckpoint
          if (checkpoint === 0 && cellValue === "A") {
            newCheckpoint = 1
          } else if (checkpoint === 1 && cellValue === "B") {
            newCheckpoint = 2
          } else if (checkpoint === 2 && cellValue === "C") {
            newCheckpoint = 3
          } else if (checkpoint === 3 && cellValue === "S") {
            newCheckpoint = 4
          } else {
            newCheckpoint = checkpoint
          }

          const nextState = {
            pos: neighbor,
            direction: pos.directionTo(neighbor),
            altitude: newAltitude,
            checkpoint: newCheckpoint!,
          }
          if (nextState.checkpoint === 4 && newAltitude >= 1000 && nextState.pos.equals(startPosition)) {
            found = true
          }
          const nextKey = getKey(nextState)
          if (!nextStates.has(nextKey)) {
            nextStates.set(nextKey, nextState)
          } else {
            const existingState = nextStates.get(nextKey)!
            if (newAltitude > existingState.altitude) {
              nextStates.set(nextKey, nextState)
            }
          }
        })
    })
    ++time

    states = nextStates

    utils.log.logEvery(time, 100)
  }
  return time
}

function part3(inputString: string) {
  const { grid } = parseInput(inputString)
  const startPosition = Vector2.fromCoordinates(utils.grid.find(grid, c => c === "S")!)
  const columns = utils.grid.columns(grid)
  const maxPlusColumnLength = columns.map(column => column.filter(cell => cell === "+").length)
  const numberOfPlusInBestColumn = Math.max(...maxPlusColumnLength)
  const startColumn = startPosition.x
  let closestColumnWithMaxPlus = -1
  for (let i = 0; i < columns.length; ++i) {
    const column = columns[i]
    const numberOfPlus = column.filter(cell => cell === "+").length
    if (numberOfPlus === numberOfPlusInBestColumn) {
      if (Math.abs(closestColumnWithMaxPlus - startColumn) > Math.abs(i - startColumn)) {
        closestColumnWithMaxPlus = i
      }
    }
  }
  const endPosition = new Vector2(closestColumnWithMaxPlus, grid.length - 1)
  // Strategy: on the first loop, move to the closest column with the maximum number of plus signs
  // Then, go straight down until you reach altitude 0
  interface State {
    pos: Vector2
    direction: Direction
    altitude: number
    distance: number
  }
  let states = new Map<string, State>()
  function getKey(state: State) {
    return `${state.pos.x},${state.pos.y},${state.direction}`
  }

  for (const direction of ["up", "down", "left", "right"]) {
    const state = {
      pos: startPosition,
      direction: direction as Direction,
      altitude: 0,
      distance: 0,
    }
    states.set(getKey(state), state)
  }

  let endState: State | undefined
  for (let time = 0; time < 20; ++time) {
    const nextStates = new Map<string, State>()

    ;[...states.values()].forEach((state: State) => {
      const { pos, direction, altitude } = state
      pos
        .plusShapeNeighbors()
        .filter(neighbor => (utils.grid.at(grid, neighbor) || "#") !== "#")
        .filter(neighbor => !neighbor.move(direction).equals(pos))
        .forEach(neighbor => {
          const cellValue = utils.grid.at(grid, neighbor)
          const change = cellValue === "+" ? 1 : cellValue === "-" ? -2 : -1
          const newAltitude = altitude + change

          const nextState = {
            distance: time + 1,
            pos: neighbor,
            direction: pos.directionTo(neighbor),
            altitude: newAltitude,
          }
          if (nextState.pos.equals(endPosition)) {
            if (endState === undefined || newAltitude > endState.altitude) {
              endState = nextState
            }
            return
          }
          const nextKey = getKey(nextState)
          if (!nextStates.has(nextKey)) {
            nextStates.set(nextKey, nextState)
          } else {
            const existingState = nextStates.get(nextKey)!
            if (newAltitude > existingState.altitude) {
              nextStates.set(nextKey, nextState)
            }
          }
        })
    })

    states = nextStates
  }

  const MAX_ALTITUDE = 384400
  const distanceToClosestColumnWithMaxPlus = Math.abs(closestColumnWithMaxPlus - startColumn)
  // Altitude lost to reach the closest column with the maximum number of plus signs
  const altitudeDiffOnFirstSegment = -endState!.altitude
  const travelColumn = columns[closestColumnWithMaxPlus]
  const altitudeDiffInLoop = -(
    numberOfPlusInBestColumn -
    utils.iterate.count(travelColumn, "-") * 2 -
    utils.iterate.count(travelColumn, ".")
  )
  const altitudeAfterFirstBlock = MAX_ALTITUDE - distanceToClosestColumnWithMaxPlus - altitudeDiffInLoop
  const numberOfLoops = Math.floor(altitudeAfterFirstBlock / altitudeDiffInLoop)
  let remainingAltitudeForLastBlock = altitudeAfterFirstBlock % altitudeDiffInLoop

  let i = 0
  while (remainingAltitudeForLastBlock > 0) {
    const cell = travelColumn[i]
    console.log(cell)
    if (cell === "+") {
      remainingAltitudeForLastBlock += 1
    } else if (cell === "-") {
      remainingAltitudeForLastBlock -= 2
    } else {
      remainingAltitudeForLastBlock -= 1
    }
    ++i
  }

  return (1 + numberOfLoops) * grid.length + i
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
#....S....#
#.........#
#---------#
#.........#
#..+.+.+..#
#.+-.+.++.#
#.........#`,
        expected: 1045,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
####S####
#-.+++.-#
#.+.+.+.#
#-.+.+.-#
#A+.-.+C#
#.+-.-+.#
#.+.B.+.#
#########`,
        expected: 24,
      },
      {
        input: `
###############S###############
#+#..-.+.-++.-.+.--+.#+.#++..+#
#-+-.+-..--..-+++.+-+.#+.-+.+.#
#---.--+.--..++++++..+.-.#.-..#
#+-+.#+-.#-..+#.--.--.....-..##
#..+..-+-.-+.++..-+..+#-.--..-#
#.--.A.-#-+-.-++++....+..C-...#
#++...-..+-.+-..+#--..-.-+..-.#
#..-#-#---..+....#+#-.-.-.-+.-#
#.-+.#+++.-...+.+-.-..+-++..-.#
##-+.+--.#.++--...-+.+-#-+---.#
#.-.#+...#----...+-.++-+-.+#..#
#.---#--++#.++.+-+.#.--..-.+#+#
#+.+.+.+.#.---#+..+-..#-...---#
#-#.-+##+-#.--#-.-......-#..-##
#...+.-+..##+..+B.+.#-+-++..--#
###############################`,
        expected: 78,
      },
      {
        input: `
###############S###############
#-----------------------------#
#-------------+++-------------#
#-------------+++-------------#
#-------------+++-------------#
#-----------------------------#
#-----------------------------#
#-----------------------------#
#--A-----------------------C--#
#-----------------------------#
#-----------------------------#
#-----------------------------#
#-----------------------------#
#-----------------------------#
#-----------------------------#
#--------------B--------------#
#-----------------------------#
#-----------------------------#
###############################`,
        expected: 206,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [],
  },
} as EverybodyCodesContest
