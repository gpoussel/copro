// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

def br = new BufferedReader(new InputStreamReader(System.in))
long a = br.readLine().trim() as long
long b = br.readLine().trim() as long
def digitSum = { long x ->
    long s = 0
    while (x > 0) {
        s += x % 10
        x = x.intdiv(10)
    }
    s
}
while (a != b) {
    if (a < b) a += digitSum(a) else b += digitSum(b)
}
println a
