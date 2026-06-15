// 🎮 CodinGame Puzzle - the-broken-editor
// https://www.codingame.com/

const typedKeys: string = readline()
const buffer: string[] = []
let cursor: number = 0

for (const key of typedKeys) {
  if (key === "<") {
    if (cursor > 0) cursor--
  } else if (key === ">") {
    if (cursor < buffer.length) cursor++
  } else if (key === "-") {
    if (cursor > 0) {
      buffer.splice(cursor - 1, 1)
      cursor--
    }
  } else {
    buffer.splice(cursor, 0, key)
    cursor++
  }
}

console.log(buffer.join(""))
