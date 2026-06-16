// 🎮 CodinGame Puzzle - teds-compiler
// https://www.codingame.com/training/easy/teds-compiler

import java.io.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine().replaceAll("\\s+$", "");
        int balance = 0, best = 0;
        for (int i = 0; i < line.length(); i++) {
            if (line.charAt(i) == '<') balance++;
            else balance--;
            if (balance < 0) break;
            if (balance == 0) best = i + 1;
        }
        System.out.println(best);
    }
}
