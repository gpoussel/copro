// 🎮 CodinGame Puzzle - reversed-look-and-say
// https://www.codingame.com/training/medium/reversed-look-and-say

function lookAndSay(value: string): string {
  let result = ""
  let i = 0
  while (i < value.length) {
    let j = i
    while (j < value.length && value[j] === value[i]) j++
    result += `${j - i}${value[i]}`
    i = j
  }
  return result
}

// Returns the previous element, or null when the step is not reversible
function previousElement(value: string): string | null {
  if (value.length % 2 !== 0) return null
  let result = ""
  for (let i = 0; i < value.length; i += 2) {
    const count = parseInt(value[i])
    if (count === 0) return null
    for (let k = 0; k < count; k++) result += value[i + 1]
  }
  return lookAndSay(result) === value ? result : null
}

let current = readline().trim()
while (true) {
  const previous = previousElement(current)
  if (previous === null || previous === current) break
  current = previous
}
console.log(current)
