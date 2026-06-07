// 🎮 CodinGame Puzzle - mime-type
// https://www.codingame.com/training/easy/mime-type

const N = parseInt(readline()) // number of MIME type associations
const Q = parseInt(readline()) // number of file names

// Build a map from lowercase extension -> MIME type
const mimeMap: Map<string, string> = new Map()
for (let i = 0; i < N; i++) {
  const line = readline().split(" ")
  const ext = line[0].toLowerCase()
  const mime = line[1]
  mimeMap.set(ext, mime)
}

for (let i = 0; i < Q; i++) {
  const fname = readline()
  const dotIndex = fname.lastIndexOf(".")
  if (dotIndex === -1 || dotIndex === fname.length - 1) {
    console.log("UNKNOWN")
  } else {
    const ext = fname.slice(dotIndex + 1).toLowerCase()
    const mime = mimeMap.get(ext)
    console.log(mime !== undefined ? mime : "UNKNOWN")
  }
}
