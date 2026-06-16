// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

// Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
def br = new BufferedReader(new InputStreamReader(System.in))
int n = br.readLine().trim() as int
String best = ""
n.times {
    String t = br.readLine().trim()
    if (best == "" || t < best) best = t
}
println best
