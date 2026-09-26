// 🎮 CodinGame Puzzle - format-string-validation
// https://www.codingame.com/training/medium/format-string-validation

const inputText = readline()
const pattern = readline()

// reach[i] = text prefix of length i is matched by the pattern prefix read so far
let reach: boolean[] = new Array(inputText.length + 1).fill(false)
reach[0] = true
for (const p of pattern) {
  const next: boolean[] = new Array(inputText.length + 1).fill(false)
  for (let i = 0; i <= inputText.length; i++) {
    if (p === "~") next[i] = reach[i] || (i > 0 && next[i - 1])
    else if (i > 0 && reach[i - 1] && (p === "?" || p === inputText[i - 1])) next[i] = true
  }
  reach = next
}

console.log(reach[inputText.length] ? "MATCH" : "FAIL")
