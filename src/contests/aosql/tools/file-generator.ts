import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import fs from "fs-extra"
import { formatDay } from "../../utils.js"

export async function writeTemplateIfNecessary(year: number, day: number): Promise<{ dayFolder: string }> {
  const currentPath = fileURLToPath(import.meta.url)
  const yearsFolder = resolve(currentPath, `../../years/`)
  const yearFolder = resolve(yearsFolder, `${year}/`)
  if (!(await fs.pathExists(yearsFolder))) {
    await fs.mkdir(yearsFolder)
  }

  if (!(await fs.pathExists(yearFolder))) {
    await fs.mkdir(yearFolder)
  }

  const dayFolder = resolve(yearFolder, `${formatDay(day)}/`)
  if (!(await fs.pathExists(dayFolder))) {
    await fs.mkdir(dayFolder)
  }

  const solutionFile = resolve(dayFolder, `solution.sql`)
  if (!(await fs.pathExists(solutionFile))) {
    const fileContent = `-- 🎄 Advent of SQL - Year ${year} - Day ${day}`
    await fs.writeFile(solutionFile, fileContent)
  }

  return { dayFolder }
}
