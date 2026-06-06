import chalk from "chalk"
import { cgRequest, getMyUserId } from "./client.js"

const TYPESCRIPT_LANGUAGE = "TypeScript"
const DEFAULT_CATEGORY = "golf"

/**
 * Maps user-friendly category names (including the ones used by the local file
 * generator) to a predicate over the `level` value returned by the CodinGame
 * API. Code golf is split into several levels (codegolf-easy, codegolf-medium,
 * codegolf-hard, codegolf-expert), so it is matched by prefix.
 */
const CATEGORY_MATCHERS: Record<string, (level: string) => boolean> = {
  golf: level => level.startsWith("codegolf"),
  codegolf: level => level.startsWith("codegolf"),
  opti: level => level === "optim",
  optim: level => level === "optim",
  optimization: level => level === "optim",
  tutorial: level => level === "tutorial",
  easy: level => level === "easy",
  medium: level => level === "medium",
  hard: level => level === "hard",
  expert: level => level === "expert",
  multi: level => level === "multi",
}

interface MinimalProgress {
  id: number
  level: string
  [key: string]: unknown
}

interface PuzzleDetail {
  id: number
  prettyId?: string
  title?: string
  level?: string
}

// Difficulty ordering, ignoring any "codegolf-" prefix (codegolf-easy → easy).
const DIFFICULTY_ORDER = ["tutorial", "easy", "medium", "hard", "expert", "multi", "optim"]

function difficultyRank(level: string | undefined): number {
  const key = (level ?? "").replace(/^codegolf-/, "")
  const idx = DIFFICULTY_ORDER.indexOf(key)
  return idx === -1 ? DIFFICULTY_ORDER.length : idx
}

/** Rich puzzle progress returned by Puzzle/findProgressByPrettyId. */
interface PuzzleProgress {
  title?: string
  level?: string
  // Per-user code size for code golf (the "Taille du code" criterion).
  optimPoints?: number
  validatorScore?: number
  prettyId?: string
  // The id to use against the leaderboard endpoints (e.g. "thor-codesize"),
  // which differs from prettyId for puzzles linked to a base puzzle.
  puzzleLeaderboardId?: string
  [key: string]: unknown
}

/**
 * A puzzle leaderboard row (also the shape returned by getCodinGamerPuzzleRanking
 * for a single user). For code golf, `criteriaScore` holds the code size — lower
 * is better.
 */
interface PuzzleRankingRow {
  pseudo?: string
  rank?: number
  score?: number
  criteriaScore?: number
  programmingLanguage?: string
  codingamer?: { userId?: number; publicHandle?: string }
  [key: string]: unknown
}

interface PuzzleLeaderboard {
  users?: PuzzleRankingRow[]
  [key: string]: unknown
}

// 4th argument of getFilteredPuzzleLeaderboard: a column filter. Inactive
// returns the global board; the LANGUAGE filter restricts it to one language.
const NO_FILTER = { active: false, column: "", filter: "" }
const typescriptFilter = { active: true, column: "LANGUAGE", filter: TYPESCRIPT_LANGUAGE }

/** Lists the puzzles of a given category, with their pretty id and title. */
async function getPuzzlesByCategory(
  userId: number,
  matches: (level: string) => boolean
): Promise<PuzzleDetail[]> {
  const progress = await cgRequest<MinimalProgress[]>("Puzzle", "findAllMinimalProgress", [userId])
  if (!Array.isArray(progress)) {
    throw new Error("Unexpected response from Puzzle/findAllMinimalProgress (expected an array)")
  }

  const selected = progress.filter(p => matches(p.level))
  if (selected.length === 0) {
    return []
  }
  const levelById = new Map(selected.map(p => [p.id, p.level]))
  const ids = selected.map(p => p.id)

  // findProgressByIds maps numeric ids to their prettyId / title.
  const details = await cgRequest<PuzzleDetail[]>("Puzzle", "findProgressByIds", [ids, userId, 2])
  const puzzles: PuzzleDetail[] =
    Array.isArray(details) && details.length > 0
      ? details.map(d => ({ ...d, level: d.level ?? levelById.get(d.id) }))
      : ids.map(id => ({ id, level: levelById.get(id) }))

  // Sort by increasing difficulty, then by title (then prettyId) as a tiebreak.
  return puzzles.sort((a, b) => {
    const byDifficulty = difficultyRank(a.level) - difficultyRank(b.level)
    if (byDifficulty !== 0) {
      return byDifficulty
    }
    const nameA = a.title ?? a.prettyId ?? ""
    const nameB = b.title ?? b.prettyId ?? ""
    return nameA.localeCompare(nameB)
  })
}

