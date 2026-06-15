// 🎮 CodinGame Puzzle - an-adventure-in-the-fantasy-world
// https://www.codingame.com/training/easy/an-adventure-in-the-fantasy-world

const path: string = readline()
const n: number = parseInt(readline())

type Cell = { kind: "enemy"; name: string } | { kind: "money"; amount: number }
const map = new Map<string, Cell>()

for (let i = 0; i < n; i++) {
  const parts = readline().split(" ")
  const row = parseInt(parts[0])
  const col = parseInt(parts[1])
  const key = row + "," + col
  if (parts[2] === "enemy") {
    map.set(key, { kind: "enemy", name: parts[3] })
  } else {
    map.set(key, { kind: "money", amount: parseInt(parts[3]) })
  }
}

let row = 0
let col = 0
let money = 50
let result = ""

for (const ch of path) {
  if (ch === "R") col++
  else if (ch === "L") col--
  else if (ch === "U") row--
  else if (ch === "D") row++

  const cell = map.get(row + "," + col)
  if (!cell) continue

  if (cell.kind === "money") {
    money += cell.amount
    map.delete(row + "," + col)
  } else {
    if (cell.name === "goblin" && money >= 50) {
      money -= 50
    } else {
      result = `${row} ${col} ${money}G ${cell.name}`
      break
    }
  }
}

if (result === "") {
  result = `GameClear ${row} ${col} ${money}G`
}

console.log(result)
