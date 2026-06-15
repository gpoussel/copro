// 🎮 CodinGame Puzzle - saving-snoopy
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const swaps: Map<string, string> = new Map<string, string>()
for (let i = 0; i < n; i++) {
  const line: string = readline()
  const parts: string[] = line.split(" ")
  swaps.set(parts[0], parts[2])
}
readline() // length, unused
const encoded: string = readline()

const stack: string[] = []
const output: string[] = []
let i = 0
while (i < encoded.length) {
  const ch: string = encoded[i]
  if (ch === "+") {
    i++
    continue
  }
  if (ch === "*") {
    if (stack.length > 0) {
      output.push(stack.pop() as string)
    }
    i++
    continue
  }
  if (ch === "#") {
    const cnt: number = parseInt(encoded[i + 1], 10)
    for (let k = 0; k < cnt && stack.length > 0; k++) {
      stack.pop()
    }
    i += 2
    continue
  }
  if (ch === "%") {
    const shuffled: string[] = []
    for (let start = 0; start < 2 && start < stack.length; start++) {
      for (let j = start; j < stack.length; j += 2) {
        shuffled.push(stack[j])
      }
    }
    stack.length = 0
    for (const c of shuffled) {
      stack.push(c)
    }
    i++
    continue
  }
  const mapped: string = swaps.has(ch) ? (swaps.get(ch) as string) : ch
  stack.push(mapped)
  i++
}

const decoded: string = output.join("")

// Wrap into lines as close to 75 chars as possible without exceeding,
// breaking on spaces, no leading/trailing spaces.
const words: string[] = decoded.split(" ")
const lines: string[] = []
let current: string = ""
for (const word of words) {
  if (current === "") {
    current = word
  } else if (current.length + 1 + word.length <= 75) {
    current += " " + word
  } else {
    lines.push(current)
    current = word
  }
}
if (current !== "") {
  lines.push(current)
}
console.log(lines.join("\n"))
