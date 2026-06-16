// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let n: usize = rl().parse().unwrap();
    for _ in 0..n {
        let strip: Vec<char> = rl().chars().collect();
        let mut drops = 0;
        let mut j = 0;
        while j < strip.len() {
            if strip[j] == 'f' {
                // Drop at j covers j, j+1, j+2 — skip past all 3.
                drops += 1;
                j += 3;
            } else {
                j += 1;
            }
        }
        println!("{}", drops);
    }
}
