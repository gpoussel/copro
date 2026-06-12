for(var R=readline,L=(R(),R(),Math.log),a,b,c,e,k,m,B;k=R();a=a||c,b=b||e)[c,e]=k.split(" ")
k=L(+e/+b)/L(+c/+a),m=k+.5|0,B=m>3?"2^n":m>1?"n^"+m:"n"
console.log(`O(${m<3&&k-m>.04?(m?B+" ":"")+"log n":m?B:1})`)