interface PuzzleScores {
  title: string
  myLength?: number
  myLanguage?: string
  firstLength?: number
  firstLanguages: string[]
  bestTs?: number
}

async function collectPuzzle(puzzle: PuzzleDetail, userId: number): Promise<PuzzleScores> {
  const prettyId = puzzle.prettyId
  if (!prettyId) {
    throw new Error(`puzzle id ${puzzle.id} has no pretty id`)
  }

  // The rich progress carries the leaderboard id and my own code size.
  const detail = await cgRequest<PuzzleProgress>("Puzzle", "findProgressByPrettyId", [prettyId, userId])
  const leaderboardId = detail.puzzleLeaderboardId ?? prettyId
  const title = detail.title ?? puzzle.title ?? prettyId

  // My own ranking on this puzzle: criteriaScore is my code size, and it tells
  // us my language and public handle. Falls back to optimPoints if unavailable.
  let mine: PuzzleRankingRow | undefined
  try {
    mine = await cgRequest<PuzzleRankingRow>("Leaderboards", "getCodinGamerPuzzleRanking", [
      userId,
      leaderboardId,
    ])
  } catch {
    mine = undefined
  }

  // The handle locates the current user's row; CG_HANDLE overrides the value
  // derived from my ranking (useful for puzzles I have not solved).
  const handle = process.env.CG_HANDLE || mine?.codingamer?.publicHandle || ""
  const [globalBoard, tsBoard] = await Promise.all([
    cgRequest<PuzzleLeaderboard>("Leaderboards", "getFilteredPuzzleLeaderboard", [
      leaderboardId,
      handle,
      "global",
      NO_FILTER,
    ]),
    cgRequest<PuzzleLeaderboard>("Leaderboards", "getFilteredPuzzleLeaderboard", [
      leaderboardId,
      handle,
      "global",
      typescriptFilter,
    ]),
  ])

  // A valid code-golf leaderboard entry must be fully solved and have a
  // positive code size. Incomplete rows can expose tiny criteriaScore values
  // (for example 16 chars with score 0) and would otherwise wrongly win.
  const lengthsOf = (board: PuzzleLeaderboard) =>
    (board?.users ?? []).filter(
      (r): r is PuzzleRankingRow & { criteriaScore: number } =>
        r.score === 100 && typeof r.criteriaScore === "number" && r.criteriaScore > 0
    )

  // First place by length: shortest submission across all languages.
  const globalRows = lengthsOf(globalBoard)
  const firstLength = globalRows.length > 0 ? Math.min(...globalRows.map(r => r.criteriaScore)) : undefined
  const firstLanguages =
    firstLength === undefined
      ? []
      : [
          ...new Set(
            globalRows.filter(r => r.criteriaScore === firstLength).map(r => r.programmingLanguage ?? "?")
          ),
        ].sort()

  // Best TypeScript submission overall: the leaderboard is filtered to
  // TypeScript, so its shortest row is the answer.
  const tsRows = lengthsOf(tsBoard)
  const bestTs = tsRows.length > 0 ? Math.min(...tsRows.map(r => r.criteriaScore)) : undefined

  const myCandidate = mine?.criteriaScore ?? detail.optimPoints
  const myLength = typeof myCandidate === "number" ? myCandidate : undefined

  return {
    title,
    myLength,
    myLanguage: mine?.programmingLanguage,
    firstLength,
    firstLanguages,
    bestTs,
  }
}

/** Pads a colored string to a visible width computed from its plain text. */
function pad(colored: string, plain: string, width: number): string {
  return colored + " ".repeat(Math.max(0, width - plain.length))
}

