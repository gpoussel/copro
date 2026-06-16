// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

def br = new BufferedReader(new InputStreamReader(System.in))
def (f0, n) = br.readLine().split(' ').collect { it as int }
def (a, b) = br.readLine().split(' ').collect { it as int }
// FN can exceed 2^63 (but is < 2^64), so accumulate with BigInteger.
BigInteger[] f = new BigInteger[n + 1]
for (int i = 0; i <= n; i++) f[i] = BigInteger.ZERO
f[0] = BigInteger.valueOf(f0)
for (int i = 1; i <= n; i++) {
    BigInteger total = BigInteger.ZERO
    for (int k = a; k <= b; k++) {
        if (i - k >= 0) total += f[i - k]
    }
    f[i] = total
}
println f[n]
