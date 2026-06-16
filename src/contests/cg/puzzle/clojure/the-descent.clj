;; 🎮 CodinGame Puzzle - the-descent
;; https://www.codingame.com/training/easy/the-descent

;; Game-loop puzzles AOT-compile namespace Player (not Solution).
(ns Player (:gen-class))

;; Each turn, read 8 mountain heights and fire on the tallest one.
;; *out* is buffered, so (flush) after each move.
(defn -main [& _]
  (while true
    (loop [i 0 maxH -1 maxIdx 0]
      (if (< i 8)
        (let [h (Integer/parseInt (.trim (read-line)))]
          (if (> h maxH)
            (recur (inc i) h i)
            (recur (inc i) maxH maxIdx)))
        (do (println maxIdx) (flush))))))
