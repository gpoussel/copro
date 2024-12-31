import chalk from "chalk"
import { Contest, ProjectEulerProblem } from "../../types/contest.js"
import { getFile } from "../utils.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"

function parseArguments(args: string[]) {
  if (args.length === 1) {
    return { problem: +args[0] }
  }
  throw new Error(`Invalid number of arguments, expected 1, got ${args.length}`)
}

async function run(args: string[]) {
  const { problem } = parseArguments(args)
  console.log(`🌍 https://projecteuler.net/problem=${problem}`)

  const { folder, file } = await writeTemplateIfNecessary(problem)

  console.log()
  console.log()
  const pathToImport = getFile(folder, import.meta.url, file)
  const problemSolution = await import(pathToImport)
  const { solve } = problemSolution as ProjectEulerProblem
  const solution = solve()
  if (solution === undefined) {
    console.error(chalk.red(`  ${chalk.bold("X")} No response`))
  } else {
    console.log(`  🟢 Solution: ${chalk.bold(chalk.yellowBright(solution))}`)
  }
}

export default {
  name: "Project Euler",
  run,
} as Contest
