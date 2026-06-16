// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

// d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
// of divisors is sum over d of d * floor(n/d).
def br = new BufferedReader(new InputStreamReader(System.in))
long n = br.readLine().trim() as long
long total = 0
for (long d = 1; d <= n; d++) total += d * n.intdiv(d)
println total
