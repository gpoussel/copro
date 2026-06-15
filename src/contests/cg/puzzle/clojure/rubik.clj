;; 🎮 CodinGame Puzzle - rubik
;; https://www.codingame.com/training/medium/rubik

(ns Solution (:gen-class))

(defn -main [& _]
  (let [n (Long/parseLong (.trim (read-line)))
        inner (if (>= n 2) (- n 2) 0)]
    ;; Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
    (println (- (* n n n) (* inner inner inner))))
  (flush))
