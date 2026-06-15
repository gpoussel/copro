// 🎮 CodinGame Puzzle - key-value-store
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
const store: Map<string, string> = new Map<string, string>()
const out: string[] = []

for (let i = 0; i < n; i++) {
  const parts: string[] = readline().split(" ")
  const cmd: string = parts[0]
  const args: string[] = parts.slice(1)

  if (cmd === "SET") {
    for (const arg of args) {
      const eq: number = arg.indexOf("=")
      store.set(arg.slice(0, eq), arg.slice(eq + 1))
    }
  } else if (cmd === "GET") {
    out.push(args.map((k: string): string => store.get(k) ?? "null").join(" "))
  } else if (cmd === "EXISTS") {
    out.push(args.map((k: string): string => (store.has(k) ? "true" : "false")).join(" "))
  } else if (cmd === "KEYS") {
    const keys: string[] = [...store.keys()]
    out.push(keys.length > 0 ? keys.join(" ") : "EMPTY")
  }
}

console.log(out.join("\n"))
