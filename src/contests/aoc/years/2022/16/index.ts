import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 16

interface Valve {
  name: string
  flowRate: number
  leadsTo: string[]
}

function parseInput(input: string): Valve[] {
  return utils.input.lines(input).map(line => {
    const match = line.match(/Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)/)
    if (!match) {
      throw new Error(`Invalid line: ${line}`)
    }
    const name = match[1]
    const flowRate = +match[2]
    const leadsTo = match[3].split(", ").map(s => s.trim())
    return { name, flowRate, leadsTo }
  })
}

// Compute shortest distances between all pairs of valves using Floyd-Warshall
function computeDistances(valves: Valve[]): Map<string, Map<string, number>> {
  const distances = new Map<string, Map<string, number>>()
  for (const valve of valves) {
    distances.set(valve.name, new Map())
    for (const other of valves) {
      distances.get(valve.name)!.set(other.name, valve.name === other.name ? 0 : Infinity)
    }
    for (const neighbor of valve.leadsTo) {
      distances.get(valve.name)!.set(neighbor, 1)
    }
  }
  for (const k of valves) {
    for (const i of valves) {
      for (const j of valves) {
        const throughK = distances.get(i.name)!.get(k.name)! + distances.get(k.name)!.get(j.name)!
        if (throughK < distances.get(i.name)!.get(j.name)!) {
          distances.get(i.name)!.set(j.name, throughK)
        }
      }
    }
  }
  return distances
}

function part1(inputString: string) {
  const valves = parseInput(inputString)
  const valvesByName = new Map<string, Valve>()
  for (const valve of valves) {
    valvesByName.set(valve.name, valve)
  }

  const distances = computeDistances(valves)
  const usefulValves = valves.filter(v => v.flowRate > 0)

  // DFS with memoization: state = (current position, time remaining, set of opened valves)
  const memo = new Map<string, number>()

  function dfs(current: string, timeRemaining: number, opened: Set<string>): number {
    if (timeRemaining <= 0) return 0

    const openedKey = [...opened].sort().join(",")
    const key = `${current}|${timeRemaining}|${openedKey}`
    if (memo.has(key)) return memo.get(key)!

    let best = 0

    // Try opening each unopened useful valve
    for (const valve of usefulValves) {
      if (opened.has(valve.name)) continue
      const dist = distances.get(current)!.get(valve.name)!
      const newTime = timeRemaining - dist - 1 // travel + open
      if (newTime <= 0) continue

      const newOpened = new Set(opened)
      newOpened.add(valve.name)
      const pressure = newTime * valve.flowRate
      const result = pressure + dfs(valve.name, newTime, newOpened)
      best = Math.max(best, result)
    }

    memo.set(key, best)
    return best
  }

  return dfs("AA", 30, new Set())
}

function part2(inputString: string) {
  const valves = parseInput(inputString)
  const valvesByName = new Map<string, Valve>()
  for (const valve of valves) {
    valvesByName.set(valve.name, valve)
  }

  const distances = computeDistances(valves)
  const usefulValves = valves.filter(v => v.flowRate > 0)

  // For part 2, we need to find the best way to split valves between human and elephant
  // First, compute the best score for each possible subset of valves
  const bestForSubset = new Map<number, number>()

  // Encode valve set as bitmask
  const valveIndex = new Map<string, number>()
  usefulValves.forEach((v, i) => valveIndex.set(v.name, i))

  function dfs(current: string, timeRemaining: number, opened: number, pressure: number): void {
    // Update best for this subset
    const existing = bestForSubset.get(opened) ?? 0
    bestForSubset.set(opened, Math.max(existing, pressure))

    if (timeRemaining <= 0) return

    // Try opening each unopened useful valve
    for (const valve of usefulValves) {
      const idx = valveIndex.get(valve.name)!
      if (opened & (1 << idx)) continue
      const dist = distances.get(current)!.get(valve.name)!
      const newTime = timeRemaining - dist - 1
      if (newTime <= 0) continue

      const newOpened = opened | (1 << idx)
      const newPressure = pressure + newTime * valve.flowRate
      dfs(valve.name, newTime, newOpened, newPressure)
    }
  }

  dfs("AA", 26, 0, 0)

  // Now find the best pair of disjoint subsets
  let best = 0
  const subsets = [...bestForSubset.entries()]
  for (const [mask1, score1] of subsets) {
    for (const [mask2, score2] of subsets) {
      if ((mask1 & mask2) === 0) {
        // Disjoint subsets
        best = Math.max(best, score1 + score2)
      }
    }
  }

  return best
}

const EXAMPLE = `
Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 1651,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 1707,
      },
    ],
  },
} as AdventOfCodeContest
