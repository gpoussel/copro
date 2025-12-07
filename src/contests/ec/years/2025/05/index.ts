import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes 2025 - Quest 5

function parseInput(input: string) {
  return utils.input.lines(input).map(parseSword)
}

function parseSword(line: string) {
  const [identifierStr, numbers] = line.split(":")
  return {
    id: Number(identifierStr),
    numbers: numbers.split(",").map(Number),
  }
}

interface SpineSegment {
  middle: number
  left: number | undefined
  right: number | undefined
}

interface BuiltSword {
  id: number
  quality: number
  levels: number[]
}

function buildSword(id: number, numbers: number[]): BuiltSword {
  const spineSegments: SpineSegment[] = []
  for (const number of numbers) {
    let inserted = false
    for (let i = 0; i < spineSegments.length; i++) {
      const segment = spineSegments[i]
      if (number < segment.middle && !segment.left) {
        segment.left = number
        inserted = true
        break
      } else if (number > segment.middle && !segment.right) {
        segment.right = number
        inserted = true
        break
      }
    }
    if (!inserted) {
      spineSegments.push({ middle: number, left: undefined, right: undefined })
    }
  }
  const quality = +spineSegments.map(seg => `${seg.middle}`).join("")
  const levels = spineSegments.map(seg =>
    Number([seg.left, seg.middle, seg.right].filter(n => n !== undefined).join(""))
  )
  return { quality, levels, id }
}

function part1(inputString: string) {
  const { numbers } = parseSword(utils.input.firstLine(inputString))
  const { quality } = buildSword(0, numbers)
  return quality
}

function part2(inputString: string) {
  const swords = parseInput(inputString)
  const qualities = swords.map(sword => buildSword(sword.id, sword.numbers).quality)
  const { min, max } = utils.iterate.minMax(qualities)
  return max - min
}

function part3(inputString: string) {
  const input = parseInput(inputString)
  const builtSwords = input.map(sword => buildSword(sword.id, sword.numbers))
  const sortedSwords = builtSwords
    .sort((a, b) => {
      if (a.quality !== b.quality) return a.quality - b.quality
      for (let i = 0; i < Math.min(a.levels.length, b.levels.length); i++) {
        if (a.levels[i] !== b.levels[i]) return a.levels[i] - b.levels[i]
      }
      return a.id - b.id
    })
    .reverse()
  return sortedSwords.map((sword, index) => sword.id * (index + 1)).reduce((a, b) => a + b, 0)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `58:5,3,7,8,9,10,4,5,7,8,8`,
        expected: 581078,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `1:2,4,1,1,8,2,7,9,8,6
2:7,9,9,3,8,3,8,8,6,8
3:4,7,6,9,1,8,3,7,2,2
4:6,4,2,1,7,4,5,5,5,8
5:2,9,3,8,3,9,5,2,1,4
6:2,4,9,6,7,4,1,7,6,8
7:2,3,7,6,2,2,4,1,4,2
8:5,1,5,6,8,3,1,8,3,9
9:5,7,7,3,7,2,3,8,6,7
10:4,1,9,3,8,5,4,3,5,5`,
        expected: 77053,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `1:7,1,9,1,6,9,8,3,7,2
2:6,1,9,2,9,8,8,4,3,1
3:7,1,9,1,6,9,8,3,8,3
4:6,1,9,2,8,8,8,4,3,1
5:7,1,9,1,6,9,8,3,7,3
6:6,1,9,2,8,8,8,4,3,5
7:3,7,2,2,7,4,4,6,3,1
8:3,7,2,2,7,4,4,6,3,7
9:3,7,2,2,7,4,1,6,3,7`,
        expected: 260,
      },
      {
        input: `1:7,1,9,1,6,9,8,3,7,2
2:7,1,9,1,6,9,8,3,7,2`,
        expected: 4,
      },
    ],
  },
} as EverybodyCodesContest
