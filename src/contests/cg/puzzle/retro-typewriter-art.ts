// 🎮 CodinGame Puzzle - retro-typewriter-art
// https://www.codingame.com/training/easy/retro-typewriter-art

const recipe = readline()

const abbreviations: Record<string, string> = {
  sp: " ",
  bS: "\\",
  sQ: "'",
}

let result = ""
for (const chunk of recipe.split(" ")) {
  if (chunk === "nl") {
    result += "\n"
    continue
  }

  const [, digits, rest] = chunk.match(/^(\d+)(.*)$/)!

  let count: number
  let char: string
  if (rest === "") {
    // All digits: the character is the last digit, the rest is the count.
    count = Number(digits.slice(0, -1))
    char = digits.slice(-1)
  } else {
    count = Number(digits)
    char = abbreviations[rest] ?? rest
  }

  result += char.repeat(count)
}

console.log(result)
