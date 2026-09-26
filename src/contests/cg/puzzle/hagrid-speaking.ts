// 🎮 CodinGame Puzzle - hagrid-speaking
// https://www.codingame.com/training/easy/hagrid-speaking

const REPLACEMENTS: Record<string, string> = { you: "yeh", to: "ter", and: "an'", me: "meh" }

// Copy the case pattern of `original` onto `replacement`; extra letters follow the last original letter
function matchCase(original: string, replacement: string): string {
  return [...replacement]
    .map((ch, i) => {
      const ref = original[Math.min(i, original.length - 1)]
      return ref === ref.toUpperCase() ? ch.toUpperCase() : ch.toLowerCase()
    })
    .join("")
}

function transformWord(word: string): string {
  if (/['-]/.test(word)) return word
  const replacement = REPLACEMENTS[word.toLowerCase()]
  if (replacement) return matchCase(word, replacement)
  if (word.length <= 2) return word
  let result = word
  if (/[fdtg]$/i.test(result)) result = result.slice(0, -1) + "'"
  if (/^h/i.test(result)) result = "'" + result.slice(1)
  return result
}

const n = parseInt(readline(), 10)
for (let i = 0; i < n; i++) {
  const line = readline()
  const start = line.indexOf('"')
  const end = line.lastIndexOf('"')
  if (start < 0 || !/\bHagrid\b/.test(line.slice(0, start) + " " + line.slice(end + 1))) {
    console.log(line)
    continue
  }
  const quote = line.slice(start, end + 1).replace(/[A-Za-z]+(?:['-][A-Za-z]+)*/g, transformWord)
  console.log(line.slice(0, start) + quote + line.slice(end + 1))
}
