import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import fs from "fs-extra"

const CATEGORY_LABELS: Record<string, string> = {
  golf: "Code Golf",
  puzzle: "Puzzle",
  opti: "Optimization",
}

export async function writeTemplateIfNecessary(
  category: string,
  slug: string
): Promise<{ categoryFolder: string; file: string; created: boolean }> {
  const currentPath = fileURLToPath(import.meta.url)
  const categoryFolder = resolve(currentPath, `../../${category}/`)
  if (!(await fs.pathExists(categoryFolder))) {
    await fs.mkdir(categoryFolder)
  }

  const filename = `${slug}.ts`
  const solutionFile = resolve(categoryFolder, filename)
  const created = !(await fs.pathExists(solutionFile))
  if (created) {
    await fs.writeFile(
      solutionFile,
      `// @ts-nocheck
// 🎮 CodinGame ${CATEGORY_LABELS[category]} - ${slug}
// https://www.codingame.com/

`
    )
  }

  return { categoryFolder, file: filename, created }
}
