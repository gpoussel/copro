import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2025 - Quest 10

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

const DRAGON_MOVES_DELTA = [
  new Vector2(-1, 2),
  new Vector2(-1, -2),
  new Vector2(1, 2),
  new Vector2(1, -2),
  new Vector2(2, 1),
  new Vector2(2, -1),
  new Vector2(-2, 1),
  new Vector2(-2, -1),
]

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const dragonMoves = grid.length <= 15 ? 3 : 4
  const dragonPosition = utils.grid.findPositions(grid, cell => cell === "D")[0]!
  const reachablePositions = Array.from({ length: dragonMoves + 1 }, () => [] as Vector2[])
  reachablePositions[0].push(dragonPosition)
  for (let i = 1; i <= dragonMoves; ++i) {
    const previousPositions = reachablePositions[i - 1]
    reachablePositions[i] = previousPositions.flatMap(pos =>
      DRAGON_MOVES_DELTA.map(delta => pos.add(delta)).filter(newPos => utils.grid.inBounds(grid, newPos))
    )
  }
  const sheepPositions = utils.grid.findPositions(grid, cell => cell === "S")
  const sheepPositionsSet = new Set(sheepPositions.map(pos => pos.str()))
  const reachableSheepPositionsSet = new Set<string>()
  for (let i = 0; i <= dragonMoves; ++i) {
    for (const pos of reachablePositions[i]) {
      const posStr = pos.str()
      if (sheepPositionsSet.has(posStr)) {
        reachableSheepPositionsSet.add(posStr)
      }
    }
  }
  return reachableSheepPositionsSet.size
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const dragonMoves = grid.length <= 15 ? 3 : 20
  const dragonPosition = utils.grid.findPositions(grid, cell => cell === "D")[0]!

  // Store hideout positions and replace them with "."
  const hideouts = new Set(utils.grid.findPositions(grid, cell => cell === "#").map(p => p.str()))
  for (const hideoutPosStr of hideouts) {
    utils.grid.set(grid, Vector2.fromKey(hideoutPosStr), ".")
  }

  // Remove dragon from grid
  utils.grid.set(grid, dragonPosition, ".")

  let reachablePositions = new Set([dragonPosition.str()])
  let eatenSheepCount = 0

  for (let i = 1; i <= dragonMoves; ++i) {
    // Dragon moves (must move each turn)
    const newReachablePositions = new Set<string>()
    for (const posStr of reachablePositions) {
      const pos = Vector2.fromKey(posStr)
      for (const delta of DRAGON_MOVES_DELTA) {
        const newPos = pos.add(delta)
        if (utils.grid.inBounds(grid, newPos)) {
          newReachablePositions.add(newPos.str())
        }
      }
    }
    reachablePositions = newReachablePositions

    // Dragon eats BEFORE sheep move
    for (const posStr of reachablePositions) {
      const pos = Vector2.fromKey(posStr)
      if (utils.grid.at(grid, pos) === "S" && !hideouts.has(posStr)) {
        utils.grid.set(grid, pos, ".")
        ++eatenSheepCount
      }
    }

    // Sheep move down one step
    grid[grid.length - 1] = Array.from({ length: grid[0]!.length }, () => ".")
    for (let y = grid.length - 2; y >= 0; --y) {
      for (let x = 0; x < grid[0]!.length; ++x) {
        if (grid[y]![x] === "S") {
          grid[y + 1]![x] = "S"
          grid[y]![x] = "."
        }
      }
    }

    // Dragon eats AFTER sheep move
    for (const posStr of reachablePositions) {
      const pos = Vector2.fromKey(posStr)
      if (utils.grid.at(grid, pos) === "S" && !hideouts.has(posStr)) {
        utils.grid.set(grid, pos, ".")
        ++eatenSheepCount
      }
    }
  }
  return eatenSheepCount
}

