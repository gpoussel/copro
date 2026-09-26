// 🎮 CodinGame Puzzle - lost-astronaut
// https://www.codingame.com/training/medium/lost-astronaut

const charCount = parseInt(readline())
const message = readline()

// Tokens are separated by single spaces; a literal space character shows up as an extra space
const tokens: string[] = []
let pos = 0
while (pos < message.length && tokens.length < charCount) {
  if (message[pos] === " ") {
    tokens.push(" ")
    pos++
  } else {
    let end = pos
    while (end < message.length && message[end] !== " ") end++
    tokens.push(message.substring(pos, end))
    pos = end
  }
  pos++ // separator
}
while (tokens.length < charCount) tokens.push(" ")

const isLetterOrSpace = (code: number): boolean =>
  code === 32 || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)

function decode(token: string): string {
  if (token.length === 1 && !/[0-9]/.test(token)) return token
  const bases: [number, RegExp][] = [
    [2, /^[01]+$/],
    [8, /^[0-7]+$/],
    [16, /^[0-9a-fA-F]+$/],
  ]
  for (const [base, pattern] of bases) {
    if (!pattern.test(token)) continue
    const code = parseInt(token, base)
    if (isLetterOrSpace(code)) return String.fromCharCode(code)
  }
  return token
}

console.log(tokens.map(decode).join(""))
