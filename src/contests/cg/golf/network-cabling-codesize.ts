var n=+readline(),X=[],Y=[],i=n,f=(a,b)=>a-b
for(;i--;)[X[i],Y[i]]=readline().split(" ")
console.log(Y.sort(f).reduce((s,v,i)=>i<n/2?Y[n+~i]-v+s:s,X.sort(f)[n-1]-X[0]))