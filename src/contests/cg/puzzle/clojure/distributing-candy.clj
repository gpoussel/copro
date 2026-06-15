;; 🎮 CodinGame Puzzle - distributing-candy
;; https://www.codingame.com/training/easy/distributing-candy

(ns Solution (:gen-class))

(defn -main [& _]
  (let [parts (.split (.trim (read-line)) "\\s+")
        n (Integer/parseInt (aget parts 0))
        m (Integer/parseInt (aget parts 1))
        candies (vec (sort (map #(Integer/parseInt %) (.split (.trim (read-line)) "\\s+"))))]
    (loop [i 0 best Long/MAX_VALUE]
      (if (< (+ i m -1) n)
        (recur (inc i) (min best (- (nth candies (+ i m -1)) (nth candies i))))
        (println best))))
  (flush))
