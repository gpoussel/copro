// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let n: usize = rl().parse().unwrap();
    let mut s: Vec<i64> = (0..n).map(|_| rl().parse().unwrap()).collect();
    s.sort();
    let mut min_diff = i64::MAX;
    for i in 1..n {
        let diff = s[i] - s[i - 1];
        if diff < min_diff {
            min_diff = diff;
        }
    }
    println!("{}", min_diff);
}
