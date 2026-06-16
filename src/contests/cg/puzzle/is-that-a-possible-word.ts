// 🎮 CodinGame Puzzle - is-that-a-possible-word
// https://www.codingame.com/training/easy/is-that-a-possible-word

const alphabet = readline().split(" ")
readline()
const numberOfTransitions = parseInt(readline())

// transitions[sourceState][character] = destinationState
const transitions: Record<string, Record<string, string>> = {}
for (let i = 0; i < numberOfTransitions; i++) {
  const parts = readline().split(" ")
  const [src, char, dst] = parts
  if (!transitions[src]) transitions[src] = {}
  transitions[src][char] = dst
}

const startState = readline().trim()
const endStates = readline().split(" ")
const numberOfWords = parseInt(readline())

const alphabetSet = new Set(alphabet)
const endStateSet = new Set(endStates)

for (let i = 0; i < numberOfWords; i++) {
  const word = readline()
  let valid = true
  let currentState = startState

  for (const ch of word) {
    if (!alphabetSet.has(ch)) {
      valid = false
      break
    }
    const stateTransitions = transitions[currentState]
    if (!stateTransitions || !(ch in stateTransitions)) {
      valid = false
      break
    }
    currentState = stateTransitions[ch]
  }

  if (valid && endStateSet.has(currentState)) {
    console.log("true")
  } else {
    console.log("false")
  }
}
