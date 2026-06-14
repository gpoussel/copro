const keys = readline()

const buf: string[] = []
let cursor = 0

for (const k of keys) {
  if (k === "<") {
    if (cursor > 0) cursor--
  } else if (k === ">") {
    if (cursor < buf.length) cursor++
  } else if (k === "-") {
    if (cursor > 0) {
      buf.splice(cursor - 1, 1)
      cursor--
    }
  } else {
    buf.splice(cursor, 0, k)
    cursor++
  }
}

console.log(buf.join(""))
