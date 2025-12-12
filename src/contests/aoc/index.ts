import { resolve } from "node:path"
import chalk from "chalk"
import { Contest } from "../../types/contest.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"
import { executeOnFile, executeTests, getIndexFile } from "../utils.js"

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

async function run(args: string[]) {
  const { year, day, part } = parseArguments(args)
  const maxDay = year >= 2025 ? 12 : 25
  if (day < 0 || day > maxDay) {
    console.error(chalk.red(`Invalid day "${day}" (shall be between 1 and ${maxDay})`))
    return
  }
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
  const isLastDay = year < 2025 ? day === 25 : day === 12
  for (const currentPart of isLastDay ? [1] : [1, 2]) {
    if (part === undefined || part === currentPart) {
      console.log(`⚙️ ${chalk.cyan("Part " + currentPart)}`)

      const pathToImport = getIndexFile(dayFolder, import.meta.url)
      const daySolution = await import(pathToImport)
      const partSolution = daySolution.default[`part${currentPart}`]
      if (!partSolution) {
        console.error(chalk.red(`Part ${currentPart} not found`))
      } else {
        const { gotAFailure } = executeTests(partSolution.tests, partSolution.run)
        if (!gotAFailure) {
          await executeOnFile(inputFile, partSolution.run, response => {
            if (response.toString().includes("--") || response.toString().includes("=")) {
              console.log(
                chalk.yellowBright(
                  "  (Answer contains special characters, make sure to submit directly on the website!)"
                )
              )
            } else {
              printCommand(["aoc", "submit", currentPart.toString(), ...aocOptionsCommand, response.toString()], "  ")
            }
          })
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
