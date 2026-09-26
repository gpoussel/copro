// 🎮 CodinGame Puzzle - cgs-minifier
// https://www.codingame.com/training/medium/cgs-minifier

const cgsLines = parseInt(readline())
let source = ""
for (let i = 0; i < cgsLines; i++) source += readline() + "\n"

const renamed: { [variable: string]: string } = {}
let nextVar = 0
let minified = ""
let i = 0
while (i < source.length) {
  const ch = source[i]
  if (ch === "'") {
    // Keep quoted names verbatim
    const end = source.indexOf("'", i + 1)
    const stop = end < 0 ? source.length : end + 1
    minified += source.substring(i, stop)
    i = stop
  } else if (ch === "$") {
    const end = source.indexOf("$", i + 1)
    const variable = source.substring(i + 1, end)
    if (renamed[variable] === undefined) renamed[variable] = String.fromCharCode(97 + nextVar++)
    minified += "$" + renamed[variable] + "$"
    i = end + 1
  } else {
    if (!/\s/.test(ch)) minified += ch
    i++
  }
}
console.log(minified)
