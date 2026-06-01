import chalk from "chalk"
import { Contest } from "../../types/contest.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"

const CATEGORIES = ["golf", "puzzle", "opti"] as const
type Category = (typeof CATEGORIES)[number]

function parseArguments(args: string[]): { category: Category; slug: string } {
  if (args.length !== 2) {
    throw new Error(`Invalid number of arguments, expected 2 (category, slug), got ${args.length}`)
  }

  const [category, slug] = args
  if (!CATEGORIES.includes(category as Category)) {
    throw new Error(`Invalid category "${category}", expected one of: ${CATEGORIES.join(", ")}`)
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid slug "${slug}", expected lowercase letters, digits and dashes`)
  }

  return { category: category as Category, slug }
}

async function run(args: string[]) {
  const { category, slug } = parseArguments(args)
  console.log(`🎮 Category ${chalk.cyan(category)} - Puzzle ${chalk.cyan(slug)}`)

  const { file, created } = await writeTemplateIfNecessary(category, slug)
  if (created) {
    console.log(`  📝 Created cg/${category}/${file}`)
  } else {
    console.log(`  📁 cg/${category}/${file} already exists`)
  }
}

export default {
  name: "CodinGame",
  run,
} as Contest
