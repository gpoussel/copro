import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGraph, dijkstraOnGrid } from "../../../../../utils/algo.js"
import { DirectedGraph } from "../../../../../utils/graph.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2019 - Day 18

function parseInput(input: string, multipleRobots: boolean) {
  const grid = utils.input.readGrid(input)
  let entrancePositions = utils.grid.findPositions(grid, c => c === "@")
  if (entrancePositions.length !== 1) {
    throw new Error("Expected exactly one entrance")
  }
  const entrancePosition = entrancePositions[0]
  if (multipleRobots) {
    utils.grid.set(grid, entrancePosition.move("up-left"), "@")
    utils.grid.set(grid, entrancePosition.move("up"), "#")
    utils.grid.set(grid, entrancePosition.move("up-right"), "@")
    utils.grid.set(grid, entrancePosition.move("left"), "#")
    utils.grid.set(grid, entrancePosition, "#")
    utils.grid.set(grid, entrancePosition.move("right"), "#")
    utils.grid.set(grid, entrancePosition.move("down-left"), "@")
    utils.grid.set(grid, entrancePosition.move("down"), "#")
    utils.grid.set(grid, entrancePosition.move("down-right"), "@")
    entrancePositions = [
      entrancePosition.move("up-left"),
      entrancePosition.move("up-right"),
      entrancePosition.move("down-left"),
      entrancePosition.move("down-right"),
    ]
  }
  const doorPositions = utils.grid.findPositions(grid, c => c >= "A" && c <= "Z")
  const keyPositions = utils.grid.findPositions(grid, c => c >= "a" && c <= "z")

  return { grid, entrancePositions, doorPositions, keyPositions }
}

function getAllPathsBetweenKeys(input: ReturnType<typeof parseInput>) {
  const { grid, entrancePositions, doorPositions, keyPositions } = input
  const allPositions = [...entrancePositions, ...keyPositions]
  const pathsBetweenKeys = new Map<
    string,
    {
      distance: number
      doors: string[]
    }
  >()
  function setPath(from: Vector2, to: Vector2, distance: number, doors: string[]) {
    const key = `${from.x},${from.y},${to.x},${to.y}`
    if (!pathsBetweenKeys.has(key) || pathsBetweenKeys.get(key)!.distance > distance) {
      pathsBetweenKeys.set(key, { doors, distance })
    }
  }
  for (let i = 0; i < allPositions.length - 1; i++) {
    const start = allPositions[i]
    for (let j = i + 1; j < allPositions.length; j++) {
      const destination = allPositions[j]
      const { paths } = dijkstraOnGrid(grid, {
        ends(position) {
          return position.equals(destination)
        },
        isMoveValid(from, to) {
          return to !== "#"
        },
        starts: [start],
        moveCost: 1,
      })
      for (const path of paths) {
        const destination = path.positions[path.positions.length - 1]

        const doorsRequired = path.positions
          .filter(p => doorPositions.some(d => d.equals(p)))
          .map(p => utils.grid.at(grid, p))
        setPath(start, destination, path.score, doorsRequired)
        setPath(destination, start, path.score, doorsRequired)
      }
    }
  }
  return pathsBetweenKeys
}

function getShortestPathBetweenKeys(
  input: ReturnType<typeof parseInput>,
  pathsBetweenKeys: ReturnType<typeof getAllPathsBetweenKeys>
) {
  const { grid, entrancePositions, keyPositions } = input
  interface Node {
    positions: Vector2[]
    keys: string[]
  }
  const startNode = {
    positions: entrancePositions,
    keys: [],
  }
  const finalResult = dijkstraOnGraph<Node>([startNode], node => node.keys.length === keyPositions.length, {
    equals(a, b) {
      return a.positions.every((p, i) => b.positions[i].equals(p)) && utils.iterate.arrayEquals(a.keys, b.keys)
    },
    key(node) {
      return `${node.positions.map(p => p.str()).join(";")};${node.keys.join(",")}`
    },
    moves(node, path) {
      const positions = node.positions
      const validTargets: { to: Node; cost: number }[] = []
      for (const keyPosition of keyPositions) {
        const key = utils.grid.at(grid, keyPosition)
        if (node.keys.includes(key)) {
          continue
        }
        for (const position of positions) {
          const keyPath = pathsBetweenKeys.get(`${position.x},${position.y},${keyPosition.x},${keyPosition.y}`)
          if (keyPath && keyPath.doors.every(door => node.keys.includes(door.toLowerCase()))) {
            const newKeys = [...node.keys, key].sort()
            validTargets.push({
              to: { positions: positions.map(p => (p === position ? keyPosition : p)), keys: newKeys },
              cost: keyPath.distance,
            })
          }
        }
      }
      if (validTargets.length === 0) {
        throw new Error("No valid targets")
      }
      return validTargets
    },
  })
  return finalResult.bestScore
}

function part1(inputString: string) {
  const input = parseInput(inputString, false)
  const pathsBetweenKeys = getAllPathsBetweenKeys(input)
  return getShortestPathBetweenKeys(input, pathsBetweenKeys)
}

function part2(inputString: string) {
  const input = parseInput(inputString, true)
  const pathsBetweenKeys = getAllPathsBetweenKeys(input)
  return getShortestPathBetweenKeys(input, pathsBetweenKeys)
}

const EXAMPLE1 = `
#########
#b.A.@.a#
#########`

const EXAMPLE2 = `
########################
#f.D.E.e.C.b.A.@.a.B.c.#
######################.#
#d.....................#
########################`

const EXAMPLE3 = `
########################
#...............b.C.D.f#
#.######################
#.....@.a.B.c.d.A.e.F.g#
########################`

const EXAMPLE4 = `
#################
#i.G..c...e..H.p#
########.########
#j.A..b...f..D.o#
########@########
#k.E..a...g..B.n#
########.########
#l.F..d...h..C.m#
#################`

const EXAMPLE5 = `
########################
#@..............ac.GI.b#
###d#e#f################
###A#B#C################
###g#h#i################
########################`

const EXAMPLE6 = `
#######
#a.#Cd#
##...##
##.@.##
##...##
#cB#Ab#
#######`

const EXAMPLE7 = `
###############
#d.ABC.#.....a#
######...######
######.@.######
######...######
#b.....#.....c#
###############`

const EXAMPLE8 = `
#############
#DcBa.#.GhKl#
#.###...#I###
#e#d#.@.#j#k#
###C#...###J#
#fEbA.#.FgHi#
#############`

const EXAMPLE9 = `
#############
#g#f.D#..h#l#
#F###e#E###.#
#dCba...BcIJ#
#####.@.#####
#nK.L...G...#
#M###N#H###.#
#o#m..#i#jk.#
#############`

export default {
  part1: {
    run: part1,
    tests: [
      { input: EXAMPLE1, expected: 8 },
      { input: EXAMPLE2, expected: 86 },
      { input: EXAMPLE3, expected: 132 },
      { input: EXAMPLE4, expected: 136 },
      { input: EXAMPLE5, expected: 81 },
    ],
  },
  part2: {
    run: part2,
    tests: [
      { input: EXAMPLE6, expected: 8 },
      { input: EXAMPLE7, expected: 24 },
      { input: EXAMPLE8, expected: 32 },
      { input: EXAMPLE9, expected: 72 },
    ],
  },
} as AdventOfCodeContest
