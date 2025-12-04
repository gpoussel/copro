import { writeYearDayTemplateIfNecessary } from "../../utils.js"

export async function writeTemplateIfNecessary(year: number, day: number): Promise<{ dayFolder: string }> {
  const partContent = `const input = parseInput(inputString)
  return`
  const christmasPartContent = `return "Merry Christmas!"`
  const testContent = `{
      input: EXAMPLE,
      expected: undefined,
    }`
  const christmasDay = day === 25

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
  ${partContent}
}

function part2(inputString: string) {
  ${christmasDay ? christmasPartContent : partContent}
}

const EXAMPLE = \`\`

export default {
  part1: {
    run: part1,
    tests: [${testContent}],
  },
  part2: {
    run: part2,
    tests: [${christmasDay ? "" : testContent}],
  },
} as AdventOfCodeContest
`
  )
}
