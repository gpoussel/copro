// 🎮 CodinGame Puzzle - the-descent
// https://www.codingame.com/training/easy/the-descent

import java.io.*;

// CodinGame's Java game-loop runner launches a class named `Player`.
class Player {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Game loop: each turn, read 8 mountain heights and fire on the tallest one.
        while (true) {
            int maxHeight = -1, maxIndex = 0;
            for (int i = 0; i < 8; i++) {
                int h = Integer.parseInt(br.readLine().trim());
                if (h > maxHeight) {
                    maxHeight = h;
                    maxIndex = i;
                }
            }
            System.out.println(maxIndex);
        }
    }
}
