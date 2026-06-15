;; 🎮 CodinGame Puzzle - euclids-algorithm
;; https://www.codingame.com/training/easy/euclids-algorithm

(ns Solution (:gen-class))

(defn -main [& _]
  (let [parts (.split (.trim (read-line)) "\\s+")
        a (Long/parseLong (aget parts 0))
        b (Long/parseLong (aget parts 1))]
    (loop [x a y b]
      (if (not= y 0)
        (let [q (quot x y) r (rem x y)]
          (println (str x "=" y "*" q "+" r))
          (recur y r))
        (println (str "GCD(" a "," b ")=" x)))))
  (flush))
