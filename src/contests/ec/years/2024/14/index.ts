import { EverybodyCodesContest } from "../../../../../types/contest.js"
import { DIRECTIONS_3D } from "../../../../../utils/grid.js"
import utils from "../../../../../utils/index.js"
import { Vector3, VectorSet } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 14

function parseInput(input: string) {
  return utils.input.lines(input).map(line =>
    line.split(",").map(v => {
      const direction = v[0]
      const distance = Number(v.slice(1))
      return { direction, distance }
    })
  )
}

function getVisitedPositions(lines: ReturnType<typeof parseInput>) {
  const visited = new VectorSet<Vector3>()
  const leaves = new VectorSet<Vector3>()
  for (const commandLine of lines) {
    let position = new Vector3(0, 0, 0)
    for (const command of commandLine) {
      for (let i = 0; i < command.distance; i++) {
        if (command.direction === "U") {
          position = new Vector3(position.x, position.y - 1, position.z)
        } else if (command.direction === "D") {
          position = new Vector3(position.x, position.y + 1, position.z)
        } else if (command.direction === "L") {
          position = new Vector3(position.x - 1, position.y, position.z)
        } else if (command.direction === "R") {
          position = new Vector3(position.x + 1, position.y, position.z)
        } else if (command.direction === "F") {
          position = new Vector3(position.x, position.y, position.z + 1)
        } else if (command.direction === "B") {
          position = new Vector3(position.x, position.y, position.z - 1)
        }
        visited.add(position)
      }
    }
    leaves.add(position)
  }
  return { visited, leaves }
}

function part1(inputString: string) {
  const commands = parseInput(inputString)[0]
  let maxHeight = 0
  let currentHeight = 0
  for (const command of commands) {
    if (command.direction === "U") {
      currentHeight += command.distance
    } else if (command.direction === "D") {
      currentHeight -= command.distance
    }
    if (currentHeight > maxHeight) {
      maxHeight = currentHeight
    }
  }
  return maxHeight
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return getVisitedPositions(input).visited.length
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const { visited, leaves } = getVisitedPositions(input)
  const trunkPositions = visited.vectors.filter(v => v.x === 0)
  const overallDistances = new Map<string, number>()
  for (const leaf of leaves.vectors) {
    const { paths } = utils.algo.breadthFirstSearch(leaf, {
      key: v => v.str(),
      adjacents(node) {
        return DIRECTIONS_3D.map(dir => node.move(dir)).filter(p => visited.contains(p))
      },
      ends(node) {
        return trunkPositions.some(p => p.equals(node))
      },
    })
    for (const path of paths) {
      const end = path[path.length - 1]
      const distance = path.length - 1
      overallDistances.set(end.str(), (overallDistances.get(end.str()) ?? 0) + distance)
    }
  }
  return Math.min(...overallDistances.values())
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `U5,R3,D2,L5,U4,R5,D2`,
        expected: 7,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
U5,R3,D2,L5,U4,R5,D2
U6,L1,D2,R3,U2,L1`,
        expected: 32,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
U5,R3,D2,L5,U4,R5,D2
U6,L1,D2,R3,U2,L1`,
        expected: 5,
      },
      {
        input: `
U20,L1,B1,L2,B1,R2,L1,F1,U1
U10,F1,B1,R1,L1,B1,L1,F1,R2,U1
U30,L2,F1,R1,B1,R1,F2,U1,F1
U25,R1,L2,B1,U1,R2,F1,L2
U16,L1,B1,L1,B3,L1,B1,F1`,
        expected: 46,
      },
    ],
  },
} as EverybodyCodesContest
