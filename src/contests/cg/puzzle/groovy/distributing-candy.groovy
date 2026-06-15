// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

def br = new BufferedReader(new InputStreamReader(System.in))
def (n, m) = br.readLine().split(' ').collect { it as int }
def candies = br.readLine().split(' ').collect { it as int }.sort()
int best = Integer.MAX_VALUE
for (int i = 0; i + m - 1 < n; i++) {
    int diff = candies[i + m - 1] - candies[i]
    if (diff < best) best = diff
}
println best
