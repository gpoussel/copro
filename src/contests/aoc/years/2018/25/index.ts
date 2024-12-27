import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { disjointSets } from "../../../../../utils/graph.js"
import utils from "../../../../../utils/index.js"
import { Vector4 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2018 - Day 25

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [x, y, z, t] = line.split(",").map(Number)
    return new Vector4(x, y, z, t)
  })
}

function part1(inputString: string) {
  const points = parseInput(inputString)
  const groups = disjointSets(points, {
    areUnionable: (a, b) => a.manhattanDistance(b) <= 3,
  })
  return groups.length
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return "Merry Christmas"
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
 0,0,0,0
 3,0,0,0
 0,3,0,0
 0,0,3,0
 0,0,0,3
 0,0,0,6
 9,0,0,0
12,0,0,0`,
        expected: 2,
      },
      {
        input: `
-1,2,2,0
0,0,2,-2
0,0,0,-2
-1,2,0,0
-2,-2,-2,2
3,0,2,-1
-1,3,2,2
-1,0,-1,0
0,2,1,-2
3,0,0,0`,
        expected: 4,
      },
      {
        input: `
1,-1,0,1
2,0,-1,0
3,2,-1,0
0,0,3,1
0,0,-1,-1
2,3,-2,0
-2,2,0,0
2,-2,0,-1
1,-1,0,-1
3,2,0,2`,
        expected: 3,
      },
      {
        input: `
1,-1,-1,-2
-2,-2,0,1
0,2,1,3
-2,3,-2,1
0,2,3,-2
-1,-1,1,-2
0,-2,-1,0
-2,2,3,-1
1,2,2,0
-1,-2,0,-2`,
        expected: 8,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
