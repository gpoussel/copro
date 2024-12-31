import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import fs from "fs-extra"

export async function writeTemplateIfNecessary(problem: number): Promise<{ folder: string; file: string }> {
  const currentPath = fileURLToPath(import.meta.url)
  const folderName =
    Math.floor(problem / 100)
      .toString()
      .padStart(2, "0") + "xx"
  const problemsFolder = resolve(currentPath, `../../problems-${folderName}/`)
  if (!(await fs.pathExists(problemsFolder))) {
    await fs.mkdir(problemsFolder)
  }

  const filename = `problem-${problem.toString().padStart(4, "0")}.ts`
  const solutionFile = resolve(problemsFolder, filename)
  if (!(await fs.pathExists(solutionFile))) {
    await fs.writeFile(
      solutionFile,
      `import { ProjectEulerProblem } from "../../../types/contest.js"
      
// 🧮 Project Euler - Problem ${problem}

export function solve() {
  return
}
`
    )
  }

  return { folder: problemsFolder, file: filename.replace(/\.ts/, ".js") }
}
