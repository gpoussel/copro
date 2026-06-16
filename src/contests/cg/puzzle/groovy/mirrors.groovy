// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

def br = new BufferedReader(new InputStreamReader(System.in))
br.readLine()
def r = br.readLine().split(' ').collect { it as double }
double reflected = 0.0
for (int i = r.size() - 1; i >= 0; i--) {
    double ri = r[i]
    double denom = 1 - ri * reflected
    reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom)
}
println(String.format("%.4f", reflected))
