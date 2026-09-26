// 🎮 CodinGame Puzzle - cgfunge-interpreter
// https://www.codingame.com/training/medium/cgfunge-interpreter

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())
const width = Math.max(...lines.map(l => l.length))
const at = (r: number, c: number) => {
  const line = lines[(r + n) % n]
  const ch = line[(c + width) % width]
  return ch === undefined ? " " : ch
}

const stack: number[] = []
const push = (v: number) => stack.push(((v % 256) + 256) % 256)
const pop = () => stack.pop()!

let r = 0
let c = 0
let dr = 0
let dc = 1
let stringMode = false
let out = ""
const step = () => {
  r = (r + dr + n) % n
  c = (c + dc + width) % width
}

for (;;) {
  const ch = at(r, c)
  if (stringMode) {
    if (ch === '"') stringMode = false
    else push(ch.charCodeAt(0))
  } else if (ch >= "0" && ch <= "9") {
    push(Number(ch))
  } else if (ch === "E") {
    break
  } else {
    switch (ch) {
      case ">": dr = 0; dc = 1; break
      case "<": dr = 0; dc = -1; break
      case "^": dr = -1; dc = 0; break
      case "v": dr = 1; dc = 0; break
      case "S": step(); break
      case '"': stringMode = true; break
      case "+": { const b = pop(); push(pop() + b); break }
      case "-": { const b = pop(); push(pop() - b); break }
      case "*": { const b = pop(); push(pop() * b); break }
      case "P": pop(); break
      case "X": { const b = pop(); const a = pop(); stack.push(b, a); break }
      case "D": { const a = pop(); stack.push(a, a); break }
      case "_": dr = 0; dc = pop() === 0 ? 1 : -1; break
      case "|": dc = 0; dr = pop() === 0 ? 1 : -1; break
      case "I": out += pop(); break
      case "C": out += String.fromCharCode(pop()); break
    }
  }
  step()
}
console.log(out)
