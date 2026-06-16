// 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
// https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let n: i64 = rl().parse().unwrap();
    let mut k: i64 = 0;
    while k * (k + 1) / 2 < n {
        k += 1;
    }
    println!("{}", k);
}
