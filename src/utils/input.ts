function normalize(input: string) {
  return input.trim()
}

export function firstLine(input: string) {
  return lines(input)[0]
}

export function readGrid(input: string) {
  return lines(input).map(line => line.split(""))
}

export function readGridOfGrid(input: string) {
  const linesOfGrid = blocks(input)
  return linesOfGrid.flatMap(lineOfGrid => {
    const rows = lines(lineOfGrid)
    const splittedRows = rows.map(row => row.split(" "))
    return Array.from({ length: splittedRows[0].length }, (_, i) => {
      return splittedRows.map(row => row[i].split(""))
    })
  })
}

export function lines(input: string) {
  return normalize(input).split("\n")
}

export function blocks(input: string) {
  return normalize(input).split(/\n\n+/)
}

export function readNumbers(input: string) {
  return normalize(input).split(/ +/).map(Number)
}

export function regexLines(input: string, regex: RegExp) {
  return normalize(input)
    .split("\n")
    .filter(line => line.length > 0)
    .map(line => {
      const match = line.match(regex)
      if (!match) {
        throw new Error(`Line ${line} does not match regex ${regex}`)
      }
      return match
    })
}

export function number(input: string): number {
  return +normalize(input)
}