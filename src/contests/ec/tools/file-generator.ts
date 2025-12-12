import { writeStoryQuestTemplateIfNecessary, writeYearDayTemplateIfNecessary } from "../../utils.js"

export async function writeTemplateIfNecessary(
  level: number | string,
  quest: number
): Promise<{ dayFolder: string }> {
  const generator = () => `import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes ${typeof level === "number" ? `Event ${level}` : `Story ${parseInt((level as string).substring(1))}`} - Quest ${quest}

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
      input: \`\`,
      expected: undefined,
    }],
  },
  part2: {
    run: part2,
    tests: [{
      input: \`\`,
      expected: undefined,
    }],
  },
  part3: {
    run: part3,
    tests: [{
      input: \`\`,
      expected: undefined,
    }],
  },
} as EverybodyCodesContest
`

  if (typeof level === "number") {
    return await writeYearDayTemplateIfNecessary(import.meta.url, level, quest, generator)
  } else {
    return await writeStoryQuestTemplateIfNecessary(import.meta.url, level, quest, generator)
  }
}
