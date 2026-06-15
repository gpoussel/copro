// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

def br = new BufferedReader(new InputStreamReader(System.in))
int n = br.readLine().trim() as int
int k = 0
while ((k * (k + 1)).intdiv(2) < n) k++
println k
