import { resolve } from "node:path"
import chalk from "chalk"
import { Contest, MultiLevelQuestPart } from "../../types/contest.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"
import { executeOnFile, executeTests, getIndexFile } from "../utils.js"

function parseArguments(args: string[]) {
  if (args.length === 2) {
    return { year: parseInt(args[0]), quest: parseInt(args[1]) }
  }
  if (args.length === 3) {
    return { year: parseInt(args[0]), quest: parseInt(args[1]), part: parseInt(args[2]) }
  }
  throw new Error(`Invalid number of arguments, expected 2-3, got ${args.length}`)
}

async function run(args: string[]) {
  const { year, quest, part } = parseArguments(args)
  console.log(`📆 Year ${chalk.cyan(year)} - Quest ${chalk.cyan(quest)}`)
  console.log(`🌍 https://everybody.codes/event/${year}/quests/${quest}`)

  const { dayFolder } = await writeTemplateIfNecessary(year, quest)

  const inputFile = resolve(dayFolder, "input")

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
  name: "Advent of Code",
  run,
} as Contest
