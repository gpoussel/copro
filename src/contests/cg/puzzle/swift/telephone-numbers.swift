// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

let n = Int(readLine()!)!
// Trie as a flat array of nodes, each a digit -> child-index map.
var nodes: [[Character: Int]] = [[:]]
var cable = 0
for _ in 0..<n {
    let number = Array(readLine()!)
    var cur = 0
    for c in number {
        if nodes[cur][c] == nil {
            let id = nodes.count
            nodes[cur][c] = id
            nodes.append([:])
            cable += 1
        }
        cur = nodes[cur][c]!
    }
}
print(cable)
