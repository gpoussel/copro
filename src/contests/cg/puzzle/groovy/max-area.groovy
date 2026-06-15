// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

def br = new BufferedReader(new InputStreamReader(System.in))
br.readLine()
def a = br.readLine().split(' ').collect { it as long }
int left = 0, right = a.size() - 1
long best = 0
while (left < right) {
    long h = Math.min(a[left], a[right])
    long area = h * (right - left)
    if (area > best) best = area
    if (a[left] < a[right]) left++ else right--
}
println best