function part3(inputString: string) {
  const grid = parseInput(inputString)

  const dragonPosition = utils.grid.findPositions(grid, cell => cell === "D")[0]!
  const hideouts = new Set(utils.grid.findPositions(grid, cell => cell === "#").map(p => p.str()))
  const sheepPositions = utils.grid.findPositions(grid, cell => cell === "S")

  type State = {
    dragonPos: Vector2
    sheep: Vector2[]
  }

  const encodeState = (state: State): string => {
    const sheepStr = state.sheep.map(p => p.str()).join(";")
    return `${state.dragonPos.str()}|${sheepStr}`
  }

  const initialState: State = {
    dragonPos: dragonPosition,
    sheep: sheepPositions.sort((a, b) => a.x - b.x || a.y - b.y),
  }

  const memo = new Map<string, bigint>()

  function countWinningSequences(state: State, isSheepTurn: boolean): bigint {
    if (state.sheep.length === 0) {
      return 1n
    }

    const key = encodeState(state) + (isSheepTurn ? "|S" : "|D")
    if (memo.has(key)) {
      return memo.get(key)!
    }

    let totalSequences = 0n

    if (isSheepTurn) {
      const sheepMoves: { sheepIdx: number; newPos: Vector2 | null }[] = []

      for (let i = 0; i < state.sheep.length; i++) {
        const sheepPos = state.sheep[i]!
        const newPos = sheepPos.move("down")

        if (!utils.grid.inBounds(grid, newPos)) {
          sheepMoves.push({ sheepIdx: i, newPos: null })
        } else {
          const isDragonThere = state.dragonPos.equals(newPos)
          const isHideout = hideouts.has(newPos.str())

          if (!isDragonThere || isHideout) {
            sheepMoves.push({ sheepIdx: i, newPos })
          }
        }
      }

      if (sheepMoves.length === 0) {
        totalSequences = countWinningSequences(state, false)
      } else {
        for (const move of sheepMoves) {
          if (move.newPos === null) {
            continue
          }

          const newSheep = [...state.sheep]
          newSheep[move.sheepIdx] = move.newPos

          const isDragonThere = state.dragonPos.equals(move.newPos)
          const isHideout = hideouts.has(move.newPos.str())

          if (isDragonThere && !isHideout) {
            newSheep.splice(move.sheepIdx, 1)
          }

          const newState: State = {
            dragonPos: state.dragonPos,
            sheep: newSheep.sort((a, b) => a.x - b.x || a.y - b.y),
          }

          totalSequences += countWinningSequences(newState, false)
        }
      }
    } else {
      const dragonMoves: Vector2[] = []

      for (const delta of DRAGON_MOVES_DELTA) {
        const newPos = state.dragonPos.add(delta)
        if (utils.grid.inBounds(grid, newPos)) {
          dragonMoves.push(newPos)
        }
      }

      for (const newDragonPos of dragonMoves) {
        const newSheep = state.sheep.filter(sheepPos => {
          if (sheepPos.equals(newDragonPos)) {
            return hideouts.has(sheepPos.str())
          }
          return true
        })

        const newState: State = {
          dragonPos: newDragonPos,
          sheep: newSheep,
        }

        totalSequences += countWinningSequences(newState, true)
      }
    }

    memo.set(key, totalSequences)
    return totalSequences
  }

  return String(countWinningSequences(initialState, true))
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
...SSS.......
.S......S.SS.
..S....S...S.
..........SS.
..SSSS...S...
.....SS..S..S
SS....D.S....
S.S..S..S....
....S.......S
.SSS..SS.....
.........S...
.......S....S
SS.....S..S..`,
        expected: 27,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
...SSS##.....
.S#.##..S#SS.
..S.##.S#..S.
.#..#S##..SS.
..SSSS.#.S.#.
.##..SS.#S.#S
SS##.#D.S.#..
S.S..S..S###.
.##.S#.#....S
.SSS.#SS..##.
..#.##...S##.
.#...#.S#...S
SS...#.S.#S..`,
        expected: 27,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
SSS
..#
#.#
#D.`,
        expected: "15",
      },
      {
        input: `
SSS
..#
..#
.##
.D#`,
        expected: "8",
      },
      {
        input: `
..S..
.....
..#..
.....
..D..`,
        expected: "44",
      },
      {
        input: `
.SS.S
#...#
...#.
##..#
.####
##D.#`,
        expected: "4406",
      },
      {
        input: `
SSS.S
.....
#.#.#
.#.#.
#.D.#`,
        expected: "13033988838",
      },
    ],
  },
} as EverybodyCodesContest
