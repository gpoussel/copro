import { writeYearDayTemplateIfNecessary } from "../../utils.js"

export async function writeTemplateIfNecessary(year: number, day: number): Promise<{ dayFolder: string }> {
  return await writeYearDayTemplateIfNecessary(
    import.meta.url,
    year,
    day,
    () => `import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code ${year} - Day ${day}

function parseInput(input: string) {
  return
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return
}

const EXAMPLE = \`\`

export default {
  part1: {
    run: part1,
    tests: [{
      input: EXAMPLE,
      expected: undefined,
    }],
  },
  part2: {
    run: part2,
    tests: [{
      input: EXAMPLE,
      expected: undefined,
    }],
  },
} as AdventOfCodeContest
`
  )
}
