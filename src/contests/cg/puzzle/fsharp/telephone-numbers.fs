// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

let n = int (System.Console.ReadLine().Trim())
let root = System.Collections.Generic.Dictionary<char, obj>()
let mutable cable = 0
for _ in 1 .. n do
    let number = System.Console.ReadLine().Trim()
    let mutable node = root
    for d in number do
        if not (node.ContainsKey d) then
            node.[d] <- System.Collections.Generic.Dictionary<char, obj>() :> obj
            cable <- cable + 1
        node <- node.[d] :?> System.Collections.Generic.Dictionary<char, obj>
printfn "%d" cable
