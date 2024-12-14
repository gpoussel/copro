import chalk from "chalk"
import { Contest } from "../../types/contest"

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
    return { ...getCurrentDay(), part: parsePart(args[0]) }
  }
  if (args.length === 2) {
    return { ...getCurrentDay(), day: parseInt(args[0], 10), part: parsePart(args[1]) }
  }
  if (args.length === 3) {
    return { year: parseInt(args[0], 10), day: parseInt(args[1], 10), part: parsePart(args[2]) }
  }
  console.error(chalk.red(`Invalid number of arguments (expected 0, 1, 2 or 3, got ${args.length})`))
  throw new Error()
}

async function run(args: string[]) {
  const { year, day, part } = parseArguments(args)
  console.log(`📆 Year ${chalk.cyan(year)} - Day ${chalk.cyan(day)}`)

  for (const currentPart of [1, 2]) {
    if (part === undefined || part === currentPart) {
      console.log(`⚙️ Part ${chalk.cyan(currentPart)}`)
      console.log()
    }
  }
}

export default {
  name: "Advent of Code",
  run,
} as Contest
