export default {
  readGrid(input: string) {
    return input.split("\n").map(line => line.split(""))
  },
  regexLines(input: string, regex: RegExp) {
    return input
      .split("\n")
      .filter(line => line.length > 0)
      .map(line => {
        const match = line.match(regex)
        if (!match) {
          throw new Error(`Line ${line} does not match regex ${regex}`)
        }
        return match
      })
  },
}
