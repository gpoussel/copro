// 🎮 CodinGame Puzzle - sign-programming-language
// https://www.codingame.com/training/easy/sign-programming-language

const program: string = readline()

let register: number = 0
let counting: boolean = false
let count: number = 0

const advance: () => void = () => {
  if (counting) count++
}

let i: number = 0
const n: number = program.length
while (i < n) {
  const c: string = program[i]
  if (c === "$") {
    if (!counting) {
      counting = true
      count = 0
    } else {
      register += count
      counting = false
    }
    i++
    continue
  }
  // c === "/" : start of an instruction
  const marker: string = program[i + 1]
  if (marker === "$") {
    // ADD N : "/$" + N chars + "/"
    let j: number = i + 2
    let len: number = 0
    while (program[j] !== "/") {
      j++
      len++
    }
    register += len
    i = j + 1
    advance()
  } else if (marker === "/") {
    // SUB N : "//" + N chars + "/"
    let j: number = i + 2
    let len: number = 0
    while (program[j] !== "/") {
      j++
      len++
    }
    register -= len
    i = j + 1
    advance()
  } else {
    // marker === "*"
    const sub: string = program[i + 2]
    if (sub === "$") {
      // NOP : "/*$"
      i += 3
      advance()
    } else if (sub === "*") {
      // MUL N+1 : "/**" + N chars + "/"
      let j: number = i + 3
      let len: number = 0
      while (program[j] !== "/") {
        j++
        len++
      }
      register *= len + 1
      i = j + 1
      advance()
    } else {
      // sub === "/" : MUL -N : "/*/" + N chars + "/"
      let j: number = i + 3
      let len: number = 0
      while (program[j] !== "/") {
        j++
        len++
      }
      register *= -len
      i = j + 1
      advance()
    }
  }
}

console.log(register)
