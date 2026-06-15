// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

def br = new BufferedReader(new InputStreamReader(System.in))
def (a, b) = br.readLine().split(' ').collect { it as long }
long x = a, y = b
while (y != 0) {
    long q = x.intdiv(y)
    long r = x % y
    println "$x=$y*$q+$r"
    x = y
    y = r
}
println "GCD($a,$b)=$x"
