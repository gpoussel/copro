// 🎮 CodinGame Puzzle - kangaroo-words
// https://www.codingame.com/training/easy/kangaroo-words

const isSubsequence = (joey: string, kangaroo: string): boolean => {
  let i = 0
  for (let j = 0; j < kangaroo.length && i < joey.length; j++) {
    if (kangaroo[j] === joey[i]) i++
  }
  return i === joey.length
}

const n: number = parseInt(readline(), 10)
const results: string[] = []
for (let k = 0; k < n; k++) {
  const words: string[] = readline()
    .split(",")
    .map((w: string) => w.trim())
  for (const kangaroo of words) {
    const joeys: string[] = []
    for (const joey of words) {
      if (joey !== kangaroo && joey.length < kangaroo.length && isSubsequence(joey, kangaroo)) {
        joeys.push(joey)
      }
    }
    if (joeys.length > 0) {
      joeys.sort()
      results.push(`${kangaroo}: ${joeys.join(", ")}`)
    }
  }
}

if (results.length === 0) {
  console.log("NONE")
} else {
  results.sort()
  console.log(results.join("\n"))
}
