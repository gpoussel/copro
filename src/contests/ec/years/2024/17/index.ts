import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"

// 🎲 Everybody Codes 2024 - Quest 17

function parseInput(input: string) {
  return utils.input.readGrid(input)
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const starPositions = utils.grid.findPositions(input, item => item === "*").map(Vector2.fromCoordinates)
  const edges = []
  for (let i = 0; i < starPositions.length; ++i) {
    for (let j = i + 1; j < starPositions.length; ++j) {
      edges.push({
        from: starPositions[i],
        to: starPositions[j],
        weight: starPositions[i].manhattanDistance(starPositions[j]),
      })
    }
  }
  const mst = utils.graph.minimumSpanningTree(edges, {
    equals: (a, b) => a.equals(b),
    str: a => a.str(),
  })
  return mst.distance + starPositions.length
}

function part2(inputString: string) {
  return part1(inputString)
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const starPositions = utils.grid.findPositions(input, item => item === "*").map(Vector2.fromCoordinates)

  let edges: { from: Vector2; to: Vector2; weight: number }[] = []
  for (let i = 0; i < starPositions.length; ++i) {
    for (let j = i + 1; j < starPositions.length; ++j) {
      const distance = starPositions[i].manhattanDistance(starPositions[j])
      if (distance >= 6) {
        continue
      }
      edges.push({
        from: starPositions[i],
        to: starPositions[j],
        weight: distance,
      })
    }
  }
  const brilliantConstellations = []
  while (edges.length > 0) {
    const answer = utils.graph.prim(edges[0].from, {
      adjacent: node =>
        edges
          .filter(edge => edge.from.equals(node) || edge.to.equals(node))
          .map(edge => ({
            node: edge.from.equals(node) ? edge.to : edge.from,
            distance: edge.weight,
          })),
      equals: (a, b) => a.equals(b),
      str: a => a.str(),
    })
    brilliantConstellations.push(answer.total + answer.visited.length)
    const visitedNodes = [...answer.visited]
    edges = edges.filter(
      edge => !visitedNodes.some(node => node.equals(edge.from)) && !visitedNodes.some(node => node.equals(edge.to))
    )
  }
  return brilliantConstellations
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((acc, value) => acc * value, 1)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
*...*
..*..
.....
.....
*.*..`,
        expected: 16,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
.......................................
..*.......*...*.....*...*......**.**...
....*.................*.......*..*..*..
..*.........*.......*...*.....*.....*..
......................*........*...*...
..*.*.....*...*.....*...*........*.....
.......................................`,
        expected: 15624,
      },
    ],
  },
} as EverybodyCodesContest
