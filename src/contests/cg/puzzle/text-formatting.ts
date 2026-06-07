// 🎮 CodinGame Puzzle - text-formatting
// https://www.codingame.com/training/easy/text-formatting

const line = readline()

// A punctuation mark is a character other than a space, a letter or a digit
function isPunct(c: string) {
  return c !== " " && !/[a-zA-Z0-9]/.test(c)
}

function isLetter(c: string) {
  return /[a-zA-Z]/.test(c)
}

// Step 1: lowercase everything
let text = line.toLowerCase()

// Step 2: Remove spaces before punctuation marks and collapse multiple spaces
// Step 3: Remove repeated punctuation marks
// Step 4: Ensure one space after each punctuation mark in front of a letter

// Process character by character
let chars = text.split("")
let result = []

for (let i = 0; i < chars.length; i++) {
  const c = chars[i]
  result.push(c)
}

// Now apply transformations using the raw lowercase string

// Remove repeated punctuation marks first (consecutive identical punctuation -> one)
// Actually, remove repeated punctuation of any kind
// e.g. ",,," -> ",", "..." -> "."
let s = text

// Remove spaces before punctuation
s = s.replace(/ +([^a-zA-Z0-9 ])/g, "$1")

// Collapse repeated punctuation (multiple consecutive punct chars of any kind -> last one? Or just one?)
// From example: ",,," -> ",", "..." -> "."
// Keep collapsing until stable
// The rule says "remove repeated punctuation marks"
// From example: ",,, " -> ", " (keep one comma), "..." -> "." (keep one dot)
// It seems we keep the last one or just one instance
// From "...shakespeare" -> ". Shakespeare" - so "..." becomes "."
// From ",,," -> "," so it's the first (or any one)
// We'll keep just one (first)
s = s.replace(/([^a-zA-Z0-9 ])\1+/g, "$1")

// But also handle mixed repeated punct? e.g. ",," or ".,." ?
// From test 4: ",," -> "," and ".." -> "." — seems like consecutive same punct -> one
// "..  four" after removing spaces before punct would be "..four" -> ".four"
// Let's also collapse any consecutive punctuation to just the last one
// Actually test 4: "one , TWO  ,,  three  ..  four"
// After lowercase: "one , two  ,,  three  ..  four"
// Remove spaces before punct: "one, two,,  three..  four"
// Hmm, spaces after punct need to be handled too
// Let me re-think the approach

// Full re-approach: tokenize into tokens

function format(input: string) {
  // Lowercase
  let s = input.toLowerCase()

  // Step A: Remove spaces before punctuation
  // Repeatedly remove space immediately before a punctuation mark
  s = s.replace(/ +([^a-zA-Z0-9 ])/g, "$1")

  // Step B: Collapse repeated (consecutive same) punctuation to one instance
  s = s.replace(/([^a-zA-Z0-9 ])\1+/g, "$1")

  // Also collapse multiple different consecutive punctuation marks?
  // From the example ".." -> "." but what about ",."?
  // The rule says "repeated punctuation marks" which likely means same char repeated
  // Let's also handle consecutive same-char punct after removing spaces
  // Re-run after potential new adjacencies from space removal
  s = s.replace(/([^a-zA-Z0-9 ])\1+/g, "$1")

  // Step C: Ensure exactly one space after punctuation when followed by a letter/digit
  // Remove extra spaces after punctuation, add one if missing
  // First collapse multiple spaces to one
  s = s.replace(/ +/g, " ")

  // Now handle spacing around punctuation
  // After punct: if followed by letter, ensure one space
  s = s.replace(/([^a-zA-Z0-9 ])([a-zA-Z0-9])/g, "$1 $2")

  // Remove spaces that appear after punct if followed by another punct
  s = s.replace(/([^a-zA-Z0-9 ]) +([^a-zA-Z0-9 ])/g, "$1$2")

  // Step D: Collapse multiple spaces again (from step C insertions)
  s = s.replace(/ +/g, " ")

  // Step E: Trim leading/trailing spaces
  s = s.trim()

  // Step F: Capitalize after dot (start of sentence)
  // After ". " or at very beginning
  let out = ""
  let capitalizeNext = true
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (capitalizeNext && isLetter(c)) {
      out += c.toUpperCase()
      capitalizeNext = false
    } else {
      out += c
    }
    // After a dot followed by space, capitalize next letter
    if (c === "." && i + 1 < s.length && s[i + 1] === " ") {
      capitalizeNext = true
    }
    // Also after semicolons? No - from example: "laugh; when" stays lowercase after ;
  }

  return out
}

console.log(format(line))
