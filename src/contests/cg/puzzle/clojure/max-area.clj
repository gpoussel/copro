;; 🎮 CodinGame Puzzle - max-area
;; https://www.codingame.com/training/easy/max-area

(ns Solution (:gen-class))

(defn -main [& _]
  (read-line)
  (let [a (mapv #(Long/parseLong %) (.split (.trim (read-line)) "\\s+"))]
    (loop [left 0 right (dec (count a)) best 0]
      (if (< left right)
        (let [h (min (nth a left) (nth a right))
              nb (max best (* h (- right left)))]
          (if (< (nth a left) (nth a right))
            (recur (inc left) right nb)
            (recur left (dec right) nb)))
        (println best))))
  (flush))
