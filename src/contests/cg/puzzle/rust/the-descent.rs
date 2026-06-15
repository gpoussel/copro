// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

use std::io::Write;

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
    loop {
        let mut max_height: i32 = -1;
        let mut max_index: usize = 0;
        for i in 0..8 {
            let h: i32 = rl().parse().unwrap();
            if h > max_height {
                max_height = h;
                max_index = i;
            }
        }
        println!("{}", max_index);
        std::io::stdout().flush().unwrap();
    }
}
