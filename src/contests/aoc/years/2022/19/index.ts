import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 19

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const match = line.match(
      /Blueprint (\d+): Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian./
    )
    if (!match) {
      throw new Error(`Invalid line: ${line}`)
    }
    return {
      id: +match[1],
      oreRobotCost: { ore: +match[2] },
      clayRobotCost: { ore: +match[3] },
      obsidianRobotCost: { ore: +match[4], clay: +match[5] },
      geodeRobotCost: { ore: +match[6], obsidian: +match[7] },
    }
  })
}

interface State {
  time: number
  ore: number
  clay: number
  obsidian: number
  geodes: number
  oreRobots: number
  clayRobots: number
  obsidianRobots: number
  geodeRobots: number
}

function getMaxGeodes(blueprint: ReturnType<typeof parseInput>[0], timeLimit: number): number {
  const { oreRobotCost, clayRobotCost, obsidianRobotCost, geodeRobotCost } = blueprint

  // Maximum ore we'd ever need per turn (no point having more ore robots than this)
  const maxOreNeeded = Math.max(oreRobotCost.ore, clayRobotCost.ore, obsidianRobotCost.ore, geodeRobotCost.ore)
  const maxClayNeeded = obsidianRobotCost.clay
  const maxObsidianNeeded = geodeRobotCost.obsidian

  let best = 0

  function dfs(state: State): void {
    const { time, ore, clay, obsidian, geodes, oreRobots, clayRobots, obsidianRobots, geodeRobots } = state

    // Update best
    best = Math.max(best, geodes)

    if (time === 0) return

    // Pruning: theoretical max if we built a geode robot every remaining turn
    const theoreticalMax = geodes + geodeRobots * time + (time * (time - 1)) / 2
    if (theoreticalMax <= best) return

    // Try building each type of robot (in priority order: geode first)
    // Option 1: Build geode robot (if we can)
    if (ore >= geodeRobotCost.ore && obsidian >= geodeRobotCost.obsidian) {
      dfs({
        time: time - 1,
        ore: ore - geodeRobotCost.ore + oreRobots,
        clay: clay + clayRobots,
        obsidian: obsidian - geodeRobotCost.obsidian + obsidianRobots,
        geodes: geodes + geodeRobots,
        oreRobots,
        clayRobots,
        obsidianRobots,
        geodeRobots: geodeRobots + 1,
      })
      // If we can build a geode robot, it's almost always best to do so
      return
    }

    // Option 2: Build obsidian robot (if we need more and can afford it)
    if (obsidianRobots < maxObsidianNeeded && ore >= obsidianRobotCost.ore && clay >= obsidianRobotCost.clay) {
      dfs({
        time: time - 1,
        ore: ore - obsidianRobotCost.ore + oreRobots,
        clay: clay - obsidianRobotCost.clay + clayRobots,
        obsidian: obsidian + obsidianRobots,
        geodes: geodes + geodeRobots,
        oreRobots,
        clayRobots,
        obsidianRobots: obsidianRobots + 1,
        geodeRobots,
      })
    }

    // Option 3: Build clay robot (if we need more and can afford it)
    if (clayRobots < maxClayNeeded && ore >= clayRobotCost.ore) {
      dfs({
        time: time - 1,
        ore: ore - clayRobotCost.ore + oreRobots,
        clay: clay + clayRobots,
        obsidian: obsidian + obsidianRobots,
        geodes: geodes + geodeRobots,
        oreRobots,
        clayRobots: clayRobots + 1,
        obsidianRobots,
        geodeRobots,
      })
    }

    // Option 4: Build ore robot (if we need more and can afford it)
    if (oreRobots < maxOreNeeded && ore >= oreRobotCost.ore) {
      dfs({
        time: time - 1,
        ore: ore - oreRobotCost.ore + oreRobots,
        clay: clay + clayRobots,
        obsidian: obsidian + obsidianRobots,
        geodes: geodes + geodeRobots,
        oreRobots: oreRobots + 1,
        clayRobots,
        obsidianRobots,
        geodeRobots,
      })
    }

    // Option 5: Don't build anything (only if we can't afford something we want)
    // Don't wait if we have more resources than we could ever spend
    if (ore < maxOreNeeded * 2 || clay < maxClayNeeded * 2 || obsidian < maxObsidianNeeded * 2) {
      dfs({
        time: time - 1,
        ore: ore + oreRobots,
        clay: clay + clayRobots,
        obsidian: obsidian + obsidianRobots,
        geodes: geodes + geodeRobots,
        oreRobots,
        clayRobots,
        obsidianRobots,
        geodeRobots,
      })
    }
  }

  dfs({
    time: timeLimit,
    ore: 0,
    clay: 0,
    obsidian: 0,
    geodes: 0,
    oreRobots: 1,
    clayRobots: 0,
    obsidianRobots: 0,
    geodeRobots: 0,
  })

  return best
}

function part1(inputString: string) {
  const blueprints = parseInput(inputString)
  return blueprints.map(blueprint => blueprint.id * getMaxGeodes(blueprint, 24)).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const blueprints = parseInput(inputString).slice(0, 3)
  return blueprints.map(blueprint => getMaxGeodes(blueprint, 32)).reduce((a, b) => a * b, 1)
}

const EXAMPLE = `
Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 33,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 56 * 62,
      },
    ],
  },
} as AdventOfCodeContest
