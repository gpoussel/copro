// 🎮 CodinGame Puzzle - mirrors
// https://www.codingame.com/training/easy/mirrors

import java.io.*;
import java.util.Locale;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        br.readLine();
        String[] tok = br.readLine().trim().split(" ");
        double[] r = new double[tok.length];
        for (int i = 0; i < tok.length; i++) r[i] = Double.parseDouble(tok[i]);
        double reflected = 0.0;
        for (int i = r.length - 1; i >= 0; i--) {
            double ri = r[i];
            double denom = 1 - ri * reflected;
            reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom);
        }
        System.out.println(String.format(Locale.US, "%.4f", reflected));
    }
}
