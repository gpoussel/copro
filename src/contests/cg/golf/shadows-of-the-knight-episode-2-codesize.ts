// @ts-nocheck
var[W,H]=readline().split(" ").map(eval)
readline()
var P=readline().split(" ").map(eval),L=[0,0],G=[W-1,H-1],a=-1,p,q
var T=(l,h,o,s)=>{var c=l+h-o;if(c<0||c>=s){var b=c<0?0:s-1,i=(o+b)/2;c=i>l&&i<h?b:o<l?l:h}if(c==o)c+=c<h?1:-1;return c}
for(;;){
var d=readline(),m=p+q
if(d!="UNKNOWN"&&a>=0)
if(d=="SAME")L[a]=G[a]=m+1>>1
else(q>p)==(d=="WARMER")?L[a]=(m>>1)+1:G[a]=(m+1>>1)-1
a=L[0]<G[0]?0:L[1]<G[1]?1:-1
if(a<0)P=[L[0],L[1]];else P[a]=q=T(L[a],G[a],p=P[a],a?H:W)
console.log(P.join(" "))
}
