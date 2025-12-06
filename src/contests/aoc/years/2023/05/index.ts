import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 5

interface MapData {
  name: string
  mapping: {
    source: number
    target: number
    size: number
  }[]
  cache: Map<number, number>
}

interface InputData {
  seeds: number[]
  maps: MapData[]
}

function parseInput(input: string): InputData {
  const [seedBlock, ...mapBlocks] = utils.input.blocks(input)

  const seeds = seedBlock
    .replace("seeds:", "")
    .trim()
    .split(" ")
    .map(s => +s)

  const maps = mapBlocks.map(block => {
    const lines = utils.input.lines(block)
    const mapping = lines
      .slice(1)
      .map(line => line.split(" ").map(numStr => +numStr))
      .map(line => ({
        target: line[0],
        source: line[1],
        size: line[2],
      }))
    const name = lines[0].trim().replace(" map:", "")
    return { name, mapping, cache: new Map() }
  })
  return { seeds, maps }
}

function mapSeedToLocation(seed: number, maps: MapData[]): number {
  function findMap(name: string) {
    return maps.find(m => m.name === name)!
  }
  function findInMap(map: MapData, source: number): number {
    if (map.cache.has(source)) {
      return map.cache.get(source)!
    }
    for (const entry of map.mapping) {
      if (source >= entry.source && source < entry.source + entry.size) {
        const result = entry.target + (source - entry.source)
        map.cache.set(source, result)
        return result
      }
    }
    map.cache.set(source, source)
    return source
  }
  const soil = findInMap(findMap("seed-to-soil"), seed)
  const fertilizer = findInMap(findMap("soil-to-fertilizer"), soil)
  const water = findInMap(findMap("fertilizer-to-water"), fertilizer)
  const light = findInMap(findMap("water-to-light"), water)
  const temperature = findInMap(findMap("light-to-temperature"), light)
  const humidity = findInMap(findMap("temperature-to-humidity"), temperature)
  const location = findInMap(findMap("humidity-to-location"), humidity)
  return location
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const locations = input.seeds.map(seed => mapSeedToLocation(seed, input.maps))
  return Math.min(...locations)
}

function part2(inputString: string) {
  const input = parseInput(inputString)

  // Work with ranges instead of individual seeds
  // Each range is [start, end) (end is exclusive)
  type Range = { start: number; end: number }

  // Parse seed ranges
  let ranges: Range[] = []
  for (let i = 0; i < input.seeds.length; i += 2) {
    const start = input.seeds[i]!
    const size = input.seeds[i + 1]!
    ranges.push({ start, end: start + size })
  }

  // Apply each map to the ranges
  for (const map of input.maps) {
    const newRanges: Range[] = []

    for (const range of ranges) {
      let { start, end } = range
      let remaining: Range[] = [{ start, end }]

      for (const entry of map.mapping) {
        const mapStart = entry.source
        const mapEnd = entry.source + entry.size
        const offset = entry.target - entry.source

        const nextRemaining: Range[] = []

        for (const r of remaining) {
          // Part before the mapping range (unmapped)
          if (r.start < mapStart) {
            nextRemaining.push({ start: r.start, end: Math.min(r.end, mapStart) })
          }
          // Part inside the mapping range (mapped)
          if (r.end > mapStart && r.start < mapEnd) {
            const overlapStart = Math.max(r.start, mapStart)
            const overlapEnd = Math.min(r.end, mapEnd)
            newRanges.push({ start: overlapStart + offset, end: overlapEnd + offset })
          }
          // Part after the mapping range (unmapped, keep for next mapping check)
          if (r.end > mapEnd) {
            nextRemaining.push({ start: Math.max(r.start, mapEnd), end: r.end })
          }
        }

        remaining = nextRemaining
      }

      // Any remaining ranges that weren't mapped stay as-is
      newRanges.push(...remaining)
    }

    ranges = newRanges
  }

  // Find the minimum start of all resulting ranges
  return Math.min(...ranges.map(r => r.start))
}

const EXAMPLE = `
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 35,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 46,
      },
    ],
  },
} as AdventOfCodeContest
