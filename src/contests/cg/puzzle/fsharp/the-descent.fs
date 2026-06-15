// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

// Game loop: each turn, read 8 mountain heights and fire on the tallest one.
while true do
    let mutable maxHeight = -1
    let mutable maxIndex = 0
    for i in 0 .. 7 do
        let h = int (System.Console.ReadLine().Trim())
        if h > maxHeight then
            maxHeight <- h
            maxIndex <- i
    printfn "%d" maxIndex
