// 🎮 CodinGame Puzzle - wordle-solution-regex
// https://www.codingame.com/training/medium/wordle-solution-regex

const n = parseInt(readline())
const green: string[] = [".", ".", ".", ".", "."]
const excluded: string[][] = [[], [], [], [], []]
const greenLetters: { [c: string]: boolean } = {}
const yellowLetters: { [c: string]: boolean } = {}
const grayLetters: { [c: string]: boolean } = {}

for (let i = 0; i < n; i++) {
  const [guess, result] = readline().split(" ")
  for (let p = 0; p < 5; p++) {
    const c = guess[p]
    if (result[p] === "G") {
      green[p] = c
      greenLetters[c] = true
    } else if (result[p] === "Y") {
      yellowLetters[c] = true
      if (excluded[p].indexOf(c) < 0) excluded[p].push(c)
    } else grayLetters[c] = true
  }
}

const group = (letters: string[]): string => (letters.length === 1 ? letters[0] : `[${letters.sort().join("")}]`)

if (green.indexOf(".") < 0) {
  console.log(`^${green.join("")}$`)
} else {
  let regex = "^"
  for (const c of Object.keys(yellowLetters).sort()) if (!greenLetters[c]) regex += `(?=.*${c})`
  const grays = Object.keys(grayLetters).filter(c => !greenLetters[c] && !yellowLetters[c])
  if (grays.length > 0) regex += `(?!.*${group(grays)})`
  for (let p = 0; p < 5; p++) {
    if (green[p] !== ".") regex += green[p]
    else regex += (excluded[p].length > 0 ? `(?!${group(excluded[p])})` : "") + "."
  }
  console.log(regex + "$")
}
