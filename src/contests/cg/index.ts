import chalk from "chalk"
import { Contest } from "../../types/contest.js"
import { writeTemplateIfNecessary } from "./tools/file-generator.js"

const CATEGORIES = ["golf", "puzzle", "opti"] as const
type Category = (typeof CATEGORIES)[number]

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['’]/g, "") // drop apostrophes so "don't" becomes "dont"
    .replace(/[^a-z0-9]+/g, "-") // any other non-alphanumeric run becomes a dash
    .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
}

function parseArguments(args: string[]): { category: Category; slug: string } {
  if (args.length !== 2) {
    throw new Error(`Invalid number of arguments, expected 2 (category, slug), got ${args.length}`)
  }

  const [category, rawSlug] = args
  if (!CATEGORIES.includes(category as Category)) {
    throw new Error(`Invalid category "${category}", expected one of: ${CATEGORIES.join(", ")}`)
  }

  const slug = slugify(rawSlug)
  if (slug.length === 0) {
    throw new Error(`Invalid slug "${rawSlug}", it does not contain any usable character`)
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
