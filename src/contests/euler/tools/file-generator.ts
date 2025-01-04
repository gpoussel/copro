import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import fs from "fs-extra"

export async function writeTemplateIfNecessary(problem: number): Promise<{ folder: string; file: string }> {
  const currentPath = fileURLToPath(import.meta.url)
  let problemsFolder
  if (problem < 100) {
    problemsFolder = resolve(currentPath, `../../problems-00xx/`)
  } else {
    const problemsParentFolder = resolve(currentPath, `../../problems/`)
    if (!(await fs.pathExists(problemsParentFolder))) {
      await fs.mkdir(problemsParentFolder)
    }
    const folderName =
      Math.floor(problem / 100)
        .toString()
        .padStart(2, "0") + "xx"
    problemsFolder = resolve(problemsParentFolder, `problems-${folderName}/`)
  }
  if (!(await fs.pathExists(problemsFolder))) {
    await fs.mkdir(problemsFolder)
  }

  const filename = `problem-${problem.toString().padStart(4, "0")}.ts`
  const solutionFile = resolve(problemsFolder, filename)
  if (!(await fs.pathExists(solutionFile))) {
    await fs.writeFile(
      solutionFile,
      `// 🧮 Project Euler - Problem ${problem}

export function solve() {
  return
}
`
    )
  }

  return { folder: problemsFolder, file: filename.replace(/\.ts/, ".js") }
}
