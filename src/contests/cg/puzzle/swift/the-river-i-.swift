// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

func digitSum(_ x0: Int) -> Int {
    var x = x0
    var s = 0
    while x > 0 {
        s += x % 10
        x /= 10
    }
    return s
}

var a = Int(readLine()!)!
var b = Int(readLine()!)!
while a != b {
    if a < b {
        a += digitSum(a)
    } else {
        b += digitSum(b)
    }
}
print(a)
