// 🎮 CodinGame Puzzle - item-maker
// https://www.codingame.com/training/easy/item-maker

const data: string = readline()
const parts: string[] = data.split(",")
const itemName: string = parts[0]
const itemRarity: string = parts[1]
const attributes: string[] = parts.slice(2).map((a: string): string => {
  const idx: number = a.indexOf(":")
  return a.slice(0, idx) + " " + a.slice(idx + 1)
})

const nameText: string = "-" + itemName + "-"

const contents: string[] = [nameText, itemRarity, ...attributes]
let textWidth: number = 0
for (const c of contents) {
  if (c.length > textWidth) textWidth = c.length
}

// inner width between the two border characters
const inner: number = textWidth + 2

function center(text: string): string {
  const total: number = textWidth - text.length
  const left: number = Math.ceil(total / 2)
  const right: number = total - left
  return " ".repeat(left) + text + " ".repeat(right)
}

function left(text: string): string {
  return text + " ".repeat(textWidth - text.length)
}

const lines: string[] = []

if (itemRarity === "Common") {
  const bar: string = "#".repeat(inner)
  lines.push("#" + bar + "#")
  lines.push("# " + center(nameText) + " #")
  lines.push("# " + center(itemRarity) + " #")
  for (const a of attributes) lines.push("# " + left(a) + " #")
  lines.push("#" + bar + "#")
} else if (itemRarity === "Rare") {
  const bar: string = "#".repeat(inner)
  lines.push("/" + bar + "\\")
  lines.push("# " + center(nameText) + " #")
  lines.push("# " + center(itemRarity) + " #")
  for (const a of attributes) lines.push("# " + left(a) + " #")
  lines.push("\\" + bar + "/")
} else if (itemRarity === "Epic") {
  const top: string = "-".repeat(inner)
  const bottom: string = "_".repeat(inner)
  lines.push("/" + top + "\\")
  lines.push("| " + center(nameText) + " |")
  lines.push("| " + center(itemRarity) + " |")
  for (const a of attributes) lines.push("| " + left(a) + " |")
  lines.push("\\" + bottom + "/")
} else {
  // Legendary
  const bottom: string = "_".repeat(inner)
  let topMiddle: string
  let dashes: number
  if (inner % 2 === 0) {
    topMiddle = "\\__/"
    dashes = (inner - 4) / 2
  } else {
    topMiddle = "\\_/"
    dashes = (inner - 3) / 2
  }
  lines.push("X" + "-".repeat(dashes) + topMiddle + "-".repeat(dashes) + "X")
  lines.push("[ " + center(nameText) + " ]")
  lines.push("| " + center(itemRarity) + " |")
  for (const a of attributes) lines.push("| " + left(a) + " |")
  lines.push("X" + bottom + "X")
}

console.log(lines.join("\n"))
