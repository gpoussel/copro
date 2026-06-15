// 🎮 CodinGame Puzzle - save-my-drone
// https://www.codingame.com/training/easy/save-my-drone

readline()
const Y = parseInt(readline())
const R = parseInt(readline())

const rows: string[] = []
for (let i = 0; i < Y; i++) {
  rows.push(readline())
}

// If R=1 (180° rotation), flip both row order and character order within rows
if (R === 1) {
  rows.reverse()
  for (let i = 0; i < rows.length; i++) {
    rows[i] = rows[i].split("").reverse().join("")
  }
}

const tileNames: Record<string, string> = {
  "#": "Block",
  "^": "Thruster",
  "@": "Gyroscope",
  "+": "Fuel",
  $: "Core",
}

const validChars = new Set(["#", "^", "@", "+", "$"])

// Collect all valid tiles in order
const tiles: string[] = []
for (const row of rows) {
  for (const ch of row) {
    if (validChars.has(ch)) {
      tiles.push(ch)
    }
  }
}

if (tiles.length === 0) {
  console.log("Nothing")
} else {
  // Run-length encode
  const parts: string[] = []
  let i = 0
  while (i < tiles.length) {
    const ch = tiles[i]
    let count = 1
    while (i + count < tiles.length && tiles[i + count] === ch) {
      count++
    }
    const name = tileNames[ch]
    parts.push(`${count} ${name}${count > 1 ? "s" : ""}`)
    i += count
  }
  console.log(parts.join(", "))
}
