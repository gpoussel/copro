// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn digit_sum(mut x: i64) -> i64 {
    let mut s = 0;
    while x > 0 {
        s += x % 10;
        x /= 10;
    }
    s
}

fn main() {
    let mut a: i64 = rl().parse().unwrap();
    let mut b: i64 = rl().parse().unwrap();
    while a != b {
        if a < b {
            a += digit_sum(a);
        } else {
            b += digit_sum(b);
        }
    }
    println!("{}", a);
}
