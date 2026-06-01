readline()
console.log(readline().split(" ").map(x=>+x).sort((x,y)=>x*x-y*y||y-x)[0])