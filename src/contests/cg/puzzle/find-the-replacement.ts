// 🎮 CodinGame Puzzle - find-the-replacement
// https://www.codingame.com/training/medium/find-the-replacement

const textX = readline()
const textY = readline()

function findReplacements(): string[] | null {
  const mapping = new Map<string, string>()
  const order: string[] = []
  for (let i = 0; i < textX.length; i++) {
    const from = textX[i]
    const to = textY[i]
    const known = mapping.get(from)
    if (known === undefined) {
      mapping.set(from, to)
      order.push(from)
    } else if (known !== to) {
      return null
    }
  }
  return order.filter(c => mapping.get(c) !== c).map(c => `${c}->${mapping.get(c)}`)
}

const replacements = findReplacements()
if (replacements === null) console.log("CAN'T")
else if (replacements.length === 0) console.log("NONE")
else console.log(replacements.join("\n"))
