// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let line = rl();
    let mut balance: i32 = 0;
    let mut best: usize = 0;
    for (i, c) in line.chars().enumerate() {
        if c == '<' {
            balance += 1;
        } else {
            balance -= 1;
        }
        if balance < 0 {
            break;
        }
        if balance == 0 {
            best = i + 1;
        }
    }
    println!("{}", best);
}