function renderTable(rows: PuzzleScores[]): void {
  const dash = chalk.gray("—")

  // Build the plain (for width) and colored (for display) text of each cell.
  const cells = rows.map(r => {
    const my = r.myLength === undefined ? { plain: "—", colored: dash } : score(r.myLength, r.myLanguage ? [r.myLanguage] : [])
    const first = r.firstLength === undefined ? { plain: "—", colored: dash } : score(r.firstLength, r.firstLanguages)
    const ts = r.bestTs === undefined ? { plain: "—", colored: dash } : { plain: String(r.bestTs), colored: chalk.green(r.bestTs) }
    return { title: r.title, my, first, ts }
  })

  const headers = { title: "Puzzle", my: "My best", first: "First place", ts: "Best TS" }
  const w = {
    title: Math.max(headers.title.length, ...cells.map(c => c.title.length)),
    my: Math.max(headers.my.length, ...cells.map(c => c.my.plain.length)),
    first: Math.max(headers.first.length, ...cells.map(c => c.first.plain.length)),
    ts: Math.max(headers.ts.length, ...cells.map(c => c.ts.plain.length)),
  }

  console.log()
  console.log(
    `  ${chalk.bold(headers.title.padEnd(w.title))}  ${chalk.bold(headers.my.padEnd(w.my))}  ` +
      `${chalk.bold(headers.first.padEnd(w.first))}  ${chalk.bold(headers.ts.padEnd(w.ts))}`
  )
  console.log(`  ${chalk.gray("─".repeat(w.title + w.my + w.first + w.ts + 6))}`)
  for (const c of cells) {
    console.log(
      `  ${chalk.cyan(c.title.padEnd(w.title))}  ${pad(c.my.colored, c.my.plain, w.my)}  ` +
        `${pad(c.first.colored, c.first.plain, w.first)}  ${pad(c.ts.colored, c.ts.plain, w.ts)}`
    )
  }
}

/** A "<length> [langs]" cell, length in green and languages in yellow. */
function score(length: number, languages: string[]): { plain: string; colored: string } {
  if (languages.length === 0) {
    return { plain: String(length), colored: chalk.green(length) }
  }
  const langs = `[${languages.join(", ")}]`
  return { plain: `${length} ${langs}`, colored: `${chalk.green(length)} ${chalk.yellow(langs)}` }
}

export async function runGolfScore(args: string[]): Promise<void> {
  const rawCategory = (args[0] ?? DEFAULT_CATEGORY).toLowerCase()
  const matches = CATEGORY_MATCHERS[rawCategory]
  if (!matches) {
    throw new Error(
      `Unknown category "${rawCategory}". Valid categories: ${Object.keys(CATEGORY_MATCHERS).join(", ")}.`
    )
  }

  const userId = getMyUserId()
  console.log(`⛳ Code golf scores for user ${chalk.cyan(userId)} — category ${chalk.cyan(rawCategory)}`)

  const puzzles = await getPuzzlesByCategory(userId, matches)
  if (puzzles.length === 0) {
    console.log(chalk.gray(`  No puzzles found for category "${rawCategory}".`))
    return
  }

  const results: PuzzleScores[] = []
  const total = puzzles.length
  for (let i = 0; i < total; i++) {
    const puzzle = puzzles[i]
    const name = puzzle.title ?? puzzle.prettyId ?? `id ${puzzle.id}`
    progress(`⏳ ${i + 1}/${total} ${name}`)
    try {
      results.push(await collectPuzzle(puzzle, userId))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      clearProgress()
      console.log(chalk.yellow(`  ⚠ Skipped ${puzzle.prettyId ?? puzzle.id}: ${message}`))
    }
  }
  clearProgress()

  if (results.length > 0) {
    renderTable(results)
  }
}

let progressLength = 0

/** Writes a transient, in-place progress line (when stdout is a TTY). */
function progress(text: string): void {
  if (!process.stdout.isTTY) {
    return
  }
  process.stdout.write(`\r${text.padEnd(progressLength)}`)
  progressLength = text.length
}

/** Clears the current in-place progress line. */
function clearProgress(): void {
  if (!process.stdout.isTTY || progressLength === 0) {
    return
  }
  process.stdout.write(`\r${" ".repeat(progressLength)}\r`)
  progressLength = 0
}
