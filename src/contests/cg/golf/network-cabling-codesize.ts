var Y=[],a,b,n=+readline(),L=1/0,H=-L
for(;n--;)[a,b]=readline().split(" "),L>+a&&(L=+a),H<+a&&(H=+a),Y.push(b)
console.log(H-L+Y.sort((p,q)=>p-q).reduce((p,c)=>p+Math.abs(c-Y[Y.length>>1]),0))
