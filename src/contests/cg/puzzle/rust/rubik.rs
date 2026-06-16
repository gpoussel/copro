// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let n: i64 = rl().parse().unwrap();
    // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
    let inner = if n >= 2 { n - 2 } else { 0 };
    println!("{}", n * n * n - inner * inner * inner);
}
