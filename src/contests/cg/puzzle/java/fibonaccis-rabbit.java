// 🎮 CodinGame Puzzle - fibonaccis-rabbit
// https://www.codingame.com/training/easy/fibonaccis-rabbit

import java.io.*;
import java.math.BigInteger;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] l1 = br.readLine().trim().split(" ");
        int f0 = Integer.parseInt(l1[0]), n = Integer.parseInt(l1[1]);
        String[] l2 = br.readLine().trim().split(" ");
        int a = Integer.parseInt(l2[0]), b = Integer.parseInt(l2[1]);
        // FN can exceed 2^63 (but is < 2^64), so accumulate with BigInteger.
        BigInteger[] f = new BigInteger[n + 1];
        for (int i = 0; i <= n; i++) f[i] = BigInteger.ZERO;
        f[0] = BigInteger.valueOf(f0);
        for (int i = 1; i <= n; i++) {
            BigInteger total = BigInteger.ZERO;
            for (int k = a; k <= b; k++) {
                if (i - k >= 0) total = total.add(f[i - k]);
            }
            f[i] = total;
        }
        System.out.println(f[n]);
    }
}
