// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    let l1: Vec<usize> = rl().split_whitespace().map(|x| x.parse().unwrap()).collect();
    let (f0, n) = (l1[0], l1[1]);
    let l2: Vec<usize> = rl().split_whitespace().map(|x| x.parse().unwrap()).collect();
    let (a, b) = (l2[0], l2[1]);
    // FN can exceed 2^63 (but is < 2^64), so accumulate in u64.
    let mut f = vec![0u64; n + 1];
    f[0] = f0 as u64;
    for i in 1..=n {
        let mut total: u64 = 0;
        for k in a..=b {
            if i >= k {
                total += f[i - k];
            }
        }
        f[i] = total;
    }
    println!("{}", f[n]);
}
