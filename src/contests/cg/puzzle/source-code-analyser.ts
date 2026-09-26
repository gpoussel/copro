// 🎮 CodinGame Puzzle - source-code-analyser
// https://www.codingame.com/training/medium/source-code-analyser

const n = +readline()
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())
const source = lines.join("\n") + "\n"

// Blank out comments and string literals
let code = ""
for (let i = 0; i < source.length; i++) {
  const ch = source[i]
  if (ch === "/" && source[i + 1] === "/") {
    while (i < source.length && source[i] !== "\n") i++
    code += "\n"
  } else if (ch === "/" && source[i + 1] === "*") {
    const end = source.indexOf("*/", i + 2)
    i = end < 0 ? source.length : end + 1
    code += " "
  } else if (ch === '"' || ch === "'") {
    i++
    while (i < source.length && source[i] !== ch) {
      if (source[i] === "\\") i++
      i++
    }
    code += " "
  } else code += ch
}

const RESERVED = ["and", "array", "echo", "else", "elseif", "if", "for", "foreach", "function", "or", "return", "while", "new"]

// User-defined functions and classes
const excluded: string[] = []
const defRegex = /\b(?:function|new)\s+([A-Za-z0-9_]+)\s*\(/gi
let m: RegExpExecArray | null
while ((m = defRegex.exec(code))) excluded.push(m[1])

const counts: { [name: string]: number } = {}
const callRegex = /([$A-Za-z0-9_]+)\(/g
while ((m = callRegex.exec(code))) {
  const name = m[1]
  if (name[0] === "$" || RESERVED.indexOf(name.toLowerCase()) >= 0 || excluded.indexOf(name) >= 0) continue
  counts[name] = (counts[name] || 0) + 1
}

const names = Object.keys(counts).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
if (names.length === 0) console.log("NONE")
for (const name of names) console.log(`${name} ${counts[name]}`)
