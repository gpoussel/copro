import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2022 - Day 7

function parseInput(input: string) {
  return utils.input.lines(input)
}

interface DirectoryNode {
  name: string
  parent: DirectoryNode | null
  subdirectories: Map<string, DirectoryNode>
  files: Map<string, number>
}

function explore(lines: string[]): DirectoryNode {
  const root = {
    name: "",
    parent: null,
    subdirectories: new Map(),
    files: new Map(),
  }
  let currentDirectory: DirectoryNode = root
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const [, command, ...commandArgs] = line.split(" ")
    if (command === "cd") {
      const dir = commandArgs[0]
      if (dir === "/") {
        while (currentDirectory.parent) {
          currentDirectory = currentDirectory.parent
        }
      } else if (dir === "..") {
        if (currentDirectory.parent) {
          currentDirectory = currentDirectory.parent
        }
      } else {
        if (!currentDirectory.subdirectories.has(dir)) {
          const newDir: DirectoryNode = {
            name: dir,
            parent: currentDirectory,
            subdirectories: new Map(),
            files: new Map(),
          }
          currentDirectory.subdirectories.set(dir, newDir)
        }
        currentDirectory = currentDirectory.subdirectories.get(dir)!
      }
    } else if (command === "ls") {
      while (i + 1 < lines.length && !lines[i + 1].startsWith("$")) {
        i++
        const entry = lines[i]
        const [sizeOrDir, name] = entry.split(" ")
        if (sizeOrDir === "dir") {
          if (!currentDirectory.subdirectories.has(name)) {
            const newDir: DirectoryNode = {
              name: name,
              parent: currentDirectory,
              subdirectories: new Map(),
              files: new Map(),
            }
            currentDirectory.subdirectories.set(name, newDir)
          }
        } else {
          const size = +sizeOrDir
          currentDirectory.files.set(name, size)
        }
      }
    } else {
      throw new Error(`Unknown command: ${command}`)
    }
  }
  return root
}

function path(dir: DirectoryNode): string {
  const names = []
  let current: DirectoryNode | null = dir
  while (current) {
    names.push(current.name)
    current = current.parent
  }
  return names.reverse().join("/") || "/"
}

function getDirectorySizes(root: DirectoryNode): Map<string, number> {
  const stack: DirectoryNode[] = [root]
  const directorySizes: Map<string, number> = new Map()
  while (stack.length > 0) {
    const dir = stack.pop()!
    for (const subdir of dir.subdirectories.values()) {
      stack.push(subdir)
    }
    const sumOfFileSizes = Array.from(dir.files.values()).reduce((a, b) => a + b, 0)
    let current: DirectoryNode | null = dir
    while (current) {
      const dirPath = path(current)
      const existingSize = directorySizes.get(dirPath) || 0
      directorySizes.set(dirPath, existingSize + sumOfFileSizes)
      current = current.parent
    }
  }
  return directorySizes
}

function part1(inputString: string) {
  const lines = parseInput(inputString)
  const root = explore(lines)
  const directorySizes = getDirectorySizes(root)
  return Array.from(directorySizes.values())
    .filter(size => size <= 100000)
    .reduce((a, b) => a + b, 0)
}

function part2(inputString: string) {
  const lines = parseInput(inputString)
  const root = explore(lines)
  const directorySizes = getDirectorySizes(root)
  const totalDiskSpace = 70000000
  const neededSpace = 30000000
  const usedSpace = directorySizes.get("/") || 0
  const freeSpace = totalDiskSpace - usedSpace
  const needToFree = neededSpace - freeSpace
  const candidateSizes = Array.from(directorySizes.values()).filter(size => size >= needToFree)
  return Math.min(...candidateSizes)
}

const EXAMPLE = `
$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 95437,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 24933642,
      },
    ],
  },
} as AdventOfCodeContest
