import { writeYearDayTemplateIfNecessary } from "../../utils.js"

export async function writeTemplateIfNecessary(year: number, quest: number): Promise<{ dayFolder: string }> {
  return await writeYearDayTemplateIfNecessary(
    import.meta.url,
    year,
    quest,
    () => `import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes ${year} - Quest ${quest}

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

function part3(inputString: string) {
  const input = parseInput(inputString)
  return
}

export default {
  part1: {
    run: part1,
    tests: [{
      input: "",
      expected: undefined,
    }],
  },
  part2: {
    run: part2,
    tests: [{
      input: "",
      expected: undefined,
    }],
  },
  part3: {
    run: part3,
    tests: [{
      input: "",
      expected: undefined,
    }],
  },
} as EverybodyCodesContest
`
  )
}
