var e=0
console.log([...Array(+readline())].map(_=>readline().split(" ")).sort(([a,b],[c,d])=>+a+ +b-+c-+d).filter(([s,d])=>+s>=e&&(e=+s+ +d)).length)