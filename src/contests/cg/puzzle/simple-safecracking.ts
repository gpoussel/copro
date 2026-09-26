// 🎮 CodinGame Puzzle - simple-safecracking
// https://www.codingame.com/training/hard/simple-safecracking

// Caesar cipher: the message always starts with "The safe combination is:",
// so the shift is given by the first letter (which decodes to "T"). Decode the
// part after the colon and map each spelled digit to its numeral.

const scMsg = readline()
const shift = (scMsg.toUpperCase().charCodeAt(0) - "T".charCodeAt(0) + 26) % 26
const decode = (s: string): string =>
  s.replace(/[a-z]/g, ch => String.fromCharCode(((ch.charCodeAt(0) - 97 - shift + 26) % 26) + 97))

const DIGITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
const words = decode(
  scMsg
    .slice(scMsg.indexOf(":") + 1)
    .trim()
    .toLowerCase()
).split("-")
console.log(words.map(w => DIGITS.indexOf(w)).join(""))
