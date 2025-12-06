import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2022 - Day 18

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [x, y, z] = line.split(",").map(Number)
    return new Vector3(x, y, z)
  })
}

function part1(inputString: string) {
  const cubes = parseInput(inputString)
  let totalSurfaceArea = cubes.length * 6
  for (let i = 0; i < cubes.length; i++) {
    for (let j = i + 1; j < cubes.length; j++) {
      const distance = cubes[i].manhattanDistance(cubes[j])
      if (distance === 1) {
        totalSurfaceArea -= 2
      }
    }
  }
  return totalSurfaceArea
}

function part2(inputString: string) {
  const cubes = parseInput(inputString)
  const cubeSet = new Set(cubes.map(cube => cube.str()))

  // Determine bounds of the structure
  let { min: minX, max: maxX } = utils.iterate.minMax(cubes.map(c => c.x))
  let { min: minY, max: maxY } = utils.iterate.minMax(cubes.map(c => c.y))
  let { min: minZ, max: maxZ } = utils.iterate.minMax(cubes.map(c => c.z))

  // Expand bounds by 1 in all directions
  minX--
  minY--
  minZ--
  maxX++
  maxY++
  maxZ++

  // BFS to find all external air pockets
  const directions = [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
  ]

  const visited = new Set<string>()
  const queue: Vector3[] = [new Vector3(minX, minY, minZ)]
  visited.add(queue[0].str())

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const dir of directions) {
      const neighbor = current.add(dir)
      if (
        neighbor.x < minX ||
        neighbor.x > maxX ||
        neighbor.y < minY ||
        neighbor.y > maxY ||
        neighbor.z < minZ ||
        neighbor.z > maxZ
      ) {
        continue
      }
      if (cubeSet.has(neighbor.str()) || visited.has(neighbor.str())) {
        continue
      }
      visited.add(neighbor.str())
      queue.push(neighbor)
    }
  }

  // Calculate external surface area
  let externalSurfaceArea = 0
  for (const cube of cubes) {
    for (const dir of directions) {
      const neighbor = cube.add(dir)
      if (!cubeSet.has(neighbor.str()) && visited.has(neighbor.str())) {
        externalSurfaceArea++
      }
    }
  }
  return externalSurfaceArea
}

const EXAMPLE1 = `
1,1,1
2,1,1`

const EXAMPLE2 = `
2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5`

export default {
  part1: {
    run: part1,
    tests: [
      { input: EXAMPLE1, expected: 10 },
      { input: EXAMPLE2, expected: 64 },
    ],
  },
  part2: {
    run: part2,
    tests: [{ input: EXAMPLE2, expected: 58 }],
  },
} as AdventOfCodeContest
