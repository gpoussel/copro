// 🎮 CodinGame Puzzle - the-prime-twins---part-two
// https://www.codingame.com/training/medium/the-prime-twins---part-two

const operation = readline().trim()
const key = +readline()
const message = readline().replace(/\r/g, "")

const isPrime = (n: number): boolean => {
  if (n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false
  return true
}

// Code of each letter: A = 2*key, then key + middle of the next twin pair above the previous code
const codes: number[] = [2 * key]
for (let l = 1; l < 26; l++) {
  let p = codes[l - 1] + 1
  while (!(isPrime(p) && isPrime(p + 2))) p++
  codes.push(key + p + 1)
}

const encode = (msg: string): string => {
  if (!/^[A-Z ]*$/.test(msg)) return "ERROR !!"
  let out = ""
  let lastWasLetter = false
  for (const ch of msg) {
    if (ch === " ") {
      out += "GG"
      lastWasLetter = false
    } else {
      if (lastWasLetter) out += "G"
      out += codes[ch.charCodeAt(0) - 65].toString(16).toUpperCase()
      lastWasLetter = true
    }
  }
  return out
}

const decode = (msg: string): string => {
  if (!/^[0-9A-G]*$/.test(msg)) return "ERROR !!"
  const parts = msg.match(/[0-9A-F]+|G+/g) || []
  let out = ""
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part[0] === "G") {
      const between = i > 0 && i < parts.length - 1
      if (between && part.length === 1) continue
      if (part.length % 2 === 1) return "ERROR !!"
      for (let k = 0; k < part.length / 2; k++) out += " "
    } else {
      const letter = codes.indexOf(parseInt(part, 16))
      if (letter < 0) return "ERROR !!"
      out += String.fromCharCode(65 + letter)
    }
  }
  return out
}

console.log(operation === "ENCODE" ? encode(message) : decode(message))
