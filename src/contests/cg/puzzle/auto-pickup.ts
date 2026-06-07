// 🎮 CodinGame Puzzle - auto-pickup
// https://www.codingame.com/training/easy/auto-pickup

const n = parseInt(readline())
const packet = readline()

let pos = 0
const pickups: string[] = []

while (pos + 7 <= n) {
  // Read instruction id (3 bits)
  const instrId = packet.slice(pos, pos + 3)
  pos += 3

  // Read packet length (4 bits)
  const lengthBits = packet.slice(pos, pos + 4)
  pos += 4

  const itemLength = parseInt(lengthBits, 2)

  // Read packet info (itemLength bits)
  const itemId = packet.slice(pos, pos + itemLength)
  pos += itemLength

  if (instrId === "101") {
    // This is an item drop instruction — convert to pickup instruction (001)
    pickups.push("001" + lengthBits + itemId)
  }
}

console.log(pickups.join(""))
