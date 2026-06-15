;; 🎮 CodinGame Puzzle - mirrors
;; https://www.codingame.com/training/easy/mirrors

(ns Solution (:gen-class))

(defn -main [& _]
  (read-line)
  (let [r (mapv #(Double/parseDouble %) (.split (.trim (read-line)) "\\s+"))]
    (loop [i (dec (count r)) reflected 0.0]
      (if (>= i 0)
        (let [ri (nth r i)
              denom (- 1 (* ri reflected))
              nr (if (== denom 0) ri (+ ri (/ (* (- 1 ri) (- 1 ri) reflected) denom)))]
          (recur (dec i) nr))
        (println (format "%.4f" reflected)))))
  (flush))
