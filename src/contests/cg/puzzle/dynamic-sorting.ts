// 🎮 CodinGame Puzzle - dynamic-sorting
// https://www.codingame.com/training/medium/dynamic-sorting

const sortExpression = readline()
const sortTypes = readline().split(",")
const rowCount = Number(readline())

interface SortKey {
  prop: string
  desc: boolean
  numeric: boolean
}
const keys: SortKey[] = []
const keyRegex = /([+-])(\w+)/g
let match: RegExpExecArray | null
while ((match = keyRegex.exec(sortExpression)) !== null) {
  keys.push({ prop: match[2], desc: match[1] === "-", numeric: sortTypes[keys.length] === "int" })
}

const rows: { [prop: string]: string }[] = []
for (let i = 0; i < rowCount; i++) {
  const row: { [prop: string]: string } = {}
  for (const pair of readline().split(",")) {
    const [k, v] = pair.split(":")
    row[k] = v
  }
  rows.push(row)
}

rows.sort((a, b) => {
  for (const key of keys) {
    const va = a[key.prop]
    const vb = b[key.prop]
    let cmp = key.numeric ? Number(va) - Number(vb) : va < vb ? -1 : va > vb ? 1 : 0
    if (key.desc) cmp = -cmp
    if (cmp !== 0) return cmp
  }
  return Number(a.id) - Number(b.id)
})

console.log(rows.map(r => r.id).join("\n"))
