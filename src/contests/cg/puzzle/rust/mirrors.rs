// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let _ = rl();
    let r: Vec<f64> = rl().split_whitespace().map(|x| x.parse().unwrap()).collect();
    let mut reflected = 0.0f64;
    for i in (0..r.len()).rev() {
        let ri = r[i];
        let denom = 1.0 - ri * reflected;
        reflected = ri
            + if denom == 0.0 {
                0.0
            } else {
                ((1.0 - ri) * (1.0 - ri) * reflected) / denom
            };
    }
    println!("{:.4}", reflected);
}
