// 🎮 CodinGame Puzzle - max-area
// https://www.codingame.com/training/easy/max-area

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let _ = rl();
    let a: Vec<i64> = rl().split_whitespace().map(|x| x.parse().unwrap()).collect();
    let mut left = 0usize;
    let mut right = a.len() - 1;
    let mut best = 0i64;
    while left < right {
        let h = a[left].min(a[right]);
        let area = h * (right - left) as i64;
        if area > best {
            best = area;
        }
        if a[left] < a[right] {
            left += 1;
        } else {
            right -= 1;
        }
    }
    println!("{}", best);
}
