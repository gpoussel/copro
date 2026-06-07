// 🎮 CodinGame Puzzle - disordered-first-contact
// https://www.codingame.com/training/easy/disordered-first-contact

const N = parseInt(readline())
let message = readline()

// Compute chunk sizes: 1, 2, 3, ... until they cover the full message length
function getChunkSizes(len: number): number[] {
  const chunks: number[] = []
  let remaining = len
  let step = 1
  while (remaining > 0) {
    const take = Math.min(step, remaining)
    chunks.push(take)
    remaining -= take
    step++
  }
  return chunks
}

// Encode once: take chunks 1, 2, 3, ... from the message,
// alternately append (odd step index 1,3,5,...) or prepend (even step index 2,4,6,...)
function encode(msg: string): string {
  const chunks = getChunkSizes(msg.length)
  let result = ""
  let pos = 0
  for (let i = 0; i < chunks.length; i++) {
    const chunk = msg.slice(pos, pos + chunks[i])
    pos += chunks[i]
    if (i % 2 === 0) {
      // Steps 1, 3, 5, ... (0-indexed: 0, 2, 4, ...) → append to end
      result = result + chunk
    } else {
      // Steps 2, 4, 6, ... (0-indexed: 1, 3, 5, ...) → prepend to beginning
      result = chunk + result
    }
  }
  return result
}

// Decode once: reverse of encode
// The encoded string was built by alternately appending (odd steps) and prepending (even steps).
// To decode, we peel chunks from the encoded string in reverse order.
// Last chunk: if it was step i (0-indexed), it was appended (i even) or prepended (i odd).
// We read chunks from the end of the sequence and extract them from the appropriate side.
function decode(msg: string): string {
  const chunks = getChunkSizes(msg.length)
  const numChunks = chunks.length

  const extracted: string[] = new Array(numChunks)
  let current = msg

  // Process in reverse order (last chunk first)
  for (let i = numChunks - 1; i >= 0; i--) {
    const size = chunks[i]
    if (i % 2 === 0) {
      // This chunk was appended to the end → it's at the end of current
      extracted[i] = current.slice(current.length - size)
      current = current.slice(0, current.length - size)
    } else {
      // This chunk was prepended to the beginning → it's at the start of current
      extracted[i] = current.slice(0, size)
      current = current.slice(size)
    }
  }

  // Reassemble in original order
  return extracted.join("")
}

const times = Math.abs(N)
if (N > 0) {
  // Decode N times
  for (let i = 0; i < times; i++) {
    message = decode(message)
  }
} else {
  // Encode |N| times
  for (let i = 0; i < times; i++) {
    message = encode(message)
  }
}

console.log(message)
