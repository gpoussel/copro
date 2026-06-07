// 🎮 CodinGame Puzzle - stunning-numbers
// https://www.codingame.com/training/easy/stunning-numbers

const flipMap: Record<string, string> = {
  "0": "0",
  "1": "1",
  "2": "2",
  "5": "5",
  "6": "9",
  "8": "8",
  "9": "6",
}

// Valid digits when flipped
const validDigits = ["0", "1", "2", "5", "6", "8", "9"]

// Digits that are self-mapping (valid for the middle of odd-length numbers)
const selfMappingDigits = ["0", "1", "2", "5", "8"]

function isStunning(s: string): boolean {
  for (const ch of s) {
    if (flipMap[ch] === undefined) return false
  }
  const n = s.length
  for (let i = 0; i < n; i++) {
    if (flipMap[s[i]] !== s[n - 1 - i]) return false
  }
  return true
}

// Generator: yields all stunning numbers of exactly `len` digits in increasing order
function* generateStunningOfLength(len: number): Generator<string> {
  const halfLen = Math.ceil(len / 2)
  const isOdd = len % 2 === 1

  // Build the choices array for each position in the first half
  const choices: string[][] = []
  for (let i = 0; i < halfLen; i++) {
    if (i === 0) {
      // Leading digit cannot be 0
      choices.push(validDigits.filter(d => d !== "0"))
    } else if (isOdd && i === halfLen - 1) {
      // Middle digit (for odd-length) must be self-mapping (flips to itself)
      choices.push(selfMappingDigits)
    } else {
      choices.push(validDigits)
    }
  }

  // Enumerate all combinations of first half in lexicographic order
  const indices = new Array(halfLen).fill(0)
  while (true) {
    const firstHalf = indices.map((idx, pos) => choices[pos][idx]).join("")

    // Build second half: reverse of first half (excluding middle if odd), each digit flipped
    const forFlip = isOdd ? firstHalf.slice(0, halfLen - 1) : firstHalf
    let secondHalf = ""
    for (let i = forFlip.length - 1; i >= 0; i--) {
      secondHalf += flipMap[forFlip[i]]
    }

    yield firstHalf + secondHalf

    // Increment indices like a mixed-radix counter
    let pos = halfLen - 1
    while (pos >= 0) {
      indices[pos]++
      if (indices[pos] < choices[pos].length) break
      indices[pos] = 0
      pos--
    }
    if (pos < 0) break // exhausted all combinations for this length
  }
}

// Find the next stunning number strictly greater than the given string (as numeric value)
function nextStunning(s: string): string {
  const target = BigInt(s)

  // Try lengths from s.length upward until we find one
  for (let len = s.length; ; len++) {
    for (const num of generateStunningOfLength(len)) {
      if (BigInt(num) > target) {
        return num
      }
    }
    // No stunning number of this length is greater than target; try next length
  }
}

const n = readline()
console.log(isStunning(n) ? "true" : "false")
console.log(nextStunning(n))
