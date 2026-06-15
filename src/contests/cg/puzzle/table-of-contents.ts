// 🎮 CodinGame Puzzle - table-of-contents
// https://www.codingame.com/

const lengthOfLine: number = parseInt(readline(), 10)
const n: number = parseInt(readline(), 10)

const counters: number[] = []

for (let i = 0; i < n; i++) {
  const entry: string = readline()
  let level: number = 0
  while (entry[level] === ">") {
    level++
  }
  const rest: string = entry.slice(level)
  const lastSpace: number = rest.lastIndexOf(" ")
  const title: string = rest.slice(0, lastSpace)
  const page: string = rest.slice(lastSpace + 1)

  counters.length = level + 1
  counters[level] = (counters[level] ?? 0) + 1
  for (let j = 0; j <= level; j++) {
    if (counters[j] === undefined) {
      counters[j] = 0
    }
  }

  const indent: string = " ".repeat(level * 4)
  const left: string = `${indent}${counters[level]} ${title}`
  const dotsCount: number = lengthOfLine - left.length - page.length
  const dots: string = ".".repeat(dotsCount)
  console.log(`${left}${dots}${page}`)
}
