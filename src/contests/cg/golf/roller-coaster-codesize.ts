var[L,C,N]=readline().split(" ").map(Number),P=[],g=[],n=[],i=0,j,s,t=0
for(;i<N;)P[i++]=+readline()
for(;i--;g[i]=s,n[i]=j%N)for(s=0,j=i;j<i+N&&s+P[j%N]<=L;)s+=P[j++%N]
for(i=0;C--;i=n[i])t+=g[i]
console.log(t)