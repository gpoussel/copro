import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2023 - Day 12

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [pattern, groupsStr] = line.split(" ")
    const groups = groupsStr.split(",").map(Number)
    return { pattern, groups }
  })
}

function countArrangements(pattern: string, groups: number[], cache: Map<string, number>): number {
  const key = `${pattern}|${groups.join(",")}`
  if (cache.has(key)) return cache.get(key)!

  // Base cases
  if (groups.length === 0) {
    // No more groups to place - valid if no more # in pattern
    return pattern.includes("#") ? 0 : 1
  }

  if (pattern.length === 0) {
    // No more pattern but still groups to place
    return 0
  }

  const minNeeded = groups.reduce((a, b) => a + b, 0) + groups.length - 1
  if (pattern.length < minNeeded) {
    return 0
  }

  let result = 0
  const char = pattern[0]

  // If current char is . or ?, try skipping it
  if (char === "." || char === "?") {
    result += countArrangements(pattern.slice(1), groups, cache)
  }

  // If current char is # or ?, try placing the first group here
  if (char === "#" || char === "?") {
    const groupSize = groups[0]
    // Check if we can place a group of `groupSize` starting here
    const canPlace =
      pattern.length >= groupSize &&
      !pattern.slice(0, groupSize).includes(".") && // All positions must be # or ?
      (pattern.length === groupSize || pattern[groupSize] !== "#") // Must end the group

    if (canPlace) {
      const nextPattern = pattern.slice(groupSize + 1) // Skip group and separator
      result += countArrangements(nextPattern, groups.slice(1), cache)
    }
  }

  cache.set(key, result)
  return result
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return input.map(({ pattern, groups }) => countArrangements(pattern, groups, new Map())).reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return input
    .map(({ pattern, groups }) => {
      // Unfold: repeat pattern 5 times with ? separators, groups 5 times
      const unfoldedPattern = Array(5).fill(pattern).join("?")
      const unfoldedGroups = Array(5).fill(groups).flat()
      return countArrangements(unfoldedPattern, unfoldedGroups, new Map())
    })
    .reduce((a, b) => a + b, 0)
}

const EXAMPLE = `
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 21,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 525152,
      },
    ],
  },
} as AdventOfCodeContest
