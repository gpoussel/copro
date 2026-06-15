const n = parseInt(readline())
let src = ""
for (let i = 0; i < n; i++) src += readline() + "\n"

// Tokenize
type Tok = { t: "(" | ")" | ";" | "=" | "val"; v?: string }
const toks: Tok[] = []
let i = 0
while (i < src.length) {
  const c = src[i]
  if (c === " " || c === "\t" || c === "\n" || c === "\r") {
    i++
    continue
  }
  if (c === "(" || c === ")" || c === ";" || c === "=") {
    toks.push({ t: c })
    i++
    continue
  }
  if (c === "'") {
    let s = "'"
    i++
    while (i < src.length && src[i] !== "'") {
      s += src[i]
      i++
    }
    s += "'"
    i++ // closing quote
    toks.push({ t: "val", v: s })
    continue
  }
  // primitive: number, boolean, null - read until a delimiter or whitespace
  let s = ""
  while (i < src.length) {
    const d = src[i]
    if (d === " " || d === "\t" || d === "\n" || d === "\r" || d === "(" || d === ")" || d === ";" || d === "=") break
    s += d
    i++
  }
  toks.push({ t: "val", v: s })
}

let p = 0
const out: string[] = []
const ind = (lvl: number) => "    ".repeat(lvl)

// Parse and emit an ELEMENT at indentation level `lvl`.
function emitElement(lvl: number) {
  const tok = toks[p]
  if (tok.t === "(") {
    emitBlock(lvl)
  } else {
    // tok.t === "val": a primitive, or the key of a key=value
    if (toks[p + 1] && toks[p + 1].t === "=") {
      p += 2 // consume val and =
      const vt = toks[p]
      if (vt.t === "(") {
        out.push(ind(lvl) + tok.v + "=") // key= on its own line, block follows
        emitBlock(lvl)
      } else {
        out.push(ind(lvl) + tok.v + "=" + vt.v) // primitive value on key line
        p++
      }
    } else {
      out.push(ind(lvl) + tok.v) // plain primitive
      p++
    }
  }
}

function emitBlock(lvl: number) {
  // toks[p] === "("
  out.push(ind(lvl) + "(")
  p++ // consume (
  // children until )
  if (toks[p] && toks[p].t !== ")") {
    while (true) {
      emitElement(lvl + 1)
      if (toks[p] && toks[p].t === ";") {
        out[out.length - 1] += ";"
        p++
        continue
      }
      break
    }
  }
  // toks[p] === ")"
  p++ // consume )
  out.push(ind(lvl) + ")")
}

emitElement(0)
console.log(out.join("\n"))
