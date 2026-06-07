// 🎮 CodinGame Puzzle - caesar-is-the-chief
// https://www.codingame.com/training/easy/caesar-is-the-chief

const message = readline()

function applyShift(text: string, shift: number): string {
  return text
    .split("")
    .map(ch => {
      if (ch >= "A" && ch <= "Z") {
        return String.fromCharCode(((ch.charCodeAt(0) - 65 - shift + 26) % 26) + 65)
      }
      return ch
    })
    .join("")
}

function containsChiefAsWord(text: string): boolean {
  const words = text.split(" ")
  return words.includes("CHIEF")
}

let result = "WRONG MESSAGE"

for (let shift = 0; shift < 26; shift++) {
  const decoded = applyShift(message, shift)
  if (containsChiefAsWord(decoded)) {
    result = decoded
    break
  }
}

console.log(result)
