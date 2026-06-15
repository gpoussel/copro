// 🎮 CodinGame Puzzle - escape-the-madness
// https://www.codingame.com/training/easy/escape-the-madness

const text: string = readline()

// Step 1: trigraphs
const trigraphs: { [key: string]: string } = {
  "=": "#",
  "/": "\\",
  "'": "^",
  "(": "[",
  ")": "]",
  "!": "|",
  "-": "~",
}

function step1(s: string): string {
  let out = ""
  let i = 0
  while (i < s.length) {
    if (s[i] === "?" && s[i + 1] === "?" && trigraphs[s[i + 2]] !== undefined) {
      out += trigraphs[s[i + 2]]
      i += 3
    } else {
      out += s[i]
      i += 1
    }
  }
  return out
}

function step2(s: string): string {
  let out = ""
  let i = 0
  while (i < s.length) {
    if (s[i] === "\\" && i + 1 < s.length) {
      const next = s[i + 1]
      if (next === "x") {
        const hex = s.substring(i + 2, i + 4)
        out += String.fromCharCode(parseInt(hex, 16))
        i += 4
      } else if (next === "u") {
        const hex = s.substring(i + 2, i + 6)
        out += String.fromCharCode(parseInt(hex, 16))
        i += 6
      } else if (next === "U") {
        const hex = s.substring(i + 2, i + 10)
        out += String.fromCharCode(parseInt(hex, 16))
        i += 10
      } else {
        out += next
        i += 2
      }
    } else {
      out += s[i]
      i += 1
    }
  }
  return out
}

const entities: { [key: string]: string } = {
  amp: "&",
  lt: "<",
  gt: ">",
  bsol: "\\",
}

function step3(s: string): string {
  let out = ""
  let i = 0
  while (i < s.length) {
    if (s[i] === "&") {
      const semi = s.indexOf(";", i + 1)
      if (semi > i + 1) {
        const name = s.substring(i + 1, semi)
        if (name[0] === "#" && /^#[0-9]+$/.test(name)) {
          out += String.fromCharCode(parseInt(name.substring(1), 10))
          i = semi + 1
          continue
        } else if (entities[name] !== undefined) {
          out += entities[name]
          i = semi + 1
          continue
        }
      }
      out += s[i]
      i += 1
    } else {
      out += s[i]
      i += 1
    }
  }
  return out
}

console.log(step3(step2(step1(text))))
