// 🎮 CodinGame Puzzle - rubik
// https://www.codingame.com/training/medium/rubik

import java.io.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        long n = Long.parseLong(br.readLine().trim());
        // Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
        long inner = n >= 2 ? n - 2 : 0;
        System.out.println(n * n * n - inner * inner * inner);
    }
}
