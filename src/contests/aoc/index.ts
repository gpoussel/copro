import { dirname, relative, resolve } from "node:path"
import chalk from "chalk"
import { Contest } from "../../types/contest.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"
import { fileURLToPath } from "node:url"
import fs from "fs-extra"

function getCurrentDay(): { year: number; day: number } {
  const adventOfCodeTime = new Date().toLocaleString("fr-FR", {
    timeZone: "America/New_York",
  })
  const dateTimeParts = adventOfCodeTime.split(" ")
  const dateParts = dateTimeParts[0].split("/")
  const year = parseInt(dateParts[2], 10)
  const month = parseInt(dateParts[1], 10)
  const day = parseInt(dateParts[0], 10)
  if (month === 12) {
    return { year, day }
  }
  return { year, day: 1 }
}

function parsePart(part: string): 1 | 2 | undefined {
  if (part === "1") {
    return 1
  }
  if (part === "2") {
    return 2
  }
  console.error(chalk.red(`Invalid part "${part}" (shall be 1 or 2)`))
  throw new Error()
}

function parseArguments(args: string[]): { year: number; day: number; part: 1 | 2 | undefined } {
  if (args.length === 0) {
    return { ...getCurrentDay(), part: undefined }
  }
  if (args.length === 1) {
    return { ...getCurrentDay(), day: parseInt(args[0], 10), part: undefined }
  }
  if (args.length === 2) {
    return { year: parseInt(args[0], 10), day: parseInt(args[1], 10), part: undefined }
  }
  if (args.length === 3) {
    return { year: parseInt(args[0], 10), day: parseInt(args[1], 10), part: parsePart(args[2]) }
  }
  console.error(chalk.red(`Invalid number of arguments (expected 0, 1, 2 or 3, got ${args.length})`))
  throw new Error()
}

function printCommand(command: string[], prefix: string = "") {
  console.log(`${prefix}${chalk.greenBright(command.join(" "))}`)
}

function getPathToImport(dayFolder: string) {
  const currentFolder = dirname(fileURLToPath(import.meta.url))
  const indexFile = resolve(dayFolder, "index.js")
  return "./" + relative(currentFolder, indexFile).replace(/\\/g, "/")
}

async function run(args: string[]) {
  const { year, day, part } = parseArguments(args)
  console.log(`📆 Year ${chalk.cyan(year)} - Day ${chalk.cyan(day)}`)
  console.log(`🌍 https://adventofcode.com/${year}/day/${day}`)

  const { dayFolder } = await writeTemplateIfNecessary(year, day)

  const aocOptionsCommand = ["--day", day.toString(), "--year", year.toString()]
  const inputFile = resolve(dayFolder, "input")
  printCommand([
    "aoc",
    "download",
    ...aocOptionsCommand,
    "--overwrite",
    "--input-only",
    "--input-file",
    `"${inputFile}"`,
  ])

  console.log()
  console.log()
  for (const currentPart of [1, 2]) {
    if (part === undefined || part === currentPart) {
      console.log(`⚙️ ${chalk.cyan("Part " + currentPart)}`)

      const pathToImport = getPathToImport(dayFolder)
      const daySolution = await import(pathToImport)
      const partSolution = daySolution.default[`part${currentPart}`]
      if (!partSolution) {
        console.error(chalk.red(`Part ${currentPart} not found`))
      } else {
        function computeSolution(input: string) {
          const formattedInput = input.replace(/\r/g, "")
          try {
            return partSolution.run(formattedInput)
          } catch (err) {
            console.error(chalk.red(`  ${chalk.bold("X")} Error while running part ${currentPart}`))
            console.error(err)
            return undefined
          }
        }
        let gotAFailure = false
        for (let testIndex = 0; testIndex < partSolution.tests.length; testIndex++) {
          const test = partSolution.tests[testIndex]
          const response = computeSolution(test.input)
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

        if (await fs.exists(inputFile)) {
          const input = await fs.readFile(inputFile, "utf-8")
          const response = computeSolution(input)
          if (response === undefined) {
            console.error(chalk.red(`  ${chalk.bold("X")} No response for part ${currentPart}`))
          } else {
            console.log(`  ${gotAFailure ? "❗" : "🟢"} Solution: ${chalk.bold(chalk.yellowBright(response))}`)
            printCommand(["aoc", "submit", currentPart, ...aocOptionsCommand, "submit", response], "  ")
          }
        } else {
          console.error(chalk.red(`  ${chalk.bold("X")} No input file found`))
        }
      }
    }
    if (part === undefined && currentPart === 1) {
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
