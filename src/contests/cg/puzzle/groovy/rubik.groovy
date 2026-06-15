// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

def br = new BufferedReader(new InputStreamReader(System.in))
long n = br.readLine().trim() as long
// Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
long inner = n >= 2 ? n - 2 : 0
println(n * n * n - inner * inner * inner)
