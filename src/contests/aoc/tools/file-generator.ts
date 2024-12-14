import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import fs from "fs-extra"
import { EOL } from "node:os"

async function addYearExport(file: string, year: number) {
  const fileContent = (await fs.exists(file)) ? await fs.readFile(file, "utf-8") : ""
  const lines = fileContent.split("\n")
  const importLines = lines.filter(l => l.startsWith("import"))
  const indexOfImport = lines.indexOf(importLines[importLines.length - 1]) + 1
  lines.splice(indexOfImport, 0, `import year${year} from "./${year}/index.js"`)

  const lastCurlyBrace = lines.lastIndexOf("}")
  if (lastCurlyBrace === -1) {
    lines.push("export default {")
    lines.push(`  ${year}: year${year},`)
    lines.push("}")
  } else {
    lines.splice(lastCurlyBrace, 0, `  ${year}: year${year},`)
  }

  await fs.writeFile(file, lines.join("\n"))
}

async function addDayExport(file: string, day: number) {
  const fileContent = (await fs.exists(file)) ? await fs.readFile(file, "utf-8") : ""
  const lines = fileContent.split("\n")
  const importLines = lines.filter(l => l.startsWith("import"))
  const indexOfImport = lines.indexOf(importLines[importLines.length - 1]) + 1
  lines.splice(indexOfImport, 0, `import day${day} from "./${formatDay(day)}/index.js"`)

  const lastCurlyBrace = lines.lastIndexOf("}")
  if (lastCurlyBrace === -1) {
    lines.push("export default {")
    lines.push(`  ${day}: day${day},`)
    lines.push("}")
  } else {
    lines.splice(lastCurlyBrace, 0, `  ${day}: day${day},`)
  }

  await fs.writeFile(file, lines.join("\n"))
}

async function generateSolutionFile(file: string, year: number, day: number) {
  const lines = [
    `import { AdventOfCodeContest } from "../../../../../types/contest.js"`,
    `import utils from "../../../../../utils/index.js"`,
    "",
    `// 🎄 Advent of Code ${year} - Day ${day}`,
    "",
    "function part1(input: string) {",
    "  return",
    "}",
    "",
    "function part2(input: string) {",
    "  return",
    "}",
    "",
    "const EXAMPLE = ``",
    "",
    "export default {",
    "  part1: {",
    "    run: part1,",
    "    tests: [{",
    "      input: EXAMPLE,",
    "      expected: undefined,",
    "    }],",
    "  },",
    "  part2: {",
    "    run: part2,",
    "    tests: [{",
    "      input: EXAMPLE,",
    "      expected: undefined,",
    "    }],",
    "  },",
    "} as AdventOfCodeContest",
    "",
  ]

  await fs.writeFile(file, lines.join(EOL))
}

function formatDay(day: number) {
  return day.toString().padStart(2, "0")
}

export async function writeTemplateIfNecessary(year: number, day: number): Promise<{ dayFolder: string }> {
  const currentPath = fileURLToPath(import.meta.url)
  const yearsFolder = resolve(currentPath, `../../years/`)
  const yearFolder = resolve(yearsFolder, `${year}/`)
  if (!(await fs.pathExists(yearsFolder))) {
    await fs.mkdir(yearsFolder)
  }

  if (!(await fs.pathExists(yearFolder))) {
    const yearsIndexFile = resolve(yearsFolder, `index.ts`)
    await addYearExport(yearsIndexFile, year)
    await fs.mkdir(yearFolder)
  }

  const dayFolder = resolve(yearFolder, `${formatDay(day)}/`)
  if (!(await fs.pathExists(dayFolder))) {
    const daysIndexFile = resolve(yearFolder, `index.ts`)
    await addDayExport(daysIndexFile, day)
    await fs.mkdir(dayFolder)
  }

  const solutionFile = resolve(dayFolder, `index.ts`)
  if (!(await fs.pathExists(solutionFile))) {
    await generateSolutionFile(solutionFile, year, day)
  }

  return { dayFolder }
}
