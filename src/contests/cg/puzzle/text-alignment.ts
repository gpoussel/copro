const alignment = readline()
const N = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < N; i++) lines.push(readline())

const width = Math.max(...lines.map(l => l.length))

const out: string[] = []
for (const line of lines) {
  if (alignment === "LEFT") {
    out.push(line)
  } else if (alignment === "RIGHT") {
    out.push(" ".repeat(width - line.length) + line)
  } else if (alignment === "CENTER") {
    const rem = width - line.length
    const left = Math.floor(rem / 2)
    out.push(" ".repeat(left) + line)
  } else {
    const words = line.split(" ")
    if (words.length === 1) {
      out.push(line)
      continue
    }
    const wordLen = words.reduce((a, w) => a + w.length, 0)
    const totalSpaces = width - wordLen
    const gaps = words.length - 1
    let res = ""
    let prevCum = 0
    for (let g = 0; g < gaps; g++) {
      res += words[g]
      const cum = Math.floor(((g + 1) * totalSpaces) / gaps)
      const block = cum - prevCum
      prevCum = cum
      res += " ".repeat(block)
    }
    res += words[words.length - 1]
    out.push(res)
  }
}
console.log(out.join("\n"))
