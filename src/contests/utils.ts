import { fileURLToPath } from "node:url"
import { dirname, relative, resolve } from "node:path"
import fs from "fs-extra"
import chalk from "chalk"
import { MultiLevelQuestPart } from "../types/contest.js"

export function formatDay(day: number) {
  return day.toString().padStart(2, "0")
}

export function getIndexFile(folder: string, url: string) {
  const currentFolder = dirname(fileURLToPath(url))
  const indexFile = resolve(folder, "index.js")
  return "./" + relative(currentFolder, indexFile).replace(/\\/g, "/")
}

export async function writeYearDayTemplateIfNecessary(
  url: string,
  year: number,
  quest: number,
  generator: () => string
): Promise<{ dayFolder: string }> {
  const currentPath = fileURLToPath(url)
  const yearsFolder = resolve(currentPath, `../../years/`)
  const yearFolder = resolve(yearsFolder, `${year}/`)
  if (!(await fs.pathExists(yearsFolder))) {
    await fs.mkdir(yearsFolder)
  }

  if (!(await fs.pathExists(yearFolder))) {
    await fs.mkdir(yearFolder)
  }

  const dayFolder = resolve(yearFolder, `${formatDay(quest)}/`)
  if (!(await fs.pathExists(dayFolder))) {
    await fs.mkdir(dayFolder)
  }

  const solutionFile = resolve(dayFolder, `index.ts`)
  if (!(await fs.pathExists(solutionFile))) {
    const fileContent = generator()
    await fs.writeFile(solutionFile, fileContent)
  }

  return { dayFolder }
}

export function callSolverFromString(input: string, solver: MultiLevelQuestPart["run"]) {
  const formattedInput = input.replace(/\r/g, "")
  try {
    return solver(formattedInput)
  } catch (err) {
    console.error(chalk.red(`  ${chalk.bold("X")} Error while running solver`))
    console.error(err)
    return undefined
  }
}

export function executeTests(tests: MultiLevelQuestPart["tests"], solver: MultiLevelQuestPart["run"]) {
  let gotAFailure = false
  for (let testIndex = 0; testIndex < tests.length; testIndex++) {
    const test = tests[testIndex]
    const response = callSolverFromString(test.input, solver)
    if (test.expected === undefined) {
      console.error(`  ${chalk.bold("?")} Test #${testIndex + 1} run`)
      console.error(`    Input: ${chalk.bold(test.input.split("\n").length)} lines`)
      console.error(`    Got: ${chalk.bold(response)}`)
    } else if (response === test.expected) {
      console.log(`  ${chalk.bold(chalk.greenBright("✓"))} Test #${testIndex + 1} passed`)
    } else {
      console.error(`  ${chalk.bold(chalk.redBright("X"))} Test #${testIndex + 1} failed`)
      console.error(`    Input: ${chalk.bold(test.input.split("\n").length)} lines`)
      console.error(`    Expected: ${chalk.bold(test.expected)}`)
      console.error(`    Got: ${chalk.bold(response)}`)
      gotAFailure = true
    }
  }
  return { gotAFailure }
}

export async function executeOnFile(
  inputFile: string,
  solver: MultiLevelQuestPart["run"],
  onSuccess?: (r: string | number) => void
) {
  if (await fs.exists(inputFile)) {
    const input = await fs.readFile(inputFile, "utf-8")
    const response = callSolverFromString(input, solver)
    if (response === undefined) {
      console.error(chalk.red(`  ${chalk.bold("X")} No response`))
    } else {
      console.log(`  🟢 Solution: ${chalk.bold(chalk.yellowBright(response))}`)
      onSuccess?.(response)
    }
  } else {
    console.error(chalk.red(`  ${chalk.bold("X")} No input file found`))
  }
}
