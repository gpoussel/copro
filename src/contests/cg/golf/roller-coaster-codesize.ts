var[L,C,N]=readline().split(" ").map(Number),p=[],g=[],x=[],i,j,s,t=0,k=0
for(i=0;i<N;i++)p[i]=+readline()
for(i=0;i<N;i++){for(s=0,j=i;j<i+N&&s+p[j%N]<=L;j++)s+=p[j%N];g[i]=s;x[i]=j%N}
for(i=0;i<C;i++)t+=g[k],k=x[k]
console.log(t)
