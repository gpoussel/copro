// 🎮 CodinGame Puzzle - table-of-contents
// https://www.codingame.com/training/easy/table-of-contents

const L: number = parseInt(readline())
const N: number = parseInt(readline())
const counters: number[] = []
const out: string[] = []
for (let i = 0; i < N; i++) {
  const line = readline()
  let level = 0
  while (level < line.length && line[level] === ">") level++
  const rest = line.slice(level)
  const sp = rest.lastIndexOf(" ")
  const title = rest.slice(0, sp)
  const page = rest.slice(sp + 1)
  if (counters.length <= level) {
    while (counters.length <= level) counters.push(0)
  }
  counters[level]++
  counters.length = level + 1
  const num = counters[level]
  const indent = " ".repeat(level * 4)
  const left = indent + num + " " + title
  const dotsCount = L - left.length - page.length
  const dots = ".".repeat(Math.max(0, dotsCount))
  out.push(left + dots + page)
}
console.log(out.join("\n"))
