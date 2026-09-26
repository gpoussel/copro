// 🎮 CodinGame Puzzle - playfair-cipher
// https://www.codingame.com/training/medium/playfair-cipher

const keyTable: string[][] = []
for (let i = 0; i < 5; i++) keyTable.push(readline().trim().split(" "))
const positions: { [letter: string]: [number, number] } = {}
keyTable.forEach((row, r) => row.forEach((letter, c) => (positions[letter] = [r, c])))

const shift = readline().trim() === "ENCRYPT" ? 1 : 4
const messageCount = +readline()

for (let i = 0; i < messageCount; i++) {
  const letters = readline()
    .toUpperCase()
    .split("")
    .filter(ch => positions[ch] !== undefined)
  if (letters.length % 2 === 1) {
    console.log("DUD")
    continue
  }
  let out = ""
  for (let j = 0; j < letters.length; j += 2) {
    const [r1, c1] = positions[letters[j]]
    const [r2, c2] = positions[letters[j + 1]]
    if (r1 === r2) out += keyTable[r1][(c1 + shift) % 5] + keyTable[r2][(c2 + shift) % 5]
    else if (c1 === c2) out += keyTable[(r1 + shift) % 5][c1] + keyTable[(r2 + shift) % 5][c2]
    else out += keyTable[r1][c2] + keyTable[r2][c1]
  }
  console.log(out)
}
