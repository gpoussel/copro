// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let parts: Vec<i64> = rl().split_whitespace().map(|x| x.parse().unwrap()).collect();
    let (a, b) = (parts[0], parts[1]);
    let (mut x, mut y) = (a, b);
    while y != 0 {
        let q = x / y;
        let r = x % y;
        println!("{}={}*{}+{}", x, y, q, r);
        x = y;
        y = r;
    }
    println!("GCD({},{})={}", a, b, x);
}
