// 🎮 CodinGame Puzzle - library-dependencies
// https://www.codingame.com/

const nImp: number = parseInt(readline(), 10)
const imports: string[] = []
for (let i = 0; i < nImp; i++) {
  imports.push(readline().trim().slice("import ".length).trim())
}

const nDep: number = parseInt(readline(), 10)
const deps: Map<string, string[]> = new Map<string, string[]>()
for (let i = 0; i < nDep; i++) {
  const line: string = readline().trim()
  const reqIdx: number = line.indexOf(" requires ")
  const lib: string = line.slice(0, reqIdx).trim()
  const rest: string = line.slice(reqIdx + " requires ".length)
  const required: string[] = rest.split(",").map((s: string): string => s.trim())
  deps.set(lib, required)
}

function depsOf(lib: string): string[] {
  return deps.get(lib) ?? []
}

// Step 1: simulate in given order, find first error
const imported: Set<string> = new Set<string>()
let errorLib: string = ""
let errorRequired: string = ""
for (const lib of imports) {
  let ok: boolean = true
  for (const req of depsOf(lib)) {
    if (!imported.has(req)) {
      ok = false
      errorLib = lib
      errorRequired = req
      break
    }
  }
  if (!ok) {
    break
  }
  imported.add(lib)
}

if (errorLib === "") {
  console.log("Compiled successfully!")
} else {
  console.log(`Import error: tried to import ${errorLib} but ${errorRequired} is required.`)

  // Step 2: attempt to reorder via lexicographic topological sort
  // Only consider libraries that appear in the import list.
  const libs: Set<string> = new Set<string>(imports)
  const indeg: Map<string, number> = new Map<string, number>()
  const adj: Map<string, string[]> = new Map<string, string[]>()
  for (const lib of libs) {
    indeg.set(lib, 0)
    adj.set(lib, [])
  }
  for (const lib of libs) {
    for (const req of depsOf(lib)) {
      if (libs.has(req)) {
        adj.get(req)!.push(lib)
        indeg.set(lib, indeg.get(lib)! + 1)
      }
    }
  }

  const order: string[] = []
  const available: string[] = []
  for (const lib of libs) {
    if (indeg.get(lib)! === 0) {
      available.push(lib)
    }
  }
  while (available.length > 0) {
    available.sort()
    const next: string = available.shift()!
    order.push(next)
    for (const child of adj.get(next)!) {
      indeg.set(child, indeg.get(child)! - 1)
      if (indeg.get(child)! === 0) {
        available.push(child)
      }
    }
  }

  if (order.length < libs.size) {
    console.log("Fatal error: interdependencies.")
  } else {
    console.log("Suggest to change import order:")
    for (const lib of order) {
      console.log(`import ${lib}`)
    }
  }
}
