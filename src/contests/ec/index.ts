import { resolve } from "node:path"
import chalk from "chalk"
import { Contest, MultiLevelQuestPart } from "../../types/contest.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"
import { executeOnFile, executeTests, formatDay, getIndexFile } from "../utils.js"

function parseArguments(args: string[]): ({ year: number } | { story: string }) & {
  quest: number
  part: number | undefined
} {
  if (args.length < 2 || args.length > 3) {
    throw new Error(`Invalid number of arguments, expected 2-3, got ${args.length}`)
  }

  const [levelStr, questStr, partStr] = args
  const quest = parseInt(questStr)
  const part = partStr ? parseInt(partStr) : undefined

  if (isNaN(quest) || (partStr && isNaN(part!))) {
    throw new Error("Quest and part must be numbers")
  }

  if (levelStr.startsWith("s")) {
    return { story: levelStr, quest, part }
  } else {
    const year = parseInt(levelStr)
    if (isNaN(year)) {
      throw new Error("The first argument must be a year (number) or a story (e.g. 's01')")
    }
    return { year, quest, part }
  }
}

async function run(args: string[]) {
  const parsedArgs = parseArguments(args)
  const { quest, part } = parsedArgs

  let level: string | number
  let filePrefix: string

  if ("year" in parsedArgs) {
    level = parsedArgs.year
    filePrefix = `e${level}`
    console.log(`📆 Year ${chalk.cyan(level)} - Quest ${chalk.cyan(quest)}`)
    console.log(`🌍 https://everybody.codes/event/${level}/quests/${quest}`)
  } else {
    level = parsedArgs.story
    const storyNumber = parseInt(parsedArgs.story.substring(1))
    filePrefix = level
    console.log(`📖 Story ${chalk.cyan(storyNumber)} - Quest ${chalk.cyan(quest)}`)
    console.log(`🌍 https://everybody.codes/story/${storyNumber}/quests/${quest}`)
  }

  const { dayFolder } = await writeTemplateIfNecessary(level, quest)

  console.log()
  console.log()
  for (const currentPart of [1, 2, 3]) {
    if (part === undefined || part === currentPart) {
      console.log(`⚙️ ${chalk.cyan("Part " + currentPart)}`)

      const pathToImport = getIndexFile(dayFolder, import.meta.url)
      const questSolution = await import(pathToImport)
      const partSolution = questSolution.default[`part${currentPart}`] as MultiLevelQuestPart | undefined
      if (!partSolution) {
        console.error(chalk.red(`Part ${currentPart} not found`))
      } else {
        const { gotAFailure } = executeTests(partSolution.tests, partSolution.run)
        if (!gotAFailure) {
          const inputFile = resolve(dayFolder, `everybody_codes_${filePrefix}_q${formatDay(quest)}_p${currentPart}.txt`)
          await executeOnFile(inputFile, partSolution.run)
        }
      }
    }
    if (part === undefined && currentPart < 3) {
      console.log()
      console.log()
      console.log()
    }
  }
}

export default {
  name: "Everybody Codes",
  run,
} as Contest
