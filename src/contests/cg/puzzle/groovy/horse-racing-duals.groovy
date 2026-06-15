// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

def br = new BufferedReader(new InputStreamReader(System.in))
int n = br.readLine().trim() as int
def s = []
n.times { s << (br.readLine().trim() as int) }
s.sort()
int minDiff = Integer.MAX_VALUE
for (int i = 1; i < s.size(); i++) {
    int diff = s[i] - s[i - 1]
    if (diff < minDiff) minDiff = diff
}
println minDiff
