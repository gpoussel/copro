// 🎮 CodinGame Puzzle - 1d-bush-fire
// https://www.codingame.com/training/easy/1d-bush-fire

import java.io.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        for (int t = 0; t < n; t++) {
            String strip = br.readLine().replaceAll("\\s+$", "");
            int drops = 0, j = 0;
            while (j < strip.length()) {
                if (strip.charAt(j) == 'f') {
                    // Drop at j covers j, j+1, j+2 — skip past all 3.
                    drops++;
                    j += 3;
                } else {
                    j++;
                }
            }
            System.out.println(drops);
        }
    }
}
