import chalk from "chalk"
import { cgRequest, getMyUserId } from "./client.js"

/**
 * One entry of the `Puzzle/findAllMinimalProgress` response. The response is an
 * array, one item per puzzle, holding the requested user's minimal progress.
 * Only a subset of the fields is documented/used here; unknown fields are kept
 * permissive so we stay resilient to API changes.
 */
interface MinimalProgress {
  id: number
  level: string
  creationTime?: number
  solvedCount?: number
  // Per-user score on this puzzle (0..100). 100 means fully solved.
  validatorScore?: number
  // Some payloads expose the count of languages the user solved it with.
  solvedLanguageCount?: number
  [key: string]: unknown
}

// Display order for the difficulty/category levels returned by the API.
const LEVEL_ORDER = [
  "tutorial",
  "easy",
  "medium",
  "hard",
  "expert",
  "multi",
  "optim",
  "codegolf-easy",
  "codegolf-medium",
  "codegolf-hard",
  "codegolf-expert",
]

function isSolved(entry: MinimalProgress): boolean {
  if (typeof entry.validatorScore === "number") {
    return entry.validatorScore >= 100
  }
  if (typeof entry.solvedLanguageCount === "number") {
    return entry.solvedLanguageCount > 0
  }
  return false
}

function levelLabel(level: string): string {
  const labels: Record<string, string> = {
    tutorial: "Tutorial",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    expert: "Expert",
    multi: "Multiplayer",
    optim: "Optimization",
    "codegolf-easy": "Code Golf (easy)",
    "codegolf-medium": "Code Golf (medium)",
    "codegolf-hard": "Code Golf (hard)",
    "codegolf-expert": "Code Golf (expert)",
  }
  return labels[level] ?? level
}

export async function runProgress(): Promise<void> {
  const userId = getMyUserId()
  console.log(`📊 Puzzle progress for user ${chalk.cyan(userId)}`)

  const progress = await cgRequest<MinimalProgress[]>("Puzzle", "findAllMinimalProgress", [userId])

  if (!Array.isArray(progress)) {
    throw new Error("Unexpected response from Puzzle/findAllMinimalProgress (expected an array)")
  }

  // Group by level, counting solved versus total.
  const byLevel = new Map<string, { solved: number; total: number }>()
  for (const entry of progress) {
    const bucket = byLevel.get(entry.level) ?? { solved: 0, total: 0 }
    bucket.total += 1
    if (isSolved(entry)) {
      bucket.solved += 1
    }
    byLevel.set(entry.level, bucket)
  }

  const knownLevels = LEVEL_ORDER.filter(l => byLevel.has(l))
  const otherLevels = [...byLevel.keys()].filter(l => !LEVEL_ORDER.includes(l)).sort()
  const orderedLevels = [...knownLevels, ...otherLevels]

  let totalSolved = 0
  let totalCount = 0
  console.log()
  for (const level of orderedLevels) {
    const { solved, total } = byLevel.get(level)!
    totalSolved += solved
    totalCount += total
    const label = levelLabel(level).padEnd(20)
    const ratio = total > 0 ? Math.round((100 * solved) / total) : 0
    console.log(`  ${chalk.bold(label)} ${chalk.green(solved)}/${total} ${chalk.gray(`(${ratio}%)`)}`)
  }

  console.log()
  console.log(
    `  ${chalk.bold("Total".padEnd(20))} ${chalk.green(totalSolved)}/${totalCount} ` +
      chalk.gray(`(${totalCount > 0 ? Math.round((100 * totalSolved) / totalCount) : 0}%)`)
  )
}
