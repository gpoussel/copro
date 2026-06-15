// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
    let n: usize = rl().parse().unwrap();
    let mut best = String::new();
    for _ in 0..n {
        let t = rl();
        if best.is_empty() || t < best {
            best = t;
        }
    }
    println!("{}", best);
}
