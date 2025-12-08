import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2025 - Day 8

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [x, y, z] = line.split(",").map(Number)
    return new Vector3(x, y, z)
  })
}

interface Pair {
  box1: Vector3
  box2: Vector3
  distance: number
}

function mergePairs(pairs: Pair[], components: Map<string, Vector3[]>) {
  const { box1, box2 } = pairs.pop()!
  const key1 = box1.str()
  const key2 = box2.str()
  const comp1 = components.get(key1)
  const comp2 = components.get(key2)
  if (comp1 && comp2) {
    if (comp1 === comp2) {
      return
    }
    comp1.push(...comp2)
    for (const box of comp2) {
      components.set(box.str(), comp1)
    }
  } else if (comp1) {
    comp1.push(box2)
    components.set(key2, comp1)
  } else if (comp2) {
    comp2.push(box1)
    components.set(key1, comp2)
  } else {
    const circuit = [box1, box2]
    components.set(key1, circuit)
    components.set(key2, circuit)
  }
}

function part1(inputString: string) {
  const boxes = parseInput(inputString)
  const pairs = createPairs(boxes)
  const components: Map<string, Vector3[]> = new Map()
  let rounds = boxes.length <= 20 ? 10 : 1000
  for (let round = 0; round < rounds; ++round) {
    mergePairs(pairs, components)
  }
  const uniqueComponents = new Set<Vector3[]>(components.values())
  return Array.from(uniqueComponents)
    .sort((a, b) => b.length - a.length)
    .slice(0, 3)
    .reduce((prod, comp) => prod * comp.length, 1)
}

function createPairs(boxes: Vector3[]) {
  const pairs = new Array<Pair>()
  for (let i = 0; i < boxes.length; ++i) {
    for (let j = i + 1; j < boxes.length; ++j) {
      const box1 = boxes[i]
      const box2 = boxes[j]
      const distance = box1.euclideanDistance(box2)
      pairs.push({ box1, box2, distance })
    }
  }
  pairs.sort((a, b) => b.distance - a.distance)
  return pairs
}

function part2(inputString: string) {
  const boxes = parseInput(inputString)
  const pairs = createPairs(boxes)
  const components: Map<string, Vector3[]> = new Map()
  let lastPair: Pair | undefined = undefined
  while (components.size === 0 || components.values().next().value!.length < boxes.length) {
    lastPair = pairs[pairs.length - 1]!
    mergePairs(pairs, components)
  }
  if (!lastPair) {
    return undefined
  }
  return lastPair.box1.x * lastPair.box2.x
}

const EXAMPLE = `
162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 40,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 25272,
      },
    ],
  },
} as AdventOfCodeContest
